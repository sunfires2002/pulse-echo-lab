/* Standalone LAB only. Imported JSON stays in memory and never leaves the page. */
(() => {
 if(!window.PULSE_CONFIG?.lab||!window.PULSE_CONFIG?.localOnly||!window.PULSE_LAB_TIMELINE)return;
 const timeline=window.PULSE_LAB_TIMELINE,store=PULSE_PRISM_GOALS.createStore();
 const dock=document.getElementById('tvMapDock'),menu=document.getElementById('labControls');
 const area=document.createElement('section');area.id='labGoalArea';area.setAttribute('aria-label','GOALレーンと詳細');
 const layer=document.createElement('div');layer.id='labGoalFlags';layer.setAttribute('aria-label','GOALフラグ');area.append(layer);
 const guide=document.createElement('div');guide.id='labGoalGuide';guide.hidden=true;guide.setAttribute('aria-hidden','true');dock.append(guide);
 const detail=document.createElement('div');detail.id='labGoalDetail';detail.setAttribute('role','region');detail.setAttribute('aria-label','GOAL詳細');detail.tabIndex=0;area.append(detail);
 dock.querySelector('.heatmap').append(area);
 const tools=document.createElement('details');tools.id='labGoalTools';
 const summary=document.createElement('summary');summary.textContent='GOALフラグ（実験）';tools.append(summary);
 const note=document.createElement('p');note.textContent='prism-goals/1 のJSON・このページ内だけ。再読み込みで解除。';tools.append(note);
 const label=document.createElement('label');label.textContent='GOAL JSONを読み込む ';
 const input=document.createElement('input');input.id='labGoalFile';input.type='file';input.accept='.json,application/json';label.append(input);tools.append(label);
 const sample=document.createElement('button');sample.id='labGoalSample';sample.type='button';sample.className='btn';sample.textContent='検証サンプルを読む';tools.append(sample);
 const link=document.createElement('a');link.href='match.html?id=lab-sample-b&mode=lab';link.textContent='GOAL検証用のサンプル試合';tools.append(link);
 const clear=document.createElement('button');clear.type='button';clear.className='btn';clear.textContent='GOALを解除';clear.onclick=()=>{loadNote='';store.clear()};tools.append(clear);
 const status=document.createElement('p');status.id='labGoalStatus';status.setAttribute('role','status');tools.append(status);menu.append(tools);
 let loadNote='',lastRecord=undefined,lastKey='',buttons=[],selectedGoal=null,detailGroupKey='',closeTimer=null,touchSelected=false;
 const cancelClose=()=>{clearTimeout(closeTimer);closeTimer=null};
 function scheduleClose(){
  cancelClose();closeTimer=setTimeout(()=>{
   const focused=area.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');
   if(!touchSelected&&!focused&&!detail.matches(':hover')&&!buttons.some(b=>b.node.matches(':hover')))hide();
  },260);
 }
 detail.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')cancelClose()});
 detail.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')scheduleClose()});
 area.addEventListener('focusin',cancelClose);area.addEventListener('focusout',scheduleClose);
 document.addEventListener('pointerdown',e=>{
  if(!area.contains(e.target)){touchSelected=false;scheduleClose()}
 },true);
 const clock=s=>{const t=Math.round(s*10);return `${Math.floor(t/600)}:${String(Math.floor(t/10)%60).padStart(2,'0')}${t%10?'.'+t%10:''}`};
 const scorerText=s=>!s?'':s.og?'OG':[(s.number!==undefined?'#'+s.number:''),s.name||''].filter(Boolean).join(' ');
 function title(goal,record){return `GOAL ${goal.no} · ${clock(goal.sec)} · ${record.teams[goal.team].name} · ${goal.score.join('–')}${goal.scorer?' · '+scorerText(goal.scorer):''}`}
 function current(){
  const context=timeline.context(),record=store.select(context);
  const goals=context.ready&&record?record.goals.filter(g=>g.sec<=context.duration):[];
  return{context,record,goals,excluded:record&&context.ready?record.goals.length-goals.length:0};
 }
 function seek(goal){const now=current();return now.goals.includes(goal)&&timeline.seek(goal.sec)}
 function hide(){
  cancelClose();touchSelected=false;selectedGoal=null;detailGroupKey='';guide.hidden=true;detail.replaceChildren();detail.dataset.empty='true';
  const hint=document.createElement('small');hint.textContent='GOALにカーソルを合わせると詳細を表示';detail.append(hint);
 }
 // Group targets plus badge clearance; the count never covers another ball.
 function groups(){
  const result=[];
  for(const item of buttons.filter(b=>!b.node.hidden).map(b=>({...b,x:b.node.getBoundingClientRect().x})).sort((a,b)=>a.x-b.x)){
   const last=result.at(-1);if(last&&item.x-last.at(-1).x<40)last.push(item);else result.push([item]);
  }
  return result;
 }
 function groupFor(button){return groups().find(group=>group.some(b=>b.node===button))||[]}
 const groupKey=group=>group.map(b=>b.goal.no).join(',');
 function show(goal,button){
  const now=current();if(!now.goals.includes(goal))return;
  const nearby=groupFor(button),key=groupKey(nearby);
  cancelClose();if(selectedGoal===goal&&detailGroupKey===key&&detail.dataset.empty==='false'){updateGuide();return}
  selectedGoal=goal;detailGroupKey=key;document.getElementById('labTooltip').hidden=true;updateGuide();
  const heading=document.createElement('strong');heading.textContent=nearby.length>1?`近接するGOAL ${nearby.length}件`:'GOAL';detail.replaceChildren(heading);detail.dataset.empty='false';detail.scrollTop=0;
  nearby.forEach(({goal:g})=>{const row=document.createElement('button');row.type='button';row.textContent=title(g,now.record);row.onclick=event=>{event.stopPropagation();seek(g)};
   const mark=()=>{selectedGoal=g;updateGuide()};row.addEventListener('pointerenter',mark);row.addEventListener('focus',mark);detail.append(row)});
 }
 function updateGuide(){
  const now=current(),point=selectedGoal&&now.goals.includes(selectedGoal)&&timeline.point(selectedGoal.sec);
  guide.hidden=!point;if(!point)return;
  const panel=dock.getBoundingClientRect(),lane=layer.getBoundingClientRect(),border=parseFloat(getComputedStyle(dock).borderTopWidth)||0;
  const canvas=document.getElementById('chart'),graph=Chart.getChart(canvas),scale=canvas.getBoundingClientRect().height/graph.height;
  const top=point.top-point.height*scale;
  guide.style.left=point.left+'px';guide.style.top=top+'px';guide.style.height=Math.max(0,lane.top-panel.top-border+lane.height/2-top)+'px';
 }
 detail.onkeydown=event=>{if(event.key==='Escape'){hide();event.stopPropagation()}};
 function render(){
  const {context,record,goals,excluded}=current();
  sample.hidden=context.matchId!=='lab-sample-b';link.hidden=context.matchId==='lab-sample-b';
  const key=goals.map(g=>g.no+':'+g.sec).join(',');
  if(record!==lastRecord||key!==lastKey){
   lastRecord=record;lastKey=key;hide();layer.replaceChildren();buttons=[];
   const list=document.querySelector('.lab-goal-list');list.replaceChildren();
   const warning=document.querySelector('.lab-goal-warning');warning.textContent=record?'PRISM GOAL JSON・LABO端末内だけ':'GOAL JSON未読込';
   if(!goals.length){const empty=document.createElement('p');empty.className='muted';empty.textContent=record&&!context.ready?'動画の長さを確認中…':'この試合・前後半・動画のGOALはありません。';list.append(empty)}
   goals.forEach(goal=>{
    const node=document.createElement('button');node.type='button';node.className='lab-goal-flag';node.dataset.no=goal.no;node.dataset.sec=goal.sec;node.textContent='⚽';node.setAttribute('aria-label',title(goal,record));node.setAttribute('aria-controls','labGoalDetail');
    node.addEventListener('pointerdown',e=>{e.stopPropagation();touchSelected=e.pointerType==='touch';cancelClose()});
    node.onclick=e=>{e.stopPropagation();if(seek(goal))show(goal,node)};
    node.onkeydown=event=>{if(event.key==='Escape'){hide();event.stopPropagation()}};
    node.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){touchSelected=false;show(goal,node)}});
    node.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')scheduleClose()});
    node.onfocus=()=>show(goal,node);
    layer.append(node);buttons.push({goal,node});
    // Existing MATCH LOG shell uses the very same normalized goal objects.
    const row=document.createElement('button');row.type='button';row.className='lab-goal-row';row.style.setProperty('--goal-color',record.teams[goal.team].color);row.textContent=title(goal,record);row.onclick=()=>seek(goal);list.append(row);
   });
  }
  const origin=layer.getBoundingClientRect(),panel=dock.getBoundingClientRect(),border=parseFloat(getComputedStyle(dock).borderLeftWidth)||0;
  for(const {goal,node}of buttons){const point=timeline.point(goal.sec);node.hidden=!point;node.dataset.nearby='';if(point)node.style.left=(panel.left+border+point.left-origin.left)+'px'}
  for(const group of groups())if(group.length>1)group.at(-1).node.dataset.nearby=String(group.length);
  const selected=buttons.find(b=>b.goal===selectedGoal);
  if(selected&&detailGroupKey!==groupKey(groupFor(selected.node)))show(selectedGoal,selected.node);
  area.hidden=!context.active;updateGuide();

  status.textContent=[loadNote,record?(context.ready?`${goals.length}件表示${excluded?`・動画時間外${excluded}件は非表示`:''}`:'動画の長さを確認中…'):'対応するGOAL JSONは未読込'].filter(Boolean).join(' / ');
  if((!context.active||!context.ready)&&selectedGoal)hide();
 }
 function load(data,label='JSON'){
  const result=store.replace(data);loadNote=label+`：${result.record.goals.length}件`+(result.issues.length?' / '+result.issues.join('、'):'');render();return result;
 }
 input.onchange=async()=>{try{const file=input.files[0];if(!file)return;if(file.size>1024*1024)throw Error('JSONは1MB以下にしてください。');load(JSON.parse(await file.text()),'読み込み完了')}catch(e){loadNote='読込失敗：'+e.message;render()}finally{input.value=''}};
 sample.onclick=async()=>{try{const response=await fetch('fixtures/prism-goals-sample.json');if(!response.ok)throw Error('サンプルを読み込めません');load(await response.json(),'検証サンプル')}catch(e){loadNote=e.message;render()}};
 store.subscribe(render);
 window.PULSE_LAB_GOALS=Object.freeze({store,current,load,refresh:render});
 document.addEventListener('pulse-view-mode',render);setInterval(render,100);render();
})();
