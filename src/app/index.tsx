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
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Canvas, Circle, RadialGradient, vec } from "@shopify/react-native-skia";
import * as Speech from "expo-speech";
import { useVoiceStore } from "../store/voiceStore";
import { AudioWaveform } from "../components/AudioWaveform";
import { FloatingContainer } from "../components/FloatingContainer";
import { VoiceStateIndicator } from "../components/VoiceStateIndicator";
import { jupyterVoice } from "../services/VoiceAssistantService";
import { COLORS } from "../theme/colors";

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
    availableVoices
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

  const handleCentralCorePress = () => {
    if (currentState === "dormido") {
      jupyterVoice.startListening();
    } else if (currentState === "escuchando") {
      jupyterVoice.stopListening();
      setVoiceState("dormido");
    } else if (currentState === "hablando" || currentState === "pensando") {
      jupyterVoice.triggerBargeIn();
    } else {
      setVoiceState("dormido");
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const textToSend = chatInput;
    setChatInput("");
    jupyterVoice.handleUserText(textToSend);
  };

  const handleTestVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    Speech.stop();
    Speech.speak("Voz de Jupyter seleccionada.", {
      language: "es",
      voice: voiceId,
      pitch: 1.0,
      rate: 1.0,
    });
  };

  const getCoreGlowColor = () => {
    switch (currentState) {
      case "escuchando":
        return COLORS.cyan; // Azul moderno (Primary)
      case "pensando":
        return COLORS.purple; // Púrpura pensativo
      case "hablando":
        return COLORS.cyan; // Azul hablando
      case "accion":
      case "ejecutando":
        return COLORS.orange; // Naranja para acciones activas
      case "investigando":
        return COLORS.green; // Verde para investigación
      case "analizando":
        return COLORS.cyan; // Azul para análisis
      case "background":
        return COLORS.indigo; // Indigo de fondo
      case "offline":
        return COLORS.textMuted; // Gris mutado offline
      case "error":
        return COLORS.red; // Rojo error limpio
      default:
        return COLORS.cardBg; // Gris oscuro por defecto
    }
  };

  const renderMinimizedContent = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setMinimized(false)}
      style={styles.minimizedTouch as any}
    >
      <View style={styles.minimizedOuter as any}>
        <View 
          style={[styles.minimizedInner, { backgroundColor: getCoreGlowColor() }] as any} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container as any}>
      <StatusBar barStyle="light-content" />

      <FloatingContainer
        isMinimized={isMinimized}
        minimizedContent={renderMinimizedContent()}
      >
        <SafeAreaView style={styles.safeArea as any}>
          {/* BACKGROUND GLOW SHADER (SKIA) */}
          <View style={styles.backgroundGlow as any}>
            <Canvas style={styles.canvas as any}>
              <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT / 2 - 50} r={280}>
                <RadialGradient
                  c={vec(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 50)}
                  r={280}
                  colors={[getCoreGlowColor() + "25", getCoreGlowColor() + "05", "#00000000"]}
                />
              </Circle>
            </Canvas>
          </View>

          {/* TOP HUD: System and Agent telemetry */}
          <View style={styles.header as any}>
            <View>
              <Text style={styles.telemetryTitle as any}>
                JUPYTER.OS CORE
              </Text>
              <Text style={styles.telemetryValue as any}>
                ONLINE // MODEL: LLAMA-3.1
              </Text>
            </View>
            
            <View style={styles.headerRight as any}>
              <TouchableOpacity 
                style={styles.headerIconButton as any}
                onPress={() => setShowVoiceModal(true)}
              >
                <Text style={styles.headerIconText as any}>⚙️</Text>
              </TouchableOpacity>
              
              <View style={styles.badgeContainer as any}>
                <View style={styles.badge as any}>
                  <Text style={[styles.badgeText, { color: getCoreGlowColor() }] as any}>
                    {currentState.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* CHAT MODE OR ORB MODE CONTAINER */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centerContainer as any}
          >
            {isChatMode ? (
              // --- CHAT INTERFACE ---
              <View style={styles.chatWrapper as any}>
                {/* Mini status indicator at top of chat */}
                <View style={styles.chatStatusHeader as any}>
                  <View style={[styles.statusDot, { backgroundColor: getCoreGlowColor() }] as any} />
                  <Text style={styles.statusText as any}>Jupyter está disponible por texto</Text>
                </View>

                <ScrollView
                  ref={scrollViewRef}
                  style={styles.chatScroll as any}
                  contentContainerStyle={styles.chatScrollContent as any}
                >
                  {chatMessages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <View 
                        key={msg.id} 
                        style={[
                          styles.messageRow, 
                          isUser ? styles.messageRowUser : styles.messageRowAssistant
                        ] as any}
                      >
                        {!isUser && <Text style={styles.avatarSymbol as any}>🤖</Text>}
                        <View 
                          style={[
                            styles.messageBubble,
                            isUser ? styles.bubbleUser : styles.bubbleAssistant,
                            !isUser && { borderColor: getCoreGlowColor() + "30" }
                          ] as any}
                        >
                          <Text style={isUser ? styles.messageTextUser : styles.messageTextAssistant as any}>
                            {msg.content}
                          </Text>
                          <Text style={styles.messageTime as any}>{msg.timestamp}</Text>
                        </View>
                        {isUser && <Text style={styles.avatarSymbol as any}>👤</Text>}
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Chat Input Bar */}
                <View style={styles.inputContainer as any}>
                  <TextInput
                    style={styles.textInput as any}
                    placeholder="Escribe un mensaje a Jupyter..."
                    placeholderTextColor="#475569"
                    value={chatInput}
                    onChangeText={setChatInput}
                    onSubmitEditing={handleSendChat}
                  />
                  <TouchableOpacity 
                    onPress={handleSendChat} 
                    style={[styles.sendButton, { backgroundColor: getCoreGlowColor() }] as any}
                  >
                    <Text style={styles.sendButtonText as any}>⚡</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // --- STANDARD CORE ORB INTERFACE ---
              <View style={styles.orbWrapper as any}>
                <View style={styles.coreContainer as any}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleCentralCorePress}
                    style={styles.coreTouch as any}
                  >
                    {/* Outer pulsing ring */}
                    <View 
                      style={[
                        styles.coreOuterRing,
                        {
                          shadowColor: getCoreGlowColor(),
                          borderColor: getCoreGlowColor() + "40",
                        }
                      ] as any}
                    >
                      {/* Core status orb */}
                      <View 
                        style={[
                          styles.coreInnerOrb,
                          {
                            backgroundColor: getCoreGlowColor(),
                            shadowColor: getCoreGlowColor(),
                          }
                        ] as any}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Realtime Waveform Visualization */}
                <AudioWaveform state={currentState} />

                {/* Current Voice State Text Indicators */}
                <VoiceStateIndicator state={currentState} />
              </View>
            )}
          </KeyboardAvoidingView>

          {/* LOWER CONTROLS & DOCK */}
          <View style={styles.footer as any}>
            <View style={styles.buttonContainer as any}>
              <TouchableOpacity
                onPress={() => setIsChatMode(!isChatMode)}
                style={[styles.dockButton, isChatMode && styles.dockActiveButton] as any}
              >
                <Text style={styles.dockButtonIcon as any}>{isChatMode ? "🎙️" : "⌨️"}</Text>
                <Text style={styles.dockButtonText as any}>{isChatMode ? "Modo Voz" : "Modo Chat"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMinimized(true)}
                style={styles.dockButton as any}
              >
                <Text style={styles.dockButtonIcon as any}>📉</Text>
                <Text style={styles.dockButtonText as any}>Minimizar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Speech.stop();
                  jupyterVoice.stopListening();
                  setVoiceState("dormido");
                }}
                style={styles.dockStopButton as any}
              >
                <Text style={styles.dockButtonIcon as any}>🛑</Text>
                <Text style={styles.dockStopButtonText as any}>Detener</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* VOICE SELECTION MODAL */}
          <Modal
            visible={showVoiceModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowVoiceModal(false)}
          >
            <View style={styles.modalOverlay as any}>
              <View style={styles.modalContent as any}>
                <View style={styles.modalHeader as any}>
                  <Text style={styles.modalTitle as any}>Configurar Voz del Sistema</Text>
                  <TouchableOpacity 
                    onPress={() => setShowVoiceModal(false)}
                    style={styles.modalCloseButton as any}
                  >
                    <Text style={styles.modalCloseText as any}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSub as any}>
                  Selecciona una voz en español detectada en tu dispositivo para la síntesis de voz (TTS).
                </Text>

                {availableVoices.length === 0 ? (
                  <View style={styles.emptyContainer as any}>
                    <Text style={styles.emptyText as any}>No se detectaron voces adicionales instaladas en español.</Text>
                    <Text style={styles.emptySubtext as any}>El sistema utilizará la voz predeterminada del dispositivo.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={availableVoices}
                    keyExtractor={(item) => item.identifier}
                    contentContainerStyle={styles.voiceList as any}
                    renderItem={({ item }) => {
                      const isSelected = selectedVoice === item.identifier;
                      return (
                        <TouchableOpacity
                          onPress={() => handleTestVoice(item.identifier)}
                          style={[
                            styles.voiceItem,
                            isSelected && styles.voiceItemSelected
                          ] as any}
                        >
                          <View style={styles.voiceInfo as any}>
                            <Text style={[styles.voiceName, isSelected && styles.voiceTextSelected] as any}>
                              {item.name}
                            </Text>
                            <Text style={styles.voiceLang as any}>
                              Idioma: {item.language} / Calidad: {item.quality || "Estándar"}
                            </Text>
                          </View>
                          {isSelected && <Text style={styles.checkIcon as any}>⭐</Text>}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            </View>
          </Modal>

        </SafeAreaView>
      </FloatingContainer>
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
    justifyContent: "space-between",
  },
  backgroundGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -10,
  },
  canvas: {
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconText: {
    fontSize: 16,
  },
  telemetryTitle: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  telemetryValue: {
    fontSize: 11,
    fontFamily: "monospace",
    color: COLORS.text,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: "row",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: "monospace",
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
  },
  orbWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  coreContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  coreTouch: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  coreOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "rgba(28, 27, 28, 0.4)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  coreInnerOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
  },

  // CHAT STYLE CLASSES
  chatWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  chatStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    alignSelf: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "monospace",
    color: COLORS.textMuted,
  },
  chatScroll: {
    flex: 1,
    marginVertical: 8,
  },
  chatScrollContent: {
    paddingBottom: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginVertical: 4,
    maxWidth: "85%",
  },
  messageRowUser: {
    alignSelf: "flex-end",
  },
  messageRowAssistant: {
    alignSelf: "flex-start",
  },
  avatarSymbol: {
    fontSize: 18,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: "rgba(0, 229, 255, 0.15)", // Azure Nexus primary tinted glow
    borderColor: COLORS.cyan,
    borderBottomRightRadius: 2,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2,
  },
  messageTextUser: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
  messageTextAssistant: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "300",
  },
  messageTime: {
    fontSize: 8,
    color: COLORS.textMuted,
    alignSelf: "flex-end",
    marginTop: 4,
    fontFamily: "monospace",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 13,
    paddingVertical: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // FOOTER STYLE CLASSES
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  dockButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  dockActiveButton: {
    borderColor: COLORS.cyan,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  dockButtonIcon: {
    fontSize: 14,
  },
  dockButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#CBD5E1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dockStopButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  dockStopButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.red,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // MODAL STYLE CLASSES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: "75%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    marginBottom: 16,
  },
  voiceList: {
    gap: 10,
    paddingBottom: 24,
  },
  voiceItem: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voiceItemSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  voiceTextSelected: {
    color: COLORS.cyan,
    fontWeight: "600",
  },
  voiceLang: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: "monospace",
  },
  checkIcon: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  minimizedTouch: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
    backgroundColor: "#020617",
  },
  minimizedOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    backgroundColor: "rgba(76, 29, 149, 0.2)",
  },
  minimizedInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
