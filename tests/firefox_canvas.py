"""Canvas: integração em Firefox real, sem resultados DDG. Python stdlib + Firefox + geckodriver + Node.

Uso: python3 tests/firefox_canvas.py --firefox /caminho/firefox --geckodriver /caminho/geckodriver
Cria um perfil temporário, instala a extensão, executa somente a fixture local.
"""
import argparse
import base64
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import urllib.request
import urllib.error
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--firefox', required=True)
parser.add_argument('--geckodriver', required=True)
parser.add_argument('--out', default='evidencias/desenvolvimento/etapa-2-canvas/automatizado')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
out = root / args.out
out.mkdir(parents=True, exist_ok=True)
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
base = 'http://127.0.0.1:4444'
session = None

def call(path, data=None, method=None):
    request = urllib.request.Request(base + path,
        json.dumps(data).encode() if data is not None else None,
        {'Content-Type': 'application/json'}, method=method or ('POST' if data is not None else 'GET'))
    try:
        return json.load(opener.open(request, timeout=45))['value']
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from error

def execute(script, *arguments):
    return call(f'/session/{session}/execute/sync', {'script': script, 'args': list(arguments)})

def wait_until(fn, timeout=15):
    deadline = time.monotonic() + timeout
    last = None
    while time.monotonic() < deadline:
        try:
            value = fn()
            if value:
                return value
        except Exception as error:
            last = error
        time.sleep(.25)
    raise RuntimeError(f'Timeout: {last}')

def context(value):
    call(f'/session/{session}/moz/context', {'context': value})

