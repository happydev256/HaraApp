import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BASE_RADIUS = 120;
const CENTER = 150; 
const INNER_STROKE = 7;
const OUTER_STROKE = 10;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function MeditationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedDuration = parseInt(params.duration as string) || 5;
  const totalSeconds = selectedDuration * 60;
  
  const [selectedAtmosphere, setSelectedAtmosphere] = useState((params.atmosphere as string) || 'FOREST');
  const [modalVisible, setModalVisible] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  const sound = useRef(new Audio.Sound());
  const sessionProgress = useSharedValue(0);

  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
        loadAndPlaySound(selectedAtmosphere);
      } catch (e) { console.log(e); }
    }
    setupAudio();
    return () => { sound.current.unloadAsync().catch(() => {}); };
  }, [selectedAtmosphere]);

  useEffect(() => {
    sound.current.setVolumeAsync(volume).catch(() => {});
  }, [volume]);

  async function loadAndPlaySound(atmosphere: string) {
    try {
      const status = await sound.current.getStatusAsync();
      if (status.isLoaded) await sound.current.unloadAsync();

      let audioFile;
      switch (atmosphere) {
        case 'FOREST': audioFile = require('../../assets/music/forest.mp3'); break;
        case 'COSMIC': audioFile = require('../../assets/music/cosmic.mp3'); break;
        default: audioFile = require('../../assets/music/windscape.mp3');
      }
      await sound.current.loadAsync(audioFile);
      await sound.current.setVolumeAsync(volume);
      await sound.current.setIsLoopingAsync(true);
      await sound.current.playAsync();
    } catch (error) { console.log('Audio Error:', error); }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.replace('/success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    sessionProgress.value = withTiming((totalSeconds - remainingSeconds) / totalSeconds, { duration: 500 });
  }, [remainingSeconds]);

  const animatedProgressProps = useAnimatedProps(() => {
    const circumference = 2 * Math.PI * BASE_RADIUS;
    return {
      strokeDashoffset: circumference - (circumference * sessionProgress.value),
    };
  });

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <View /> 
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.controlText}>🎵</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.circleWrapper}>
        <Svg width={300} height={300} style={styles.svg}>
          <Circle cx={CENTER} cy={CENTER} r={BASE_RADIUS} stroke="#1a1a1a" strokeWidth={INNER_STROKE} fill="none" />
          <AnimatedCircle
            cx={CENTER} cy={CENTER} r={BASE_RADIUS} stroke="#fff" strokeWidth={OUTER_STROKE} fill="none"
            animatedProps={animatedProgressProps}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * BASE_RADIUS}
            rotation="-90"
            origin={`${CENTER}, ${CENTER}`}
          />
        </Svg>
        <View style={styles.circle}>
          <Text style={styles.label}>MEDITATING</Text>
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        </View>
      </View>

      {/* FAST FORWARD FOR TESTING */}
      <View style={{ width: 200, marginBottom: 50, opacity: 0.4 }}>
          <Text style={{ color: '#fff', fontSize: 10, textAlign: 'center', marginBottom: 5 }}>DEBUG: SKIP TO END</Text>
          <Slider
            minimumValue={0}
            maximumValue={totalSeconds}
            value={totalSeconds - remainingSeconds}
            onValueChange={(val) => setRemainingSeconds(totalSeconds - Math.floor(val))}
            minimumTrackTintColor="#ff4444"
          />
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={() => router.replace('/')}>
        <Text style={styles.exitButtonText}>EXIT</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>MUSIC CONTROL</Text>
            {['WIND', 'FOREST', 'COSMIC'].map(type => (
              <TouchableOpacity key={type} style={[styles.modalButton, selectedAtmosphere === type && styles.activeButton]} onPress={() => setSelectedAtmosphere(type)}>
                <Text style={styles.modalButtonText}>{type}</Text>
              </TouchableOpacity>
            ))}
            <Slider style={{ width: '100%', height: 40 }} minimumValue={0} maximumValue={1} value={volume} onValueChange={setVolume} minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#333333" thumbTintColor="#FFFFFF" />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}><Text style={styles.closeButtonText}>CLOSE</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020403' },
  topControls: { position: 'absolute', top: 60, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30 },
  controlText: { fontSize: 22, color: '#fff' },
  circleWrapper: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
  svg: { position: 'absolute' },
  circle: { alignItems: 'center' },
  label: { color: '#fff', letterSpacing: 4, fontSize: 12, opacity: 0.5, marginBottom: 5 },
  timerText: { fontSize: 54, fontWeight: '300', color: '#fff' },
  exitButton: { paddingVertical: 15, paddingHorizontal: 40, backgroundColor: '#1a1a1a', borderRadius: 25 },
  exitButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 30, alignItems: 'center' },
  modalTitle: { color: '#fff', marginBottom: 20 },
  modalButton: { borderWidth: 1, borderColor: '#333', padding: 15, width: '100%', borderRadius: 10, marginBottom: 10 },
  activeButton: { borderColor: '#fff' },
  modalButtonText: { color: '#fff' },
  closeButton: { marginTop: 20 },
  closeButtonText: { color: '#888' }
});