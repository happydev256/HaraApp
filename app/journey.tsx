import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router'; // Added router for exit path
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function JourneyScreen() {
  const router = useRouter(); // Hook for navigation
  const [streakCount, setStreakCount] = useState(0);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [selectedDaySessions, setSelectedDaySessions] = useState<any[]>([]); // Changed to Array to support multi-session
  const [selectedDateLabel, setSelectedDateLabel] = useState("");
  const isFocused = useIsFocused();

  const loadProgress = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem('completed_sessions');
      if (savedData !== null) {
        const sessionsObj = JSON.parse(savedData);
        const dates = Object.keys(sessionsObj);
        
        const calendarFormat: { [key: string]: any } = {};
        dates.forEach((dateString: string) => {
          calendarFormat[dateString] = { 
            selected: true, 
            selectedColor: '#4A90E2', 
            marked: true, 
            dotColor: '#fff' 
          };
        });

        setMarkedDates(calendarFormat);
        setStreakCount(dates.length);
      }
    } catch (error) {
      console.log("Error loading progress:", error);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadProgress();
    }
  }, [isFocused, loadProgress]);

  const onDayPress = async (day: any) => {
    const savedData = await AsyncStorage.getItem('completed_sessions');
    if (savedData) {
      const sessions = JSON.parse(savedData);
      const dayData = sessions[day.dateString];
      
      setSelectedDateLabel(day.dateString);
      // Logic to handle both single objects (old data) and arrays (new data)
      if (dayData) {
        setSelectedDaySessions(Array.isArray(dayData) ? dayData : [dayData]);
      } else {
        setSelectedDaySessions([]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.title}>YOUR JOURNEY</Text>
          <View style={styles.underline} />
        </View>
        
        <View style={styles.calendarWrapper}>
          <Calendar
            style={styles.calendar}
            onDayPress={onDayPress}
            markedDates={{
              ...markedDates,
              [selectedDateLabel]: { 
                ...markedDates[selectedDateLabel], 
                selected: true, 
                selectedColor: selectedDaySessions.length > 0 ? '#4A90E2' : '#333',
                customStyles: {
                  container: {
                    borderWidth: 2,
                    borderColor: '#fff'
                  }
                }
              }
            }}
            theme={{
              backgroundColor: '#020403',
              calendarBackground: '#020403',
              textSectionTitleColor: '#777',
              dayTextColor: '#fff',
              todayTextColor: '#4A90E2',
              monthTextColor: '#fff',
              arrowColor: '#4A90E2',
              textDisabledColor: '#222',
              selectedDayTextColor: '#fff',
              textMonthFontWeight: 'bold',
              textDayHeaderFontSize: 12,
              textMonthFontSize: 20,
            }}
          />
          
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#4A90E2' }]} />
              <Text style={styles.legendText}>Session Completed</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailContainer}>
          {selectedDaySessions.length > 0 ? (
            // FIX: Map through the array to show ALL sessions for that day
            selectedDaySessions.map((session, index) => (
              <Animated.View 
                entering={FadeInDown.duration(400).delay(index * 100)} 
                key={`${selectedDateLabel}-${index}`}
                style={styles.detailCard}
              >
                <Text style={styles.detailDateText}>{selectedDateLabel} {session.completedAt ? `• ${session.completedAt}` : ''}</Text>
                <View style={styles.detailContent}>
                  <View>
                    <Text style={styles.detailType}>{session.type || "HARA SESSION"}</Text>
                    <Text style={styles.detailMeta}>{session.duration || "10"} MINS • COMPLETED</Text>
                  </View>
                  <Text style={styles.detailEmoji}>{session.type === 'Meditation' ? '🧘' : '✨'}</Text>
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.statsCard}>
              <View style={styles.statCircle}>
                <Text style={styles.streakNumber}>{streakCount}</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.info}>DAY STREAK</Text>
                <Text style={styles.subInfo}>
                  {selectedDateLabel ? "No session logged for this day." : "Tap a marked date to see details."}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* EXIT PATH FIX: Added button to return home and clear stack */}
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeButtonText}>BACK TO HOME</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020403' },
  headerContainer: { paddingTop: 40, paddingBottom: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 4, textTransform: 'uppercase' },
  underline: { width: 30, height: 2, backgroundColor: '#4A90E2', marginTop: 10 },
  calendarWrapper: { paddingHorizontal: 20 },
  calendar: { borderWidth: 1, borderColor: '#1A1A1A', borderRadius: 25, overflow: 'hidden', paddingBottom: 15 },
  legend: { flexDirection: 'row', marginTop: 15, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { color: '#666', fontSize: 12, letterSpacing: 1 },
  detailContainer: { paddingBottom: 20 }, // Adjusted for home button
  detailCard: { backgroundColor: '#0A0A0A', marginHorizontal: 20, marginTop: 15, borderRadius: 25, padding: 20, borderWidth: 1, borderColor: '#222' },
  detailDateText: { color: '#4A90E2', fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  detailContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailType: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  detailMeta: { color: '#666', fontSize: 12, marginTop: 4, fontWeight: '600' },
  detailEmoji: { fontSize: 30 },
  statsCard: { flexDirection: 'row', marginTop: 30, alignItems: 'center', padding: 25, backgroundColor: '#0A0A0A', marginHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: '#1A1A1A' },
  statCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  streakNumber: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  statTextContainer: { flex: 1 },
  info: { fontSize: 18, color: '#fff', fontWeight: 'bold', letterSpacing: 2 },
  subInfo: { fontSize: 13, color: '#555', marginTop: 4, lineHeight: 18 },
  homeButton: { marginHorizontal: 20, marginBottom: 40, marginTop: 20, padding: 18, backgroundColor: '#111', borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  homeButtonText: { color: '#fff', fontWeight: '700', letterSpacing: 2, opacity: 0.8 }
});