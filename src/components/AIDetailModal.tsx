import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Star, Copy, Check, Sparkles, Tag, Zap, Target, Lightbulb, Users, Info } from 'lucide-react';
import { AITool, BadgeInfo } from '../types';
import { BADGES } from '../data/aiToolsData';
import { CATEGORIES } from './CategoryTabs';
import { getCategoryLabel, getToolDescription, Language, UI_TEXT } from '../lib/translations';
import { AIFavicon } from './AIFavicon';

interface AIDetailModalProps {
  tool: AITool | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  lang?: Language;
}

interface ExtraToolDetailItem {
  tagline: { ko: string; en: string };
  highlights: { ko: string[]; en: string[] };
  useCases: { ko: string[]; en: string[] };
  proTip: { ko: string; en: string };
  targetAudience: { ko: string[]; en: string[] };
}

interface ExtraToolDetailResolved {
  tagline: string;
  highlights: string[];
  useCases: string[];
  proTip: string;
  targetAudience: string[];
}

const getExtraDetailResolved = (item: ExtraToolDetailItem, lang: Language): ExtraToolDetailResolved => {
  return {
    tagline: lang === 'en' ? item.tagline.en || item.tagline.ko : item.tagline.ko,
    highlights: lang === 'en' && item.highlights.en ? item.highlights.en : item.highlights.ko,
    useCases: lang === 'en' && item.useCases.en ? item.useCases.en : item.useCases.ko,
    proTip: lang === 'en' ? item.proTip.en || item.proTip.ko : item.proTip.ko,
    targetAudience: lang === 'en' && item.targetAudience.en ? item.targetAudience.en : item.targetAudience.ko,
  };
};

