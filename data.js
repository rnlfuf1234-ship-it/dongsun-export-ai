/* 동선 수출 AI — 시드 데이터 (전부 예시값, S-25 가정값 포함) */
const SEED = {
accounts: [
 { id:"ceo",    pw:"1234", name:"오지훈",  role:"ceo",    label:"대표 · 총괄" },
 { id:"lee",    pw:"1234", name:"오동선",  role:"staff",  label:"이사 · 영업" },
 { id:"expert", pw:"1234", name:"권OO",   role:"expert", label:"외부 전문가 · 식품 표시" },
 { id:"mentor", pw:"1234", name:"권한솔",  role:"mentor", label:"멘토 · 더블유포지션" }
],
expertHours: { total:14, used:5.5 },

dict: [
 { ko:"쌀", en:"Rice", allergen:null },
 { ko:"미강(쌀 부산물)", en:"Rice bran", allergen:null },
 { ko:"현미유", en:"Rice bran oil", allergen:null },
 { ko:"설탕", en:"Sugar", allergen:null },
 { ko:"소금", en:"Salt", allergen:null },
 { ko:"밀", en:"Wheat", allergen:"Wheat" },
 { ko:"새우", en:"Shrimp", allergen:"Shrimp (Crustacean Shellfish)" }
],
forbidden: ["healthy","cure","cures","treat","treats","helps digestion","diet","weight loss","immune","면역","치료","다이어트"],

regs: [
 { id:1,  ctr:"US", title:"표시 위치 — 21 CFR 101.1·101.2", body:"Principal display panel: the part of a label most likely to be shown to the consumer at retail…", src:"미국 eCFR", rev:"2025-11", use:"라벨 배치" },
 { id:2,  ctr:"US", title:"제품명 표기 — 21 CFR 101.3", body:"The principal display panel shall bear a statement of the identity of the commodity: the common or usual name of the food…", src:"미국 eCFR", rev:"2025-06", use:"라벨 Product Name" },
 { id:3,  ctr:"US", title:"성분표 — 21 CFR 101.4", body:"Ingredients shall be listed by common or usual name in descending order of predominance by weight…", src:"미국 eCFR", rev:"2025-06", use:"라벨 Ingredients" },
 { id:4,  ctr:"US", title:"제조·유통자 — 21 CFR 101.5", body:"The label shall specify the name and place of business of the manufacturer, packer, or distributor…", src:"미국 eCFR", rev:"2024-12", use:"라벨 Manufacturer" },
 { id:5,  ctr:"US", title:"영양성분 — 21 CFR 101.9 (2016 서식)", body:"Nutrition information shall be provided for all products intended for human consumption… Calories shall be highlighted.", src:"미국 eCFR", rev:"2026-01", use:"라벨 Nutrition Facts" },
 { id:6,  ctr:"US", title:"내용량 — 21 CFR 101.105", body:"The declaration of net quantity shall appear in both metric (g) and U.S. customary (oz) units on the principal display panel…", src:"미국 eCFR", rev:"2025-03", use:"라벨 Net Wt" },
 { id:7,  ctr:"US", title:"글자 크기·명료성 — 21 CFR 101.15", body:"Words, statements and other information required shall appear prominently and conspicuously…", src:"미국 eCFR", rev:"2024-09", use:"라벨 검토" },
 { id:8,  ctr:"US", title:"알레르겐 표시 — FALCPA + FASTER Act", body:"Major food allergens: milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans, and sesame. Declare with a 'Contains' statement…", src:"미국 FDA", rev:"2025-07", use:"라벨 Allergens" },
 { id:9,  ctr:"US", title:"수입식품 사전신고·시설 등록", body:"Prior Notice must be submitted to FDA before food is imported… Food facility registration is required.", src:"미국 FDA", rev:"2025-10", use:"바이어 Q&A" },
 { id:10, ctr:"VN", title:"상품 라벨 — 시행령 43/2017/ND-CP", body:"수입 상품에는 베트남어 보조라벨을 부착해야 하며, 그 의무는 수입자에게 있다. 원라벨의 필수 정보는 유지되어야 한다…", src:"베트남 정부 관보", rev:"2025-12", use:"라벨 · 수입자 안내" },
 { id:11, ctr:"VN", title:"43호 개정 — 시행령 111/2021/ND-CP", body:"원산지 표기와 수입자 정보 표기 요건을 개정… 날짜는 일/월/년(dd/mm/yyyy) 순으로 표기한다.", src:"베트남 정부 관보", rev:"2025-12", use:"라벨 날짜" },
 { id:12, ctr:"VN", title:"영양표시 — 통달 29/2023/TT-BYT", body:"가공식품의 영양성분 표시를 단계적으로 의무화… 에너지, 단백질, 탄수화물, 지방, 나트륨.", src:"베트남 보건부", rev:"2025-08", use:"라벨 영양" },
 { id:13, ctr:"VN", title:"수입식품 신고 절차", body:"수입 식품은 공고된 절차에 따라 자가적합선언 또는 등록을 거쳐야 한다…", src:"베트남 보건부·산업무역부", rev:"2025-05", use:"바이어 Q&A" },
 { id:14, ctr:"KR", title:"글로벌 식품법령·기준규격 정보시스템", body:"수출국별 식품 법령·기준규격 정보를 제공하는 공식 창구.", src:"식품안전정보원", rev:"상시", use:"수집 창구" },
 { id:15, ctr:"KR", title:"국가별 수출 정보 (미국·베트남)", body:"국가별 시장·통관·표시 요건 요약 정보.", src:"KATI (aT)", rev:"상시", use:"시장·규제 요약" },
 { id:16, ctr:"US", title:"원산지 표기 — Product of Korea", body:"Imported articles shall be marked with the English name of the country of origin…", src:"미국 CBP", rev:"2024-06", use:"라벨 원산지" }
],

templates: ["제품소개(1장)","상세페이지(B2B)","바이어 제안서","이메일","Q&A","라벨 표기"],

products: [
 { id:1, name:"쌀 튀김누룽지 스낵", en:"Rice Nurungji Snack", type:"과자",
   ing:[{ko:"쌀",pct:60},{ko:"현미유",pct:20},{ko:"미강(쌀 부산물)",pct:12},{ko:"설탕",pct:5},{ko:"소금",pct:3}],
   allergens:["밀","새우"], weight:60, keep:"직사광선을 피해 실온 보관", life:12 },
 { id:2, name:"쌀꽃새우튀김", en:"Rice Flower Shrimp Fritter", type:"냉동 HMR",
   ing:[{ko:"쌀",pct:45},{ko:"새우",pct:30},{ko:"밀",pct:15},{ko:"현미유",pct:7},{ko:"소금",pct:3}],
   allergens:["새우","밀"], weight:300, keep:"-18°C 이하 냉동 보관", life:18 }
],

factory: { carton:"20개입 · 350×250×300mm · 1.4kg", container20:"1,850카톤", moq:"500카톤", lead:"발주 확정 후 3주", incoterm:"FOB Busan",
  note:"※ 가정값(S-25) — 공장 실측 확보 시 교체" },

inquiries: [
 { id:1, from:"H마트 구매팀", text:"최소 주문 수량과 납기를 알려 주세요.", type:"가격·MOQ", date:"2026-11-20" },
 { id:2, from:"베트남 신규 바이어", text:"HACCP 인증서와 성분서를 보내 주실 수 있나요?", type:"인증·서류", date:"2026-11-18" }
]
};

