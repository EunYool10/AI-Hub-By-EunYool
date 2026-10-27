import { AITool, BadgeInfo } from '../types';

export const INITIAL_AI_TOOLS: AITool[] = [
  // 기획/글쓰기
  { id: 1, name: "ChatGPT", category: "기획/글쓰기", description: "가장 범용적인 대화형 AI. 보고서 초안 작성, 텍스트 요약, 브레인스토밍 등 모든 문서 작업의 필수재.", descriptionEn: "The most versatile conversational AI. Essential for drafting reports, summarizing text, brainstorming, and writing.", url: "https://chatgpt.com", price: "무료/유료" },
  { id: 2, name: "Claude", category: "기획/글쓰기", description: "앤트로픽의 AI. 업계 최고 수준의 문맥 이해도를 바탕으로 방대한 PDF 분석, 정밀한 논리적 글쓰기, 기획에 최적화.", descriptionEn: "Anthropic's AI with industry-leading context understanding. Optimized for large PDF analysis, logical writing, and planning.", url: "https://claude.ai", price: "무료/유료" },
  { id: 3, name: "Gemini", category: "기획/글쓰기", description: "구글의 멀티모달 AI. 방대한 토큰 컨텍스트 창을 지원하며, 최근 고도화된 'Deep Research' 기능으로 심층 자료 조사에 독보적.", descriptionEn: "Google's multimodal AI supporting massive context windows. Outstanding for deep research and real-time Google ecosystem integration.", url: "https://gemini.google.com", price: "무료/유료" },
  { id: 4, name: "Wrtn (뤼튼)", category: "기획/글쓰기", description: "한국어 맞춤형 비즈니스 이메일, 광고 카피, 블로그 포스팅 초안 생성에 최적화된 국내 대표 AI 포털.", descriptionEn: "Korea's leading AI portal optimized for business emails, ad copy, and blog post generation in Korean.", url: "https://wrtn.ai", price: "무료" },
  { id: 5, name: "Grok", category: "기획/글쓰기", description: "엘론 머스크 xAI의 모델. X(구 트위터) 플랫폼의 실시간 트렌드 및 최신 시사 정보를 가장 빠르게 반영하여 답변.", descriptionEn: "xAI model by Elon Musk. Answers queries rapidly by incorporating real-time trends and posts from X (Twitter).", url: "https://grok.com", price: "유료" },
  { id: 6, name: "Kimi", category: "기획/글쓰기", description: "초장문 콘텍스트 처리에 뛰어난 성능을 보이며, 아시아권 리서치 및 웹 서칭 속도가 매우 빠른 언어 모델.", descriptionEn: "High-performance language model for ultra-long context processing and fast Asian research web searches.", url: "https://www.kimi.com", price: "무료" },
  { id: 41, name: "Perplexity Pages", category: "기획/글쓰기", description: "Perplexity의 AI 기반 롱폼 문서 생성 기능. 주제 하나로 구조화된 리포트·가이드를 자동 작성하고 웹에 바로 공유 가능.", descriptionEn: "AI-powered long-form document creation feature by Perplexity. Generates structured reports and guides easily.", url: "https://perplexity.ai", price: "무료/유료" },
  { id: 43, name: "Jasper AI", category: "기획/글쓰기", description: "마케터와 콘텐츠 팀을 위한 브랜드 보이스 기반 AI 카피라이터. 광고, 블로그, SNS 등 다양한 포맷 지원.", descriptionEn: "Brand voice-based AI copywriter for marketers and content teams across ads, blogs, and social posts.", url: "https://www.jasper.ai", price: "유료" },
  { id: 62, name: "DeepSeek", category: "기획/글쓰기", description: "중국발 오픈소스 추론 특화 모델. 수학·코딩·논리 문제에서 GPT-4급 성능을 무료로 제공해 전 세계적 화제를 모음.", descriptionEn: "Open-source reasoning model offering GPT-4 level performance in math, coding, and logic problems for free.", url: "https://chat.deepseek.com", price: "무료" },
  { id: 63, name: "Mistral AI", category: "기획/글쓰기", description: "유럽산 경량 오픈소스 LLM. 빠른 응답 속도와 낮은 비용으로 기업 자체 AI 구축 시 인기 높은 베이스 모델.", descriptionEn: "European open-source LLM famous for fast response times, efficiency, and low-cost enterprise deployment.", url: "https://chat.mistral.ai", price: "무료/유료" },
  { id: 65, name: "Copy.ai", category: "기획/글쓰기", description: "세일즈 카피, 이메일 시퀀스, 제품 설명 등 마케팅 문구를 100여 개 템플릿으로 빠르게 뽑아주는 AI 카피 툴.", descriptionEn: "AI copywriting tool that rapidly generates sales copy, email sequences, and product descriptions using 100+ templates.", url: "https://www.copy.ai", price: "무료/유료" },

  // 디자인/이미지
  { id: 7, name: "Midjourney", category: "디자인/이미지", description: "현존 최고 퀄리티 비주얼 생성 AI. 하이엔드 그래픽 디자인 시안, 마케팅 일러스트, 컨셉 아트 제작에 최고.", descriptionEn: "Top-tier visual generation AI for creating high-end graphic designs, marketing illustrations, and concept art.", url: "https://midjourney.com", price: "유료" },
  { id: 8, name: "Adobe Firefly", category: "디자인/이미지", description: "포토샵 내장형 AI로 상업적 저작권 안정성 확보. 이미지 생성, 개체 채우기, 배경 확장 등 디자이너 실무 가속화.", descriptionEn: "Commercial-safe generative AI embedded in Photoshop. Accelerates workflows with image expansion and fill.", url: "https://www.adobe.com", price: "무료/유료" },
  { id: 9, name: "Ideogram", category: "디자인/이미지", description: "이미지 내에 로고, 표지 텍스트 등의 타이포그래피를 깨짐 없이 가장 정확하고 선명하게 렌더링해 주는 이미지 AI.", descriptionEn: "Image AI with superior typography rendering for crisp logos, labels, and text inside generated artwork.", url: "https://ideogram.ai", price: "무료/유료" },
  { id: 10, name: "Figma AI", category: "디자인/이미지", description: "UI/UX 협업 툴 피그마에 자체 탑재되어, 말 한마디로 초기 앱/웹 와이어프레임 구조를 자동 설계해 주는 도구.", descriptionEn: "Built-in Figma tool that auto-generates early app/web wireframes and UI components from simple prompts.", url: "https://figma.com", price: "무료/유료" },
  { id: 45, name: "Canva AI", category: "디자인/이미지", description: "비디자이너도 쉽게 쓰는 디자인 플랫폼에 AI가 결합. 텍스트로 배경 생성, 오브젝트 제거, 자동 레이아웃 추천.", descriptionEn: "User-friendly design platform enhanced with AI for background generation, object removal, and layout suggestions.", url: "https://www.canva.com", price: "무료/유료" },
  { id: 46, name: "Leonardo AI", category: "디자인/이미지", description: "게임 아트, 캐릭터 디자인에 최적화된 이미지 생성 플랫폼. 파인튜닝 모델과 캔버스 편집 기능이 풍부.", descriptionEn: "Generative platform optimized for game art and character design with rich fine-tuned models and canvas controls.", url: "https://leonardo.ai", price: "무료/유료" },
  { id: 47, name: "Kling AI", category: "디자인/이미지", description: "중국 쾌수AI의 고퀄 이미지·영상 생성 툴. 포즈 컨트롤과 일관된 캐릭터 유지 기능이 뛰어남.", descriptionEn: "High-quality image and video generator by Kuaishou AI with strong pose control and character consistency.", url: "https://kling.ai", price: "무료/유료" },
  { id: 66, name: "Stable Diffusion", category: "디자인/이미지", description: "완전 오픈소스 이미지 생성 모델. 로컬 설치 및 커스텀 파인튜닝이 자유로워 개발자·연구자 커뮤니티에서 가장 활발.", descriptionEn: "Fully open-source image generation model offering complete freedom for local hosting and custom fine-tuning.", url: "https://stability.ai", price: "무료" },
  { id: 67, name: "Recraft AI", category: "디자인/이미지", description: "브랜드 아이덴티티에 맞는 벡터·래스터 이미지를 일관성 있게 생성. 스타일 잠금 기능으로 시리즈 디자인에 강점.", descriptionEn: "Generates consistent vector/raster imagery tailored to brand identity with style lock capabilities.", url: "https://www.recraft.ai", price: "무료/유료" },
  { id: 68, name: "Flux (Black Forest Labs)", category: "디자인/이미지", description: "Stable Diffusion 팀 출신이 만든 차세대 이미지 생성 모델. 사실감과 텍스트 렌더링 정확도에서 Midjourney에 도전장.", descriptionEn: "Next-generation image model created by ex-Stable Diffusion founders, challenging Midjourney in realism and text.", url: "https://bfl.ai", price: "무료/유료" },

  // 디자인 생성 (신규)
  { id: 101, name: "Stitch (구 Galileo AI)", category: "디자인 생성", description: "구글이 Galileo AI를 인수해 만든 UI 디자인 도구. 글이나 스케치로 설명하면 앱·웹 화면 시안과 프런트엔드 코드를 만들어 줌.", descriptionEn: "Google's UI design tool built from Galileo AI. Describe a screen in words or a sketch and get app/web mockups plus front-end code.", url: "https://stitch.withgoogle.com", price: "무료/유료" },
  { id: 102, name: "Uizard", category: "디자인 생성", description: "손으로 그린 와이어프레임 스케치나 아이디어 아이콘을 순식간에 고화질 프로토타입 앱 인터페이스로 변환.", descriptionEn: "Transforms hand-drawn wireframes and sketches into high-fidelity prototype app interfaces instantly.", url: "https://uizard.io", price: "무료/유료" },
  { id: 103, name: "Krea AI", category: "디자인 생성", description: "실시간 드로잉과 오버레이를 통해 원하는 비주얼 그래픽 디자인을 초고화질로 렌더링하는 차세대 인터랙티브 AI.", descriptionEn: "Next-gen interactive AI rendering visual graphic designs in real-time with ultra-high quality.", url: "https://www.krea.ai", price: "무료/유료" },

  // 영상/오디오
  { id: 12, name: "Runway", category: "영상/오디오", description: "영상 크리에이터들을 위한 최고 수준의 비디오 생성 및 변환 툴. 모션 브러시 등 정교한 카메라 무빙 제어 가능.", descriptionEn: "Premier video generation and transformation suite with precise camera motion brushes for creators.", url: "https://runway.com", price: "무료/유료" },
  { id: 13, name: "Synthesia", category: "영상/오디오", description: "대본만 입력하면 실제 사람과 똑같은 AI 아바타가 자연스러운 표정으로 발표하는 비즈니스 영상 제작.", descriptionEn: "Creates corporate videos featuring lifelike AI avatars presenting scripts with natural gestures.", url: "https://www.synthesia.io", price: "유료" },
  { id: 14, name: "Vrew (브루)", category: "영상/오디오", description: "음성 가독 자막 자동화, AI 보이스 내레이션, 간편한 텍스트 기반 컷 편집을 지원하는 국내 쇼츠/유튜브 올인원 편집기.", descriptionEn: "All-in-one text-based video editor supporting automated subtitles, voiceover, and rapid short-form editing.", url: "https://vrew.voyagerx.com", price: "무료/유료" },
  { id: 15, name: "ElevenLabs", category: "영상/오디오", description: "감정과 억양이 자연스럽게 녹아든 고품질 AI 성우 플랫폼. 전 세계 언어 번역 및 목소리 복제(Cloning) 지원.", descriptionEn: "Emotional and natural AI voice platform offering instant voice cloning and multilingual speech synthesis.", url: "https://elevenlabs.io", price: "무료/유료" },
  { id: 16, name: "Suno AI", category: "영상/오디오", description: "가사, 장르, 분위기만 텍스트로 적으면 단 1분 만에 보컬이 포함된 완성형 음악을 작곡해 주는 AI.", descriptionEn: "Composes full-fidelity songs with vocals and instrumentation from lyrics and mood prompts in seconds.", url: "https://suno.com", price: "무료/유료" },
  { id: 17, name: "viggle.ai", category: "영상/오디오", description: "고정된 이미지 캐릭터에 레퍼런스 무브먼트 영상을 매칭하여 자연스러운 댄스/액션 비디오를 생성하는 툴.", descriptionEn: "Matches reference movement videos to character images to create seamless dance and motion clips.", url: "https://viggle.ai", price: "무료/유료" },
  { id: 18, name: "Typecast", category: "영상/오디오", description: "수백 명의 개성 넘치는 오디오 캐릭터를 보유하여, 대본 입력만으로 고감도 감정 연기 연출이 가능한 더빙 툴.", descriptionEn: "Dubbing and voiceover tool featuring hundreds of unique audio characters with emotional acting depth.", url: "https://typecast.ai", price: "무료/유료" },
  { id: 48, name: "Udio", category: "영상/오디오", description: "텍스트 프롬프트로 고품질 음악을 생성하는 AI. 다양한 장르와 악기 조합이 가능하며 Suno와 함께 양대 산맥.", descriptionEn: "Generates high-fidelity music across diverse genres and arrangements, standing alongside Suno as a leader.", url: "https://www.udio.com", price: "무료/유료" },
  { id: 49, name: "HeyGen", category: "영상/오디오", description: "사진 한 장으로 실제처럼 말하는 AI 아바타 영상을 제작. 다국어 립싱크와 나만의 아바타 클로닝 지원.", descriptionEn: "Generates talking avatar videos from single photos with seamless multilingual lip-syncing and voice cloning.", url: "https://www.heygen.com", price: "무료/유료" },
  { id: 50, name: "Captions AI", category: "영상/오디오", description: "영상 자막 자동 생성부터 눈 맞춤 보정, 필러워드 제거까지 영상 크리에이터 전용 AI 올인원 편집 앱.", descriptionEn: "All-in-one AI video editing app with auto-captions, eye-contact correction, and filler word removal.", url: "https://www.captions.ai", price: "무료/유료" },
  { id: 69, name: "Luma Dream Machine", category: "영상/오디오", description: "사진이나 텍스트 프롬프트로 물리적으로 정교한 5초 고해상도 영상을 생성. 유동적인 카메라 움직임이 특기.", descriptionEn: "Generates physically realistic 5-second HD videos from photos or text with fluid camera motion.", url: "https://lumalabs.ai/dream-machine", price: "무료/유료" },
  { id: 70, name: "Pika Labs", category: "영상/오디오", description: "텍스트·이미지를 영상으로 변환하는 AI 비디오 생성 툴. 간단한 조작으로 숏폼 콘텐츠 제작에 최적화.", descriptionEn: "Transforms text and images into engaging short-form video clips with intuitive animation controls.", url: "https://pika.art", price: "무료/유료" },
  { id: 71, name: "Adobe Podcast AI", category: "영상/오디오", description: "어떤 환경에서 녹음해도 스튜디오급 음질로 업그레이드해주는 AI 오디오 향상 툴. 팟캐스터 필수 도구.", descriptionEn: "AI audio enhancement tool that upgrades any noisy recording to crystal-clear studio quality.", url: "https://podcast.adobe.com", price: "무료" },
  { id: 72, name: "Mureka AI", category: "영상/오디오", description: "스타일, 분위기, BPM을 세밀하게 제어해 원하는 곡을 만들 수 있는 음악 생성 AI. 저작권 무료 트랙 제공.", descriptionEn: "Music generation AI with granular control over style, mood, and tempo for royalty-free tracks.", url: "https://mureka.ai", price: "무료/유료" },

  // 음성 변환(TTS/STT) (신규)
  { id: 105, name: "Whisper AI (OpenAI)", category: "음성 변환(TTS/STT)", description: "다국어 음성을 인류 최고 수준 정확도로 받아쓰는 강력한 오픈소스 음성 인식(STT) 모델.", descriptionEn: "Robust open-source speech-to-text model delivering near-human accuracy in multilingual transcription.", url: "https://openai.com/research/whisper", price: "무료" },
  { id: 106, name: "Speechify", category: "음성 변환(TTS/STT)", description: "웹페이지, PDF, 도서를 유명 셀럽 음성이나 감정 있는 고품질 아나운서 보이스로 읽어주는 TTS 독서 앱.", descriptionEn: "Reads web pages, PDFs, and books aloud using celebrity and natural announcer AI voices.", url: "https://speechify.com", price: "무료/유료" },
  { id: 108, name: "OpenVoice (MyShell)", category: "음성 변환(TTS/STT)", description: "단 3초의 짧은 샘플 오디오만으로 목소리의 음색과 억양을 고스란히 복제해 주는 클로닝 음성 AI 엔진.", descriptionEn: "Clones voice tone and accent accurately from just 3 seconds of sample audio.", url: "https://myshell.ai", price: "무료" },

  // 번역/어학
  { id: 19, name: "DeepL", category: "번역/어학", description: "단순 직역을 탈피하여 현지 비즈니스 문맥과 자연스러운 뉘앙스를 가장 잘 살리는 세계 최고 성능 번역기.", descriptionEn: "World-leading translation service providing natural, context-aware translations for global communication.", url: "https://deepl.com", price: "무료/유료" },
  { id: 51, name: "Papago", category: "번역/어학", description: "네이버의 한·영·일·중 번역 엔진. 한국어 특화 문맥 처리가 강하며 문서·이미지·음성 번역을 통합 지원.", descriptionEn: "Naver's neural translation engine specialized in East Asian languages, documents, and voice translation.", url: "https://papago.naver.com", price: "무료" },
  { id: 52, name: "Speak AI", category: "번역/어학", description: "외국어 스피킹 연습에 특화된 AI 튜터. 실시간 발음 교정과 롤플레이 대화 시나리오로 회화 실력 향상.", descriptionEn: "AI language tutor featuring real-time pronunciation feedback and interactive role-play scenarios.", url: "https://www.speak.com", price: "무료/유료" },
  { id: 73, name: "Duolingo Max", category: "번역/어학", description: "GPT-4 기반 AI 튜터 '릴리'와 1:1 롤플레이 대화 연습. 틀린 이유를 설명해주는 'Explain My Answer' 기능 탑재.", descriptionEn: "GPT-4 powered language tutor offering 1-on-1 conversations and 'Explain My Answer' explanations.", url: "https://www.duolingo.com", price: "유료" },
  { id: 74, name: "Elsa Speak", category: "번역/어학", description: "AI가 영어 발음을 음소 단위로 분석해 정확한 피드백을 주는 발음 교정 전문 앱. 억양·강세까지 세밀하게 코칭.", descriptionEn: "Phoneme-level English pronunciation coaching app evaluating accent, pitch, and stress.", url: "https://elsaspeak.com", price: "무료/유료" },

  // 개발/데이터
  { id: 20, name: "Cursor", category: "개발/데이터", description: "VS Code를 기반으로 제작된 완전체 AI 코드 에디터. 프로젝트 전체를 인지하여 코드 생성, 버그 수정 및 리팩토링을 수행.", descriptionEn: "Fork of VS Code with deep AI integration. Understands codebase context to generate, debug, and refactor code.", url: "https://cursor.com", price: "무료/유료" },
  { id: 21, name: "Lovable", category: "개발/데이터", description: "코딩 실력이 없어도 일상어로 대화하며 완전하게 작동하는 웹 애플리케이션 및 MVP 프로토타입을 빌드해 주는 AI.", descriptionEn: "Builds full-stack web applications and functional MVPs through conversational natural language prompts.", url: "https://lovable.dev", price: "무료/유료" },
  { id: 22, name: "v0 by Vercel", category: "개발/데이터", description: "자연어로 원하는 웹 UI를 설명하면 완벽한 React/Tailwind 코드를 실시간 짜주고 미리보기까지 해주는 프론트엔드 특화 툴.", descriptionEn: "Generates production-ready React and Tailwind CSS UI components with live interactive previews.", url: "https://v0.app", price: "무료/유료" },
  { id: 23, name: "GitHub Copilot", category: "개발/데이터", description: "개발 인프라 필수 내장 플러그인. 실시간 개발자 코드를 예측 추천하고 자동 완성하여 작업 속도 대폭 개선.", descriptionEn: "The essential AI pair programmer providing inline code completions and chat in popular IDEs.", url: "https://github.com/features/copilot", price: "유료" },
  { id: 26, name: "Bolt.new", category: "개발/데이터", description: "인브라우저 가상 머신 환경에서 작동하여 풀스택 웹코딩, 테스트, 프로덕션 배포까지 한 프롬프트로 제어하는 에이전트.", descriptionEn: "In-browser WebContainer agent executing full-stack development, package management, and instant deployment.", url: "https://bolt.new", price: "무료/유료" },
  { id: 53, name: "Windsurf", category: "개발/데이터", description: "Codeium이 만든 AI 코드 에디터. Cascade 에이전트가 프로젝트 전체 흐름을 파악해 멀티파일 자율 코딩 수행.", descriptionEn: "AI code editor by Codeium featuring Cascade agent for autonomous multi-file refactoring and editing.", url: "https://windsurf.com", price: "무료/유료" },
  { id: 54, name: "Replit AI", category: "개발/데이터", description: "브라우저 기반 통합 개발 환경(IDE)에 AI가 결합. 코드 생성부터 실행·배포까지 클라우드에서 원스톱 처리.", descriptionEn: "Cloud IDE with embedded AI assistants enabling code creation, environment setup, and hosting.", url: "https://replit.com", price: "무료/유료" },
  { id: 55, name: "Tabnine", category: "개발/데이터", description: "사내 코드베이스 학습 기반의 프라이빗 AI 코드 자동완성. 보안이 중요한 엔터프라이즈 개발 환경에 최적.", descriptionEn: "Privacy-focused AI code assistant trained on your private repositories for secure code completion.", url: "https://www.tabnine.com", price: "무료/유료" },
  { id: 75, name: "Claude Code", category: "개발/데이터", description: "Anthropic이 만든 터미널 기반 AI 코딩 에이전트. 전체 코드베이스를 분석하고 멀티파일 수정·테스트를 자율 수행.", descriptionEn: "Terminal-based AI coding agent by Anthropic that edits multi-file repositories and executes tests.", url: "https://claude.ai/code", price: "유료" },
  { id: 76, name: "Pieces for Developers", category: "개발/데이터", description: "개발 중 자주 쓰는 코드 스니펫·스크린샷을 AI가 자동 분류·태깅해주는 개인 지식관리 툴. IDE 전 플러그인 지원.", descriptionEn: "AI contextual snippet manager for saving, tagging, and retrieving code across developer tools.", url: "https://pieces.app", price: "무료/유료" },
  { id: 77, name: "Warp AI", category: "개발/데이터", description: "AI가 내장된 차세대 터미널. 명령어를 자연어로 입력하거나 에러 메시지를 붙여넣으면 즉시 해결책을 제안.", descriptionEn: "Modern AI-integrated terminal that converts natural language queries into executable shell scripts.", url: "https://www.warp.dev", price: "무료/유료" },

  // 코드 최적화 (신규)
  { id: 109, name: "CodeRabbit", category: "코드 최적화", description: "GitHub/GitLab PR을 자동 분석해 코드 리팩토링, 성능 최적화, 보안 취약점을 정확히 피드백하는 AI AI 코드 리뷰어.", descriptionEn: "AI Code Reviewer analyzing Pull Requests for security, performance, and best practices automatically.", url: "https://coderabbit.ai", price: "무료/유료" },
  { id: 110, name: "Qodo (CodiumAI)", category: "코드 최적화", description: "작성한 코드의 단위 테스트(Unit Test)를 자동 생성하고 버그 및 커버리지 약점을 찾아 최적화해 주는 도구 (CodiumAI에서 Qodo로 서비스명 공식 리브랜딩).", descriptionEn: "Generates smart unit tests and identifies code vulnerabilities (Rebranded from CodiumAI to Qodo).", url: "https://www.qodo.ai", price: "무료/유료", status: "active", statusReason: "CodiumAI에서 Qodo로 공식 서비스명 변경 후 정상 운영 중", statusCheckedAt: "2026-08-12", sourceUrl: "https://www.qodo.ai" },
  { id: 111, name: "SonarQube AI", category: "코드 최적화", description: "소프트웨어 정적 분석 도구 Sonar에 AI가 탑재되어, 심각한 코드 스멜과 메모리 누수 요인을 정밀 탐지·교정.", descriptionEn: "AI static code analyzer detecting memory leaks, bugs, and security vulnerabilities.", url: "https://www.sonarsource.com", price: "무료/유료", status: "active" },
  { id: 112, name: "Bito AI", category: "코드 최적화", description: "코드 이해, 리팩토링 가이드, 성능 개선 힌트, 레거시 코드 해설을 IDE 내부에서 즉시 수행해 주는 보조 AI.", descriptionEn: "IDE assistant for explaining legacy code, generating documentation, and guiding refactoring.", url: "https://bito.ai", price: "무료/유료", status: "active" },

  // 생산성/협업
  { id: 29, name: "Notion AI", category: "생산성/협업", description: "노션 워크스페이스 내에 탑재되어 페이지 요약, 테이블 자동 정리, 번역, 어조 수정 등을 작업 공간 내에서 즉시 처리.", descriptionEn: "Embedded workspace AI that summarizes notes, organizes tables, and edits tone inside Notion.", url: "https://notion.so", price: "유료" },
  { id: 30, name: "Granola", category: "생산성/협업", description: "회의실에 별도의 봇을 초대하지 않아도 백그라운드에서 오디오를 분석해 미팅 노트와 액션 아이템을 정리하는 AI 미팅 툴.", descriptionEn: "AI notepad for meetings that creates structured transcripts and action items without inviting noisy bots.", url: "https://granola.ai", price: "무료/유료" },
  { id: 31, name: "Wispr Flow", category: "생산성/협업", description: "초강력 AI 음성 받아쓰기 툴. 편안하고 거칠게 말해도 실시간으로 문맥을 파악해 정제된 문장으로 변환.", descriptionEn: "Voice dictation software converting casual spoken words into polished written text 3x faster.", url: "https://wisprflow.ai", price: "무료/유료" },
  { id: 32, name: "Heptabase", category: "생산성/협업", description: "시각적 화이트보드 기반 노트 테이킹 툴. 복잡한 아이디어와 방대한 리서치 자료를 마인드맵 형태로 구조화.", descriptionEn: "Visual note-taking tool mapping complex research and thoughts onto interactive visual whiteboards.", url: "https://heptabase.com", price: "유료" },
  { id: 33, name: "ChatPDF", category: "생산성/협업", description: "어떤 대용량 PDF 문서도 인식. 파일 공유 후 내부 데이터 핵심 정보만 족집게처럼 유추 및 요약하는 대화 툴.", descriptionEn: "Conversational AI tool allowing you to chat with, extract data from, and summarize large PDF documents.", url: "https://www.chatpdf.com", price: "무료/유료" },
  { id: 34, name: "Miro Assist", category: "생산성/협업", description: "캔버스 위에서 포스트잇 아이디어 확장, 데이터 마인드맵 도식화를 프롬프트로 대신 그려주는 스마트 보드 비서.", descriptionEn: "AI board assistant expanding sticky note brainstorms and generating mind maps automatically.", url: "https://miro.com", price: "무료/유료" },
  { id: 56, name: "Mem AI", category: "생산성/협업", description: "AI가 자동으로 노트를 분류·연결해주는 스마트 메모 앱. 검색 없이 대화하듯 내 지식 베이스를 탐색 가능.", descriptionEn: "Self-organizing workspace connecting notes and ideas automatically using generative AI.", url: "https://mem.ai", price: "무료/유료" },
  { id: 57, name: "Otter.ai", category: "생산성/협업", description: "회의 녹음을 실시간 텍스트로 전환하고 핵심 요약과 할 일 목록을 자동 추출. Zoom·Meet 연동 지원.", descriptionEn: "Automated meeting notes app transcribing calls in real-time with summaries and action items.", url: "https://otter.ai", price: "무료/유료" },
  { id: 58, name: "Taskade AI", category: "생산성/협업", description: "AI 에이전트가 프로젝트 계획, 마인드맵, 할 일 목록을 자동 생성하고 팀과 실시간 협업하는 올인원 워크스페이스.", descriptionEn: "All-in-one productivity suite using AI agents to map out tasks, workflows, and team projects.", url: "https://www.taskade.com", price: "무료/유료" },
  { id: 78, name: "Napkin AI", category: "생산성/협업", description: "텍스트 내용을 입력하면 AI가 자동으로 인포그래픽·다이어그램·차트로 시각화. 프레젠테이션 자료 제작 시간을 단축.", descriptionEn: "Transforms plain text ideas into clean infographics, flowcharts, and visual diagrams automatically.", url: "https://www.napkin.ai", price: "무료/유료" },
  { id: 79, name: "Tana AI", category: "생산성/협업", description: "슈퍼태그 기반의 지능형 노트앱. AI가 노트 간 연결고리를 찾아 지식 그래프를 자동으로 구축해주는 PKM 도구.", descriptionEn: "Tag-based knowledge management tool using AI to construct structured node graphs from your notes.", url: "https://tana.inc", price: "무료/유료" },
  { id: 80, name: "Fireflies.ai", category: "생산성/협업", description: "회의에 자동 참여해 녹취·요약·검색·CRM 연동까지 처리하는 AI 미팅 어시스턴트. Zoom·Teams·Meet 완벽 지원.", descriptionEn: "AI meeting assistant that records, transcribes, and searches call notes seamlessly across platforms.", url: "https://fireflies.ai", price: "무료/유료" },

  // 마케팅/분석
  { id: 35, name: "Gamma", category: "마케팅/분석", description: "개념 요약이나 주제 한 줄만 입력하면 전문 프레젠테이션(PPT), 문서 레이아웃, 웹페이지를 즉시 레이아웃화.", descriptionEn: "Creates beautiful presentations, web pages, and documents in seconds from brief text outlines.", url: "https://gamma.app", price: "무료/유료" },
  { id: 37, name: "Glean", category: "마케팅/분석", description: "엔터프라이즈 전용 AI 검색 솔루션. 사내 구글드라이브, 슬랙, 컨플루언스 등에 흩어진 전사 정보를 색인 검색.", descriptionEn: "Enterprise AI search engine connecting company Drive, Slack, and Confluence data securely.", url: "https://glean.com", price: "유료" },
  { id: 38, name: "Julius AI", category: "마케팅/분석", description: "엑셀 및 CSV 파일을 올리면 알아서 고급 파이썬 코드를 구동해 데이터 시각화 그래프와 인사이트 레포트 도출.", descriptionEn: "Analyzes Excel and CSV files by writing Python code to build charts and produce data reports.", url: "https://julius.ai", price: "무료/유료" },
  { id: 39, name: "Beautiful.ai", category: "마케팅/분석", description: "인공지능 기반 스마트 발표 자료 제작 도구. 내용만 타이핑하면 디자인 비율을 시스템이 알아서 황금비율로 조정.", descriptionEn: "Smart presentation software that auto-adjusts slide formatting and design proportions as you type.", url: "https://beautiful.ai", price: "유료" },
  { id: 40, name: "Anysummary", category: "마케팅/분석", description: "긴 비디오/오디오 파일, 다량의 텍스트 원본을 집어넣으면 차트와 불릿 포인트로 타임라인 요약 보고서를 짜주는 툴.", descriptionEn: "Summarizes long video, audio, and document files into key takeaway bullet points and charts.", url: "https://www.anysummary.app", price: "무료/유료" },
  { id: 59, name: "AdCreative.ai", category: "마케팅/분석", description: "클릭률 높은 광고 배너와 카피를 AI가 자동 생성. 브랜드 컬러·로고 학습 후 수백 개 시안을 즉시 제작.", descriptionEn: "Generates conversion-focused ad banners and graphics trained on top-performing creative assets.", url: "https://www.adcreative.ai", price: "유료" },
  { id: 60, name: "Surfer", category: "마케팅/분석", description: "콘텐츠 에디터 내에서 실시간 SEO 점수를 측정하고, 상위 노출을 위한 키워드·구조 최적화 가이드를 제공.", descriptionEn: "Content optimization tool analyzing search engine rankings to boost organic traffic and SEO scores.", url: "https://surfer.ai", price: "유료" },
  { id: 61, name: "Descript", category: "마케팅/분석", description: "영상을 텍스트처럼 편집하는 혁신적 비디오 편집 툴. 스크립트 수정만으로 영상이 바뀌며 팟캐스트 제작에도 최적.", descriptionEn: "Video and podcast editor allowing you to edit media simply by editing text transcripts.", url: "https://www.descript.com", price: "무료/유료" },
  { id: 81, name: "Synthflow AI", category: "마케팅/분석", description: "코딩 없이 음성 AI 에이전트를 구축하는 노코드 플랫폼. 인바운드·아웃바운드 전화 자동화에 특화된 AI 콜센터 솔루션.", descriptionEn: "No-code platform building conversational voice agents for automated sales and customer calls.", url: "https://synthflow.ai", price: "유료" },
  { id: 82, name: "Semrush AI", category: "마케팅/분석", description: "SEO·경쟁사 분석·콘텐츠 마케팅을 통합 관리하는 플랫폼에 AI 글쓰기·키워드 클러스터링이 결합된 마케터 필수 툴.", descriptionEn: "All-in-one marketing platform enhanced with AI keyword clustering and SEO copywriting tools.", url: "https://www.semrush.com", price: "유료" },
  { id: 83, name: "Murf AI", category: "마케팅/분석", description: "120개 언어·200개 이상의 자연스러운 AI 목소리로 광고 내레이션, 교육 영상, 오디오북을 제작하는 TTS 플랫폼.", descriptionEn: "TTS platform with 200+ voices across 120 languages for e-learning, ads, and video narration.", url: "https://murf.ai", price: "무료/유료" },

  // 학술/리서치
  { id: 27, name: "Perplexity", category: "학술/리서치", description: "구글 검색을 대체하는 대화형 인공지능 검색 엔진. 실시간 정확한 출처 정보 리스트와 정답 요약을 동시에 매칭.", descriptionEn: "Conversational answer engine combining web search with cited sources for instant fact-checking.", url: "https://perplexity.ai", price: "무료/유료" },
  { id: 28, name: "NotebookLM", category: "학술/리서치", description: "구글의 문서 기반 AI 노트. 대량의 논문, PDF, 링크를 요약하고 원클릭으로 2인 가상 팟캐스트 오디오까지 생성.", descriptionEn: "Google's document-focused AI workspace that generates research summaries and 2-person podcast discussions.", url: "https://notebooklm.google", price: "무료" },
  { id: 84, name: "Elicit", category: "학술/리서치", description: "수억 건의 수의학·의학·과학 연구 논문 데이터베이스를 직접 탐색하고 연구 질문에 대한 실증 결과를 정리해주는 학술 전용 AI.", descriptionEn: "Academic research assistant analyzing millions of research papers to synthesize findings.", url: "https://elicit.com", price: "무료/유료" },
  { id: 85, name: "Consensus", category: "학술/리서치", description: "검증된 과학 학술 논문들의 상호 결론을 교차 분석하여 정확한 피어리뷰 기반 근거 요약을 제공해 주는 AI 검색엔진.", descriptionEn: "Search engine leveraging peer-reviewed research to deliver evidence-backed scientific answers.", url: "https://consensus.app", price: "무료/유료" },
  { id: 86, name: "Scite AI", category: "학술/리서치", description: "학술 논문의 인용 문맥(Smart Citations)을 분석하여 반박·지지·단순 언급 여부를 지표로 산출해 주는 연구자 필수 AI.", descriptionEn: "Evaluates scientific articles using Smart Citations to show whether findings are supported or contested.", url: "https://scite.ai", price: "유료" },
  { id: 87, name: "Genspark", category: "학술/리서치", description: "여러 AI 모델을 실시간 구동하여 광고와 오편향 없는 맞춤형 백과사전 형태의 '스파크페이지' 리포트를 생성하는 신개념 AI.", descriptionEn: "Generates custom encyclopedia-style 'Sparkpages' synthesizing multiple AI models unbiasedly.", url: "https://genspark.ai", price: "무료" },

  // 3D/공간
  { id: 88, name: "Meshy", category: "3D/공간", description: "텍스트나 이미지 한 장만으로 몇 초 만에 고품질 3D 메쉬 모델과 PBR 텍스처를 자동 생성하는 대표적 3D AI.", descriptionEn: "Transforms text and images into game-ready 3D mesh models and PBR textures in seconds.", url: "https://meshy.ai", price: "무료/유료" },
  { id: 89, name: "Tripo 3D", category: "3D/공간", description: "초고속 텍스트/이미지 기반 3D 그래픽 모델링 파이프라인. 메타버스, 인게임 오브젝트 프롭 제작 시간을 획기적으로 단축.", descriptionEn: "Ultra-fast text/image to 3D pipeline for metaverse assets and in-game object modeling.", url: "https://tripo3d.ai", price: "무료/유료" },

  // 에이전트/자동화
  { id: 24, name: "Manus / Devin", category: "에이전트/자동화", description: "자율형 AI 에이전트. 사람의 개입 없이 스스로 웹서칭, 개발 환경 구축, 디버깅까지 수행하여 하나의 프로젝트 미션을 완수.", descriptionEn: "Autonomous AI agent capable of web browsing, setting up dev environments, and completing complex tasks.", url: "https://manus.im", price: "유료" },
  { id: 36, name: "n8n / Make", category: "에이전트/자동화", description: "비즈니스 워크플로우를 완벽하게 자동화하는 툴. 다양한 앱과 AI 모델을 코딩 없이 시각적 노드로 연결.", descriptionEn: "No-code workflow automation engine connecting services and AI models with visual node graphs.", url: "https://n8n.io", price: "무료/유료" },
  { id: 93, name: "AutoGPT", category: "에이전트/자동화", description: "최상위 목표 하나만 설정해 두면 알아서 하위 과업을 정의하고 브라우저 서칭과 코드 실행을 연쇄적으로 수행하는 오픈소스 에이전트.", descriptionEn: "Open-source autonomous agent that breaks down top-level goals into self-directed sub-tasks.", url: "https://agpt.co", price: "무료/유료" },

  // 금융/투자 (신규)
  { id: 113, name: "Fiscal.ai (구 FinChat)", category: "금융/투자", description: "상장 기업 재무제표, 실적 발표, 공시 자료를 대화로 조회하고 비교 분석하는 금융 리서치 플랫폼 (FinChat에서 이름 변경).", descriptionEn: "Financial research platform for querying and comparing public-company financials, earnings calls and filings (formerly FinChat).", url: "https://fiscal.ai", price: "무료/유료" },
  { id: 114, name: "AlphaSense", category: "금융/투자", description: "글로벌 투자 기관들이 사용하는 리서치 AI. 기업 공시 문서, 증권사 리포트, 산업 동향을 수초 만에 정밀 분석.", descriptionEn: "Market intelligence AI analyzing SEC filings, broker research, and industry trends for investors.", url: "https://www.alpha-sense.com", price: "유료" },
  { id: 115, name: "Kavout AI", category: "금융/투자", description: "머신러닝 알고리즘으로 주식 종목의 수급, 변동성, 재무 건전성 K-Score 점수를 산출해 투자 인사이트 제공.", descriptionEn: "Investment decision engine utilizing machine learning algorithms to generate stock K-Scores.", url: "https://www.kavout.com", price: "유료" },

  // 교육/튜터 (신규)
  { id: 117, name: "Khanmigo", category: "교육/튜터", description: "칸아카데미의 1:1 맞춤형 AI 과외 튜터. 정답을 바로 제시하기보다 소크라테스식 질문으로 학습자의 개념 이해를 유도.", descriptionEn: "Socratic AI tutor by Khan Academy guiding students through concepts without spoiling answers.", url: "https://www.khanacademy.org/khanmigo", price: "유료", status: "active" },
  { id: 119, name: "Synthesis Tutor", category: "교육/튜터", description: "초등~중등 수준의 수학과 과학적 사고력을 키워주는 인터랙티브 AI 소크라테스식 대화형 학습 플랫폼.", descriptionEn: "Interactive AI tutor developing mathematical and problem-solving intuition for young learners.", url: "https://www.synthesis.is", price: "유료", status: "active" },

  // 비즈니스/법률 (신규)
  { id: 120, name: "Harvey AI", category: "비즈니스/법률", description: "글로벌 로펌과 기업 법무팀을 위해 구축된 전문 법률 AI. 계약서 검토, 법률 조문 분석 및 판례 리서치 자동화.", descriptionEn: "Legal AI built for law firms and corporate legal teams to automate contract reviews and research.", url: "https://www.harvey.ai", price: "유료", status: "active" },
  { id: 121, name: "CoCounsel (Thomson Reuters)", category: "비즈니스/법률", description: "GPT-4 기반 판례 검토 및 비즈니스 소송 전략 리서치 어시스턴트. 법률 문서 디스커버리 작업 시간을 대폭 단축.", descriptionEn: "GPT-4 legal assistant providing document review, case research, and deposition preparation.", url: "https://www.thomsonreuters.com/en/cocounsel", price: "유료", status: "active" },
  { id: 122, name: "Spellbook", category: "비즈니스/법률", description: "워드(Word) 프로그램 내부에서 실시간으로 법률 계약서의 독소 조항을 찾아내고 정밀한 수정안을 제안하는 솔루션.", descriptionEn: "Microsoft Word add-in analyzing legal contracts and highlighting high-risk clauses in real time.", url: "https://www.spellbook.legal", price: "유료", status: "active" },

  // 운영 종료 / 통합 기록 데이터 (사용자 노출에서는 자동 필터링됨)
];