// Tailored supplementary details for specific popular tools
const TOOL_EXTRA_DETAILS: Record<string, ExtraToolDetailItem> = {
  ChatGPT: {
    tagline: {
      ko: '세계에서 가장 널리 사용되는 대화형 멀티모달 AI 엔진',
      en: 'The world’s most widely used conversational multimodal AI engine',
    },
    highlights: {
      ko: [
        'GPT-4o 모델 기반의 텍스트, 이미지, 오디오 실시간 멀티모달 처리',
        'Advanced Data Analysis로 엑셀, CSV 데이터 실시간 시각화 및 파이썬 코드 실행',
        '나만의 맞춤형 에이전트를 만들 수 있는 GPTs 스토어 제공',
        '웹 검색(Web Search) 연동으로 실시간 뉴스 및 데이터 수집',
      ],
      en: [
        'Real-time multimodal processing of text, images, and audio with GPT-4o',
        'Advanced Data Analysis for Excel/CSV data visualization & Python execution',
        'GPTs Store to build and publish your own custom AI agents',
        'Integrated Web Search for real-time news and data gathering',
      ],
    },
    useCases: {
      ko: [
        '업무 보고서, 이메일, 제안서 초안 즉시 작성',
        '복잡한 데이터 분석 및 차트 자동 생성',
        '프로그래밍 코드 작성, 디버깅 및 알고리즘 설명',
        '외국어 문서 번역 및 자연스러운 문맥 수정',
      ],
      en: [
        'Draft business reports, emails, and proposals instantly',
        'Analyze complex data and auto-generate visual charts',
        'Write, debug, and explain programming code and algorithms',
        'Translate foreign language documents with natural context',
      ],
    },
    proTip: {
      ko: '설정에서 [Custom Instructions]를 활성화하여 본인의 직업, 선호하는 답변 톤앤매너를 등록해 두면 매번 동일하게 프롬프트를 입력할 필요가 없습니다.',
      en: 'Enable [Custom Instructions] in Settings to store your occupation and preferred tone, avoiding repetitive prompt typing.',
    },
    targetAudience: {
      ko: ['기획자', '마케터', '개발자', '대학생', '직장인'],
      en: ['Planners', 'Marketers', 'Developers', 'Students', 'Professionals'],
    },
  },
  Claude: {
    tagline: {
      ko: '가장 논리적이고 인간적인 문맥 이해력을 갖춘 AI 프론티어 모델',
      en: 'Frontier AI model with unmatched logical reasoning and nuanced context understanding',
    },
    highlights: {
      ko: [
        'Claude 3.5 Sonnet의 업계 최고 수준 코드 생성 및 논리적 추론 능력',
        '200,000 토큰(책 한 권 분량)에 달하는 대용량 문맥 처리 한계',
        'Artifacts 기능: 우측 창에서 React UI, SVG, 다이어그램 라이브 프리뷰',
        '환각(Hallucination) 현상이 매우 적어 전문 문서 분석에 최적',
      ],
      en: [
        'Industry-leading code generation and reasoning powered by Claude 3.5 Sonnet',
        'Massive 200,000-token context window (book-length analysis capacity)',
        'Artifacts feature: Live preview of React UI, SVG, and diagrams in side panel',
        'Exceptionally low hallucination rate ideal for professional document analysis',
      ],
    },
    useCases: {
      ko: [
        '수백 페이지에 달하는 PDF 계약서, 학술 논문 심층 분석 및 요약',
        '프론트엔드 UI 컴포넌트 실시간 설계 및 웹 앱 코딩',
        '장문의 스토리텔링, 블로그 글, 창의적 기획서 작성',
      ],
      en: [
        'Deep analysis and summarization of multi-page PDF contracts & research papers',
        'Real-time frontend UI component design & web app coding',
        'Long-form storytelling, blog writing, and creative proposals',
      ],
    },
    proTip: {
      ko: 'Artifacts 창을 켜둔 상태에서 "이 UI의 색상을 다크모드로 바꾸고 버튼 애니메이션을 추가해줘"라고 요청하면 즉시 우측에서 변경된 화면을 볼 수 있습니다.',
      en: 'With Artifacts active, request "Change this UI to dark mode and add button animation" to see live updates instantly.',
    },
    targetAudience: {
      ko: ['개발자', '연구원', '콘텐츠 작가', '비즈니스 기획자'],
      en: ['Developers', 'Researchers', 'Writers', 'Business Analysts'],
    },
  },
  Gemini: {
    tagline: {
      ko: '구글 워크스페이스 생태계와 완벽 통합된 차세대 멀티모달 AI',
      en: 'Next-gen multimodal AI seamlessly integrated with Google Workspace',
    },
    highlights: {
      ko: [
        '최대 2,000,000 토큰에 달하는 압도적인 대용량 컨텍스트 창',
        'Google Drive, Gmail, Docs와 직접 연동되는 내장 확장 기능(@)',
        'Deep Research: 수십 개 웹 소스를 스스로 조사해 심층 종합 보고서 작성',
        '실시간 웹 서칭 및 유투브 자막 분석 내장',
      ],
      en: [
        'Unrivaled 2,000,000-token long context window',
        'Built-in Google Extensions (@) connecting directly to Drive, Gmail & Docs',
        'Deep Research: Autonomous multi-source web investigation for deep reports',
        'Native real-time web search and YouTube transcript analysis',
      ],
    },
    useCases: {
      ko: [
        '내 구글 드라이브 문서 전체에서 필요한 자료 즉시 찾아내기',
        '1시간이 넘는 긴 유튜브 영상 핵심 요약 및 타임스탬프 추출',
        '시장 조사 및 경쟁사 동향 심층 딥 리서치(Deep Research) 보고서 작성',
      ],
      en: [
        'Instantly locate necessary files across your entire Google Drive',
        'Summarize 1+ hour long YouTube videos with key timestamp extraction',
        'Conduct deep market research & competitor analysis reports',
      ],
    },
    proTip: {
      ko: '프롬프트 입력창에 `@Google Drive` 또는 `@Gmail`을 치면 내 이메일이나 문서 안의 특정 파일 내용을 직접 불러와 질문할 수 있습니다.',
      en: 'Type `@Google Drive` or `@Gmail` in the prompt box to cite specific files or emails directly in your queries.',
    },
    targetAudience: {
      ko: ['구글 사용자', '시장 조사원', '대학생', '마케터'],
      en: ['Google Users', 'Researchers', 'Students', 'Marketers'],
    },
  },
  DeepSeek: {
    tagline: {
      ko: '추론 단계(Chain-of-Thought)를 투명하게 보여주는 오픈소스 라이징 스타',
      en: 'Rising open-source star showcasing transparent Chain-of-Thought reasoning',
    },
    highlights: {
      ko: [
        'DeepSeek-R1 추론 특화 모델로 복잡한 논리 문제 명쾌하게 해결',
        'AI가 결론에 도달하기까지의 사고 과정(Think)을 실시간 시각화',
        '수학, 프로그래밍, 논리 수수께끼 분야에서 GPT-4o에 버금가는 성능',
        '완전 무료 제공으로 경제적 부담 제로',
      ],
      en: [
        'DeepSeek-R1 reasoning model for solving complex logic problems',
        'Real-time visual display of step-by-step thinking process (Think)',
        'Performance matching GPT-4o in mathematics, coding, and logic puzzles',
        '100% free access with zero subscription cost',
      ],
    },
    useCases: {
      ko: [
        '고난도 코딩 알고리즘 문제 풀이 및 버그 원인 추론',
        '수학 정리 증명 및 복잡한 수식 단계별 해설',
        '논리학, 철학, 정책 분석 등 심층적인 논쟁 구도 검토',
      ],
      en: [
        'Solving difficult coding algorithms & inferring bug root causes',
        'Step-by-step mathematical proof and complex equation solving',
        'Examining deep philosophical arguments, policy frameworks, and logic puzzles',
      ],
    },
    proTip: {
      ko: 'DeepSeek의 [Think] 토글을 켜면 모델이 어떻게 가설을 세우고 오류를 스스로 수정하면서 정답에 도달했는지 논리적 고리를 확인할 수 있습니다.',
      en: 'Toggle [Think] to observe how the AI forms hypotheses, self-corrects errors, and arrives at solutions.',
    },
    targetAudience: {
      ko: ['개발자', '수학자', '학생', 'AI 연구자'],
      en: ['Developers', 'Mathematicians', 'Students', 'AI Researchers'],
    },
  },
  Midjourney: {
    tagline: {
      ko: '디자이너와 아티스트를 위한 독보적 퀄리티의 비주얼 생성 AI',
      en: 'Unrivaled image generation AI for designers and visual artists',
    },
    highlights: {
      ko: [
        '하이엔드 잡지 화보급 영화 같은 조명, 질감, 구도 표현력',
        '--sref (Style Reference) 기능으로 특정 화풍 및 브랜딩 스타일 유지',
        '--cref (Character Reference) 기능으로 인물의 얼굴 일관성 유지',
        '웹 기반 직관적 인터페이스 및 디스코드 커뮤니티 지원',
      ],
      en: [
        'Photorealistic lighting, textures, and cinematic compositions',
        '--sref (Style Reference) to maintain brand aesthetic consistency',
        '--cref (Character Reference) for consistent character facial identity',
        'Intuitive web interface and vibrant Discord community',
      ],
    },
    useCases: {
      ko: [
        '게임 컨셉 아트, 캐릭터 디자인, 배경 3D 렌더링',
        '패션 시안, 제품 포스터, 영화 썸네일 아트워크',
        '앨범 커버, 책 표지, 브랜드 그래픽 비주얼 제작',
      ],
      en: [
        'Game concept art, character design, and 3D environment rendering',
        'Fashion mockups, product posters, and movie thumbnail artwork',
        'Album covers, book jackets, and brand visual assets',
      ],
    },
    proTip: {
      ko: '마음에 드는 스타일 이미지 URL을 준비한 뒤 프롬프트 끝에 `--sref [이미지URL]`을 붙이면 해당 분위기의 그래픽을 일정하게 생성할 수 있습니다.',
      en: 'Append `--sref [imageURL]` to your prompt to replicate the exact artistic style of a reference image.',
    },
    targetAudience: {
      ko: ['그래픽 디자이너', '컨셉 아티스트', '광고 기획자', '크리에이터'],
      en: ['Graphic Designers', 'Concept Artists', 'Art Directors', 'Creators'],
    },
  },
  Cursor: {
    tagline: {
      ko: 'AI가 개발 환경 속에 녹아든 차세대 개발자 필수 IDE',
      en: 'Next-gen AI-native code editor built for peak developer velocity',
    },
    highlights: {
      ko: [
        'VS Code를 기반으로 제작되어 기존 확장 프로그램과 100% 호환',
        'Cmd + K: 자연어로 파일 내 코드 즉시 수정 및 리팩토링',
        'Composer (Cmd + I): 프로젝트 내 수많은 파일을 동시에 생성 및 연동 수정',
        '@Codebase 명령어: 내 프로젝트 전체 코드를 이해하고 답변 제공',
      ],
      en: [
        'Built on VS Code for 100% compatibility with existing extensions',
        'Cmd + K: In-line code generation, refactoring, and editing with natural language',
        'Composer (Cmd + I): Multi-file simultaneous generation and codebase editing',
        '@Codebase command: Deep understanding of your entire project repository',
      ],
    },
    useCases: {
      ko: [
        '새로운 풀스택 웹 앱 아이디어를 10분 만에 초안 구현',
        '복잡한 레거시 코드베이스의 구조 파악 및 리팩토링',
        '외부 API SDK 및 신규 라이브러리 빠르고 정확하게 도입',
      ],
      en: [
        'Build and prototype full-stack web applications in under 10 minutes',
        'Understand and refactor complex legacy codebases',
        'Rapidly integrate external API SDKs and third-party libraries',
      ],
    },
    proTip: {
      ko: '프로젝트 루트에 `.cursorrules` 파일을 만들고 기술 스택 규칙과 규칙을 정의하면 AI가 내 코드 스타일에 맞춰 코드를 작성해 줍니다.',
      en: 'Create a `.cursorrules` file in your root folder to define coding guidelines, ensuring generated code matches your project style.',
    },
    targetAudience: {
      ko: ['프론트엔드/백엔드 개발자', '스타트업 창업가', '1인 개발자'],
      en: ['Frontend/Backend Developers', 'Startup Founders', 'Indie Hackers'],
    },
  },
  'Runway Gen-3': {
    tagline: {
      ko: '영화 감독처럼 정교하게 컨트롤하는 할리우드급 AI 비디오 파이프라인',
      en: 'Hollywood-grade AI video pipeline with camera and motion control',
    },
    highlights: {
      ko: [
        '모션 브러시(Motion Brush)로 특정 구역만 선택해서 카메라 움직임 부여',
        '시네마틱 카메라 제어(Zoom, Pan, Tilt, Rack Focus) 지원',
        '이미지-투-비디오(Image-to-Video) 변환 시 압도적인 일관성',
      ],
      en: [
        'Motion Brush for selective area animation and motion paths',
        'Cinematic camera controls (Zoom, Pan, Tilt, Rack Focus)',
        'Unmatched visual consistency in Image-to-Video generation',
      ],
    },
    useCases: {
      ko: [
        '시제품 홍보 시네마틱 숏폼 비디오 제작',
        '뮤직비디오, 영화 스토리보드 영상화',
        '스틸컷 연출 이미지를 살아 움직이는 모션 그래픽으로 변환',
      ],
      en: [
        'Cinematic short-form video production for product promos',
        'Music videos and movie storyboard visualization',
        'Converting still illustrations into living motion graphics',
      ],
    },
    proTip: {
      ko: '먼저 Midjourney로 정교한 이미지를 만든 후 Runway Gen-3에 업로드하여 모션 브러시를 적용하면 훨씬 매끄럽고 일관된 고화질 비디오가 나옵니다.',
      en: 'Generate a high-res image with Midjourney first, then upload to Runway Gen-3 and apply Motion Brush for smooth, consistent video output.',
    },
    targetAudience: {
      ko: ['영상 크리에이터', 'CF 감독', '마케터', '3D 아티스트'],
      en: ['Video Creators', 'CF Directors', 'Marketers', '3D Artists'],
    },
  },
  'Suno AI': {
    tagline: {
      ko: '가사와 분위기만 적으면 1분 만에 완성되는 오디오 작곡 AI',
      en: 'Audio composition AI that creates full songs in 1 minute from lyrics',
    },
    highlights: {
      ko: [
        '장르(K-Pop, Jazz, Lo-Fi, Rock 등), 분위기, 가사만으로 풀 트랙 완성',
        '남성/여성 보컬의 감정 표현력과 후크(Hook) 구간 자동 구성',
        '곡 연장(Extend), 파트 수정, 커스텀 가사 오디오 매칭 기능',
      ],
      en: [
        'Full track generation across genres (K-Pop, Jazz, Lo-Fi, Rock, etc.)',
        'Expressive male/female vocal performance with catchy hook sections',
        'Song extension, section editing, and custom lyric matching',
      ],
    },
    useCases: {
      ko: [
        '유튜브 브이로그 및 영상 배경음악(BGM) 제작',
        '브랜드 CM송, 이벤트 로고송, 개인 소장용 음악 작곡',
        '나만의 자작곡 가사에 멜로디 붙여 음원 초안 만들기',
      ],
      en: [
        'Background music (BGM) for YouTube vlogs and videos',
        'Brand CM songs, event jingles, and personal music tracks',
        'Adding melodies to original lyrics to create song drafts',
      ],
    },
    proTip: {
      ko: '[Custom Mode]를 활성화하고 가사 단락마다 [Verse], [Chorus], [Bridge], [Outro] 태그를 달아주면 곡 구조가 한층 탄탄해집니다.',
      en: 'Enable [Custom Mode] and tag lyric sections with [Verse], [Chorus], [Bridge], and [Outro] for a well-structured song.',
    },
    targetAudience: {
      ko: ['음악 입문자', '유튜버', '광고 기획자', '작사가'],
      en: ['Music Beginners', 'YouTubers', 'Ad Planners', 'Lyricists'],
    },
  },
  Sora: {
    tagline: {
      ko: '현실의 물리 법칙을 정교하게 이해하는 OpenAI의 시네마틱 비디오 제너레이터',
      en: 'OpenAI’s cinematic video generator with deep physics understanding',
    },
    highlights: {
      ko: [
        '최대 1080p 고해상도의 1분 분량 시네마틱 영상 연속 생성',
        '물체 간의 충돌, 재질, 빛 반사 등 현실 물리 법칙 자연스럽게 반영',
        '단일 카메라 구도뿐만 아니라 자연스러운 씬 전환 및 캐릭터 지속력',
      ],
      en: [
        'Continuous 1-minute 1080p high-resolution cinematic video generation',
        'Natural simulation of real-world physics, lighting, and textures',
        'Seamless camera transitions and character persistence across shots',
      ],
    },
    useCases: {
      ko: [
        '영화 및 광고 콘셉트 티저 비디오 제작',
        '현실에서 촬영하기 어려운 가상 시뮬레이션 장면 연출',
        '디지털 아트워크 전시 영상 제작',
      ],
      en: [
        'Teaser videos for film and advertising concepts',
        'Virtual simulation scenes difficult or impossible to film in reality',
        'Digital artwork exhibition video production',
      ],
    },
    proTip: {
      ko: '프롬프트 작성 시 조명(e.g., golden hour, Volumetric lighting)과 카메라 렌즈(e.g., 35mm lens, macro shot) 명칭을 포함하면 영화 같은 분위기가 연출됩니다.',
      en: 'Include specific lighting (e.g., golden hour, volumetric lighting) and lens terms (e.g., 35mm lens, macro shot) for a cinematic mood.',
    },
    targetAudience: {
      ko: ['영상 감독', '광고대행사', '비주얼 디자이너'],
      en: ['Film Directors', 'Ad Agencies', 'Visual Designers'],
    },
  },
  'Wrtn (뤼튼)': {
    tagline: {
      ko: '한국어 언어 맥락에 가장 최적화된 올인원 무료 AI 포털',
      en: 'All-in-one free AI portal optimized for Korean language context',
    },
    highlights: {
      ko: [
        'GPT-4o, Claude 3.5 Sonnet 등 최신 최고 성능 LLM을 한곳에서 무료 이용',
        '한국 비즈니스 환경에 특화된 툴(자기소개서, 이메일, 광고 카피) 제공',
        '나만의 AI 챗봇 스토어 및 검색 엔진 통합',
      ],
      en: [
        'Free access to top LLMs including GPT-4o and Claude 3.5 Sonnet in one place',
        'Specialized tools for business drafting (resumes, emails, ad copy)',
        'Custom AI Chatbot Store and integrated AI search engine',
      ],
    },
    useCases: {
      ko: [
        '한국어 블로그 포스팅, 인스타그램 캡션 작성',
        '소상공인 상품 상세페이지 설명 문구 자동화',
        '대학생 과제 초안 및 기업 자기소개서 교정',
      ],
      en: [
        'Blog posts, Instagram captions, and social copy',
        'Automated product detail descriptions for store owners',
        'College assignment drafts and cover letter polishing',
      ],
    },
    proTip: {
      ko: '뤼튼의 [AI 툴 모음] 탭에서 원하는 작성 포맷을 선택하면 입력폼만 채워도 고품질 문장이 자동 생성됩니다.',
      en: 'Select your desired writing format in the AI Tools tab to generate high-quality text by simply filling in form fields.',
    },
    targetAudience: {
      ko: ['소상공인', '마케터', '대학생', '취준생'],
      en: ['Small Business Owners', 'Marketers', 'Students', 'Job Seekers'],
    },
  },
};

