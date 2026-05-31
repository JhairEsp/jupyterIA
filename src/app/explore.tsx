import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../theme/colors";
import { ModernCard } from "../components/modern/ModernCard";
import { ModernButton } from "../components/modern/ModernButton";
import { GlassInput } from "../components/modern/GlassInput";
import { CalendarWidget } from "../components/modern/CalendarWidget";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TabType = "dashboard" | "tools" | "calendar" | "settings";

const TOOLS = [
  {
    id: "chat",
    title: "Chat Inteligente",
    icon: "💬",
    description: "Conversación en tiempo real",
    color: COLORS.primary,
  },
  {
    id: "search",
    title: "Búsqueda Avanzada",
    icon: "🔍",
    description: "Busca información al instante",
    color: COLORS.secondary,
  },
  {
    id: "code",
    title: "Code Studio",
    icon: "💻",
    description: "Escribe y depura código",
    color: COLORS.accent,
  },
  {
    id: "voice",
    title: "Voice Studio",
    icon: "🎙️",
    description: "Personaliza tu voz",
    color: COLORS.blue,
  },
  {
    id: "automation",
    title: "Automatización",
    icon: "⚙️",
    description: "Crea flujos automáticos",
    color: COLORS.purple,
  },
  {
    id: "analyze",
    title: "Análisis",
    icon: "📊",
    description: "Visualiza datos",
    color: COLORS.green,
  },
];

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Dashboard View
  const renderDashboard = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorador</Text>
        <Text style={styles.headerSubtitle}>Acceso a todas tus herramientas</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <ModernCard glassy style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Herramientas</Text>
        </ModernCard>
        <ModernCard glassy style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Activas</Text>
        </ModernCard>
        <ModernCard glassy style={styles.statCard}>
          <Text style={styles.statValue}>∞</Text>
          <Text style={styles.statLabel}>Posibilidades</Text>
        </ModernCard>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <GlassInput
          placeholder="Busca una herramienta..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Featured Tools Grid */}
      <Text style={styles.sectionTitle}>Herramientas Principales</Text>
      <View style={styles.toolsGrid}>
        {TOOLS.slice(0, 3).map((tool) => (
          <TouchableOpacity key={tool.id} activeOpacity={0.7}>
            <ModernCard glassy elevated style={[styles.toolCard, { borderTopWidth: 2 } as any, { borderTopColor: tool.color }]}>
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDesc}>{tool.description}</Text>
            </ModernCard>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calendar Widget */}
      <CalendarWidget maxEvents={3} />

      {/* All Tools Grid */}
      <Text style={styles.sectionTitle}>Todas las Herramientas</Text>
      <View style={styles.allToolsGrid}>
        {TOOLS.map((tool) => (
          <TouchableOpacity key={tool.id} style={styles.toolItemContainer} activeOpacity={0.7}>
            <View style={[styles.toolItem, { backgroundColor: tool.color + "15" }]}>
              <Text style={styles.toolItemIcon}>{tool.icon}</Text>
              <Text style={styles.toolItemTitle}>{tool.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Tools View
  const renderTools = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Herramientas</Text>
        <Text style={styles.headerSubtitle}>Explora cada característica</Text>
      </View>

      <View style={styles.searchContainer}>
        <GlassInput
          placeholder="Filtrar herramientas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.detailedToolsList}>
        {TOOLS.map((tool) => (
          <TouchableOpacity key={tool.id} activeOpacity={0.7}>
            <ModernCard glassy elevated style={styles.detailedToolCard}>
              <View style={styles.detailedToolContent}>
                <Text style={styles.detailedToolIcon}>{tool.icon}</Text>
                <View style={styles.detailedToolInfo}>
                  <Text style={styles.detailedToolTitle}>{tool.title}</Text>
                  <Text style={styles.detailedToolDesc}>{tool.description}</Text>
                </View>
              </View>
              <Text style={styles.detailedToolArrow}>→</Text>
            </ModernCard>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Calendar View
  const renderCalendar = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus eventos</Text>
      </View>

      <CalendarWidget compact={false} />

      {/* Calendar Features */}
      <Text style={styles.sectionTitle}>Crear Eventos por Voz</Text>
      <ModernCard glassy elevated style={styles.featureCard}>
        <Text style={styles.featureIcon}>🎤</Text>
        <Text style={styles.featureTitle}>Crea eventos hablando</Text>
        <Text style={styles.featureDesc}>
          Di: "Crea un evento mañana a las 3 PM llamado Reunión" y listo
        </Text>
        <ModernButton
          title="Probar Ahora"
          onPress={() => {}}
          size="small"
          style={{ marginTop: 12 }}
        />
      </ModernCard>

      <Text style={styles.sectionTitle}>Crear Tareas por Voz</Text>
      <ModernCard glassy elevated style={styles.featureCard}>
        <Text style={styles.featureIcon}>✅</Text>
        <Text style={styles.featureTitle}>Tareas rápidas</Text>
        <Text style={styles.featureDesc}>
          Di: "Crea una tarea: comprar leche para mañana"
        </Text>
        <ModernButton
          title="Probar Ahora"
          onPress={() => {}}
          size="small"
          style={{ marginTop: 12 }}
        />
      </ModernCard>

      <Text style={styles.sectionTitle}>Configurar Alarmas</Text>
      <ModernCard glassy elevated style={styles.featureCard}>
        <Text style={styles.featureIcon}>🔔</Text>
        <Text style={styles.featureTitle}>Alarmas inteligentes</Text>
        <Text style={styles.featureDesc}>
          Di: "Recuérdame en 30 minutos sobre la reunión"
        </Text>
        <ModernButton
          title="Probar Ahora"
          onPress={() => {}}
          size="small"
          style={{ marginTop: 12 }}
        />
      </ModernCard>
    </ScrollView>
  );

  // Settings View
  const renderSettings = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
      </View>

      <Text style={styles.sectionTitle}>Integraciones</Text>
      <ModernCard glassy elevated style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Google Calendar</Text>
            <Text style={styles.settingDesc}>Sincroniza tus eventos</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.secondary + "30" }]}>
            <Text style={styles.statusText}>Conectado</Text>
          </View>
        </View>
      </ModernCard>

      <Text style={styles.sectionTitle}>Preferencias</Text>
      <ModernCard glassy elevated style={styles.settingCard}>
        <Text style={styles.settingTitle}>Tema</Text>
        <Text style={styles.settingDesc}>Modo oscuro (Actual)</Text>
      </ModernCard>

      <ModernCard glassy elevated style={styles.settingCard}>
        <Text style={styles.settingTitle}>Idioma</Text>
        <Text style={styles.settingDesc}>Español</Text>
      </ModernCard>

      <ModernCard glassy elevated style={styles.settingCard}>
        <Text style={styles.settingTitle}>Privacidad</Text>
        <Text style={styles.settingDesc}>Controla tus datos</Text>
      </ModernCard>

      <View style={styles.dangerZone}>
        <ModernButton
          title="Cerrar Sesión"
          onPress={() => {}}
          variant="outline"
          size="large"
        />
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "tools":
        return renderTools();
      case "calendar":
        return renderCalendar();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {renderContent()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {["dashboard", "tools", "calendar", "settings"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.navItem,
              activeTab === tab && styles.navItemActive,
            ]}
            onPress={() => setActiveTab(tab as TabType)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navIcon,
                activeTab === tab && styles.navIconActive,
              ]}
            >
              {tab === "dashboard" && "📊"}
              {tab === "tools" && "🔧"}
              {tab === "calendar" && "📅"}
              {tab === "settings" && "⚙️"}
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === tab && styles.navLabelActive,
              ]}
            >
              {tab === "dashboard" && "Panel"}
              {tab === "tools" && "Herr."}
              {tab === "calendar" && "Cal."}
              {tab === "settings" && "Config"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingBottom: 100,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Tools Grid (Featured)
  toolsGrid: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  toolCard: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  toolIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  toolDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: "center",
  },

  // All Tools Grid
  allToolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toolItemContainer: {
    width: (SCREEN_WIDTH - 52) / 2,
  },
  toolItem: {
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolItemIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  toolItemTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },

  // Detailed Tools List
  detailedToolsList: {
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailedToolCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailedToolContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailedToolIcon: {
    fontSize: 28,
  },
  detailedToolInfo: {
    flex: 1,
  },
  detailedToolTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  detailedToolDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  detailedToolArrow: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Feature Cards
  featureCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },

  // Setting Cards
  settingCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  // Danger Zone
  dangerZone: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 0,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: "transparent",
  },
  navItemActive: {
    borderTopColor: COLORS.primary,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navIconActive: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
