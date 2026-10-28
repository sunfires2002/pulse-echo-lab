const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');const source=fs.readFileSync(path.join(__dirname,'../lab-storage.js'),'utf8');
const layout='pulse_echo_pc_lab_layout_v1',menu='pulse_echo_pc_menu_v1',prefix='pulse_echo_lab_v1:';
const oldLayout={version:1,docked:false,panels:{map:{left:20,top:60,width:700,height:180,visible:true,transparency:78}}},oldMenu={version:1,left:8,top:8};
const data=new Map([[layout,JSON.stringify(oldLayout)],[menu,JSON.stringify(oldMenu)],['pulse_echo_user_name','formal name']]);let failKey=null;
const storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>{assert.ok(k.startsWith(prefix),'writes must be LABO-only');if(k===failKey)throw Error('quota');data.set(k,String(v))},removeItem:k=>{assert.ok(k.startsWith(prefix));data.delete(k)}};
function boot(){const context={localStorage:storage,window:{},Date};vm.runInNewContext(source,context);return context.window.PULSE_LAB_STORAGE}
let store=boot();assert.equal(data.get(prefix+layout),JSON.stringify(oldLayout));assert.equal(data.get(layout),JSON.stringify(oldLayout));assert.equal(data.get(prefix+'pulse_echo_user_name'),undefined);
const snapshot=data.get(prefix+layout);data.set(layout,JSON.stringify({...oldLayout,docked:true}));store=boot();assert.equal(data.get(prefix+layout),snapshot,'later production changes must not be imported');data.delete(prefix+layout);store=boot();assert.equal(store.getItem(layout),null,'one-time migration must not repeat if LABO value is removed');
assert.throws(()=>store.importLayouts({[layout]:oldLayout,wrong:oldMenu}));assert.equal(store.getItem(layout),null);
store.importLayouts({[layout]:oldLayout,[menu]:oldMenu});const previous=store.getItem(layout);failKey=prefix+menu;assert.throws(()=>store.importLayouts({[layout]:{...oldLayout,docked:true},[menu]:oldMenu}));assert.equal(store.getItem(layout),previous,'partial import rolls back');failKey=null;
assert.equal(data.get(menu),JSON.stringify(oldMenu));assert.equal(data.get('pulse_echo_user_name'),'formal name');assert.equal(Object.keys(store.exportLayouts().values).length,2);
console.log('PASS: one-time migration, no legacy writes, no identity copying, validation and rollback');
