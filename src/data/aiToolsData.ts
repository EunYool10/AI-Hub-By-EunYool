import { AITool, BadgeInfo } from '../types';

// Grouped by category (lib/categories.ts). Descriptions reviewed 2026-10-28: plain facts, no rankings.
export const INITIAL_AI_TOOLS: AITool[] = [
  // AI 챗봇
  { id: 1, name: "ChatGPT", category: "AI 챗봇", description: "OpenAI의 대화형 AI. 질문 답변, 글쓰기·요약, 파일·데이터 분석, 이미지 생성, 웹 검색까지 한곳에서 할 수 있어요.", descriptionEn: "OpenAI's chatbot for questions, writing and summaries, file and data analysis, image generation and web search in one place.", url: "https://chatgpt.com", price: "무료/유료" },
  { id: 2, name: "Claude", category: "AI 챗봇", description: "Anthropic의 대화형 AI. 긴 문서를 꼼꼼히 읽고 분석하는 데 강하고, 자연스러운 글쓰기와 코딩에 뛰어나요.", descriptionEn: "Anthropic's AI assistant. Strong at reading and analyzing long documents, natural writing and coding.", url: "https://claude.ai", price: "무료/유료" },
  { id: 3, name: "Gemini", category: "AI 챗봇", description: "구글의 멀티모달 AI. Gmail·드라이브·문서와 연결되고, Deep Research로 여러 자료를 조사해 보고서를 만들어 줘요.", descriptionEn: "Google's multimodal AI. Connects to Gmail, Drive and Docs, and Deep Research writes reports from many sources.", url: "https://gemini.google.com", price: "무료/유료" },
  { id: 4, name: "Wrtn (뤼튼)", category: "AI 챗봇", description: "여러 AI 모델을 한곳에서 쓸 수 있는 국내 AI 서비스. 한국어 글쓰기 도구, AI 검색, 캐릭터 대화를 제공해요.", descriptionEn: "Korean AI service that puts several AI models in one place, with Korean writing tools, AI search and character chat.", url: "https://wrtn.ai", price: "무료" },
  { id: 5, name: "Grok", category: "AI 챗봇", description: "xAI의 대화형 AI. X(트위터) 게시물과 웹의 최신 정보를 반영해 답하고, 이미지 생성도 할 수 있어요.", descriptionEn: "xAI's chatbot. Answers with the latest posts on X and the web, and can generate images.", url: "https://grok.com", price: "무료/유료" },
  { id: 6, name: "Kimi", category: "AI 챗봇", description: "중국 Moonshot AI의 대화형 AI. 아주 긴 문서와 여러 파일을 한 번에 읽고, 웹 검색으로 자료를 모아 정리해요.", descriptionEn: "Moonshot AI's chatbot. Reads very long documents and many files at once and gathers sources with web search.", url: "https://www.kimi.com", price: "무료" },
  { id: 62, name: "DeepSeek", category: "AI 챗봇", description: "중국 DeepSeek의 대화형 AI. 수학·코딩 같은 추론 문제에 강하고, 모델을 공개해 누구나 내려받아 쓸 수 있어요.", descriptionEn: "DeepSeek's chatbot. Strong at reasoning tasks like math and code, with openly released models anyone can download.", url: "https://chat.deepseek.com", price: "무료" },
  { id: 63, name: "Mistral AI", category: "AI 챗봇", description: "프랑스 Mistral AI의 대화형 AI 'Le Chat'. 답이 빠르고 웹 검색·문서 분석을 지원하며, 공개 모델도 제공해요.", descriptionEn: "Le Chat by France's Mistral AI. Fast answers, web search and document analysis, plus openly available models.", url: "https://chat.mistral.ai", price: "무료/유료" },

  // 검색·리서치
  { id: 27, name: "Perplexity", category: "검색·리서치", description: "답변마다 출처 링크를 달아 주는 AI 검색 엔진. 최신 웹 정보를 찾아 요약하고, 깊이 있는 조사 보고서도 만들어요.", descriptionEn: "AI answer engine that cites its sources. Finds and summarizes current web information and writes in-depth research reports.", url: "https://perplexity.ai", price: "무료/유료" },
  { id: 87, name: "Genspark", category: "검색·리서치", description: "조사부터 문서·슬라이드 작성까지 맡길 수 있는 AI 에이전트 검색. 여러 자료를 모아 한 페이지로 정리해 줘요.", descriptionEn: "AI agent search that researches a topic and turns the results into pages, documents or slides.", url: "https://genspark.ai", price: "무료/유료" },
  { id: 28, name: "NotebookLM", category: "검색·리서치", description: "구글의 자료 기반 AI 노트. 올린 PDF·문서·링크 안에서만 근거를 찾아 답하고, 오디오 요약과 학습 자료를 만들어요.", descriptionEn: "Google's source-grounded notebook. Answers only from the PDFs, docs and links you add, and makes audio overviews and study guides.", url: "https://notebooklm.google", price: "무료/유료" },
  { id: 33, name: "ChatPDF", category: "검색·리서치", description: "PDF를 올리고 대화하듯 질문하는 도구. 답변마다 근거가 된 페이지를 표시해 원문을 바로 확인할 수 있어요.", descriptionEn: "Upload a PDF and ask questions about it. Each answer points to the page it came from.", url: "https://www.chatpdf.com", price: "무료/유료" },
  { id: 84, name: "Elicit", category: "검색·리서치", description: "연구 질문에 맞는 논문을 찾아 핵심 내용을 표로 정리해 주는 연구용 AI. 문헌 검토 시간을 줄여 줘요.", descriptionEn: "Research assistant that finds papers for your question and extracts key findings into a table, speeding up literature reviews.", url: "https://elicit.com", price: "무료/유료" },
  { id: 85, name: "Consensus", category: "검색·리서치", description: "과학 논문을 근거로 답하는 AI 검색. 여러 연구가 같은 결론을 내는지 한눈에 보여 줘요.", descriptionEn: "AI search that answers from peer-reviewed papers and shows how far studies agree.", url: "https://consensus.app", price: "무료/유료" },
  { id: 86, name: "Scite AI", category: "검색·리서치", description: "어떤 논문이 다른 논문에서 지지·반박·단순 언급 중 어떻게 인용됐는지 보여 주는 연구 도구.", descriptionEn: "Shows whether later papers support, contrast or simply mention a study (Smart Citations).", url: "https://scite.ai", price: "유료" },

  // 문서·발표
  { id: 35, name: "Gamma", category: "문서·발표", description: "주제나 개요만 넣으면 디자인을 갖춘 발표 자료, 문서, 웹페이지를 만들어 주는 AI. PPT·PDF로 내보낼 수 있어요.", descriptionEn: "Turns a topic or outline into designed slides, documents or web pages. Exports to PowerPoint and PDF.", url: "https://gamma.app", price: "무료/유료" },
  { id: 39, name: "Beautiful.ai", category: "문서·발표", description: "내용을 넣으면 레이아웃과 디자인을 자동으로 맞춰 주는 발표 자료 도구. 팀 템플릿으로 디자인을 통일해요.", descriptionEn: "Presentation tool that lays out and styles slides automatically as you add content, with team templates.", url: "https://beautiful.ai", price: "유료" },
  { id: 78, name: "Napkin AI", category: "문서·발표", description: "글을 붙여 넣으면 어울리는 다이어그램·인포그래픽을 만들어 주는 도구. 발표 자료와 보고서용 그림을 빠르게 만들어요.", descriptionEn: "Paste text and get matching diagrams and infographics for slides and reports.", url: "https://www.napkin.ai", price: "무료/유료" },
  { id: 41, name: "Perplexity Pages", category: "문서·발표", description: "Perplexity의 기능. 조사한 내용을 출처가 달린 읽기 좋은 글 페이지로 정리하고 링크로 공유해요.", descriptionEn: "A Perplexity feature that turns research into a readable, sourced article page you can share by link.", url: "https://perplexity.ai", price: "무료/유료" },

  // 이미지 생성
  { id: 7, name: "Midjourney", category: "이미지 생성", description: "예술적 완성도가 높은 이미지 생성 AI. 일러스트, 컨셉 아트, 광고 시안처럼 분위기가 중요한 이미지에 강해요.", descriptionEn: "Image generator known for artistic quality — great for illustrations, concept art and ad visuals.", url: "https://midjourney.com", price: "유료" },
  { id: 8, name: "Adobe Firefly", category: "이미지 생성", description: "어도비의 생성형 AI. 상업적으로 쓰기 안전하도록 학습했고, 포토샵의 생성형 채우기·확장에도 쓰여요.", descriptionEn: "Adobe's generative AI, trained to be commercially safe. Powers Generative Fill and Expand in Photoshop.", url: "https://www.adobe.com", price: "무료/유료" },
  { id: 9, name: "Ideogram", category: "이미지 생성", description: "이미지 속 글자를 정확하게 넣는 데 강한 이미지 생성 AI. 포스터, 로고, 썸네일 만들기에 좋아요.", descriptionEn: "Image generator that renders text accurately — good for posters, logos and thumbnails.", url: "https://ideogram.ai", price: "무료/유료" },
  { id: 46, name: "Leonardo AI", category: "이미지 생성", description: "게임·컨셉 아트에 강한 이미지 생성 플랫폼. 여러 모델과 스타일, 캔버스 편집, 이미지를 영상으로 바꾸는 기능을 갖췄어요.", descriptionEn: "Image platform popular for game and concept art, with many models and styles, canvas editing and image-to-video.", url: "https://leonardo.ai", price: "무료/유료" },
  { id: 66, name: "Stable Diffusion", category: "이미지 생성", description: "Stability AI가 공개한 이미지 생성 모델. 내 컴퓨터에 설치해 무료로 쓰고, 원하는 화풍으로 직접 학습시킬 수 있어요.", descriptionEn: "Stability AI's open image model. Run it free on your own computer and fine-tune it for any style.", url: "https://stability.ai", price: "무료" },
  { id: 67, name: "Recraft AI", category: "이미지 생성", description: "벡터(SVG) 그래픽과 브랜드 일러스트에 강한 이미지 생성 AI. 같은 스타일로 아이콘·이미지 세트를 만들기 좋아요.", descriptionEn: "Image generator strong at vector (SVG) graphics and brand illustration; keeps one style across icon and image sets.", url: "https://www.recraft.ai", price: "무료/유료" },
  { id: 68, name: "Flux (Black Forest Labs)", category: "이미지 생성", description: "Black Forest Labs의 이미지 생성 모델. 사실적인 표현, 긴 프롬프트를 정확히 따르는 능력, 이미지 편집 모델로 알려져 있어요.", descriptionEn: "Black Forest Labs' image models, known for realism, close prompt following and image editing.", url: "https://bfl.ai", price: "무료/유료" },
  { id: 103, name: "Krea AI", category: "이미지 생성", description: "그리는 대로 결과가 바로 바뀌는 실시간 이미지 생성 도구. 업스케일과 여러 이미지·영상 모델도 한곳에서 써요.", descriptionEn: "Real-time image generation that updates as you draw, plus upscaling and many image and video models in one place.", url: "https://www.krea.ai", price: "무료/유료" },

  // 디자인·3D
  { id: 45, name: "Canva AI", category: "디자인·3D", description: "누구나 쉽게 쓰는 디자인 플랫폼 캔바의 AI 기능. 글로 디자인 초안을 만들고, 사진 속 개체 지우기·배경 제거를 해요.", descriptionEn: "AI features in Canva: generate design drafts from text, erase objects and remove backgrounds.", url: "https://www.canva.com", price: "무료/유료" },
  { id: 10, name: "Figma AI", category: "디자인·3D", description: "피그마에 들어간 AI 기능. 설명으로 화면 초안과 프로토타입을 만들고, 레이어 이름 정리 같은 반복 작업을 줄여 줘요.", descriptionEn: "AI in Figma: draft screens and prototypes from a prompt and automate chores like renaming layers.", url: "https://figma.com", price: "무료/유료" },
  { id: 101, name: "Stitch (구 Galileo AI)", category: "디자인·3D", description: "구글의 UI 디자인 도구. 글이나 스케치로 설명하면 앱·웹 화면 시안과 프런트엔드 코드를 만들어 줘요.", descriptionEn: "Google's UI design tool (formerly Galileo AI). Describe a screen in words or a sketch to get app and web mockups plus front-end code.", url: "https://stitch.withgoogle.com", price: "무료/유료" },
  { id: 102, name: "Uizard", category: "디자인·3D", description: "손그림이나 스크린샷을 편집할 수 있는 화면 디자인으로 바꿔 주는 도구. 디자인 경험이 없어도 프로토타입을 만들 수 있어요.", descriptionEn: "Turns hand-drawn sketches and screenshots into editable UI designs, so non-designers can build prototypes.", url: "https://uizard.io", price: "무료/유료" },
  { id: 88, name: "Meshy", category: "디자인·3D", description: "글이나 이미지로 3D 모델과 텍스처를 만들어 주는 AI. 게임 엔진과 3D 프린팅용 파일로 내보낼 수 있어요.", descriptionEn: "Creates 3D models and textures from text or images, exportable for game engines and 3D printing.", url: "https://meshy.ai", price: "무료/유료" },
  { id: 89, name: "Tripo 3D", category: "디자인·3D", description: "이미지나 글을 빠르게 3D 모델로 바꾸는 AI. 캐릭터 리깅과 애니메이션까지 지원해요.", descriptionEn: "Fast text- and image-to-3D generator with character rigging and animation.", url: "https://tripo3d.ai", price: "무료/유료" },

  // 영상 제작
  { id: 12, name: "Runway", category: "영상 제작", description: "영상 생성과 편집을 함께 하는 AI 영상 도구. 글·이미지로 영상을 만들고 카메라 움직임과 동작을 세밀하게 조절해요.", descriptionEn: "AI video suite for generating and editing video from text or images, with fine control over camera and motion.", url: "https://runway.com", price: "무료/유료" },
  { id: 47, name: "Kling AI", category: "영상 제작", description: "중국 콰이쇼우의 영상 생성 AI. 글이나 이미지로 움직임이 사실적인 고화질 영상을 만들고, 립싱크도 지원해요.", descriptionEn: "Kuaishou's video generator: realistic, high-quality motion from text or images, with lip sync.", url: "https://kling.ai", price: "무료/유료" },
  { id: 69, name: "Luma Dream Machine", category: "영상 제작", description: "Luma AI의 영상 생성 도구. 글이나 이미지로 영화 같은 카메라 움직임이 담긴 영상을 만들어요.", descriptionEn: "Luma AI's video generator for cinematic camera movement from text or images.", url: "https://lumalabs.ai/dream-machine", price: "무료/유료" },
  { id: 70, name: "Pika Labs", category: "영상 제작", description: "글이나 이미지로 짧은 영상을 만드는 AI. 사물을 녹이거나 부풀리는 재미있는 효과로 SNS용 영상을 쉽게 만들어요.", descriptionEn: "Makes short videos from text or images, with playful effects for social clips.", url: "https://pika.art", price: "무료/유료" },
  { id: 17, name: "viggle.ai", category: "영상 제작", description: "캐릭터나 인물 사진을 참고 영상의 동작대로 춤추고 움직이게 만드는 영상 AI. 밈 영상 제작에 많이 쓰여요.", descriptionEn: "Animates a character or person photo to follow the moves in a reference video — popular for memes.", url: "https://viggle.ai", price: "무료/유료" },
  { id: 13, name: "Synthesia", category: "영상 제작", description: "대본만 넣으면 AI 아바타가 발표하는 영상을 만드는 도구. 촬영 없이 여러 언어로 교육·안내 영상을 만들어요.", descriptionEn: "Type a script and an AI avatar presents it. Make training and explainer videos in many languages without filming.", url: "https://www.synthesia.io", price: "무료/유료" },
  { id: 49, name: "HeyGen", category: "영상 제작", description: "사진 한 장으로 말하는 아바타 영상을 만들고, 영상을 원래 목소리 그대로 다른 언어로 번역해 주는 도구.", descriptionEn: "Creates talking-avatar videos from a photo and translates videos into other languages in the speaker's own voice.", url: "https://www.heygen.com", price: "무료/유료" },
  { id: 14, name: "Vrew (브루)", category: "영상 제작", description: "말소리를 자동 자막으로 바꾸고, 글을 지우듯 컷 편집하는 국산 영상 편집기. AI 목소리 더빙도 지원해요.", descriptionEn: "Korean video editor that auto-captions speech, edits by deleting text, and adds AI voiceovers.", url: "https://vrew.voyagerx.com", price: "무료/유료" },
  { id: 50, name: "Captions AI", category: "영상 제작", description: "숏폼 영상 편집을 자동으로 해 주는 앱. 자막, 컷 편집, 시선 보정, 잡음 제거를 한 번에 처리해요.", descriptionEn: "Short-form video editing app that handles captions, cuts, eye-contact correction and noise removal automatically.", url: "https://www.captions.ai", price: "무료/유료" },
  { id: 61, name: "Descript", category: "영상 제작", description: "받아쓰기 텍스트를 고치면 영상·팟캐스트가 함께 편집되는 도구. '음', '어' 같은 군말도 자동으로 지워 줘요.", descriptionEn: "Edit video and podcasts by editing the transcript; removes filler words like 'um' automatically.", url: "https://www.descript.com", price: "무료/유료" },

  // AI 음성
  { id: 15, name: "ElevenLabs", category: "AI 음성", description: "사람처럼 자연스러운 AI 음성을 만드는 플랫폼. 여러 언어 내레이션, 목소리 복제, 영상 더빙, 효과음 생성을 지원해요.", descriptionEn: "Lifelike AI voice platform for narration in many languages, voice cloning, video dubbing and sound effects.", url: "https://elevenlabs.io", price: "무료/유료" },
  { id: 18, name: "Typecast", category: "AI 음성", description: "감정 표현이 풍부한 국산 AI 성우 서비스. 다양한 캐릭터 목소리로 내레이션과 대사를 만들어요.", descriptionEn: "Korean AI voice service with expressive character voices for narration and dialogue.", url: "https://typecast.ai", price: "무료/유료" },
  { id: 83, name: "Murf AI", category: "AI 음성", description: "여러 언어와 목소리의 AI 성우로 내레이션을 만드는 TTS 도구. 속도·강조·쉼을 세밀하게 조절해요.", descriptionEn: "Text-to-speech studio with many voices and languages, and fine control over pace, emphasis and pauses.", url: "https://murf.ai", price: "무료/유료" },
  { id: 106, name: "Speechify", category: "AI 음성", description: "웹페이지, PDF, 책을 자연스러운 목소리로 읽어 주는 앱. 읽기 속도를 자유롭게 바꿀 수 있어요.", descriptionEn: "Reads web pages, PDFs and books aloud in natural voices at any speed you like.", url: "https://speechify.com", price: "무료/유료" },
  { id: 108, name: "OpenVoice (MyShell)", category: "AI 음성", description: "MyShell이 공개한 오픈소스 음성 복제 모델. 짧은 음성 샘플로 목소리를 따라 하고 억양·감정을 조절해요.", descriptionEn: "MyShell's open-source voice cloning model: copies a voice from a short sample and adjusts accent and emotion.", url: "https://myshell.ai", price: "무료" },
  { id: 105, name: "Whisper AI (OpenAI)", category: "AI 음성", description: "OpenAI가 공개한 음성 인식(STT) 모델. 여러 언어를 정확하게 받아쓰고, 내 컴퓨터에서 무료로 실행할 수 있어요.", descriptionEn: "OpenAI's open-source speech recognition model. Transcribes many languages accurately and runs free on your own computer.", url: "https://openai.com/research/whisper", price: "무료" },
  { id: 71, name: "Adobe Podcast AI", category: "AI 음성", description: "잡음과 울림을 지워 녹음을 스튜디오 음질처럼 바꿔 주는 어도비의 음성 보정 도구.", descriptionEn: "Adobe's tool that removes noise and echo so recordings sound studio-quality (Enhance Speech).", url: "https://podcast.adobe.com", price: "무료/유료" },

  // 음악 생성
  { id: 16, name: "Suno AI", category: "음악 생성", description: "가사, 장르, 분위기를 적으면 보컬이 들어간 노래를 만들어 주는 음악 생성 AI.", descriptionEn: "Music generator that writes full songs with vocals from your lyrics, genre and mood.", url: "https://suno.com", price: "무료/유료" },
  { id: 48, name: "Udio", category: "음악 생성", description: "자연스러운 보컬과 악기 소리가 강점인 음악 생성 AI. 곡을 이어 만들거나 리믹스할 수 있어요.", descriptionEn: "Music generator known for natural vocals and instruments; extend or remix tracks.", url: "https://www.udio.com", price: "무료/유료" },
  { id: 72, name: "Mureka AI", category: "음악 생성", description: "가사와 참고 곡으로 노래를 만드는 음악 생성 AI. 원하는 분위기와 장르를 세밀하게 정할 수 있어요.", descriptionEn: "Music generator that makes songs from lyrics and reference tracks, with control over mood and genre.", url: "https://mureka.ai", price: "무료/유료" },

  // 번역·외국어
  { id: 19, name: "DeepL", category: "번역·외국어", description: "문맥을 살린 자연스러운 번역으로 유명한 AI 번역기. 워드·PDF 문서를 통째로 번역하고 문장 교정(DeepL Write)도 해요.", descriptionEn: "Translator known for natural, context-aware results. Translates whole Word and PDF files and polishes text with DeepL Write.", url: "https://deepl.com", price: "무료/유료" },
  { id: 51, name: "Papago", category: "번역·외국어", description: "네이버의 번역기. 한국어 번역이 자연스럽고, 사진·음성·대화 번역을 지원해 여행에도 좋아요.", descriptionEn: "Naver's translator with natural Korean, plus photo, voice and conversation translation for travel.", url: "https://papago.naver.com", price: "무료" },
  { id: 52, name: "Speak AI", category: "번역·외국어", description: "AI 튜터와 실제 상황처럼 대화하며 배우는 외국어 회화 앱. 발음과 표현을 바로 고쳐 줘요.", descriptionEn: "Language app where you practice real-life conversations with an AI tutor and get instant feedback.", url: "https://www.speak.com", price: "무료/유료" },
  { id: 73, name: "Duolingo Max", category: "번역·외국어", description: "듀오링고의 AI 구독 플랜. AI와 롤플레이 대화, 틀린 답 설명, 캐릭터와 영상 통화 연습을 할 수 있어요.", descriptionEn: "Duolingo's AI subscription: role-play chats, explanations of your mistakes and video-call practice with characters.", url: "https://www.duolingo.com", price: "유료" },
  { id: 74, name: "Elsa Speak", category: "번역·외국어", description: "영어 발음을 소리 단위로 분석해 고쳐 주는 AI 발음 코치. 억양과 강세까지 피드백해요.", descriptionEn: "AI English pronunciation coach that checks each sound, plus intonation and stress.", url: "https://elsaspeak.com", price: "무료/유료" },

  // 교육·튜터
  { id: 117, name: "Khanmigo", category: "교육·튜터", description: "칸아카데미의 AI 튜터. 답을 바로 알려 주지 않고 질문으로 스스로 풀게 도와요. 교사용 수업 준비 도구도 있어요.", descriptionEn: "Khan Academy's AI tutor that guides students with questions instead of giving answers, plus lesson tools for teachers.", url: "https://www.khanacademy.org/khanmigo", price: "유료", status: "active" },
  { id: 119, name: "Synthesis Tutor", category: "교육·튜터", description: "어린이가 게임처럼 대화하며 수학을 배우는 AI 튜터. 아이 수준에 맞춰 진도를 조절해요.", descriptionEn: "AI math tutor for kids with game-like lessons that adapt to each child's level.", url: "https://www.synthesis.is", price: "유료", status: "active" },

  // 개발·코딩
  { id: 20, name: "Cursor", category: "개발·코딩", description: "VS Code를 바탕으로 만든 AI 코드 에디터. 프로젝트 전체를 이해하고 여러 파일을 한 번에 고치는 에이전트가 있어요.", descriptionEn: "AI code editor built on VS Code, with an agent that understands your codebase and edits many files at once.", url: "https://cursor.com", price: "무료/유료" },
  { id: 23, name: "GitHub Copilot", category: "개발·코딩", description: "GitHub의 AI 코딩 도우미. 에디터에서 코드를 자동완성하고, 이슈를 맡기면 PR까지 만드는 코딩 에이전트도 있어요.", descriptionEn: "GitHub's AI coding assistant: inline completions, chat, and a coding agent that turns issues into pull requests.", url: "https://github.com/features/copilot", price: "무료/유료" },
  { id: 53, name: "Windsurf", category: "개발·코딩", description: "Cognition(Devin 개발사)의 AI 코드 에디터. 에이전트 Cascade가 코드베이스를 파악해 여러 파일을 고치고 명령을 실행해요.", descriptionEn: "AI code editor from Cognition, the makers of Devin. Its Cascade agent understands the codebase, edits files and runs commands.", url: "https://windsurf.com", price: "무료/유료" },
  { id: 75, name: "Claude Code", category: "개발·코딩", description: "Anthropic의 코딩 에이전트. 터미널과 IDE에서 코드베이스를 읽고 여러 파일 수정, 테스트, 커밋까지 해요.", descriptionEn: "Anthropic's coding agent for the terminal and IDEs: reads your codebase, edits files, runs tests and commits.", url: "https://claude.ai/code", price: "유료" },
  { id: 55, name: "Tabnine", category: "개발·코딩", description: "보안을 중시하는 기업용 AI 코딩 도우미. 사내 서버에 설치해 코드가 밖으로 나가지 않게 쓸 수 있어요.", descriptionEn: "Privacy-focused AI coding assistant for companies, deployable on your own servers so code never leaves.", url: "https://www.tabnine.com", price: "무료/유료" },
  { id: 77, name: "Warp AI", category: "개발·코딩", description: "AI가 들어간 터미널. 하고 싶은 일을 말로 적으면 명령어를 만들어 주고, 에이전트가 작업을 실행해요.", descriptionEn: "Terminal with built-in AI: describe what you want to get the command, or let its agent run the task.", url: "https://www.warp.dev", price: "무료/유료" },
  { id: 76, name: "Pieces for Developers", category: "개발·코딩", description: "개발하며 본 코드와 작업 내용을 기억해 두었다가 찾아 주는 AI 도우미. 내 컴퓨터에서 실행돼요.", descriptionEn: "Developer assistant with long-term memory of the code and work you've seen; runs on your machine.", url: "https://pieces.app", price: "무료/유료" },
  { id: 109, name: "CodeRabbit", category: "개발·코딩", description: "GitHub·GitLab의 PR을 자동으로 리뷰하는 AI. 변경 사항을 요약하고 줄마다 리뷰 코멘트를 달아요.", descriptionEn: "AI that reviews GitHub and GitLab pull requests, summarizing changes and leaving line-by-line comments.", url: "https://coderabbit.ai", price: "무료/유료" },
  { id: 110, name: "Qodo (CodiumAI)", category: "개발·코딩", description: "테스트 코드 생성과 코드 리뷰를 돕는 AI 코드 품질 도구 (CodiumAI에서 이름 변경).", descriptionEn: "AI code-quality tool for generating tests and reviewing code (formerly CodiumAI).", url: "https://www.qodo.ai", price: "무료/유료", status: "active", statusReason: "CodiumAI에서 Qodo로 공식 서비스명 변경 후 정상 운영 중", statusCheckedAt: "2026-08-12", sourceUrl: "https://www.qodo.ai" },
  { id: 111, name: "SonarQube AI", category: "개발·코딩", description: "Sonar의 코드 품질·보안 점검 도구. 버그와 취약점을 찾아내고 AI로 고친 코드를 제안해요.", descriptionEn: "Sonar's code quality and security analysis: finds bugs and vulnerabilities and suggests AI fixes.", url: "https://www.sonarsource.com", price: "무료/유료", status: "active" },
  { id: 112, name: "Bito AI", category: "개발·코딩", description: "코드베이스를 이해하고 PR을 리뷰하는 AI 도우미. IDE에서 코드 설명과 리팩터링 제안도 해 줘요.", descriptionEn: "AI assistant that understands your codebase, reviews pull requests and explains or refactors code in the IDE.", url: "https://bito.ai", price: "무료/유료", status: "active" },

  // 앱·웹 만들기
  { id: 21, name: "Lovable", category: "앱·웹 만들기", description: "대화만으로 웹앱을 만들고 배포하는 AI 앱 빌더. 로그인·데이터베이스 연동과 GitHub 동기화를 지원해요.", descriptionEn: "AI app builder that creates and deploys web apps from chat, with login, database and GitHub sync.", url: "https://lovable.dev", price: "무료/유료" },
  { id: 22, name: "v0 by Vercel", category: "앱·웹 만들기", description: "Vercel의 AI 앱 빌더. 설명하면 React 화면과 앱을 만들어 미리 보여 주고, 바로 배포할 수 있어요.", descriptionEn: "Vercel's AI app builder: describe it, preview the React app it builds, and deploy in one click.", url: "https://v0.app", price: "무료/유료" },
  { id: 26, name: "Bolt.new", category: "앱·웹 만들기", description: "설치 없이 브라우저에서 풀스택 앱을 만들고 실행·배포하는 AI. 오류가 나도 대화로 고칠 수 있어요.", descriptionEn: "Builds, runs and deploys full-stack apps right in the browser; fix errors by chatting.", url: "https://bolt.new", price: "무료/유료" },
  { id: 54, name: "Replit AI", category: "앱·웹 만들기", description: "브라우저 개발 환경 Replit의 AI 에이전트. 설명하면 앱을 만들고 데이터베이스와 호스팅까지 한 번에 준비해요.", descriptionEn: "Replit's AI agent builds apps from a description, with database and hosting included, all in the browser.", url: "https://replit.com", price: "무료/유료" },

  // 업무·생산성
  { id: 29, name: "Notion AI", category: "업무·생산성", description: "노션 안에서 문서 작성·요약·번역을 돕고 워크스페이스 전체에서 답을 찾아 주는 AI. 회의 노트도 정리해요.", descriptionEn: "AI inside Notion for writing, summarizing and translating, answering from your whole workspace, and meeting notes.", url: "https://notion.so", price: "유료" },
  { id: 30, name: "Granola", category: "업무·생산성", description: "회의에 봇을 초대하지 않고도 받아 적고, 내가 쓴 메모를 바탕으로 회의록을 정리해 주는 AI 메모장.", descriptionEn: "AI notepad that transcribes meetings without a bot joining and turns your own notes into a full write-up.", url: "https://granola.ai", price: "무료/유료" },
  { id: 57, name: "Otter.ai", category: "업무·생산성", description: "회의를 실시간으로 받아 적고 요약과 할 일을 정리하는 AI. Zoom·Google Meet·Teams 회의에 자동으로 참석해요.", descriptionEn: "Transcribes meetings live and writes summaries and action items; joins Zoom, Google Meet and Teams automatically.", url: "https://otter.ai", price: "무료/유료" },
  { id: 80, name: "Fireflies.ai", category: "업무·생산성", description: "화상 회의를 자동으로 녹음·받아쓰기·요약하고, 지난 회의 내용을 검색할 수 있게 해 주는 AI.", descriptionEn: "Records, transcribes and summarizes video calls automatically and makes past meetings searchable.", url: "https://fireflies.ai", price: "무료/유료" },
  { id: 40, name: "Anysummary", category: "업무·생산성", description: "긴 영상·녹음·문서를 올리면 핵심 내용과 타임라인을 정리한 요약을 만들어 주는 도구.", descriptionEn: "Upload long videos, recordings or documents and get summaries with key points and timelines.", url: "https://www.anysummary.app", price: "무료/유료" },
  { id: 31, name: "Wispr Flow", category: "업무·생산성", description: "어느 앱에서나 말로 입력하면 군더더기를 지운 깔끔한 문장으로 바꿔 주는 음성 입력 도구.", descriptionEn: "Voice dictation that works in any app and turns casual speech into clean, polished text.", url: "https://wisprflow.ai", price: "무료/유료" },
  { id: 32, name: "Heptabase", category: "업무·생산성", description: "카드와 화이트보드로 자료와 생각을 연결해 정리하는 지식 관리 도구. PDF를 읽으며 바로 카드로 만들 수 있어요.", descriptionEn: "Visual knowledge tool: connect notes as cards on whiteboards and turn PDF highlights into cards.", url: "https://heptabase.com", price: "유료" },
  { id: 56, name: "Mem AI", category: "업무·생산성", description: "적어 두기만 하면 AI가 알아서 정리하고 연결해 주는 메모 앱. 내 노트에 질문해 필요한 내용을 찾아요.", descriptionEn: "Note app that organizes and links your notes for you; ask your notes questions to find things.", url: "https://mem.ai", price: "무료/유료" },
  { id: 79, name: "Tana AI", category: "업무·생산성", description: "모든 내용을 연결된 노드와 태그로 정리하는 노트 앱. 슈퍼태그로 메모를 데이터베이스처럼 관리하고 AI 회의 노트도 써요.", descriptionEn: "Outliner that organizes everything as linked nodes; supertags turn notes into databases, plus AI meeting notes.", url: "https://tana.inc", price: "무료/유료" },
  { id: 58, name: "Taskade AI", category: "업무·생산성", description: "할 일, 문서, 마인드맵과 AI 에이전트를 한곳에서 관리하는 협업 도구. 목표를 적으면 단계별 계획을 만들어 줘요.", descriptionEn: "Workspace for tasks, docs, mind maps and AI agents; write a goal and get a step-by-step plan.", url: "https://www.taskade.com", price: "무료/유료" },
  { id: 34, name: "Miro Assist", category: "업무·생산성", description: "온라인 화이트보드 미로의 AI 기능. 스티키 메모를 분류·요약하고 아이디어와 다이어그램을 만들어 줘요.", descriptionEn: "AI in the Miro whiteboard: sorts and summarizes sticky notes and generates ideas and diagrams.", url: "https://miro.com", price: "무료/유료" },
  { id: 37, name: "Glean", category: "업무·생산성", description: "회사의 여러 업무 앱을 한 번에 검색하고 사내 자료를 바탕으로 답하는 기업용 AI. 권한에 맞는 결과만 보여 줘요.", descriptionEn: "Enterprise AI that searches all your work apps at once and answers from company knowledge, respecting permissions.", url: "https://glean.com", price: "유료" },
  { id: 38, name: "Julius AI", category: "업무·생산성", description: "엑셀·CSV 파일을 올리고 질문하면 데이터를 분석해 차트와 결과를 보여 주는 AI 데이터 분석 도구.", descriptionEn: "Upload Excel or CSV files and ask questions to get analysis and charts — an AI data analyst.", url: "https://julius.ai", price: "무료/유료" },

  // 마케팅
  { id: 43, name: "Jasper AI", category: "마케팅", description: "브랜드 톤을 학습해 광고·블로그·SNS 문구를 만드는 마케팅용 AI. 팀 단위 캠페인 작업에 맞춰져 있어요.", descriptionEn: "Marketing AI that learns your brand voice to write ads, blogs and social posts, built for team campaigns.", url: "https://www.jasper.ai", price: "유료" },
  { id: 65, name: "Copy.ai", category: "마케팅", description: "영업·마케팅 문구를 만들고, 반복되는 업무를 워크플로로 자동화하는 AI 플랫폼.", descriptionEn: "AI platform for sales and marketing copy that also automates repetitive go-to-market work with workflows.", url: "https://www.copy.ai", price: "무료/유료" },
  { id: 59, name: "AdCreative.ai", category: "마케팅", description: "브랜드 색상과 로고에 맞춘 광고 배너와 문구를 대량으로 만들고, 성과 예측 점수를 보여 주는 광고 AI.", descriptionEn: "Generates on-brand ad banners and copy in bulk and scores each creative's predicted performance.", url: "https://www.adcreative.ai", price: "유료" },
  { id: 60, name: "Surfer", category: "마케팅", description: "검색 상위 노출을 위한 SEO 글쓰기 도구. 글을 쓰는 동안 키워드와 구성 점수를 실시간으로 알려 줘요.", descriptionEn: "SEO writing tool that scores keywords and structure in real time as you write.", url: "https://surfer.ai", price: "유료" },
  { id: 82, name: "Semrush AI", category: "마케팅", description: "키워드, 검색량, 경쟁사 트래픽을 분석하는 마케팅 플랫폼. AI 글쓰기와 사이트 SEO 점검 기능도 있어요.", descriptionEn: "Marketing platform for keyword, search volume and competitor traffic research, with AI writing and site audits.", url: "https://www.semrush.com", price: "유료" },

  // 에이전트·자동화
  { id: 24, name: "Manus / Devin", category: "에이전트·자동화", description: "일을 맡기면 스스로 계획하고 끝내는 자율형 AI 에이전트. Manus는 조사·문서 작업을, Devin은 개발 작업을 맡아요.", descriptionEn: "Autonomous AI agents that plan and finish tasks on their own: Manus for research and documents, Devin for software work.", url: "https://manus.im", price: "무료/유료" },
  { id: 36, name: "n8n / Make", category: "에이전트·자동화", description: "여러 앱과 AI를 블록처럼 연결해 반복 업무를 자동화하는 노코드 도구. n8n은 직접 설치해서도 쓸 수 있어요.", descriptionEn: "No-code tools that connect apps and AI as visual blocks to automate repetitive work; n8n can also be self-hosted.", url: "https://n8n.io", price: "무료/유료" },
  { id: 93, name: "AutoGPT", category: "에이전트·자동화", description: "블록을 이어 여러 단계를 스스로 처리하는 AI 에이전트를 만드는 오픈소스 플랫폼.", descriptionEn: "Open-source platform for building AI agents that chain steps together and run on their own.", url: "https://agpt.co", price: "무료/유료" },
  { id: 81, name: "Synthflow AI", category: "에이전트·자동화", description: "코딩 없이 전화 상담용 AI 음성 에이전트를 만드는 도구. 예약 접수와 고객 문의 응대를 자동화해요.", descriptionEn: "No-code builder for AI phone agents that handle bookings and customer calls.", url: "https://synthflow.ai", price: "유료" },

  // 금융·투자
  { id: 113, name: "Fiscal.ai (구 FinChat)", category: "금융·투자", description: "상장 기업의 재무제표, 실적 발표, 공시를 대화로 찾아보고 비교하는 금융 리서치 플랫폼 (FinChat에서 이름 변경).", descriptionEn: "Financial research platform for exploring and comparing public companies' financials, earnings calls and filings (formerly FinChat).", url: "https://fiscal.ai", price: "무료/유료" },
  { id: 114, name: "AlphaSense", category: "금융·투자", description: "증권사 리포트, 공시, 전문가 인터뷰를 AI로 검색·요약하는 기업·산업 리서치 플랫폼.", descriptionEn: "Market intelligence platform that searches and summarizes broker research, filings and expert calls with AI.", url: "https://www.alpha-sense.com", price: "유료" },
  { id: 115, name: "Kavout AI", category: "금융·투자", description: "AI로 종목을 분석해 점수(K Score)를 매기고 투자 아이디어를 골라 주는 도구. 결과는 참고용으로만 써야 해요.", descriptionEn: "AI stock research tool that rates stocks (K Score) and screens ideas — use it as one input, not advice.", url: "https://www.kavout.com", price: "유료" },

  // 법률
  { id: 120, name: "Harvey AI", category: "법률", description: "로펌과 기업 법무팀을 위한 법률 AI. 법률 리서치, 계약서·문서 검토, 초안 작성을 도와요.", descriptionEn: "Legal AI for law firms and in-house teams: research, contract and document review, and drafting.", url: "https://www.harvey.ai", price: "유료", status: "active" },
  { id: 121, name: "CoCounsel (Thomson Reuters)", category: "법률", description: "톰슨로이터의 법률 AI 어시스턴트. 웨스트로 같은 법률 데이터베이스를 바탕으로 판례 조사와 문서 검토를 해요.", descriptionEn: "Thomson Reuters' legal AI assistant for case research and document review, grounded in sources like Westlaw.", url: "https://www.thomsonreuters.com/en/cocounsel", price: "유료", status: "active" },
  { id: 122, name: "Spellbook", category: "법률", description: "마이크로소프트 워드 안에서 계약서의 위험 조항을 찾아 표시하고 수정안과 초안을 제안하는 법률 AI.", descriptionEn: "Legal AI inside Microsoft Word that flags risky contract clauses and suggests edits and drafts.", url: "https://www.spellbook.legal", price: "유료", status: "active" },
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
