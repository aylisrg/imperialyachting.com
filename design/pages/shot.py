from playwright.sync_api import sync_playwright
import os
with sync_playwright() as s:
  b=s.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox","--autoplay-policy=no-user-gesture-required"])
  for pgn in ['services','fleet','fleet-vd-40']:
    for tag,w,h,m in [('desktop-1440',1440,900,False),('mobile-390',390,844,True)]:
      p=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1 if not m else 2,is_mobile=m)
      p.goto('file://'+os.path.abspath(pgn+'/index.html'));p.wait_for_timeout(4000)
      p.screenshot(path=f'{pgn}/{tag}-fold.png');p.evaluate("document.querySelectorAll('video').forEach(v=>{const i=new Image();i.src=v.poster;i.className='ph';i.style.cssText=getComputedStyle(v).position=='absolute'?'position:absolute;inset:0':'';v.replaceWith(i)})");p.wait_for_function("[...document.images].every(i=>i.complete&&i.naturalWidth)");p.evaluate('document.querySelector(".wa").style.opacity=1');p.wait_for_timeout(800);p.screenshot(path=f'{pgn}/{tag}-full.png',full_page=True)
      p.close()
  b.close()
