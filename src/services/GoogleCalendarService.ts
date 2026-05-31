import * as SecureStore from 'expo-secure-store';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface CalendarTask {
  id?: string;
  title: string;
  notes?: string;
  dueDate?: string;
  status?: 'needsAction' | 'completed';
}

export interface CalendarReminder {
  eventId: string;
  minutes: number;
  method: 'email' | 'popup';
}

class GoogleCalendarService {
  private accessToken: string | null = null;
  private googleApiKey = 'YOUR_GOOGLE_API_KEY'; // Should be in env vars
  private calendarId = 'primary';

  async setAccessToken(token: string) {
    this.accessToken = token;
    await SecureStore.setItemAsync('google_access_token', token);
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    try {
      const stored = await SecureStore.getItemAsync('google_access_token');
      if (stored) {
        this.accessToken = stored;
      }
      return stored;
    } catch (error) {
      console.error('[GoogleCalendarService] Error retrieving token:', error);
      return null;
    }
  }

  async createEvent(event: CalendarEvent): Promise<any> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('No access token available');

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[GoogleCalendarService] Error creating event:', error);
      throw error;
    }
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('No access token available');

    try {
      const params = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        ...(timeMin && { timeMin }),
        ...(timeMax && { timeMax }),
      });

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events?${params}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('[GoogleCalendarService] Error fetching events:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<any> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('No access token available');

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[GoogleCalendarService] Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('No access token available');

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[GoogleCalendarService] Error deleting event:', error);
      throw error;
    }
  }

  async addReminder(eventId: string, minutes: number, method: 'email' | 'popup' = 'popup'): Promise<any> {
    const token = await this.getAccessToken();
    if (!token) throw new Error('No access token available');

    try {
      // Get the event first
      const eventResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const event = await eventResponse.json();

      // Add reminder
      if (!event.reminders) {
        event.reminders = { useDefault: false, overrides: [] };
      }

      event.reminders.overrides = event.reminders.overrides || [];
      event.reminders.overrides.push({
        method,
        minutes,
      });

      // Update event with new reminders
      return await this.updateEvent(eventId, { reminders: event.reminders });
    } catch (error) {
      console.error('[GoogleCalendarService] Error adding reminder:', error);
      throw error;
    }
  }

  // Helper method to create event from voice command
  async createEventFromVoiceCommand(
    summary: string,
    description: string,
    startTime: string,
    endTime: string,
    reminder?: number
  ): Promise<any> {
    const event: CalendarEvent = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York',
      },
    };

    const createdEvent = await this.createEvent(event);

    if (reminder) {
      await this.addReminder(createdEvent.id, reminder, 'popup');
    }

    return createdEvent;
  }
}

export const googleCalendarService = new GoogleCalendarService();
