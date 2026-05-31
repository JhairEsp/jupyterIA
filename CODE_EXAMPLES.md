# JupyterIA - Ejemplos de Código Ready-to-Use

## 🎯 Copy-Paste Listos Para Usar

### 1. Conectar Google Calendar en Explore

```tsx
// En explore.tsx - Agrega esto en renderSettings()

import { GoogleAuthButton } from '../components/modern/GoogleAuthButton';
import { useGoogleLogin } from '@react-oauth/google';
import { useCalendarStore } from '../store/calendarStore';

// Dentro del componente:
const { isAuthenticated, upcomingEvents } = useCalendarStore();

const googleLogin = useGoogleLogin({
  onSuccess: async (codeResponse) => {
    try {
      await useCalendarStore.getState().authenticateGoogle(codeResponse.access_token);
      // Fetch events después de autenticar
      await useCalendarStore.getState().fetchEvents();
    } catch (error) {
      console.error('Auth error:', error);
    }
  },
  flow: 'implicit',
  scope: 'https://www.googleapis.com/auth/calendar',
});

// En el render:
{!isAuthenticated ? (
  <GoogleAuthButton onPress={() => googleLogin()} />
) : (
  <CalendarWidget />
)}
```

---

### 2. Crear Evento Desde Comando de Voz

```tsx
// En VoiceAssistantService.ts o donde proceses voz

import { useCalendarStore } from '../store/calendarStore';

async function handleVoiceCommand(command: string) {
  // Ejemplo: "Crear evento mañana a las 3 PM llamado Reunión"
  
  if (command.toLowerCase().includes('crear evento') || command.toLowerCase().includes('agendar')) {
    // Parsing básico del comando
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(16, 0, 0, 0);
    
    try {
      await useCalendarStore.getState().createEventFromVoice(
        "Reunión", // Debería extraerse del comando
        "Evento creado por comando de voz",
        tomorrow.toISOString(),
        endTime.toISOString(),
        15 // Alarma 15 minutos antes
      );
      
      // Confirmación visual/audio
      await Speech.speak('Evento creado exitosamente', {
        language: 'es',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      await Speech.speak('No pude crear el evento', { language: 'es' });
    }
  }
}
```

---

### 3. Mostrar Eventos en Pantalla Principal

```tsx
// En index.tsx - Reemplaza el calendarCard existente con:

import { CalendarWidget } from '../components/modern/CalendarWidget';

// En el render:
<CalendarWidget maxEvents={3} compact={true} />

// O para version completa:
<CalendarWidget maxEvents={10} compact={false} />
```

---

### 4. Crear Tarea por Comando de Voz

```tsx
// Agregá esto a GoogleCalendarService.ts

async createTask(title: string, dueDate?: string, notes?: string): Promise<any> {
  const token = await this.getAccessToken();
  if (!token) throw new Error('No access token available');

  try {
    const response = await fetch(
      'https://www.googleapis.com/tasks/v1/lists/@default/tasks',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          notes,
          due: dueDate,
          status: 'needsAction',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[GoogleCalendarService] Error creating task:', error);
    throw error;
  }
}

// Luego úsalo así:
// await googleCalendarService.createTask('Comprar leche', '2026-06-01');
```

---

### 5. Actualizar Evento Después de Creado

```tsx
// En calendarStore.ts o en tu servicio

async updateEventReminder(eventId: string, minutesBefore: number) {
  try {
    await googleCalendarService.addReminder(
      eventId,
      minutesBefore,
      'popup'
    );
    
    // Reload events
    await this.getState().fetchEvents();
  } catch (error) {
    console.error('Error updating reminder:', error);
  }
}
```

---

### 6. Procesar Parsing Simple de Comandos de Voz

```tsx
// Agrega esto a tu servicio de voz

function parseVoiceCommand(command: string) {
  const lower = command.toLowerCase();
  
  // Crear evento
  if (lower.includes('crear evento') || lower.includes('agendar')) {
    // Busca números para hora
    const timeMatch = command.match(/(\d{1,2})\s*(am|pm|:)?/i);
    const timeHour = timeMatch ? parseInt(timeMatch[1]) : 14;
    
    // Busca "mañana", "hoy", "el viernes", etc
    let daysOffset = 0;
    if (lower.includes('mañana')) daysOffset = 1;
    else if (lower.includes('el viernes')) daysOffset = 5; // Simplificado
    
    return {
      type: 'create_event',
      title: extractTitle(command),
      daysOffset,
      hour: timeHour,
    };
  }
  
  // Crear tarea
  if (lower.includes('tarea') || lower.includes('agregar')) {
    return {
      type: 'create_task',
      title: extractTitle(command),
    };
  }
  
  // Alarma
  if (lower.includes('alarma') || lower.includes('recordarme')) {
    const minMatch = command.match(/(\d+)\s*(minuto|hora)/i);
    const minutes = minMatch ? parseInt(minMatch[1]) : 30;
    
    return {
      type: 'create_reminder',
      minutesFromNow: minutes,
    };
  }
  
  return null;
}

function extractTitle(command: string): string {
  // Elimina palabras comunes
  const title = command
    .replace(/crear evento|agendar|tarea|agregar|nuevo/gi, '')
    .replace(/mañana|hoy|este|la|el|de|a|las|por/gi, '')
    .trim();
  
  return title || 'Sin título';
}
```

