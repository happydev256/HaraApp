import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const QUOTES = [
  "One breath is all it takes.", "Be the silence among the noise.", "Peace is a practice, not a destination.",
  "Your breath is your anchor.", "Stillness is where the soul speaks.", "The mind is a superb instrument if used rightly.",
  "Quiet the mind, and the soul will speak.", "Breathe in peace, breathe out stress.", "Every moment is a fresh beginning.",
  "Smile, breathe and go slowly.", "The soul always knows what to do to heal itself.", "Flow with whatever may happen.",
  "Calm is a superpower.", "Within you, there is a stillness and a sanctuary.", "Feelings are just clouds in a windy sky.",
  "Do not let the behavior of others destroy your inner peace.", "Master your breath, master your life.",
  "Mindfulness isn't difficult, we just need to remember to do it.", "Surrender to what is. Let go of what was.",
  "Radiate boundless love towards the entire world.", "Your goal is not to battle with the mind, but to witness it.",
  "To understand everything is to forgive everything.", "Patience is the shortest path to a sharp mind.",
  "The present moment is the only time over which we have dominion.", "He who is rooted in peace cannot be shaken.",
  "Silence is the sleep that nourishes wisdom.", "Nothing can bring you peace but yourself.",
  "The more tranquil a man becomes, the greater is his success.", "Wisdom comes with the ability to be still.",
  "Tension is who you think you should be. Relaxation is who you are.", "Breath is the bridge which connects life to consciousness."
];

const MoodButton = ({ item, index, isSelected, onPress }: any) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isSelected ? 1.08 : 1) }],
  }));

  return (
    <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.9}>
      <Animated.View style={[
        styles.emojiButton, 
        isSelected && styles.selectedEmojiButton,
        animatedStyle
      ]}>
        <View style={styles.iconContainer}>
            <Text style={styles.emojiIcon}>{item.emoji}</Text>
        </View>
        <Text style={[styles.emojiLabel, isSelected && styles.selectedEmojiLabel]}>
          {item.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0); 
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const sessionType = (params.type as string) || "HARA SESSION";
  const sessionDuration = (params.duration as string) || "10";

  useEffect(() => {
    const saveSession = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const existingData = await AsyncStorage.getItem('completed_sessions');
        
        let sessions = existingData ? JSON.parse(existingData) : {};

        // 1. Handle old data formats
        if (Array.isArray(sessions)) {
            sessions = {};
        }

        // 2. Multi-session Fix: Initialize the day as an array if it isn't one
        if (!Array.isArray(sessions[today])) {
            // If there's an old single-object session, move it into the first slot of the array
            const oldSingleSession = sessions[today];
            sessions[today] = oldSingleSession ? [oldSingleSession] : [];
        }

        // 3. Add the current session to the list for today
        sessions[today].push({
          type: sessionType,
          duration: sessionDuration,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        await AsyncStorage.setItem('completed_sessions', JSON.stringify(sessions));
        
        // Streak is the count of unique days practiced
        setCurrentStreak(Object.keys(sessions).length);
      } catch (e) {
        console.error("Error saving session", e);
      }
    };

    saveSession();
  }, [sessionType, sessionDuration]); 

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f1715', '#020403']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.header}>
          <Animated.Text entering={ZoomIn.delay(400)} style={styles.sparkleIcon}>✨</Animated.Text>
          <Text style={styles.title}>WELL DONE</Text>
          <View style={styles.underline} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600)} style={styles.statsRow}>
            <View style={styles.statItem}>
               <Text style={styles.statValue}>{sessionDuration}</Text>
               <Text style={styles.statLabel}>MINS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
               <Text style={styles.statValue}>{currentStreak}</Text>
               <Text style={styles.statLabel}>STREAK</Text>
            </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(800)} style={styles.quoteCard}>
          <Text style={styles.quoteText}>“{randomQuote}”</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000)} style={styles.section}>
          <Text style={styles.sectionLabel}>HOW DO YOU FEEL?</Text>
          <View style={styles.emojiRow}>
            {[
              { label: 'Calm', emoji: '🧘' },
              { label: 'Energized', emoji: '🔋' },
              { label: 'Floating', emoji: '☁️' }
            ].map((item, index) => (
              <MoodButton 
                key={index} 
                item={item} 
                index={index} 
                isSelected={selectedMood === index}
                onPress={setSelectedMood}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1300)} style={styles.footer}>
          {/* Navigation Fix: use replace to reset the stack */}
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.replace('/journey')}
          >
            <LinearGradient 
              colors={['#fff', '#e0e0e0']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 1}} 
              style={styles.gradientButton}
            >
              <Text style={styles.primaryButtonText}>VIEW JOURNEY</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.replace('/')}
          >
            <Text style={styles.secondaryButtonText}>EXIT TO HOME</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020403' },
  scrollContent: { padding: 25, alignItems: 'center', paddingTop: 60, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  sparkleIcon: { fontSize: 42, marginBottom: 10 },
  title: { color: '#fff', fontSize: 28, fontWeight: '300', letterSpacing: 10, textAlign: 'center' },
  underline: { width: 40, height: 1, backgroundColor: '#fff', marginTop: 15, opacity: 0.2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, opacity: 0.8 },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '600' },
  statLabel: { color: '#fff', fontSize: 10, letterSpacing: 2, opacity: 0.5, marginTop: 4 },
  statDivider: { width: 1, height: 20, backgroundColor: '#fff', opacity: 0.2 },
  quoteCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 35, borderRadius: 30, width: '100%', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  quoteText: { color: '#fff', fontSize: 19, fontStyle: 'italic', textAlign: 'center', lineHeight: 30, fontWeight: '300' },
  section: { width: '100%', marginBottom: 35 },
  sectionLabel: { color: '#fff', fontSize: 11, letterSpacing: 3, opacity: 0.4, textAlign: 'center', marginBottom: 25 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiButton: { backgroundColor: 'rgba(255, 255, 255, 0.03)', width: width * 0.27, paddingVertical: 22, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  selectedEmojiButton: { borderColor: 'rgba(255, 255, 255, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  iconContainer: { marginBottom: 10, height: 30, justifyContent: 'center' },
  emojiIcon: { fontSize: 26 },
  emojiLabel: { color: '#fff', fontSize: 10, letterSpacing: 1, opacity: 0.5 },
  selectedEmojiLabel: { opacity: 1, fontWeight: '700' },
  footer: { width: '100%', marginTop: 10, alignItems: 'center' },
  primaryButton: { width: '100%', borderRadius: 35, overflow: 'hidden', marginBottom: 15 },
  gradientButton: { padding: 22, alignItems: 'center' },
  primaryButtonText: { color: '#000', fontWeight: '700', letterSpacing: 3, fontSize: 14 },
  secondaryButton: { width: '100%', padding: 18, alignItems: 'center' },
  secondaryButtonText: { color: '#fff', letterSpacing: 2, fontSize: 12, opacity: 0.6 }
});