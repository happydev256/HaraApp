import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function PickupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const sessionType = params.type as string || 'SESSION'; 

  const [duration, setDuration] = useState(3);
  const [atmosphere, setAtmosphere] = useState('WIND');
  // New State: Hara Duration (Seconds per phase)
  const [haraSeconds, setHaraSeconds] = useState(4); 

  const previewSound = useRef(new Audio.Sound());
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const atmospheres = [
    { id: 'WIND', label: 'WIND', icon: '🌬️', file: require('../assets/music/windscape.mp3') },
    { id: 'FOREST', label: 'FOREST', icon: '🌲', file: require('../assets/music/forest.mp3') },
    { id: 'COSMIC', label: 'COSMIC', icon: '✨', file: require('../assets/music/cosmic.mp3') },
  ];

  const haraOptions = [3, 4, 5, 6, 7, 8, 9, 10];

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
          if (status.isLoaded) {
            await previewSound.current.stopAsync().catch(() => {});
          }
        }, 6000) as ReturnType<typeof setTimeout>;
      }
    } catch (error) {
      console.log("Preview error:", error);
    }
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

    const targetPath = sessionType === 'MEDITATION' 
      ? '/sessions/meditation' 
      : '/sessions/breathing';

    router.push({ 
      pathname: targetPath, 
      params: { 
        duration, 
        atmosphere,
        haraTime: haraSeconds // Passing the custom hara time to the next screen
      } 
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topLabelContainer}>
        <Text style={styles.headerLabel}>SET {sessionType} DURATION</Text>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.mainDurationText}>{duration}</Text>
        <Text style={styles.minutesLabel}>MINUTES</Text>

        <View style={styles.sliderContainer}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={3}
            maximumValue={30}
            step={1}
            value={duration}
            onValueChange={(val) => setDuration(val)}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#333333"
            thumbTintColor="#FFFFFF"
          />
        </View>

        {/* --- NEW HARA SELECTION SECTION --- */}
        <Text style={styles.sectionTitle}>BREATH PACE (HARA)</Text>
        <View style={styles.haraRow}>
          {haraOptions.map((sec) => (
            <TouchableOpacity 
              key={sec} 
              onPress={() => setHaraSeconds(sec)}
              style={[
                styles.haraChip,
                haraSeconds === sec && styles.activeHaraChip
              ]}
            >
              <Text style={[
                styles.haraChipText,
                haraSeconds === sec && styles.activeHaraText
              ]}>{sec}s</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.haraSubLabel}>Seconds per inhale / hold / exhale</Text>

        {/* --- ATMOSPHERE SECTION --- */}
        <Text style={styles.sectionTitle}>SELECT ATMOSPHERE</Text>
        <View style={styles.atmosphereRow}>
          {atmospheres.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.atmosphereItem}
              onPress={() => {
                setAtmosphere(item.id);
                playPreview(item.id);
              }}
            >
              <View style={[
                styles.iconSquare, 
                atmosphere === item.id && styles.activeSquare
              ]}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>
              <Text style={[
                styles.atmosphereLabel,
                atmosphere === item.id && styles.activeLabel
              ]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStartSession}
        >
          <Text style={styles.startButtonText}>START SESSION</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#020403', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 40 },
  topLabelContainer: { marginTop: 60, marginBottom: 20 },
  headerLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 2, opacity: 0.6 },
  mainContent: { flex: 1, alignItems: 'center', width: '100%' },
  mainDurationText: { color: '#fff', fontSize: 100, fontWeight: '200', letterSpacing: 2 },
  minutesLabel: { color: '#fff', fontSize: 12, letterSpacing: 4, marginBottom: 30, opacity: 0.4 },
  sliderContainer: { width: '100%', marginBottom: 40 },
  
  sectionTitle: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 3, marginBottom: 20, alignSelf: 'center', opacity: 0.7 },
  
  // Hara Styles
  haraRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 10 },
  haraChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1a1a1a', backgroundColor: '#080808', minWidth: 50, alignItems: 'center' },
  activeHaraChip: { borderColor: '#fff', backgroundColor: '#fff' },
  haraChipText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  activeHaraText: { color: '#000' },
  haraSubLabel: { color: '#fff', fontSize: 9, opacity: 0.3, letterSpacing: 1, marginBottom: 40 },

  atmosphereRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 50 },
  atmosphereItem: { alignItems: 'center', width: '30%' },
  iconSquare: { width: 55, height: 55, backgroundColor: '#080808', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#1a1a1a' },
  activeSquare: { borderColor: '#fff', backgroundColor: '#111' },
  iconEmoji: { fontSize: 22 },
  atmosphereLabel: { color: '#444', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  activeLabel: { color: '#fff' },
  
  startButton: { backgroundColor: '#fff', borderRadius: 16, padding: 18, width: '100%', marginBottom: 20, alignItems: 'center' },
  startButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  cancelButton: { marginTop: 10 },
  cancelText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, opacity: 0.4 },
});