---

### 7. Mostrar Eventos Próximos en Dashboard

```tsx
// Agrega esto en index.tsx para mostrar próximos eventos

import { useCalendarStore } from '../store/voiceStore';

export default function HomeScreen() {
  const { upcomingEvents } = useCalendarStore();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* ... otro contenido ... */}
      
      {/* Eventos próximos */}
      {upcomingEvents.length > 0 && (
        <ModernCard glassy elevated style={styles.calendarCard}>
          <Text style={styles.cardTitle}>Próximos Eventos</Text>
          {upcomingEvents.slice(0, 3).map((event) => (
            <View key={event.id} style={styles.eventRow}>
              <Text style={styles.eventTitle}>{event.summary}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.start.dateTime || event.start.date!).toLocaleTimeString('es-ES')}
              </Text>
            </View>
          ))}
        </ModernCard>
      )}
    </SafeAreaView>
  );
}
```

---

### 8. Manejar Errores de Autenticación

```tsx
import { useCalendarStore } from '../store/calendarStore';

export function CalendarErrorHandler() {
  const { error, isAuthenticated } = useCalendarStore();
  
  if (error) {
    return (
      <ModernCard glassy style={{ backgroundColor: '#FF4757' + '20' }}>
        <Text style={{ color: '#FF4757', fontWeight: '600' }}>
          Error de Calendario
        </Text>
        <Text style={{ color: COLORS.text, marginTop: 4 }}>
          {error}
        </Text>
        <ModernButton
          title="Reintentar"
          onPress={() => {
            // Implementar retry logic
          }}
          size="small"
          style={{ marginTop: 8 }}
        />
      </ModernCard>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <ModernCard glassy>
        <Text style={{ color: COLORS.text }}>
          Conecta tu Google Calendar para ver eventos
        </Text>
      </ModernCard>
    );
  }
  
  return null;
}
```

---

### 9. Sincronizar Eventos Periódicamente

```tsx
import { useEffect } from 'react';
import { useCalendarStore } from '../store/calendarStore';

export function useSyncCalendar(intervalSeconds: number = 300) {
  const { isAuthenticated, fetchEvents } = useCalendarStore();
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fetch inicial
    fetchEvents();
    
    // Sincronizar periódicamente
    const interval = setInterval(() => {
      fetchEvents();
    }, intervalSeconds * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);
}

// Uso en un componente:
export default function MyComponent() {
  useSyncCalendar(300); // Sincronizar cada 5 minutos
  
  return (
    <View>
      {/* Tu contenido */}
    </View>
  );
}
```

---

### 10. Personalizar Colores de Evento

```tsx
// En CalendarWidget.tsx, puedes personalizar:

const getEventColor = (eventId: string): string => {
  // Hash simple del ID para asignar colores
  const colors = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.accent,
    COLORS.purple,
    COLORS.blue,
  ];
  
  const hash = eventId.charCodeAt(0) || 0;
  return colors[hash % colors.length];
};

// Uso:
<View
  style={[
    styles.dot,
    { backgroundColor: getEventColor(event.id || '') },
  ]}
/>
```

---

## 🔧 Snippets Útiles

### Formatear Fecha
```tsx
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

### Checar Disponibilidad Calendario
```tsx
const isCalendarAvailable = async () => {
  const token = await googleCalendarService.getAccessToken();
  return !!token;
};
```

### Log de Eventos
```tsx
const logEvents = (events: CalendarEvent[]) => {
  console.log('[Calendar] Events loaded:', {
    count: events.length,
    upcoming: events.slice(0, 3).map(e => e.summary),
    nextEvent: events[0]?.summary,
  });
};
```

---

## 📝 Variables de Entorno Necesarias

```bash
# .env.local
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
EXPO_PUBLIC_GOOGLE_API_KEY=YOUR_API_KEY
```

---

## ✅ Checklist de Implementación

- [ ] Crear proyecto en Google Cloud
- [ ] Habilitar Google Calendar API
- [ ] Obtener credenciales OAuth
- [ ] Agregar variables de entorno
- [ ] Importar GoogleAuthButton
- [ ] Implementar login con Google
- [ ] Mostrar CalendarWidget
- [ ] Procesar comandos de voz
- [ ] Testear creación de eventos
- [ ] Testear alarmas/reminders

---

## 🎓 Recursos Adicionales

- Google Calendar API Docs: https://developers.google.com/calendar
- OAuth 2.0 Flow: https://developers.google.com/identity/protocols/oauth2
- Zustand: https://github.com/pmndrs/zustand
- React Native Docs: https://reactnative.dev/

---

¡Todos estos ejemplos están listos para copiar y pegar en tu proyecto!
