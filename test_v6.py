import subprocess, time, os, json, re, pathlib
from playwright.sync_api import sync_playwright
root='/mnt/data/pitwall_v6_final'
p=subprocess.Popen(['python','-m','http.server','8983','--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(.5)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--allow-file-access-from-files'])
  ctx=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True,service_workers='block')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  source=pathlib.Path(root,'index.html').read_text()
  def in_css(m):
   fname=m.group(1).split('?')[0];return '<style>\n'+pathlib.Path(root,fname).read_text()+'\n</style>'
  def in_js(m):
   fname=m.group(1).split('?')[0];return '<script>\n'+pathlib.Path(root,fname).read_text()+'\n</script>'
  source=re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',in_css,source)
  source=re.sub(r'<script src="([^"]+)"></script>',in_js,source)
  page.set_content(source, wait_until='domcontentloaded',timeout=35000)
  page.wait_for_timeout(2500)
  for name,tab in [('home','home'),('calendar','calendar'),('standings','standings'),('career','career'),('settings','settings')]:
   page.locator(f'.bottomnav button[data-tab="{tab}"]').click()
   page.wait_for_timeout(350)
   print('TAB',tab, 'visible',page.locator('#app').inner_text()[:125].replace('\n',' '))
   if name in ['home','calendar','standings','career','settings']:
    page.screenshot(path=f'/mnt/data/PITWALL_V6_{name}.png',full_page=False)
   if tab=='calendar':
    btn=page.locator('.racecard button[data-race]').first
    if btn.count():
     btn.click();page.wait_for_timeout(180);print('CALENDAR EXPANDS',page.locator('.raceinner').count())
     page.screenshot(path='/mnt/data/PITWALL_V6_circuit.png',full_page=False)
   if tab=='standings':
    dr=page.locator('[data-v4-driver]').first
    if dr.count():
     dr.click();page.wait_for_timeout(150);print('DRIVER PROFILE',page.locator('.v4-profile-shade').count())
     page.screenshot(path='/mnt/data/PITWALL_V6_driver.png',full_page=False)
     page.locator('.v4-close').first.click()
  page.locator('.bottomnav button[data-tab="home"]').click()
  print('home hero',page.locator('.v6-race-hero').count(), 'ladder rows',page.locator('.v4-ladder-row').count())
  print('scroll', page.evaluate('''() => ({scrollHeight:document.documentElement.scrollHeight,innerHeight:innerHeight,bodyScroll:getComputedStyle(document.body).overflowY, navWidth:document.querySelector('.bottomnav').getBoundingClientRect().width})'''))
  print('ERRORS',errors[:10], 'count',len(errors))
  browser.close()
finally:
 p.terminate()
