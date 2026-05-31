import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { useCalendarStore } from '../../store/calendarStore';
import { CalendarEvent } from '../../services/GoogleCalendarService';
import { ModernCard } from './ModernCard';

interface CalendarWidgetProps {
  compact?: boolean;
  maxEvents?: number;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  compact = false,
  maxEvents = 3,
}) => {
  const { isAuthenticated, upcomingEvents, isLoading, fetchEvents } = useCalendarStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  const displayEvents = upcomingEvents.slice(0, maxEvents);

  const formatEventTime = (event: CalendarEvent) => {
    if (!event.start.dateTime && !event.start.date) {
      return 'Time not set';
    }

    const startStr = (event.start.dateTime || event.start.date) as string;
    const startDate = new Date(startStr);

    return startDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!isAuthenticated) {
    return (
      <ModernCard glassy elevated style={styles.container}>
        <Text style={styles.title}>Calendario</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Conecta tu Google Calendar para ver eventos
          </Text>
        </View>
      </ModernCard>
    );
  }

  if (isLoading) {
    return (
      <ModernCard glassy elevated style={styles.container}>
        <Text style={styles.title}>Cargando eventos...</Text>
      </ModernCard>
    );
  }

  return (
    <ModernCard glassy elevated style={styles.container}>
      <Text style={styles.title}>Próximos Eventos</Text>

      {displayEvents.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay eventos próximos</Text>
        </View>
      ) : (
        <FlatList
          data={displayEvents}
          keyExtractor={(item) => item.id || Math.random().toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.eventItem} activeOpacity={0.7}>
              <View style={styles.eventTimeDot}>
                <View style={styles.dot} />
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {item.summary}
                </Text>
                <Text style={styles.eventTime}>
                  {formatEventTime(item)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  placeholder: {
    paddingVertical: 24,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  empty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  eventTimeDot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
