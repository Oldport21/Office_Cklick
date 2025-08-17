const SAVE_KEY='clicker_save_v1';
let stars=0,xp=0,energy=100,maxEnergy=100,perClick=1,regenPerSec=1;
let priceClick=20,priceMax=30,priceRegen=25,priceBg=200;
let ownedBgAlt=false,appliedBg='room';
const CHAR_LVL1='https://i.postimg.cc/fLpZNSq3/3.png';
const CHAR_LVL2='https://i.postimg.cc/0NBQgS0S/2.png';

function saveState(){const p={stars,xp,energy,maxEnergy,perClick,regenPerSec,priceClick,priceMax,priceRegen,priceBg,ownedBgAlt,appliedBg,ts:Date.now()};try{localStorage.setItem(SAVE_KEY,JSON.stringify(p));}catch(e){}}
let _saveTimer=null,_saveAgain=false;function queueSave(immediate=false){if(immediate){saveState();return}if(_saveTimer){_saveAgain=true;return}_saveTimer=setTimeout(()=>{saveState();_saveTimer=null;if(_saveAgain){_saveAgain=false;queueSave()}},380)}
window.addEventListener('pagehide',()=>queueSave(true));

function loadState(){try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const d=JSON.parse(raw);if(typeof d.stars==='number')stars=d.stars;xp=typeof d.xp==='number'?d.xp:Math.max(stars,0);energy=d.energy??energy;maxEnergy=d.maxEnergy??maxEnergy;perClick=d.perClick??perClick;regenPerSec=d.regenPerSec??regenPerSec;priceClick=d.priceClick??priceClick;priceMax=d.priceMax??priceMax;priceRegen=d.priceRegen??priceRegen;priceBg=d.priceBg??priceBg;ownedBgAlt=!!d.ownedBgAlt;appliedBg=(d.appliedBg==='alt')?'alt':'room';const secs=d.ts?Math.max(0,Math.floor((Date.now()-d.ts)/1000)):0;energy=Math.min(maxEnergy,energy+secs*regenPerSec);}}catch(e){}if(!ownedBgAlt&&priceBg<200)priceBg=200}
loadState();

const wrapper=document.getElementById('wrapper');
const gameRoot=document.getElementById('game');
const character=document.getElementById('character');
const levelEl=document.getElementById('level');
const lvlProgressText=document.getElementById('lvl-progress');
const lvlProgressBar=document.getElementById('lvl-progress-bar');
const scoreDisplay=document.getElementById('score');
const scoreBig=document.getElementById('score-big');
const energyBar=document.getElementById('energy-bar');
const energyLevelDisplay=document.getElementById('energy-level');
const maxEnergyDisplay=document.getElementById('max-energy');
const walletStars=document.getElementById('wallet-stars');
const statPerClick=document.getElementById('stat-per-click');
const statRegen=document.getElementById('stat-regen');
const statMaxEnergy=document.getElementById('stat-max-energy');
const btnBuyClick=document.getElementById('buy-click');
const btnBuyMax=document.getElementById('buy-max');
const btnBuyRegen=document.getElementById('buy-regen');
const costClick=document.getElementById('cost-click');
const costMax=document.getElementById('cost-max');
const costRegen=document.getElementById('cost-regen');
const btnBuyBg=document.getElementById('buy-bg');
const btnApplyBg=document.getElementById('apply-bg');
const costBgSpan=document.getElementById('cost-bg');
const bgRoom=document.getElementById('bg-room');
const bgAlt=document.getElementById('bg-alt');
const resetBtn=document.getElementById('reset-progress');
const preloader=document.getElementById('preloader');
const preloaderFill=document.getElementById('preloader-fill');

function currentLevel(){return Math.floor(xp/200)+1}
function refreshCharacterByLevel(){const lvl=currentLevel();const need=lvl>=2?CHAR_LVL2:CHAR_LVL1;if(character.getAttribute('src')!==need)character.setAttribute('src',need)}
function refreshLevelBar(){const prog=xp%200;lvlProgressText.textContent=prog;lvlProgressBar.style.width=(prog/200*100)+'%'}