with tempfile.TemporaryDirectory(prefix='privacy-lens-test-') as temp:
    with open(Path(temp) / 'driver.log', 'w') as log:
        fixture = subprocess.Popen(['node', str(root / 'tests/fixture/server.cjs')], stdout=log, stderr=log)
        driver = subprocess.Popen([str(Path(args.geckodriver).resolve()), '--host', '127.0.0.1', '--port', '4444',
                                   '--allow-system-access', '--log', 'warn'], stdout=log, stderr=log)
        try:
            wait_until(lambda: call('/status').get('ready'))
            result = call('/session', {'capabilities': {'alwaysMatch': {
                'browserName': 'firefox', 'moz:firefoxOptions': {
                    'binary': str(Path(args.firefox).resolve()), 'args': ['-headless'],
                    'prefs': {'network.proxy.type': 0, 'browser.shell.checkDefaultBrowser': False}
                }}}})
            session = result['sessionId']
            print('Firefox', result['capabilities']['browserVersion'], flush=True)
            call(f'/session/{session}/window/rect', {'width': 1000, 'height': 1100})
            native = {}
            for scenario in ['positive','errors']:
                call(f'/session/{session}/url', {'url':f'http://localhost:8787/canvas/{scenario}'})
                wait_until(lambda:execute('return document.getElementById("status")?.textContent === "PRONTO"'))
                native[scenario] = execute('return window.fixtureResult;')
            signature = execute('return [HTMLCanvasElement.prototype.toDataURL,HTMLCanvasElement.prototype.toBlob,CanvasRenderingContext2D.prototype.getImageData].map(f=>({name:f.name,length:f.length}));')
            addon = Path(temp)/'privacy-lens.xpi'
            with zipfile.ZipFile(addon,'w',zipfile.ZIP_DEFLATED) as archive:
                for file in (root/'extension').rglob('*'):
                    if file.is_file():archive.write(file,file.relative_to(root/'extension'))
            installed=call(f'/session/{session}/moz/addon/install',{'path':str(addon),'temporary':True})
            assert installed=='privacy-lens@projeto.insper'
            context('chrome')
            uuid=execute('return JSON.parse(Services.prefs.getStringPref("extensions.webextensions.uuids"))[arguments[0]];',installed)
            context('content')
            fixture_handle=call(f'/session/{session}/window')
            report_handle=call(f'/session/{session}/window/new',{'type':'tab'})['handle']
            call(f'/session/{session}/window',{'handle':report_handle})
            call(f'/session/{session}/url',{'url':f'moz-extension://{uuid}/popup/popup.html'})
            cases = {}
            specs={'negative':('draw-only',2,0,0,0),'positive':('indicator',2,3,0,1),
                   'read-only':('readback-only',0,1,0,0),'errors':('readback-only',2,1,1,0),
                   'frame':('indicator',2,3,0,1)}
            for scenario,expected in specs.items():
                call(f'/session/{session}/window',{'handle':fixture_handle})
                call(f'/session/{session}/url',{'url':f'http://localhost:8787/canvas/{scenario}'})
                wait_until(lambda:execute('return document.getElementById("status")?.textContent === "PRONTO"'))
                actual=execute('return window.fixtureResult;')
                if scenario in native: assert actual==native[scenario], (scenario,actual,native[scenario])
                current_signature=execute('return [HTMLCanvasElement.prototype.toDataURL,HTMLCanvasElement.prototype.toBlob,CanvasRenderingContext2D.prototype.getImageData].map(f=>({name:f.name,length:f.length}));')
                assert current_signature==signature,(signature,current_signature)
                (out/f'{scenario}-pagina.png').write_bytes(base64.b64decode(call(f'/session/{session}/screenshot')))
                call(f'/session/{session}/window',{'handle':report_handle})
                tabs=execute('return browser.tabs.query({}).then(t=>t.filter(x=>x.url?.startsWith("http://localhost:8787/")));')
                assert len(tabs)==1,tabs
                tab_id=tabs[0]['id']
                call(f'/session/{session}/url',{'url':f'moz-extension://{uuid}/popup/popup.html?tabId={tab_id}'})
                wait_until(lambda:execute('return document.getElementById("export").disabled === false'))
                report=execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});',tab_id)
                (out/f'{scenario}-relatorio.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
                canvas=report['canvas']
                observed=(canvas['classification'],canvas['drawingCalls'],canvas['readbackCalls'],canvas['failedReadbacks'],canvas['indicatorCanvases'])
                assert observed==expected,(scenario,observed,expected,canvas)
                assert not canvas['partial'],canvas
                assert all(len(f['instrumentation']['installed'])==11 for f in canvas['frames']),canvas
                if scenario=='frame':
                    assert len(canvas['frames'])==2,canvas
                    assert next(f for f in canvas['frames'] if f['frameId']==0)['observation']['indicatorCanvases']==0
                    assert next(f for f in canvas['frames'] if f['frameId']!=0)['origin']=='http://127.0.0.1:8787'
                else: assert len(canvas['frames'])==1,canvas
                execute('document.getElementById("canvas-details").open=true;')
                (out/f'{scenario}-plugin.png').write_bytes(base64.b64decode(call(f'/session/{session}/screenshot')))
                cases[scenario]={'status':'passed','observed':observed,'report':f'{scenario}-relatorio.json','screenshot':f'{scenario}-plugin.png'}
                print(scenario,observed,flush=True)
            # Colisão: restauração de método pela própria página indica perda de cobertura,
            # sem alegar detecção de hook malicioso.
            call(f'/session/{session}/window',{'handle':fixture_handle})
            execute('HTMLCanvasElement.prototype.toDataURL = function toDataURL(){return "replaced";};')
            call(f'/session/{session}/window',{'handle':report_handle})
            partial=execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});',tab_id)
            assert partial['canvas']['partial'] is True
            assert 'HTMLCanvasElement.toDataURL' in next(f for f in partial['canvas']['frames'] if f['frameId']==0)['instrumentation']['replaced']
            summary={'status':'passed','browserVersion':result['capabilities']['browserVersion'],
                'collectedAt':report['generatedAt'],'extensionVersion':report['extensionVersion'],
                'mode':'headless; perfil temporário; fixture local com CSP; relatório real aberto em aba',
                'containerSandboxOverrides':{key:os.environ[key] for key in ['MOZ_DISABLE_CONTENT_SANDBOX','MOZ_DISABLE_RDD_SANDBOX','MOZ_DISABLE_GMP_SANDBOX'] if key in os.environ},
                'cases':cases,'nativeComparison':'PNG dataURL, ImageData/pixel, Blob/tipo/tamanho e IndexSizeError iguais com/sem extensão',
                'functionSignatures':'name/length preservados nas três APIs de leitura',
                'coverageReplacement':'substituição de método sinalizada como cobertura parcial',
                'ddg':'não executado','manualMacOS':'pendente de validação do aluno'}
            (out/'resumo.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False))
            print('Canvas no JavaScript real da página: OK; DDG não executado.',flush=True)
        except Exception:
            log.flush()
            print((Path(temp)/'driver.log').read_text()[-5000:])
            raise
        finally:
            if session:
                try:call(f'/session/{session}',method='DELETE')
                except Exception:pass
            driver.terminate();fixture.terminate()
            driver.wait(timeout=10);fixture.wait(timeout=10)