export const BADGES: Record<number, BadgeInfo> = {
  1:  { type: 'hot',  label: '🔥 HOT' },
  2:  { type: 'pick', label: '✦ PICK' },
  3:  { type: 'hot',  label: '🔥 HOT' },
  4:  { type: 'kr',   label: '🇰🇷 국내 인기' },
  7:  { type: 'pick', label: '✦ PICK' },
  14: { type: 'kr',   label: '🇰🇷 국내 인기' },
  15: { type: 'hot',  label: '🔥 HOT' },
  16: { type: 'hot',  label: '🔥 HOT' },
  19: { type: 'pick', label: '✦ PICK' },
  20: { type: 'hot',  label: '🔥 HOT' },
  21: { type: 'pick', label: '✦ PICK' },
  22: { type: 'hot',  label: '🔥 HOT' },
  24: { type: 'hot',  label: '🔥 HOT' },
  27: { type: 'pick', label: '✦ PICK' },
  28: { type: 'kr',   label: '🇰🇷 국내 인기' },
  35: { type: 'pick', label: '✦ PICK' },
  45: { type: 'kr',   label: '🇰🇷 국내 인기' },
  48: { type: 'hot',  label: '🔥 HOT' },
  49: { type: 'pick', label: '✦ PICK' },
  53: { type: 'hot',  label: '🔥 HOT' },
  62: { type: 'hot',  label: '🔥 HOT' },
  66: { type: 'pick', label: '✦ PICK' },
  68: { type: 'hot',  label: '🔥 HOT' },
  69: { type: 'hot',  label: '🔥 HOT' },
  75: { type: 'pick', label: '✦ PICK' },
  78: { type: 'pick', label: '✦ PICK' },
  80: { type: 'hot',  label: '🔥 HOT' },
  84: { type: 'pick', label: '✦ PICK' },
  88: { type: 'hot',  label: '🔥 HOT' },
  101: { type: 'hot', label: '🔥 HOT' },
  105: { type: 'pick', label: '✦ PICK' },
  109: { type: 'hot', label: '🔥 HOT' },
  113: { type: 'hot', label: '🔥 HOT' },
  117: { type: 'pick', label: '✦ PICK' },
  120: { type: 'hot', label: '🔥 HOT' }
};
