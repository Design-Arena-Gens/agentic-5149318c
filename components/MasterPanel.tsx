import { ChangeEvent, useRef } from "react";
import { Waves, UploadCloud, PlayCircle, Square } from "lucide-react";

type Props = {
  masterVolume: number;
  masterMeter: number;
  onMasterVolume: (value: number) => void;
  onPlayAll: () => void;
  onStopAll: () => void;
  onFileSelected: (file: File) => void;
  disablePlay: boolean;
};

export function MasterPanel({
  masterVolume,
  masterMeter,
  onMasterVolume,
  onPlayAll,
  onStopAll,
  onFileSelected,
  disablePlay,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
      event.target.value = "";
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80 p-6 shadow-xl shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-white">
            <Waves />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Master Control</h2>
            <p className="text-sm text-white/70">Blend, sculpt, and record-ready your layers.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onPlayAll}
            disabled={disablePlay}
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow shadow-black/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-white/60"
          >
            <PlayCircle size={18} />
            Play All
          </button>
          <button
            onClick={onStopAll}
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-white"
          >
            <Square size={16} />
            Stop All
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-white"
          >
            <UploadCloud size={18} />
            Import Sample
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr,1fr]">
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Master Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(event) => onMasterVolume(Number(event.target.value))}
            className="h-2 w-full cursor-pointer rounded-full bg-black/30 accent-emerald-400"
          />
        </label>
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Output Meter</span>
            <span>{Math.round(masterMeter * 100)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-400 transition-all"
              style={{ width: `${Math.min(masterMeter * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
