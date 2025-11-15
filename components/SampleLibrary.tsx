import { useMemo, useRef, useState } from "react";
import { sampleCategories, Sample } from "@/lib/samples";
import { Play, Pause, Plus } from "lucide-react";
import clsx from "clsx";

type Props = {
  onAddSample: (sample: Sample, palette: string) => void;
};

export function SampleLibrary({ onAddSample }: Props) {
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  const handlePreview = (sample: Sample) => {
    const current = previewRef.current;
    if (current && previewing === sample.id) {
      current.pause();
      current.currentTime = 0;
      setPreviewing(null);
      return;
    }
    if (current) {
      current.pause();
      current.currentTime = 0;
    }
    const audio = new Audio(sample.file);
    audio.loop = true;
    audio.play().catch(() => undefined);
    previewRef.current = audio;
    setPreviewing(sample.id);
  };

  const stopPreview = () => {
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
    previewRef.current = null;
    setPreviewing(null);
  };

  const paletteByCategory = useMemo(() => {
    const colors = new Map<string, string>();
    sampleCategories.forEach((category) => {
      colors.set(category.id, category.color);
    });
    return colors;
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Sample Library</h2>
          <p className="text-sm text-white/70">
            Tap a loop to preview it or drop it directly into your mixer.
          </p>
        </div>
        {previewing && (
          <button
            onClick={stopPreview}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Stop Preview
          </button>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {sampleCategories.map((category) => (
          <div
            key={category.id}
            className={clsx(
              "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-6 shadow-lg shadow-black/30",
              category.color
            )}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
            <div className="relative space-y-4 text-white">
              <header>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Palette</p>
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="text-sm text-white/80">{category.mood}</p>
              </header>
              <div className="space-y-3">
                {category.samples.map((sample) => (
                  <div
                    key={sample.id}
                    className="grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur"
                  >
                    <button
                      onClick={() => handlePreview(sample)}
                      className={clsx(
                        "flex size-10 items-center justify-center rounded-full bg-white/90 text-slate-900 transition hover:bg-white",
                        previewing === sample.id ? "shadow-inner shadow-white/40" : "shadow shadow-black/30"
                      )}
                    >
                      {previewing === sample.id ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <div>
                      <p className="text-sm font-medium">{sample.name}</p>
                      <p className="text-xs text-white/80">{sample.description}</p>
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
                        {sample.tone} • {sample.key} • {sample.bpm ? `${sample.bpm} bpm` : "freeform"}
                      </p>
                    </div>
                    <button
                      onClick={() => onAddSample(sample, paletteByCategory.get(category.id) ?? category.color)}
                      className="flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-white/30"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
