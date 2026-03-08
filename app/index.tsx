import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [streakCount, setStreakCount] = useState(0);
  const [journeyPercent, setJourneyPercent] = useState(0); // New state for the Journey Ring

  // Updated function to load all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem('completed_sessions');
      if (savedData !== null) {
        const sessionsObj = JSON.parse(savedData);
        
        if (Array.isArray(sessionsObj)) {
          setStreakCount(0);
          setJourneyPercent(0);
          return;
        }

        const dates = Object.keys(sessionsObj);
        
        // 1. ALL-TIME STREAK
        setStreakCount(dates.length);

        // 2. JOURNEY RING (MONTHLY LOGIC)
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JS months are 0-indexed
        const dayOfMonth = now.getDate();

        // Format month for comparison (e.g., "2026-03")
        const monthString = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
        
        // Count unique days practiced this specific month
        const daysPracticedThisMonth = dates.filter(date => date.startsWith(monthString)).length;

        // Calculate percentage based on days passed so far this month
        // If today is the 8th and you practiced 8 days, you get 100%
        const calculatedPercent = dayOfMonth > 0 
          ? Math.min(Math.round((daysPracticedThisMonth / dayOfMonth) * 100), 100) 
          : 0;

        setJourneyPercent(calculatedPercent);
      }
    } catch (error) {
      console.log("Error loading dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadDashboardData();
    }
  }, [isFocused, loadDashboardData]);

  const startFlow = (type: 'BREATHING' | 'MEDITATION') => {
    if (type === 'BREATHING') {
      router.push('/pickups/pickup');
    } else {
      router.push('/pickups/meditation-pickup');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. DYNAMIC STREAK */}
      <TouchableOpacity 
        style={styles.streakContainer} 
        onPress={() => router.push('/journey')}
      >
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakText}>
          {streakCount} {streakCount === 1 ? 'DAY' : 'DAYS'} STREAK
        </Text>
      </TouchableOpacity>

      <View style={styles.mainContent}>
        <Text style={styles.title}>HARA</Text>

        <TouchableOpacity 
          style={styles.ritualButton}
          onPress={() => startFlow('BREATHING')}
        >
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>●</Text>
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>HARA RITUAL</Text>
            <Text style={styles.buttonSubtitle}>DEEP RHYTHMIC BREATHING</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.ritualButton}
          onPress={() => startFlow('MEDITATION')}
        >
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>☾</Text>
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>MEDITATION</Text>
            <Text style={styles.buttonSubtitle}>STILLNESS AND SILENCE</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.dashboardTitle}>VITALITY DASHBOARD</Text>
        
        <View style={styles.statsContainer}>
          {/* JOURNEY RING - Now dynamic based on Monthly Progress */}
          <TouchableOpacity 
            style={styles.statItem} 
            onPress={() => router.push('/journey')}
          >
            <View style={styles.statCircle}>
              <Text style={styles.statText}>{journeyPercent}%</Text>
            </View>
            <Text style={styles.statLabel}>JOURNEY</Text>
          </TouchableOpacity>

          {/* FOCUS RING - Set to 0% for now */}
          <View style={styles.statItem}>
            <View style={styles.statCircle}><Text style={styles.statText}>0%</Text></View>
            <Text style={styles.statLabel}>FOCUS</Text>
          </View>

          {/* CHALLENGES RING - Set to 0% for now */}
          <View style={styles.statItem}>
            <View style={styles.statCircle}><Text style={styles.statText}>0%</Text></View>
            <Text style={styles.statLabel}>CHALLENGES</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020403',
    alignItems: 'center',
    paddingHorizontal: 45,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 60,
    zIndex: 1,
  },
  streakEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  streakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    width: '100%',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
    letterSpacing: 6,
  },
  ritualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  iconPlaceholder: {
    width: 42,
    height: 42,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
    color: '#fff',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonSubtitle: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  dashboardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 25,
    letterSpacing: 2,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});