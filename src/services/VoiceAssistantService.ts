import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useVoiceStore } from "../store/voiceStore";

class VoiceAssistantService {
  private isListening: boolean = false;
  private recording: Audio.Recording | null = null;
  
  private get groqApiKey(): string {
    return (process.env.EXPO_PUBLIC_GROQ_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  }

  constructor() {
    console.log("[JupyterVoice] Inicializado. Groq Key exists:", !!this.groqApiKey, "Length:", this.groqApiKey.length);
    this.initVoices();
  }

  /**
   * Carga las voces del sistema disponibles y selecciona una en español por defecto.
   */
  public async initVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const esVoices = voices.filter((v: Speech.Voice) => v.language.toLowerCase().startsWith("es"));
      const store = useVoiceStore.getState();
      
      store.setAvailableVoices(esVoices);
      
      if (esVoices.length > 0 && !store.selectedVoice) {
        // Seleccionar una voz preferida por defecto (ej. Siri, Google o la primera disponible)
        const defaultVoice = esVoices.find((v: Speech.Voice) => v.name.includes("Siri") || v.name.includes("Google")) || esVoices[0];
        store.setSelectedVoice(defaultVoice.identifier);
      }
    } catch (e) {
      console.warn("[JupyterVoice] Error al cargar voces:", e);
    }
  }

  /**
   * Programa una alarma simulada localmente.
   */
  public async scheduleAlarmNotification(time: string, label: string) {
    try {
      console.log(`[JupyterVoice] Alarma programada localmente para las ${time} con etiqueta: ${label}`);
      // Simular alarma en la consola de depuración
    } catch (e) {
      console.warn("[JupyterVoice] Error en la simulación de alarma:", e);
    }
  }

  /**
   * Inicia el proceso de escucha del usuario (graba desde el micrófono).
   */
  public async startListening() {
    if (this.isListening) return;
    
    const store = useVoiceStore.getState();
    Speech.stop();
    store.resetWaveform();

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error("[JupyterVoice] Permiso de micrófono denegado");
        store.setVoiceState("error");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      this.isListening = true;
      store.setVoiceState("escuchando");
      console.log("[JupyterVoice] Grabando audio...");

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;

      this.startWaveformSimulation();

    } catch (error) {
      console.error("[JupyterVoice] Error al iniciar grabación:", error);
      this.isListening = false;
      this.recording = null;
      store.setVoiceState("error");
    }
  }

  /**
   * Detiene el proceso de escucha, guarda el audio y comienza el procesamiento.
   */
  public async stopListening() {
    if (!this.isListening) return;
    this.isListening = false;

    const store = useVoiceStore.getState();
    store.setVoiceState("pensando");
    this.stopWaveformSimulation();

    if (!this.recording) {
      console.warn("[JupyterVoice] No hay grabación activa para detener");
      store.setVoiceState("dormido");
      return;
    }

    try {
      console.log("[JupyterVoice] Deteniendo grabación...");
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      if (uri) {
        console.log("[JupyterVoice] Audio guardado temporalmente en:", uri);
        await this.handleAudioFile(uri);
      } else {
        throw new Error("No se obtuvo URI del archivo de audio");
      }
    } catch (error) {
      console.error("[JupyterVoice] Error al detener grabación:", error);
      store.setVoiceState("error");
    }
  }

  /**
   * Envía el archivo de audio a Groq Whisper para transcripción (STT).
   */
  private async handleAudioFile(uri: string) {
    const store = useVoiceStore.getState();

    if (!this.groqApiKey) {
      console.warn("[JupyterVoice] Groq API Key no configurada.");
      this.speak("No tengo configurada la clave de Groq para transcribir tu voz.");
      return;
    }

    try {
      console.log("[Groq Whisper] Subiendo audio a la API de transcripción...");
      
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const mimeType = `audio/${fileType === "m4a" ? "m4a" : fileType === "mp4" ? "mp4" : "wav"}`;
      
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: `recording.${fileType}`,
        type: mimeType,
      } as any);
      formData.append("model", "whisper-large-v3");
      formData.append("language", "es");

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.groqApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq Whisper falló: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const transcript = data.text;
      
      if (transcript && transcript.trim().length > 0) {
        console.log("[Groq Whisper Transcript]:", transcript);
        await this.handleUserText(transcript);
      } else {
        console.warn("[Groq Whisper] Transcripción vacía.");
        this.speak("No logré entender bien tu voz. ¿Podrías repetirlo, por favor?");
      }

    } catch (error) {
      console.error("[Groq Whisper] Error en transcripción:", error);
      store.setVoiceState("error");
      this.speak("Tuve un problema al procesar el audio de tu voz.");
    }
  }

  /**
   * Procesa la entrada textual del usuario (voz o chat) y llama al LLM.
   */
  public async handleUserText(text: string) {
    const store = useVoiceStore.getState();
    store.setVoiceState("pensando");

    // Guardar en el historial de chat de la app
    store.addChatMessage("user", text);

    const cleanText = text.toLowerCase().trim();
    
    // Comandos de control rápido
    if (cleanText.includes("minimízate jupyter") || cleanText.includes("minimiza")) {
      store.setMinimized(true);
      const res = "Minimizando interfaz. Seguiré activo en segundo plano.";
      store.addChatMessage("assistant", res);
      this.speak(res);
      return;
    }

    if (cleanText.includes("adiós jupyter") || cleanText.includes("apágate")) {
      store.setVoiceState("dormido");
      return;
    }

    // --- PARSEO DE COMANDOS / ACCIONES POR VOZ ---
    let actionDetected = false;
    let actionContextPrompt = "";

    // 1. Tareas
    if (
      cleanText.includes("crea una tarea") || 
      cleanText.includes("nueva tarea") || 
      cleanText.includes("agrega una tarea") ||
      cleanText.includes("agregar tarea")
    ) {
      let title = text.replace(/crea una tarea de|crea una tarea|nueva tarea|agrega una tarea de|agrega una tarea|agregar tarea/gi, "").trim();
      title = title.replace(/^(de|para)\s+/i, "").trim();
      if (title.length > 0) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
        store.addTask(title);
        actionDetected = true;
        actionContextPrompt = `[ACCION REALIZADA] El sistema acaba de crear con éxito la tarea: "${title}".`;
      }
    }
    // 2. Alarmas
    else if (
      cleanText.includes("alarma") || 
      cleanText.includes("despiértame") || 
      cleanText.includes("despiertame")
    ) {
      const timeMatch = cleanText.match(/(\d{1,2})[:h](\d{2})?/);
      let hourStr = "";
      let minStr = "00";
      
      if (timeMatch) {
        hourStr = timeMatch[1].padStart(2, "0");
        if (timeMatch[2]) {
          minStr = timeMatch[2].padStart(2, "0");
        }
      } else {
        const wordNumbers: { [key: string]: string } = {
          "una": "01", "dos": "02", "tres": "03", "cuatro": "04", "cinco": "05",
          "seis": "06", "siete": "07", "ocho": "08", "nueve": "09", "diez": "10",
          "once": "11", "doce": "12"
        };
        for (const word of Object.keys(wordNumbers)) {
          if (cleanText.includes(word)) {
            hourStr = wordNumbers[word];
            break;
          }
        }
      }

      if (hourStr) {
        let hourNum = parseInt(hourStr);
        if ((cleanText.includes("tarde") || cleanText.includes("noche") || cleanText.includes("p.m.") || cleanText.includes("pm")) && hourNum < 12) {
          hourNum += 12;
        }
        const timeFormatted = `${hourNum.toString().padStart(2, "0")}:${minStr}`;
        const label = "Alarma de Jupyter";
        store.addAlarm(timeFormatted, label);
        await this.scheduleAlarmNotification(timeFormatted, label);
        actionDetected = true;
        actionContextPrompt = `[ACCION REALIZADA] El sistema acaba de programar y guardar una alarma para las ${timeFormatted}.`;
      }
    }
    // 3. Eventos
    else if (
      cleanText.includes("evento") || 
      cleanText.includes("agenda") || 
      cleanText.includes("reunión") ||
      cleanText.includes("reunion") ||
      cleanText.includes("cita")
    ) {
      let title = text.replace(/crea un evento de|crea un evento|agenda un evento de|agenda un evento|agenda|reunión de|reunion de|cita de/gi, "").trim();
      title = title.replace(/^(de|para)\s+/i, "").trim();
      
      const timeMatch = cleanText.match(/(\d{1,2})[:h](\d{2})?/);
      let timeFormatted = "12:00";
      if (timeMatch) {
        let hourNum = parseInt(timeMatch[1]);
        let minStr = timeMatch[2] ? timeMatch[2].padStart(2, "0") : "00";
        if ((cleanText.includes("tarde") || cleanText.includes("noche")) && hourNum < 12) {
          hourNum += 12;
        }
        timeFormatted = `${hourNum.toString().padStart(2, "0")}:${minStr}`;
      }

      let dateStr = new Date().toISOString().split("T")[0];
      if (cleanText.includes("mañana") || cleanText.includes("manana")) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateStr = tomorrow.toISOString().split("T")[0];
      }

      title = title.replace(/(para mañana|para manana|hoy|a las \d+.*|mañana a las.*|manana a las.*)/gi, "").trim();
      if (title.length === 0) title = "Reunión Programada";
      title = title.charAt(0).toUpperCase() + title.slice(1);

      store.addEvent(title, dateStr, timeFormatted);
      actionDetected = true;
      actionContextPrompt = `[ACCION REALIZADA] El sistema acaba de agendar el evento "${title}" para el día ${dateStr} a las ${timeFormatted}.`;
    }

    try {
      // Si se realizó una acción, le inyectamos ese contexto al prompt para que el LLM responda coherentemente
      const finalPrompt = actionDetected 
        ? `${actionContextPrompt}. Confirma esto al usuario de forma elegante y muy corta. Mensaje del usuario: ${text}`
        : text;

      const response = await this.queryGroqLLM(finalPrompt);
      
      store.addChatMessage("assistant", response);
      await this.speak(response);
    } catch (error) {
      console.error("[Groq LLM] Error:", error);
      store.setVoiceState("error");
      const errRes = "Lo siento, tuve un problema al procesar tu solicitud.";
      store.addChatMessage("assistant", errRes);
      this.speak(errRes);
    }
  }

  /**
   * Envía la consulta al modelo Llama 3 en Groq.
   */
  public async queryGroqLLM(
    prompt: string, 
    historyOverride?: { role: "user" | "assistant" | "system"; content: string; }[]
  ): Promise<string> {
    const store = useVoiceStore.getState();
    
    // Obtener los últimos 10 mensajes del historial del chat para mantener el contexto continuo o usar historyOverride
    const messageHistory = historyOverride
      ? historyOverride.map((msg) => ({ role: msg.role, content: msg.content }))
      : store.chatMessages
          .slice(-10)
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

    // Reemplazar o añadir el prompt final (que puede incluir el contexto de la acción ejecutada)
    if (messageHistory.length > 0 && messageHistory[messageHistory.length - 1].role === "user") {
      messageHistory[messageHistory.length - 1].content = prompt;
    } else {
      messageHistory.push({ role: "user", content: prompt });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Eres Jupyter, un asistente móvil sofisticado, de personalidad elegante y futurista. Tus respuestas deben ser cortas y directas, óptimas para conversión de voz y en español. Si en tu contexto te indican que ya se realizó una acción de forma exitosa (como crear una tarea, alarma o evento), confirma que ya está hecho con asertividad y elegancia.",
          },
          ...messageHistory,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Groq LLM] Error response body:", errorText);
      throw new Error(`Error en Groq Chat: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No he podido procesar la consulta.";
  }

  /**
   * Generación y reproducción de voz (TTS nativo mediante expo-speech).
   */
  private async speak(text: string) {
    const store = useVoiceStore.getState();
    store.setVoiceState("hablando");
    console.log("[Jupyter TTS (expo-speech)] Hablando:", text);

    Speech.stop();

    const waveformInterval = setInterval(() => {
      const amps = Array(20).fill(0).map(() => Math.random() * 0.7 + 0.15);
      store.setWaveformAmplitudes(amps);
    }, 100);

    const voiceId = store.selectedVoice;

    Speech.speak(text, {
      language: "es",
      voice: voiceId || undefined,
      pitch: 1.0,
      rate: 1.0,
      onDone: () => {
        clearInterval(waveformInterval);
        store.resetWaveform();
        store.setVoiceState("dormido");
      },
      onError: (e) => {
        console.error("[Expo Speech] Error:", e);
        clearInterval(waveformInterval);
        store.resetWaveform();
        store.setVoiceState("error");
      }
    });
  }

  /**
   * Interrumpe la respuesta actual del asistente (Barge-in).
   */
  public triggerBargeIn() {
    console.log("[JupyterVoice] Barge-in detectado. Deteniendo salida.");
    Speech.stop();
    const store = useVoiceStore.getState();
    store.resetWaveform();
    store.setVoiceState("escuchando");
    this.startListening();
  }

  // --- Utilidades para la simulación visual del micrófono ---
  private waveformSimInterval: any = null;

  private startWaveformSimulation() {
    const store = useVoiceStore.getState();
    this.waveformSimInterval = setInterval(() => {
      const amps = Array(20).fill(0).map(() => Math.random() * 0.4 + 0.05);
      store.setWaveformAmplitudes(amps);
    }, 100);
  }

  private stopWaveformSimulation() {
    if (this.waveformSimInterval) {
      clearInterval(this.waveformSimInterval);
      this.waveformSimInterval = null;
    }
    useVoiceStore.getState().resetWaveform();
  }
}

export const jupyterVoice = new VoiceAssistantService();
