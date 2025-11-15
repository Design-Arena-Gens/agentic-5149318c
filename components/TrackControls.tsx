import { TrackInfo } from "@/hooks/useMixer";
import { Play, Pause, Trash2 } from "lucide-react";
import clsx from "clsx";

type Props = {
  track: TrackInfo;
  onToggle: () => void;
  onRemove: () => void;
  onVolume: (value: number) => void;
  onPan: (value: number) => void;
  onLowpass: (value: number) => void;
  onPlaybackRate: (value: number) => void;
  onReverb: (value: number) => void;
};

const formatSeconds = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "∞";
  return `${seconds.toFixed(2)}s`;
};

export function TrackControls({
  track,
  onToggle,
  onRemove,
  onVolume,
  onPan,
  onLowpass,
  onPlaybackRate,
  onReverb,
}: Props) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-md shadow-black/20 backdrop-blur",
        "ring-1 ring-inset ring-white/10 transition hover:ring-white/30"
      )}
    >
      <div className={clsx("absolute inset-0 opacity-40 blur-xl", `bg-gradient-to-r ${track.color}`)} />
      <div className="relative space-y-4 p-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/60">Track</p>
            <h3 className="text-lg font-semibold text-white">{track.name}</h3>
            <p className="text-xs text-white/60">Loop {formatSeconds(track.duration)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={clsx(
                "flex size-10 items-center justify-center rounded-full bg-white/90 text-slate-900 transition hover:bg-white",
                track.isPlaying ? "shadow-inner shadow-white/30" : "shadow shadow-black/40"
              )}
            >
              {track.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={onRemove}
              className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white/70 transition hover:bg-black/60 hover:text-white"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={track.volume}
              onChange={(event) => onVolume(Number(event.target.value))}
              className="h-2 w-full cursor-pointer rounded-full bg-black/30 accent-white/80"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Pan
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={track.pan}
              onChange={(event) => onPan(Number(event.target.value))}
              className="h-2 w-full cursor-pointer rounded-full bg-black/30 accent-white/80"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Low-Pass
            <input
              type="range"
              min={120}
              max={20000}
              step={10}
              value={track.lowpass}
              onChange={(event) => onLowpass(Number(event.target.value))}
              className="h-2 w-full cursor-pointer rounded-full bg-black/30 accent-white/80"
            />
            <span className="text-xs text-white/60">{Math.round(track.lowpass)} Hz</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/80">
            Speed
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={track.playbackRate}
              onChange={(event) => onPlaybackRate(Number(event.target.value))}
              className="h-2 w-full cursor-pointer rounded-full bg-black/30 accent-white/80"
            />
            <span className="text-xs text-white/60">{(track.playbackRate * 100).toFixed(0)}%</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/80 md:col-span-2">
            Reverb
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={track.reverb}
              onChange={(event) => onReverb(Number(event.target.value))}
              className="h-2 w-full cursor-pointer rounded-full bg-black/30 accent-white/80"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
