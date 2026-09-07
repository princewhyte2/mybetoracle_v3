const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function load(file,imports={}){
 const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const module={exports:{}};new Function('require','module','exports',code)(name=>name in imports?imports[name]:require(name),module,module.exports);return module.exports;
}
const {pitchPositions}=load('src/features/match/lineup-pitch.tsx',{'./lineup-pitch.module.css':{}});
const {parseMatch}=load('src/features/match/match-service.ts',{'server-only':{},'@/features/discovery/public-id':{},'@/features/streaks/metric-catalog':{metricByKey:new Map()}});
const starters=[1,4,3,3].flatMap((count,row)=>Array.from({length:count},(_,column)=>({id:`${row}:${column}`,name:'Player',number:column+1,grid:`${row+1}:${column+1}`,starter:true})));
test('positions all eleven supplied starters and never includes the bench',()=>{
 const positions=pitchPositions([...starters,{id:'bench',name:'Substitute',grid:null,number:12,starter:false}]);
 assert.equal(positions.length,11);assert.ok(positions.every(p=>p.x>0&&p.x<100&&p.y>0&&p.y<100));
});
test('missing, duplicate, malformed or incomplete grids are not guessed',()=>{
 assert.equal(pitchPositions(starters.slice(1)),null);
 assert.equal(pitchPositions(starters.map((p,i)=>i===0?{...p,grid:null}:p)),null);
 assert.equal(pitchPositions(starters.map(p=>({...p,grid:'2:1'}))),null);
 assert.equal(pitchPositions(starters.map((p,i)=>i===0?{...p,grid:'100:1'}:p)),null);
});
function fixture(){
 const row={id:'old',kickoffAt:'2026-09-01T12:00:00Z',homeTeam:{id:'away',displayName:'Opponent'},awayTeam:{id:'home',displayName:'Home'},homeScore:0,awayScore:2};
 return {schemaVersion:'mbo-match-v1',fixtureId:'fixture',canonicalSlug:'home-v-away--id',canonicalPath:'/en/match/home-v-away--id',
 fixture:{kickoffAt:'2026-09-06T12:00:00Z',statusCode:'FT',homeTeam:{id:'home',displayName:'Home'},awayTeam:{id:'away',displayName:'Away'},competition:{id:'competition',displayName:'League'},score:{home:0,away:0},predictions:[]},
 recentResults:{availability:'available',items:[{teamId:'home',fixtures:[row,{...row,id:'future',kickoffAt:'2026-09-07T12:00:00Z'}]}]},
 lineups:{availability:'available',items:[{teamId:'home',isConfirmed:true,formation:'4-3-3',coachName:'Coach',players:starters.map(p=>({...p,displayName:p.name,isStarter:true})).concat([{id:'bench',displayName:'Bench',number:12,grid:null,isStarter:false}])}]},
 statistics:{availability:'available',items:[
 {teamId:'home',period:'MATCH',metric:'BALL_POSSESSION',value:60,displayValue:'60%'},{teamId:'away',period:'MATCH',metric:'BALL_POSSESSION',value:40,displayValue:'40%'},
 {teamId:'home',period:'MATCH',metric:'TOTAL_SHOTS',value:0},{teamId:'away',period:'MATCH',metric:'TOTAL_SHOTS',value:1},
 {teamId:'home',period:'FIRST_HALF',metric:'TOTAL_SHOTS',value:0},{teamId:'away',period:'FIRST_HALF',metric:'TOTAL_SHOTS',value:0},
 {teamId:'home',period:'MATCH',metric:'MISSING',value:null},{teamId:'away',period:'MATCH',metric:'MISSING',value:null},
 ]}};
}
test('form uses the selected team perspective and excludes future fixtures',()=>{
 const match=parseMatch(fixture(),'en');assert.deepEqual(match.home.form,['W']);assert.equal(match.recentResults.home.length,1);
});
test('lineups preserve real shirt numbers, confirmation, coach and bench separation',()=>{
 const match=parseMatch(fixture(),'en');assert.equal(match.lineup.home.length,11);assert.equal(match.lineup.homePlayers.length,12);assert.equal(match.lineup.coachHome,'Coach');assert.equal(match.lineup.confirmedHome,true);
});
test('statistics preserve percent units, periods, zero scores and missing values',()=>{
 const match=parseMatch(fixture(),'en');assert.deepEqual(match.score,[0,0]);assert.equal(match.comparison.length,3);
 assert.equal(match.comparison[0].format,'percent');assert.ok(match.comparison.some(row=>row.period==='FIRST_HALF'&&row.home===0));assert.ok(!match.comparison.some(row=>row.label==='MISSING'));
});
