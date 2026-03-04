import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function JourneyScreen() {
  // Mock data for logged sessions: {'YYYY-MM-DD': {marked: true}}
  const [markedDates, setMarkedDates] = useState({
    '2026-03-01': { marked: true, dotColor: '#fff', activeOpacity: 0 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YOUR JOURNEY</Text>
      
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#020403',
          calendarBackground: '#020403', // Dark background
          textSectionTitleColor: '#fff',
          dayTextColor: '#fff', // White text for days
          todayTextColor: '#4A90E2', // Highlight color for today
          monthTextColor: '#fff', // White text for month name
          arrowColor: '#fff', // White arrows
          textDisabledColor: '#555',
        }}
      />
      
      <Text style={styles.info}>
        STREAK: 14 DAYS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020403', // Dark theme background
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // White text
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 2,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 15,
    paddingBottom: 10,
  },
  info: {
    fontSize: 18,
    color: '#fff', // White text
    marginTop: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});