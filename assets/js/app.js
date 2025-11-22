// 간단 유틸
const $id = (id) => document.getElementById(id);

// 상태
const App = {
  state: {
    selected: new Set(),
    currentCategory: 'head',
    gender: null,
    mode: null,
    previouslyFocused: null
  },
  data: {
    symptoms: {},
    diseaseMap: []
  }
};

// DOM 캐시
const symptomList = $id('symptomList');
const categoryRow = $id('categoryRow');
const quickSearch = $id('quickSearch');
const selectedChips = $id('selectedChips');
const btnGenerate = $id('btnGenerate');
const copyNote = $id('copyNote');
const detailModal = $id('detailModal');
const detailTitle = $id('detailTitle');
const detailContent = $id('detailContent');
const recommendedDiseases = $id('recommendedDiseases');
const advancedInput = $id('advancedInput');
const ageRange = $id('ageRange');
const ageNum = $id('ageNum');

// 데이터 로드 (상대경로 사용)
async function loadData(){
  try{
    const base = './';
    const [symRes, disRes] = await Promise.all([
      fetch(base + 'data/symptoms.json'),
      fetch(base + 'data/disease_map.json')
    ]);
    if(!symRes.ok || !disRes.ok){
      throw new Error(`fetch error: symptoms ${symRes.status}, disease_map ${disRes.status}`);
    }
    App.data.symptoms = await symRes.json();
    App.data.diseaseMap = await disRes.json();
    initUI();
  }catch(e){
    console.error('데이터 로드 실패(경로/파일/서버 확인 필요):', e);
    alert('데이터 로드에 실패했습니다. 개발자도구 Console/Network를 확인해 주세요.');
  }
}

// UI 초기화
function initUI(){
  const cats = Object.keys(App.data.symptoms);
  categoryRow.innerHTML = '';
  cats.forEach(cat=>{
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.dataset.cat = cat;
    btn.innerText = categoryLabel(cat);
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.cat-btn').forEach(b=>b.style.opacity = 0.6);
      btn.style.opacity = 1;
      App.state.currentCategory = cat;
      renderSymptoms(quickSearch.value || '');
    });
    categoryRow.appendChild(btn);
  });
  document.querySelectorAll('.cat-btn').forEach(b=>b.style.opacity = b.dataset.cat === App.state.currentCategory ? 1 : 0.6);
  renderSymptoms();
  refreshChips();
  bindControls();
}

// 카테고리 라벨
function categoryLabel(key){
  const map = {
    head: '머리/얼굴',
    neck: '목',
    upper: '상체(가슴/팔)',
    lower: '하체(복부/다리)',
    general: '전신',
    neuro: '신경계',
    ent: '이비인후과',
    derm: '피부과',
    gyn: '부인과',
    uro: '비뇨의학과',
    eye: '안과'
  };
  return map[key] || key;
}

// 렌더링
function renderSymptoms(filter=''){
  symptomList.innerHTML = '';
  const list = App.data.symptoms[App.state.currentCategory] || [];
  const lowerFilter = filter.trim().toLowerCase();
  const frag = document.createDocumentFragment();

  list.forEach((sym, idx)=>{
    if(lowerFilter && !sym.toLowerCase().includes(lowerFilter)) return;
    const label = document.createElement('label');
    label.className = 'symptom-item';
    const cbId = `sym_${App.state.currentCategory}_${idx}`;
    label.innerHTML = `<input id="${cbId}" type="checkbox" value="${sym}" aria-checked="${App.state.selected.has(sym)?'true':'false'}"> <div style="flex:1">${sym}</div>`;
    const input = label.querySelector('input');
    input.checked = App.state.selected.has(sym);

    input.addEventListener('change', (e)=>{
      if(e.target.checked) App.state.selected.add(sym);
      else App.state.selected.delete(sym);
      input.setAttribute('aria-checked', e.target.checked ? 'true' : 'false');
      refreshChips();
      updateRecommendations();
    });

    label.addEventListener('contextmenu', (ev)=>{
      ev.preventDefault();
      openDetail(sym, getSymptomDetail(sym));
      return false;
    });

    let touchTimer = null;
    label.addEventListener('touchstart', (ev)=>{
      if(ev.touches.length > 1) return;
      touchTimer = setTimeout(()=> openDetail(sym, getSymptomDetail(sym)), 600);
    });
    label.addEventListener('touchend', ()=>{ if(touchTimer) clearTimeout(touchTimer); });
    label.addEventListener('touchmove', ()=>{ if(touchTimer) clearTimeout(touchTimer); });

    frag.appendChild(label);
  });

  symptomList.appendChild(frag);
}

