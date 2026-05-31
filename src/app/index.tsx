import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { useVoiceStore } from "../store/voiceStore";
import { AudioWaveform } from "../components/AudioWaveform";
import { FloatingContainer } from "../components/FloatingContainer";
import { VoiceStateIndicator } from "../components/VoiceStateIndicator";
import { jupyterVoice } from "../services/VoiceAssistantService";
import { COLORS } from "../theme/colors";
import { ModernCard } from "../components/modern/ModernCard";
import { ModernButton } from "../components/modern/ModernButton";
import { GlassInput } from "../components/modern/GlassInput";
import { GeminiOrb } from "../components/modern/GeminiOrb";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeScreen() {
  const {
    currentState,
    isMinimized,
    setMinimized,
    setVoiceState,
    chatMessages,
    addChatMessage,
    selectedVoice,
    setSelectedVoice,
    availableVoices,
  } = useVoiceStore();

  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatMode) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isChatMode]);

  const handleStartListening = async () => {
    try {
      setVoiceState("escuchando");
      const isListening = await jupyterVoice.startListening();
      if (!isListening) {
        setVoiceState("background");
      }
    } catch (error) {
      console.error("[HomeScreen] Error starting voice:", error);
      setVoiceState("error");
    }
  };

  const handleStopListening = async () => {
    try {
      setVoiceState("background");
      await jupyterVoice.stopListening();
    } catch (error) {
      console.error("[HomeScreen] Error stopping voice:", error);
      setVoiceState("error");
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    addChatMessage("user", userMessage);

    try {
      setVoiceState("pensando");
      // Simulate AI response
      setTimeout(() => {
        addChatMessage("assistant", `Entiendo tu mensaje: "${userMessage}"`);
        setVoiceState("background");
      }, 1000);
    } catch (error) {
      console.error("[HomeScreen] Chat error:", error);
      setVoiceState("error");
    }
  };

  const getCoreGlowColor = () => {
    switch (currentState) {
      case "escuchando":
        return COLORS.primary;
      case "pensando":
        return COLORS.purple;
      case "hablando":
        return COLORS.primary;
      case "accion":
      case "ejecutando":
        return COLORS.accent;
      case "investigando":
        return COLORS.secondary;
      case "analizando":
        return COLORS.primary;
      case "background":
        return COLORS.blue;
      case "offline":
        return COLORS.textMuted;
      case "error":
        return COLORS.red;
      default:
        return COLORS.blue;
    }
  };

  if (isMinimized) {
    return (
      <View style={styles.minimizedContainer}>
        <TouchableOpacity
          style={[styles.minimizedBall, { backgroundColor: getCoreGlowColor() }]}
          onPress={() => setMinimized(false)}
          activeOpacity={0.8}
        >
          <VoiceStateIndicator state={currentState} />
        </TouchableOpacity>
      </View>
    );
  }

  // Chat Mode UI
  if (isChatMode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => setIsChatMode(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.chatHeaderBack}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>Chat con IA</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatMessages}
          contentContainerStyle={styles.chatContent}
        >
          {chatMessages.length === 0 ? (
            <View style={styles.chatEmpty}>
              <Text style={styles.chatEmptyText}>
                Inicia una conversación
              </Text>
            </View>
          ) : (
            chatMessages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.sender === "user" && styles.userBubble,
                  msg.sender === "assistant" && styles.assistantBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.message}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <GlassInput
            placeholder="Escribe tu mensaje..."
            value={chatInput}
            onChangeText={setChatInput}
            style={{ flex: 1 }}
          />
          <ModernButton
            title="Enviar"
            onPress={handleSendChat}
            size="small"
            style={{ marginLeft: 8 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Main Voice Mode UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, Asistente</Text>
          <Text style={styles.subtitle}>¿En qué puedo ayudarte?</Text>
        </View>

        {/* Main Orb - Gemini Style */}
        <View style={styles.orbContainer}>
          <GeminiOrb 
            isActive={currentState === "escuchando"} 
            color={getCoreGlowColor()}
            size="large"
          />
          <View style={styles.stateIndicator}>
            <VoiceStateIndicator state={currentState} size="large" />
          </View>
          {currentState === "escuchando" && (
            <AudioWaveform isActive={true} />
          )}
        </View>

        {/* Quick Info Cards */}
        <View style={styles.infoGrid}>
          <ModernCard glassy elevated style={styles.infoCard}>
            <Text style={styles.infoLabel}>Estado</Text>
            <Text style={styles.infoValue}>{currentState}</Text>
          </ModernCard>
          <ModernCard glassy elevated style={styles.infoCard}>
            <Text style={styles.infoLabel}>Voz</Text>
            <Text style={styles.infoValue}>
              {selectedVoice?.name || "Sistema"}
            </Text>
          </ModernCard>
        </View>

        {/* Upcoming Calendar */}
        <ModernCard glassy elevated style={styles.calendarCard}>
          <Text style={styles.cardTitle}>Próximos Eventos</Text>
          <View style={styles.eventPlaceholder}>
            <Text style={styles.eventPlaceholderText}>
              Conecta tu Google Calendar
            </Text>
          </View>
        </ModernCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>🎤</Text>
            <Text style={styles.actionLabel}>Grabar Nota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Crear Evento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={styles.actionLabel}>Nueva Tarea</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Configurar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Main Control Dock */}
      <View style={styles.dock}>
        {/* Voice Toggle Button */}
        <ModernButton
          title={currentState === "escuchando" ? "Detener" : "Escuchar"}
          onPress={
            currentState === "escuchando"
              ? handleStopListening
              : handleStartListening
          }
          variant={currentState === "escuchando" ? "secondary" : "primary"}
          size="large"
          style={{ flex: 1 }}
        />

        {/* Chat Toggle Button */}
        <ModernButton
          title="Chat"
          onPress={() => setIsChatMode(true)}
          variant="outline"
          size="large"
          style={{ flex: 1, marginHorizontal: 8 }}
        />

        {/* Voice Selection Button */}
        <ModernButton
          title="🎵"
          onPress={() => setShowVoiceModal(true)}
          variant="ghost"
          size="large"
          style={{ flex: 0.8 }}
        />

        {/* Minimize Button */}
        <ModernButton
          title="−"
          onPress={() => setMinimized(true)}
          variant="ghost"
          size="large"
          style={{ flex: 0.8 }}
        />
      </View>

      {/* Voice Selection Modal */}
      <Modal visible={showVoiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una voz</Text>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableVoices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.voiceItem,
                    selectedVoice?.id === item.id && styles.voiceItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedVoice(item);
                    setShowVoiceModal(false);
                  }}
                >
                  <View>
                    <Text style={styles.voiceName}>{item.name}</Text>
                    <Text style={styles.voiceLang}>{item.language}</Text>
                  </View>
                  {selectedVoice?.id === item.id && (
                    <Text style={styles.voiceCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // Orb Container
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
    paddingVertical: 20,
  },
  stateIndicator: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: 8,
    textTransform: "capitalize",
  },

  // Calendar Card
  calendarCard: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  eventPlaceholder: {
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: "dashed",
  },
  eventPlaceholderText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },

  // Dock
  dock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },

  // Chat Mode
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatHeaderBack: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingVertical: 16,
    gap: 8,
  },
  chatEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatEmptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  chatInputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    gap: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 14, 39, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "75%",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  voiceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  voiceItemSelected: {
    backgroundColor: COLORS.glassLight,
  },
  voiceName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  voiceLang: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  voiceCheck: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Minimized
  minimizedContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 16,
    paddingBottom: 32,
  },
  minimizedBall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