function refreshUI(){
  levelEl.textContent=String(currentLevel());
  refreshCharacterByLevel();refreshLevelBar();
  scoreDisplay.textContent=stars;scoreBig.textContent=stars;
  if(walletStars)walletStars.textContent=stars+' ⭐';
  energyLevelDisplay.textContent=Math.floor(energy);
  if(maxEnergyDisplay)maxEnergyDisplay.textContent=maxEnergy;
  energyBar.style.width=(energy/maxEnergy*100)+'%';
  if(statPerClick)statPerClick.textContent=perClick;
  if(statRegen)statRegen.textContent=regenPerSec;
  if(statMaxEnergy)statMaxEnergy.textContent=maxEnergy;
  if(costClick)costClick.textContent=priceClick;
  if(costMax)costMax.textContent=priceMax;
  if(costRegen)costRegen.textContent=priceRegen;
  if(costBgSpan)costBgSpan.textContent=priceBg;
  if(btnApplyBg)btnApplyBg.disabled=!ownedBgAlt;
  if(appliedBg==='alt'){bgAlt.style.opacity=1;bgRoom.style.opacity=0;bgAlt.classList.add('dim-3')}else{bgAlt.style.opacity=0;bgRoom.style.opacity=1;bgAlt.classList.remove('dim-3')}
}
refreshUI();

/* Монетки — пул */
let wrapperRect=wrapper.getBoundingClientRect();
function updateWrapperRect(){wrapperRect=wrapper.getBoundingClientRect()}
window.addEventListener('resize',updateWrapperRect,{passive:true});
window.addEventListener('scroll',updateWrapperRect,{passive:true});
const COIN_POOL=12;const coinPool=[];let coinPtr=0;
for(let i=0;i<COIN_POOL;i++){const el=document.createElement('div');el.className='floating-coin';el.innerHTML='<span class="coin-text">+1</span> <img src="https://em-content.zobj.net/source/apple/354/star_2b50.png" alt="⭐">';wrapper.appendChild(el);coinPool.push(el)}
function animateCoin(el,x,y,val){el.querySelector('.coin-text').textContent='+'+val;el.style.setProperty('--x',(x|0)+'px');el.style.setProperty('--y',(y|0)+'px');el.style.animation='none';void el.offsetWidth;el.style.animation='floatUp 1s ease-out forwards'}
function showFloatingCoin(evt){const cx=(evt.clientX||(evt.touches&&evt.touches[0].clientX))-wrapperRect.left;const cy=(evt.clientY||(evt.touches&&evt.touches[0].clientY))-wrapperRect.top-20;const el=coinPool[coinPtr++%COIN_POOL];animateCoin(el,cx+(Math.random()*24-12),cy,perClick)}
function gainStars(a){stars+=a;xp+=a}
function onClickCharacter(e){if(energy>=1){gainStars(perClick);energy-=1;showFloatingCoin(e);refreshUI();queueSave()}}

function pressDown(){character.classList.add('pressed')}
function pressUp(){character.classList.remove('pressed')}
character.addEventListener('mousedown',e=>{pressDown();onClickCharacter(e)});
character.addEventListener('mouseup',pressUp);
character.addEventListener('mouseleave',pressUp);
character.addEventListener('touchstart',e=>{e.preventDefault();pressDown();onClickCharacter(e)},{passive:false});
character.addEventListener('touchend',pressUp);
character.addEventListener('touchcancel',pressUp);

setInterval(()=>{if(energy<maxEnergy){energy+=regenPerSec/2;if(energy>maxEnergy)energy=maxEnergy;refreshUI()}},500);

// Tabs
const tabButtons=[...document.querySelectorAll('.tab-btn')];
const screens={income:document.getElementById('screen-income'),upgrades:document.getElementById('screen-upgrades'),game:document.getElementById('screen-game'),wallet:document.getElementById('screen-wallet'),friends:document.getElementById('screen-friends'),quests:document.getElementById('screen-quests')};
function hideAllScreens(){Object.values(screens).forEach(el=>{if(el){el.classList.remove('active');el.setAttribute('aria-hidden','true')}});gameRoot.classList.remove('scene-dim')}
function setActiveBtn(btn){tabButtons.forEach(b=>b.setAttribute('aria-selected','false'));if(btn)btn.setAttribute('aria-selected','true')}
function openScreenById(id){hideAllScreens();const el=document.getElementById(id);if(el){el.classList.add('active');el.setAttribute('aria-hidden','false');gameRoot.classList.add('scene-dim')}}
function closeScreens(){hideAllScreens();setActiveBtn(null)}
tabButtons.forEach(btn=>btn.addEventListener('click',()=>{const id=btn.getAttribute('data-screen');const el=document.getElementById(id);const opened=el&&el.classList.contains('active');if(opened){closeScreens()}else{openScreenById(id);setActiveBtn(btn)}}));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeScreens));

