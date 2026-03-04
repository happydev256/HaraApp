import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

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

export default function SuccessScreen() {
  const router = useRouter();
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
          <Text style={styles.sparkleIcon}>✨</Text>
          <Text style={styles.title}>WELL DONE</Text>
          <View style={styles.underline} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{randomQuote}"</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
          <Text style={styles.sectionLabel}>HOW DO YOU FEEL?</Text>
          <View style={styles.emojiRow}>
            {['🧘\nCalm', '🔋\nEnergized', '☁️\nFloating'].map((item, index) => (
              <TouchableOpacity key={index} style={styles.emojiButton}>
                <Text style={styles.emojiText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1100)} style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>JOURNEY ON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/journey')}>
            <Text style={styles.secondaryButtonText}>VIEW PROGRESS</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020403' },
  scrollContent: { padding: 30, alignItems: 'center', paddingTop: 80, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  sparkleIcon: { fontSize: 40, marginBottom: 10 },
  title: { color: '#fff', fontSize: 32, fontWeight: '200', letterSpacing: 8 },
  underline: { width: 50, height: 2, backgroundColor: '#fff', marginTop: 15, opacity: 0.3 },
  quoteCard: { backgroundColor: '#111', padding: 30, borderRadius: 25, width: '100%', marginBottom: 40, borderWidth: 1, borderColor: '#222' },
  quoteText: { color: '#fff', fontSize: 18, fontStyle: 'italic', textAlign: 'center', lineHeight: 28, opacity: 0.8 },
  section: { width: '100%', marginBottom: 35 },
  sectionLabel: { color: '#fff', fontSize: 12, letterSpacing: 3, opacity: 0.5, textAlign: 'center', marginBottom: 20 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiButton: { backgroundColor: '#111', width: width * 0.25, paddingVertical: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  emojiText: { color: '#fff', textAlign: 'center', fontSize: 12, lineHeight: 20 },
  footer: { width: '100%', marginTop: 20, alignItems: 'center' },
  primaryButton: { backgroundColor: '#fff', width: '100%', padding: 20, borderRadius: 30, alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#000', fontWeight: 'bold', letterSpacing: 2 },
  secondaryButton: { borderWidth: 1, borderColor: '#333', width: '100%', padding: 18, borderRadius: 30, alignItems: 'center', marginBottom: 25 },
  secondaryButtonText: { color: '#fff', letterSpacing: 2, fontSize: 13 }
});