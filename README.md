<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>체크메이트 — AI 건강 자가진단 (텍스트 기반)</title>
<style>
  :root{
    --bg:#f3f6ff;
    --card:#ffffffc9;
    --primary:#3f6cff;
    --accent:#6ea8ff;
    --muted:#6b7280;
    --danger:#d9534f;
    --chip-bg:#e9f0ff;
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:Inter, "Noto Sans KR", system-ui, -apple-system, Arial;background:var(--bg);color:#0b1220}
  .wrap{max-width:1100px;margin:26px auto;padding:18px}
  header{display:flex;align-items:center;gap:12px;justify-content:space-between;margin-bottom:18px}
  .brand{display:flex;gap:12px;align-items:center}
  .logo{width:56px;height:56px;border-radius:10px;object-fit:cover;box-shadow:0 6px 20px rgba(17,24,39,.06)}
  h1{margin:0;font-size:20px;color:var(--primary)}
  .subtitle{color:var(--muted);font-size:13px}
  .layout{display:grid;grid-template-columns:360px 1fr 280px;gap:18px}
  @media(max-width:1080px){.layout{grid-template-columns:1fr;}}
  .card{background:var(--card);backdrop-filter: blur(6px);padding:14px;border-radius:12px;box-shadow:0 8px 30px rgba(12,18,36,.06)}
  .muted{color:var(--muted)}
  .section-title{font-weight:700;margin-bottom:8px}
  .row{display:flex;gap:8px;flex-wrap:wrap}
  .gender-btn, .mode-btn{padding:10px 12px;border-radius:10px;border:1px solid rgba(12,18,36,.06);background:white;cursor:pointer}
  .gender-btn.active, .mode-btn.active{background:var(--primary);color:#fff;border-color:var(--primary);box-shadow:0 6px 20px rgba(63,108,255,.15)}
  input[type=number]{width:110px;padding:8px;border-radius:8px;border:1px solid #e6eefc}
  .range{width:160px}
  .searchbar{width:100%;padding:10px;border-radius:10px;border:1px solid #e6eefc;margin-bottom:10px}
  .category-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  .cat-btn{padding:8px 10px;border-radius:999px;background:#f3f6ff;color:var(--primary);font-weight:700;border:none;cursor:pointer}
  .symptom-list{max-height:460px;overflow:auto;padding-right:6px}
  .symptom-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;background:#fbfdff;margin-bottom:8px;cursor:pointer;border:1px solid rgba(12,18,36,.03)}
  .symptom-item:hover{transform:translateY(-2px)}
  .symptom-item input{width:18px;height:18px}
  .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
  .chip{background:var(--chip-bg);color:var(--primary);padding:6px 10px;border-radius:999px;font-weight:700;cursor:pointer}
  .ad-slot{background:#fffbe6;border:1px dashed #ffd966;padding:12px;border-radius:10px;text-align:center;color:#704800;margin-top:12px}
  .detail-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:760px;max-width:94%;background:white;padding:18px;border-radius:12px;box-shadow:0 20px 60px rgba(2,6,23,.35);display:none;z-index:1200}
  .detail-modal .title{font-weight:800;margin-bottom:8px}
  .detail-modal .content{max-height:420px;overflow:auto;padding:8px;border-radius:8px;border:1px solid #f0f4ff;background:#fbfdff}
  .detail-modal .close{position:absolute;right:12px;top:12px;border:none;background:transparent;font-size:18px;cursor:pointer}
  .footer{margin-top:18px;text-align:center;color:var(--muted);font-size:13px}
  .generate-btn{margin-top:10px;padding:12px 16px;border-radius:10px;background:linear-gradient(90deg,var(--primary),var(--accent));color:white;border:none;cursor:pointer;font-weight:700}
  .copy-note{margin-top:8px;color:#0a6d25;background:#e6f7ea;padding:8px;border-radius:8px;display:none}
  .muted.small{font-size:12px;color:var(--muted)}
  textarea#advancedInput{width:100%;height:120px;border-radius:10px;border:1px solid #e6eefc;padding:10px;resize:vertical}
  button.generate-fallback{margin-top:8px;padding:8px 10px;border-radius:8px;background:#3f6cff;color:#fff;border:none;cursor:pointer}
  .sr-only{position:absolute!important;height:1px;width:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}
</style>
</head>
<body>
<div class="wrap">

  <header>
    <div class="brand">
      <img class="logo" src="/mnt/data/A_2D_digital_illustration_depicts_a_gender_selecti.png" alt="logo">
      <div>
        <h1>AI 건강 자가진단 (텍스트)</h1>
        <div class="subtitle">증상 선택 → GPT에 붙여넣기용 정리 텍스트 자동 생성</div>
      </div>
    </div>
    <div class="muted small">본 도구는 의학적 진단 도구가 아닙니다.</div>
  </header>

  <div class="layout">

    <!-- LEFT: 설정 -->
    <div class="card">
      <div class="section-title">1) 검사 설정</div>

      <div style="margin-bottom:10px">
        <div class="muted">검사 난이도</div>
        <div class="row" style="margin-top:8px">
          <button class="mode-btn" id="modeSimple">간단 검사</button>
          <button class="mode-btn" id="modeDeep">정밀 검사</button>
        </div>
      </div>

      <div style="margin-top:12px">
        <div class="muted">성별</div>
        <div class="row" style="margin-top:8px">
          <button class="gender-btn" id="maleBtn">남자</button>
          <button class="gender-btn" id="femaleBtn">여자</button>
        </div>
      </div>

      <div style="margin-top:12px">
        <div class="muted">나이</div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
          <input type="range" id="ageRange" min="0" max="120" value="30" class="range">
          <input type="number" id="ageNum" min="0" max="120" value="30">
        </div>
      </div>

      <div style="margin-top:12px">
        <div class="muted">기저질환(선택)</div>
        <div class="row" style="margin-top:8px">
          <label><input type="checkbox" id="chronic1"> 고혈압</label>
          <label><input type="checkbox" id="chronic2"> 당뇨</label>
          <label><input type="checkbox" id="chronic3"> 심질환</label>
        </div>
      </div>

      <div style="margin-top:14px">
        <div class="section-title">선택한 증상</div>
        <div id="selectedChips" class="chips">
          <!-- chips 추가 -->
        </div>

        <div style="margin-top:10px">
          <button class="generate-btn" id="btnGenerate">GPT에 보낼 내용 만들기 (복사)</button>
          <div id="copyNote" class="copy-note">복사 완료 — GPT창에 붙여넣기 하세요.</div>
        </div>
      </div>

      <div class="ad-slot" style="margin-top:16px">광고 슬롯 (좌측 하단)</div>
    </div>

    <!-- CENTER: 증상 검색 + 리스트 -->
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div class="section-title">2) 증상 선택 (카테고리 최소화)</div>
          <div class="muted">카테고리 선택 → 아래에서 세부 증상 체크 (우클릭 또는 롱프레스 = 자세히 보기)</div>
        </div>
        <div style="display:flex;gap:8px">
          <input id="quickSearch" class="searchbar" placeholder="증상검색 (예: 두통, 복통, 어지러움)" />
        </div>
      </div>

      <div class="category-row" id="categoryRow">
        <button class="cat-btn" data-cat="head">머리/얼굴</button>
        <button class="cat-btn" data-cat="neck">목</button>
        <button class="cat-btn" data-cat="upper">상체(가슴/팔)</button>
        <button class="cat-btn" data-cat="lower">하체(복부/다리)</button>
        <button class="cat-btn" data-cat="general">전신</button>
      </div>

      <div class="symptom-list" id="symptomList" tabindex="0">
        <!-- 세부 증상이 여기 렌더링 됨 -->
      </div>

      <div style="margin-top:12px" class="muted">우클릭(오른쪽 클릭) 또는 모바일에서 롱프레스 → 증상별 상세 설명 보기</div>
    </div>

    <!-- RIGHT: 고급 입력 & 광고 -->
    <div class="card">
      <div class="section-title">3) 고급 입력</div>
      <div class="muted">직접 증상을 입력하거나, 선택 항목을 조합해 설명할 수 있습니다.</div>
      <textarea id="advancedInput" placeholder="예: 2주전부터 시작한 지속적 오른쪽 편두통, 어지럼 동반..."></textarea>

      <div style="margin-top:12px" class="section-title">광고(우측)</div>
      <div class="ad-slot">광고 슬롯 (우측)</div>
    </div>

  </div>

  <footer class="footer-muted footer">
    이 도구는 의학적 진단을 제공하지 않습니다. 긴급 상황(호흡곤란, 의식 소실, 심한 흉통 등) 시 즉시 응급실을 방문하세요.
  </footer>

</div>

<!-- 상세보기 모달 -->
<div id="detailModal" class="detail-modal" role="dialog" aria-hidden="true" aria-labelledby="detailTitle" aria-describedby="detailContent">
  <button class="close" aria-label="닫기 (모달)" title="닫기">✕</button>
  <div class="title" id="detailTitle"></div>
  <div class="content" id="detailContent"></div>
</div>

<script>
/* ---------------------------
   간단한 데이터(샘플) - 실제로는 더 많은 항목으로 교체하세요
--------------------------- */
const SYMPTOMS = { head: [ "일반 두통(압박감)","편두통(한쪽 맥동성 통증)","긴장성 두통(목·어깨 동반)","후두부 통증", "전두부(이마) 통증","한쪽 얼굴 통증","안구통(눈 뒤 통증)","시야 흐림/시야 결손", "이명(귀 울림)","광과민성(빛·소리 민감)","두통 + 구역감/구토","두통 + 발열", "의식 저하 또는 혼미 (응급)","뇌졸중 의심 증상(한쪽 마비/언어장애)","안면 마비/얼굴 감각 이상", "턱 통증(저작 시 통증)","머리 외상 후 지속적 통증","두통으로 인한 수면장애","편두통 전조 증상(오라)" ], neck: [ "목 통증(뻣뻣함)","목 움직임 제한","목에서 어깨로 퍼지는 통증","경추성 두통", "인후통/삼킴 곤란","목 부위 종창(혹/부음)","목 소리(딱딱거림) 및 클릭","목 통증 + 팔 저림", "갑상선 부위 통증/혹 느낌","목 졸림감/숨막힘 느낌","목 근육 경련","목 관련 어지러움" ], upper: [ "가슴 답답함(압박감)","흉통(압박/칼로 찌르는 듯)","운동 시 호흡곤란","휴식 시 숨참/호흡곤란", "기침(마른기침)","기침(가래 동반)","가래(색 변화: 투명/황색/녹색/혈담)","급성 호흡곤란(응급)", "기침과 발열 동반","심계항진(두근거림)","실신/현기증(심혈관 관련 의심)","어깨 통증", "팔 저림/무감각","가슴 통증 + 식은땀(응급 가능성)","쉰 목소리/발성 변화" ], lower: [ "복부 통증(명치·상복부)","하복부 통증(골반 쪽)","급성 복통(심한 통증)","복부 팽만/가스", "속쓰림·역류(위·식도 관련)","구토/구역감(지속성)","설사(혈변 포함)","변비(장폐색 의심 포함)", "소화불량/식욕저하","배뇨 이상(빈뇨·배뇨통·잔뇨감)","혈뇨(소변에 피)","골반통(여성 생식기 관련)", "생리 관련 통증(과다/불규칙)","복부 국소 압통(촉진 시 통증)","복부 팽만 + 숨참" ], general: [ "전신 쇠약감(심한 피로)","발열(미열~고열)","오한·발한(야간 발한 포함)","체중 감소(이유 불명)", "식욕 변화(저하/증가)","전신 통증/근육통","관절통(부종 동반)","광범위 발진(피부 변화)", "가려움(전신 또는 국소)","알레르기 반응(호흡곤란·발진·부종)","수면 장애(불면증·과다수면)", "무기력/우울감(정신건강 관련)","어지러움(현기증·실신 전조)","의식 소실(실신)","출혈 경향(멍/잦은 출혈)", "림프절 종대(목·겨드랑이·사타구니)","급성 전신 증상(호흡곤란 포함)" ], neuro: [ "사지 저림/감각저하","근력 저하(힘 빠짐)","발작(경련)","언어장애(발음·이해 어려움)", "보행 불안정(비틀거림)","기억력 저하(단기 기억 상실)","시야 일부 결손/이중시","무의식적 움직임(틱·떨림)" ], ent: [ "코막힘/콧물(비염)","코피(비출혈)","후비루","귀 통증/외이도 통증","청력 저하(난청)","귀 울림(이명)", "연하곤란(삼킴 곤란)","목 이물감" ], derm: [ "국소 발진(홍반)","수포(물집)","농포(고름집)","습진성 가려움","두드러기(급성 가려움)","피부 색소 변화", "상처 지연 치유","광과민성 피부 반응" ], gyn: [ "비정상 질출혈(생리 외 출혈)","골반 통증(생리 외)","성교통","질 분비물(냄새/색 변화)","월경 이상(과다·무월경)" ], uro: [ "빈뇨","야간뇨","배뇨통","잔뇨감","요실금","고환 통증/부종" ], eye: [ "시력 저하","눈 충혈","눈물 과다","눈 가려움","눈부심","이물감" ] };

/* 상세 설명(우클릭할 때 보여줄 내용) - 사용자가 직접 수정 가능 */
const symptomDetails = {
  "일반 두통(압박감)": "두통의 일반적인 설명입니다. (예: 스트레스, 수면부족, 근육 긴장 등)",
  "편두통(한쪽 통증)": "편두통은 보통 맥박성 통증이며 빛/소리에 민감할 수 있습니다.",
  "의식 저하 또는 혼미 (응급)": "즉시 응급실 방문 권장: 의식 저하, 심한 혼수 상태는 응급입니다.",
  "목 통증": "목 근육의 긴장이나 디스크 문제 등으로 발생할 수 있습니다.",
  "인후통": "감염성 인후염일 가능성이 있으며, 고열이나 연하통 동반 시 진료 권장.",
  "가슴 통증": "응급 가능성이 있으므로 심한 경우 즉시 응급실 권장.",
  "팔 저림": "신경 압박이나 혈류 문제 가능성.",
  "복통": "위장관염, 소화불량 등 다양한 원인 가능.",
  "하지 통증": "근육통, 혈전 등 확인 필요.",
  "발열": "감염성 질환 가능성.",
  "피로감": "만성 피로, 수면 문제, 기저질환 확인 필요."
};

/* ---------------------------
   CheckMate 앱 네임스페이스 (개선된 JS)
--------------------------- */
const CheckMate = (() => {
  // 상태
  const state = {
    selected: new Set(),
    currentCategory: 'head',
    gender: null,
    mode: null,
    previouslyFocused: null
  };

  // DOM 캐시
  const els = {
    categoryRow: document.getElementById('categoryRow'),
    symptomList: document.getElementById('symptomList'),
    quickSearch: document.getElementById('quickSearch'),
    selectedChips: document.getElementById('selectedChips'),
    btnGenerate: document.getElementById('btnGenerate'),
    copyNote: document.getElementById('copyNote'),
    detailModal: document.getElementById('detailModal'),
    detailTitle: document.getElementById('detailTitle'),
    detailContent: document.getElementById('detailContent'),
    ageRange: document.getElementById('ageRange'),
    ageNum: document.getElementById('ageNum'),
  };

  const $id = (id) => document.getElementById(id);

  // 접근성: 모달 포커스 트랩 도움 함수
  function trapFocus(modal) {
    const focusable = modal.querySelectorAll('a[href], button, textarea, input, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return () => {};
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKey(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'Escape') {
        closeDetail();
      }
    }
    modal.addEventListener('keydown', handleKey);
    return () => modal.removeEventListener('keydown', handleKey);
  }

  // 모달 열기 (포커스 저장 및 트랩 설정)
  let untrap = null;
  function openDetail(symptom, contentText) {
    state.previouslyFocused = document.activeElement;
    els.detailTitle.innerText = symptom;
    els.detailContent.innerText = contentText || (symptomDetails[symptom]) || '상세 설명이 없습니다.';
    els.detailModal.style.display = 'block';
    els.detailModal.setAttribute('aria-hidden', 'false');
    const closeBtn = els.detailModal.querySelector('.close');
    if (closeBtn) closeBtn.focus();
    untrap = trapFocus(els.detailModal);
  }

  // 모달 닫기 (포커스 복원)
  function closeDetail() {
    els.detailModal.style.display = 'none';
    els.detailModal.setAttribute('aria-hidden', 'true');
    if (untrap) { untrap(); untrap = null; }
    if (state.previouslyFocused && state.previouslyFocused.focus) {
      state.previouslyFocused.focus();
      state.previouslyFocused = null;
    }
  }

  // 칩 갱신 (선택된 증상 표시)
  function refreshChips() {
    const container = els.selectedChips;
    container.innerHTML = '';
    if (state.selected.size === 0) {
      container.innerHTML = '<div class="muted">선택된 증상이 없습니다.</div>';
      return;
    }
    state.selected.forEach(s => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.innerText = s;
      chip.setAttribute('aria-label', `${s} 제거`);
      chip.addEventListener('click', () => {
        state.selected.delete(s);
        const inputs = els.symptomList.querySelectorAll('input[type="checkbox"]');
        inputs.forEach(inp => { if (inp.value === s) inp.checked = false; });
        refreshChips();
      });
      container.appendChild(chip);
    });
  }

  // 성능 개선: DocumentFragment로 렌더링
  function renderSymptoms(filter = '') {
    els.symptomList.innerHTML = '';
    const list = (SYMPTOMS && SYMPTOMS[state.currentCategory]) || [];
    const lowerFilter = filter.trim().toLowerCase();
    const frag = document.createDocumentFragment();

    list.forEach((sym, idx) => {
      if (lowerFilter && !sym.toLowerCase().includes(lowerFilter)) return;
      const label = document.createElement('label');
      label.className = 'symptom-item';
      const cbId = `sym_${state.currentCategory}_${idx}`;
      label.innerHTML = `<input id="${cbId}" type="checkbox" value="${sym}" aria-checked="${state.selected.has(sym) ? 'true' : 'false'}"> <div style="flex:1">${sym}</div>`;
      const input = label.querySelector('input');

      input.checked = state.selected.has(sym);

      input.addEventListener('change', (e) => {
        if (e.target.checked) state.selected.add(sym);
        else state.selected.delete(sym);
        input.setAttribute('aria-checked', e.target.checked ? 'true' : 'false');
        refreshChips();
      });

      // 우클릭(PC)으로 상세보기
      label.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        openDetail(sym);
        return false;
      });

      // 모바일: 롱프레스 구현 (touchstart/touchend)
      let touchTimer = null;
      label.addEventListener('touchstart', (ev) => {
        if (ev.touches.length > 1) return;
        touchTimer = setTimeout(() => openDetail(sym), 600);
      });
      label.addEventListener('touchend', () => { if (touchTimer) clearTimeout(touchTimer); });
      label.addEventListener('touchmove', () => { if (touchTimer) clearTimeout(touchTimer); });

      frag.appendChild(label);
    });

    els.symptomList.appendChild(frag);
  }

  // 복사 알림 표시
  function showCopyNote(success = true, msg = '') {
    const node = els.copyNote;
    node.style.display = 'block';
    node.innerText = success ? '복사 완료 — GPT창에 붙여넣기 하세요.' : (msg || '복사 실패 — 아래에서 수동으로 복사하세요.');
    node.style.background = success ? '#e6f7ea' : '#fff4e5';
    setTimeout(() => node.style.display = 'none', 3200);
  }

  // 생성 버튼 핸들러 (복사 실패 시 대체 UI 제공)
  async function handleGenerate() {
    const gender = state.gender || '미상';
    const age = els.ageNum.value || '미입력';
    const mode = state.mode || '미선택';
    const chronic = [];
    if ($id('chronic1') && $id('chronic1').checked) chronic.push('고혈압');
    if ($id('chronic2') && $id('chronic2').checked) chronic.push('당뇨');
    if ($id('chronic3') && $id('chronic3').checked) chronic.push('심질환');

    const advanced = $id('advancedInput') ? $id('advancedInput').value.trim() : '';
    const chosen = [...state.selected];
    const date = new Date().toLocaleString();

    let text = `생성일: ${date}\n\n[기본정보]\n- 성별: ${gender}\n- 나이: ${age}\n- 검사모드: ${mode}\n- 기저질환: ${chronic.length?chronic.join(', '):'없음'}\n\n[선택 증상]\n`;
    if (chosen.length) text += chosen.map(s => `- ${s}`).join('\n') + '\n';
    else text += '- 없음\n';
    text += `\n[추가 입력]\n${advanced?advanced:'없음'}\n\n[요청]\n위 정보를 바탕으로 가능한 원인(상위 5개), 응급 여부, 권장 검사 및 의료진에게 말할 포인트를 자세히 설명해 주세요. 1. 응급 여부: 즉시 병원에 가야 하는지, 일반 진료로 충분한지 2. 권장 검사: 필요한 혈액검사, 영상검사, 알레르기 검사 등 3. 의료진에게 말할 포인트: 증상·기간·강도 등 진료 시 강조할 부분 4. 검사할 병원: 내과, 소화기내과, 알레르기내과, 신경과 등 추천과 이유`;

    // 클립보드 복사 시도
    try {
      await navigator.clipboard.writeText(text);
      showCopyNote(true);
    } catch (err) {
      // 복사 실패 시 모달에 textarea로 보여주기 (수동 복사용)
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
        } catch (e) {
          textarea.select();
          showCopyNote(false, '자동 복사 불가 — Ctrl/Cmd+C로 복사하세요.');
        }
      });

      els.detailContent.innerHTML = '';
      els.detailContent.appendChild(textarea);
      els.detailContent.appendChild(document.createElement('br'));
      els.detailContent.appendChild(btn);
    }

    // 성공 시에도 모달에 생성 텍스트 미리보기 제공
    if (els.detailContent && els.detailContent.children.length === 0) {
      openDetail('GPT에 붙여넣을 텍스트', text);
    } else {
      els.detailTitle.innerText = 'GPT에 붙여넣을 텍스트';
    }
  }

  // 초기 이벤트 바인딩 및 public API
  function init() {
    // 성별/모드 버튼 바인딩 (존재 확인 후)
    const maleBtn = $id('maleBtn'); const femaleBtn = $id('femaleBtn');
    const modeSimple = $id('modeSimple'); const modeDeep = $id('modeDeep');

    if (maleBtn && femaleBtn) {
      maleBtn.addEventListener('click', () => {
        maleBtn.classList.toggle('active', true);
        femaleBtn.classList.toggle('active', false);
        state.gender = '남';
      });
      femaleBtn.addEventListener('click', () => {
        femaleBtn.classList.toggle('active', true);
        maleBtn.classList.toggle('active', false);
        state.gender = '여';
      });
    }

    if (modeSimple && modeDeep) {
      modeSimple.addEventListener('click', () => {
        modeSimple.classList.toggle('active', true);
        modeDeep.classList.toggle('active', false);
        state.mode = '간단';
      });
      modeDeep.addEventListener('click', () => {
        modeDeep.classList.toggle('active', true);
        modeSimple.classList.toggle('active', false);
        state.mode = '정밀';
      });
    }

    // 나이 동기화
    if (els.ageRange && els.ageNum) {
      els.ageRange.addEventListener('input', () => { els.ageNum.value = els.ageRange.value; });
      els.ageNum.addEventListener('input', () => { els.ageRange.value = els.ageNum.value; });
    }

    // 카테고리 버튼 이벤트
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.style.opacity = 0.6);
        btn.style.opacity = 1;
        state.currentCategory = btn.dataset.cat;
        renderSymptoms(els.quickSearch.value || '');
      });
    });

    // 검색 필터
    if (els.quickSearch) {
      els.quickSearch.addEventListener('input', (e) => renderSymptoms(e.target.value));
    }

    // 모달 닫기 버튼/영역
    const modalClose = els.detailModal.querySelector('.close');
    if (modalClose) modalClose.addEventListener('click', closeDetail);
    // ESC key global (fallback)
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

    // 생성 버튼
    if (els.btnGenerate) els.btnGenerate.addEventListener('click', handleGenerate);

    // 초기 렌더
    document.querySelectorAll('.cat-btn').forEach(b => b.style.opacity = b.dataset.cat === state.currentCategory ? 1 : 0.6);
    renderSymptoms();
    refreshChips();
  }

  return { init, openDetail, closeDetail, state };
})();

// DOMContentLoaded에서 초기화
document.addEventListener('DOMContentLoaded', () => { CheckMate.init(); });

</script>
</body>
</html>