// Fallback generator for tools not individually listed above
const getFallbackDetails = (tool: AITool): ExtraToolDetailItem => {
  const cat = tool.category;

  if (cat.includes('기획') || cat.includes('글쓰기')) {
    return {
      tagline: {
        ko: `${tool.name} - 아이디어 구상과 효율적인 텍스트 작성을 돕는 전문 AI`,
        en: `${tool.name} - Professional AI assisting in ideation and efficient text generation`,
      },
      highlights: {
        ko: [
          '자연스러운 문장 구성 및 문맥에 맞는 내용 자동 보완',
          '긴 문단 요약, 핵심 포인트 추출 및 브레인스토밍 기능',
          '다양한 글쓰기 톤앤매너 변경 및 맞춤법 정교 교정',
        ],
        en: [
          'Natural sentence structuring and context-aware auto-completion',
          'Paragraph summarization, key point extraction, and brainstorming',
          'Custom writing tone adjustments and precise grammar correction',
        ],
      },
      useCases: {
        ko: ['업무 보고서 및 제안서 작성', '블로그·SNS 스크립트 작성', '자료 정리 및 아이디어 도출'],
        en: ['Writing business reports & proposals', 'Drafting blog & social media scripts', 'Organizing research & ideation'],
      },
      proTip: {
        ko: '원하는 목적(예: "상사 보고용으로 경어체를 사용하여 3줄 요약해줘")을 명확히 제시하면 훨씬 만족스러운 결과를 얻을 수 있습니다.',
        en: 'Clearly state your goal (e.g. "Summarize in 3 bullet points with a formal tone for executive reporting").',
      },
      targetAudience: {
        ko: ['기획자', '직장인', '콘텐츠 크리에이터'],
        en: ['Planners', 'Professionals', 'Content Creators'],
      },
    };
  }

  if (cat.includes('디자인') || cat.includes('이미지')) {
    return {
      tagline: {
        ko: `${tool.name} - 고퀄리티 시각 자료와 비주얼을 신속하게 구현하는 AI`,
        en: `${tool.name} - AI for rapidly rendering high-quality visual materials`,
      },
      highlights: {
        ko: [
          '텍스트 명령어나 이미지 기반의 고화질 비주얼 자동 생성',
          '스타일 매칭, 레이아웃 추천 및 그래픽 보정 기능',
          '디자이너 작업 시간 절감을 위한 맞춤형 워크플로우 지원',
        ],
        en: [
          'Automated generation of high-res visuals from prompts or images',
          'Style matching, layout recommendation, and graphic touch-ups',
          'Tailored workflows to save design iteration time',
        ],
      },
      useCases: {
        ko: ['마케팅 배너 및 SNS 이미지 제작', '웹/앱 UI 컨셉 시안 구상', '포스터 및 시각 자료 제작'],
        en: ['Creating marketing banners & social images', 'Drafting web/app UI concept mockups', 'Designing posters & graphics'],
      },
      proTip: {
        ko: '주요 메인 컬러, 구도, 아트 스타일(예: "Minimalist, 3D render, octane render") 키워드를 포함해 보세요.',
        en: 'Include key color palettes, composition, and art style keywords (e.g., "Minimalist, 3D render, octane render").',
      },
      targetAudience: {
        ko: ['디자이너', '마케터', '크리에이터'],
        en: ['Designers', 'Marketers', 'Creators'],
      },
    };
  }

  if (cat.includes('영상') || cat.includes('오디오')) {
    return {
      tagline: {
        ko: `${tool.name} - 차세대 멀티미디어 콘텐츠를 위한 미디어 생성 AI`,
        en: `${tool.name} - Media synthesis AI for next-gen multimedia content`,
      },
      highlights: {
        ko: [
          '텍스트나 스틸 컷 기반의 자연스러운 모션/음성 자동 합성',
          '빠른 영상 편집, 자막 자동화, 음성 복제 및 BGM 생성',
          '쇼츠, 릴스 등 숏폼 콘텐츠 최적화 제작 기능',
        ],
        en: [
          'Automated motion and voice synthesis from text or still shots',
          'Fast video editing, auto-captioning, voice cloning, and BGM creation',
          'Optimized creation flow for Shorts, Reels, and short-form video',
        ],
      },
      useCases: {
        ko: ['유튜브 및 숏폼 영상 제작', '기업 홍보 영상 및 오디오 더빙', '배경음악 및 효과음 창작'],
        en: ['YouTube & short-form video creation', 'Corporate promos & audio dubbing', 'Creating background music & SFX'],
      },
      proTip: {
        ko: '원하는 비트수, 분위기 또는 카메라 액션 명칭을 구체적으로 입력해 보세요.',
        en: 'Provide specific tempo, mood, or camera movement names in your prompt.',
      },
      targetAudience: {
        ko: ['영상 편집자', '유튜버', '마케터'],
        en: ['Video Editors', 'YouTubers', 'Marketers'],
      },
    };
  }

  if (cat.includes('개발') || cat.includes('데이터')) {
    return {
      tagline: {
        ko: `${tool.name} - 생산성을 극대화하는 개발자 & 데이터 전문 AI`,
        en: `${tool.name} - Specialized AI for developer velocity and data processing`,
      },
      highlights: {
        ko: [
          '자동 코드 완성, 리팩토링 및 버그 자동 탐지',
          '복잡한 데이터 구조 분석 및 SQL/파이썬 쿼리 자동 작성',
          '신규 기술 스택 학습 및 알고리즘 해설',
        ],
        en: [
          'Auto code completion, refactoring, and bug detection',
          'Complex data structure analysis & auto SQL/Python query drafting',
          'Accelerated tech stack learning and algorithm explanation',
        ],
      },
      useCases: {
        ko: ['프로그램 개발 및 코드 작성', '데이터 가공 및 자동 분석', '코드 리뷰 및 성능 최적화'],
        en: ['Software development & coding', 'Data transformation & automated analysis', 'Code review & performance optimization'],
      },
      proTip: {
        ko: '에러 메시지 전체를 복사하여 전달하면 원인 분석과 수정 코드를 즉시 제안받을 수 있습니다.',
        en: 'Paste the complete error stack trace to get root-cause analysis and fixed code snippets instantly.',
      },
      targetAudience: {
        ko: ['개발자', '데이터 분석가', '엔지니어'],
        en: ['Developers', 'Data Analysts', 'Engineers'],
      },
    };
  }

  return {
    tagline: {
      ko: `${tool.name} - ${tool.category} 분야의 스마트한 작업을 지원하는 AI 솔루션`,
      en: `${tool.name} - Smart AI solution empowering productivity in ${getCategoryLabel(tool.category, 'en')}`,
    },
    highlights: {
      ko: [
        '반복적인 업무 절차 자동화 및 생산성 혁신',
        '전문적인 분야 지식 기반 분석 및 최적의 대안 제시',
        '사용자 맞춤형 설정 및 신속한 결과 도출',
      ],
      en: [
        'Automates repetitive workflows to supercharge productivity',
        'Provides domain-specific insights and optimal recommendations',
        'Customizable settings for swift, tailored execution',
      ],
    },
    useCases: {
      ko: ['업무 프로세스 효율화', '전문 데이터 조회 및 결과 가공', '맞춤형 솔루션 구축'],
      en: ['Streamlining business processes', 'Domain data query & result processing', 'Building tailored AI solutions'],
    },
    proTip: {
      ko: '구체적인 가이드라인과 예시 입력(Few-shot)을 함께 제공하면 답변 품질이 대폭 향상됩니다.',
      en: 'Providing clear guidelines and few-shot examples significantly improves generation quality.',
    },
    targetAudience: {
      ko: ['전문가', '직장인', '스마트 워커'],
      en: ['Experts', 'Professionals', 'Smart Workers'],
    },
  };
};

