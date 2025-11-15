import { useCallback, useEffect, useRef, useState } from "react";

type TrackNodes = {
  buffer: AudioBuffer;
  gain: GainNode;
  panner: StereoPannerNode;
  filter: BiquadFilterNode;
  reverbSend: GainNode;
  source: AudioBufferSourceNode | null;
};

export type TrackInfo = {
  id: string;
  name: string;
  color: string;
  duration: number;
  volume: number;
  pan: number;
  lowpass: number;
  playbackRate: number;
  reverb: number;
  isPlaying: boolean;
};

export type MixerState = {
  tracks: TrackInfo[];
  masterVolume: number;
  masterMeter: number;
  isContextReady: boolean;
};

export type MixerActions = {
  addTrackFromUrl: (options: { name: string; url: string; color: string }) => Promise<void>;
  addTrackFromFile: (file: File, color?: string) => Promise<void>;
  toggleTrackPlayback: (id: string) => void;
  removeTrack: (id: string) => void;
  setTrackVolume: (id: string, value: number) => void;
  setTrackPan: (id: string, value: number) => void;
  setTrackLowpass: (id: string, cutoff: number) => void;
  setTrackPlaybackRate: (id: string, rate: number) => void;
  setTrackReverb: (id: string, amount: number) => void;
  setMasterVolume: (value: number) => void;
  stopAll: () => void;
  playAll: () => void;
  resumeContext: () => Promise<void>;
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const createImpulseResponse = (context: AudioContext, duration = 2.5, decay = 2) => {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const impulse = context.createBuffer(2, length, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
};

const pickColor = () => {
  const palette = [
    "from-rose-500 via-pink-500 to-fuchsia-500",
    "from-sky-500 via-cyan-500 to-blue-500",
    "from-emerald-500 via-teal-500 to-green-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-purple-500 via-violet-500 to-indigo-500",
  ];
  const index = Math.floor(Math.random() * palette.length);
  return palette[index];
};

export const useMixer = (): MixerState & MixerActions => {
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [masterVolume, setMasterVolumeState] = useState(0.8);
  const [masterMeter, setMasterMeter] = useState(0);
  const [isContextReady, setIsContextReady] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const reverbRef = useRef<{ convolver: ConvolverNode; gain: GainNode } | null>(null);
  const trackNodesRef = useRef<Map<string, TrackNodes>>(new Map());

  const masterVolumeRef = useRef(masterVolume);
  masterVolumeRef.current = masterVolume;

  const ensureAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    const context = new AudioContextCtor();
    audioContextRef.current = context;
    setIsContextReady(true);
    return context;
  }, []);

  const ensureMasterChain = useCallback(() => {
    const context = ensureAudioContext();
    if (!masterGainRef.current) {
      const master = context.createGain();
      master.gain.value = masterVolumeRef.current;
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      master.connect(analyser);
      analyser.connect(context.destination);
      masterGainRef.current = master;
      analyserRef.current = analyser;
    }
    if (!reverbRef.current) {
      const convolver = context.createConvolver();
      convolver.buffer = createImpulseResponse(context);
      const wetGain = context.createGain();
      wetGain.gain.value = 0.3;
      convolver.connect(wetGain);
      if (!masterGainRef.current) {
        throw new Error("Master gain should exist before setting reverb.");
      }
      wetGain.connect(masterGainRef.current);
      reverbRef.current = { convolver, gain: wetGain };
    }
    return {
      context,
      master: masterGainRef.current!,
      analyser: analyserRef.current!,
      reverb: reverbRef.current!,
    };
  }, [ensureAudioContext]);

  const decodeBuffer = useCallback(async (arrayBuffer: ArrayBuffer) => {
    const { context } = ensureMasterChain();
    if (context.state === "suspended") {
      await context.resume();
    }
    return context.decodeAudioData(arrayBuffer.slice(0));
  }, [ensureMasterChain]);

  const attachTrackNodes = useCallback(
    (id: string, buffer: AudioBuffer, color: string, name: string) => {
      const { context, master, reverb } = ensureMasterChain();
      const gain = context.createGain();
      gain.gain.value = 0.8;

      const panner = context.createStereoPanner();
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 20000;

      const reverbSend = context.createGain();
      reverbSend.gain.value = 0;

      filter.connect(panner);
      panner.connect(gain);
      gain.connect(master);
      filter.connect(reverbSend);
      reverbSend.connect(reverb.convolver);

      trackNodesRef.current.set(id, { buffer, gain, panner, filter, reverbSend, source: null });

      setTracks((current) => [
        ...current,
        {
          id,
          name,
          color,
          duration: buffer.duration,
          volume: 0.8,
          pan: 0,
          lowpass: 20000,
          playbackRate: 1,
          reverb: 0,
          isPlaying: false,
        },
      ]);
    },
    [ensureMasterChain]
  );

  const addTrackFromUrl = useCallback<MixerActions["addTrackFromUrl"]>(
    async ({ name, url, color }) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await decodeBuffer(arrayBuffer);
      const id = crypto.randomUUID();
      attachTrackNodes(id, buffer, color, name);
    },
    [attachTrackNodes, decodeBuffer]
  );

  const addTrackFromFile = useCallback<MixerActions["addTrackFromFile"]>(
    async (file, color = pickColor()) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await decodeBuffer(arrayBuffer);
      const id = crypto.randomUUID();
      attachTrackNodes(id, buffer, color, file.name.replace(/\.[^/.]+$/, ""));
    },
    [attachTrackNodes, decodeBuffer]
  );

  const stopSource = (nodes: TrackNodes | undefined) => {
    if (!nodes || !nodes.source) return;
    try {
      nodes.source.stop();
    } catch {
      // ignore race conditions when stopping sources twice
    }
    nodes.source.disconnect();
    nodes.source = null;
  };

  const startSource = (id: string, settings: { playbackRate: number }) => {
    const entry = trackNodesRef.current.get(id);
    if (!entry) return;
    stopSource(entry);
    const { context } = ensureMasterChain();
    if (context.state === "suspended") {
      void context.resume();
    }
    const source = context.createBufferSource();
    source.buffer = entry.buffer;
    source.loop = true;
    source.playbackRate.value = settings.playbackRate;
    source.connect(entry.filter);
    source.start();
    entry.source = source;
  };

  const toggleTrackPlayback = useCallback<MixerActions["toggleTrackPlayback"]>(
    (id) => {
      setTracks((current) =>
        current.map((track) => {
          if (track.id !== id) return track;
          const nodes = trackNodesRef.current.get(id);
          const nextPlaying = !track.isPlaying;
          if (nextPlaying) {
            startSource(id, { playbackRate: track.playbackRate });
          } else {
            stopSource(nodes);
          }
          return { ...track, isPlaying: nextPlaying };
        })
      );
    },
    [setTracks]
  );

  const removeTrack = useCallback<MixerActions["removeTrack"]>((id) => {
    const nodes = trackNodesRef.current.get(id);
    stopSource(nodes);
    if (nodes) {
      nodes.gain.disconnect();
      nodes.filter.disconnect();
      nodes.panner.disconnect();
      nodes.reverbSend.disconnect();
      trackNodesRef.current.delete(id);
    }
    setTracks((current) => current.filter((track) => track.id !== id));
  }, []);

  const setTrackVolume = useCallback<MixerActions["setTrackVolume"]>((id, value) => {
    const clamped = clamp(value, 0, 1);
    const nodes = trackNodesRef.current.get(id);
    if (nodes) {
      nodes.gain.gain.setTargetAtTime(clamped, ensureAudioContext().currentTime, 0.01);
    }
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, volume: clamped } : track))
    );
  }, [ensureAudioContext]);

  const setTrackPan = useCallback<MixerActions["setTrackPan"]>((id, value) => {
    const clamped = clamp(value, -1, 1);
    const nodes = trackNodesRef.current.get(id);
    if (nodes) {
      nodes.panner.pan.setTargetAtTime(clamped, ensureAudioContext().currentTime, 0.01);
    }
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, pan: clamped } : track))
    );
  }, [ensureAudioContext]);

  const setTrackLowpass = useCallback<MixerActions["setTrackLowpass"]>((id, cutoff) => {
    const minFreq = 120;
    const maxFreq = 20000;
    const mapped = clamp(cutoff, minFreq, maxFreq);
    const nodes = trackNodesRef.current.get(id);
    if (nodes) {
      nodes.filter.frequency.setTargetAtTime(mapped, ensureAudioContext().currentTime, 0.01);
    }
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, lowpass: mapped } : track))
    );
  }, [ensureAudioContext]);

  const setTrackPlaybackRate = useCallback<MixerActions["setTrackPlaybackRate"]>((id, rate) => {
    const clamped = clamp(rate, 0.5, 2);
    const nodes = trackNodesRef.current.get(id);
    if (nodes?.source) {
      nodes.source.playbackRate.setTargetAtTime(clamped, ensureAudioContext().currentTime, 0.01);
    }
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, playbackRate: clamped } : track))
    );
  }, [ensureAudioContext]);

  const setTrackReverb = useCallback<MixerActions["setTrackReverb"]>((id, amount) => {
    const clamped = clamp(amount, 0, 1);
    const nodes = trackNodesRef.current.get(id);
    if (nodes) {
      nodes.reverbSend.gain.setTargetAtTime(clamped, ensureAudioContext().currentTime, 0.01);
    }
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, reverb: clamped } : track))
    );
  }, [ensureAudioContext]);

  const setMasterVolume = useCallback<MixerActions["setMasterVolume"]>(
    (value) => {
      const clamped = clamp(value, 0, 1);
      setMasterVolumeState(clamped);
      const { context, master } = ensureMasterChain();
      master.gain.setTargetAtTime(clamped, context.currentTime, 0.01);
    },
    [ensureMasterChain]
  );

  const stopAll = useCallback<MixerActions["stopAll"]>(() => {
    trackNodesRef.current.forEach((nodes) => {
      stopSource(nodes);
    });
    setTracks((current) => current.map((track) => ({ ...track, isPlaying: false })));
  }, []);

  const playAll = useCallback<MixerActions["playAll"]>(() => {
    setTracks((current) =>
      current.map((track) => {
        startSource(track.id, { playbackRate: track.playbackRate });
        return { ...track, isPlaying: true };
      })
    );
  }, []);

  const resumeContext = useCallback<MixerActions["resumeContext"]>(async () => {
    const { context } = ensureMasterChain();
    if (context.state === "suspended") {
      await context.resume();
    }
  }, [ensureMasterChain]);

  // Master meter animation loop
  useEffect(() => {
    let rafId: number;
    const analyser = analyserRef.current;
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      analyser.getByteTimeDomainData(dataArray);
      let peak = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        const value = Math.abs(dataArray[i] - 128) / 128;
        if (value > peak) peak = value;
      }
      setMasterMeter(peak);
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [tracks.length]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      trackNodesRef.current.forEach((nodes) => {
        stopSource(nodes);
        nodes.gain.disconnect();
        nodes.panner.disconnect();
        nodes.filter.disconnect();
        nodes.reverbSend.disconnect();
      });
      trackNodesRef.current.clear();
      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        context.close().catch(() => undefined);
      }
    };
  }, []);

  return {
    tracks,
    masterVolume,
    masterMeter,
    isContextReady,
    addTrackFromUrl,
    addTrackFromFile,
    toggleTrackPlayback,
    removeTrack,
    setTrackVolume,
    setTrackPan,
    setTrackLowpass,
    setTrackPlaybackRate,
    setTrackReverb,
    setMasterVolume,
    stopAll,
    playAll,
    resumeContext,
  };
};
