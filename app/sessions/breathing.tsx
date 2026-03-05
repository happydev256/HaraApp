import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
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

  // --- AUTO-SNAP LOGIC ---
  // Calculates total duration so the session ALWAYS ends on a completed INHALE
  const totalSeconds = (() => {
    const requested = (parseInt(params.duration as string) || 3) * 60;
    const nearestCycles = Math.round(requested / 16);
    // (Cycles * 16) ends on HOLD. Adding 4s ends it exactly after the final INHALE.
    return (nearestCycles * 16) + 4; 
  })();

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [phaseIndex, setPhaseIndex] = useState(0); 
  const [phaseTimer, setPhaseTimer] = useState(4);
  
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [atmosphere, setAtmosphere] = useState(params.atmosphere as string || 'WIND');

  const sound = useRef(new Audio.Sound());
  const isTransitioning = useRef(false); 
  const breathScale = useSharedValue(1);
  const sessionProgress = useSharedValue(0);

  // Audio Logic
  useEffect(() => {
    async function initAudio() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
        loadAtmosphere(atmosphere);
      } catch (e) { console.log("Audio Init Error:", e); }
    }
    initAudio();
    return () => { sound.current.unloadAsync().catch(() => {}); };
  }, [atmosphere]);

  async function loadAtmosphere(type: string) {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    try {
      const status = await sound.current.getStatusAsync();
      if (status.isLoaded) await sound.current.unloadAsync();
      
      let file = require('../../assets/music/windscape.mp3');
      if (type === 'FOREST') file = require('../../assets/music/forest.mp3');
      if (type === 'COSMIC') file = require('../../assets/music/cosmic.mp3');
      
      await sound.current.loadAsync(file);
      await sound.current.setIsLoopingAsync(true);
      await sound.current.setVolumeAsync(volume);
      await sound.current.playAsync();
    } catch (e) { console.log("Load Error:", e); }
    finally { isTransitioning.current = false; }
  }

  // --- IMPROVED UNIFIED TIMER ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Handle the Main Session Timer
      setRemainingSeconds((prev) => {
        if (prev <= 1) return 0; // Hold at 0 until Phase Timer clears
        return prev - 1;
      });

      // 2. Handle the Phase (4s) Timer
      setPhaseTimer((prev) => {
        if (prev <= 1) {
          // CHECK FOR END OF SESSION:
          // If main timer is 0 (or almost 0) and we just finished the 4s phase...
          setRemainingSeconds((currentTotal) => {
            if (currentTotal <= 0) {
              clearInterval(interval);
              router.replace('/success');
            }
            return currentTotal;
          });

          setPhaseIndex((idx) => (idx + 1) % 4);
          if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hapticsEnabled, totalSeconds]);

  // Animation Logic
  useEffect(() => {
    const currentPhase = PHASES[phaseIndex];
    if (currentPhase === 'INHALE') {
      breathScale.value = withTiming(1.4, { duration: 4000, easing: Easing.out(Easing.poly(4)) });
    } else if (currentPhase === 'EXHALE') {
      breathScale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.quad) });
    }
    // Update global progress bar
    sessionProgress.value = withTiming((totalSeconds - remainingSeconds) / totalSeconds, { duration: 1000 });
  }, [phaseIndex, remainingSeconds]);

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
        
        {/* DEBUG SLIDER - Keeps your feature intact */}
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
              onValueChange={(v) => { setVolume(v); sound.current.setVolumeAsync(v); }}
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