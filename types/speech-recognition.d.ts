interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string

  start(): void
  stop(): void

  onresult: (event: SpeechRecognitionEvent) => void
  onend: () => void
  onerror: () => void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface Window {
  SpeechRecognition?: {
    new (): SpeechRecognition
  }
  webkitSpeechRecognition?: {
    new (): SpeechRecognition
  }
}