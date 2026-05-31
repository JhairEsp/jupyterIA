import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Switch,
  Dimensions,
  Animated,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVoiceStore } from "../store/voiceStore";
import { jupyterVoice } from "../services/VoiceAssistantService";
import { COLORS } from "../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ExploreScreen() {
  const { 
    tasks, addTask, toggleTask, deleteTask,
    events, addEvent, deleteEvent,
    alarms, addAlarm, toggleAlarm, deleteAlarm,
    availableVoices, selectedVoice, setSelectedVoice
  } = useVoiceStore();

  // Selected tool state (null means Dashboard main grid)
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  // General simulation states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Chat thread states
  const [chatThreads, setChatThreads] = useState<{
    id: string;
    title: string;
    messages: { role: string; content: string; isThinking?: boolean }[];
  }[]>([
    { id: "1", title: "Planificación Jupyter OS", messages: [{ role: "assistant", content: "Sistemas iniciados. ¿Qué modulo revisamos hoy?" }] },
    { id: "2", title: "Idea de Startup: IA Agente", messages: [] },
  ]);
  const [activeThread, setActiveThread] = useState("1");
  const [chatInput, setChatInput] = useState("");

  // Automation states
  const [workflows, setWorkflows] = useState([
    { id: "1", trigger: "Al llegar a oficina", action: "Activar enfoque + silenciar", enabled: true },
    { id: "2", trigger: "Cada mañana 8:00 AM", action: "Resumir mis noticias", enabled: false }
  ]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newAction, setNewAction] = useState("");

  // Files states
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileAnalysis, setFileAnalysis] = useState<string | null>(null);
  const [analyzingFile, setAnalyzingFile] = useState(false);

  // Memory states
  const [memories, setMemories] = useState([
    { id: "1", content: "Prefiere respuestas directas y cortas." },
    { id: "2", content: "Desarrollador de aplicaciones móviles con Expo." },
    { id: "3", content: "Suele trabajar en proyectos cognitivos por la tarde." }
  ]);
  const [newMemory, setNewMemory] = useState("");

  // Code studio states
  const [selectedAgent, setSelectedAgent] = useState("coder");
  const [codingPrompt, setCodingPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [coding, setCoding] = useState(false);

  // Screen Analysis states
  const [screenAnalysisResult, setScreenAnalysisResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Voice settings
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState(0.8);

  // Form states
  const [taskText, setTaskText] = useState("");
  const [eventTitleText, setEventTitleText] = useState("");
  const [eventDateText, setEventDateText] = useState(new Date().toISOString().split("T")[0]);
  const [eventTimeText, setEventTimeText] = useState("14:00");
  const [alarmTimeText, setAlarmTimeText] = useState("08:00");
  const [alarmLabelText, setAlarmLabelText] = useState("Alarma");

  // Handler for deep search simulation
  const handleAISearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults(null);
    setTimeout(() => {
      setSearching(false);
      setSearchResults({
        summary: `Resultados consolidados de la búsqueda sobre "${searchQuery}":\n\nSe ha verificado información a través de Tavily y Exa. La fusión nuclear comercial sigue en fase experimental, con el reactor MIT SPARC planificando pruebas net-energy para finales de 2026. Las inversiones globales han aumentado un 18% este año.`,
        sources: [
          { id: 1, name: "exa.ai/nuclear-fusion-mit", url: "https://exa.ai" },
          { id: 2, name: "tavily.com/reports/cleanenergy", url: "https://tavily.com" },
          { id: 3, name: "firecrawl.dev/scraped-science", url: "https://firecrawl.dev" }
        ]
      });
    }, 2000);
  };

  // Handler for chat messages
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const msgText = chatInput;
    setChatInput("");
    
    let currentMessages: { role: string; content: string; isThinking?: boolean }[] = [];
    
    // 1. Agregar de inmediato el mensaje del usuario y una burbuja de respuesta temporal "Procesando..."
    setChatThreads(prev => prev.map(t => {
      if (t.id === activeThread) {
        const updatedMessages = [
          ...t.messages,
          { role: "user", content: msgText }
        ];
        currentMessages = updatedMessages;
        return {
          ...t,
          messages: [
            ...updatedMessages,
            { role: "assistant", content: "Procesando respuesta cognitiva de Jupyter...", isThinking: true }
          ]
        };
      }
      return t;
    }));

    try {
      // 2. Mapear el historial del hilo para el formato esperado por Groq
      const historyForLLM = currentMessages.map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }));
      
      // Consultar la API a través del servicio expuesto publicamente
      const response = await jupyterVoice.queryGroqLLM(msgText, historyForLLM);
      
      // 3. Reemplazar la burbuja temporal por la respuesta real de la IA
      setChatThreads(prev => prev.map(t => {
        if (t.id === activeThread) {
          return {
            ...t,
            messages: t.messages.map(m => 
              m.isThinking 
                ? { role: "assistant", content: response } 
                : m
            )
          };
        }
        return t;
      }));
    } catch (error) {
      console.error("[Advanced Chat Error]:", error);
      // Reemplazar burbuja temporal con un mensaje elegante de error
      setChatThreads(prev => prev.map(t => {
        if (t.id === activeThread) {
          return {
            ...t,
            messages: t.messages.map(m => 
              m.isThinking 
                ? { role: "assistant", content: "Lo siento, tuve un problema de comunicación al conectar con el núcleo cognitivo." } 
                : m
            )
          };
        }
        return t;
      }));
    }
  };

  // Handler for PDF File upload/OCR simulation
  const handleAnalyzeFile = (fileName: string) => {
    setSelectedFile(fileName);
    setAnalyzingFile(true);
    setFileAnalysis(null);
    setTimeout(() => {
      setAnalyzingFile(false);
      if (fileName.endsWith(".pdf")) {
        setFileAnalysis(`[OCR SUCCESS] Documento: ${fileName}\n\nResumen: Este informe describe el plan financiero de la startup. Se estiman gastos operativos de $45k mensuales y un break-even proyectado en el mes 14. Puntos clave analizados:\n- Margen bruto: 78%\n- CAC estimado: $120\n- LTV promedio: $980`);
      } else {
        setFileAnalysis(`[IMAGE ANALYSIS SUCCESS] Imagen: ${fileName}\n\nSe identificó una maqueta de interfaz de usuario de color negro. Contiene 3 botones circulares, una barra de título superior y un visualizador de ondas en la parte inferior. La paleta de colores dominante es violeta y azul neón.`);
      }
    }, 2000);
  };

  // Handler for screen analysis simulation
  const handleAnalyzeScreen = () => {
    setScanning(true);
    setScreenAnalysisResult(null);
    setTimeout(() => {
      setScanning(false);
      setScreenAnalysisResult(
        "CAPTURA DE PANTALLA PROCESADA // JUPYTER OS COGNITION\n\n" +
        "1. Elementos Detectados: 2 Cards principales, 1 Barra de navegación de pestañas (Home, Explore).\n" +
        "2. Advertencia de UX: El texto de la sección de telemetría superior posee un contraste de color de 3.2:1, inferior al estándar WCAG de 4.5:1. Se sugiere aclarar el texto.\n" +
        "3. Diagnóstico Técnico: No se visualizan excepciones activas en la UI."
      );
    }, 2500);
  };

  // Handler for Code generation simulation
  const handleGenerateCode = () => {
    if (!codingPrompt.trim()) return;
    setCoding(true);
    setGeneratedCode(null);
    setTimeout(() => {
      setCoding(false);
      setGeneratedCode(
        `// Componente de Cristal Neón Generado por Jupyter OS\n` +
        `import React from 'react';\n` +
        `import { View, Text, StyleSheet } from 'react-native';\n\n` +
        `export default function NeonCard({ title, value }) {\n` +
        `  return (\n` +
        `    <View style={styles.card}>\n` +
        `      <Text style={styles.label}>{title}</Text>\n` +
        `      <Text style={styles.val}>{value}</Text>\n` +
        `    </View>\n` +
        `  );\n` +
        `}\n\n` +
        `const styles = StyleSheet.create({\n` +
        `  card: {\n` +
        `    backgroundColor: 'rgba(15, 23, 42, 0.4)',\n` +
        `    borderColor: '#8B5CF6',\n` +
        `    borderWidth: 1,\n` +
        `    borderRadius: 16,\n` +
        `    padding: 16,\n` +
        `    shadowColor: '#8B5CF6',\n` +
        `    shadowRadius: 10,\n` +
        `  },\n` +
        `  label: { color: '#64748B', fontSize: 10, letterSpacing: 1 },\n` +
        `  val: { color: '#FFFFFF', fontSize: 18, marginTop: 4, fontWeight: '700' },\n` +
        `});`
      );
    }, 2000);
  };

  // Render sub-screens depending on chosen tool
  const renderToolContent = () => {
    switch (currentTool) {
      case "chat":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>💬 AI Chat Avanzado</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.chatSplitScreen}>
              {/* Sidebar threads */}
              <View style={styles.chatSidebar}>
                <Text style={styles.sidebarHeader}>HILOS ACTIVOS</Text>
                {chatThreads.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setActiveThread(t.id)}
                    style={[styles.threadItem, activeThread === t.id && styles.threadItemActive]}
                  >
                    <Text style={styles.threadText} numberOfLines={1}>{t.title}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => {
                    const newId = (chatThreads.length + 1).toString();
                    setChatThreads([...chatThreads, { id: newId, title: `Chat #${newId}`, messages: [] }]);
                    setActiveThread(newId);
                  }}
                  style={styles.newChatBtn}
                >
                  <Text style={styles.newChatText}>+ Nuevo Hilo</Text>
                </TouchableOpacity>
              </View>

              {/* Chat View */}
              <View style={styles.chatMain}>
                <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
                  {chatThreads.find(t => t.id === activeThread)?.messages.length === 0 ? (
                    <Text style={styles.emptyText}>No hay mensajes en esta conversación. Escribe algo para iniciar.</Text>
                  ) : (
                    chatThreads.find(t => t.id === activeThread)?.messages.map((m, idx) => (
                      <View 
                        key={idx} 
                        style={[
                          styles.chatMsgBubble, 
                          m.role === "user" ? styles.msgUser : styles.msgAssistant,
                          m.isThinking && { borderColor: "#8B5CF6", borderWidth: 1 }
                        ]}
                      >
                        <Text style={[styles.msgText, m.isThinking && { color: "#A78BFA", fontStyle: "italic" }]}>
                          {m.content}
                        </Text>
                      </View>
                    ))
                  )}
                </ScrollView>
                <View style={styles.chatInputRow}>
                  <TextInput
                    style={styles.chatTextInput}
                    placeholder="Escribe en este canal..."
                    placeholderTextColor="#475569"
                    value={chatInput}
                    onChangeText={setChatInput}
                    onSubmitEditing={handleSendChatMessage}
                  />
                  <TouchableOpacity onPress={handleSendChatMessage} style={styles.chatSendBtn}>
                    <Text style={styles.chatSendText}>➡️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );

      case "search":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>🔍 Búsqueda Inteligente (Web Search)</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Búsqueda en tiempo real indexando fuentes de internet con IA (Groq, Tavily, Exa).
            </Text>

            <View style={styles.searchBarRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Pregúntale a la web..."
                placeholderTextColor="#475569"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleAISearch}
              />
              <TouchableOpacity onPress={handleAISearch} style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>

            {searching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0EA5E9" />
                <Text style={styles.loadingText}>Rastreando la web con Firecrawl y compilando fuentes...</Text>
              </View>
            )}

            {searchResults && (
              <ScrollView style={styles.searchResultsContainer}>
                <Text style={styles.searchSummaryTitle}>INFORME COMPILADO:</Text>
                <Text style={styles.searchSummaryText}>{searchResults.summary}</Text>
                
                <Text style={styles.sourcesHeader}>FUENTES DETECTADAS:</Text>
                {searchResults.sources.map((src: any) => (
                  <View key={src.id} style={styles.sourceCard}>
                    <Text style={styles.sourceName}>[{src.id}] {src.name}</Text>
                    <Text style={styles.sourceUrl}>{src.url}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        );

      case "productivity":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>📆 Productivity Hub</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.aiSuggestionBox}>
              <Text style={styles.aiSuggestionIcon}>🤖</Text>
              <Text style={styles.aiSuggestionText}>
                JUPYTER COGNITIVE SUGGESTION: Has acumulado 3 tareas del mismo proyecto hoy. Agenda un bloqueo de enfoque a las 15:00 para resolverlas de forma consecutiva.
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ gap: 20 }}>
              {/* Form to Add Task */}
              <View style={styles.actionCard}>
                <Text style={styles.actionCardTitle}>CREAR TAREA NUEVA</Text>
                <View style={styles.quickFormRow}>
                  <TextInput
                    style={styles.quickInput}
                    placeholder="Título de la tarea..."
                    placeholderTextColor="#475569"
                    value={taskText}
                    onChangeText={setTaskText}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      if (!taskText.trim()) return;
                      addTask(taskText.trim());
                      setTaskText("");
                    }} 
                    style={[styles.formSubmitBtn, { backgroundColor: "#0EA5E9" }]}
                  >
                    <Text style={styles.formSubmitText}>Añadir</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form to Add Event */}
              <View style={styles.actionCard}>
                <Text style={styles.actionCardTitle}>AGENDAR EVENTO NUEVO</Text>
                <TextInput
                  style={styles.quickInputFull}
                  placeholder="Título del evento..."
                  placeholderTextColor="#475569"
                  value={eventTitleText}
                  onChangeText={setEventTitleText}
                />
                <View style={styles.quickFormRow}>
                  <TextInput
                    style={[styles.quickInput, { flex: 2 }]}
                    placeholder="Fecha (YYYY-MM-DD)"
                    placeholderTextColor="#475569"
                    value={eventDateText}
                    onChangeText={setEventDateText}
                  />
                  <TextInput
                    style={[styles.quickInput, { flex: 1 }]}
                    placeholder="Hora"
                    placeholderTextColor="#475569"
                    value={eventTimeText}
                    onChangeText={setEventTimeText}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      if (!eventTitleText.trim()) return;
                      addEvent(eventTitleText.trim(), eventDateText.trim(), eventTimeText.trim());
                      setEventTitleText("");
                    }} 
                    style={[styles.formSubmitBtn, { backgroundColor: "#8B5CF6" }]}
                  >
                    <Text style={styles.formSubmitText}>Agendar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form to Add Alarm */}
              <View style={styles.actionCard}>
                <Text style={styles.actionCardTitle}>CREAR ALARMA</Text>
                <View style={styles.quickFormRow}>
                  <TextInput
                    style={[styles.quickInput, { flex: 2 }]}
                    placeholder="Etiqueta..."
                    placeholderTextColor="#475569"
                    value={alarmLabelText}
                    onChangeText={setAlarmLabelText}
                  />
                  <TextInput
                    style={[styles.quickInput, { flex: 1 }]}
                    placeholder="Hora (HH:MM)"
                    placeholderTextColor="#475569"
                    value={alarmTimeText}
                    onChangeText={setAlarmTimeText}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      if (!alarmTimeText.trim()) return;
                      addAlarm(alarmTimeText.trim(), alarmLabelText.trim());
                      jupyterVoice.scheduleAlarmNotification(alarmTimeText.trim(), alarmLabelText.trim());
                      setAlarmLabelText("Alarma");
                    }} 
                    style={[styles.formSubmitBtn, { backgroundColor: "#F59E0B" }]}
                  >
                    <Text style={styles.formSubmitText}>Programar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Active Items */}
              <View style={styles.listsBox}>
                <Text style={styles.listsBoxHeader}>TAREAS ({tasks.length})</Text>
                {tasks.map(t => (
                  <View key={t.id} style={styles.taskRow}>
                    <TouchableOpacity onPress={() => toggleTask(t.id)} style={styles.checkSquare}>
                      <Text style={styles.checkText}>{t.completed ? "✓" : ""}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.taskTextTitle, t.completed && { textDecorationLine: "line-through", color: "#64748B" }]}>{t.title}</Text>
                    <TouchableOpacity onPress={() => deleteTask(t.id)} style={styles.rowDeleteBtn}>
                      <Text style={styles.deleteEmoji}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case "automations":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>⚡ AI Automations (Constructor de Flujos)</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Configura disparadores en tiempo real (Ubicación, Hora, Sensor) que activen flujos automatizados procesados por Jupyter OS.
            </Text>

            <ScrollView contentContainerStyle={{ gap: 16 }}>
              {/* Visual Node editor representation */}
              <View style={styles.nodeEditorContainer}>
                <Text style={styles.nodeHeader}>CONSTRUCTOR VISUAL (Workflow)</Text>
                
                <View style={styles.workflowVisualRow}>
                  <View style={[styles.nodeCard, { borderColor: "#0EA5E9" }]}>
                    <Text style={styles.nodeType}>TRIGGER</Text>
                    <Text style={styles.nodeVal}>Ubicación: Oficina</Text>
                  </View>
                  <Text style={styles.nodeConnection}>────────▶</Text>
                  <View style={[styles.nodeCard, { borderColor: "#8B5CF6" }]}>
                    <Text style={styles.nodeType}>IA COGNITIVE DECISION</Text>
                    <Text style={styles.nodeVal}>¿Tengo reunión?</Text>
                  </View>
                  <Text style={styles.nodeConnection}>────────▶</Text>
                  <View style={[styles.nodeCard, { borderColor: "#F59E0B" }]}>
                    <Text style={styles.nodeType}>ACTION</Text>
                    <Text style={styles.nodeVal}>Abrir Maps + Silencio</Text>
                  </View>
                </View>
              </View>

              {/* Add automation Form */}
              <View style={styles.actionCard}>
                <Text style={styles.actionCardTitle}>AÑADIR RUTINA NUEVA</Text>
                <TextInput
                  style={styles.quickInputFull}
                  placeholder="Disparador (Ej: Cuando llegue a la universidad)"
                  placeholderTextColor="#475569"
                  value={newTrigger}
                  onChangeText={setNewTrigger}
                />
                <TextInput
                  style={styles.quickInputFull}
                  placeholder="Acción (Ej: Enviar reporte de proyecto por correo)"
                  placeholderTextColor="#475569"
                  value={newAction}
                  onChangeText={setNewAction}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (!newTrigger.trim() || !newAction.trim()) return;
                    setWorkflows([...workflows, { id: Math.random().toString(), trigger: newTrigger, action: newAction, enabled: true }]);
                    setNewTrigger("");
                    setNewAction("");
                  }}
                  style={[styles.submitBtn, { backgroundColor: "#8B5CF6" }]}
                >
                  <Text style={styles.submitBtnText}>REGISTRAR EN WORKFLOW ENGINE</Text>
                </TouchableOpacity>
              </View>

              {/* Automation List */}
              <View style={styles.listsBox}>
                <Text style={styles.listsBoxHeader}>RUTINAS ACTIVAS</Text>
                {workflows.map(w => (
                  <View key={w.id} style={styles.automationRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.automationTrigger}>Disparador: {w.trigger}</Text>
                      <Text style={styles.automationAction}>Acción: {w.action}</Text>
                    </View>
                    <Switch
                      value={w.enabled}
                      onValueChange={() => {
                        setWorkflows(prev => prev.map(item => item.id === w.id ? { ...item, enabled: !item.enabled } : item));
                      }}
                      trackColor={{ false: "#1E293B", true: "#8B5CF6" }}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case "memory":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>🧠 AI Memory (Recuerdos Activos)</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Jupyter procesa y consolida recuerdos semánticos en segundo plano basados en tus conversaciones y patrones cotidianos.
            </Text>

            <View style={styles.memoryForm}>
              <TextInput
                style={styles.quickInputFull}
                placeholder="Escribe algo que Jupyter deba recordar..."
                placeholderTextColor="#475569"
                value={newMemory}
                onChangeText={setNewMemory}
              />
              <TouchableOpacity
                onPress={() => {
                  if (!newMemory.trim()) return;
                  setMemories([...memories, { id: Math.random().toString(), content: newMemory.trim() }]);
                  setNewMemory("");
                }}
                style={[styles.submitBtn, { backgroundColor: "#0EA5E9" }]}
              >
                <Text style={styles.submitBtnText}>COMPROMETER A LA MEMORIA A LARGO PLAZO</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listsBox}>
              <Text style={styles.listsBoxHeader}>MEMORIAS SEMÁNTICAS ALMACENADAS</Text>
              {memories.map(m => (
                <View key={m.id} style={styles.memoryItem}>
                  <Text style={styles.memoryText}>• {m.content}</Text>
                  <TouchableOpacity
                    onPress={() => setMemories(prev => prev.filter(item => item.id !== m.id))}
                    style={styles.memoryDelete}
                  >
                    <Text style={styles.deleteEmoji}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        );

      case "agents":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>🤖 AI Agents (Agentes Especializados)</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Delega análisis específicos a sub-agentes inteligentes con prompts del sistema optimizados y herramientas personalizadas.
            </Text>

            <View style={styles.agentCardsGrid}>
              {[
                { id: "coder", name: "Jupyter Coder", desc: "Generación de código, refactorización y depuración.", avatar: "💻" },
                { id: "researcher", name: "Jupyter Scholar", desc: "Investigación web profunda, síntesis científica y patentes.", avatar: "📚" },
                { id: "finance", name: "Jupyter Finance", desc: "Monitoreo financiero, balances y tendencias cripto.", avatar: "📈" },
                { id: "health", name: "Jupyter Fit", desc: "Alineación de hábitos, rendimiento biológico y descanso.", avatar: "🩺" }
              ].map(agent => (
                <TouchableOpacity
                  key={agent.id}
                  onPress={() => setSelectedAgent(agent.id)}
                  style={[styles.agentSelectCard, selectedAgent === agent.id && styles.agentSelectCardActive]}
                >
                  <Text style={styles.agentSelectAvatar}>{agent.avatar}</Text>
                  <Text style={styles.agentSelectName}>{agent.name}</Text>
                  <Text style={styles.agentSelectDesc}>{agent.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.agentConsole}>
              <Text style={styles.agentConsoleHeader}>CONSOLA DE AGENTE: {selectedAgent.toUpperCase()}</Text>
              <Text style={styles.agentConsoleStatus}>ESTADO: LISTO // HERRAMIENTAS: BROWSER_SCRAPE, SHELL_EXEC</Text>
            </View>
          </View>
        );

      case "files":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>📁 AI Files & Document Analyzer</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Sube y procesa archivos locales (PDF, CSV o imágenes) para análisis cognitivo de texto mediante OCR.
            </Text>

            <View style={styles.filesGrid}>
              {[
                { name: "balance_trimestre.pdf", size: "1.2 MB", type: "pdf" },
                { name: "error_stacktrace.txt", size: "14 KB", type: "txt" },
                { name: "camera_snapshot.png", size: "840 KB", type: "image" }
              ].map((file, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleAnalyzeFile(file.name)}
                  style={[styles.fileCard, selectedFile === file.name && styles.fileCardActive]}
                >
                  <Text style={styles.fileIcon}>{file.type === "pdf" ? "📕" : file.type === "txt" ? "📄" : "🖼️"}</Text>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileSize}>{file.size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {analyzingFile && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.loadingText}>Procesando OCR del documento y computando embeddings...</Text>
              </View>
            )}

            {fileAnalysis && (
              <View style={styles.fileAnalysisCard}>
                <Text style={styles.analysisHeader}>EXTRACTO COGNITIVO:</Text>
                <Text style={styles.analysisBody}>{fileAnalysis}</Text>
              </View>
            )}
          </View>
        );

      case "screen":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>📸 AI Screen Analysis (Copiloto Visual)</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Captura y explica el contenido visual de tu pantalla actual, analizando jerarquía de interfaces o stacktraces de errores.
            </Text>

            <View style={styles.screenSimulatorFrame}>
              <View style={styles.mockStatusBar}>
                <Text style={styles.mockStatusText}>LTE // 12:00 AM</Text>
              </View>
              <View style={styles.mockScreenContent}>
                <Text style={styles.mockScreenTextHeader}>JUPYTER COGNITIVE PANEL</Text>
                <View style={styles.mockCard} />
                <View style={styles.mockCard} />
                {scanning && <View style={styles.scanningLine} />}
              </View>
            </View>

            <TouchableOpacity onPress={handleAnalyzeScreen} style={[styles.submitBtn, { backgroundColor: "#8B5CF6", marginTop: 12 }]}>
              <Text style={styles.submitBtnText}>CAPTURAR Y ANALIZAR PANTALLA</Text>
            </TouchableOpacity>

            {scanning && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.loadingText}>Escaneando interfaz con Vision-LLM...</Text>
              </View>
            )}

            {screenAnalysisResult && (
              <View style={styles.fileAnalysisCard}>
                <Text style={styles.analysisHeader}>ANÁLISIS COMPILADO:</Text>
                <Text style={styles.analysisBody}>{screenAnalysisResult}</Text>
              </View>
            )}
          </View>
        );

      case "coding":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>💻 AI Coding Hub (Desarrollo Integrado)</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Entorno para la generación rápida de componentes de código y depuración estructurada.
            </Text>

            <View style={styles.codingForm}>
              <TextInput
                style={styles.quickInputFull}
                placeholder="Describe qué componente UI deseas generar..."
                placeholderTextColor="#475569"
                value={codingPrompt}
                onChangeText={setCodingPrompt}
              />
              <TouchableOpacity onPress={handleGenerateCode} style={[styles.submitBtn, { backgroundColor: "#0EA5E9" }]}>
                <Text style={styles.submitBtnText}>GENERAR CÓDIGO REACT NATIVE</Text>
              </TouchableOpacity>
            </View>

            {coding && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0EA5E9" />
                <Text style={styles.loadingText}>Compilando código...</Text>
              </View>
            )}

            {generatedCode && (
              <View style={styles.codeViewerCard}>
                <Text style={styles.codeHeader}>JSX GENERADO:</Text>
                <ScrollView horizontal style={styles.codeScroll}>
                  <Text style={styles.codeBody}>{generatedCode}</Text>
                </ScrollView>
              </View>
            )}
          </View>
        );

      case "voice":
        return (
          <View style={styles.toolContainer}>
            <View style={styles.toolHeaderRow}>
              <Text style={styles.toolTitle}>🎙️ AI Voice Studio (Laboratorio Vocal)</Text>
              <TouchableOpacity onPress={() => setCurrentTool(null)} style={styles.backButton}>
                <Text style={styles.backText}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.toolDesc}>
              Ajusta la respuesta acústica del asistente en tiempo real y la configuración de escucha continua de Jupyter.
            </Text>

            <ScrollView contentContainerStyle={{ gap: 16 }}>
              {/* Sensibility sliders */}
              <View style={styles.actionCard}>
                <Text style={styles.actionCardTitle}>SENSIBILIDAD DEL MICRÓFONO</Text>
                <View style={styles.sliderMockRow}>
                  <View style={styles.sliderTrack}>
                    <View style={[styles.sliderFill, { width: `${micSensitivity * 100}%` }]} />
                  </View>
                  <Text style={styles.sliderValueText}>{(micSensitivity * 100).toFixed(0)}%</Text>
                </View>
                <View style={styles.btnRow}>
                  <TouchableOpacity onPress={() => setMicSensitivity(0.5)} style={styles.smallOptionBtn}><Text style={styles.optionText}>Baja</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setMicSensitivity(0.8)} style={styles.smallOptionBtn}><Text style={styles.optionText}>Media</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setMicSensitivity(1.0)} style={styles.smallOptionBtn}><Text style={styles.optionText}>Alta (Max)</Text></TouchableOpacity>
                </View>
              </View>

              {/* Wake Word settings */}
              <View style={styles.actionCard}>
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.actionCardTitle}>WAKE WORD ("JUPYTER")</Text>
                    <Text style={styles.optionSub}>Permite despertar al asistente conversacional hablando continuamente en segundo plano.</Text>
                  </View>
                  <Switch
                    value={wakeWordEnabled}
                    onValueChange={setWakeWordEnabled}
                    trackColor={{ false: "#1E293B", true: "#8B5CF6" }}
                  />
                </View>
              </View>

              {/* Voice selector */}
              <View style={styles.actionCard}>
                <Text style={styles.actionCardTitle}>VOZ TTS DEL SISTEMA</Text>
                {availableVoices.length === 0 ? (
                  <Text style={styles.emptyText}>No se detectaron voces de síntesis de voz en español instaladas.</Text>
                ) : (
                  <View style={{ gap: 8, marginTop: 8 }}>
                    {availableVoices.slice(0, 4).map((item) => {
                      const isSelected = selectedVoice === item.identifier;
                      return (
                        <TouchableOpacity
                          key={item.identifier}
                          onPress={() => setSelectedVoice(item.identifier)}
                          style={[styles.voiceOptionBtn, isSelected && styles.voiceOptionActive]}
                        >
                          <Text style={styles.voiceOptionText}>{item.name} ({item.language})</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        );

      default:
        // Render consolidated dashboard view (Widget Grid)
        return (
          <View style={styles.dashboardContainer}>
            {/* Upper Widgets */}
            <View style={styles.upperWidgetsGrid}>
              <View style={styles.smallWidgetCard}>
                <Text style={styles.widgetHeader}>MÉTRICA COGNITIVA</Text>
                <Text style={styles.widgetBigText}>98.4%</Text>
                <Text style={styles.widgetSub}>OPTIMIZACIÓN DEL ORBE</Text>
              </View>

              <View style={styles.smallWidgetCard}>
                <Text style={styles.widgetHeader}>TAREAS DE HOY</Text>
                <Text style={styles.widgetBigText}>{tasks.filter(t => !t.completed).length}</Text>
                <Text style={styles.widgetSub}>PENDIENTES EN COGNITION</Text>
              </View>

              <View style={styles.smallWidgetCard}>
                <Text style={styles.widgetHeader}>LATENCIA</Text>
                <Text style={styles.widgetBigText}>0.04s</Text>
                <Text style={styles.widgetSub}>RESPUESTA CON GROQ</Text>
              </View>
            </View>

            {/* Main Interactive Grid of 10 Modules */}
            <Text style={styles.gridSectionHeader}>HERRAMIENTAS OPERACIONALES</Text>
            <View style={styles.toolsGrid}>
              <TouchableOpacity onPress={() => setCurrentTool("chat")} style={[styles.gridCard, { shadowColor: "#6366F1" }]}>
                <Text style={styles.gridCardIcon}>💬</Text>
                <Text style={styles.gridCardTitle}>AI Chat</Text>
                <Text style={styles.gridCardDesc}>Conversación inteligente multihilo.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("search")} style={[styles.gridCard, { shadowColor: "#38BDF8" }]}>
                <Text style={styles.gridCardIcon}>🔍</Text>
                <Text style={styles.gridCardTitle}>AI Search</Text>
                <Text style={styles.gridCardDesc}>Deep research web en tiempo real.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("productivity")} style={[styles.gridCard, { shadowColor: "#A78BFA" }]}>
                <Text style={styles.gridCardIcon}>📆</Text>
                <Text style={styles.gridCardTitle}>Productivity</Text>
                <Text style={styles.gridCardDesc}>Calendario, tareas y alarmas.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("automations")} style={[styles.gridCard, { shadowColor: "#F59E0B" }]}>
                <Text style={styles.gridCardIcon}>⚡</Text>
                <Text style={styles.gridCardTitle}>Automation</Text>
                <Text style={styles.gridCardDesc}>Flujos lógicos n8n/Zapier.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("memory")} style={[styles.gridCard, { shadowColor: "#EC4899" }]}>
                <Text style={styles.gridCardIcon}>🧠</Text>
                <Text style={styles.gridCardTitle}>Memory</Text>
                <Text style={styles.gridCardDesc}>Ver y depurar recuerdos de la IA.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("agents")} style={[styles.gridCard, { shadowColor: "#10B981" }]}>
                <Text style={styles.gridCardIcon}>🤖</Text>
                <Text style={styles.gridCardTitle}>Agentes</Text>
                <Text style={styles.gridCardDesc}>Equipos de agentes optimizados.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("files")} style={[styles.gridCard, { shadowColor: "#6EE7B7" }]}>
                <Text style={styles.gridCardIcon}>📁</Text>
                <Text style={styles.gridCardTitle}>AI Files</Text>
                <Text style={styles.gridCardDesc}>Análisis OCR de PDFs e imágenes.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("screen")} style={[styles.gridCard, { shadowColor: "#F472B6" }]}>
                <Text style={styles.gridCardIcon}>📸</Text>
                <Text style={styles.gridCardTitle}>Screen Analysis</Text>
                <Text style={styles.gridCardDesc}>Lectura de interfaces móviles.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("coding")} style={[styles.gridCard, { shadowColor: "#60A5FA" }]}>
                <Text style={styles.gridCardIcon}>💻</Text>
                <Text style={styles.gridCardTitle}>Coding Hub</Text>
                <Text style={styles.gridCardDesc}>Desarrollo y snippets UX neón.</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentTool("voice")} style={[styles.gridCard, { shadowColor: "#FB7185" }]}>
                <Text style={styles.gridCardIcon}>🎙️</Text>
                <Text style={styles.gridCardTitle}>Voice Studio</Text>
                <Text style={styles.gridCardDesc}>Voces, micrófono y wake-word.</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.telemetryTitle}>JUPYTER.OS v2.0 // COGNITIVE CORE</Text>
          <Text style={styles.title}>Jupyter Explore</Text>
          <Text style={styles.subtitle}>
            Accede al hub de copiloto modular y herramientas cognitivas avanzados con interfaz translúcida premium.
          </Text>
        </View>

        <ScrollView 
          style={styles.mainScrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {renderToolContent()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(59, 130, 246, 0.1)",
  },
  telemetryTitle: {
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 2,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 16,
    fontWeight: "300",
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // TOOL GENERAL STYLES
  toolContainer: {
    gap: 16,
    animationDuration: "200ms",
  },
  toolHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(59, 130, 246, 0.1)",
    paddingBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  toolDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  backText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "600",
  },

  // CHAT STYLE
  chatSplitScreen: {
    flexDirection: "row",
    height: 380,
    gap: 10,
  },
  chatSidebar: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    gap: 8,
  },
  sidebarHeader: {
    fontSize: 9,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    fontWeight: "bold",
    marginBottom: 4,
  },
  threadItem: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  threadItemActive: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 1,
  },
  threadText: {
    color: COLORS.text,
    fontSize: 11,
  },
  newChatBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    alignItems: "center",
    marginTop: "auto",
  },
  newChatText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  chatMain: {
    flex: 2.2,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    justifyContent: "space-between",
  },
  chatMsgBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: "85%",
    marginVertical: 2,
  },
  msgUser: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  msgAssistant: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: {
    color: COLORS.text,
    fontSize: 12,
  },
  chatInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  chatSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cyan,
    justifyContent: "center",
    alignItems: "center",
  },
  chatSendText: {
    fontSize: 12,
  },

  // SEARCH STYLES
  searchBarRow: {
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 13,
  },
  searchButton: {
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.cyan,
    justifyContent: "center",
  },
  searchButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "700",
  },
  searchResultsContainer: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    maxHeight: 250,
  },
  searchSummaryTitle: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.cyan,
    fontWeight: "700",
    marginBottom: 6,
  },
  searchSummaryText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
  sourcesHeader: {
    fontSize: 9,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "700",
  },
  sourceCard: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    marginVertical: 3,
  },
  sourceName: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  sourceUrl: {
    color: COLORS.cyan,
    fontSize: 9,
    marginTop: 1,
  },

  // PRODUCTIVITY HUB
  aiSuggestionBox: {
    flexDirection: "row",
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  aiSuggestionIcon: {
    fontSize: 22,
  },
  aiSuggestionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 16,
  },
  actionCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  actionCardTitle: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  quickFormRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  quickInputFull: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 8,
  },
  formSubmitBtn: {
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  formSubmitText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "700",
  },
  listsBox: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  listsBoxHeader: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "bold",
  },
  taskTextTitle: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
  },
  rowDeleteBtn: {
    padding: 4,
  },
  deleteEmoji: {
    fontSize: 11,
  },

  // AUTOMATIONS GRAPHIC REPRESENTATION
  nodeEditorContainer: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  nodeHeader: {
    fontSize: 9,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  workflowVisualRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nodeCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
  },
  nodeType: {
    fontSize: 7,
    fontFamily: "monospace",
    color: COLORS.textMuted,
  },
  nodeVal: {
    fontSize: 9,
    color: COLORS.text,
    fontWeight: "bold",
    marginTop: 2,
  },
  nodeConnection: {
    fontSize: 10,
    color: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  automationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  automationTrigger: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: "600",
  },
  automationAction: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // MEMORY
  memoryForm: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  memoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memoryText: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  memoryDelete: {
    padding: 6,
  },

  // AGENTS SELECTOR
  agentCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  agentSelectCard: {
    width: "48%",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  agentSelectCardActive: {
    borderColor: COLORS.green,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  agentSelectAvatar: {
    fontSize: 22,
  },
  agentSelectName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 6,
  },
  agentSelectDesc: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 12,
  },
  agentConsole: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  agentConsoleHeader: {
    fontSize: 9,
    fontFamily: "monospace",
    color: COLORS.green,
  },
  agentConsoleStatus: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: "monospace",
    marginTop: 6,
  },

  // FILES SELECTOR
  filesGrid: {
    flexDirection: "row",
    gap: 8,
  },
  fileCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
  },
  fileCardActive: {
    borderColor: COLORS.purple,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  fileIcon: {
    fontSize: 24,
  },
  fileName: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 6,
    textAlign: "center",
  },
  fileSize: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  fileAnalysisCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  analysisHeader: {
    fontSize: 9,
    fontFamily: "monospace",
    color: COLORS.purple,
    marginBottom: 8,
  },
  analysisBody: {
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 16,
  },

  // SCREEN SIMULATOR
  screenSimulatorFrame: {
    height: 180,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
  },
  mockStatusBar: {
    height: 20,
    width: "100%",
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
  },
  mockStatusText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: "monospace",
  },
  mockScreenContent: {
    flex: 1,
    width: "100%",
    padding: 14,
    gap: 10,
    position: "relative",
  },
  mockScreenTextHeader: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "bold",
    textAlign: "center",
  },
  mockCard: {
    height: 36,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
  },
  scanningLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.purple,
    shadowColor: COLORS.purple,
    shadowRadius: 10,
    elevation: 8,
  },

  // CODING HUB
  codingForm: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  codeViewerCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  codeHeader: {
    fontSize: 9,
    fontFamily: "monospace",
    color: COLORS.cyan,
    marginBottom: 6,
  },
  codeScroll: {
    maxHeight: 180,
  },
  codeBody: {
    fontFamily: "monospace",
    fontSize: 10,
    color: COLORS.text,
  },

  // VOICE STUDIO
  sliderMockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 6,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.cardBg,
    borderRadius: 3,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: COLORS.purple,
  },
  sliderValueText: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  btnRow: {
    flexDirection: "row",
    gap: 6,
  },
  smallOptionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  optionText: {
    color: COLORS.text,
    fontSize: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    maxWidth: "80%",
  },
  voiceOptionBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  voiceOptionActive: {
    borderColor: COLORS.purple,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  voiceOptionText: {
    color: COLORS.text,
    fontSize: 11,
  },

  // SUBMIT GENERAL
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // DASHBOARD LANDING VIEWS
  dashboardContainer: {
    gap: 20,
  },
  upperWidgetsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  smallWidgetCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  widgetHeader: {
    fontSize: 8,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    fontWeight: "bold",
  },
  widgetBigText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    marginVertical: 4,
  },
  widgetSub: {
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  gridSectionHeader: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: -4,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridCard: {
    width: "48%",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  gridCardIcon: {
    fontSize: 24,
  },
  gridCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 8,
  },
  gridCardDesc: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: 16,
    fontStyle: "italic",
  },
});
