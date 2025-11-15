"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { SampleLibrary } from "@/components/SampleLibrary";
import { TrackControls } from "@/components/TrackControls";
import { MasterPanel } from "@/components/MasterPanel";
import { useMixer } from "@/hooks/useMixer";
import type { Sample } from "@/lib/samples";

const colorsByTone: Record<string, string> = {
  warm: "from-amber-400 via-orange-500 to-rose-500",
  bright: "from-sky-400 via-cyan-400 to-indigo-400",
  dark: "from-slate-700 via-zinc-800 to-black",
  neutral: "from-emerald-500 via-teal-500 to-blue-500",
};

export default function Home() {
  const {
    tracks,
    masterVolume,
    masterMeter,
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
  } = useMixer();
  const [status, setStatus] = useState<string | null>(null);

  const handleAddSample = useCallback(
    async (sample: Sample, palette: string) => {
      try {
        await resumeContext();
        await addTrackFromUrl({
          name: sample.name,
          url: sample.file,
          color: colorsByTone[sample.tone] ?? palette,
        });
        setStatus(`Added ${sample.name} to the mixer.`);
      } catch (error) {
        console.error(error);
        setStatus("Unable to load sample. Please try again.");
      }
    },
    [addTrackFromUrl, resumeContext]
  );

  const handleFileSelected = useCallback(
    async (file: File) => {
      try {
        await resumeContext();
        await addTrackFromFile(file);
        setStatus(`Imported ${file.name} successfully.`);
      } catch (error) {
        console.error(error);
        setStatus("Unable to import that file.");
      }
    },
    [addTrackFromFile, resumeContext]
  );

  const hasActiveTracks = useMemo(() => tracks.some((track) => track.isPlaying), [tracks]);

  const heroSubtitle = useMemo(() => {
    if (tracks.length === 0) {
      return "Compose lucid soundscapes by layering curated loops or your own textures.";
    }
    if (hasActiveTracks) {
      return "Ride the groove—sculpt tone, widen presence, and elevate your mix in real-time.";
    }
    return "Press play and weave your layers into a stylistic signature.";
  }, [hasActiveTracks, tracks.length]);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 3600);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.08),_transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-14 sm:px-8 lg:px-10">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            <Sparkles size={14} />
            Stylic Mixer
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Shape signature vibes with the Stylic Sample Blender.
            </h1>
            <p className="max-w-3xl text-lg text-white/70">{heroSubtitle}</p>
          </div>
        </header>

        <div className="mt-10 space-y-12">
          <MasterPanel
            masterVolume={masterVolume}
            masterMeter={masterMeter}
            onMasterVolume={setMasterVolume}
            onPlayAll={async () => {
              await resumeContext();
              playAll();
              setStatus("Playing all tracks.");
            }}
            onStopAll={() => {
              stopAll();
              setStatus("Stopped playback.");
            }}
            onFileSelected={handleFileSelected}
            disablePlay={tracks.length === 0}
          />

          <section className="space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Mixer Deck</h2>
                <p className="text-sm text-white/70">
                  Fine-tune each layer with stereo placement, core tone shaping, and creative depth.
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-4 py-1 text-xs font-medium text-white/70">
                {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
              </span>
            </div>
            {tracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/20 bg-white/5 p-12 text-center text-white/70">
                <p className="text-lg font-medium text-white">Your mixer is waiting.</p>
                <p className="max-w-md text-sm text-white/60">
                  Drop in a curated loop or import your own stems to craft a distinct stylic blend.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {tracks.map((track) => (
                  <TrackControls
                    key={track.id}
                    track={track}
                    onToggle={() => toggleTrackPlayback(track.id)}
                    onRemove={() => removeTrack(track.id)}
                    onVolume={(value) => setTrackVolume(track.id, value)}
                    onPan={(value) => setTrackPan(track.id, value)}
                    onLowpass={(value) => setTrackLowpass(track.id, value)}
                    onPlaybackRate={(value) => setTrackPlaybackRate(track.id, value)}
                    onReverb={(value) => setTrackReverb(track.id, value)}
                  />
                ))}
              </div>
            )}
          </section>

          <SampleLibrary onAddSample={handleAddSample} />
        </div>

        {status && (
          <div className="fixed bottom-6 right-6 z-40 rounded-2xl border border-white/10 bg-slate-900/90 px-5 py-3 text-sm text-white shadow-lg shadow-black/30 backdrop-blur">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}
