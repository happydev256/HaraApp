import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function MeditationPickupScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState(10); 
  const [atmosphere, setAtmosphere] = useState('COSMIC');

  const previewSound = useRef(new Audio.Sound());
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const atmospheres = [
    { id: 'WIND', label: 'WIND', icon: '🌬️', file: require('../../assets/music/windscape.mp3') },
    { id: 'FOREST', label: 'FOREST', icon: '🌲', file: require('../../assets/music/forest.mp3') },
    { id: 'COSMIC', label: 'COSMIC', icon: '✨', file: require('../../assets/music/cosmic.mp3') },
  ];

  async function playPreview(type: string) {
    try {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      await previewSound.current.unloadAsync().catch(() => {});
      const selected = atmospheres.find(a => a.id === type);
      if (selected) {
        await previewSound.current.loadAsync(selected.file);
        await previewSound.current.playAsync();
        previewTimerRef.current = setTimeout(async () => {
          const status = await previewSound.current.getStatusAsync();
          if (status.isLoaded) { await previewSound.current.stopAsync().catch(() => {}); }
        }, 4000) as ReturnType<typeof setTimeout>;
      }
    } catch (error) { console.log("Preview error:", error); }
  }

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewSound.current.unloadAsync().catch(() => {});
    };
  }, []);

  const handleStartSession = async () => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    await previewSound.current.unloadAsync().catch(() => {});
    router.push({ pathname: '/sessions/meditation', params: { duration, atmosphere } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
      <View style={styles.topLabelContainer}>
        <Text style={styles.headerLabel}>SET MEDITATION DURATION</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.durationSection}>
          <View style={styles.timeCircle}>
            <Text style={styles.mainDurationText}>{duration}</Text>
            <Text style={styles.minutesLabel}>MINUTES</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={60}
            step={5}
            value={duration}
            onValueChange={(val) => setDuration(val)}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#222"
            thumbTintColor="#FFFFFF"
          />
        </View>

        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>SELECT SOUNDSCAPE</Text>
          <View style={styles.atmosphereRow}>
            {atmospheres.map((item) => (
              <TouchableOpacity key={item.id} style={styles.atmosphereItem} onPress={() => { setAtmosphere(item.id); playPreview(item.id); }}>
                <View style={[styles.iconSquare, atmosphere === item.id && styles.activeSquare]}>
                  <Text style={styles.iconEmoji}>{item.icon}</Text>
                </View>
                <Text style={[styles.atmosphereLabel, atmosphere === item.id && styles.activeLabel]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Text style={styles.startButtonText}>BEGIN JOURNEY</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#020403', paddingHorizontal: 30 },
  topLabelContainer: { marginTop: 60, alignItems: 'center' },
  headerLabel: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 3, opacity: 0.4 },
  mainContent: { flex: 1, width: '100%' },
  durationSection: { alignItems: 'center', marginVertical: 30 },
  timeCircle: { width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mainDurationText: { color: '#fff', fontSize: 90, fontWeight: '200', lineHeight: 90 },
  minutesLabel: { color: '#fff', fontSize: 10, letterSpacing: 5, opacity: 0.3, marginTop: -5 },
  slider: { width: '100%', height: 40 },
  sectionWrapper: { marginBottom: 40 },
  sectionTitle: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 3, marginBottom: 20, textAlign: 'center', opacity: 0.4 },
  atmosphereRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  atmosphereItem: { alignItems: 'center' },
  iconSquare: { width: 64, height: 64, backgroundColor: '#0A0A0A', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1.5, borderColor: '#1A1A1A' },
  activeSquare: { borderColor: '#fff', backgroundColor: '#151515' },
  iconEmoji: { fontSize: 24 },
  atmosphereLabel: { color: '#444', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  activeLabel: { color: '#fff' },
  buttonWrapper: { marginTop: 20, width: '100%', alignItems: 'center' },
  startButton: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', alignItems: 'center' },
  startButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  cancelButton: { padding: 15 },
  cancelText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 2, opacity: 0.3 },
});