// Покупки
function tryBuy(cost){if(stars>=cost){stars-=cost;refreshUI();queueSave();return true}return false}
btnBuyClick?.addEventListener('click',()=>{if(tryBuy(priceClick)){perClick+=1;priceClick=Math.ceil(priceClick*1.6);refreshUI();queueSave(true)}});
btnBuyMax?.addEventListener('click',()=>{if(tryBuy(priceMax)){maxEnergy+=10;energy=Math.min(maxEnergy,energy+10);priceMax=Math.ceil(priceMax*1.6);refreshUI();queueSave(true)}});
btnBuyRegen?.addEventListener('click',()=>{if(tryBuy(priceRegen)){regenPerSec=Math.round((regenPerSec+0.5)*10)/10;priceRegen=Math.ceil(priceRegen*1.6);refreshUI();queueSave(true)}});
btnBuyBg?.addEventListener('click',()=>{if(ownedBgAlt)return;if(tryBuy(priceBg)){ownedBgAlt=true;btnApplyBg.disabled=false;priceBg=Math.ceil(priceBg*1.6);refreshUI();queueSave(true)}});
btnApplyBg?.addEventListener('click',()=>{if(!ownedBgAlt)return;if(appliedBg==='room'){bgAlt.style.opacity=1;bgRoom.style.opacity=0;appliedBg='alt';bgAlt.classList.add('dim-3')}else{bgAlt.style.opacity=0;bgRoom.style.opacity=1;appliedBg='room';bgAlt.classList.remove('dim-3')}queueSave(true)});

// Сброс
resetBtn?.addEventListener('click',()=>{stars=0;xp=0;energy=100;maxEnergy=100;perClick=1;regenPerSec=1;priceClick=20;priceMax=30;priceRegen=25;priceBg=200;ownedBgAlt=false;appliedBg='room';try{localStorage.removeItem(SAVE_KEY)}catch(e){}refreshUI();queueSave(true)});

// -------- СЛОТЫ --------
const SPIN_COST=5,COOLDOWN_MS=900;
const symbols=[{emoji:'🍒',weight:24,payout3:15},{emoji:'🍋',weight:20,payout3:20},{emoji:'🍉',weight:14,payout3:40},{emoji:'🍇',weight:10,payout3:60},{emoji:'🍀',weight:16,payout3:30},{emoji:'🍑',weight:12,payout3:35},{emoji:'7️⃣',weight:4,payout3:250}];
const reelsEls=[document.getElementById('reel0'),document.getElementById('reel1'),document.getElementById('reel2')];
const spinBtn=document.getElementById('spinBtn');const paytable=document.getElementById('paytable');const paytableBtn=document.getElementById('paytableBtn');const cooldownText=document.getElementById('cooldownText');const winBanner=document.getElementById('slotsWinBanner');
paytableBtn?.addEventListener('click',()=>{paytable.classList.toggle('hidden')});
const CELL_H=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-h'))||88;const LOOPS=8;
const reels=reelsEls.map(el=>({el,arr:[],current:0}));
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
}
function buildReel(data){const base=[];for(let n=0;n<LOOPS;n++){for(const s of symbols){base.push(s.emoji)}}shuffle(base);data.arr=base;data.el.innerHTML=base.map(e=>`<div class='cell'>${e}</div>`).join('');data.el.style.transform=`translateY(${-data.current*CELL_H}px)`}
reels.forEach(buildReel);
function weightedPickIdx(){const total=symbols.reduce((a,s)=>a+s.weight,0);let r=Math.random()*total;for(let i=0;i<symbols.length;i++){r-=symbols[i].weight;if(r<=0)return i}return symbols.length-1}
function capReel(data){if(data.arr.length>300){data.current=0;buildReel(data)}}
function ensureTargetIndex(data,symbol,start){let idx=data.arr.indexOf(symbol,start);if(idx!==-1)return idx;const extra=[];for(let k=0;k<symbols.length*3;k++){extra.push(symbols[k%symbols.length].emoji)}extra.push(symbol);data.arr.push(...extra);const frag=document.createDocumentFragment();extra.forEach(e=>{const d=document.createElement('div');d.className='cell';d.textContent=e;frag.appendChild(d)});data.el.appendChild(frag);capReel(data);return data.arr.length-1}
function outcomePay(a,b,c){if(a===b&&b===c){const s=symbols.find(x=>x.emoji===a);return s?s.payout3:0}if(a===b||a===c||b===c){const two7=[a,b,c].filter(x=>x==='7️⃣').length===2;return two7?40:5}return 0}
function showWin(val){if(val<=0)return;winBanner.textContent=`+${0} ⭐`;winBanner.classList.add('show');let cur=0;const step=Math.max(1,Math.floor(val/20));const t=setInterval(()=>{cur=Math.min(val,cur+step);winBanner.textContent=`+${cur} ⭐`;if(cur>=val){clearInterval(t);setTimeout(()=>winBanner.classList.remove('show'),900)}},30)}
let spinning=false,lastSpin=0;
function spin(){if(spinning)return;const now=Date.now();if(now-lastSpin<COOLDOWN_MS){cooldownText.textContent='Подождите…';return}if(stars<SPIN_COST){cooldownText.textContent='Нужно 5 ⭐';return}
  stars-=SPIN_COST;refreshUI();queueSave();spinning=true;lastSpin=now;cooldownText.textContent='Крутится…';
  const targets=[weightedPickIdx(),weightedPickIdx(),weightedPickIdx()].map(i=>symbols[i].emoji);
  const durations=[],finalIdx=[],res=[];
  reels.forEach((data,ri)=>{const turnsBase=24+ri*8;const jitter=Math.floor(Math.random()*symbols.length);const start=data.current+turnsBase+jitter;const tIdx=ensureTargetIndex(data,targets[ri],start);finalIdx[ri]=tIdx;res[ri]=targets[ri];const dur=1.0+ri*0.2;durations[ri]=dur;data.el.style.transition='none';data.el.style.transform=`translateY(${-data.current*CELL_H}px)`;requestAnimationFrame(()=>{data.el.style.transition=`transform ${dur}s cubic-bezier(.12,.68,.08,1)`;data.el.style.transform=`translateY(${-tIdx*CELL_H}px)`})});
  const totalTime=Math.max(...durations)*1000+120;
  setTimeout(()=>{reels.forEach((d,i)=>d.current=finalIdx[i]);const gain=outcomePay(res[0],res[1],res[2]);if(gain>0){gainStars(gain);showWin(gain)}refreshUI();queueSave();spinning=false;cooldownText.textContent='Готово к спину'},totalTime)
}
document.getElementById('spinBtn')?.addEventListener('click',spin);

