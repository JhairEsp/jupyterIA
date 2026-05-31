import { create } from 'zustand';
import { CalendarEvent } from '../services/GoogleCalendarService';
import { googleCalendarService } from '../services/GoogleCalendarService';

interface CalendarStore {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Events
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  
  // Methods
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setUpcomingEvents: (events: CalendarEvent[]) => void;
  
  // Calendar operations
  authenticateGoogle: (token: string) => Promise<void>;
  fetchEvents: (timeMin?: string, timeMax?: string) => Promise<void>;
  createEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  createEventFromVoice: (summary: string, description: string, startTime: string, endTime: string, reminder?: number) => Promise<void>;
  
  // Clear
  clearEvents: () => void;
  clearAuth: () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: false,
  error: null,
  events: [],
  upcomingEvents: [],

  // Setters
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  setEvents: (events) => set({ events }),
  setUpcomingEvents: (events) => set({ upcomingEvents: events }),

  // Methods
  authenticateGoogle: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      await googleCalendarService.setAccessToken(token);
      set({ isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchEvents: async (timeMin?: string, timeMax?: string) => {
    set({ isLoading: true, error: null });
    try {
      const events = await googleCalendarService.getEvents(timeMin, timeMax);
      set({ events, isLoading: false });
      
      // Filter upcoming events (next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = events.filter(event => {
        const eventStart = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
        return eventStart >= now && eventStart <= nextWeek;
      });
      
      set({ upcomingEvents: upcoming });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createEvent: async (event: CalendarEvent) => {
    set({ isLoading: true, error: null });
    try {
      await googleCalendarService.createEvent(event);
      // Refresh events
      await get().fetchEvents();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      await googleCalendarService.deleteEvent(eventId);
      // Refresh events
      await get().fetchEvents();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createEventFromVoice: async (summary: string, description: string, startTime: string, endTime: string, reminder?: number) => {
    set({ isLoading: true, error: null });
    try {
      await googleCalendarService.createEventFromVoiceCommand(summary, description, startTime, endTime, reminder);
      // Refresh events
      await get().fetchEvents();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearEvents: () => set({ events: [], upcomingEvents: [] }),
  clearAuth: () => set({ isAuthenticated: false, events: [], upcomingEvents: [] }),
}));