/* "AI" 라벨 초안 생성 — 규정 매핑 기반 시뮬레이션. 근거 없으면 공란(S-21 규칙) */
function aiLabelDraft(product, ctr){
 const dict = {}; SEED.dict.forEach(d=>dict[d.ko]=d);
 const ingEn = product.ing.map(i=>{
   const e = dict[i.ko] ? dict[i.ko].en : null;
   return e ? e + " " + i.pct + "%" : null;
 });
 const unknownIng = ingEn.some(x=>x===null);
 const algEn = product.allergens.map(a=> dict[a] && dict[a].allergen ? dict[a].allergen : null).filter(Boolean);
 const oz = (product.weight*0.03527).toFixed(1);
 const fields = [
  { k:"Product Name", v:product.en, tag:"근거", regs:[2], from:"spec-ai" },
  { k:"Ingredients", v: unknownIng ? "" : ingEn.join(", "), tag:"규격서 값", regs:[3], from:"spec",
    missing: unknownIng ? "사전에 없는 성분이 있어요 — 사전 등록 후 다시 생성" : null },
  { k:"Allergens", v: algEn.length? "Contains " + algEn.join(", ") : "해당 없음", tag:"규격서 값", regs:[8], from:"spec" },
  { k:"Net Wt", v: oz + " oz (" + product.weight + " g)", tag:"근거", regs:[6], from:"ai" },
  { k:"Origin", v:"Product of Korea", tag:"근거", regs: ctr==="US"?[16]:[11], from:"ai" },
  { k:"Best Before", v:"", tag:"확인 필요", regs:[], from:"none",
    missing: ctr==="US" ? "주(州)별 권장 방식이 달라 근거를 못 찾았어요 — 전문가 확인" : "일/월/년 순 표기 — 서식 확정 전 전문가 확인" }
 ];
 if(ctr==="VN"){ fields.push({ k:"보조라벨(베트남어)", v:"수입자 부착 — 당사는 영문 원라벨과 성분·알레르겐 정보만 제공", tag:"근거", regs:[10], from:"ai" }); }
 return fields;
}

/* "AI" 답장 생성 — 유형 분류 + 금지표현 차단 */
function aiReply(text){
 const t = text.toLowerCase();
 let type="기타", reply="", regs=[], blocked=[];
 if(/통관|관세|customs|승인되나|가능한가/.test(t)){
   return { type:"통관·라벨", blockedAll:true,
     reply:"통관 가능 여부는 AI가 답하지 않아요. '전문가 확인 후 회신드릴게요' 안내가 대신 발송되고, 전문가에게 전달됐어요.", regs:[9,13], blocked:[] };
 }
 if(/moq|수량|납기|리드|lead|주문/.test(t)){ type="가격·MOQ";
   reply="Dear buyer, thank you for your inquiry. Our MOQ is "+SEED.factory.moq+" and standard lead time is "+SEED.factory.lead+", as our automated line produces 3 tons daily. Terms: "+SEED.factory.incoterm+"."; regs=[]; }
 else if(/인증|haccp|성분서|서류|certificate/.test(t)){ type="인증·서류";
   reply="Please find attached our HACCP certificate and product specification sheet. All documents are issued in English."; regs=[]; }
 else if(/샘플|sample/.test(t)){ type="샘플";
   reply="We would be glad to send samples. Please share your shipping address; samples are dispatched within 5 business days."; regs=[]; }
 else { reply="Thank you for reaching out. We will review your request and get back to you within 24 hours."; }
 // 금지표현 차단 시뮬레이션
 SEED.forbidden.forEach(w=>{ if(t.includes(w)) blocked.push(w); });
 return { type, reply, regs, blocked, blockedAll:false };
}
