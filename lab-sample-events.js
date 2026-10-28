/* Synthetic reactions only. No production reactions are bundled or fetched. */
(() => {
 const storage=window.PULSE_LAB_STORAGE;
 const kinds=['🔥 ナイスプレー','😫 惜しい','😅 あちゃー','😳 マジで'];
 for(const match of window.PULSE_MATCHES||[]){for(const [part,video]of [['前半',match.firstHalfVideo],['後半',match.secondHalfVideo],['ハイライト',match.highlightVideo]]){
  if(!video)continue;const key=`pulse_echo_${match.id}_${part}`;if(storage.getItem(key)!==null)continue;
  const events=Array.from({length:36},(_,i)=>({id:`lab-sample-${part}-${i}`,good_time:15+i*33,description:kinds[i%kinds.length],user_name:'LABサンプル',comment:i%9===0?'表示確認用の仮データです':'',video_id:`${match.id}:${part}`}));
  storage.setItem(key,JSON.stringify(events));
 }}
})();