// 간단한 detail 텍스트(추가 가능)
function getSymptomDetail(sym){
  const details = {
    "기침(마른기침)":"기침의 종류를 명확히 하세요(마른기침/가래). 야간 기침·천명음·호흡곤란 여부 확인.",
    "기침(가래 동반)":"가래의 색(투명/황색/녹색/혈담)을 확인하세요. 혈담이면 추가 평가 필요.",
    "가래(색 변화: 투명/황색/녹색/혈담)":"녹색/노란색은 세균 감염 가능성, 혈담은 즉시 평가 권장."
  };
  return details[sym] || '';
}

// 칩 갱신
function refreshChips(){
  const container = selectedChips;
  container.innerHTML = '';
  if(App.state.selected.size === 0){
    container.innerHTML = '<div class="muted">선택된 증상이 없습니다.</div>';
    return;
  }
  App.state.selected.forEach(s => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.innerText = s;
    chip.setAttribute('aria-label', `${s} 제거`);
    chip.addEventListener('click', () => {
      App.state.selected.delete(s);
      document.querySelectorAll('#symptomList input[type="checkbox"]').forEach(inp=>{ if(inp.value === s) inp.checked = false; });
      refreshChips();
      updateRecommendations();
    });
    container.appendChild(chip);
  });
}

// 추천 의심질환 계산
function recommendDiseases(){
  const chosen = [...App.state.selected];
  const counter = new Map();
  App.data.diseaseMap.forEach(d=>{
    let score = 0;
    d.keywords.forEach(k=>{
      chosen.forEach(sym=>{
        if(sym.includes(k) || k.includes(sym) || sym.indexOf(k) !== -1) score += 1;
      });
    });
    if(score>0){
      counter.set(d.name, {info: d, score});
    }
  });
  const sorted = [...counter.values()].sort((a,b)=>b.score - a.score);
  return sorted.slice(0,5).map(x=>x.info);
}

// 추천 UI 업데이트
function updateRecommendations(){
  const recs = recommendDiseases();
  recommendedDiseases.innerHTML = '';
  if(recs.length === 0){
    recommendedDiseases.innerText = '추천 질환이 없습니다.';
    return;
  }
  recs.forEach(r=>{
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.type = 'button';
    btn.innerText = r.name + ' · ' + r.dept;
    btn.addEventListener('click', ()=>{
      btn.classList.toggle('active');
      btn.style.opacity = btn.classList.contains('active') ? 0.9 : 1;
    });
    recommendedDiseases.appendChild(btn);
  });
}

// 모달 포커스 트랩 (간단)
function trapFocus(modal){
  const focusable = modal.querySelectorAll('a[href], button, textarea, input, [tabindex]:not([tabindex="-1"])');
  if(!focusable.length) return ()=>{};
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function handleKey(e){
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    } else if(e.key === 'Escape'){ closeDetail(); }
  }
  modal.addEventListener('keydown', handleKey);
  return ()=> modal.removeEventListener('keydown', handleKey);
}

let untrap = null;
function openDetail(title, content){
  App.state.previouslyFocused = document.activeElement;
  detailTitle.innerText = title;
  if(typeof content === 'string') detailContent.innerText = content;
  else detailContent.innerText = '';
  detailModal.style.display = 'block';
  detailModal.setAttribute('aria-hidden','false');
  const closeBtn = detailModal.querySelector('.close');
  if(closeBtn) closeBtn.focus();
  untrap = trapFocus(detailModal);
}

function closeDetail(){
  detailModal.style.display = 'none';
  detailModal.setAttribute('aria-hidden','true');
  if(untrap){ untrap(); untrap = null; }
  if(App.state.previouslyFocused && App.state.previouslyFocused.focus) App.state.previouslyFocused.focus();
}

// 핸들러 바인딩
function bindControls(){
  const maleBtn = $id('maleBtn'), femaleBtn = $id('femaleBtn');
  const modeSimple = $id('modeSimple'), modeDeep = $id('modeDeep');

  if(maleBtn && femaleBtn){
    maleBtn.addEventListener('click', () => { maleBtn.classList.toggle('active', true); femaleBtn.classList.toggle('active', false); App.state.gender = '남'; });
    femaleBtn.addEventListener('click', () => { femaleBtn.classList.toggle('active', true); maleBtn.classList.toggle('active', false); App.state.gender = '여'; });
  }

  if(modeSimple && modeDeep){
    modeSimple.addEventListener('click', () => { modeSimple.classList.toggle('active', true); modeDeep.classList.toggle('active', false); App.state.mode = '간단'; });
    modeDeep.addEventListener('click', () => { modeDeep.classList.toggle('active', true); modeSimple.classList.toggle('active', false); App.state.mode = '정밀'; });
  }

  if(ageRange && ageNum){
    ageRange.addEventListener('input', () => { ageNum.value = ageRange.value; });
    ageNum.addEventListener('input', () => { ageRange.value = ageNum.value; });
  }

  if(quickSearch) quickSearch.addEventListener('input', (e) => renderSymptoms(e.target.value));

  const modalClose = detailModal.querySelector('.close');
  if(modalClose) modalClose.addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

  if(btnGenerate) btnGenerate.addEventListener('click', handleGenerate);
}

