/* LAB storage is deliberately separate from production, even on the same Pages origin. */
(() => {
 const prefix='pulse_echo_lab_v1:';
 const layoutKey='pulse_echo_pc_lab_layout_v1',menuKey='pulse_echo_pc_menu_v1';
 const keys=[layoutKey,menuKey];
 const valid=(key,value)=>{
  if(!value||value.version!==1)return false;
  if(key===menuKey)return Number.isFinite(value.left)&&Number.isFinite(value.top);
  return value.panels&&typeof value.panels==='object'&&!Array.isArray(value.panels)&&Object.keys(value.panels).every(k=>!['__proto__','constructor','prototype'].includes(k))&&Object.values(value.panels).every(p=>p&&['left','top','width','height','transparency'].every(k=>Number.isFinite(p[k]))&&p.width>0&&p.height>0&&p.transparency>=0&&p.transparency<=100&&typeof p.visible==='boolean');
 };
 const store=Object.freeze({
  getItem:key=>localStorage.getItem(prefix+key),
  setItem:(key,value)=>localStorage.setItem(prefix+key,String(value)),
  removeItem:key=>localStorage.removeItem(prefix+key),
  prefix,
  exportLayouts(){const values={};for(const key of keys){const raw=this.getItem(key);if(raw){const value=JSON.parse(raw);if(valid(key,value))values[key]=value}}return{format:'pulse-echo-lab-layouts',version:1,values}},
  importLayouts(backup){
   const values=backup?.format==='pulse-echo-lab-layouts'&&backup.version===1?backup.values:backup;
   if(!values||typeof values!=='object')throw Error('配置ファイルの形式が違います。');
   const entries=Object.entries(values);
   if(!entries.length||entries.some(([k,v])=>!keys.includes(k)||!valid(k,v)))throw Error('配置データを確認できませんでした。');
   // Validate every entry before writing. Keep a copy of current LAB values for rollback.
   const previous=entries.map(([k])=>[k,this.getItem(k)]);
   try{for(const [k,v]of entries)this.setItem(k,JSON.stringify(v))}
   catch(error){for(const[k,v]of previous){try{if(v===null)this.removeItem(k);else this.setItem(k,v)}catch{}}throw error}
   return entries.length;
  }
 });
 const migrated=[];
 for(const key of keys){try{
  const marker='migration-v1:'+key;
  if(store.getItem(marker)!==null)continue;
  let status='existing-labo';
  if(store.getItem(key)===null){
   const raw=localStorage.getItem(key);status='no-source';
   if(raw){let value;try{value=JSON.parse(raw)}catch{}status='invalid-source';if(valid(key,value)){store.setItem(key,raw);migrated.push(key);status='copied'}}
  }
  // Mark even a missing source: a later production change must never be re-imported automatically.
  store.setItem(marker,JSON.stringify({status,at:new Date().toISOString()}));
 }catch{ /* Storage unavailable: do not alter the legacy key. */ }}
 window.PULSE_LAB_STORAGE=store;
 window.PULSE_LAB_MIGRATED=Object.freeze(migrated);
})();
