import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function PickupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Identifies if we came from 'BREATHING' or 'MEDITATION'
  const sessionType = params.type as string || 'SESSION'; 

  const [duration, setDuration] = useState(3);
  const [atmosphere, setAtmosphere] = useState('WIND');
  const previewSound = useRef(new Audio.Sound());
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIXED PATHS: These now match your specific folder structure
  const atmospheres = [
    { id: 'WIND', label: 'WIND', icon: '🌬️', file: require('../assets/music/windscape.mp3') },
    { id: 'FOREST', label: 'FOREST', icon: '🌲', file: require('../assets/music/forest.mp3') },
    { id: 'COSMIC', label: 'COSMIC', icon: '✨', file: require('../assets/music/cosmic.mp3') },
  ];

  async function playPreview(type: string) {
    try {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      await previewSound.current.unloadAsync().catch(() => {});
      
      const selected = atmospheres.find(a => a.id === type);
      if (selected) {
        await previewSound.current.loadAsync(selected.file);
        await previewSound.current.playAsync();
        
        // Stops ghost audio after 6 seconds
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

    // Redirects to the correct session file based on button clicked
    const targetPath = sessionType === 'MEDITATION' 
      ? '/sessions/meditation' 
      : '/sessions/breathing';

    router.push({ 
      pathname: targetPath, 
      params: { duration, atmosphere } 
    });
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020403', alignItems: 'center', paddingHorizontal: 45 },
  topLabelContainer: { position: 'absolute', top: 60 },
  headerLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, opacity: 0.8 },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 40 },
  mainDurationText: { color: '#fff', fontSize: 80, fontWeight: 'bold', letterSpacing: 2 },
  minutesLabel: { color: '#fff', fontSize: 14, letterSpacing: 3, marginBottom: 40, opacity: 0.6 },
  sliderContainer: { width: '100%', marginBottom: 50 },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, marginBottom: 25 },
  atmosphereRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 50 },
  atmosphereItem: { alignItems: 'center', width: '30%' },
  iconSquare: { width: 50, height: 50, backgroundColor: '#1a1a1a', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  activeSquare: { borderColor: '#fff', backgroundColor: '#222' },
  iconEmoji: { fontSize: 20 },
  atmosphereLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  activeLabel: { color: '#fff' },
  startButton: { borderWidth: 1, borderColor: '#fff', borderRadius: 12, padding: 16, width: '100%', marginBottom: 20, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  cancelButton: { marginTop: 10 },
  cancelText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, opacity: 0.5 },
});