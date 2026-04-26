"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type LangCode = "en" | "ko" | "zh" | "ja" | "ru"

interface Translations {
  // Nav
  features: string
  howItWorks: string
  pricing: string
  getStarted: string
  // Hero
  badge: string
  heroTitle1: string
  heroTitle2: string
  heroSubtitle: string
  tryStepzy: string
  howItWorksBtn: string
  problemsSolved: string
  accuracy: string
  responseTime: string
  // Solve section
  uploadYour: string
  problem: string
  chooseHow: string
  imageRecognition: string
  aiAnalysis: string
  stepByStep: string
  // Tabs
  uploadPhoto: string
  takePhoto: string
  typeQuestion: string
  // Upload tab
  dragDrop: string
  dropHere: string
  orBrowse: string
  chooseImage: string
  supports: string
  // Camera tab
  captureCamera: string
  cameraSubtitle: string
  startCamera: string
  cancel: string
  capture: string
  scanning: string
  scanningImage: string
  // Text tab
  typePlaceholder: string
  attachImage: string
  photo: string
  solve: string
  tryExample: string
  // Example questions
  examples: string[]
  // Analysis
  aiAnalyzing: string
  processing: string
  scanningStep: string
  analyzingStep: string
  solvingStep: string
  solution: string
  // Settings
  settings: string
  customize: string
  language: string
  saveChanges: string
}

