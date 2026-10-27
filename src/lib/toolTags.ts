import { AITool } from '../types';
import { getCategoryLabel, Language } from './translations';

interface FeatureTags {
  ko: string[];
  en: string[];
}

// Curated authentic feature tags for known AI tools
const CURATED_TOOL_TAGS: Record<string, FeatureTags> = {
  'ChatGPT': {
    ko: ['대화형 AI', '글쓰기', '코딩'],
    en: ['Conversational AI', 'Writing', 'Coding'],
  },
  'Claude': {
    ko: ['문맥 분석', '긴 문서 요약', '논리 추론'],
    en: ['Context Analysis', 'Long Doc Summary', 'Reasoning'],
  },
  'Gemini': {
    ko: ['멀티모달', '심층 리서치', '구글 생태계'],
    en: ['Multimodal', 'Deep Research', 'Google Ecosystem'],
  },
  'Wrtn (뤼튼)': {
    ko: ['한국어 특화', '비즈니스 글쓰기', 'AI 포털'],
    en: ['Korean Specialized', 'Business Writing', 'AI Portal'],
  },
  'Grok': {
    ko: ['실시간 X 데이터', '최신 트렌드', '대화형 AI'],
    en: ['Real-time X Data', 'Trends', 'Conversational'],
  },
  'Kimi': {
    ko: ['초장문 컨텍스트', '웹 서칭', '문서 리서치'],
    en: ['Long Context', 'Web Search', 'Research'],
  },
  'Perplexity Pages': {
    ko: ['리포트 생성', '구조화 문서', '웹 공유'],
    en: ['Report Generator', 'Structured Docs', 'Web Share'],
  },
  'Jasper AI': {
    ko: ['마케팅 카피', '브랜드 보이스', '광고 기획'],
    en: ['Marketing Copy', 'Brand Voice', 'Ad Campaign'],
  },
  'DeepSeek': {
    ko: ['오픈소스', '추론 특화', '수학/코딩'],
    en: ['Open Source', 'Reasoning', 'Math & Code'],
  },
  'Mistral AI': {
    ko: ['경량 오픈소스', '빠른 응답', '기업 구축'],
    en: ['Lightweight LLM', 'Fast Response', 'Enterprise'],
  },
  'Copy.ai': {
    ko: ['세일즈 카피', '100+ 템플릿', '이메일 작성'],
    en: ['Sales Copy', '100+ Templates', 'Email Sequence'],
  },
  'Midjourney': {
    ko: ['이미지 생성', '텍스트→이미지', '컨셉 아트'],
    en: ['Image Generation', 'Text-to-Image', 'Concept Art'],
  },
  'Adobe Firefly': {
    ko: ['상업적 저작권', '포토샵 내장', '생성형 채우기'],
    en: ['Commercial Safe', 'Photoshop Native', 'Generative Fill'],
  },
  'Ideogram': {
    ko: ['타이포그래피', '로고 렌더링', '그래픽 포스터'],
    en: ['Typography', 'Logo Rendering', 'Graphic Design'],
  },
  'Figma AI': {
    ko: ['UI 와이어프레임', '자동 레이아웃', '디자인 생성'],
    en: ['UI Wireframe', 'Auto Layout', 'Design Gen'],
  },
  'Canva AI': {
    ko: ['간편 디자인', '배경 제거', '자동 레이아웃'],
    en: ['Easy Design', 'Background Removal', 'Auto Layout'],
  },
  'Leonardo AI': {
    ko: ['게임 아트', '캐릭터 디자인', '캔버스 편집'],
    en: ['Game Art', 'Character Design', 'Canvas Edit'],
  },
  'Kling AI': {
    ko: ['고화질 영상', '캐릭터 일관성', '포즈 제어'],
    en: ['HD Video', 'Character Consistency', 'Pose Control'],
  },
  'Stable Diffusion': {
    ko: ['오픈소스 이미지', '로컬 설치', '커스텀 모델'],
    en: ['Open Source', 'Local Hosting', 'Custom Model'],
  },
  'Recraft AI': {
    ko: ['벡터 그래픽', '스타일 일관성', '브랜드 디자인'],
    en: ['Vector Graphic', 'Style Consistency', 'Brand Design'],
  },
  'Flux (Black Forest Labs)': {
    ko: ['초현실적 사실감', '텍스트 렌더링', '차세대 이미지'],
    en: ['Ultra Realism', 'Text Accuracy', 'Next-Gen Image'],
  },
  'Stitch (구 Galileo AI)': {
    ko: ['UI 생성', 'Figma 연동', '모바일/웹 화면'],
    en: ['UI Generation', 'Figma Export', 'Mobile/Web Screens'],
  },
  'Uizard': {
    ko: ['스케치 변환', '초고속 프로토타입', '와이어프레임'],
    en: ['Sketch to UI', 'Rapid Prototype', 'Wireframing'],
  },
  'Krea AI': {
    ko: ['실시간 드로잉', 'AI 캔버스', '고화질 업스케일'],
    en: ['Real-time Draw', 'AI Canvas', 'Upscaling'],
  },
  'Runway': {
    ko: ['영상 생성', '카메라 무빙 제어', '모션 브러시'],
    en: ['Video Generation', 'Camera Control', 'Motion Brush'],
  },
  'Synthesia': {
    ko: ['AI 아바타', '비즈니스 영상', '다국어 발표'],
    en: ['AI Avatar', 'Corporate Video', 'Multilingual Speech'],
  },
  'Vrew (브루)': {
    ko: ['자동 자막', '쇼츠 영상 편집', 'AI 보이스'],
    en: ['Auto Subtitles', 'Shorts Editor', 'AI Voiceover'],
  },
  'ElevenLabs': {
    ko: ['자연스러운 보이스', '음성 복제', '다국어 TTS'],
    en: ['Natural Voice', 'Voice Cloning', 'Multilingual TTS'],
  },
  'Suno AI': {
    ko: ['보컬 음악 작곡', '가사 기반 생성', '올인원 음악'],
    en: ['Vocal Music', 'Lyrics to Song', 'AI Composition'],
  },
  'viggle.ai': {
    ko: ['캐릭터 무브먼트', '댄스 비디오', '모션 믹싱'],
    en: ['Character Motion', 'Dance Video', 'Motion Mixing'],
  },
  'Typecast': {
    ko: ['감정 연기 성우', '대본 더빙', '수백 개 캐릭터'],
    en: ['Emotional Acting', 'Script Dubbing', 'Hundreds of Voices'],
  },
  'Udio': {
    ko: ['고품질 음악', '장르/악기 조합', '작곡 AI'],
    en: ['Hi-Fi Music', 'Genre Fusion', 'Song Generation'],
  },
  'HeyGen': {
    ko: ['립싱크 아바타', '사진→영상', '다국어 번역'],
    en: ['Lip-sync Avatar', 'Photo to Video', 'Translation'],
  },
  'Captions AI': {
    ko: ['쇼츠 자동 자막', '시선 보정', '오디오 노이즈 제거'],
    en: ['Auto Captions', 'Eye Contact Fix', 'Audio Polish'],
  },
  'Luma Dream Machine': {
    ko: ['초고속 영상 생성', '카메라 무빙', '고해상도 비디오'],
    en: ['Fast Video Gen', 'Camera Motion', 'High Res Video'],
  },
  'Pika Labs': {
    ko: ['숏폼 비디오', '텍스트/이미지 변환', '이펙트 애니메이션'],
    en: ['Shorts Video', 'Text/Image to Video', 'Effects'],
  },
  'Adobe Podcast AI': {
    ko: ['스튜디오 음질', '노이즈 제거', '오디오 인핸스'],
    en: ['Studio Audio', 'Noise Removal', 'Audio Enhance'],
  },
  'Mureka AI': {
    ko: ['음악 작곡', '저작권 무료 트랙', 'BPM/장르 제어'],
    en: ['Music Composition', 'Royalty-free Tracks', 'BPM Control'],
  },
  'Whisper AI (OpenAI)': {
    ko: ['음성 인식(STT)', '다국어 받아쓰기', '오픈소스'],
    en: ['Speech-to-Text', 'Multilingual STT', 'Open Source'],
  },
  'Speechify': {
    ko: ['텍스트 음성 변환', 'PDF/웹 오디오북', '셀럽 보이스'],
    en: ['Text-to-Speech', 'PDF Audiobook', 'Celebrity Voices'],
  },
  'OpenVoice (MyShell)': {
    ko: ['3초 음성 복제', '음색/억양 보존', '클로닝 엔진'],
    en: ['3s Voice Cloning', 'Tone Preservation', 'Voice Engine'],
  },
  'DeepL': {
    ko: ['자연스러운 번역', '비즈니스 뉘앙스', '문서 번역'],
    en: ['Natural Translation', 'Context Nuance', 'Document Translate'],
  },
  'Papago': {
    ko: ['네이버 번역', '한·영·일·중', '이미지/음성 번역'],
    en: ['Naver Papago', 'Asian Languages', 'Image Translation'],
  },
  'Speak AI': {
    ko: ['영어 회화', '발음 교정', 'AI 롤플레이'],
    en: ['English Speaking', 'Pronunciation Fix', 'AI Roleplay'],
  },
  'Duolingo Max': {
    ko: ['1:1 언어 튜터', '틀린 이유 설명', '롤플레이 회화'],
    en: ['1:1 Language Tutor', 'Answer Explanations', 'Roleplay'],
  },
  'Elsa Speak': {
    ko: ['발음 음소 분석', '억양/강세 코칭', '영어 스피킹'],
    en: ['Phoneme Analysis', 'Accent Coaching', 'Speaking Practice'],
  },
  'Cursor': {
    ko: ['AI 코드 에디터', '리팩토링', '전체 코드베이스 인지'],
    en: ['AI Code Editor', 'Refactoring', 'Full Codebase Context'],
  },
  'Lovable': {
    ko: ['노코드 풀스택', '웹앱 빌더', '자연어 개발'],
    en: ['No-code Fullstack', 'Web App Builder', 'Prompt to App'],
  },
  'v0 by Vercel': {
    ko: ['React/Tailwind UI', '실시간 미리보기', '프론트엔드 생성'],
    en: ['React/Tailwind UI', 'Live Preview', 'Frontend Generation'],
  },
  'GitHub Copilot': {
    ko: ['코드 자동완성', 'IDE 플러그인', '인라인 제안'],
    en: ['Code Auto-complete', 'IDE Plugin', 'Inline Suggestions'],
  },
  'Bolt.new': {
    ko: ['인브라우저 VM', '풀스택 배포', '원스톱 앱 빌더'],
    en: ['In-browser VM', 'Fullstack Deploy', 'One-stop Builder'],
  },
  'Windsurf': {
    ko: ['Cascade 에이전트', '멀티파일 코딩', '차세대 IDE'],
    en: ['Cascade Agent', 'Multi-file Coding', 'Next-gen IDE'],
  },
  'Replit AI': {
    ko: ['클라우드 IDE', '협업 코딩', '원클릭 배포'],
    en: ['Cloud IDE', 'Collaborative Coding', 'One-click Deploy'],
  },
  'Tabnine': {
    ko: ['프라이빗 보안', '사내 코드 학습', '코드 완성'],
    en: ['Enterprise Security', 'Private Training', 'Code Completion'],
  },
  'Claude Code': {
    ko: ['터미널 에이전트', '멀티파일 수정', '자율 코딩'],
    en: ['Terminal Agent', 'Multi-file Edit', 'Autonomous Coding'],
  },
  'Pieces for Developers': {
    ko: ['코드 스니펫 관리', '자동 태깅', '지식 베이스'],
    en: ['Snippet Manager', 'Auto Tagging', 'Knowledge Base'],
  },
  'Warp AI': {
    ko: ['차세대 터미널', '쉘 스크립트 변환', '에러 해결'],
    en: ['Modern Terminal', 'Shell Script Gen', 'Error Solver'],
  },
  'CodeRabbit': {
    ko: ['자동 PR 리뷰', '보안 취약점 탐지', '코드 최적화'],
    en: ['Auto PR Review', 'Security Audit', 'Code Optimization'],
  },
  'Qodo (CodiumAI)': {
    ko: ['단위 테스트 생성', '버그 분석', '코드 품질 향상'],
    en: ['Unit Test Gen', 'Bug Detection', 'Code Quality'],
  },
  'SonarQube AI': {
    ko: ['정적 코드 분석', '코드 스멜 탐지', '메모리 누수 방지'],
    en: ['Static Analysis', 'Code Smells', 'Leak Prevention'],
  },
  'Bito AI': {
    ko: ['레거시 코드 해설', '리팩토링 가이드', 'IDE 어시스턴트'],
    en: ['Legacy Code Guide', 'Refactoring Tips', 'IDE Assistant'],
  },
  'Notion AI': {
    ko: ['문서 자동 정리', '페이지 요약', '스마트 워크스페이스'],
    en: ['Auto Organization', 'Page Summary', 'Smart Workspace'],
  },
  'Granola': {
    ko: ['봇 없는 회의록', '미팅 노트 정리', '액션 아이템 추출'],
    en: ['No-bot Meeting Notes', 'Audio Transcript', 'Action Items'],
  },
  'Wispr Flow': {
    ko: ['실시간 음성 타자', '자연스러운 문장 변환', '초고속 타이핑'],
    en: ['Voice Dictation', 'Natural Polish', 'Superfast Typing'],
  },
  'Heptabase': {
    ko: ['화이트보드 마인드맵', '지식 구조화', '심층 리서치'],
    en: ['Whiteboard Mindmap', 'Visual Knowledge', 'Deep Research'],
  },
  'ChatPDF': {
    ko: ['PDF 대화 요약', '핵심 정보 추출', '대용량 문서 분석'],
    en: ['Chat with PDF', 'Data Extraction', 'Document Summary'],
  },
  'Miro Assist': {
    ko: ['캔버스 아이디어 확장', '마인드맵 자동화', '팀 브레인스토밍'],
    en: ['Canvas Ideation', 'Mindmap Automation', 'Team Brainstorming'],
  },
  'Mem AI': {
    ko: ['자기조직화 노트', '지식 연결', '대화형 검색'],
    en: ['Self-organizing Notes', 'Knowledge Link', 'Conversational Search'],
  },
  'Otter.ai': {
    ko: ['실시간 회의 전사', 'Zoom/Meet 연동', '할 일 자동 요약'],
    en: ['Live Meeting Notes', 'Zoom/Meet Sync', 'Action Item Summary'],
  },
  'Taskade AI': {
    ko: ['AI 에이전트 협업', '프로젝트 자동 계획', '마인드맵'],
    en: ['AI Agents', 'Project Planning', 'Mindmaps'],
  },
  'Napkin AI': {
    ko: ['텍스트→다이어그램', '인포그래픽 자동화', '시각 자료 생성'],
    en: ['Text to Diagram', 'Infographics', 'Visual Slides'],
  },
  'Tana AI': {
    ko: ['슈퍼태그 지식관리', '노트 그래프', 'PKM 도구'],
    en: ['Supertag PKM', 'Node Graph', 'Knowledge System'],
  },
  'Fireflies.ai': {
    ko: ['회의 자동 녹취', 'CRM 자동 연동', '미팅 인텔리전스'],
    en: ['Auto Meeting Recording', 'CRM Integration', 'Call Intelligence'],
  },
  'Gamma': {
    ko: ['PPT 슬라이드 생성', '웹페이지 레이아웃', '1분 문서 기획'],
    en: ['Presentation Gen', 'Webpage Layout', 'Instant Decks'],
  },
  'Glean': {
    ko: ['엔터프라이즈 사내 검색', '전사 데이터 색인', '슬랙/드라이브 연동'],
    en: ['Enterprise Search', 'Company Index', 'Slack/Drive Sync'],
  },
  'Julius AI': {
    ko: ['엑셀/CSV 데이터 분석', '파이썬 시각화', '인사이트 도출'],
    en: ['Excel/CSV Analytics', 'Python Charts', 'Data Insights'],
  },
  'Beautiful.ai': {
    ko: ['스마트 슬라이드', '자동 황금비율 디자인', '발표 자료'],
    en: ['Smart Slides', 'Auto Proportions', 'Presentation Decks'],
  },
  'Anysummary': {
    ko: ['영상/오디오 요약', '타임라인 리포트', '핵심 추출'],
    en: ['Media Summary', 'Timeline Reports', 'Key Takeaways'],
  },
  'AdCreative.ai': {
    ko: ['광고 배너 자동화', '전환율 최적화', '카피라이팅'],
    en: ['Ad Banners', 'Conversion Boost', 'Creative Copy'],
  },
  'Surfer': {
    ko: ['SEO 점수 측정', '검색엔진 상위노출', '콘텐츠 가이드'],
    en: ['SEO Scoring', 'Search Ranking', 'Content Editor'],
  },
  'Descript': {
    ko: ['텍스트 기반 영상 편집', '팟캐스트 제작', '보이스 오버'],
    en: ['Text-based Video Edit', 'Podcast Suite', 'Voiceover'],
  },
  'Synthflow AI': {
    ko: ['노코드 음성 에이전트', 'AI 콜센터', '전화 자동화'],
    en: ['No-code Voice Agent', 'AI Call Center', 'Outbound Calls'],
  },
  'Semrush AI': {
    ko: ['키워드 클러스터링', '경쟁사 분석', 'SEO 마케팅'],
    en: ['Keyword Clustering', 'Competitor Analysis', 'SEO Suite'],
  },
  'Murf AI': {
    ko: ['광고 내레이션', '200+ 자연스러운 음성', '오디오북'],
    en: ['Ad Narration', '200+ Natural Voices', 'Audiobooks'],
  },
  'Perplexity': {
    ko: ['실시간 출처 검색', '정확한 팩트체크', '대화형 검색엔진'],
    en: ['Cited Sources', 'Fact-checking', 'Answer Engine'],
  },
  'NotebookLM': {
    ko: ['구글 연구 노트', '2인 AI 팟캐스트', '문서 기반 분석'],
    en: ['Google Research Note', 'Audio Deep Dive', 'Source-grounded'],
  },
  'Elicit': {
    ko: ['논문 데이터베이스', '학술 연구 보조', '실증 결과 요약'],
    en: ['Research Papers', 'Literature Review', 'Evidence Synthesis'],
  },
  'Consensus': {
    ko: ['피어리뷰 논문 분석', '과학적 결론 교차검증', '학술 검색'],
    en: ['Peer-reviewed Papers', 'Scientific Consensus', 'Academic Search'],
  },
  'Scite AI': {
    ko: ['스마트 인용 지표', '반박/지지 문맥 분석', '논문 신뢰도'],
    en: ['Smart Citations', 'Context Analysis', 'Paper Reliability'],
  },
  'Genspark': {
    ko: ['스파크페이지 생성', '다중 모델 종합', '백과사전식 리포트'],
    en: ['Sparkpages', 'Multi-model Synthesis', 'Encyclopedia Report'],
  },
  'Meshy': {
    ko: ['텍스트→3D 모델', 'PBR 텍스처', '게임 에셋'],
    en: ['Text to 3D', 'PBR Textures', 'Game Assets'],
  },
  'Tripo 3D': {
    ko: ['초고속 3D 생성', '메타버스 오브젝트', '프롭 모델링'],
    en: ['Fast 3D Pipeline', 'Metaverse Props', 'Mesh Gen'],
  },
  'Manus / Devin': {
    ko: ['자율 AI 에이전트', '엔드투엔드 개발', '자율 웹서칭'],
    en: ['Autonomous Agent', 'End-to-End Dev', 'Auto Browsing'],
  },
  'n8n / Make': {
    ko: ['노코드 워크플로우', '비즈니스 자동화', 'API 연동'],
    en: ['No-code Workflow', 'Business Automation', 'API Integration'],
  },
  'AutoGPT': {
    ko: ['목표 기반 자율 실행', '오픈소스 에이전트', '하위 과업 생성'],
    en: ['Goal-driven Execution', 'Open-source Agent', 'Subtask Loop'],
  },
  'Fiscal.ai (구 FinChat)': {
    ko: ['기업 재무제표 분석', '어닝콜 대본 검색', '주가 지표'],
    en: ['Financial Analytics', 'Earnings Call Transcripts', 'Stock Metrics'],
  },
  'AlphaSense': {
    ko: ['기업 공시 문서 리서치', '증권사 리포트 분석', '기관 투자'],
    en: ['SEC Filing Search', 'Broker Research', 'Institutional AI'],
  },
  'Kavout AI': {
    ko: ['머신러닝 주식 분석', 'K-Score 투자 지표', '포트폴리오'],
    en: ['ML Stock Analysis', 'K-Score Metric', 'Portfolio Insights'],
  },
  'Khanmigo': {
    ko: ['소크라테스식 튜터', '수학·과학', '교사 도구'],
    en: ['Socratic Tutor', 'Math & Science', 'Teacher Tools'],
  },
  'Synthesis Tutor': {
    ko: ['어린이 수학', '게임형 수업', '맞춤 진도'],
    en: ['Kids Math', 'Game-like Lessons', 'Adaptive Pace'],
  },
  'Harvey AI': {
    ko: ['법률 리서치', '계약 검토', '로펌용'],
    en: ['Legal Research', 'Contract Review', 'Law Firms'],
  },
  'CoCounsel (Thomson Reuters)': {
    ko: ['판례 리서치', '문서 검토', '웨스트로 연동'],
    en: ['Case Research', 'Document Review', 'Westlaw Data'],
  },
  'Spellbook': {
    ko: ['워드 추가 기능', '위험 조항 표시', '계약서 초안'],
    en: ['Word Add-in', 'Risky Clauses', 'Contract Drafting'],
  },
};

/**
 * Returns 2-3 accurate feature tags for an AI tool.
 */
export function getToolFeatureTags(tool: AITool, lang: Language = 'ko'): string[] {
  // 1. If explicit tags exist on tool object
  if (tool.tags && tool.tags.length > 0) {
    return tool.tags.slice(0, 3);
  }

  // 2. Check curated authentic tags
  const curated = CURATED_TOOL_TAGS[tool.name];
  if (curated) {
    return (lang === 'en' ? curated.en : curated.ko).slice(0, 3);
  }

  // 3. Tools added in the browser have no curated tags: show the category name.
  return [getCategoryLabel(tool.category, lang)];
}

/** Tools most like this one: same category counts most, then each shared feature tag. */
export function getSimilarTools(tool: AITool, tools: AITool[], count = 4): AITool[] {
  const tags = new Set(getToolFeatureTags(tool));
  return tools
    .filter((t) => t.id !== tool.id)
    .map((t) => ({
      t,
      score: (t.category === tool.category ? 3 : 0) + getToolFeatureTags(t).filter((tag) => tags.has(tag)).length * 2,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.t.id - b.t.id)
    .slice(0, count)
    .map((x) => x.t);
}
