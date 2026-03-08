import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BASE_RADIUS = 100;
const INNER_STROKE = 7; 
const OUTER_STROKE = 10; 

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const PHASES = ['INHALE', 'HOLD', 'EXHALE', 'HOLD'];

export default function BreathingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // --- DYNAMIC HARA & SESSION LOGIC ---
  const haraTime = parseInt(params.haraTime as string) || 4;

  const totalSeconds = (() => {
    const requested = (parseInt(params.duration as string) || 3) * 60;
    const cycleLength = haraTime * 4; 
    const nearestCycles = Math.round(requested / cycleLength);
    return (nearestCycles * cycleLength) + haraTime; 
  })();

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [phaseIndex, setPhaseIndex] = useState(0); 
  const [phaseTimer, setPhaseTimer] = useState(haraTime);
  
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [atmosphere, setAtmosphere] = useState(params.atmosphere as string || 'WIND');

  const sound = useRef<Audio.Sound | null>(null); 
  const isTransitioning = useRef(false); 
  const breathScale = useSharedValue(1);
  const sessionProgress = useSharedValue(0);

  // --- NAVIGATION FIX ---
  // This useEffect handles the transition to the success screen safely
  useEffect(() => {
    if (remainingSeconds <= 0) {
      router.replace('/success');
    }
  }, [remainingSeconds]);

  // --- AUDIO & SCREEN STABILITY ---
  useEffect(() => {
    KeepAwake.activateKeepAwakeAsync();

    async function initAudio() {
      try {
        await Audio.setAudioModeAsync({ 
          playsInSilentModeIOS: true, 
          staysActiveInBackground: true, 
          shouldDuckAndroid: true,
        });
        await loadAtmosphere(atmosphere);
      } catch (e) { 
        console.warn("Audio Init Error:", e); 
      }
    }
    initAudio();

    return () => {
      KeepAwake.deactivateKeepAwake(); 
      if (sound.current) {
        sound.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (sound.current) loadAtmosphere(atmosphere);
  }, [atmosphere]);

  async function loadAtmosphere(type: string) {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      
      const newSound = new Audio.Sound();
      sound.current = newSound;

      let file = require('../../assets/music/windscape.mp3');
      if (type === 'FOREST') file = require('../../assets/music/forest.mp3');
      if (type === 'COSMIC') file = require('../../assets/music/cosmic.mp3');
      
      await newSound.loadAsync(file);
      await newSound.setIsLoopingAsync(true);
      await newSound.setVolumeAsync(volume);
      await newSound.playAsync();
    } catch (e) { 
      console.log("Load Error:", e); 
    } finally { 
      isTransitioning.current = false; 
    }
  }

  // --- DYNAMIC TIMER INTERVAL ---
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 0 ? 0 : prev - 1));

      setPhaseTimer((prev) => {
        if (prev <= 1) {
          setPhaseIndex((idx) => (idx + 1) % 4);
          if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          return haraTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval); 
  }, [hapticsEnabled, haraTime]);

  // --- DYNAMIC ANIMATION SYNC ---
  useEffect(() => {
    const currentPhase = PHASES[phaseIndex];
    const animDuration = haraTime * 1000;

    if (currentPhase === 'INHALE') {
      breathScale.value = withTiming(1.4, { duration: animDuration, easing: Easing.out(Easing.poly(4)) });
    } else if (currentPhase === 'EXHALE') {
      breathScale.value = withTiming(1, { duration: animDuration, easing: Easing.inOut(Easing.quad) });
    }
    sessionProgress.value = withTiming((totalSeconds - remainingSeconds) / totalSeconds, { duration: 1000 });
  }, [phaseIndex, remainingSeconds, haraTime, totalSeconds]);

  const baseRingProps = useAnimatedProps(() => ({
    r: BASE_RADIUS * breathScale.value,
  }));

  const progressRingProps = useAnimatedProps(() => {
    const dynamicRadius = BASE_RADIUS * breathScale.value;
    const circumference = 2 * Math.PI * dynamicRadius;
    return {
      r: dynamicRadius,
      strokeDasharray: circumference,
      strokeDashoffset: circumference - (circumference * sessionProgress.value),
    };
  });

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setHapticsEnabled(!hapticsEnabled)}>
          <Image 
            source={require('../../assets/images/whitevibrationsicon.png')} 
            style={[styles.musicIconImage, { opacity: hapticsEnabled ? 1 : 0.3 }]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image 
            source={require('../../assets/images/whitemusicicon.png')} 
            style={styles.musicIconImage} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.centerContainer}>
        <Svg width={width} height={width} style={styles.svg}>
          <AnimatedCircle 
            cx={width / 2} cy={width / 2} 
            stroke="#333" strokeWidth={INNER_STROKE} 
            fill="none" 
            animatedProps={baseRingProps} 
          />
          <AnimatedCircle 
            cx={width / 2} cy={width / 2} 
            stroke="#fff" strokeWidth={OUTER_STROKE} 
            fill="none" 
            animatedProps={progressRingProps} 
            strokeLinecap="round" 
            rotation="-90" origin={`${width / 2}, ${width / 2}`}
          />
        </Svg>
        
        <View style={styles.labelWrapper}>
          <Text style={styles.phaseLabel}>{PHASES[phaseIndex]}</Text>
          <Text style={styles.phaseCount}>{phaseTimer}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.mainTimer}>{formatTime(remainingSeconds)}</Text>
        
        <View style={{ width: 200, marginBottom: 20, opacity: 0.4 }}>
            <Text style={{ color: '#fff', fontSize: 10, textAlign: 'center', marginBottom: 5 }}>DEBUG: SKIP TO END</Text>
            <Slider
              minimumValue={0}
              maximumValue={totalSeconds}
              value={totalSeconds - remainingSeconds}
              onValueChange={(val) => setRemainingSeconds(totalSeconds - Math.floor(val))}
              minimumTrackTintColor="#ff4444"
            />
        </View>

        <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/')}>
          <Text style={styles.exitText}>EXIT</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ATMOSPHERE</Text>
            <View style={styles.musicOptions}>
              {['WIND', 'FOREST', 'COSMIC'].map((m) => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.mBtn, atmosphere === m && styles.mBtnActive]} 
                  onPress={() => setAtmosphere(m)}
                >
                  <Text style={styles.mBtnText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Slider 
              style={{ width: '100%', height: 40 }} 
              value={volume} 
              onValueChange={(v) => { 
                setVolume(v); 
                if (sound.current) sound.current.setVolumeAsync(v); 
              }}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#333"
              thumbTintColor="#fff"
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.doneBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020403', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40, paddingTop: 60, width: '100%', alignItems: 'center' },
  musicIconImage: { width: 28, height: 28, resizeMode: 'contain' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  svg: { position: 'absolute' },
  labelWrapper: { alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { color: '#fff', letterSpacing: 10, fontSize: 16, opacity: 0.5, marginBottom: 5 },
  phaseCount: { color: '#fff', fontSize: 100, fontWeight: '100' },
  footer: { alignItems: 'center', paddingBottom: 60 },
  mainTimer: { color: '#fff', fontSize: 32, fontWeight: '300', marginBottom: 20, opacity: 0.8 },
  exitBtn: { paddingVertical: 15, paddingHorizontal: 60, borderRadius: 40, backgroundColor: '#111', borderWidth: 1, borderColor: '#222' },
  exitText: { color: '#fff', fontWeight: 'bold', letterSpacing: 3, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#080808', padding: 40, borderRadius: 40, alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
  modalTitle: { color: '#fff', letterSpacing: 5, fontSize: 10, marginBottom: 30, opacity: 0.6 },
  musicOptions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  mBtn: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#222', minWidth: '30%', alignItems: 'center' },
  mBtnActive: { borderColor: '#fff', backgroundColor: '#111' },
  mBtnText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  doneBtnText: { color: '#fff', fontWeight: 'bold', marginTop: 40, letterSpacing: 2, fontSize: 13 }
});