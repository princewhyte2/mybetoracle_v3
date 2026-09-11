const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function load(file,imports={}){
 const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const module={exports:{}};new Function('require','module','exports',code)(name=>name in imports?imports[name]:require(name),module,module.exports);return module.exports;
}
const {pitchPositions}=load('src/features/match/lineup-pitch.tsx',{'./lineup-pitch.module.css':{},'./player-portrait':{}});
const {matchSectionVisibility}=load('src/features/match/section-visibility.ts');
const {parseMatch}=load('src/features/match/match-service.ts',{'server-only':{},'@/features/discovery/public-id':{},'@/features/streaks/metric-catalog':{metricByKey:new Map()}});
const starters=[1,4,3,3].flatMap((count,row)=>Array.from({length:count},(_,column)=>({id:`${row}:${column}`,name:'Player',number:column+1,grid:`${row+1}:${column+1}`,starter:true})));

test('lineup photos accept only the documented HTTPS numeric-player media path in every locale',()=>{
 for(const locale of ['en','fr','es','de','it','pt']) {
  const payload=fixture();payload.lineups.items[0].players[0].photoUrl='https://media.api-sports.io/football/players/35931.png';
  assert.equal(parseMatch(payload,locale).lineup.homePlayers[0].photoUrl,payload.lineups.items[0].players[0].photoUrl);
  for(const value of [null,'https://evil.example/1.png','http://media.api-sports.io/football/players/1.png','https://media.api-sports.io/football/players/1.png?x=1','https://media.api-sports.io/football/players/../1.png']) {
   payload.lineups.items[0].players[0].photoUrl=value;
   assert.equal(parseMatch(payload,locale).lineup.homePlayers[0].photoUrl,null);
  }
 }
});
test('portrait retains number while loading, falls back on error and accepts a changed source',()=>{
 const values=[];let cursor=0;
 const {PlayerPortrait}=load('src/features/match/player-portrait.tsx',{
  './lineup-pitch.module.css':{default:{}},'next/image':{default:()=>null},
  react:{useState:initial=>{const slot=cursor++;if(!(slot in values))values[slot]=initial;return [values[slot],value=>{values[slot]=value;}];}},
 });
 const player={...starters[0],photoUrl:'https://media.api-sports.io/football/players/35931.png'};
 const render=()=>{cursor=0;return PlayerPortrait({player}).props.children;};
 let [number,image]=render();assert.equal(number.props.children,1);assert.equal(number.props['data-loaded'],false);
 assert.equal(image.props.loading,'lazy');assert.equal(image.props.width,36);assert.equal(image.props.height,36);
 image.props.onLoad();assert.equal(render()[0].props['data-loaded'],true);
 image.props.onError();assert.equal(render()[1],false);assert.equal(render()[0].props.children,1);
 player.photoUrl='https://media.api-sports.io/football/players/625.png';assert.equal(render()[1].props.src,player.photoUrl);
 player.photoUrl=null;assert.equal(render()[1],false);
});
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

test('empty sections are hidden even when availability claims available',()=>{
 const match=parseMatch(fixture(),'en');
 match.comparison=[];match.lineup.homePlayers=[];
 match.availability.h2h='available';match.availability.streaks='available';
 assert.deepEqual(matchSectionVisibility(match),{overview:true,oracle:false,h2h:false,lineups:false,stats:false,streaks:false});
});
test('real zero statistics and supplied lineups remain visible',()=>{
 const match=parseMatch(fixture(),'en');
 assert.equal(matchSectionVisibility(match).stats,true);
 assert.equal(matchSectionVisibility(match).lineups,true);
 match.comparison=[];
 match.playerStatistics=[{id:'player',teamId:'home',name:'Player',rating:null,minutes:0,goals:null,assists:null}];
 assert.equal(matchSectionVisibility(match).stats,true);
 match.playerStatistics[0].minutes=null;
 assert.equal(matchSectionVisibility(match).stats,false);
});
test('sections appear when real evidence arrives without changing the route',()=>{
 const match=parseMatch(fixture(),'en');
 assert.equal(matchSectionVisibility(match).h2h,false);
 match.availability.h2h='available';
 match.h2h=[{id:'previous',date:'2026-09-01',competition:'League',home:'Home',away:'Away',score:[0,0]}];
 assert.equal(matchSectionVisibility(match).h2h,true);
});