// handleGenerate: 텍스트 조합 및 복사(모달 대체 UI 포함)
async function handleGenerate(){
  const gender = App.state.gender || '미상';
  const age = ageNum.value || '미입력';
  const mode = App.state.mode || '미선택';
  const chronic = [];
  if($id('chronic1') && $id('chronic1').checked) chronic.push('고혈압');
  if($id('chronic2') && $id('chronic2').checked) chronic.push('당뇨');
  if($id('chronic3') && $id('chronic3').checked) chronic.push('심질환');

  const advanced = advancedInput ? advancedInput.value.trim() : '';
  const chosen = [...App.state.selected];
  const date = new Date().toLocaleString();

  const recButtons = recommendedDiseases.querySelectorAll('.chip');
  const chosenDiseases = [];
  recButtons.forEach(btn=>{
    if(btn.classList.contains('active')) {
      const name = btn.innerText.split('·')[0].trim();
      chosenDiseases.push(name);
    }
  });
  const autoRecs = recommendDiseases().slice(0,3).map(d=>d.name);
  const finalDiseases = chosenDiseases.length ? chosenDiseases : autoRecs;

  const depts = new Set();
  App.data.diseaseMap.forEach(d=>{
    if(finalDiseases.includes(d.name)) depts.add(d.dept);
  });

  let text = `생성일: ${date}\n\n[기본정보]\n- 성별: ${gender}\n- 나이: ${age}\n- 검사모드: ${mode}\n- 기저질환: ${chronic.length ? chronic.join(', ') : '없음'}\n\n[선택 증상]\n`;
  if(chosen.length) text += chosen.map(s=>`- ${s}`).join('\n') + '\n';
  else text += '- 없음\n';
  text += `\n[추가 입력]\n${advanced ? advanced : '없음'}\n\n[의심 질환(추천)]\n`;
  text += finalDiseases.length ? finalDiseases.map(d=>`- ${d}`).join('\n') + '\n' : '- 없음\n';
  text += `\n[권장 진료과]\n${[...depts].length ? [...depts].map(d=>`- ${d}`).join('\n') : '- 일반 외래(필요시 응급평가)'}\n\n`;
  text += `[요청]\n위 정보를 바탕으로 다음을 알려주세요:\n1) 가능한 진단(상위 5개)과 각각의 근거(증상과의 연결)\n2) 응급 여부 판단 기준(언제 즉시 응급실로 가야 하는지)\n3) 우선순위 검사(1→2→3)와 각 검사의 목적\n4) 환자가 의료진에게 할 핵심 문장 3개\n5) 권장 진료과(과명) 및 이유(한 문장)\n\n참고: 이 도구는 의학적 진단을 대신하지 않으며, 응급 증상(호흡곤란·의식저하·심한 흉통 등)이 있으면 즉시 응급실로 가야 합니다.`;

  try{
    await navigator.clipboard.writeText(text);
    showCopyNote(true);
  }catch(e){
    showCopyNote(false, '클립보드 복사 실패');
    openDetail('GPT에 붙여넣을 텍스트', '');
    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.minHeight = '220px';
    textarea.value = text;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'generate-fallback';
    btn.innerText = '텍스트 복사';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        showCopyNote(true);
      } catch (err) {
        textarea.select();
        showCopyNote(false, '자동 복사 불가 — Ctrl/Cmd+C로 복사하세요.');
      }
    });
    detailContent.innerHTML = '';
    detailContent.appendChild(textarea);
    detailContent.appendChild(document.createElement('br'));
    detailContent.appendChild(btn);
    detailTitle.innerText = 'GPT에 붙여넣을 텍스트 (수동복사)';
    return;
  }

  openDetail('GPT에 붙여넣을 텍스트', text);
  detailTitle.innerText = 'GPT에 붙여넣을 텍스트';
}

// 복사 노트 표시
function showCopyNote(success=true, msg=''){
  copyNote.style.display = 'block';
  copyNote.innerText = success ? '복사 완료 — GPT창에 붙여넣기 하세요.' : (msg || '복사 실패 — 아래에서 수동으로 복사하세요.');
  copyNote.style.background = success ? '#e6f7ea' : '#fff4e5';
  setTimeout(()=> copyNote.style.display = 'none', 3200);
}

// 초기화
document.addEventListener('DOMContentLoaded', ()=>{
  loadData();
});
