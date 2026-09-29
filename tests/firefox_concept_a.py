"""Integração local de Conceito A em perfil temporário. Nunca tira screenshots.

python3 tests/firefox_concept_a.py --firefox /caminho/firefox --geckodriver /caminho/geckodriver
--out salva somente relatórios sanitizados da extensão (opcional); não é evidência manual.
"""
import argparse
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--firefox', required=True)
parser.add_argument('--geckodriver', required=True)
parser.add_argument('--out')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
extension_version = json.loads((root/'extension/manifest.json').read_text())['version']
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
session = None

def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]

fixture_port, driver_port = free_port(), free_port()
base = f'http://127.0.0.1:{driver_port}'
top = f'http://localhost:{fixture_port}'

def call(path, data=None, method=None):
    request = urllib.request.Request(base + path, json.dumps(data).encode() if data is not None else None,
        {'Content-Type': 'application/json'}, method=method or ('POST' if data is not None else 'GET'))
    try:
        return json.load(opener.open(request, timeout=30))['value']
    except urllib.error.HTTPError as error:
        # Não imprimir resposta bruta do driver nem argumentos de scripts.
        raise RuntimeError(f'WebDriver HTTP {error.code}: {path}') from None

def execute(script, *arguments):
    return call(f'/session/{session}/execute/sync', {'script':script, 'args':list(arguments)})

def wait_until(fn, timeout=20):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            result = fn()
            if result:
                return result
        except (urllib.error.URLError, RuntimeError):
            pass
        time.sleep(.1)
    raise RuntimeError('Timeout aguardando Firefox/fixture')

