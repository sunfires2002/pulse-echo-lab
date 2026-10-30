/* Run against tools/prepare-pages.py output, never against production. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const base=process.env.LAB_TEST_URL||'http://127.0.0.1:8011/';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('LAB tests only run against localhost');
const out=process.env.LAB_EVIDENCE_DIR||path.join(process.cwd(),'lab-test-results');
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const results=[];
 try{
 for(const viewport of [{width:1280,height:720},{width:2500,height:928}].filter(v=>!process.env.LAB_VIEWPORT_ONLY||v.width===Number(process.env.LAB_VIEWPORT_ONLY))){console.log('Checking viewport',viewport);
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const productionRequests=[],productionSockets=[],errors=[];
  context.on('request',r=>{if(/supabase\.(co|com)/i.test(new URL(r.url()).hostname))productionRequests.push(r.url())});
  const legacy={version:1,panels:{map:{left:360,top:550,width:880,height:150,visible:true,transparency:78}},docked:false};
  const menu={version:1,left:8,top:8};
  await context.addInitScript(({legacy,menu})=>{
   // Seed only a new test browser, never the user's storage.
   if(!localStorage.getItem('test-seeded')){
    localStorage.setItem('pulse_echo_pc_lab_layout_v1',JSON.stringify(legacy));
    localStorage.setItem('pulse_echo_pc_menu_v1',JSON.stringify(menu));
    localStorage.setItem('pulse_echo_user_name','PRODUCTION NAME');
    localStorage.setItem('pulse_echo_workflow_v3','{"matches":[]}');
    localStorage.setItem('test-seeded','1');
   }
  },{legacy,menu});
  const page=await context.newPage();context.on('page',p=>p.on('websocket',w=>{if(/supabase/i.test(w.url()))productionSockets.push(w.url())}));page.on('websocket',w=>{if(/supabase/i.test(w.url()))productionSockets.push(w.url())});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('.match-card').first().waitFor();
  assert.equal(await page.locator('.match-card').count(),2);
  await page.locator('.match-card').first().click();
  await page.waitForFunction(()=>window.PULSE_PC_READY&&typeof chart!=='undefined'&&chart?.scales.x.type==='linear');
  const skip=page.getByRole('button',{name:'スキップ',exact:true});if(await skip.isVisible())await skip.click();
  await page.waitForFunction(()=>typeof player!=='undefined'&&playerReady&&player?.getDuration?.()>0,null,{timeout:30000});
  assert.equal(new URL(page.url()).searchParams.get('mode'),'lab');
  const state=await page.evaluate(()=>({supa,config:PULSE_CONFIG,legacy:localStorage.getItem('pulse_echo_pc_lab_layout_v1'),lab:PULSE_LAB_STORAGE.getItem('pulse_echo_pc_lab_layout_v1'),oldName:localStorage.getItem('pulse_echo_user_name'),name:PULSE_PROFILE.getName(),count:events.length,icons:document.querySelectorAll('.lab-feature-icon').length,goal:!!document.querySelector('#labMatchLog'),duration:player.getDuration()}));
  assert.equal(state.supa,null);assert.equal(state.config.supabaseUrl,'');assert.equal(state.legacy,JSON.stringify(legacy));assert.equal(state.lab,JSON.stringify(legacy));assert.equal(state.oldName,'PRODUCTION NAME');assert.notEqual(state.name,'PRODUCTION NAME');assert.equal(state.count,36);assert.equal(state.icons,5);assert.ok(state.goal);assert.equal(await page.locator('.lab-goal-row').count(),0);assert.equal(await page.locator('#labMatchLog').getAttribute('data-mock-only'),'true');assert.ok(await page.locator('#laboEnvironment').isVisible());assert.ok((await page.title()).includes('PULSE ECHO LABO'));
  // Actual playback, then coordinate-based click and drag, on the real player.
  await page.locator('#labPulsePlay').click();
  await page.waitForFunction(()=>player.getPlayerState()===1&&player.getCurrentTime()>0);
  await page.evaluate(()=>player.pauseVideo());
  const target=await page.evaluate(()=>{const x=chart.scales.x.getPixelForValue(83),r=document.querySelector('#chart').getBoundingClientRect();return{x:r.left+x*r.width/chart.width,y:r.top+(chart.chartArea.top+chart.chartArea.bottom)/2*r.height/chart.height}});
  await page.mouse.click(target.x,target.y);
  await page.waitForFunction(()=>Math.abs(player.getCurrentTime()-83)<3);
  const axis=await page.evaluate(()=>({min:chart.scales.x.min,max:chart.scales.x.max,duration:player.getDuration(),first:chart.data.datasets[0].data[0].x}));
  assert.equal(axis.min,0);assert.equal(axis.max,axis.duration);assert.equal(axis.first,30);
  await page.waitForTimeout(600);
  const knob=page.locator('.lab-playhead-knob');const k=await knob.boundingBox();assert.ok(k);
  const dragTo=await page.evaluate(()=>{const r=document.querySelector('#chart').getBoundingClientRect();return r.left+chart.scales.x.getPixelForValue(147)*r.width/chart.width});
  await page.mouse.move(k.x+k.width/2,k.y+k.height/2);await page.mouse.down();await page.mouse.move(dragTo,k.y+k.height/2,{steps:8});await page.mouse.up();
  await page.waitForFunction(()=>Math.abs(player.getCurrentTime()-147)<3);
  // Move and resize a real panel; reload restores the LAB-specific copy.
  const grip=page.locator('#labPosting .lab-panel-grip');const gr=await grip.boundingBox();const before=await page.locator('#labPosting').boundingBox();
  await page.mouse.move(gr.x+gr.width/2,gr.y+gr.height/2);await page.mouse.down();await page.mouse.move(gr.x+gr.width/2+25,gr.y+gr.height/2+18,{steps:5});await page.mouse.up();
  const after=await page.locator('#labPosting').boundingBox();assert.ok(after.x>before.x);
  const corner=await page.locator('#labPosting .lab-panel-resize').boundingBox();await page.mouse.move(corner.x+corner.width/2,corner.y+corner.height/2);await page.mouse.down();await page.mouse.move(corner.x+corner.width/2+28,corner.y+corner.height/2+16,{steps:5});await page.mouse.up();
  const sized=await page.locator('#labPosting').boundingBox();assert.ok(sized.width>after.width);
  // Genuine local posting and deletion must never cause a Supabase request.
  await page.locator('#commentText').fill('LAB isolated test');await page.locator('#commentBtn').click();
  await page.waitForFunction(()=>events.some(e=>e.comment==='LAB isolated test'));
  page.once('dialog',d=>d.accept());await page.evaluate(()=>deleteEvent(events.find(e=>e.comment==='LAB isolated test').id));
  assert.equal(await page.evaluate(()=>events.length),36);
  assert.equal(await page.evaluate(()=>localStorage.getItem('pulse_echo_pc_lab_layout_v1')),JSON.stringify(legacy));
  await page.locator('#labMenuToggle').click();
  // Real drag-to-dock, persistence and separation, without resetting existing settings.
  await page.locator('#labMenuToggle').click();
  await page.locator('#labControls').waitFor({state:'hidden'});await page.waitForTimeout(500);
  const map=await page.locator('#tvMapDock').boundingBox(),bar=await page.locator('#labReactions .lab-panel-grip').boundingBox();
  // A migrated layout can overlap; grab the exposed right edge of the full heading.
  await page.mouse.move(bar.x+bar.width-20,bar.y+15);await page.mouse.down();await page.mouse.move(map.x+150,map.y+map.height-2,{steps:12});
  const candidate=await page.locator('#tvMapDock').evaluate(e=>e.classList.contains('lab-dock-candidate'));
  if(!candidate)console.log('Dock diagnostic',await page.evaluate(()=>({body:document.body.className,map:document.getElementById('tvMapDock').getBoundingClientRect().toJSON(),bar:document.getElementById('labReactions').getBoundingClientRect().toJSON(),stored:PULSE_LAB_STORAGE.getItem('pulse_echo_pc_lab_layout_v1')})),{map,bar});
  assert.ok(candidate);await page.mouse.up();
  assert.ok(await page.locator('#labUndock').isVisible());await page.reload();await page.waitForFunction(()=>window.PULSE_PC_READY);
  assert.ok(await page.locator('#labUndock').isVisible());await page.locator('#labUndock').click();
  assert.equal(await page.evaluate(()=>JSON.parse(PULSE_LAB_STORAGE.getItem('pulse_echo_pc_lab_layout_v1')).docked),false);
  await page.locator('#labMenuToggle').click();
  // Export and import the file through the UI. Invalid input must not alter storage.
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'配置を書き出す',exact:true}).click();const download=await downloadPromise;const backupFile=path.join(out,`layouts-${viewport.width}.json`);await download.saveAs(backupFile);
  const backup=JSON.parse(await fs.readFile(backupFile,'utf8'));assert.equal(backup.format,'pulse-echo-lab-layouts');
  const invalid=await page.evaluate(()=>{const before=PULSE_LAB_STORAGE.getItem('pulse_echo_pc_lab_layout_v1');try{PULSE_LAB_STORAGE.importLayouts({wrong:{version:1}})}catch{}return before===PULSE_LAB_STORAGE.getItem('pulse_echo_pc_lab_layout_v1')});assert.ok(invalid);
  await page.getByLabel('配置JSONを読み込む').setInputFiles(backupFile);await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),page.getByRole('button',{name:'再読み込みして反映',exact:true}).click()]);await page.waitForFunction(()=>window.PULSE_PC_READY);
  const restored=await page.locator('#labPosting').boundingBox();assert.ok(Math.abs(restored.width-sized.width)<2);assert.ok(Math.abs(restored.x-sized.x)<2);
  await page.locator('#labMenuToggle').click();await page.getByRole('button',{name:'端末プレビューを開く',exact:true}).click();
  const frame=page.frameLocator('#pcDevicePreview iframe');await frame.locator('#commentText').waitFor();
  assert.equal(await frame.locator('body').evaluate(()=>window.PULSE_PC_DESKTOP),false);
  assert.equal(await frame.locator('body').evaluate(()=>supa),null);
  await page.screenshot({path:path.join(out,`preview-${viewport.width}.png`)});
  await page.getByRole('button',{name:'閉じる',exact:true}).click();await page.locator('#labMenuToggle').click();
  await page.screenshot({path:path.join(out,`lab-${viewport.width}.png`)});
  // Battle review uses the unchanged tactical drawing and local event handlers.
  await page.waitForFunction(()=>typeof player!=='undefined'&&playerReady&&player?.getDuration?.()>0);
  await page.locator('#tacticToggle').click();await page.locator('#tacticalLayer').waitFor({state:'visible'});
  assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('tactics-open')));
  assert.ok(await page.locator('.t-piece').count()>0);await page.locator('#labTacticsExit').click();
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('tactics-open')),false);
  // A different sample match keeps LAB mode, map, icons, local-only data and playback controls.
  await page.goto(base);await page.locator('.match-card').nth(1).waitFor();await page.locator('.match-card').nth(1).click();
  await page.waitForFunction(()=>window.PULSE_PC_READY&&document.body.classList.contains('lab-mode'));
  assert.equal(await page.locator('.lab-feature-icon').count(),5);assert.equal(await page.locator('.lab-goal-row').count(),0);
  // GOALs are opt-in: this synthetic fixture is scoped to lab-sample-b only.
  await page.locator('#labMenuToggle').click();await page.locator('#labGoalTools summary').click();await page.locator('#labGoalSample').click();
  try{await page.waitForFunction(()=>PULSE_LAB_GOALS.current().goals.length===4&&document.querySelectorAll('.lab-goal-row').length===4,null,{timeout:45000})}catch(error){console.log('GOAL sample diagnostic',await page.evaluate(()=>({context:PULSE_LAB_TIMELINE.context(),status:document.getElementById('labGoalStatus').textContent,record:PULSE_LAB_GOALS.current().record,ready:playerReady,video:player?.getVideoData?.(),duration:player?.getDuration?.()})));throw error};assert.equal(await page.locator('.lab-goal-row').count(),4);await page.locator('#labMenuToggle').click();
  assert.equal(await page.evaluate(()=>supa),null);assert.equal(new URL(page.url()).searchParams.get('mode'),'lab');
  // TV round trip stays entirely in the standalone LAB site.
  await page.evaluate(()=>PULSE_VIEW.setMode(true,'tv'));await page.locator('#tvHome').click();await page.waitForURL(u=>u.searchParams.get('mode')==='tv'&&u.pathname===new URL(base).pathname);await page.locator('.match-card').nth(1).click();await page.waitForFunction(()=>document.body.classList.contains('tv-mode'));
  assert.equal(new URL(page.url()).searchParams.get('mode'),'tv');assert.equal(await page.locator('#scoreboard .bigscore').count(),0);
  assert.deepEqual(productionRequests,[]);assert.deepEqual(productionSockets,[]);assert.deepEqual(errors,[]);
  results.push({viewport,state,axis,playback:true,click83:true,drag147:true,moveResizeRestore:true,layoutFileRoundTrip:true,preview:true,localPostDelete:true,dockingRestoreSplit:true,tactics:true,sampleMatchSwitch:true,tvRoundTrip:true,supabaseRequests:productionRequests.length,supabaseSockets:productionSockets.length,errors});
  await context.close();
 }
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
