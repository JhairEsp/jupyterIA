# JupyterIA - Guía de Implementación Completa

## Resumen del Proyecto Rediseñado

Tu aplicación **JupyterIA** ha sido completamente reestructurada con un diseño moderno estilo Dribbble que incluye:

### 1. UI/UX Moderno
- **Paleta de colores moderna**: Azul neon (#00D9FF), Verde menta (#00F5A0), Naranja cálido (#FF6B35)
- **Glassmorphism**: Efectos de vidrio translúcido en cards y componentes
- **Animaciones fluidas**: Micro-interacciones y transiciones suaves
- **Diseño responsivo**: Optimizado para mobile, tablet y desktop

### 2. Componentes Reutilizables
Ubicados en `src/components/modern/`:
- `ModernCard.tsx` - Cards con efecto glassmorphism
- `ModernButton.tsx` - Botones con múltiples variantes (primary, secondary, outline, ghost)
- `GlassInput.tsx` - Inputs con efecto glass
- `CalendarWidget.tsx` - Widget de calendario integrado
- `GoogleAuthButton.tsx` - Botón para autenticar con Google

### 3. Nuevos Servicios y Stores
- `GoogleCalendarService.ts` - Servicio para manejar Google Calendar API
- `calendarStore.ts` - Zustand store para estado del calendario

### 4. Pantallas Rediseñadas
- **index.tsx (Pantalla Principal)**: Orb moderno, info cards, calendar preview, quick actions
- **explore.tsx**: Navigation tabs (Dashboard, Tools, Calendar, Settings) con contenido moderno

---

## Instalación y Configuración

### Paso 1: Instalar Dependencias
```bash
npm install @react-oauth/google google-auth-library expo-secure-store
```

(Ya están instaladas en la configuración inicial)

### Paso 2: Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
EXPO_PUBLIC_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
```

### Paso 3: Obtener Credenciales de Google

#### 3.1 Crear Proyecto en Google Cloud
1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto llamado "JupyterIA"

#### 3.2 Habilitar APIs
En "APIs y servicios":
- Busca "Google Calendar API" → Habilitar
- Busca "Google Tasks API" → Habilitar (opcional, para tareas)

#### 3.3 Crear Credenciales OAuth 2.0
1. Ve a "Credenciales"
2. Haz clic en "Crear credenciales" → "ID de cliente OAuth"
3. Configura la pantalla de consentimiento:
   - Tipo de usuario: "Externo"
   - Agrega información básica
   - Agrega scopes: 
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/tasks`
4. Tipo de aplicación: "Aplicación de escritorio"
5. Descarga el JSON con tus credenciales

#### 3.4 Obtener API Key
1. En "Credenciales", crea una "Clave de API"
2. Restringe a: Google Calendar API y Google Tasks API

---

## Integración con Google Calendar

### Flujo de Autenticación

```
Usuario → GoogleAuthButton → Google OAuth → Access Token → SecureStore → CalendarStore
```

### Código de Ejemplo - Implementar en explore.tsx

```tsx
import { useGoogleLogin } from '@react-oauth/google';
import { useCalendarStore } from '../store/calendarStore';
import { GoogleAuthButton } from '../components/modern/GoogleAuthButton';

export default function ExploreScreen() {
  const { isAuthenticated } = useCalendarStore();
  
  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      await useCalendarStore.getState().authenticateGoogle(codeResponse.access_token);
    },
    flow: 'implicit',
  });

  if (!isAuthenticated) {
    return (
      <View>
        <GoogleAuthButton onPress={() => googleLogin()} />
      </View>
    );
  }

  // Mostrar calendario cuando está autenticado
  return <CalendarWidget />;
}
```

### Crear Evento Desde Comando de Voz

```tsx
// En tu VoiceAssistantService, agrega:

async function handleVoiceCommand(command: string) {
  const { createEventFromVoice } = useCalendarStore.getState();
  
  // Ejemplo: "Crear evento mañana a las 3 PM llamado Reunión"
  if (command.includes("crear evento") || command.includes("agendar")) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 1);
    startTime.setHours(15, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(16, 0, 0, 0);
    
    await createEventFromVoice(
      "Reunión",
      "Evento creado por voz",
      startTime.toISOString(),
      endTime.toISOString(),
      15 // recordatorio 15 min antes
    );
  }
}
```

### Mostrar Próximos Eventos

```tsx
import { CalendarWidget } from '../components/modern/CalendarWidget';

// En cualquier pantalla:
<CalendarWidget maxEvents={5} />
```

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── _layout.tsx (Layout principal)
│   ├── index.tsx (Pantalla principal - rediseñada)
│   └── explore.tsx (Explorador - rediseñado)
├── components/
│   ├── modern/
│   │   ├── ModernCard.tsx
│   │   ├── ModernButton.tsx
│   │   ├── GlassInput.tsx
│   │   ├── CalendarWidget.tsx
│   │   └── GoogleAuthButton.tsx
│   ├── AudioWaveform.tsx (existente)
│   ├── FloatingContainer.tsx (existente)
│   └── VoiceStateIndicator.tsx (existente)
├── services/
│   ├── VoiceAssistantService.ts (existente)
│   └── GoogleCalendarService.ts (nuevo)
├── store/
│   ├── voiceStore.ts (existente)
│   └── calendarStore.ts (nuevo)
├── theme/
│   └── colors.ts (actualizado con paleta moderna)
```

---

## Paleta de Colores Moderna

### Colores Base
```
Background:      #0A0E27 (Ultra dark blue-black)
Card BG:         #1A202C (Card background)
Border:          #2D3E5F (Subtle borders)
Text Primary:    #F0F4F8 (Blanco)
Text Muted:      #7A8FA6 (Gris)
```

### Acentos Modernos
```
Primary:   #00D9FF (Cyan neon)
Secondary: #00F5A0 (Mint verde)
Accent:    #FF6B35 (Warm orange)
Purple:    #A855F7 (Modern purple)
Green:     #10B981 (Emerald)
Red:       #FF4757 (Vibrant red)
```

### Efectos
```
Glass:     rgba(255, 255, 255, 0.05)
Glow:      rgba(0, 217, 255, 0.3)
```

---

## Comandos de Voz Implementables

Tu IA puede procesar estos comandos para crear eventos, tareas y alarmas:

### Eventos
```
"Crear evento mañana a las 3 de la tarde"
"Agendar reunión el viernes a las 10 AM"
"Mostrar mis eventos de hoy"
"¿Cuándo es mi próxima reunión?"
```

### Tareas
```
"Añadir tarea: comprar comida"
"Crear tarea para mañana: llamar a mamá"
"Mostrar mis tareas"
```

### Alarmas
```
"Crear evento con alarma 15 minutos antes"
"Recordarme en 30 minutos"
"Alarma a las 7 AM mañana"
```

---

## Customización y Extensión

### Agregar Nueva Herramienta
En `explore.tsx`, actualiza el array `TOOLS`:

```tsx
const TOOLS = [
  {
    id: "new-tool",
    title: "Mi Nueva Herramienta",
    icon: "🚀",
    description: "Descripción",
    color: COLORS.accent,
  },
  // ...resto de herramientas
];
```

### Cambiar Colores Globales
En `src/theme/colors.ts`:

```tsx
export const COLORS = {
  primary: "#NUEVO_COLOR",
  secondary: "#OTRO_COLOR",
  // ...resto de colores
};
```

### Agregar Nueva Vista en Explore
En `explore.tsx`, agrega:

```tsx
type TabType = "dashboard" | "tools" | "calendar" | "settings" | "nueva-vista";

const renderNuevaVista = () => (
  <ScrollView>
    {/* Tu contenido aquí */}
  </ScrollView>
);

// En renderContent():
case "nueva-vista":
  return renderNuevaVista();
```

---

## Troubleshooting

### Error: "No access token available"
- El usuario no se autenticó
- Verifica que GoogleAuthButton está visible
- Solución: Llama a `authenticateGoogle()` primero

### Error: "403 Forbidden"
- Google Calendar API no está habilitada
- Solución: Ve a Google Cloud Console y habilita la API

### Error: "Invalid grant"
- El token expiró
- Solución: Implementa refresh tokens (próxima fase)

### CalendarWidget no muestra eventos
- Verifica que `isAuthenticated` es true
- Verifica que `fetchEvents()` fue llamado
- Revisa la consola para errores de API

---

## Próximos Pasos Recomendados

1. **Refresh Tokens**: Implementar rotación automática de tokens
2. **Voice NLP**: Mejorar parsing de comandos de voz
3. **Persistencia**: Guardar eventos en SQLite local
4. **Notificaciones**: Push notifications para eventos
5. **Sincronización**: Sincronización en tiempo real

---

## Recursos

- [Google Calendar API](https://developers.google.com/calendar/api)
- [Google Tasks API](https://developers.google.com/tasks)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [React Native Docs](https://reactnative.dev/)
- [Zustand Store](https://github.com/pmndrs/zustand)

---

## Preguntas Frecuentes

**P: ¿Cómo sincronizo eventos en tiempo real?**
R: Usa el método `fetchEvents()` regularmente o implementa webhooks de Google Calendar.

**P: ¿Puedo usar esto con Expo Go?**
R: Sí, pero Google OAuth podría necesitar configuración especial en Expo Go. Para producción, usa un build completo.

**P: ¿Cómo manejo eventos de múltiples calendarios?**
R: Usa `calendarId` en GoogleCalendarService para cambiar entre calendarios.

**P: ¿Dónde se almacenan los tokens?**
R: En `expo-secure-store`, que es encriptado por el sistema operativo.

---

## Soporte

Si necesitas ayuda:
1. Revisa la consola de errores
2. Verifica Google Cloud Console
3. Comprueba que las credenciales son correctas
4. Revisa los logs de la aplicación

¡Tu JupyterIA ahora tiene un diseño moderno y una integración completa de Google Calendar!
