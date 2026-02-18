import React, { useState, useMemo, useEffect } from 'react';
import { Copy, X, Check, Search, Layout, Palette, Type, Lightbulb, Users, Info, Star, ChevronRight, HelpCircle, Eye, Hash, Rocket, Cpu, Binary, Film, ArrowLeft, Sparkles, Wand2, RefreshCw, Feather, Landmark, Zap, Target, MessageSquare, Heart, TrendingUp, Award } from 'lucide-react';

// --- 버전 정보 및 전략 가이드 ---
const APP_VERSION = "v2.3.0-SIMPLE_UX"; 
const STRATEGY_GOAL = "One-Click Audience Targeting System";
const apiKey = ""; // Gemini API 키 (현재 내장 로직 사용으로 미사용)

// --- [Utility] 색상 변주 함수 ---
const adjustColor = (hex, amount) => {
  let usePound = false;
  if (!hex) return "#000000";
  if (hex[0] === "#") { hex = hex.slice(1); usePound = true; }
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount; r = Math.max(0, Math.min(255, r));
  let b = ((num >> 8) & 0x00FF) + amount; b = Math.max(0, Math.min(255, b));
  let g = (num & 0x0000FF) + amount; g = Math.max(0, Math.min(255, g));
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

// --- [NEW] 색상 스마트 반전/변주 로직 (30% 유사, 70% 차별화 핵심) ---
const calculateStrategicColor = (baseHex, mode) => {
  // 간단한 색상 변환 로직 (실제로는 더 복잡한 알고리즘 가능)
  // 여기서는 모드에 따라 배경을 반전시키거나 톤을 유지하는 전략 사용
  if (mode === "INVERT") {
    // 밝은색 <-> 어두운색 반전 느낌
    return baseHex === "#000000" || baseHex === "#0a0c10" ? "#ffffff" : "#0a0c10";
  }
  return baseHex; 
};

// --- [개선] 나노 바나나 프로 검증 완료 한글 폰트 ---
const RECOMMENDED_FONTS = {
  SANS: "Pretendard",
  TITLE: "Jua",
  NEUTRAL: "Inter",
  SERIF: "Gowun Batang",
  DECOR: "Righteous",
  SOFT: "Nunito",
  ELEGANT: "Cormorant Garamond",
  HELVETICA: "Helvetica Neue",
  ARIAL: "Arial",
  TIMES: "Times New Roman",
  COMIC: "Comic Neue",
  GOOGLE: "Google Sans Text"
};

const HANGUL_BODY_FONT = "Noto Sans KR";

// --- [NEW] 청중별 디자인 전략 데이터베이스 (입력 최소화의 핵심) ---
const AUDIENCE_STRATEGIES = {
  "CEO/임원진": {
    logic: "두괄식 (Conclusion First)",
    layoutKeywords: "Executive Summary Layout, Minimal Text, Key Metrics Highlight",
    colorStrategy: "Authority (Deep Tone)",
    persuasion: "ROI 및 결론 우선 제시"
  },
  "투자자/VC": {
    logic: "성장/수익 중심 (Growth Focused)",
    layoutKeywords: "J-Curve Graph Focus, Big Number Typography, Exit Strategy Flow",
    colorStrategy: "Trust & Profit (Blue/Green Accent)",
    persuasion: "시장 기회와 수익성 증명"
  },
  "실무자/팀원": {
    logic: "How-To 중심 (Action Plan)",
    layoutKeywords: "Step-by-Step Workflow, Checklist, Timeline View",
    colorStrategy: "Energy & Action (Vivid)",
    persuasion: "구체적 실행 방안 제시"
  },
  "대중/고객": {
    logic: "감성 스토리텔링 (Empathy)",
    layoutKeywords: "Full Screen Image, Emotional Copy, Card News Style",
    colorStrategy: "Warm & Friendly",
    persuasion: "공감대 형성 후 솔루션 제시"
  },
  "학생/교육생": {
    logic: "학습/이해 중심 (Educational)",
    layoutKeywords: "Concept Diagram, Quiz Layout, Bullet Points",
    colorStrategy: "Focus & Clear (High Contrast)",
    persuasion: "쉬운 설명과 개념 정립"
  }
};

// --- [데이터 템플릿] (기존 데이터 유지) ---
const DESIGN_TEMPLATES = [
  { category: "강의교안", style: "TED 임팩트", bg: "#000000", text: "#ffffff", accent: "#E62B1E", font: RECOMMENDED_FONTS.HELVETICA, mood: "지적 호기심, 명료함, 인사이트", features: ["1 슬라이드 1 메시지", "대형 풀스크린 이미지", "압도적 몰입감"], texture: "매트 블랙", layout: "중앙 핵심 문구 집중형", narrative: "TED 강연처럼 청중을 압도하고 핵심 메시지 하나를 강렬하게 각인시킵니다." },
  { category: "비즈니스", style: "글로벌 컨설팅", bg: "#FFFFFF", text: "#0f172a", accent: "#051C2C", font: RECOMMENDED_FONTS.SANS, mood: "전문성, 신뢰, 데이터 기반", features: ["MECE 구조화", "워터폴 차트", "핵심 인사이트 박스"], texture: "프리미엄 A4 용지", layout: "헤드라인 메시지 + 3단 근거", narrative: "McKinsey, BCG 스타일의 전략적 보고서로 경영진 의사결정을 유도합니다." },
  { category: "첨단기술/AI", style: "뉴럴 네트워크", bg: "#020617", text: "#f8fafc", accent: "#38bdf8", font: RECOMMENDED_FONTS.NEUTRAL, mood: "미래지향, 인공지능, 딥러닝", features: ["빛나는 회로 라인", "시냅스 데이터 포인트"], texture: "디지털 글리프", layout: "중앙 AI 코어 배치", narrative: "AI 기술 뉴스 및 첨단 딥러닝 아키텍처 브리핑에 최적화된 전문가용 디자인입니다." },
  { category: "공상과학/SF", style: "사이버네틱 시티", bg: "#000000", text: "#ffffff", accent: "#f43f5e", font: RECOMMENDED_FONTS.DECOR, mood: "사이버펑크, 네온, 하이테크", features: ["네온 글로우", "홀로그램 UI"], texture: "스캔라인 효과", layout: "비대칭 미래도시", narrative: "SF 영화 리뷰나 미래 기술 테마에서 시각적 압도감을 선사합니다." },
  { category: "예술/디자인", style: "아방가르드 갤러리", bg: "#f8fafc", text: "#0f172a", accent: "#ef4444", font: RECOMMENDED_FONTS.ELEGANT, mood: "창의적, 미니멀, 예술적", features: ["과감한 비대칭 타이포", "여백의 미"], texture: "캔버스 질감", layout: "작품 중심 그리드", narrative: "예술 전시회, 디자인 포트폴리오 및 창의적인 컨셉 발표에 적합합니다." },
  { category: "역사/문화", style: "내셔널 아카이브", bg: "#1a1a1a", text: "#f5f5dc", accent: "#FFCC00", font: RECOMMENDED_FONTS.SERIF, mood: "탐험, 유산, 다큐멘터리", features: ["노란색 사각 프레임", "고해상도 다큐 사진"], texture: "오래된 필름 그레인", layout: "이미지 80% + 캡션 20%", narrative: "역사적 사실과 문화 유산을 다큐멘터리 스타일로 깊이 있게 전달합니다." },
  { category: "기계/전자공학", style: "PCB 마스터 설계", bg: "#064e3b", text: "#ecfdf5", accent: "#10b981", font: RECOMMENDED_FONTS.SANS, mood: "공학, 하드웨어, 정밀", features: ["구리 배선 패턴", "부품 실루엣"], texture: "회로 기판 질감", layout: "부품 조립 도면", narrative: "전자통신 전문가용으로 기술적 깊이와 전문성을 완벽히 보여줍니다." },
  { category: "시네마틱", style: "블록버스터 프레임", bg: "#000000", text: "#fafaf9", accent: "#E50914", font: RECOMMENDED_FONTS.ELEGANT, mood: "드라마틱, 영화적, 조명", features: ["와이드 레터박스", "아나모픽 플레어", "필름 그레인"], texture: "시네마틱 검정", layout: "황금 분할 시네마 뷰", narrative: "영화 스타일의 스토리텔링이나 대작 프로젝트 브리핑 시 임팩트를 극대화합니다." },
  { category: "카툰/일러스트", style: "다이나믹 코믹스", bg: "#ffffff", text: "#000000", accent: "#ef4444", font: RECOMMENDED_FONTS.TITLE, mood: "에너지, 만화, 유쾌함", features: ["강렬한 집중선", "말풍선 가이드"], texture: "인쇄망점 질감", layout: "컷 분할 그리드", narrative: "재미있는 에피소드나 홍보 광고를 카드뉴스 형태로 전달하기 좋습니다." },
  { category: "학술/과학", style: "퀀텀 리서치", bg: "#f8fafc", text: "#1e293b", accent: "#4f46e5", font: RECOMMENDED_FONTS.SERIF, mood: "학구적, 깊이, 입자", features: ["입자 가속 궤적", "정교한 도표 가이드"], texture: "연구용 종이", layout: "데이터 중심 배치", narrative: "양자 역학, 물리 과학 및 논문 발표 등 학술적 신뢰도가 필요한 슬라이드에 적합합니다." },
  { category: "소셜미디어/광고", style: "바이럴 마케팅", bg: "#ffffff", text: "#262626", accent: "#db2777", font: RECOMMENDED_FONTS.DECOR, mood: "트렌디, 홍보, 화려함", features: ["그라데이션 보더", "이모지 포인트"], texture: "글라스 질감", layout: "피드 집중형", narrative: "SNS 트렌드 뉴스, 광고 홍보 및 마케팅 바이럴 콘텐츠 제작에 완벽합니다." },
  { category: "심플", style: "미니멀 젠", bg: "#f5f5f7", text: "#1d1d1f", accent: "#2997ff", font: RECOMMENDED_FONTS.SANS, mood: "평온함, 여백, 본질", features: ["극단적 여백", "샌프란시스코 스타일"], texture: "매트 화이트", layout: "좌측 하단 집중", narrative: "시각적 노이즈를 제거하여 메시지의 본질에만 집중하게 합니다." },
  { category: "모던", style: "어반 산세리프", bg: "#f1f5f9", text: "#0f172a", accent: "#3b82f6", font: RECOMMENDED_FONTS.NEUTRAL, mood: "도시적, 세련됨", features: ["비대칭 레이아웃", "강한 고딕 서체"], texture: "없음", layout: "Z-패턴 그리드", narrative: "도시 트렌드, 최신 기술 라이프스타일 뉴스를 현대적으로 전달합니다." },
  { category: "내추럴", style: "포레스트 웰빙", bg: "#f0fdf4", text: "#166534", accent: "#22c55e", font: RECOMMENDED_FONTS.SOFT, mood: "싱그래움, 건강, 치유", features: ["수채화 나뭇잎", "곡선 배치"], texture: "캔버스 질감", layout: "자연스러운 분산형", narrative: "건강 뉴스 및 친환경 마케팅 슬라이드에 최적화된 에너지를 전달합니다." },
  { category: "럭셔리", style: "하이엔드 골드", bg: "#0c0a09", text: "#f5f5f5", accent: "#D4AF37", font: RECOMMENDED_FONTS.ELEGANT, mood: "프리미엄, 명품, 격조", features: ["금박 디테일", "대리석 텍스처"], texture: "다크 마블", layout: "골든 레이아웃", narrative: "VIP 광고, 자산 관리 뉴스 및 명품 브랜드 스토리텔링 전용입니다." },
  { category: "레트로", style: "80s 노스탤지어", bg: "#111827", text: "#ffffff", accent: "#f43f5e", font: RECOMMENDED_FONTS.DECOR, mood: "뉴트로, 향수, 추억", features: ["VHS 글리치 효과", "TV 프레임"], texture: "비디오 노이즈", layout: "브라운관 박스", narrative: "5060의 향수와 젊은 층의 뉴트로 감성을 동시에 저격하는 뉴스용입니다." },
  { category: "여행/음식", style: "글로벌 고메", bg: "#fff7ed", text: "#431407", accent: "#ea580c", font: RECOMMENDED_FONTS.TITLE, mood: "여행, 모험, 미식", features: ["빈티지 스탬프", "고화질 사진"], texture: "오래된 종이", layout: "아카이브 박스", narrative: "여행 뉴스, 맛집 홍보 및 미식 가이드 콘텐츠에 생동감을 더합니다." },
  { category: "건강/웰빙", style: "마인드풀 젠", bg: "#fdfbf7", text: "#44403c", accent: "#a8a29e", font: RECOMMENDED_FONTS.SERIF, mood: "명상, 치유, 평온", features: ["부드러운 블러", "원형 요소"], texture: "모래 질감", layout: "플로팅 레이아웃", narrative: "실버 세대 건강 뉴스 및 심리 치유 홍보 마케팅에 적합합니다." },
  { category: "키즈/교육", style: "에듀 파스텔", bg: "#eff6ff", text: "#1e3a8a", accent: "#f472b6", font: RECOMMENDED_FONTS.TITLE, mood: "귀여움, 상상력", features: ["둥근 모서리", "크레용 질감"], texture: "도화지 패턴", layout: "스티커형 배치", narrative: "손주 교육 정보, 아동용 제품 광고 뉴스 콘텐츠에서 인기가 높습니다." },
  { category: "스포츠/이벤트", style: "다이나믹 액션", bg: "#0f172a", text: "#ffffff", accent: "#D0021B", font: RECOMMENDED_FONTS.DECOR, mood: "역동적, 속도, 열정", features: ["사선 타이포", "속도선 효과"], texture: "메탈릭 질감", layout: "사선 그리드", narrative: "스포츠 중계 뉴스, 축제 홍보 광고 및 피트니스 마케팅에 최적입니다." },
  { category: "종교/문화", style: "스테인드글라스", bg: "#1e1b4b", text: "#f8fafc", accent: "#fbbf24", font: RECOMMENDED_FONTS.SERIF, mood: "경건함, 평화, 예술", features: ["유리 패턴", "빛의 번짐"], texture: "유리 질감", layout: "중앙 아치형", narrative: "종교적 가르침 홍보 및 문화 예술 뉴스 전달 시 경건함을 더합니다." },
  { category: "포토/갤러리", style: "시네마틱 사진첩", bg: "#0a0a0a", text: "#e5e5e5", accent: "#737373", font: RECOMMENDED_FONTS.NEUTRAL, mood: "예술적, 이미지 중심", features: ["이미지 영역 80%", "세련된 캡션"], texture: "매트 검정", layout: "와이드 사진 집중형", narrative: "고품격 사진 중심 뉴스 및 이미지 광고 스토리텔링에 최적화되어 있습니다." }
];

const CATEGORIES = [
  { name: "전체", count: 330, icon: "🌐" },
  { name: "강의교안", count: 15, icon: "📖" },
  { name: "건강/웰빙", count: 15, icon: "🧘" },
  { name: "공상과학/SF", count: 15, icon: "🚀" },
  { name: "기계/전자공학", count: 15, icon: "⚙️" },
  { name: "내추럴", count: 15, icon: "🌿" },
  { name: "럭셔리", count: 15, icon: "💎" },
  { name: "레트로", count: 15, icon: "📻" },
  { name: "모던", count: 15, icon: "🏢" },
  { name: "비즈니스", count: 15, icon: "💼" },
  { name: "소셜미디어/광고", count: 15, icon: "📱" },
  { name: "스포츠/이벤트", count: 15, icon: "🏃" },
  { name: "시네마틱", count: 15, icon: "🎬" },
  { name: "심플", count: 15, icon: "✨" },
  { name: "예술/디자인", count: 15, icon: "🎨" },
  { name: "여행/음식", count: 15, icon: "✈️" },
  { name: "역사/문화", count: 15, icon: "🏛️" },
  { name: "종교/문화", count: 15, icon: "🙏" },
  { name: "첨단기술/AI", count: 15, icon: "🧠" },
  { name: "카툰/일러스트", count: 15, icon: "🎨" },
  { name: "키즈/교육", count: 15, icon: "🧸" },
  { name: "포토/갤러리", count: 15, icon: "📷" },
  { name: "학술/과학", count: 15, icon: "🎓" }
];

const MASTER_DATA = (() => {
  const data = [];
  let idCounter = 1;
  CATEGORIES.forEach(cat => {
    if (cat.name === "전체") return;
    const template = DESIGN_TEMPLATES.find(t => t.category === cat.name);
    if (!template) return;
    for (let i = 0; i < cat.count; i++) {
      data.push({
        id: idCounter++,
        category: cat.name,
        style: `${template.style} Set-${i + 1}`,
        bg: i % 2 === 0 ? template.bg : adjustColor(template.bg, -10),
        text: template.text,
        accent: i % 3 === 0 ? template.accent : adjustColor(template.accent, 20),
        font: template.font,
        mood: template.mood,
        features: [...template.features, `변주 포인트 #${i + 1}`],
        texture: template.texture,
        layout: `${template.layout} (Option-${i + 1})`,
        narrative: template.narrative
      });
    }
  });
  return data.sort((a, b) => a.id - b.id);
})();

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [copied, setCopied] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // --- [NEW] 심플 UX: 오직 '발표 대상' 하나만 입력받음 ---
  const [aiAudience, setAiAudience] = useState("");
  
  const [aiResult, setAiResult] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredDesigns = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return MASTER_DATA.filter(d => {
      const matchSearch = term === "" ||
        d.style.toLowerCase().includes(term) || 
        d.category.toLowerCase().includes(term) ||
        d.mood.toLowerCase().includes(term) ||
        d.narrative.toLowerCase().includes(term) || 
        d.id.toString() === term;
      const matchCat = selectedCategory === "전체" || d.category === selectedCategory;
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  // --- [NEW] 전략적 AI 크리에이티브 프롬프트 생성 엔진 (30/70 법칙 적용) ---
  const generateAiCreativePrompt = (design, audience) => {
    // 전략 조회
    const strategy = AUDIENCE_STRATEGIES[audience] || {
      logic: "표준 논리",
      layoutKeywords: "Balanced Standard Layout",
      colorStrategy: "Standard",
      persuasion: "명확한 정보 전달"
    };

    // 30% 유사성 유지: 폰트, 기본 무드
    // 70% 차별화: 색상 반전/변주, 레이아웃 재구성
    
    // 색상 변주 로직 (예: CEO 대상이면 더 깊은 무게감, 대중 대상이면 더 밝게)
    const isDarkBg = design.bg.startsWith("#0") || design.bg.startsWith("#1");
    let newBg = design.bg;
    let newText = design.text;

    // 예시: CEO/임원진은 다크모드 선호 경향, 학생/대중은 밝은 모드 선호 경향 등 전략적 반전
    if (audience === "CEO/임원진" && !isDarkBg) {
      newBg = "#0a0c10"; newText = "#ffffff"; // 무게감 추가
    } else if (audience === "대중/고객" && isDarkBg) {
      newBg = "#ffffff"; newText = "#1a1a1a"; // 친근함 추가
    }

    return `╔════════════════════════════════════════════════════════════════╗
║  AI CREATIVE PROMPT - Strategic Variation System              ║
║  Target Audience: "${audience}" (Strategy Applied)             ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PHASE 1: Similarity & Identity (30% Match)]
> 원본 디자인의 '핵심 DNA'는 유지하여 브랜드 일관성을 확보합니다.

• Font Family: ${design.font} (English), ${HANGUL_BODY_FONT} (Korean) - Identity 유지
• Base Mood: ${design.mood} - 분위기 계승
• Texture: ${design.texture} - 질감 유지

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PHASE 2: Strategic Variation (70% Unique)]
> 청중(${audience})의 특성에 맞춰 구조와 컬러를 전략적으로 재해석합니다.

■ 1. Color Strategy Change (${strategy.colorStrategy})
   [Original] BG: ${design.bg} / Text: ${design.text}
       ↓ (Strategic Shift)
   [AI Variant] BG: ${newBg} / Text: ${newText}
   
   • Logic: ${audience}에게 최적화된 가독성과 심리적 톤앤매너 적용
   • Accent Color: ${design.accent} 유지하되 채도를 조절하여 주목도 강화

■ 2. Layout Reconstruction (${strategy.logic})
   [Original] ${design.layout}
       ↓ (Structural Shift)
   [AI Variant] ${strategy.layoutKeywords}
   
   • 청중 맞춤 논리 전개: ${strategy.persuasion}
   • 배치 전략: ${audience === "CEO/임원진" ? "결론(Key Message)을 최상단에 배치하고 근거 데이터를 하단에 요약" : "시선을 사로잡는 비주얼을 좌측에 60% 배치하고 우측에 스토리텔링"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PHASE 3: Nano Banana Pro Execution Guide]

"""
Create a presentation slide based on the following Strategic Variation.

CONTEXT: ${design.category} Topic Presentation
TARGET AUDIENCE: ${audience}

DESIGN RULES (30% Similarity):
- Typography: Use **${design.font}** (Bold/Heavy) for Headlines
- Korean Font: **${HANGUL_BODY_FONT}** (Bold) for Body
- Atmosphere: Keep the '${design.mood}' vibe but adapted for the audience

VARIATION RULES (70% Unique):
- Background Color: **${newBg}** (Strategic Shift)
- Text Color: **${newText}** (High Contrast)
- Layout Structure: **${strategy.layoutKeywords}**
- Content Flow: Follow the '${strategy.logic}' structure

RENDERING:
- Resolution: 4K (3840x2160)
- Ensure clean rendering of Korean text (No artifacts)
"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by AI Strategic Design Consultant System
Build: ${APP_VERSION} | Powered by Thomas & AiDreamU

╚════════════════════════════════════════════════════════════╝`;
  };

  const callGemini = async (design, audience) => {
    if (!audience) {
      alert("발표 대상을 선택해주세요!");
      return;
    }
    
    setIsAiLoading(true);
    setAiResult(null);

    setTimeout(() => {
      const result = generateAiCreativePrompt(design, audience);
      setAiResult(result);
      setIsAiLoading(false);
    }, 1500); 
  };

  // --- [AUTO SLIDE PROMPT (기본)] (기존 로직 유지) ---
  const generateAutoSlidePrompt = (design) => {
    if (!design) return "";
    return `╔════════════════════════════════════════════════════════════════╗
║  AUTO SLIDE PROMPT - Ready to Use Template                    ║
║  Pre-designed Professional System                             ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ Template Information
• ID: ${design.id}
• Category: ${design.category}
• Style Name: ${design.style}
• Verified Design System: Production-Ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Design Specification]

■ Color System
┌────────────────────────────────────────────────────────────┐
│ • Background: ${design.bg}
│ • Text: ${design.text}
│ • Accent: ${design.accent}
│ • Brand Logic: ${design.mood}
└────────────────────────────────────────────────────────────┘

■ Typography
┌────────────────────────────────────────────────────────────┐
│ • Title Font (English): ${design.font}
│ • Body Font (Korean): ${HANGUL_BODY_FONT} Bold
│ • Font Weight: Bold to Heavy (700-900)
│ • Font Style: Clean, modern sans-serif preferred
└────────────────────────────────────────────────────────────┘

■ Key Features
${design.features.map(f => `• ${f}`).join('\n')}

■ Visual Guide
• Texture: ${design.texture}
• Layout Strategy: ${design.layout}

■ Brand Narrative
"${design.narrative}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[나노 바나나 프로 4K 렌더링 최적화]

⚠️ MANDATORY REQUIREMENTS:

1. Resolution Settings
   • **4K High Resolution (3840×2160) - REQUIRED**
   • Low resolution (1K, 2K) will cause Korean text artifacts

2. Korean Font Strategy
   • Korean Body Text: **${HANGUL_BODY_FONT} Bold** (FIXED)
   • English Title: **${design.font}** (Style-specific)
   • Font Style: **Clean, bold sans-serif / Modern Gothic typography**
   • FORBIDDEN: Serif, brush, decorative fonts (cause rendering noise)

3. Complex Korean Character Handling
   • For complex characters (붇, 짇, 뛿, 쐐):
     - Font Weight: **Heavy weight (Bold or heavier)**
     - Letter Spacing: **Minimum 0.05em**
     - Stroke Spacing: **Minimum 2px**

4. Structural Stability
   • Consider **Positional Semantics** to prevent character separation
   • Ensure 초성/중성/종성 are recognized as single block
   • Provide sufficient text area padding (minimum 20%)

5. Verified Font List (Options)
   • Core 7: Pretendard, Jua, Inter, Gowun Batang, Righteous, Nunito, Cormorant Garamond
   • Verified 5: Helvetica Neue, Arial, Times New Roman, Comic Neue, Google Sans Text

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Rendering Checklist]
□ 4K resolution configured
□ ${HANGUL_BODY_FONT} Bold applied for Korean
□ Gothic-style font used (no serif/decorative)
□ Complex Korean characters tested (붇, 짇, 뛿)
□ Letter/stroke spacing sufficient

Follow this guide to ensure Korean text renders clearly without artifacts in Nano Banana Pro.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Designer Credit]
Creative Direction by AiDreamU | 시니어토킹TV

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Template Version: ${APP_VERSION}
System: Nano Banana Pro Hangul 4K Optimized
Date: 2026-02-18

╚════════════════════════════════════════════════════════════╝`;
  };

  const handleCopy = (text, isAi = false) => {
    const el = document.createElement('textarea');
    el.value = typeof text === 'string' ? text : generateAutoSlidePrompt(text);
    document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
    
    if (isAi) {
      setAiCopied(true); setTimeout(() => setAiCopied(false), 2000);
    } else {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#010204] text-[#f8fafc] font-sans selection:bg-blue-500/40 overflow-x-hidden">
      
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Batang:wght@400;700&family=Inter:wght@400;700;900&family=Righteous&family=Nunito:wght@400;700&family=Cormorant+Garamond:ital,wght@1,600&family=Noto+Sans+KR:wght@400;700;900&display=swap');
        
        :root { --font-pretendard: 'Pretendard', sans-serif; }
        body { font-family: var(--font-pretendard); -webkit-font-smoothing: antialiased; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #3b82f6, #8b5cf6); border-radius: 10px; border: 2px solid #0f1115; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-pulse-fast { animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Top Banner */}
      <div className="bg-[#020617]/90 backdrop-blur-md sticky top-0 z-50 py-3 px-8 text-[10px] font-black uppercase tracking-widest flex items-center justify-between shadow-2xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 font-mono text-[10px] tracking-tight">
            {APP_VERSION}
          </div>
          <span className="hidden md:inline text-gray-500 opacity-40 font-black tracking-widest text-[9px]">STRATEGIC DESIGNER</span>
        </div>
        <button 
          onClick={() => setShowGuide(true)} 
          className="group relative flex items-center gap-4 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(37,99,235,0.4)]"
        >
          <HelpCircle className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span className="text-[17px] font-black tracking-tighter uppercase">? 가이드</span>
        </button>
      </div>

      {/* Header */}
      <header className="pt-4 pb-1 px-6 border-b border-white/5 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-0.5 tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500 bg-clip-text text-transparent drop-shadow-2xl uppercase">
          SLIDE300 AI STUDIO
        </h1>
        
        <div className="max-w-4xl mx-auto mb-1 px-4">
          <p className="text-blue-400 text-lg md:text-xl font-black leading-tight tracking-tight uppercase italic">
            전략적 AI 디자인 컨설턴트가 포함된 차세대 슬라이드 제작 솔루션
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-1.5 bg-white/5 p-4 md:p-5 rounded-[1.5rem] border border-white/10 shadow-inner mb-0.5">
          <p className="text-blue-50 text-[14px] md:text-[16px] font-bold leading-relaxed tracking-tight">
            <span className="text-yellow-400">🎯 AUTO PROMPT</span>: 카테고리 선택만으로 즉시 사용 가능한 검증된 디자인
          </p>
          <p className="text-blue-50 text-[14px] md:text-[16px] font-bold leading-relaxed tracking-tight">
            <span className="text-purple-400">✨ AI CREATIVE</span>: <b>오직 발표 대상만 선택하세요.</b> 70% 독창적인 전략적 변주를 제안합니다.
          </p>
          <p className="text-green-400 text-[14px] md:text-[16px] font-black leading-relaxed tracking-tight">
            ✅ 나노바나나 프로 4K 한글 렌더링 최적화 - CEO부터 투자자까지 모두 감탄할 퀄리티
          </p>
        </div>
      </header>

      {/* Nav */}
      <nav className="z-40 bg-[#010204]/95 backdrop-blur-3xl border-b border-white/5 py-0.5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 space-y-1.5">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-2 max-w-[1500px] mx-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-2 py-1 rounded-lg text-[12px] md:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-tight border
                  ${selectedCategory === cat.name 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105 z-10' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/5'}`}
              >
                <span className="text-sm shrink-0">{cat.icon}</span> 
                <span className="whitespace-nowrap">{cat.name}</span>
                <span className={`font-black ${selectedCategory === cat.name ? 'text-blue-200' : 'text-blue-500'} opacity-80 text-[8px] bg-black/30 px-1 py-0.5 rounded shrink-0`}>{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-2xl mx-auto pt-0.5">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-pulse" />
            <input 
              type="text" 
              placeholder="TED, McKinsey, Apple 스타일 검색..."
              className="w-full bg-white/10 border-2 border-blue-500/30 rounded-full py-3 pl-16 pr-8 text-[15px] font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-center"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </nav>

      {/* Grid */}
      <main className="max-w-[1400px] mx-auto px-6 pt-0 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredDesigns.map(design => (
            <div 
              key={design.id}
              onClick={() => { 
                setSelectedDesign(design); 
                setAiResult(null); 
                setAiAudience(""); // 초기화
              }}
              className="group cursor-pointer bg-[#0a0c10] border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl relative"
            >
              <div className="aspect-[1/1] relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: design.bg }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${design.text} 1px, transparent 1px)`, backgroundSize: '32px 32px' }}></div>
                <div className="relative z-10 w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/20 transform transition-all group-hover:scale-105 duration-500 overflow-hidden" style={{ backgroundColor: design.accent }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                    <Palette className="w-10 h-10 text-white drop-shadow-2xl relative z-20" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 z-20">
                   <p className="text-[10px] font-black text-white/95 truncate bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 w-fit max-w-full shadow-2xl uppercase tracking-tighter">
                     {design.style}
                   </p>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[9px] font-black text-blue-400 border border-blue-500/20 shadow-2xl flex items-center gap-1.5">
                    <Hash className="w-2 h-2" /> {design.id}
                  </div>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-[#0a0c10] to-[#010204] border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ backgroundColor: design.accent }}></span>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest font-mono">{design.category}</p>
                </div>
                <h3 className="text-[13px] font-black text-white/60 leading-tight group-hover:text-blue-300 transition-all line-clamp-1 italic tracking-tight uppercase">
                  Studio Set V.{design.id}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-[#0f1115] border border-white/10 rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] flex flex-col max-h-[92vh] my-auto">
            <div className="p-8 flex justify-between items-center border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl border-2 border-white/5 shadow-2xl flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: selectedDesign.bg }}>
                   <div className="w-1/2 h-1/2 rounded-full blur-xl opacity-40 animate-pulse" style={{ backgroundColor: selectedDesign.accent }}></div>
                   <div className="w-6 h-6 rounded-xl relative z-10" style={{ backgroundColor: selectedDesign.accent }}></div>
                </div>
                <div className="space-y-1">
                   <h2 className="text-[18px] font-black text-white leading-none uppercase tracking-tight">{selectedDesign.style}</h2>
                   <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">{selectedDesign.category}</p>
                   <div className="flex gap-5 mt-3 font-mono">
                     <span className="text-[14px] flex items-center gap-3 text-gray-400 uppercase font-black tracking-widest"><div className="w-6 h-6 rounded-full border border-white/10" style={{backgroundColor: selectedDesign.bg}}></div> 배경</span>
                     <span className="text-[14px] flex items-center gap-3 text-gray-400 uppercase font-black tracking-widest"><div className="w-6 h-6 rounded-full border border-white/10" style={{backgroundColor: selectedDesign.text}}></div> 텍스트</span>
                     <span className="text-[14px] flex items-center gap-3 text-gray-400 uppercase font-black tracking-widest"><div className="w-6 h-6 rounded-full border border-white/10" style={{backgroundColor: selectedDesign.accent}}></div> 강조</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setSelectedDesign(null)} className="h-10 flex items-center justify-center gap-2 px-5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all text-[12px] font-black border border-white/10 min-w-[80px]"><ArrowLeft className="w-4 h-4" /> 뒤로</button>
                 <button onClick={() => handleCopy(selectedDesign)} className="h-10 flex items-center justify-center gap-2 px-6 bg-yellow-600 text-white rounded-xl hover:bg-yellow-500 transition-all shadow-xl text-[12px] font-black min-w-[120px]">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "복사완료" : "AUTO 복사"}</button>
                 <button onClick={() => setSelectedDesign(null)} className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-500 transition-all border border-white/10 ml-1"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 font-sans">
              
              {/* --- [NEW] 초간단 AI 입력 영역 (UX 혁신) --- */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-[2rem] p-6 space-y-5 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-3 relative z-10">
                  <span className="bg-purple-500/20 p-2 rounded-lg"><Sparkles className="text-purple-400 w-5 h-5" /></span>
                  <div>
                    <h3 className="text-[15px] font-black text-purple-300 uppercase tracking-widest">AI 전략적 디자인 변주 (30:70 Rule)</h3>
                    <p className="text-[11px] text-gray-400 font-bold">이미 선택하신 '{selectedDesign.category}' 주제를 기반으로, 청중에 맞춰 70% 다른 디자인을 제안합니다.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 items-end">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[12px] font-black text-blue-300 uppercase tracking-wide">
                      <Users className="w-4 h-4" /> 발표 대상 (One-Click)
                    </label>
                    <select 
                      className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white font-bold cursor-pointer hover:bg-black/70"
                      value={aiAudience}
                      onChange={(e) => setAiAudience(e.target.value)}
                    >
                      <option value="">누구에게 발표하시나요?</option>
                      {Object.keys(AUDIENCE_STRATEGIES).map(aud => (
                        <option key={aud} value={aud}>{aud}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => callGemini(selectedDesign, aiAudience)} 
                    disabled={isAiLoading || !aiAudience}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-[14px] font-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-purple-900/40 relative z-10 h-[52px]"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>전략 생성 중...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        <span>AI 전략적 변주 생성 (Click)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* --- AI 결과창 --- */}
              {aiResult && (
                <div className="animate-in fade-in zoom-in-95 duration-500 bg-gradient-to-r from-purple-900/40 to-blue-900/20 rounded-[2rem] p-1 border-2 border-purple-400/40 shadow-[0_0_60px_rgba(168,85,247,0.3)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-500/5 pattern-grid-lg opacity-20 pointer-events-none"></div>
                  
                  <div className="bg-[#0f1115]/90 backdrop-blur-xl px-6 py-4 rounded-t-[1.8rem] flex justify-between items-center border-b border-purple-500/20 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                        <Zap className="w-5 h-5 text-white" fill="currentColor" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-black text-white tracking-tight uppercase flex items-center gap-2">
                          <span className="text-purple-400">AI STRATEGIC VARIANT</span>
                          <span className="text-blue-400">: {aiAudience} Edition</span>
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold">Same Soul (30%), Different Body (70%)</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCopy(aiResult, true)} 
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[12px] transition-all border shadow-lg ${aiCopied ? 'bg-green-500 text-white border-green-500' : 'bg-purple-600 text-white hover:bg-purple-500 border-purple-500'}`}
                    >
                      {aiCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {aiCopied ? "복사 완료!" : "AI 프롬프트 복사"}
                    </button>
                  </div>

                  <div className="p-6 bg-[#0a0c10]/90 rounded-b-[1.8rem] relative z-10">
                     <div className="text-[13px] leading-relaxed text-purple-100 whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                       {aiResult}
                     </div>
                  </div>
                </div>
              )}

              {/* --- AUTO SLIDE PROMPT (기본) --- */}
              <div className="relative group">
                <div className="absolute -top-3 left-10 px-5 py-1.5 bg-yellow-600 border border-yellow-500 rounded-full z-10 shadow-2xl flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse"></div>
                  <span className="text-[11px] font-black text-white tracking-widest uppercase">AUTO SLIDE PROMPT</span>
                </div>
                <div className="bg-black/60 p-10 pt-14 rounded-[2.5rem] border border-yellow-500/20 text-[15px] leading-relaxed text-gray-300 whitespace-pre-wrap relative overflow-hidden shadow-inner selection:bg-yellow-500/30 font-mono">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Binary className="w-14 h-14" /></div>
                  {generateAutoSlidePrompt(selectedDesign)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pb-6">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <h4 className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">TYPOGRAPHY</h4>
                  <p className="text-sm font-bold text-white italic">제목: {selectedDesign.font}</p>
                  <p className="text-sm font-bold text-green-400 italic mt-1">본문: {HANGUL_BODY_FONT} Bold</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <h4 className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">STRATEGIC GOAL</h4>
                  <p className="text-[12px] text-gray-400 font-bold italic">"{selectedDesign.narrative}"</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-center gap-4">
              <button 
                onClick={() => handleCopy(selectedDesign)} 
                className={`group relative flex items-center justify-center gap-4 px-10 py-4 rounded-full transition-all font-black text-[15px] shadow-2xl active:scale-95 border overflow-hidden ${copied ? 'bg-green-600 text-white border-green-500 shadow-green-900/40' : 'bg-yellow-600 text-white border-yellow-500'}`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {copied ? <Check className="w-5 h-5 animate-bounce relative z-10" /> : <Copy className="w-5 h-5 relative z-10" />}
                <span className="relative z-10 tracking-tight">{copied ? "복사 완료!" : "AUTO PROMPT 복사"}</span>
              </button>

              {aiResult && (
                <button 
                  onClick={() => handleCopy(aiResult, true)} 
                  className={`group relative flex items-center justify-center gap-4 px-10 py-4 rounded-full transition-all font-black text-[15px] shadow-2xl active:scale-95 border overflow-hidden ${aiCopied ? 'bg-green-600 text-white border-green-500 shadow-green-900/40' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500'}`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  {aiCopied ? <Check className="w-5 h-5 animate-bounce relative z-10" /> : <Sparkles className="w-5 h-5 relative z-10" />}
                  <span className="relative z-10 tracking-tight">{aiCopied ? "복사 완료!" : "AI CREATIVE 복사"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guide Overlay */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/92 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-[#0f1115] border border-white/10 rounded-[3.5rem] w-full max-w-lg p-8 relative shadow-[0_0_120px_rgba(59,130,246,0.3)] flex flex-col max-h-[90vh]">
              <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all"><X className="w-6 h-6"/></button>
              <div className="text-center mb-6 mt-2">
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center justify-center gap-2.5">
                  <span className="text-blue-500">Thomas</span> Strategic Workflow 🚀
                </h2>
                <div className="w-10 h-0.5 bg-blue-600 mx-auto mt-2 rounded-full"></div>
              </div>
              <div className="space-y-5 flex-1">
                 <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg shrink-0 flex items-center justify-center font-black text-white text-lg shadow-lg">1</div>
                    <div className="space-y-1">
                      <h4 className="text-[16px] font-black text-yellow-400 uppercase tracking-tight">AUTO PROMPT 모드</h4>
                      <p className="text-[13px] text-gray-400 leading-tight font-bold">카테고리 선택 → 디자인 클릭 → "AUTO PROMPT 복사" 버튼으로 검증된 템플릿 즉시 사용</p>
                    </div>
                 </div>

                 <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg shrink-0 flex items-center justify-center font-black text-white text-lg shadow-lg">2</div>
                    <div className="space-y-1">
                      <h4 className="text-[16px] font-black text-purple-400 uppercase tracking-tight">AI CREATIVE 모드</h4>
                      <p className="text-[13px] text-gray-400 leading-tight font-bold">오직 '발표 대상'만 선택하세요. 나머지는 AI가 알아서 '전략적 변주(Strategic Variation)'를 생성합니다.</p>
                    </div>
                 </div>

                 <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg shrink-0 flex items-center justify-center font-black text-white text-lg shadow-lg">3</div>
                    <div className="space-y-1">
                      <h4 className="text-[16px] font-black text-blue-400 uppercase tracking-tight">30:70 법칙</h4>
                      <p className="text-[13px] text-gray-400 leading-tight font-bold">
                        <span className="text-yellow-400">30%</span>: 폰트와 무드는 유지 (Identity)<br/>
                        <span className="text-purple-400">70%</span>: 색상과 레이아웃은 청중에 맞춰 변신
                      </p>
                    </div>
                 </div>
              </div>
              <button onClick={() => setShowGuide(false)} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-[1.2rem] font-black text-base shadow-2xl hover:from-blue-500 hover:to-purple-500 transition-all uppercase tracking-widest active:scale-95">
                디자인 시작하기
              </button>
           </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 text-center bg-gradient-to-b from-transparent to-blue-900/5 opacity-60 hover:opacity-100 transition-opacity">
        <div className="max-w-4xl mx-auto text-gray-600 font-sans">
          <div className="flex justify-center gap-16 mb-12">
            {[{ v: '330', l: 'Templates' }, { v: 'AI', l: 'Strategic Engine' }, { v: '4K', l: 'Hangul Ready' }].map(stat => (
              <div key={stat.l} className="flex flex-col items-center">
                <span className="text-5xl font-black text-white tracking-tighter">{stat.v}</span>
                <span className="text-[10px] uppercase tracking-widest font-black text-blue-500 mt-2">{stat.l}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-[10px] mb-6 uppercase font-black tracking-[0.2em] italic">SLIDE300 AI STUDIO : Strategic Presentation Partner</p>
          <div className="inline-block px-5 py-2.5 bg-white/5 rounded-full border border-white/10 shadow-2xl">
            <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase font-bold">
              Build {APP_VERSION} / AI Strategic Designer / 2026-02-18
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}