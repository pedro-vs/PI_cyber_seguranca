"""Teste opcional em Firefox real. Python stdlib + Firefox + geckodriver + Node.

Uso: python3 tests/firefox_smoke.py --firefox /caminho/firefox --geckodriver /caminho/geckodriver
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
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
out = root / 'evidencias/local'
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
            addon = Path(temp) / 'privacy-lens.xpi'
            with zipfile.ZipFile(addon, 'w', zipfile.ZIP_DEFLATED) as archive:
                for file in (root / 'extension').rglob('*'):
                    if file.is_file(): archive.write(file, file.relative_to(root / 'extension'))
            installed = call(f'/session/{session}/moz/addon/install', {'path': str(addon), 'temporary': True})
            assert installed == 'privacy-lens@projeto.insper', installed
            context('chrome')
            uuid = execute('return JSON.parse(Services.prefs.getStringPref("extensions.webextensions.uuids"))[arguments[0]];', installed)
            context('content')
            call(f'/session/{session}/url', {'url': 'http://localhost:8787/'})
            wait_until(lambda: execute('return document.getElementById("status")?.textContent.startsWith("PRONTO")'))
            fixture_handle = call(f'/session/{session}/window')
            (out / 'fixture.png').write_bytes(base64.b64decode(call(f'/session/{session}/screenshot')))
            handle = call(f'/session/{session}/window/new', {'type': 'tab'})['handle']
            call(f'/session/{session}/window', {'handle': handle})
            call(f'/session/{session}/url', {'url': f'moz-extension://{uuid}/popup/popup.html'})
            # Execute dentro da página da própria extensão para pedir seu relatório real.
            tabs = execute('return browser.tabs.query({}).then(tabs => tabs.filter(t => t.url?.startsWith("http://localhost:8787/")));')
            assert len(tabs) == 1, tabs
            tab_id = tabs[0]['id']
            call(f'/session/{session}/url', {'url': f'moz-extension://{uuid}/popup/popup.html?tabId={tab_id}'})
            wait_until(lambda: execute('return document.getElementById("export").disabled === false'))
            report = execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});', tab_id)
            assert not report.get('error'), report
            (out / 'firefox-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
            assert report['cookies']['totals'] == {'total':5,'first':5,'third':0,'session':3,'persistent':2,'partitioned':0}, report['cookies']['totals']
            assert len(report['cookies']['setCookieAttempts']) == 3
            assert any(c['httpOnly'] for c in report['cookies']['items'])
            domains = {d['host']: d for d in report['network']['domains']}
            assert domains['localhost']['party'] == 'first'
            assert domains['127.0.0.1']['party'] == 'third'
            assert domains['127.0.0.1']['requests'] >= 3
            main = next(f for f in report['storage'] if f['frameId'] == 0)
            assert main['localStorage']['count'] == 2, main
            assert main['sessionStorage']['count'] == 1, main
            assert main['indexedDB']['count'] == 1, main
            assert len(report['storage']) == 2, report['storage']
            assert report['score']['value'] is None
            assert not report['coverage']['partial']
            execute('document.querySelector("details").open = true;')
            (out / 'relatorio-firefox-topo.png').write_bytes(base64.b64decode(call(f'/session/{session}/screenshot')))
            execute('window.scrollTo(0,document.body.scrollHeight);')
            (out / 'relatorio-firefox-storage.png').write_bytes(base64.b64decode(call(f'/session/{session}/screenshot')))
            print('Fixture, rede, cookies (incluindo HttpOnly), storage e relatório: OK', flush=True)
            # Nova navegação deve zerar registros, mesmo mantendo cookies preexistentes.
            call(f'/session/{session}/window', {'handle': fixture_handle})
            call(f'/session/{session}/url', {'url': 'http://localhost:8787/empty'})
            call(f'/session/{session}/window', {'handle': handle})
            empty = execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});', tab_id)
            assert empty['network']['totals']['third'] == 0
            assert len(empty['cookies']['setCookieAttempts']) == 0
            assert len(empty['cookies']['correlatedWrites']) == 0
            assert empty['cookies']['totals']['total'] == 5
            assert all(f['origin'] == 'http://localhost:8787' for f in empty['storage'])
            # Redirecionamento preserva hops, com navegação nova e independente.
            call(f'/session/{session}/window', {'handle': fixture_handle})
            call(f'/session/{session}/url', {'url': 'http://localhost:8787/redirect'})
            wait_until(lambda: execute('return document.getElementById("status")?.textContent.startsWith("PRONTO")'))
            call(f'/session/{session}/window', {'handle': handle})
            redirected = execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});', tab_id)
            mains = [r for r in redirected['network']['requests'] if r['type'] == 'main_frame']
            assert len(mains) == 2, mains
            assert mains[0]['status'] == 'redirect', mains
            assert redirected['page']['url'] == 'http://localhost:8787/'
            # Abas simultâneas não devem misturar rede e cookies de primeira parte.
            other_handle = call(f'/session/{session}/window/new', {'type': 'tab'})['handle']
            call(f'/session/{session}/window', {'handle': other_handle})
            call(f'/session/{session}/url', {'url': 'http://127.0.0.1:8787/empty'})
            call(f'/session/{session}/window', {'handle': handle})
            other_tabs = execute('return browser.tabs.query({}).then(tabs => tabs.filter(t => t.url === "http://127.0.0.1:8787/empty"));')
            other = execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});', other_tabs[0]['id'])
            assert other['network']['totals']['third'] == 0
            assert other['cookies']['totals']['total'] == 0
            assert redirected['network']['totals']['third'] >= 3
            summary = {'status':'passed', 'browserVersion':result['capabilities']['browserVersion'],
                'collectedAt':report['generatedAt'],
                'containerSandboxOverrides':{key:os.environ[key] for key in
                    ['MOZ_DISABLE_CONTENT_SANDBOX','MOZ_DISABLE_RDD_SANDBOX','MOZ_DISABLE_GMP_SANDBOX'] if key in os.environ},
                'mode':'headless; perfil temporário; extensão temporária via WebDriver; fixture local',
                'checks':['instalação','rede primeira/terceira parte','5 cookies, sessão/persistentes, HttpOnly',
                    '3 tentativas Set-Cookie','localStorage/sessionStorage/IndexedDB em 2 frames',
                    'interface e screenshots','reset de navegação sem apagar inventário','redirect HTTP','isolamento entre abas'],
                'ddg':'não executado', 'sitesReais':'não executado'}
            (out / 'firefox-smoke.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False))
            print(json.dumps(summary, ensure_ascii=False), flush=True)
        except Exception:
            log.flush()
            print((Path(temp) / 'driver.log').read_text()[-5000:])
            raise
        finally:
            if session:
                try: call(f'/session/{session}', method='DELETE')
                except Exception: pass
            driver.terminate(); fixture.terminate()
            driver.wait(timeout=10); fixture.wait(timeout=10)
