/* Standalone LAB only. Imported JSON stays in memory and never leaves the page. */
(() => {
 if(!window.PULSE_CONFIG?.lab||!window.PULSE_CONFIG?.localOnly||!window.PULSE_LAB_TIMELINE)return;
 const timeline=window.PULSE_LAB_TIMELINE,store=PULSE_PRISM_GOALS.createStore();
 const dock=document.getElementById('tvMapDock'),menu=document.getElementById('labControls');
 const layer=document.createElement('div');layer.id='labGoalFlags';layer.setAttribute('aria-label','GOALフラグ');dock.append(layer);
 const detail=document.createElement('div');detail.id='labGoalDetail';detail.hidden=true;detail.setAttribute('role','region');detail.setAttribute('aria-label','GOAL詳細');document.body.append(detail);
 const tools=document.createElement('details');tools.id='labGoalTools';
 const summary=document.createElement('summary');summary.textContent='GOALフラグ（実験）';tools.append(summary);
 const note=document.createElement('p');note.textContent='prism-goals/1 のJSON・このページ内だけ。再読み込みで解除。';tools.append(note);
 const label=document.createElement('label');label.textContent='GOAL JSONを読み込む ';
 const input=document.createElement('input');input.id='labGoalFile';input.type='file';input.accept='.json,application/json';label.append(input);tools.append(label);
 const sample=document.createElement('button');sample.id='labGoalSample';sample.type='button';sample.className='btn';sample.textContent='検証サンプルを読む';tools.append(sample);
 const link=document.createElement('a');link.href='match.html?id=lab-sample-b&mode=lab';link.textContent='GOAL検証用のサンプル試合';tools.append(link);
 const clear=document.createElement('button');clear.type='button';clear.className='btn';clear.textContent='GOALを解除';clear.onclick=()=>{loadNote='';store.clear()};tools.append(clear);
 const status=document.createElement('p');status.id='labGoalStatus';status.setAttribute('role','status');tools.append(status);menu.append(tools);
 let loadNote='',lastRecord=undefined,lastKey='',buttons=[],hideTimer;
 const clock=s=>{const t=Math.round(s*10);return `${Math.floor(t/600)}:${String(Math.floor(t/10)%60).padStart(2,'0')}${t%10?'.'+t%10:''}`};
 const scorerText=s=>!s?'':s.og?'OG':[(s.number!==undefined?'#'+s.number:''),s.name||''].filter(Boolean).join(' ');
 function title(goal,record){return `GOAL ${goal.no} · ${clock(goal.sec)} · ${record.teams[goal.team].name} · ${goal.score.join('–')}${goal.scorer?' · '+scorerText(goal.scorer):''}`}
 function current(){
  const context=timeline.context(),record=store.select(context);
  const goals=context.ready&&record?record.goals.filter(g=>g.sec<=context.duration):[];
  return{context,record,goals,excluded:record&&context.ready?record.goals.length-goals.length:0};
 }
 function seek(goal){const now=current();return now.goals.includes(goal)&&timeline.seek(goal.sec)}
 function hide(){detail.hidden=true}
 function laterHide(){clearTimeout(hideTimer);hideTimer=setTimeout(hide,500)}
 function show(goal,button){
  const now=current();if(!now.goals.includes(goal))return;
  clearTimeout(hideTimer);document.getElementById('labTooltip').hidden=true;
  const x=button.getBoundingClientRect().x;
  const nearby=buttons.filter(b=>Math.abs(b.node.getBoundingClientRect().x-x)<22);
  const heading=document.createElement('strong');heading.textContent=nearby.length>1?`近接するGOAL ${nearby.length}件`:'GOAL';detail.replaceChildren(heading);
  nearby.forEach(({goal:g})=>{const row=document.createElement('button');row.type='button';row.textContent=title(g,now.record);row.onclick=event=>{event.stopPropagation();seek(g)};detail.append(row)});
  detail.hidden=false;const r=button.getBoundingClientRect(),d=detail.getBoundingClientRect();
  const panels=[...document.querySelectorAll('#tvMapDock,#labReactions,#labPosting,#labTimeline,#labMatchLog')].filter(e=>e.checkVisibility()).map(e=>e.getBoundingClientRect());
  const preferred=Math.max(8,Math.min(r.left,innerWidth-d.width-8));
  const xs=[preferred,8,innerWidth-d.width-8],ys=panels.flatMap(p=>[p.top-d.height-8,p.bottom+8]);
  // Prefer nearby free video space, keeping every existing panel's controls usable.
  let position;
  for(const top of ys){for(const left of xs){if(left<8||top<8||left+d.width>innerWidth-8||top+d.height>innerHeight-8)continue;
   if(!panels.some(p=>left<p.right+4&&left+d.width>p.left-4&&top<p.bottom+4&&top+d.height>p.top-4)){position={left,top};break}}
   if(position)break;
  }
  if(!position){detail.hidden=true;return} // Native flag titles and MATCH LOG remain available in crowded layouts.
  detail.style.left=position.left+'px';detail.style.top=position.top+'px';
 }
 detail.onmouseenter=()=>clearTimeout(hideTimer);detail.onmouseleave=laterHide;
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
    const node=document.createElement('button');node.type='button';node.className='lab-goal-flag';node.dataset.no=goal.no;node.dataset.sec=goal.sec;node.textContent='⚑';node.setAttribute('aria-label',title(goal,record));node.title=title(goal,record);
    node.addEventListener('pointerdown',e=>e.stopPropagation());
    node.onclick=e=>{e.stopPropagation();if(seek(goal))show(goal,node)};
    node.onkeydown=event=>{if(event.key==='Escape'){hide();event.stopPropagation()}};
    node.onmouseenter=()=>show(goal,node);node.onmouseleave=laterHide;node.onfocus=()=>show(goal,node);node.onblur=event=>{if(!detail.contains(event.relatedTarget))laterHide()};
    layer.append(node);buttons.push({goal,node});
    // Existing MATCH LOG shell uses the very same normalized goal objects.
    const row=document.createElement('button');row.type='button';row.className='lab-goal-row';row.style.setProperty('--goal-color',record.teams[goal.team].color);row.textContent=title(goal,record);row.onclick=()=>seek(goal);list.append(row);
   });
  }
  for(const {goal,node}of buttons){const point=timeline.point(goal.sec);node.hidden=!point;if(point){node.style.left=point.left+'px';node.style.top=(point.top-17)+'px';const count=buttons.filter(b=>Math.abs((timeline.point(b.goal.sec)?.left??Infinity)-point.left)<18).length;node.dataset.nearby=count>1?String(count):''}}
  layer.hidden=!context.active||!context.ready;
  status.textContent=[loadNote,record?(context.ready?`${goals.length}件表示${excluded?`・動画時間外${excluded}件は非表示`:''}`:'動画の長さを確認中…'):'対応するGOAL JSONは未読込'].filter(Boolean).join(' / ');
  if(!context.active||!context.ready)hide();
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
