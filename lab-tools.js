(() => {
 document.addEventListener('DOMContentLoaded',()=>{
  document.body.dataset.environment='labo';
  const notice=document.createElement('div');notice.id='laboEnvironment';notice.textContent='PULSE ECHO LABO · サンプル／端末内保存';document.body.append(notice);
 },{once:true});
 function mount(){
  if(document.getElementById('labDataTools'))return;
  const controls=document.getElementById('labControls');if(!controls)return;
  const box=document.createElement('section');box.id='labDataTools';
  const label=document.createElement('p');label.textContent='PULSE ECHO LABO・サンプルデータ／投稿はこのブラウザ内だけに保存';
  const save=document.createElement('button');save.className='btn';save.type='button';save.textContent='配置を書き出す';
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','配置JSONを読み込む');
  const status=document.createElement('p');status.setAttribute('role','status');status.textContent=window.PULSE_LAB_MIGRATED.length?'既存の配置をコピーしました。元の保存設定は残っています。':'配置JSONは別端末・別ドメインへの移行にも使えます。';
  save.onclick=()=>{try{const url=URL.createObjectURL(new Blob([JSON.stringify(PULSE_LAB_STORAGE.exportLayouts(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pulse-echo-lab-layouts.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch{status.textContent='配置を書き出せませんでした。'}};
  input.onchange=async()=>{try{if(!input.files[0])return;const n=PULSE_LAB_STORAGE.importLayouts(JSON.parse(await input.files[0].text()));status.textContent=`${n}件の配置を読み込みました。再読み込みで反映します。`;reload.hidden=false}catch(error){status.textContent=error.message}};
  const reload=document.createElement('button');reload.className='btn';reload.type='button';reload.textContent='再読み込みして反映';reload.hidden=true;reload.onclick=()=>location.reload();
  box.append(label,save,input,reload,status);controls.append(box);
 }
 document.addEventListener('pulse-pc-ready',mount);
 document.addEventListener('DOMContentLoaded',mount);
})();