// Переключение мини-игр
const tabMiniSlots=document.getElementById('tabMiniSlots');
const tabMiniRocket=document.getElementById('tabMiniRocket');
const gameSlotsWrap=document.getElementById('gameSlots');
const gameRocketWrap=document.getElementById('gameRocket');
function showMini(which){
  if(which==='slots'){gameSlotsWrap.classList.remove('hidden');gameRocketWrap.classList.add('hidden');tabMiniSlots.classList.add('outline');tabMiniRocket.classList.remove('outline');stopRocketLoop();rReset();}
  else{gameSlotsWrap.classList.add('hidden');gameRocketWrap.classList.remove('hidden');tabMiniRocket.classList.add('outline');tabMiniSlots.classList.remove('outline');}
}
tabMiniSlots?.addEventListener('click',()=>showMini('slots'));
tabMiniRocket?.addEventListener('click',()=>showMini('rocket'));

// -------- РАКЕТА (Crash) --------
const rocketSprite=document.getElementById('rocketSprite');
const rocketMultEl=document.getElementById('rocketMult');
const rocketStartBtn=document.getElementById('rocketStart');
const rocketCashoutBtn=document.getElementById('rocketCashout');
const rocketBetInput=document.getElementById('rocketBet');
const rocketAutoInput=document.getElementById('rocketAuto');
const rocketBanner=document.getElementById('rocketBanner');
const rocketSky=document.querySelector('.rocket-sky');
const rocketCurve=document.getElementById('rocketCurve');

const rBetPlus=document.getElementById('rBetPlus');
const rBetMinus=document.getElementById('rBetMinus');
const rAuto2=document.getElementById('rAuto2');
const rAuto3=document.getElementById('rAuto3');

let rState='idle';
let rBet=0;let rStart=0;let rCrashAt=0;let rReq=0;let rMult=1.0;

function stopRocketLoop(){if(rReq){cancelAnimationFrame(rReq);rReq=0}}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function rReset(){
  stopRocketLoop();rState='idle';rBet=0;rMult=1.0;
  rocketMultEl.textContent='x1.00';
  rocketSprite.classList.remove('shake','boom');
  rocketSprite.style.transform='translate(0px, 0px) rotate(14deg)';
  rocketCashoutBtn.disabled=true;rocketStartBtn.disabled=false;
  rocketBanner.classList.remove('show');rocketBanner.style.opacity=0;
  if(rocketSky){rocketSky.style.transform='translate(0,0)';if(rocketCurve) rocketCurve.style.transform='scaleX(1)'}
}
rReset();

