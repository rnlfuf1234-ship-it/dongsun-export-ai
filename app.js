/* 동선 수출 AI — 데모 앱 (서버 없음 · localStorage 저장) */
"use strict";

/* ---------- 저장소 ---------- */
const KEY="dsx1";
let S=null;
function defaultState(){
 return {
  user:null,
  products: JSON.parse(JSON.stringify(SEED.products)),
  dict: JSON.parse(JSON.stringify(SEED.dict)),
  drafts: [
   { id:1, kind:"label", productId:1, ctr:"US", status:"check",
     fields: aiLabelDraft(SEED.products[0],"US"),
     history:[{st:"draft",at:Date.now()-3600e3*5},{st:"check",at:Date.now()-3600e3*2}], contract:0 },
  ],
  log: [ {t:"AI 초안 완성 — 미국 라벨(쌀 튀김누룽지)", at:Date.now()-3600e3*5, kind:"ai"} ],
  perf: { contracts: 815, goal: 950 },
  seq: 2
 };
}
function load(){ try{ const raw=localStorage.getItem(KEY); S = raw? JSON.parse(raw): defaultState(); }catch(e){ S=defaultState(); } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
load();

/* ---------- 유틸 ---------- */
const $=s=>document.querySelector(s);
function h(html){ const d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstChild; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function ago(ts){ const m=Math.round((Date.now()-ts)/60000); if(m<1)return "방금"; if(m<60)return m+"분 전"; const hh=Math.round(m/60); if(hh<24)return hh+"시간 전"; return Math.round(hh/24)+"일 전"; }
function toast(msg, err){ const t=$("#toast"); t.textContent=msg; t.className= err? "show err":"show"; setTimeout(()=>t.className="",2600); }
function modal(html){ const bg=$("#modal-bg"); bg.innerHTML=""; bg.appendChild(h('<div class="modal">'+html+'</div>')); bg.classList.add("show"); bg.onclick=e=>{ if(e.target===bg) closeModal(); }; }
function closeModal(){ $("#modal-bg").classList.remove("show"); $("#modal-bg").innerHTML=""; }
function notify(t,kind){ S.log.unshift({t,at:Date.now(),kind:kind||"info"}); save(); }
function regById(id){ return SEED.regs.find(r=>r.id===id); }
function product(id){ return S.products.find(p=>p.id===id); }
function draft(id){ return S.drafts.find(d=>d.id===Number(id)); }
function statusTo(d, st){ d.status=st; d.history.push({st,at:Date.now()}); save(); }
const ST_LABEL={draft:["초안","st-draft"],check:["근거확인 중","st-check"],review:["검수 대기","st-review"],ok:["승인","st-ok"],rej:["반려","st-rej"],sent:["발송됨","st-sent"]};
function pillOf(st){ const x=ST_LABEL[st]; return '<span class="pill '+x[1]+'">'+x[0]+'</span>'; }
function draftName(d){ const p=product(d.productId); if(d.kind==="label") return (d.ctr==="US"?"미국":"베트남")+" 라벨 — "+(p?p.name:""); return "바이어 답장 — "+(d.from||"문의"); }

/* ---------- 아이콘(선) ---------- */
const I={
 home:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3.5 10.5 12 3.5l8.5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 10v10.5h13V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 box:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3.5 7.5 12 3.5l8.5 4-8.5 4-8.5-4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.5 7.5V17l8.5 4 8.5-4V7.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 11.5V21" stroke="currentColor" stroke-width="1.8"/></svg>',
 book:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.5 19.5V5.5a2 2 0 0 1 2-2h13v15h-13a2 2 0 0 0-2 1.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 7.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 doc:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5.5" y="3.5" width="13" height="17" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M9 8.5h6M9 12.5h6M9 16.5h3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 check:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="m8.5 12.5 2.5 2.5 4.5-5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 gear:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 bell:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2.5H4.5L6 16z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

/* ---------- 성과 계산 (상태 전환 시각 — S-17) ---------- */
function perfCalc(){
 let doneCnt=0, minutes=0;
 S.drafts.forEach(d=>{
  const first=d.history[0], last=d.history[d.history.length-1];
  if(d.status==="ok"||d.status==="sent"){ doneCnt++; minutes += Math.max(5, Math.round((last.at-first.at)/60000)); }
 });
 return { doneCnt, minutes, inProg: S.drafts.filter(d=>!["sent"].includes(d.status)).length };
}

/* ---------- 라우터 ---------- */
window.addEventListener("hashchange", render);
function go(r){ location.hash=r; }
function route(){ return (location.hash||"").replace(/^#\/?/,"")||"home"; }

function render(){
 const app=$("#app");
 if(!S.user){ app.innerHTML=""; app.appendChild(viewLogin()); return; }
 const role=S.user.role;
 let r=route();
 if(role==="expert" && !["review","alerts"].includes(r.split("/")[0])) r="review";
 if(role==="mentor" && !["stats","alerts"].includes(r.split("/")[0])) r="stats";
 app.innerHTML="";
 const wrap=h('<div style="display:flex;width:100%"></div>');
 if(role==="ceo"||role==="staff") wrap.appendChild(sidebar(r));
 const main=h('<div class="main"></div>');
 wrap.appendChild(main);
 app.appendChild(wrap);
 main.appendChild(mobHead());
 if(role==="expert"||role==="mentor"){
  const bar=h('<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button class="btn ghost" id="x-lo">로그아웃</button></div>');
  bar.querySelector("#x-lo").onclick=()=>{ S.user=null; save(); render(); };
  main.appendChild(bar);
 }
 const seg=r.split("/");
 const views={ home:viewHome, products:viewProducts, kb:viewKB, create:viewCreate, review:viewReview, stats:viewStats, dict:viewDict, alerts:viewAlerts, draft:()=>viewDraft(seg[1]), send:()=>viewSend(seg[1]) };
 const v=(views[seg[0]]||viewHome)();
 main.appendChild(v);
 if(role==="ceo"||role==="staff") app.appendChild(tabbar(seg[0]));
 window.scrollTo(0,0);
}

/* ---------- 공통 틀 ---------- */
function sidebar(r){
 const items=[["home","홈",I.home],["products","제품 정보",I.box],["kb","지식베이스",I.book],["create","자료 만들기",I.doc],["review","검수·성과",I.check]];
 const sb=h('<aside class="sidebar"><div class="sb-logo"><h1>동선 수출 AI</h1><p>㈜동선식품 · 수출 현지화</p></div><nav class="sb-menu"></nav><div class="sb-spacer"></div><nav class="sb-menu bottom"></nav><div class="sb-user"><div class="avatar">'+esc(S.user.name[0])+'</div><div><b>'+esc(S.user.name)+'</b><span>'+esc(S.user.label)+'</span></div></div></aside>');
 const nav=sb.querySelector(".sb-menu");
 items.forEach(it=>{
  const b=h('<button class="sb-item'+(r.indexOf(it[0])===0?" active":"")+'">'+it[2]+'<span>'+it[1]+'</span></button>');
  b.onclick=()=>go(it[0]); nav.appendChild(b);
 });
 const bottom=sb.querySelector(".bottom");
 const g=h('<button class="sb-item'+(r==="dict"?" active":"")+'">'+I.gear+'<span>사전·설정</span></button>');
 g.onclick=()=>go("dict"); bottom.appendChild(g);
 const out=h('<button class="sb-item">'+I.bell+'<span>알림 '+(S.log.length? "· "+Math.min(S.log.length,9):"")+'</span></button>');
 out.onclick=()=>go("alerts"); bottom.appendChild(out);
 const lo=h('<button class="sb-item"><span style="opacity:.8">로그아웃</span></button>');
 lo.onclick=()=>{ S.user=null; save(); go("home"); render(); };
 bottom.appendChild(lo);
 return sb;
}
function mobHead(){
 const role=S.user.role;
 const el=h('<div class="mob-head"><div><b>'+esc(S.user.name)+(role==="expert"?" 전문가":role==="mentor"?" 멘토":" 대표님")+' 👋</b><span>동선 수출 AI</span></div><div class="sp"></div><button class="bell">'+I.bell+'</button></div>');
 el.querySelector(".bell").onclick=()=>go("alerts");
 return el;
}
function tabbar(r){
 const tb=h('<nav class="tabbar"></nav>');
 [["home","홈",I.home],["create","자료",I.doc],["alerts","알림",I.bell],["stats","성과",I.check]].forEach(it=>{
  const b=h('<button class="'+(r===it[0]?"on":"")+'">'+it[2]+'<span>'+it[1]+'</span></button>');
  b.onclick=()=>go(it[0]); tb.appendChild(b);
 });
 return tb;
}

/* ---------- 로그인 ---------- */
function viewLogin(){
 const v=h('<div class="login-wrap">\
  <div class="login-left"><div class="ov"></div><div class="inner"><div class="mark">동선</div><h2>수출 서류,<br>근거와 함께.</h2><p>라벨·상세페이지·바이어 답장의 초안을 AI가 규정 원문과 함께 만들어요. 확정은 언제나 사람이 합니다.</p><div class="chips"><span>미국·베트남 2개국</span><span>규정 16건 시드</span><span>월 28→14시간</span></div></div></div>\
  <div class="login-right"><div class="login-box">\
   <h2>로그인</h2><p>계정은 대표님이 만들어 드려요</p>\
   <div class="field"><label>아이디</label><input id="lg-id" placeholder="ceo / lee / expert / mentor"></div>\
   <div class="field" id="f-pw"><label>비밀번호</label><input id="lg-pw" type="password" placeholder="1234"><div class="err"></div></div>\
   <button class="btn vivid block" id="lg-btn">로그인</button>\
   <p class="hint" style="margin-top:10px">비밀번호를 잊으셨나요? 대표에게 문의해 주세요</p>\
   <div class="roles"><b>계정에 따라 처음 화면이 달라요</b>대표(ceo)·이사(lee) → 홈 · 전문가(expert) → 검수함 · 멘토(mentor) → 성과 보기 · 비밀번호는 모두 1234 (데모)</div>\
  </div></div></div>');
 let fails=0;
 const tryLogin=()=>{
  const id=v.querySelector("#lg-id").value.trim(), pw=v.querySelector("#lg-pw").value;
  const acc=SEED.accounts.find(a=>a.id===id && a.pw===pw);
  const f=v.querySelector("#f-pw");
  if(!acc){ fails++; f.classList.add("invalid");
   f.querySelector(".err").textContent= fails>=5 ? "잠시 잠겼어요 — 15분 뒤에 다시 시도할 수 있어요. 대표님께 알림을 보냈어요" : "비밀번호가 달라요. 다시 한번 확인해 주세요 ("+fails+"/5회)";
   return; }
  S.user=acc; save();
  go(acc.role==="expert"?"review": acc.role==="mentor"?"stats":"home");
  render();
 };
 v.querySelector("#lg-btn").onclick=tryLogin;
 v.querySelector("#lg-pw").addEventListener("keydown",e=>{ if(e.key==="Enter") tryLogin(); });
 return v;
}

/* ---------- 홈 ---------- */
function nextTask(){
 const d=S.drafts.find(x=>x.status==="check")||S.drafts.find(x=>x.status==="ok")||S.drafts.find(x=>x.status==="rej")||S.drafts.find(x=>x.status==="draft");
 return d;
}
function viewHome(){
 const v=h('<div></div>');
 const today=new Date();
 v.appendChild(h('<div class="topbar"><div><h2 class="page">안녕하세요, '+esc(S.user.name)+' 님 👋</h2><p class="page-sub">'+(today.getMonth()+1)+'월 '+today.getDate()+'일 · 수출 자료 '+perfCalc().inProg+'건이 움직이고 있어요</p></div><div class="sp"></div></div>'));
 const empty = S.drafts.length===0 && S.products.length===0;
 const d=nextTask();
 if(d){
  const msg = d.status==="check" ? "원문 대조를 기다리고 있어요" : d.status==="ok" ? "승인됐어요 — 발송만 남았어요" : d.status==="rej" ? "반려됐어요 — 사유를 보고 다시 만들어요" : "AI 초안을 확인해 주세요";
  const hero=h('<div class="hero"><div class="bg"></div><div class="ov"></div><div class="inner"><span class="chip">오늘 할 일 · 1건</span><h3>'+esc(draftName(d))+'이<br>'+msg+'</h3><p class="meta">'+pillOf(d.status)+' · '+ago(d.history[d.history.length-1].at)+'</p><div class="btns"><button class="btn ghostw" onclick="toast(\'다음에 다시 보여 드릴게요\')">나중에 볼게요</button><button class="btn vivid" id="hero-go">지금 확인하기</button></div></div></div>');
  hero.querySelector("#hero-go").onclick=()=> go(d.status==="ok"?"send/"+d.id:"draft/"+d.id);
  v.appendChild(hero);
 } else {
  const hero=h('<div class="hero empty"><div class="bg"></div><div class="ov"></div><div class="inner"><h3>아직 진행 중인 자료가 없어요</h3><p class="meta">제품을 고르면 AI가 라벨 초안부터 만들어 드려요</p><div class="btns"><button class="btn vivid" onclick="go(\'create\')">라벨 초안 만들기</button></div></div></div>');
  v.appendChild(hero);
 }
 const tiles=h('<div class="tiles"></div>');
 [["products","제품 정보","ic-box"],["kb","지식베이스","ic-book"],["create","자료 만들기","ic-doc"],["review","검수·성과","ic-check"]].forEach(t=>{
  const el=h('<div class="tile"><img class="chip3d" src="assets/'+t[2]+'.png"><span>'+t[1]+'</span></div>');
  el.onclick=()=>go(t[0]); tiles.appendChild(el);
 });
 v.appendChild(tiles);
 const pf=perfCalc();
 v.appendChild(h('<div class="promo"><div class="inner"><b>이번 달 현지화 시간 <em>절반으로 ↓</em></b><p>도입 전 28시간 → 목표 14시간 · 아낀 시간은 바이어 발굴에 (수치 예시)</p></div></div>'));
 v.appendChild(h('<div class="stats"><div class="cell"><b>'+pf.minutes+'분</b><span>자동 실측 누적</span></div><div class="div"></div><div class="cell"><b>'+pf.inProg+'건</b><span>진행 자료</span></div><div class="div"></div><div class="cell"><b>'+S.perf.contracts+'만원</b><span>분기 계약(예시)</span></div><div class="div"></div><div class="cell"><b>2개국</b><span>미국·베트남</span></div></div>'));
 const list=h('<div class="card"><div class="sec-title">진행 중 자료</div></div>');
 if(S.drafts.length===0) list.appendChild(h('<p class="hint">아직 없어요 — 자료 만들기에서 시작해요</p>'));
 S.drafts.slice().reverse().forEach(d2=>{
  const r=h('<div class="list-row click"><img class="thumb" src="assets/hero-snack.png"><div class="t"><b>'+esc(draftName(d2))+'</b><span>'+(d2.ctr==="US"?"미국":d2.ctr==="VN"?"베트남":"")+' · '+ago(d2.history[d2.history.length-1].at)+'</span></div>'+pillOf(d2.status)+'</div>');
  r.onclick=()=> go(d2.status==="ok"?"send/"+d2.id:"draft/"+d2.id);
  list.appendChild(r);
 });
 v.appendChild(list);
 return v;
}

/* ---------- 제품 정보 ---------- */
function viewProducts(){
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">제품 정보</h2><p class="page-sub">규격서 '+S.products.length+'건 · 초안의 유일한 재료 — AI는 여기 적힌 값만 써요</p></div><div class="sp"></div><button class="btn primary" id="p-new">+ 새 제품 추가</button></div>'));
 const row=h('<div class="row"></div>');
 const left=h('<div class="grow"></div>');
 S.products.forEach(p=>{
  const c=h('<div class="card" style="margin-bottom:14px;display:flex;gap:14px;align-items:center;cursor:pointer"><img class="thumb" style="width:56px;height:56px;border-radius:14px;object-fit:cover" src="assets/hero-snack.png"><div class="grow"><b style="font-size:15px">'+esc(p.name)+'</b><div class="hint">'+esc(p.type)+' · '+p.weight+'g · 알레르겐 '+(p.allergens.length?esc(p.allergens.join(" · ")):"없음")+'</div></div><span class="pill st-ok">영문 규격 완료</span></div>');
  c.onclick=()=>openProductForm(p);
  left.appendChild(c);
 });
 row.appendChild(left);
 v.appendChild(row);
 v.querySelector("#p-new").onclick=()=>openProductForm(null);
 return v;
}
function openProductForm(p){
 const dictOpts=S.dict.map(d=>'<option value="'+esc(d.ko)+'">'+esc(d.ko)+' → '+esc(d.en)+'</option>').join("");
 modal('<h3>'+(p?'제품 규격서 — '+esc(p.name):'새 제품 규격서')+'</h3><p class="m-body">성분·알레르겐은 사전에서만 골라요(직접 입력 금지 — S-05 원칙)</p>'+
  '<div class="field"><label>품목명(한글)</label><input id="pf-ko" value="'+(p?esc(p.name):"")+'"></div>'+
  '<div class="field" id="pf-en-f"><label>품목명(영문)</label><input id="pf-en" value="'+(p?esc(p.en):"")+'"><div class="err"></div></div>'+
  '<div class="field" id="pf-ing-f"><label>성분(사전에서 선택, 배합비 합계 100)</label><div id="pf-ings"></div><div style="display:flex;gap:8px;margin-top:6px"><select id="pf-sel" style="flex:1;background:var(--bg);border:0;border-radius:10px;padding:10px">'+dictOpts+'</select><input id="pf-pct" type="number" placeholder="%" style="width:80px;background:var(--bg);border:0;border-radius:10px;padding:10px"><button class="btn sub" id="pf-add">추가</button></div><div class="err"></div></div>'+
  '<div class="field"><label>중량(g) — oz 자동 환산</label><input id="pf-w" type="number" value="'+(p?p.weight:60)+'"></div>'+
  '<div class="hint" id="pf-alg" style="margin-bottom:12px"></div>'+
  '<div class="m-btns"><button class="btn sub" onclick="closeModal()">취소</button><button class="btn primary" id="pf-save">저장</button></div>');
 let ings = p? JSON.parse(JSON.stringify(p.ing)) : [];
 const paint=()=>{
  const box=$("#pf-ings"); box.innerHTML="";
  let sum=0;
  ings.forEach((i,idx)=>{ sum+=Number(i.pct)||0;
   const chip=h('<span class="pill spec-tag" style="margin:0 6px 6px 0;cursor:pointer">'+esc(i.ko)+' '+i.pct+'% ×</span>');
   chip.onclick=()=>{ ings.splice(idx,1); paint(); };
   box.appendChild(chip);
  });
  const algs=[...new Set(ings.map(i=>{const d=S.dict.find(x=>x.ko===i.ko);return d&&d.allergen?i.ko:null;}).filter(Boolean))];
  $("#pf-alg").innerHTML = algs.length? '알레르겐 자동: '+algs.map(a=>'<span class="pill warn-tag">'+esc(a)+' (해제 불가)</span>').join(" ")+' <span class="danger-note">— 성분에 있어 뺄 수 없어요</span>' : "알레르겐 자동: 해당 없음";
  box.dataset.sum=sum;
 };
 paint();
 $("#pf-add").onclick=()=>{ const ko=$("#pf-sel").value, pct=Number($("#pf-pct").value); if(!pct)return; ings.push({ko,pct}); $("#pf-pct").value=""; paint(); };
 $("#pf-save").onclick=()=>{
  const enF=$("#pf-en-f"), ingF=$("#pf-ing-f");
  enF.classList.remove("invalid"); ingF.classList.remove("invalid");
  const en=$("#pf-en").value.trim(); const ko=$("#pf-ko").value.trim();
  const bad=SEED.forbidden.find(w=>en.toLowerCase().includes(w));
  if(bad){ enF.classList.add("invalid"); enF.querySelector(".err").textContent='"'+bad+'"는 미국 라벨에서 문제가 될 수 있어요 — 금지표현'; return; }
  const sum=ings.reduce((a,b)=>a+Number(b.pct),0);
  if(Math.abs(sum-100)>0.5){ ingF.classList.add("invalid"); ingF.querySelector(".err").textContent="배합비 합계가 100%가 아니에요 (지금 "+sum+"%)"; return; }
  const algs=[...new Set(ings.map(i=>{const d=S.dict.find(x=>x.ko===i.ko);return d&&d.allergen?i.ko:null;}).filter(Boolean))];
  const doIt=()=>{
   if(p){ p.name=ko; p.en=en; p.ing=ings; p.weight=Number($("#pf-w").value)||60; p.allergens=algs; }
   else { S.products.push({id:Date.now(),name:ko,en,type:"과자",ing:ings,allergens:algs,weight:Number($("#pf-w").value)||60,keep:"실온",life:12}); }
   save(); closeModal(); toast("저장됐어요"); render();
  };
  if(p){
   const affected=S.drafts.filter(d=>d.productId===p.id && d.status!=="sent").length;
   if(affected>0){
    modal('<h3>규격서를 수정할까요?</h3><p class="m-body">이 규격서로 만든 자료 '+affected+'건에 다시 확인 필요 표시가 붙어요. 발송된 자료는 바뀌지 않아요.</p><div class="m-btns"><button class="btn sub" onclick="closeModal()">취소</button><button class="btn primary" id="pf-go">계속 수정하기</button></div>');
    $("#pf-go").onclick=()=>{ S.drafts.forEach(d=>{ if(d.productId===p.id && d.status!=="sent"){ d.recheck=true; } }); doIt(); };
    return;
   }
  }
  doIt();
 };
}

/* ---------- 지식베이스 ---------- */
function viewKB(){
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">지식베이스</h2><p class="page-sub">규정 '+SEED.regs.length+'건 시드(목표 40건) · 출처 필수 · 분기 개정 점검 12/15</p></div><div class="sp"></div><button class="btn primary" onclick="toast(\'문서 올리기는 데모에서 막아 뒀어요 — 출처 필수 검증 포함 예정\')">+ 규정 문서 올리기</button></div>'));
 const tabs=h('<div class="tabs"></div>');
 const v2=h('<div class="row"></div>');
 const left=h('<div class="grow"></div>');
 const right=h('<div class="card" style="width:380px;flex-shrink:0"></div>');
 let cur="US";
 const paint=()=>{
  tabs.innerHTML=""; left.innerHTML="";
  [["ALL","전체 "+SEED.regs.length],["US","미국 "+SEED.regs.filter(r=>r.ctr==="US").length],["VN","베트남 "+SEED.regs.filter(r=>r.ctr==="VN").length],["KR","공통 "+SEED.regs.filter(r=>r.ctr==="KR").length]].forEach(t=>{
   const b=h('<button class="tab'+(cur===t[0]?" on":"")+'">'+t[1]+'</button>');
   b.onclick=()=>{cur=t[0];paint();};
   tabs.appendChild(b);
  });
  SEED.regs.filter(r=>cur==="ALL"||r.ctr===cur).forEach(r=>{
   const row=h('<div class="list-row click"><img class="thumb" style="width:40px;height:40px;border-radius:10px" src="assets/ic-book.png"><div class="t"><b>'+esc(r.title)+'</b><span>'+esc(r.src)+' · 개정 '+esc(r.rev)+' · '+esc(r.use)+'</span></div></div>');
   row.onclick=()=>{ right.innerHTML='<div class="sec-title">'+esc(r.title)+'</div><div class="ev"><div class="bar"></div><div><p>“'+esc(r.body)+'”</p><div class="src">'+esc(r.src)+' · 개정 '+esc(r.rev)+'</div></div></div><p class="hint" style="margin-top:10px">이 규정을 인용한 자료 보기는 초안 화면의 근거 블록에서 연결돼요</p>';
   };
   left.appendChild(row);
  });
 };
 paint();
 right.innerHTML='<div class="sec-title">문서를 고르면 원문이 보여요</div><p class="hint">모든 문서에 출처·개정일이 붙어 있어요. 출처 없는 문서는 올릴 수 없어요.</p>';
 v.appendChild(tabs);
 v2.appendChild(left); v2.appendChild(right);
 v.appendChild(v2);
 v.appendChild(h('<div class="notice warn" style="margin-top:18px">🔔 분기 점검 — 12월 15일에 미국·베트남 규정 개정 여부를 확인할 차례예요 (20분이면 끝나요)</div>'));
 return v;
}

/* ---------- 자료 만들기 ---------- */
function viewCreate(){
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">자료 만들기</h2><p class="page-sub">AI는 검색·초안까지 — 근거 없는 문장은 쓰지 않아요</p></div></div>'));
 const tabs=h('<div class="tabs"><button class="tab on" id="t-label">라벨 표기 초안</button><button class="tab" id="t-reply">바이어 답장</button></div>');
 v.appendChild(tabs);
 const body=h('<div></div>'); v.appendChild(body);
 const paintLabel=()=>{
  body.innerHTML="";
  const opts=S.products.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("");
  const c=h('<div class="card" style="max-width:520px"><div class="sec-title">재료 고르기</div>\
   <div class="field"><label>제품</label><select id="c-p">'+opts+'</select></div>\
   <div class="field"><label>대상 국가</label><select id="c-ctr"><option value="US">미국</option><option value="VN">베트남</option></select></div>\
   <p class="hint" style="margin-bottom:12px">성분·중량은 제품 규격서에서 자동으로 와요. 여기서 고칠 수 없어요</p>\
   <button class="btn ai block" id="c-go">✦ AI 초안 만들기</button></div>');
  c.querySelector("#c-go").onclick=()=>{
   const p=product(Number(c.querySelector("#c-p").value)); const ctr=c.querySelector("#c-ctr").value;
   modal('<h3>초안을 만들고 있어요</h3><p class="m-body">보통 10초쯤 걸려요. 지식베이스에서 '+(ctr==="US"?"미국":"베트남")+' 규정을 찾는 중…</p><div class="progressbar"><i></i></div>');
   setTimeout(()=>{
    const d={ id:S.seq++, kind:"label", productId:p.id, ctr, fields:aiLabelDraft(p,ctr), history:[{st:"draft",at:Date.now()}], status:"draft" };
    S.drafts.push(d); notify("AI 초안 완성 — "+draftName(d),"ai"); save(); closeModal(); go("draft/"+d.id);
   },1400);
  };
  body.appendChild(c);
 };
 const paintReply=()=>{
  body.innerHTML="";
  const c=h('<div class="row"><div class="card" style="width:380px;flex-shrink:0"><div class="sec-title">들어가는 것</div>\
   <div class="field"><label>바이어 문의 (받은 내용 붙여넣기)</label><textarea id="r-q" rows="4" placeholder="예: 최소 주문 수량과 납기를 알려 주세요"></textarea></div>\
   <p class="hint" style="margin-bottom:12px">바이어 연락처·회사 정보는 입력하지 않아요 (개인정보 원칙)</p>\
   <button class="btn ai block" id="r-go">✦ 답장 초안 만들기</button>\
   <div style="margin-top:14px"><div class="sec-title" style="font-size:13px">받은 문의 예시</div><div id="r-samples"></div></div></div>\
   <div class="card grow" id="r-out"><div class="sec-title">AI 초안</div><p class="hint">문의를 넣으면 유형을 분류하고(S-19) 문안틀로 초안을 만들어요. 금지표현은 자동으로 빠져요.</p></div></div>');
  SEED.inquiries.forEach(q=>{
   const s=h('<div class="list-row click"><div class="t"><b>'+esc(q.from)+'</b><span>'+esc(q.text)+'</span></div></div>');
   s.onclick=()=>{ c.querySelector("#r-q").value=q.text; };
   c.querySelector("#r-samples").appendChild(s);
  });
  c.querySelector("#r-go").onclick=()=>{
   const q=c.querySelector("#r-q").value.trim(); if(!q){ toast("문의 내용을 넣어 주세요", true); return; }
   modal('<h3>초안을 만들고 있어요</h3><p class="m-body">문의 유형을 나누고 문안틀을 고르는 중…</p><div class="progressbar"><i></i></div>');
   setTimeout(()=>{
    closeModal();
    const r=aiReply(q);
    const out=c.querySelector("#r-out");
    let htm='<div class="sec-title">AI 초안 <span class="pill ai-tag">유형: '+esc(r.type)+'</span></div>';
    if(r.blockedAll){ htm+='<div class="notice danger"><b>통관 질의 — AI 생성 차단</b><p>'+esc(r.reply)+'</p></div>'; }
    else{
     htm+='<p style="background:var(--bg);border-radius:10px;padding:14px">'+esc(r.reply)+'</p>';
     if(r.blocked.length) htm+='<div class="notice danger" style="margin-top:10px"><b>금지표현 '+r.blocked.length+'건을 지웠어요</b><p>'+r.blocked.map(esc).join(", ")+' — 효능 표현(표시·광고법)</p></div>';
     htm+='<div class="ev"><div class="bar"></div><div><b>응답 근거 — Q&A 문안틀 + 거래 조건 저장값</b><p>MOQ·납기는 설정의 공장 저장값('+esc(SEED.factory.moq)+' · '+esc(SEED.factory.lead)+')에서 끼워 넣었어요 '+esc(SEED.factory.note)+'</p></div></div>';
     htm+='<button class="btn primary" style="margin-top:14px" id="r-send">검수 없이 발송 단계로 (답장은 통관 무관)</button>';
    }
    out.innerHTML=htm;
    const sb=out.querySelector("#r-send");
    if(sb) sb.onclick=()=>{
     const d={ id:S.seq++, kind:"reply", from:r.type, reply:r.reply, history:[{st:"draft",at:Date.now()},{st:"ok",at:Date.now()}], status:"ok" };
     S.drafts.push(d); save(); go("send/"+d.id);
    };
   },1200);
  };
  body.appendChild(c);
 };
 tabs.querySelector("#t-label").onclick=()=>{ tabs.querySelector("#t-label").classList.add("on"); tabs.querySelector("#t-reply").classList.remove("on"); paintLabel(); };
 tabs.querySelector("#t-reply").onclick=()=>{ tabs.querySelector("#t-reply").classList.add("on"); tabs.querySelector("#t-label").classList.remove("on"); paintReply(); };
 paintLabel();
 return v;
}

/* ---------- 초안 상세 (라벨 3단) ---------- */
function viewDraft(id){
 const d=draft(id); if(!d) return viewHome();
 if(d.kind==="reply") return viewSend(id);
 const p=product(d.productId);
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">'+esc(draftName(d))+'</h2><p class="page-sub">'+pillOf(d.status)+(d.recheck?' <span class="pill warn-tag">규격서가 바뀌어 다시 확인 필요</span>':"")+'</p></div></div>'));
 const steps=h('<div class="steps">'+
  '<div class="step'+(d.status==="draft"?" on":"")+'"><span class="n">1</span>초안 (AI)</div>'+
  '<div class="step'+(d.status==="check"?" on":"")+'"><span class="n">2</span>원문 대조 (담당자)</div>'+
  '<div class="step'+(["review","ok","rej"].includes(d.status)?" on":"")+'"><span class="n">3</span>전문가 검수</div></div>');
 v.appendChild(steps);
 const row=h('<div class="row"></div>');
 const col1=h('<div class="card grow"><div class="sec-title">라벨 초안 <span class="pill ai-tag">AI · 근거 병기</span></div></div>');
 d.fields.forEach(f=>{
  const miss=!f.v;
  const fld=h('<div class="lbl-field'+(miss?" missing":"")+'"><div class="k"><b>'+esc(f.k)+'</b><span class="pill '+(f.tag==="근거"?"ai-tag":f.tag==="규격서 값"?"spec-tag":"warn-tag")+'">'+esc(f.tag)+'</span></div><div class="v">'+(miss? esc(f.missing||"비워 둠 — 근거를 못 찾았어요") : esc(f.v))+'</div></div>');
  col1.appendChild(fld);
 });
 col1.appendChild(h('<p class="hint">근거를 못 찾은 칸은 AI가 채우지 않아요. 비워 두고 사람에게 넘깁니다</p>'));
 const col2=h('<div class="card" style="width:400px;flex-shrink:0"><div class="sec-title">근거 확인</div></div>');
 const regIds=[...new Set(d.fields.flatMap(f=>f.regs))];
 regIds.forEach(rid=>{
  const r=regById(rid);
  col2.appendChild(h('<div class="ev"><div class="bar"></div><div><b>'+esc(r.title)+'</b><p>“'+esc(r.body.slice(0,110))+'…”</p><div class="src">'+esc(r.src)+' · 지식베이스 #'+r.id+'</div></div></div>'));
 });
 if(d.status==="draft"){
  const b=h('<button class="btn primary block" style="margin-top:14px">원문 대조 시작하기</button>');
  b.onclick=()=>{ statusTo(d,"check"); toast("원문 대조 단계로 넘어갔어요"); render(); };
  col2.appendChild(b);
 } else if(d.status==="check"){
  const ok=h('<button class="btn vivid block" style="margin-top:14px">원문과 일치함 — 전문가 검수로</button>');
  ok.onclick=()=>{ statusTo(d,"review"); d.recheck=false; notify("검수 요청 — "+draftName(d)+" (전문가에게 알림)","review"); save(); toast("검수함으로 보냈어요 — 전문가에게 알림이 가요"); render(); };
  col2.appendChild(ok);
  const re=h('<button class="btn danger-ghost block" style="margin-top:10px">불일치 — 다시 생성</button>');
  re.onclick=()=>{
   modal('<h3>다시 생성할까요?</h3><p class="m-body">지적한 칸만 다시 만들고, 확정된 칸은 그대로 둬요.</p><div class="progressbar"><i></i></div>');
   setTimeout(()=>{ d.fields=aiLabelDraft(p,d.ctr); statusTo(d,"draft"); closeModal(); toast("다시 만들었어요"); render(); },1000);
  };
  col2.appendChild(re);
 } else if(d.status==="review"){
  col2.appendChild(h('<div class="notice info" style="margin-top:14px"><b>전문가 검수 중</b><p>권OO 전문가의 검수함에 들어가 있어요. 승인되면 알림으로 알려드려요.</p></div>'));
 } else if(d.status==="rej"){
  col2.appendChild(h('<div class="notice danger" style="margin-top:14px"><b>반려 — '+esc(d.rejReason||"")+'</b><p>'+esc(d.rejMemo||"")+' · 사유는 지식베이스에 쌓였어요</p></div>'));
  const re=h('<button class="btn ai block" style="margin-top:10px">✦ 사유 반영해 다시 생성</button>');
  re.onclick=()=>{ d.fields=aiLabelDraft(p,d.ctr); statusTo(d,"check"); toast("다시 만들었어요 — 원문 대조부터"); render(); };
  col2.appendChild(re);
 } else if(d.status==="ok"){
  const b=h('<button class="btn vivid block" style="margin-top:14px">발송 준비로 가기</button>');
  b.onclick=()=>go("send/"+d.id);
  col2.appendChild(b);
 }
 row.appendChild(col1); row.appendChild(col2);
 v.appendChild(row);
 return v;
}

/* ---------- 검수·성과 ---------- */
function viewReview(){
 const role=S.user.role;
 const v=h('<div></div>');
 const hrs=SEED.expertHours;
 v.appendChild(h('<div class="topbar"><div><h2 class="page">검수 · 성과</h2><p class="page-sub">'+(role==="expert"?("권OO 전문가 · 남은 계약 "+(hrs.total-hrs.used)+" / "+hrs.total+"시간"):"전문가 검수함과 사업 성과")+'</p></div></div>'));
 const inbox=h('<div class="card" style="margin-bottom:20px"><div class="sec-title">검수함</div></div>');
 const q=S.drafts.filter(d=>["review","rej"].includes(d.status) && d.kind==="label");
 if(q.length===0) inbox.appendChild(h('<div style="text-align:center;padding:26px 0"><img src="assets/ic-check.png" style="width:64px;height:64px;border-radius:18px;margin:0 auto 10px"><b style="display:block">다 보셨어요 ☕</b><span class="hint">새 요청이 오면 알림으로 알려드려요</span></div>'));
 q.forEach(d=>{
  const r=h('<div class="list-row"><img class="thumb" src="assets/hero-snack.png"><div class="t"><b>'+esc(draftName(d))+'</b><span>'+ago(d.history[d.history.length-1].at)+'</span></div>'+pillOf(d.status)+'</div>');
  if(d.status==="review" && (role==="expert"||role==="ceo")){
   const ap=h('<button class="btn vivid" style="padding:8px 14px">검수하기</button>');
   ap.onclick=()=>openReview(d);
   r.appendChild(ap);
  }
  inbox.appendChild(r);
 });
 v.appendChild(inbox);
 if(role!=="expert") v.appendChild(statsBlock());
 return v;
}
function openReview(d){
 const p=product(d.productId);
 const checks=[
  [true,"필수 항목 "+d.fields.length+"개 구성 (S-12 기준)"],
  [true,"인용 조항이 최신 개정판"],
  [p.allergens.length>0,"알레르겐 Contains 문구 — "+(p.allergens.length?"명시됨":"해당 없음")],
  [true,"금지표현 없음"],
  [!d.fields.some(f=>!f.v),"빈 칸 없음"+(d.fields.some(f=>!f.v)?" — Best Before 확인 필요":"")]
 ];
 modal('<h3>검수 — '+esc(draftName(d))+'</h3><p class="m-body">점검표는 규제 요건(S-12)에서 자동 생성돼요</p>'+
  checks.map(c=>'<div class="chk'+(c[0]?"":" warn")+'"><div class="dot">'+(c[0]?"✓":"!")+'</div><span>'+esc(c[1])+'</span></div>').join("")+
  '<div class="field" style="margin-top:12px"><label>반려하려면 사유를 골라 주세요 (반려 시 필수)</label><select id="rv-r"><option value="">— 사유 선택 —</option><option>근거 불일치</option><option>표기 형식</option><option>금지표현</option><option>기타</option></select></div>'+
  '<div class="field"><label>한 줄 설명</label><input id="rv-m" placeholder="지식베이스·금지목록에 그대로 쌓여요"></div>'+
  '<div class="m-btns"><button class="btn vivid" id="rv-ok">승인</button><button class="btn danger-ghost" id="rv-no">반려</button></div>');
 $("#rv-ok").onclick=()=>{ statusTo(d,"ok"); SEED.expertHours.used+=0.5; notify("전문가 승인 — "+draftName(d)+" · 발송만 남았어요","ok"); closeModal(); toast("승인했어요 — 대표님께 알림이 가요"); render(); };
 $("#rv-no").onclick=()=>{
  const r=$("#rv-r").value;
  if(!r){ toast("사유 없이 반려할 수 없어요", true); return; }
  const memo=$("#rv-m")?$("#rv-m").value:"";
  modal('<h3>정말 반려할까요?</h3><p class="m-body">적어 주신 사유가 담당자에게 그대로 전달되고, 지식베이스에 쌓여요</p><div class="notice danger"><b>'+esc(r)+'</b><p>'+esc(memo)+'</p></div><div class="m-btns"><button class="btn sub" id="rv-back">아니요, 돌아가기</button><button class="btn danger-ghost" id="rv-go">반려하기</button></div>');
  $("#rv-back").onclick=()=>openReview(d);
  $("#rv-go").onclick=()=>{ d.rejReason=r; d.rejMemo=memo; statusTo(d,"rej"); notify("반려 — "+draftName(d)+" · 사유: "+r,"rej"); closeModal(); toast("반려했어요 — 사유가 기록됐어요"); render(); };
 };
}
function statsBlock(){
 const pf=perfCalc();
 const el=h('<div></div>');
 el.appendChild(h('<div class="stats"><div class="cell"><b>'+pf.minutes+'분</b><span>처리 시간 자동 실측</span></div><div class="div"></div><div class="cell"><b>'+pf.doneCnt+'건</b><span>승인·발송 완료</span></div><div class="div"></div><div class="cell"><b>'+S.perf.contracts+'만원</b><span>분기 계약(예시)</span></div><div class="div"></div><div class="cell"><b>'+(SEED.expertHours.total-SEED.expertHours.used)+'h</b><span>전문가 잔여 시간</span></div></div>'));
 el.appendChild(h('<div class="card"><div class="sec-title">결과보고서</div><p class="hint" style="margin-bottom:12px">상태 전환 시각으로 자동 실측한 기록(타이머 없음 — S-17). 2개국 2품목 적용결과표로 내보내요.</p><button class="btn primary" id="st-x">적용결과표 내려받기 (CSV)</button></div>'));
 el.querySelector("#st-x").onclick=()=>{
  let csv="자료,상태,걸린 시간(분)\n";
  S.drafts.forEach(d=>{ const mins=Math.round((d.history[d.history.length-1].at-d.history[0].at)/60000); csv+=draftName(d)+","+ST_LABEL[d.status][0]+","+mins+"\n"; });
  const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent("﻿"+csv); a.download="적용결과표.csv"; a.click();
  toast("내려받았어요");
 };
 return el;
}
function viewStats(){
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">성과'+(S.user.role==="mentor"?" — 멘토 조회 전용":"")+'</h2><p class="page-sub">'+(S.user.role==="mentor"?"자료·제품 정보에는 접근할 수 없어요":"자동 집계")+'</p></div></div>'));
 v.appendChild(statsBlock());
 return v;
}

/* ---------- 발송 ---------- */
function viewSend(id){
 const d=draft(id); if(!d) return viewHome();
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">발송하기 — '+esc(draftName(d))+'</h2><p class="page-sub">'+pillOf(d.status)+' · 메일은 대표님 메일함에서 보내요(시스템이 직접 발송하지 않음)</p></div></div>'));
 const row=h('<div class="row"></div>');
 const body = d.kind==="reply"? d.reply : d.fields.map(f=>f.k+": "+(f.v||"(비움)")).join("\n");
 const left=h('<div class="card grow"><div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><img src="assets/ic-plane.png" style="width:40px;height:40px;border-radius:12px"><div class="sec-title" style="margin:0">보낼 내용</div></div><pre style="background:var(--bg);border-radius:10px;padding:14px;white-space:pre-wrap;font-family:inherit">'+esc(body)+'</pre><div style="display:flex;gap:10px;margin-top:14px"><button class="btn primary" id="s-copy">본문 복사하기</button><button class="btn ghost" id="s-dl">텍스트로 내려받기</button></div><p class="hint" style="margin-top:10px">대표님 메일에서 보낸 뒤, 오른쪽 "보냈어요"를 눌러 주세요</p></div>');
 left.querySelector("#s-copy").onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(body); toast("본문이 복사됐어요"); };
 left.querySelector("#s-dl").onclick=()=>{ const a=document.createElement("a"); a.href="data:text/plain;charset=utf-8,"+encodeURIComponent(body); a.download="발송본문.txt"; a.click(); };
 const right=h('<div class="card" style="width:380px;flex-shrink:0"><div class="sec-title">발송 확정</div></div>');
 if(d.status==="sent"){ right.appendChild(h('<div class="notice ok"><b>발송됨으로 기록됐어요</b><p>회신이 오면 기록해 주세요. 14일 무응답이면 후속 문안을 제안해 드려요.</p></div>')); }
 else{
  const b=h('<button class="btn vivid block">✓ 보냈어요로 기록하기</button>');
  b.onclick=()=>{
   modal('<img class="mi" src="assets/ic-plane.png"><h3>바이어에게 보냈나요?</h3><p class="m-body">네를 누르면 발송됨으로 기록되고 성과에 잡혀요. 아직이라면 나중에 눌러도 돼요.</p><div class="m-btns"><button class="btn sub" onclick="closeModal()">아직이에요</button><button class="btn vivid" id="s-yes">네, 보냈어요</button></div>');
   $("#s-yes").onclick=()=>{ statusTo(d,"sent"); notify("발송됨 — "+draftName(d),"sent"); closeModal(); toast("발송됨으로 기록했어요"); render(); };
  };
  right.appendChild(b);
  right.appendChild(h('<p class="hint" style="margin-top:10px">체크하지 않으면 발송됨으로 기록되지 않아요</p>'));
 }
 row.appendChild(left); row.appendChild(right);
 v.appendChild(row);
 return v;
}

/* ---------- 사전·설정 ---------- */
function viewDict(){
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">사전 · 설정</h2><p class="page-sub">성분·알레르겐·금지표현의 기준점 — 자료 화면에선 여기 없는 말을 쓸 수 없어요</p></div><div class="sp"></div><button class="btn primary" id="d-new">+ 새 낱말 올리기</button></div>'));
 const c=h('<div class="card" style="margin-bottom:18px"><div class="sec-title">성분 사전</div><table class="tbl"><tr><th>한글</th><th>영문 고정 표기</th><th>알레르겐</th></tr>'+S.dict.map(d=>'<tr><td>'+esc(d.ko)+'</td><td>'+esc(d.en)+'</td><td>'+(d.allergen?'<span class="pill warn-tag">'+esc(d.allergen)+'</span>':"—")+'</td></tr>').join("")+'</table></div>');
 v.appendChild(c);
 v.appendChild(h('<div class="row"><div class="card grow"><div class="sec-title">금지표현 ('+SEED.forbidden.length+')</div><p class="hint">'+SEED.forbidden.map(esc).join(" · ")+'</p><p class="danger-note" style="margin-top:8px">효능·치료 표현 — 생성 단계에서 자동 차단돼요</p></div><div class="card grow"><div class="sec-title">공장 저장값 (패킹·거래 조건)</div><p>'+esc(SEED.factory.carton)+'<br>20ft: '+esc(SEED.factory.container20)+' · MOQ '+esc(SEED.factory.moq)+'<br>'+esc(SEED.factory.lead)+' · '+esc(SEED.factory.incoterm)+'</p><p class="danger-note" style="margin-top:8px">'+esc(SEED.factory.note)+'</p></div></div>'));
 v.querySelector("#d-new").onclick=()=>{
  modal('<h3>사전에 새 낱말 올리기</h3><div class="field"><label>한글</label><input id="dn-ko" placeholder="예: 흑미"></div><div class="field"><label>영문 고정 표기</label><input id="dn-en" placeholder="예: Black rice"></div><div class="m-btns"><button class="btn sub" onclick="closeModal()">취소</button><button class="btn primary" id="dn-go">올리기</button></div>');
  $("#dn-go").onclick=()=>{ const ko=$("#dn-ko").value.trim(), en=$("#dn-en").value.trim(); if(!ko||!en){toast("둘 다 채워 주세요",true);return;} S.dict.push({ko,en,allergen:null}); save(); closeModal(); toast("올렸어요"); render(); };
 };
 return v;
}

/* ---------- 알림 ---------- */
function viewAlerts(){
 const v=h('<div></div>');
 v.appendChild(h('<div class="topbar"><div><h2 class="page">알림</h2><p class="page-sub">밤 9시~아침 8시 알림은 아침에 모아 보내드려요 (실서비스는 알림톡)</p></div></div>'));
 const c=h('<div class="card"></div>');
 if(S.log.length===0) c.appendChild(h('<p class="hint">알림이 없어요</p>'));
 S.log.slice(0,20).forEach(l=>{
  c.appendChild(h('<div class="list-row"><div class="t"><b>'+esc(l.t)+'</b><span>'+ago(l.at)+'</span></div></div>'));
 });
 v.appendChild(c);
 return v;
}

/* ---------- 시작 ---------- */
window.go=go; window.toast=toast; window.closeModal=closeModal;
render();