reports = []
with tempfile.TemporaryDirectory(prefix='privacy-lens-a-integration-') as temp:
    with open(Path(temp) / 'driver.log', 'w') as log:
        fixture = subprocess.Popen(['node', str(root/'tests/fixture/server.cjs')],
            env={**os.environ, 'FIXTURE_PORT':str(fixture_port)}, stdout=log, stderr=log)
        driver = subprocess.Popen([str(Path(args.geckodriver).resolve()), '--host', '127.0.0.1', '--port', str(driver_port),
            '--allow-system-access', '--log', 'warn'], stdout=log, stderr=log)
        try:
            wait_until(lambda: call('/status').get('ready'))
            result = call('/session', {'capabilities':{'alwaysMatch':{'browserName':'firefox', 'moz:firefoxOptions':{
                'binary':str(Path(args.firefox).resolve()), 'args':['-headless'],
                'prefs':{'network.proxy.type':0, 'browser.shell.checkDefaultBrowser':False}}}}})
            session = result['sessionId']
            print('Firefox', result['capabilities']['browserVersion'], flush=True)
            addon = Path(temp)/'privacy-lens.xpi'
            with zipfile.ZipFile(addon, 'w', zipfile.ZIP_DEFLATED) as archive:
                for file in (root/'extension').rglob('*'):
                    if file.is_file():
                        archive.write(file, file.relative_to(root/'extension'))
            installed = call(f'/session/{session}/moz/addon/install', {'path':str(addon), 'temporary':True})
            call(f'/session/{session}/moz/context', {'context':'chrome'})
            uuid = execute('return JSON.parse(Services.prefs.getStringPref("extensions.webextensions.uuids"))[arguments[0]];', installed)
            prefs = execute('return {cookieBehavior:Services.prefs.getIntPref("network.cookie.cookieBehavior"), resistFingerprinting:Services.prefs.getBoolPref("privacy.resistFingerprinting"), reduceTimerPrecision:Services.prefs.getBoolPref("privacy.reduceTimerPrecision")};')
            call(f'/session/{session}/moz/context', {'context':'content'})
            fixture_handle = call(f'/session/{session}/window')
            report_handle = call(f'/session/{session}/window/new', {'type':'tab'})['handle']
            call(f'/session/{session}/window', {'handle':report_handle})
            call(f'/session/{session}/url', {'url':f'moz-extension://{uuid}/popup/popup.html'})
            def report_for_fixture():
                call(f'/session/{session}/window', {'handle':report_handle})
                tabs = execute('return browser.tabs.query({}).then(ts=>ts.filter(t=>t.url?.startsWith(arguments[0])));', top)
                assert len(tabs) == 1, 'Aba local ambígua'
                tab_id = tabs[0]['id']
                call(f'/session/{session}/url', {'url':f'moz-extension://{uuid}/popup/popup.html?tabId={tab_id}'})
                wait_until(lambda: execute('return !document.getElementById("export").disabled;'))
                report = execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});', tab_id)
                assert not report.get('error'), 'Relatório indisponível'
                assert report['extensionVersion'] == extension_version
                assert execute('return document.getElementById("error").hidden;'), 'UI interrompida'
                assert execute('return document.getElementById("score-value").textContent;') != 'Indisponível'
                return report

            def navigate(path):
                call(f'/session/{session}/window', {'handle':fixture_handle})
                call(f'/session/{session}/url', {'url':top+path})
                wait_until(lambda: execute('return document.getElementById("status")?.textContent.startsWith("PRONTO");'))

            for scenario in ['negative', 'polling', 'hook', 'websocket']:
                navigate('/security/'+scenario)
                if scenario == 'negative':
                    time.sleep(31)  # fecha janela; verifica score e cobertura reais
                report = report_for_fixture()
                security = report['security']
                assert security['availability'] == 'available', security
                assert len(security['frames']) == 1, security
                assert len(security['frames'][0]['observation']['ownInstrumentation']) == 11, security
                assert not security['frames'][0]['observation']['failed'], security
                assert not security['frames'][0]['observation']['unsupported'], security
                h = next(c for c in report['score']['categories'] if c['id'] == 'H')
                if scenario == 'hook':
                    assert any(c['api']=='Window.fetch' for c in security['changes']), security
                    assert len(security['combinations']) == 1, security
                    assert h['points'] == 20, h
                else:
                    assert not security['changes'], security
                    assert not security['combinations'], security
                    assert h['points'] == 0, h
                if scenario == 'negative':
                    assert report['score']['status'] == 'observed', report['score']
                    assert report['score']['value'] == 100, report['score']
                if scenario == 'polling':
                    assert len(security['channels']) == 1, security
                if scenario == 'websocket':
                    assert security['channels'][0]['kind'] == 'websocket-attempt', security
                reports.append({'scenario':scenario,'report':report})
                print(json.dumps({'scenario':scenario,'changes':len(security['changes']),
                    'channels':len(security['channels']),'combinations':len(security['combinations']),
                    'score':report['score']['status'],'H':h['points']}), flush=True)

            # A interface real adiciona, pausa, reativa e remove; cada decisão é verificada na rede.
            for operation, expected_block in [('empty',False), ('add',True), ('pause',False), ('enable',True), ('remove',False)]:
                call(f'/session/{session}/window', {'handle':report_handle})
                if operation == 'add':
                    execute('document.getElementById("blocklist-host").value="127.0.0.1";document.getElementById("blocklist-form").requestSubmit();')
                elif operation in ['pause','enable']:
                    execute('document.getElementById("blocklist-toggle").click();')
                elif operation == 'remove':
                    execute('document.querySelector("#blocklist-rules button").click();')
                if operation != 'empty':
                    wait_until(lambda: execute('return !document.getElementById("blocklist-add").disabled;'))
                    assert execute('return document.getElementById("blocklist-error").textContent;') == ''
                navigate('/security/blocklist')
                loaded = execute('return document.getElementById("third-pixel").naturalWidth > 0;')
                assert loaded != expected_block, (operation, loaded)
                report = report_for_fixture()
                decisions = report['blocklist']['decisions']
                assert bool(decisions) == expected_block, (operation, decisions)
                if expected_block:
                    request = next(r for r in report['network']['requests'] if r['id']==decisions[0]['requestId'])
                    assert request['blockedBy']=='privacy-lens-custom-list', request
                    assert request['status']=='error', request
                reports.append({'scenario':'blocklist-'+operation,'report':report})
                print(json.dumps({'scenario':'blocklist-'+operation,'loaded':loaded,'decisions':len(decisions)}),flush=True)
            summary={'status':'passed','browserVersion':result['capabilities']['browserVersion'],
                'extensionVersion':extension_version,'mode':'headless; perfil temporário; fixture local; sem screenshots',
                'ddgJsLeaks':'não executado; roteiro manual separado','cases':reports}
            if args.out:
                out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
                (out/'conceito-a.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False))
            print('Conceito A: controles locais e blocklist na UI real passaram.',flush=True)
        finally:
            if session:
                try:call(f'/session/{session}',method='DELETE')
                except Exception:pass
            driver.terminate();fixture.terminate()
            driver.wait(timeout=10);fixture.wait(timeout=10)
