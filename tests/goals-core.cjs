const assert=require('node:assert/strict'),{normalize,createStore}=require('../lab-goals-core.js');
const source=require('../fixtures/prism-goals-sample.json');
const result=normalize(source);assert.equal(result.record.goals[0].sec,1.5);assert.equal(result.record.kickoff_sec,.5);assert.equal(result.record.goals[0].scorer.number,'07');assert.equal(result.record.goals[2].scorer.og,true);assert.ok(Object.isFrozen(result.record.goals[0]));
for(const scorer of [{number:'10',name:'山田'},{number:'07'},{name:'山田'},{og:true},undefined]){
 const input=structuredClone(source);input.goals=[{no:1,sec:456.7,team:1,score:[2,3],...(scorer?{scorer}:{})}];input.kickoff_sec=123;input.end_sec=1500;
 const g=normalize(input).record.goals[0];assert.equal(g.sec,456.7);assert.deepEqual(g.scorer,scorer);
}
const broken=structuredClone(source);broken.goals.push({no:6,sec:-1,team:0,score:[0,0]},{no:7,sec:'5',team:0,score:[0,0]},{no:8,sec:Infinity,team:0,score:[0,0]},{...broken.goals[0]});const filtered=normalize(broken);assert.equal(filtered.record.goals.length,4);assert.equal(filtered.issues.length,4);
const optional=structuredClone(source);optional.goals[0].scorer={number:7};assert.equal(normalize(optional).record.goals[0].scorer,undefined);
for(const mutation of [x=>x.format='wrong',x=>x.youtube_id='bad',x=>x.half='first',x=>x.match_id=null,x=>x.kickoff_sec=-1,x=>x.goals={},x=>x.teams.pop()]){const input=structuredClone(source);mutation(input);assert.throws(()=>normalize(input))}
const store=createStore();store.replace(source);const context={matchId:source.match_id,half:'1st',youtubeId:source.youtube_id};assert.equal(store.select(context).goals[0].scorer.number,'07');assert.equal(store.select({...context,half:'2nd'}),null);assert.equal(store.select({...context,youtubeId:'xxxxxxxxxxx'}),null);assert.throws(()=>store.replace({}));assert.equal(store.select(context).goals.length,4);store.replace({...source,goals:[]});assert.equal(store.select(context).goals.length,0);store.clear();assert.equal(store.select(context),null);console.log('PASS prism-goals normalization, original seconds, scorers, replacement and scope');
