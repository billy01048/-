// 간단 유틸
const $id = (id) => document.getElementById(id);

// 상태 및 데이터
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

// 데이터 로드 (상대경로)
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
    console.error('데이터 로드 실패:', e);
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

// 렌더링 및 기타 함수 생략(상기와 동일)...
// (원하시면 나머지 함수도 전체 붙여드립니다)

document.addEventListener('DOMContentLoaded', ()=>{
  loadData();
});
