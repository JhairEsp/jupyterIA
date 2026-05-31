# Integración Google Calendar con JupyterIA

Esta guía te muestra cómo integrar Google Calendar para crear eventos, tareas y alarmas usando comandos de voz.

## Paso 1: Configurar Google Cloud Project

### 1.1 Crear un proyecto en Google Cloud Console
- Ve a https://console.cloud.google.com/
- Crea un nuevo proyecto llamado "JupyterIA"
- Espera a que se cree

### 1.2 Habilitar las APIs necesarias
- En Google Cloud Console, ve a "APIs y servicios"
- Busca "Google Calendar API" y habilítala
- Busca "Google Tasks API" y habilítala
- Busca "People API" y habilítala

### 1.3 Crear Credenciales OAuth 2.0
- Ve a "Credenciales" en el menú lateral
- Haz clic en "Crear credenciales" → "ID de cliente OAuth"
- Si es la primera vez, configura la pantalla de consentimiento:
  - Tipo de usuario: "Externo"
  - Agrega información básica del app
  - Agrega scopes: `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/tasks`
- Para el tipo de aplicación, selecciona "Aplicación de escritorio"
- Descarga el JSON con tus credenciales

### 1.4 Obtener las credenciales necesarias
Del archivo JSON descargado, extrae:
- `client_id`
- `client_secret`

## Paso 2: Configurar tu proyecto React Native

### 2.1 Instalar dependencias
```bash
npm install @react-oauth/google google-auth-library expo-secure-store
```

(Ya están instaladas si ejecutaste el setup inicial)

### 2.2 Agregar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_client_secret_here
EXPO_PUBLIC_API_KEY=your_api_key_here
```

Para obtener tu API Key:
- Ve a Google Cloud Console → Credenciales
- Crea una nueva "Clave de API" (API Key)
- Restringe solo a Google Calendar API y Google Tasks API

### 2.3 Configurar el proveedor OAuth
En tu `_layout.tsx`, envuelve tu app con GoogleOAuthProvider:

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout() {
  return (
    <GoogleOAuthProvider clientId={process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!}>
      {/* Tu contenido */}
    </GoogleOAuthProvider>
  );
}
```

## Paso 3: Usar Google Calendar en tu app

### 3.1 Autenticarse
```tsx
import { useGoogleLogin } from '@react-oauth/google';
import { googleCalendarService } from '../services/GoogleCalendarService';
import { useCalendarStore } from '../store/calendarStore';

const login = useGoogleLogin({
  onSuccess: async (codeResponse) => {
    await useCalendarStore.getState().authenticateGoogle(codeResponse.access_token);
  },
  flow: 'implicit',
  scope: 'https://www.googleapis.com/auth/calendar',
});

<ModernButton
  title="Conectar Google Calendar"
  onPress={() => login()}
/>
```

### 3.2 Crear un evento con voz
```tsx
// El usuario dice: "Crea un evento mañana a las 3 PM llamado 'Reunión'"
// Tu servicio de voz procesa esto:

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(15, 0, 0, 0);

const endTime = new Date(tomorrow);
endTime.setHours(16, 0, 0, 0);

await useCalendarStore.getState().createEventFromVoice(
  "Reunión",
  "Reunión programada por voz",
  tomorrow.toISOString(),
  endTime.toISOString(),
  15 // 15 minutos antes
);
```

### 3.3 Obtener próximos eventos
```tsx
const { events, upcomingEvents } = useCalendarStore();

useEffect(() => {
  useCalendarStore.getState().fetchEvents();
}, []);

// Mostrar eventos
{upcomingEvents.map(event => (
  <Text key={event.id}>{event.summary}</Text>
))}
```

### 3.4 Procesar comandos de voz para Calendar
```tsx
// En tu VoiceAssistantService, agrega esta lógica:

async function processCalendarCommand(command: string) {
  // Ejemplos de comandos:
  // "Crear evento mañana a las 3 llamado Reunión"
  // "Mostrar mis eventos de hoy"
  // "Agregar alarma en 30 minutos"
  
  const store = useCalendarStore.getState();
  
  if (command.includes("crear evento") || command.includes("agendar")) {
    // Extrae detalles (necesitarás NLP o parsing)
    const title = extractTitle(command);
    const time = extractTime(command);
    const reminder = extractReminder(command) || 15;
    
    await store.createEventFromVoice(
      title,
      "Evento creado por voz",
      time.start.toISOString(),
      time.end.toISOString(),
      reminder
    );
  }
  
  if (command.includes("mostrar eventos") || command.includes("agenda")) {
    const events = store.upcomingEvents;
    return events.map(e => `${e.summary} a las ${e.start.dateTime}`).join(", ");
  }
}
```

## Paso 4: Crear Tareas (Tasks API)

### 4.1 Crear una tarea desde voz
```tsx
async function createTask(title: string, dueDate?: string) {
  const token = await googleCalendarService.getAccessToken();
  
  const response = await fetch(
    'https://www.googleapis.com/tasks/v1/lists/@default/tasks',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        due: dueDate,
        status: 'needsAction',
      }),
    }
  );
  
  return await response.json();
}

// Uso:
// Usuario: "Crea una tarea: comprar leche"
await createTask("Comprar leche");
```

## Paso 5: Configurar Alarmas

### 5.1 Alarmas en eventos
Las alarmas se configuran automáticamente con `reminder` en `createEventFromVoice`.

Para personalizarlas:
```tsx
// El usuario dice: "Crear evento a las 3 PM con alarma 30 minutos antes"
const reminder = 30; // minutos

await store.createEventFromVoice(
  "Evento",
  "Descripción",
  startTime.toISOString(),
  endTime.toISOString(),
  reminder
);
```

## Paso 6: Ejemplos de Comandos de Voz

Aquí están los comandos que tu IA debería entender:

```
# Eventos
"Crear evento mañana a las 3 de la tarde"
"Agendar reunión el viernes a las 10 AM"
"Mostrar mis eventos de hoy"
"¿Cuándo es mi próxima reunión?"

# Tareas
"Añadir tarea: comprar comida"
"Crear tarea para mañana: llamar a mamá"
"Mostrar mis tareas"

# Alarmas
"Crear evento con alarma 15 minutos antes"
"Recordarme en 30 minutos"
"Alarma a las 7 AM mañana"
```

## Troubleshooting

### Error: "No access token available"
- Asegúrate de que el usuario se autentica primero
- Verifica que el token se guarda correctamente en SecureStore

### Error: "Invalid grant"
- El token expiró, necesita re-autenticar
- Implementa refresh tokens para sesiones largas

### Error: "403 Forbidden"
- Verifica que Google Calendar API está habilitada
- Comprueba los scopes en el OAuth consent screen

### Las alarmas no funcionan
- Google Calendar requiere `reminders.useDefault: false`
- Usa el array `reminders.overrides` para alarmas personalizadas

## Recursos Útiles

- [Google Calendar API Docs](https://developers.google.com/calendar/api/v3/reference)
- [Google Tasks API Docs](https://developers.google.com/tasks/v1/reference)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)

¡Listo! Ahora tu JupyterIA puede crear eventos, tareas y alarmas solo con comandos de voz.
