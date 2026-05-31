import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { VoiceState } from "../store/voiceStore";

interface VoiceStateIndicatorProps {
  state: VoiceState;
}

export const VoiceStateIndicator: React.FC<VoiceStateIndicatorProps> = ({ state }) => {
  const getDisplayDetails = () => {
    switch (state) {
      case "dormido":
        return {
          title: "JUPYTER DORMIDO",
          desc: "Toca el sensor central o di 'Jupyter' para despertar",
          color: "#64748B",
        };
      case "escuchando":
        return {
          title: "ESCUCHANDO...",
          desc: "Hablame con naturalidad. Jupyter está procesando tu voz.",
          color: "#38BDF8", // Cyan
        };
      case "pensando":
        return {
          title: "PROCESANDO...",
          desc: "Consultando bases de conocimiento y orquestando agentes...",
          color: "#A78BFA", // Violet/Purple
        };
      case "hablando":
        return {
          title: "TRANSMITIENDO",
          desc: "Toca el orbe para interrumpir (Barge-in)",
          color: "#818CF8", // Indigo
        };
      case "ejecutando":
        return {
          title: "EJECUTANDO ACCIÓN",
          desc: "Completando flujo automatizado del sistema...",
          color: "#34D399", // Emerald
        };
      case "investigando":
        return {
          title: "INVESTIGANDO WEB",
          desc: "Deep research a través de Exa y Tavily...",
          color: "#F59E0B", // Amber
        };
      case "analizando":
        return {
          title: "ANALIZANDO PANTALLA",
          desc: "Extrayendo jerarquía de UI y escaneando OCR...",
          color: "#EC4899", // Pink
        };
      case "background":
        return {
          title: "MODO SEGUNDO PLANO",
          desc: "Ejecución latente activa en segundo plano",
          color: "#10B981",
        };
      case "offline":
        return {
          title: "CORE OFFLINE",
          desc: "Estableciendo conexión con el satélite cognitivo...",
          color: "#64748B",
        };
      case "error":
        return {
          title: "ERROR DE CONEXIÓN",
          desc: "Verifica tus credenciales en el archivo .env",
          color: "#EF4444", // Red
        };
      default:
        return {
          title: "JUPYTER.OS",
          desc: "Copiloto Inteligente de Productividad",
          color: "#94A3B8",
        };
    }
  };

  const details = getDisplayDetails();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: details.color }]}>
        {details.title}
      </Text>
      <Text style={styles.desc}>
        {details.desc}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  desc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "300",
    lineHeight: 18,
    maxWidth: 280,
  },
});