function drawCrashAt(){const u=Math.random();const m=1+(-Math.log(1-u))*1.4;return Math.min(25, Math.max(1.05, +m.toFixed(2)))}

function rLoop(){
  if(rState!=='running')return;
  const t=(performance.now()-rStart)/1000;
  const rate=.65;
  rMult=Math.exp(rate*t);
  if(rMult>=rCrashAt){return rCrash()}
  rocketMultEl.textContent='x'+rMult.toFixed(2);

  const p=Math.min(1, Math.log(rMult)/Math.log(6));
  const stageW=300, padL=12, padR=10, shipW=44;
  const rangeX=stageW - padL - padR - shipW;
  const x=clamp(p*rangeX, 0, rangeX);
  const y=clamp(-p*110, -120, 0);
  rocketSprite.style.transform=`translate(${x}px, ${y}px) rotate(14deg)`;
  if(rocketSky){const parX=-p*60; const parY=p*14; rocketSky.style.transform=`translate(${parX}px, ${parY}px)`;} 
  if(rocketCurve){rocketCurve.style.transform=`scaleX(${1+ p*0.15}) skewX(${-6*p}deg)`;}

  const auto=parseFloat(rocketAutoInput.value||'0');
  if(auto>=1.01 && rMult>=auto){rCashout();return}
  rReq=requestAnimationFrame(rLoop)
}

function rStartRound(){
  const v=Math.max(1, Math.floor(parseInt(rocketBetInput.value||'0',10)));
  if(!tryBuy(v)){rFlash('Нужно больше ⭐', '#f87171');return}
  rBet=v;rCrashAt=drawCrashAt();rStart=performance.now();rState='running';
  rocketStartBtn.disabled=true;rocketCashoutBtn.disabled=false;
  rocketBanner.classList.remove('show');
  stopRocketLoop();rReq=requestAnimationFrame(rLoop)
}

function rCashout(){
  if(rState!=='running')return;
  const win=Math.max(0, Math.floor(rBet*rMult));
  gainStars(win); refreshUI(); queueSave();
  rState='cashed'; rocketCashoutBtn.disabled=true;
  rocketBanner.textContent=`Вывел x${rMult.toFixed(2)} → +${win} ⭐`;
  rocketBanner.style.color='#86efac'; rocketBanner.classList.add('show');
  setTimeout(()=>rReset(),1100);
}

function rCrash(){
  rState='crashed'; rocketCashoutBtn.disabled=true;
  rocketSprite.classList.add('boom');
  rocketBanner.textContent=`Взорвалась на x${rMult.toFixed(2)} :(`;
  rocketBanner.style.color='#fca5a5'; rocketBanner.classList.add('show');
  setTimeout(()=>rReset(),1200);
}

function rFlash(text,color){
  rocketBanner.textContent=text; rocketBanner.style.color=color||'#fff';
  rocketBanner.classList.add('show'); setTimeout(()=>rocketBanner.classList.remove('show'),700);
}

rocketStartBtn?.addEventListener('click', rStartRound);
rocketCashoutBtn?.addEventListener('click', rCashout);
rBetPlus?.addEventListener('click',()=>{ rocketBetInput.value=Math.max(1, parseInt(rocketBetInput.value||'0',10)+10); });
rBetMinus?.addEventListener('click',()=>{ rocketBetInput.value=Math.max(1, parseInt(rocketBetInput.value||'0',10)-10); });
rAuto2?.addEventListener('click',()=>{ rocketAutoInput.value='2.00'; });
rAuto3?.addEventListener('click',()=>{ rocketAutoInput.value='3.00'; });

(function initPreloader(){
  if(!preloader||!preloaderFill) return;
  let progress=0;
  const tick=setInterval(()=>{
    progress=Math.min(90, progress + 3 + Math.random()*6);
    preloaderFill.style.width=progress+'%';
    preloader.querySelector('.preloader-bar')?.setAttribute('aria-valuenow', String(Math.round(progress)));
  },120);
  function hide(){
    clearInterval(tick);
    preloaderFill.style.width='100%';
    preloader.querySelector('.preloader-bar')?.setAttribute('aria-valuenow','100');
    preloader.classList.add('hidden');
  }
  if(document.readyState==='complete' || document.readyState==='interactive'){
    setTimeout(hide,150);
  }else{
    window.addEventListener('load', hide, {once:true});
    document.addEventListener('DOMContentLoaded', ()=> setTimeout(hide, 150), {once:true});
  }
  requestAnimationFrame(()=>requestAnimationFrame(hide));
  setTimeout(hide, 2500);
})();