export const AIDetailModal: React.FC<AIDetailModalProps> = ({
  tool,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  lang = 'ko',
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !tool) return null;

  const badge: BadgeInfo | undefined = BADGES[tool.id];
  const categoryInfo = CATEGORIES.find((c) => c.label === tool.category);

  // Get rich supplementary details resolved for current language
  const currentLang: Language = (lang || 'ko') as Language;
  const rawDetails = TOOL_EXTRA_DETAILS[tool.name] || getFallbackDetails(tool);
  const extraDetails = getExtraDetailResolved(rawDetails, currentLang);

  // Core description resolved for language
  const coreDesc = getToolDescription(tool, currentLang);

  const getPriceBadgeStyle = (price: string, l: Language) => {
    if (price === '무료') {
      return { bg: 'bg-[#00d4aa]/15', text: 'text-[#00d4aa]', border: 'border-[#00d4aa]/30', label: l === 'ko' ? '무료' : 'Free' };
    }
    if (price === '유료') {
      return { bg: 'bg-[#ff6b6b]/15', text: 'text-[#ff6b6b]', border: 'border-[#ff6b6b]/30', label: l === 'ko' ? '유료' : 'Paid' };
    }
    return { bg: 'bg-amber-400/15', text: 'text-amber-400', border: 'border-amber-400/30', label: l === 'ko' ? '무료/유료' : 'Free / Paid' };
  };

  const priceBadge = getPriceBadgeStyle(tool.price, currentLang);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tool.url) {
      navigator.clipboard.writeText(tool.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasHighlights = extraDetails.highlights && extraDetails.highlights.length > 0;
  const hasUseCases = extraDetails.useCases && extraDetails.useCases.length > 0;
  const hasProTip = Boolean(extraDetails.proTip && extraDetails.proTip.trim());
  const hasTargetAudience = extraDetails.targetAudience && extraDetails.targetAudience.length > 0;

  // Prepare active section elements
  const activeSections: React.ReactNode[] = [];

  if (hasHighlights) {
    activeSections.push(
      <div key="features" className="bg-[#1a1d2a] p-3.5 sm:p-5 rounded-2xl border border-white/10 space-y-2.5 min-w-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider font-['Space_Grotesk'] min-w-0">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">{UI_TEXT.modal.coreFeatures[currentLang]}</span>
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-gray-200 min-w-0">
          {extraDetails.highlights.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 leading-relaxed min-w-0">
              <span className="text-[#00d4aa] font-bold mt-0.5 shrink-0">•</span>
              <span className="break-words min-w-0 flex-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (hasUseCases) {
    activeSections.push(
      <div key="use-cases" className="bg-[#1a1d2a] p-3.5 sm:p-5 rounded-2xl border border-white/10 space-y-2.5 min-w-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6c63ff] uppercase tracking-wider font-['Space_Grotesk'] min-w-0">
          <Sparkles className="w-4 h-4 text-[#6c63ff] shrink-0" />
          <span className="truncate">{UI_TEXT.modal.useCases[currentLang]}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-300 min-w-0 w-full">
          {extraDetails.useCases.map((useCase, idx) => (
            <div key={idx} className="flex items-center gap-2.5 bg-[#0c0e14]/70 p-2.5 sm:p-3 rounded-xl border border-white/5 h-full min-w-0 w-full overflow-hidden">
              <span className="text-[#00d4aa] font-bold shrink-0">✨</span>
              <span className="font-medium text-gray-200 leading-snug break-words min-w-0 flex-1">{useCase}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hasProTip || hasTargetAudience) {
    activeSections.push(
      <div key="tips-audience" className={`grid grid-cols-1 ${hasProTip && hasTargetAudience ? 'sm:grid-cols-3' : 'grid-cols-1'} gap-3 min-w-0 w-full`}>
        {/* AI 활용 팁 Box */}
        {hasProTip && (
          <div className={`${hasTargetAudience ? 'sm:col-span-2' : 'col-span-1'} bg-gradient-to-br from-[#1a1d2a] to-[#0c0e14] p-3.5 sm:p-4 rounded-2xl border border-amber-400/20 space-y-2 min-w-0`}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-['Space_Grotesk'] min-w-0">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span className="truncate">{UI_TEXT.modal.aiTip[currentLang]}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal break-words min-w-0 whitespace-pre-line">
              {extraDetails.proTip}
            </p>
          </div>
        )}

        {/* 추천 대상 Box */}
        {hasTargetAudience && (
          <div className={`${hasProTip ? 'col-span-1' : 'col-span-1'} bg-[#1a1d2a] p-3.5 sm:p-4 rounded-2xl border border-white/10 space-y-2.5 flex flex-col justify-start min-w-0`}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 font-['Space_Grotesk'] min-w-0">
              <Users className="w-4 h-4 text-[#00d4aa] shrink-0" />
              <span className="truncate">{UI_TEXT.modal.targetUsers[currentLang]}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {extraDetails.targetAudience.map((target, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#6c63ff]/20 text-[#00d4aa] border border-[#00d4aa]/30 break-words max-w-full truncate"
                >
                  #{target}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#13151f] border border-white/20 rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl shadow-black relative my-auto animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col text-left min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6c63ff] via-[#00d4aa] to-[#6c63ff]" />

        {/* Modal Header Container (Fixed Top) */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-4 pb-3.5 sm:pb-4 border-b border-white/10 shrink-0 min-w-0 w-full">
          {/* Left Column: Badges + AI Icon + Name + Description */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Badges Row */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 w-full">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1a1d2a] border border-white/10 text-gray-300 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <span>{categoryInfo?.icon || '💡'}</span>
                <span>{getCategoryLabel(tool.category, currentLang)}</span>
              </span>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${priceBadge.bg} ${priceBadge.text} ${priceBadge.border} whitespace-nowrap shrink-0`}>
                {priceBadge.label}
              </span>

              {badge && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#6c63ff]/20 text-[#6c63ff] border border-[#6c63ff]/30 uppercase font-['Space_Grotesk'] whitespace-nowrap shrink-0">
                  ✨ {badge.label}
                </span>
              )}

              {tool.isCustom && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap shrink-0">
                  {UI_TEXT.card.userAdded[currentLang]}
                </span>
              )}
            </div>

            {/* AI Icon & Name & Tagline */}
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 w-full pt-0.5">
              <AIFavicon
                url={tool.url}
                name={tool.name}
                customIcon={tool.icon || tool.iconUrl || tool.logoUrl}
                size={128}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shrink-0 mt-0.5 shadow-md border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug break-words min-w-0">
                  {tool.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 font-normal mt-0.5 sm:mt-1 leading-relaxed line-clamp-2 break-words min-w-0">
                  {extraDetails.tagline || coreDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Top Action Buttons (Bookmark & Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pt-0.5">
            {/* Bookmark Button */}
            <button
              onClick={() => onToggleBookmark(tool.id)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold ${
                isBookmarked
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                  : 'bg-[#1a1d2a] border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-400/30'
              }`}
              title={isBookmarked ? UI_TEXT.modal.bookmarked[currentLang] : UI_TEXT.modal.bookmark[currentLang]}
              aria-label={isBookmarked ? UI_TEXT.modal.bookmarked[currentLang] : UI_TEXT.modal.bookmark[currentLang]}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">
                {isBookmarked ? UI_TEXT.modal.bookmarked[currentLang] : UI_TEXT.modal.bookmark[currentLang]}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 sm:p-2 rounded-xl bg-[#1a1d2a] hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title={UI_TEXT.modal.close[currentLang]}
              aria-label={UI_TEXT.modal.close[currentLang]}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-3.5 sm:space-y-4 py-3.5 sm:py-4 pr-1 flex-1 min-h-0 min-w-0 no-scrollbar">
          {activeSections.map((section, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div className="border-t border-white/10 my-1 sm:my-2" />}
              {section}
            </React.Fragment>
          ))}
        </div>

        {/* Footer Container (Fixed Bottom) */}
        <div className="pt-3.5 border-t border-white/10 shrink-0 space-y-3 mt-auto">
          {/* Official Website URL & Copy Address */}
          {tool.url && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-0.5">
                <span>{UI_TEXT.modal.officialWebsite[currentLang]}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0c0e14] p-2 rounded-xl border border-white/10 min-w-0">
                <span className="text-xs text-gray-300 font-mono truncate flex-1 px-1 min-w-0">
                  {tool.url}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-[#1a1d2a] hover:bg-white/10 text-gray-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title={UI_TEXT.modal.copyUrl[currentLang]}
                  aria-label={UI_TEXT.modal.copyUrl[currentLang]}
                >
                  {copied ? (
                    <span className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <Check className="w-3.5 h-3.5 text-[#00d4aa]" />
                      <span className="text-[#00d4aa] font-bold">{UI_TEXT.modal.urlCopied[currentLang]}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5" />
                      <span>{UI_TEXT.modal.copyUrl[currentLang]}</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Official Site & Close */}
          <div className="flex items-center gap-2.5">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#6c63ff] to-[#5b52e0] hover:from-[#5b52e0] hover:to-[#4a42cd] text-white font-bold text-sm font-['Space_Grotesk'] rounded-xl transition-all shadow-lg shadow-[#6c63ff]/25 active:scale-98"
            >
              <span>{UI_TEXT.modal.visitWebsite[currentLang]}</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>

            <button
              onClick={onClose}
              className="px-5 py-3 bg-[#1a1d2a] hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-sm rounded-xl transition-all border border-white/10 cursor-pointer shrink-0"
            >
              {UI_TEXT.modal.close[currentLang]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