const translations: Record<LangCode, Translations> = {
  en: {
    features: "Features",
    howItWorks: "How it Works",
    pricing: "Pricing",
    getStarted: "Get Started",
    badge: "AI-Powered Learning",
    heroTitle1: "Homework made",
    heroTitle2: "effortless",
    heroSubtitle: "Snap a photo of any problem. Get instant, step-by-step AI explanations that help you truly understand.",
    tryStepzy: "Try Stepzy",
    howItWorksBtn: "How it works",
    problemsSolved: "Problems Solved",
    accuracy: "Accuracy",
    responseTime: "Response Time",
    uploadYour: "Upload your",
    problem: "problem",
    chooseHow: "Choose how you want to share your question with our AI",
    imageRecognition: "Image Recognition",
    aiAnalysis: "AI Analysis",
    stepByStep: "Step-by-Step Solutions",
    uploadPhoto: "Upload Photo",
    takePhoto: "Take Photo",
    typeQuestion: "Type Question",
    dragDrop: "Drag and drop your image here",
    dropHere: "Drop your image here",
    orBrowse: "or click to browse from your device",
    chooseImage: "Choose Image",
    supports: "Supports PNG, JPG, WEBP, HEIC",
    captureCamera: "Capture with Camera",
    cameraSubtitle: "Take a photo of your problem for instant AI analysis",
    startCamera: "Start Camera",
    cancel: "Cancel",
    capture: "Capture",
    scanning: "Scanning...",
    scanningImage: "Scanning image...",
    typePlaceholder: "Type or paste your question here...",
    attachImage: "Attach Image",
    photo: "Photo",
    solve: "Solve",
    tryExample: "Try an example",
    examples: [
      "Solve: 2x + 5 = 17",
      "Explain quantum entanglement simply",
      "What causes aurora borealis?",
      "Derive the quadratic formula",
      "How does blockchain consensus work?",
      "Explain Newton's 3rd law with examples",
    ],
    aiAnalyzing: "AI is analyzing your problem...",
    processing: "Processing",
    scanningStep: "Scanning",
    analyzingStep: "Analyzing",
    solvingStep: "Solving",
    solution: "Solution",
    settings: "Settings",
    customize: "Customize your experience",
    language: "Language",
    saveChanges: "Save Changes",
  },
  ko: {
    features: "기능",
    howItWorks: "사용 방법",
    pricing: "요금제",
    getStarted: "시작하기",
    badge: "AI 기반 학습",
    heroTitle1: "숙제를",
    heroTitle2: "쉽게",
    heroSubtitle: "문제 사진을 찍으면 단계별 AI 설명을 즉시 받아보세요. 진정한 이해를 도와드립니다.",
    tryStepzy: "Stepzy 사용하기",
    howItWorksBtn: "사용 방법",
    problemsSolved: "해결된 문제",
    accuracy: "정확도",
    responseTime: "응답 시간",
    uploadYour: "문제를",
    problem: "업로드",
    chooseHow: "AI에게 질문을 공유할 방법을 선택하세요",
    imageRecognition: "이미지 인식",
    aiAnalysis: "AI 분석",
    stepByStep: "단계별 풀이",
    uploadPhoto: "사진 업로드",
    takePhoto: "사진 촬영",
    typeQuestion: "질문 입력",
    dragDrop: "여기에 이미지를 끌어다 놓으세요",
    dropHere: "여기에 놓으세요",
    orBrowse: "또는 클릭하여 기기에서 찾아보세요",
    chooseImage: "이미지 선택",
    supports: "PNG, JPG, WEBP, HEIC 지원",
    captureCamera: "카메라로 촬영",
    cameraSubtitle: "문제를 촬영하여 즉시 AI 분석을 받으세요",
    startCamera: "카메라 시작",
    cancel: "취소",
    capture: "촬영",
    scanning: "스캔 중...",
    scanningImage: "이미지 스캔 중...",
    typePlaceholder: "여기에 질문을 입력하세요...",
    attachImage: "이미지 첨부",
    photo: "사진",
    solve: "풀기",
    tryExample: "예시 질문",
    examples: [
      "풀이: 2x + 5 = 17",
      "양자 얽힘을 쉽게 설명해주세요",
      "오로라는 왜 생기나요?",
      "이차 공식을 유도해주세요",
      "블록체인 합의는 어떻게 작동하나요?",
      "뉴턴의 제3법칙을 예시와 함께 설명해주세요",
    ],
    aiAnalyzing: "AI가 문제를 분석하고 있습니다...",
    processing: "처리 중",
    scanningStep: "스캔",
    analyzingStep: "분석",
    solvingStep: "풀이",
    solution: "풀이 결과",
    settings: "설정",
    customize: "환경을 맞춤 설정하세요",
    language: "언어",
    saveChanges: "변경 사항 저장",
  },
  zh: {
    features: "功能",
    howItWorks: "使用方法",
    pricing: "价格",
    getStarted: "开始使用",
    badge: "AI 驱动学习",
    heroTitle1: "作业变得",
    heroTitle2: "轻松",
    heroSubtitle: "拍下任何问题的照片，即刻获得AI逐步解答，帮助你真正理解。",
    tryStepzy: "试试 Stepzy",
    howItWorksBtn: "了解详情",
    problemsSolved: "已解决问题",
    accuracy: "准确率",
    responseTime: "响应时间",
    uploadYour: "上传你的",
    problem: "问题",
    chooseHow: "选择你想与AI分享问题的方式",
    imageRecognition: "图像识别",
    aiAnalysis: "AI 分析",
    stepByStep: "逐步解答",
    uploadPhoto: "上传照片",
    takePhoto: "拍照",
    typeQuestion: "输入问题",
    dragDrop: "将图片拖放到这里",
    dropHere: "放置图片",
    orBrowse: "或点击从设备中选择",
    chooseImage: "选择图片",
    supports: "支持 PNG, JPG, WEBP, HEIC",
    captureCamera: "用相机拍摄",
    cameraSubtitle: "拍摄问题照片，即刻获得AI分析",
    startCamera: "启动相机",
    cancel: "取消",
    capture: "拍摄",
    scanning: "扫描中...",
    scanningImage: "正在扫描图像...",
    typePlaceholder: "在这里输入或粘贴你的问题...",
    attachImage: "附加图片",
    photo: "拍照",
    solve: "求解",
    tryExample: "试试示例",
    examples: [
      "求解: 2x + 5 = 17",
      "简单解释量子纠缠",
      "极光是怎么产生的？",
      "推导二次方程公式",
      "区块链共识是如何运作的？",
      "用例子解释牛顿第三定律",
    ],
    aiAnalyzing: "AI正在分析你的问题...",
    processing: "处理中",
    scanningStep: "扫描",
    analyzingStep: "分析",
    solvingStep: "求解",
    solution: "解答",
    settings: "设置",
    customize: "自定义您的体验",
    language: "语言",
    saveChanges: "保存更改",
  },
  ja: {
    features: "機能",
    howItWorks: "使い方",
    pricing: "料金",
    getStarted: "始める",
    badge: "AI学習サポート",
    heroTitle1: "宿題を",
    heroTitle2: "楽に",
    heroSubtitle: "問題を撮影するだけで、AIがステップごとに解説。本当の理解をサポートします。",
    tryStepzy: "Stepzyを試す",
    howItWorksBtn: "使い方",
    problemsSolved: "解決済み問題",
    accuracy: "正確率",
    responseTime: "応答時間",
    uploadYour: "問題を",
    problem: "アップロード",
    chooseHow: "AIに質問を共有する方法を選んでください",
    imageRecognition: "画像認識",
    aiAnalysis: "AI分析",
    stepByStep: "ステップ別解説",
    uploadPhoto: "写真をアップロード",
    takePhoto: "写真を撮る",
    typeQuestion: "質問を入力",
    dragDrop: "ここに画像をドラッグ＆ドロップ",
    dropHere: "ここにドロップ",
    orBrowse: "またはクリックしてデバイスから選択",
    chooseImage: "画像を選択",
    supports: "PNG, JPG, WEBP, HEIC対応",
    captureCamera: "カメラで撮影",
    cameraSubtitle: "問題を撮影してAI分析を即座に取得",
    startCamera: "カメラを起動",
    cancel: "キャンセル",
    capture: "撮影",
    scanning: "スキャン中...",
    scanningImage: "画像をスキャン中...",
    typePlaceholder: "ここに質問を入力してください...",
    attachImage: "画像を添付",
    photo: "写真",
    solve: "解く",
    tryExample: "例を試す",
    examples: [
      "解け: 2x + 5 = 17",
      "量子もつれを簡単に説明して",
      "オーロラの原因は何？",
      "二次方程式の公式を導出して",
      "ブロックチェーンのコンセンサスの仕組みは？",
      "ニュートンの第3法則を例で説明して",
    ],
    aiAnalyzing: "AIが問題を分析中です...",
    processing: "処理中",
    scanningStep: "スキャン",
    analyzingStep: "分析",
    solvingStep: "解決",
    solution: "解答",
    settings: "設定",
    customize: "体験をカスタマイズ",
    language: "言語",
    saveChanges: "変更を保存",
  },
  ru: {
    features: "Функции",
    howItWorks: "Как это работает",
    pricing: "Цены",
    getStarted: "Начать",
    badge: "Обучение с AI",
    heroTitle1: "Домашняя работа",
    heroTitle2: "легко",
    heroSubtitle: "Сфотографируйте задачу и мгновенно получите пошаговые объяснения от AI.",
    tryStepzy: "Попробовать Stepzy",
    howItWorksBtn: "Как это работает",
    problemsSolved: "Решённых задач",
    accuracy: "Точность",
    responseTime: "Время ответа",
    uploadYour: "Загрузите свою",
    problem: "задачу",
    chooseHow: "Выберите, как вы хотите поделиться вопросом с AI",
    imageRecognition: "Распознавание изображений",
    aiAnalysis: "AI-анализ",
    stepByStep: "Пошаговые решения",
    uploadPhoto: "Загрузить фото",
    takePhoto: "Сделать фото",
    typeQuestion: "Ввести вопрос",
    dragDrop: "Перетащите изображение сюда",
    dropHere: "Отпустите здесь",
    orBrowse: "или нажмите, чтобы выбрать на устройстве",
    chooseImage: "Выбрать изображение",
    supports: "Поддерживаются PNG, JPG, WEBP, HEIC",
    captureCamera: "Снять камерой",
    cameraSubtitle: "Сфотографируйте задачу для мгновенного AI-анализа",
    startCamera: "Включить камеру",
    cancel: "Отмена",
    capture: "Снять",
    scanning: "Сканирование...",
    scanningImage: "Сканирование изображения...",
    typePlaceholder: "Введите ваш вопрос здесь...",
    attachImage: "Прикрепить фото",
    photo: "Фото",
    solve: "Решить",
    tryExample: "Попробуйте пример",
    examples: [
      "Решить: 2x + 5 = 17",
      "Объясните квантовую запутанность простым языком",
      "Что вызывает северное сияние?",
      "Выведите формулу квадратного уравнения",
      "Как работает консенсус блокчейна?",
      "Объясните третий закон Ньютона с примерами",
    ],
    aiAnalyzing: "AI анализирует вашу задачу...",
    processing: "Обработка",
    scanningStep: "Сканирование",
    analyzingStep: "Анализ",
    solvingStep: "Решение",
    solution: "Решение",
    settings: "Настройки",
    customize: "Настройте под себя",
    language: "Язык",
    saveChanges: "Сохранить",
  },
}

interface LanguageContextType {
  lang: LangCode
  setLang: (code: LangCode) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>("en")

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
