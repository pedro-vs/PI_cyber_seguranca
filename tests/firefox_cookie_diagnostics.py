"""Integração local setup/session ou setup/third em perfil temporário. Nunca tira screenshots.

python3 tests/firefox_cookie_diagnostics.py --firefox /caminho/firefox --geckodriver /caminho/geckodriver
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
parser.add_argument('--repeats', type=int, default=3)
parser.add_argument('--scenario', choices=['session', 'third'], default='session')
parser.add_argument('--exercise-cleanup', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
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
with tempfile.TemporaryDirectory(prefix='privacy-lens-cookie-integration-') as temp:
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
            if args.exercise_cleanup:
                call(f'/session/{session}/window', {'handle':fixture_handle})
                for scenario in ['session', 'persistent', 'paths', 'third']:
                    call(f'/session/{session}/url', {'url':f'{top}/cookies/{scenario}'})
                    wait_until(lambda: execute('return document.getElementById("status")?.textContent === "PRONTO";'))
                # Variantes antigas na raiz, além dos paths/partição dos cenários.
                # Valores de fixture constantes, nunca retornados nem registrados.
                execute('document.cookie="pl3_session=fixture; Path=/; SameSite=Lax"; document.cookie="pl3_third=fixture; Path=/; SameSite=Lax";')
            for iteration in range(args.repeats):
                for scenario in ['setup', args.scenario]:
                    call(f'/session/{session}/window', {'handle':fixture_handle})
                    call(f'/session/{session}/url', {'url':f'{top}/cookies/{scenario}'})
                    wait_until(lambda: execute('return document.getElementById("status")?.textContent === "PRONTO";'))
                    time.sleep(2)
                    call(f'/session/{session}/window', {'handle':report_handle})
                    tabs = execute('return browser.tabs.query({}).then(ts=>ts.filter(t=>t.url?.startsWith(arguments[0])));', top)
                    assert len(tabs) == 1, 'Aba local ambígua'
                    tab_id = tabs[0]['id']
                    call(f'/session/{session}/url', {'url':f'moz-extension://{uuid}/popup/popup.html?tabId={tab_id}'})
                    wait_until(lambda: execute('return document.getElementById("export").disabled === false;'))
                    report = execute('return browser.runtime.sendMessage({type:"report",tabId:arguments[0],refresh:true});', tab_id)
                    assert not report.get('error'), 'Relatório indisponível'
                    reports.append({'iteration':iteration+1,'scenario':scenario,'preferences':prefs,'report':report})
                    assert report['extensionVersion'] == '0.3.0', 'Versão do relatório incorreta'
                    assert execute('return document.getElementById("extension-version").textContent;') == 'v0.3.0', 'Rodapé desatualizado'
                    c = report['cookies']
                    if scenario == 'setup':
                        assert c['totals']['total'] == 2, 'Limpeza incompleta: inventário setup diferente de 2'
                        assert sorted(item['name'] for item in c['items']) == ['pl3_change', 'pl3_existing'], 'Cookies residuais no setup'
                    else:
                        probe = next(p for p in c['diagnostics']['probes'] if p['name'] == f'pl3_{args.scenario}')
                        decisions = [d for e in probe['events'] for d in e['decisions'] if d['currentNavigation']]
                        print(json.dumps({'iteration':iteration+1,'scenario':scenario,'inventory':c['totals']['total'],
                            'preexisting':c['preexisting']['currentCount'],'writes':c['eventTotals']['writes'],
                            'status':probe['status'],'decisions':decisions}, ensure_ascii=False), flush=True)
                        assert c['totals']['total'] == 3, f'Inventário {scenario} diferente de 3; confira aceite/política no diagnóstico'
                        assert c['preexisting']['currentCount'] == 2, 'Baseline diferente de 2'
                        assert len(c['setCookieAttempts']) == 1, 'Tentativas diferentes de 1'
                        assert probe['status'] == 'associated', 'Evento não associado; consulte o diagnóstico exportado'
                        assert c['eventTotals']['observed'] == 1, 'Eventos diferentes de 1'
                        assert c['eventTotals']['writes'] == 1, 'Gravações diferentes de 1'
                        assert c['eventTotals']['created'] == 1, 'Criações inferidas diferentes de 1'
                        assert c['probable']['totals']['total'] == 1, 'Identidades prováveis diferentes de 1'
                        if scenario == 'third':
                            assert c['totals']['third'] == 1, 'Inventário terceiro diferente de 1'
                            assert c['probable']['totals']['third'] == 1, 'Prováveis terceiros diferentes de 1'
                            assert c['probable']['totals']['session'] == 1, 'Prováveis de sessão diferentes de 1'
                            assert c['probable']['items'][0]['partitionKey']['topLevelSite'] == 'http://localhost', 'Partição inesperada'
                            for event in probe['events']:
                                for decision in event['decisions']:
                                    if decision['currentNavigation'] and decision['status'] == 'associated':
                                        evidence = next(h for h in decision['hostEvidence'] if h['host'] == '127.0.0.1')
                                        assert evidence['at'] <= event['at'], 'Host futuro usado retroativamente'
            statuses = [next(p['status'] for p in r['report']['cookies']['diagnostics']['probes'] if p['name']==f'pl3_{args.scenario}')
                for r in reports if r['scenario']==args.scenario]
            print(f'Diagnóstico {args.scenario}:', ', '.join(statuses), flush=True)
        finally:
            if args.out and reports:
                Path(args.out).write_text(json.dumps(reports, ensure_ascii=False, indent=2))
            if session:
                try:
                    call(f'/session/{session}', method='DELETE')
                except Exception:
                    pass
            for process in (driver, fixture):
                process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
