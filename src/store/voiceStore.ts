import { create } from "zustand";

export type VoiceState =
  | "dormido"
  | "escuchando"
  | "pensando"
  | "hablando"
  | "accion"
  | "error"
  | "background"
  | "ejecutando"
  | "investigando"
  | "analizando"
  | "offline";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface JupyterTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface JupyterEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  createdAt: string;
}

export interface JupyterAlarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  createdAt: string;
}

interface VoiceStoreState {
  currentState: VoiceState;
  isMinimized: boolean;
  waveformAmplitudes: number[];
  setVoiceState: (state: VoiceState) => void;
  setMinimized: (minimized: boolean) => void;
  setWaveformAmplitudes: (amplitudes: number[]) => void;
  resetWaveform: () => void;

  // Chat State
  chatMessages: ChatMessage[];
  addChatMessage: (role: "user" | "assistant" | "system", content: string) => void;
  clearChatMessages: () => void;

  // Voice Selection State
  selectedVoice: string | null;
  availableVoices: any[];
  setSelectedVoice: (voiceId: string | null) => void;
  setAvailableVoices: (voices: any[]) => void;

  // Actions State
  tasks: JupyterTask[];
  events: JupyterEvent[];
  alarms: JupyterAlarm[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addEvent: (title: string, date: string, time: string) => void;
  deleteEvent: (id: string) => void;
  addAlarm: (time: string, label: string) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
}

export const useVoiceStore = create<VoiceStoreState>((set) => ({
  currentState: "dormido",
  isMinimized: false,
  waveformAmplitudes: Array(20).fill(0.1),
  setVoiceState: (state) => set({ currentState: state }),
  setMinimized: (minimized) => set({ isMinimized: minimized }),
  setWaveformAmplitudes: (amplitudes) => set({ waveformAmplitudes: amplitudes }),
  resetWaveform: () => set({ waveformAmplitudes: Array(20).fill(0.1) }),

  // Chat State
  chatMessages: [
    {
      id: "welcome",
      role: "assistant",
      content: "Sistemas inicializados. Soy Jupyter, tu asistente de inteligencia cognitiva. ¿En qué te puedo colaborar hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ],
  addChatMessage: (role, content) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        id: Math.random().toString(36).substring(7),
        role,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    ]
  })),
  clearChatMessages: () => set({ chatMessages: [] }),

  // Voice Selection State
  selectedVoice: null,
  availableVoices: [],
  setSelectedVoice: (voiceId) => set({ selectedVoice: voiceId }),
  setAvailableVoices: (voices) => set({ availableVoices: voices }),

  // Actions State
  tasks: [
    { id: "1", title: "Configurar credenciales de Supabase", completed: true, createdAt: new Date().toISOString() },
    { id: "2", title: "Validar conexión con Groq Whisper", completed: false, createdAt: new Date().toISOString() },
  ],
  events: [
    { id: "1", title: "Sincronización de Jupyter Core", date: "2026-05-21", time: "10:00", createdAt: new Date().toISOString() },
  ],
  alarms: [
    { id: "1", time: "08:00", label: "Despertar Sistema", enabled: true, createdAt: new Date().toISOString() },
  ],

  addTask: (title) => set((state) => ({
    tasks: [...state.tasks, { id: Math.random().toString(36).substring(7), title, completed: false, createdAt: new Date().toISOString() }]
  })),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),

  addEvent: (title, date, time) => set((state) => ({
    events: [...state.events, { id: Math.random().toString(36).substring(7), title, date, time, createdAt: new Date().toISOString() }]
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),

  addAlarm: (time, label) => set((state) => ({
    alarms: [...state.alarms, { id: Math.random().toString(36).substring(7), time, label, enabled: true, createdAt: new Date().toISOString() }]
  })),
  toggleAlarm: (id) => set((state) => ({
    alarms: state.alarms.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a)
  })),
  deleteAlarm: (id) => set((state) => ({
    alarms: state.alarms.filter((a) => a.id !== id)
  })),
}));
