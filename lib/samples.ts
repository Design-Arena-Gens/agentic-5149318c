export type Sample = {
  id: string;
  name: string;
  description: string;
  file: string;
  bpm: number;
  key: string;
  tone: "warm" | "bright" | "dark" | "neutral";
};

export type SampleCategory = {
  id: string;
  name: string;
  mood: string;
  color: string;
  samples: Sample[];
};

export const sampleCategories: SampleCategory[] = [
  {
    id: "ambient",
    name: "Ethereal Ambient",
    mood: "Wide shimmering textures and deep pads",
    color: "from-indigo-500/80 via-sky-500/70 to-cyan-400/80",
    samples: [
      {
        id: "ambient-pad",
        name: "Nebula Pad",
        description: "Layered sine pad with slow tremolo movement",
        file: "/samples/ambient-pad.wav",
        bpm: 0,
        key: "A",
        tone: "warm",
      },
    ],
  },
  {
    id: "lofi",
    name: "Lo-Fi Noir",
    mood: "Dusty rhythms and gentle paced grooves",
    color: "from-amber-500/80 via-orange-500/80 to-rose-500/60",
    samples: [
      {
        id: "lofi-beat",
        name: "Cassette Beat",
        description: "Soft kick/snare loop with vinyl-style hats",
        file: "/samples/lofi-beat.wav",
        bpm: 92,
        key: "Percussive",
        tone: "dark",
      },
      {
        id: "perc-loop",
        name: "Shaker Lace",
        description: "Airy shaker sequence with hand-clap accents",
        file: "/samples/perc-loop.wav",
        bpm: 92,
        key: "Percussive",
        tone: "bright",
      },
    ],
  },
  {
    id: "groove",
    name: "Funk Pulse",
    mood: "Groovy bass foundations with punchy drive",
    color: "from-emerald-500/80 via-lime-500/70 to-teal-500/80",
    samples: [
      {
        id: "funk-bass",
        name: "Punch Bass",
        description: "Saw bass riff with expressive envelope swells",
        file: "/samples/funk-bass.wav",
        bpm: 100,
        key: "E",
        tone: "neutral",
      },
    ],
  },
];
