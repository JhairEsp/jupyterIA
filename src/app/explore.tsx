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
  ActivityIndicator,
  FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVoiceStore } from "../store/voiceStore";
import { jupyterVoice } from "../services/VoiceAssistantService";
import { COLORS } from "../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// MODERN TAB NAVIGATION COMPONENT
// ============================================================================
const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "tools", label: "Herramientas", icon: "🛠️" },
    { id: "automations", label: "Automatizaciones", icon: "⚙️" },
    { id: "settings", label: "Configuración", icon: "⚙️" },
  ];

  return (
    <View style={styles.tabNavigation}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.tabButtonActive
          ]}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.tabLabelActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================================
// MODERN TOOL CARD COMPONENT
// ============================================================================
const ToolCard = ({ icon, title, description, onPress, isActive }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.toolCardBase, isActive && styles.toolCardActive]}
  >
    <View style={styles.toolCardContent}>
      <Text style={styles.toolCardIcon}>{icon}</Text>
      <Text style={styles.toolCardTitle}>{title}</Text>
      <Text style={styles.toolCardDesc}>{description}</Text>
    </View>
    <View style={styles.toolCardArrow}>
      <Text style={styles.arrowText}>→</Text>
    </View>
  </TouchableOpacity>
);

// ============================================================================
// DASHBOARD VIEW
// ============================================================================
const DashboardView = ({ onSelectTool }) => {
  const tools = [
    { id: "chat", icon: "💬", title: "Chat IA", description: "Conversación inteligente con Jupyter" },
    { id: "search", icon: "🔍", title: "Búsqueda", description: "Búsqueda profunda con IA" },
    { id: "code", icon: "💻", title: "Code Studio", description: "Generación de código" },
    { id: "screen", icon: "📱", title: "Screen Analysis", description: "Análisis de pantalla" },
    { id: "voice", icon: "🎙️", title: "Voice Studio", description: "Personalización de voz" },
    { id: "memory", icon: "🧠", title: "Memory", description: "Gestiona tu perfil" },
  ];

  return (
    <ScrollView style={styles.dashboardView} showsVerticalScrollIndicator={false}>
      {/* HERO SECTION */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Jupyter IA</Text>
        <Text style={styles.heroSubtitle}>Tu asistente inteligente de voz</Text>
      </View>

      {/* QUICK STATS */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Conversaciones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Automatizaciones</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>48h</Text>
          <Text style={styles.statLabel}>Tiempo ahorrado</Text>
        </View>
      </View>

      {/* TOOLS GRID */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Herramientas principales</Text>
        <View style={styles.toolsGridLayout}>
          {tools.map((tool) => (
            <View key={tool.id} style={{ width: "48%" }}>
              <ToolCard
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                onPress={() => onSelectTool(tool.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* RECENT ACTIVITY */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>Chat sobre estructura de proyecto</Text>
              <Text style={styles.activityTime}>Hace 2 horas</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>Generó 3 snippets de código</Text>
              <Text style={styles.activityTime}>Hace 5 horas</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>Ejecutó análisis de pantalla</Text>
              <Text style={styles.activityTime}>Ayer</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// TOOLS VIEW - CHAT
// ============================================================================
const ChatToolView = ({ chatThreads, activeThread, setActiveThread, chatInput, setChatInput, handleSendChatMessage }) => {
  const currentThread = chatThreads.find(t => t.id === activeThread);

  return (
    <View style={styles.toolView}>
      {/* SIDEBAR - THREAD LIST */}
      <View style={styles.chatSidebar}>
        <Text style={styles.sidebarHeader}>HILOS</Text>
        {chatThreads.map((thread) => (
          <TouchableOpacity
            key={thread.id}
            onPress={() => setActiveThread(thread.id)}
            style={[
              styles.threadItem,
              activeThread === thread.id && styles.threadItemActive
            ]}
          >
            <Text style={styles.threadText} numberOfLines={1}>
              {thread.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MAIN CHAT AREA */}
      <View style={styles.chatMain}>
        <ScrollView style={styles.messagesList}>
          {currentThread?.messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.messageBubble,
                msg.role === "user" ? styles.msgUser : styles.msgAssistant
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))}
        </ScrollView>

        {/* INPUT ROW */}
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor={COLORS.textMuted}
            value={chatInput}
            onChangeText={setChatInput}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendChatMessage}
            style={styles.chatSendBtn}
          >
            <Text style={styles.chatSendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// TOOLS VIEW - SEARCH
// ============================================================================
const SearchToolView = ({ searchQuery, setSearchQuery, handleAISearch, searchResults, searching }) => {
  return (
    <ScrollView style={styles.toolView} showsVerticalScrollIndicator={false}>
      {/* SEARCH INPUT */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Busca cualquier cosa con IA..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={handleAISearch}
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RESULTS */}
      {searching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.cyan} size="large" />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      )}

      {searchResults && !searching && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultSummaryTitle}>RESUMEN</Text>
          <Text style={styles.resultSummaryText}>{searchResults.summary}</Text>

          <Text style={styles.sourcesHeader}>FUENTES</Text>
          {searchResults.sources.map((source) => (
            <View key={source.id} style={styles.sourceCard}>
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceUrl}>{source.url}</Text>
            </View>
          ))}
        </View>
      )}

      {!searchResults && !searching && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateText}>Realiza una búsqueda para ver resultados</Text>
        </View>
      )}
    </ScrollView>
  );
};

// ============================================================================
// TOOLS VIEW - CODE STUDIO
// ============================================================================
const CodeToolView = ({ selectedAgent, setSelectedAgent, codingPrompt, setCodingPrompt, generatedCode, coding, onGenerateCode }) => {
  const agents = [
    { id: "coder", label: "Coder", icon: "👨‍💻" },
    { id: "reviewer", label: "Reviewer", icon: "👀" },
    { id: "architect", label: "Architect", icon: "🏗️" },
  ];

  return (
    <ScrollView style={styles.toolView} showsVerticalScrollIndicator={false}>
      {/* AGENT SELECTOR */}
      <View style={styles.agentSection}>
        <Text style={styles.sectionTitle}>Selecciona un agente</Text>
        <View style={styles.agentGrid}>
          {agents.map((agent) => (
            <TouchableOpacity
              key={agent.id}
              onPress={() => setSelectedAgent(agent.id)}
              style={[
                styles.agentCard,
                selectedAgent === agent.id && styles.agentCardActive
              ]}
            >
              <Text style={styles.agentIcon}>{agent.icon}</Text>
              <Text style={styles.agentLabel}>{agent.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* INPUT SECTION */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tu solicitud</Text>
        <TextInput
          style={styles.codePromptInput}
          placeholder="Describe lo que necesitas..."
          placeholderTextColor={COLORS.textMuted}
          value={codingPrompt}
          onChangeText={setCodingPrompt}
          multiline
        />
        <TouchableOpacity
          onPress={onGenerateCode}
          style={[styles.generateBtn, coding && styles.generateBtnDisabled]}
          disabled={coding}
        >
          {coding ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.generateBtnText}>Generar Código</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* OUTPUT SECTION */}
      {generatedCode && (
        <View style={styles.codeOutputSection}>
          <Text style={styles.sectionTitle}>Código generado</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{generatedCode}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// ============================================================================
// TOOLS VIEW - VOICE STUDIO
// ============================================================================
const VoiceToolView = ({ wakeWordEnabled, setWakeWordEnabled, micSensitivity, setMicSensitivity, availableVoices, selectedVoice, setSelectedVoice }) => {
  return (
    <ScrollView style={styles.toolView} showsVerticalScrollIndicator={false}>
      {/* VOICE SELECTION */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Selecciona una voz</Text>
        {availableVoices.map((voice) => (
          <TouchableOpacity
            key={voice.id}
            onPress={() => setSelectedVoice(voice.id)}
            style={[
              styles.voiceOption,
              selectedVoice === voice.id && styles.voiceOptionActive
            ]}
          >
            <View>
              <Text style={styles.voiceOptionName}>{voice.name}</Text>
              <Text style={styles.voiceOptionLang}>{voice.language}</Text>
            </View>
            {selectedVoice === voice.id && (
              <Text style={styles.voiceCheckmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* SETTINGS */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Configuración</Text>

        {/* WAKE WORD */}
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Palabra de activación</Text>
            <Text style={styles.settingDesc}>Habilita "Jupyter" para activar</Text>
          </View>
          <Switch
            value={wakeWordEnabled}
            onValueChange={setWakeWordEnabled}
            trackColor={{ false: COLORS.border, true: "rgba(59, 130, 246, 0.3)" }}
            thumbColor={wakeWordEnabled ? COLORS.cyan : COLORS.textMuted}
          />
        </View>

        {/* MIC SENSITIVITY */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sensibilidad del micrófono</Text>
          <Text style={styles.sensitivityValue}>{Math.round(micSensitivity * 100)}%</Text>
        </View>
        <View style={styles.sliderContainer}>
          <View style={[styles.sliderTrack, { width: `${micSensitivity * 100}%` }]} />
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// SETTINGS VIEW
// ============================================================================
const SettingsView = () => {
  return (
    <ScrollView style={styles.toolView} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Tema oscuro</Text>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: COLORS.border, true: "rgba(59, 130, 246, 0.3)" }}
            thumbColor={COLORS.cyan}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notificaciones</Text>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: COLORS.border, true: "rgba(59, 130, 246, 0.3)" }}
            thumbColor={COLORS.cyan}
          />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Información</Text>
        <Text style={styles.infoText}>Versión: 2.0.0</Text>
        <Text style={styles.infoText}>Última actualización: 30 mayo 2026</Text>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// MAIN EXPLORE SCREEN
// ============================================================================
export default function ExploreScreen() {
  const { 
    availableVoices, selectedVoice, setSelectedVoice
  } = useVoiceStore();

  // TAB MANAGEMENT
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  // CHAT STATES
  const [chatThreads, setChatThreads] = useState<any[]>([
    { id: "1", title: "Proyecto Jupyter", messages: [{ role: "assistant", content: "Sistemas iniciados. ¿Qué trabajamos hoy?" }] },
    { id: "2", title: "Ideas", messages: [] },
  ]);
  const [activeThread, setActiveThread] = useState("1");
  const [chatInput, setChatInput] = useState("");

  // SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // CODE STUDIO STATES
  const [selectedAgent, setSelectedAgent] = useState("coder");
  const [codingPrompt, setCodingPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [coding, setCoding] = useState(false);

  // VOICE SETTINGS
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [micSensitivity, setMicSensitivity] = useState(0.8);

  // HANDLERS
  const handleSelectTool = (toolId: string) => {
    setCurrentTool(toolId);
    setActiveTab("tools");
  };

  const handleAISearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults(null);
    setTimeout(() => {
      setSearching(false);
      setSearchResults({
        summary: `Resultados sobre "${searchQuery}":\n\nSe han consolidado múltiples fuentes. La información disponible sugiere tendencias interesantes en el área de búsqueda.`,
        sources: [
          { id: 1, name: "Fuente principal", url: "https://example.com" },
          { id: 2, name: "Fuente secundaria", url: "https://example.com" },
        ]
      });
    }, 2000);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const msgText = chatInput;
    setChatInput("");
    
    setChatThreads(prev => prev.map(t => {
      if (t.id === activeThread) {
        return {
          ...t,
          messages: [
            ...t.messages,
            { role: "user", content: msgText },
            { role: "assistant", content: "Procesando respuesta..." }
          ]
        };
      }
      return t;
    }));

    try {
      const response = await jupyterVoice.queryGroqLLM(msgText, []);
      setChatThreads(prev => prev.map(t => {
        if (t.id === activeThread) {
          return {
            ...t,
            messages: t.messages.map((m, idx) => 
              idx === t.messages.length - 1 
                ? { role: "assistant", content: response }
                : m
            )
          };
        }
        return t;
      }));
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  const handleGenerateCode = () => {
    if (!codingPrompt.trim()) return;
    setCoding(true);
    setTimeout(() => {
      setCoding(false);
      setGeneratedCode(`// ${selectedAgent.toUpperCase()}\n\nconst example = () => {\n  // Código generado por el agente ${selectedAgent}\n  console.log("Hola desde Jupyter");\n};`);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jupyter</Text>
      </View>

      {/* TAB NAVIGATION */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* CONTENT */}
      {activeTab === "dashboard" && <DashboardView onSelectTool={handleSelectTool} />}
      
      {activeTab === "tools" && currentTool === "chat" && (
        <ChatToolView
          chatThreads={chatThreads}
          activeThread={activeThread}
          setActiveThread={setActiveThread}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleSendChatMessage={handleSendChatMessage}
        />
      )}

      {activeTab === "tools" && currentTool === "search" && (
        <SearchToolView
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleAISearch={handleAISearch}
          searchResults={searchResults}
          searching={searching}
        />
      )}

      {activeTab === "tools" && currentTool === "code" && (
        <CodeToolView
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          codingPrompt={codingPrompt}
          setCodingPrompt={setCodingPrompt}
          generatedCode={generatedCode}
          coding={coding}
          onGenerateCode={handleGenerateCode}
        />
      )}

      {activeTab === "tools" && currentTool === "voice" && (
        <VoiceToolView
          wakeWordEnabled={wakeWordEnabled}
          setWakeWordEnabled={setWakeWordEnabled}
          micSensitivity={micSensitivity}
          setMicSensitivity={setMicSensitivity}
          availableVoices={availableVoices}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
        />
      )}

      {activeTab === "automations" && (
        <View style={styles.toolView}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Automatizaciones</Text>
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>⚙️</Text>
              <Text style={styles.emptyStateText}>Sección en desarrollo</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === "settings" && <SettingsView />}
    </SafeAreaView>
  );
}

// ============================================================================
// MODERN STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  // GENERAL
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.cyan,
  },

  // TAB NAVIGATION
  tabNavigation: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.cyan,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: COLORS.cyan,
    fontWeight: "700",
  },

  // DASHBOARD VIEW
  dashboardView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroSection: {
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // STATS
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.cyan,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: "center",
  },

  // SECTION
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // TOOLS GRID
  toolsGridLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  toolCardBase: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolCardActive: {
    borderColor: COLORS.cyan,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  toolCardContent: {
    flex: 1,
  },
  toolCardIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  toolCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  toolCardDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  toolCardArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 16,
    color: COLORS.cyan,
  },

  // ACTIVITY
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
    marginTop: 6,
  },
  activityText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // TOOL VIEW
  toolView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // CHAT
  chatSidebar: {
    flex: 0.4,
    backgroundColor: COLORS.cardBg,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  sidebarHeader: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    fontWeight: "700",
    marginBottom: 8,
  },
  threadItem: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    marginBottom: 6,
  },
  threadItemActive: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
  },
  threadText: {
    fontSize: 12,
    color: COLORS.text,
  },

  chatMain: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "column",
    overflow: "hidden",
  },
  messagesList: {
    flex: 1,
    padding: 12,
  },
  messageBubble: {
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: "80%",
  },
  msgUser: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  msgAssistant: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.background,
  },
  messageText: {
    fontSize: 12,
    color: COLORS.text,
  },

  chatInputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "flex-end",
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    maxHeight: 100,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cyan,
    justifyContent: "center",
    alignItems: "center",
  },
  chatSendIcon: {
    fontSize: 18,
    color: COLORS.background,
  },

  // SEARCH
  searchSection: {
    marginVertical: 16,
  },
  searchInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
  },
  searchButton: {
    width: 44,
    borderRadius: 12,
    backgroundColor: COLORS.cyan,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 18,
  },

  resultsContainer: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  resultSummaryTitle: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.cyan,
    fontWeight: "700",
    marginBottom: 8,
  },
  resultSummaryText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 16,
  },
  sourcesHeader: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    fontWeight: "700",
    marginBottom: 8,
  },
  sourceCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  sourceName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "500",
  },
  sourceUrl: {
    fontSize: 10,
    color: COLORS.cyan,
    marginTop: 4,
  },

  // CODE STUDIO
  agentSection: {
    marginVertical: 16,
  },
  agentGrid: {
    flexDirection: "row",
    gap: 10,
  },
  agentCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  agentCardActive: {
    borderColor: COLORS.green,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  agentIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  agentLabel: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: "600",
  },

  codePromptInput: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    minHeight: 80,
    marginBottom: 12,
  },

  generateBtn: {
    backgroundColor: COLORS.cyan,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "700",
  },

  codeOutputSection: {
    marginTop: 20,
  },
  codeBlock: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: COLORS.green,
  },

  // VOICE STUDIO
  voiceOption: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  voiceOptionActive: {
    borderColor: COLORS.cyan,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  voiceOptionName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  voiceOptionLang: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  voiceCheckmark: {
    fontSize: 16,
    color: COLORS.green,
  },

  // SETTINGS
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sensitivityValue: {
    fontSize: 12,
    color: COLORS.cyan,
    fontWeight: "700",
  },
  sliderContainer: {
    height: 6,
    backgroundColor: COLORS.cardBg,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 12,
  },
  sliderTrack: {
    height: "100%",
    backgroundColor: COLORS.cyan,
    borderRadius: 3,
  },

  infoText: {
    fontSize: 12,
    color: COLORS.textMuted,
    paddingVertical: 8,
  },

  // LOADING & EMPTY STATES
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },

  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyStateIcon: {
    fontSize: 48,
  },
  emptyStateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});
