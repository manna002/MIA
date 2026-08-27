export const INSTRUMENTS = [
  "Volatility 10 Index",
  "Volatility 10 (1s) Index",
  "Volatility 25 Index",
  "Volatility 25 (1s) Index",
  "Volatility 50 Index",
  "Volatility 50 (1s) Index",
  "Volatility 75 Index",
  "Volatility 75 (1s) Index",
  "Volatility 100 Index",
  "Volatility 100 (1s) Index",
  "Boom 500 Index",
  "Boom 1000 Index",
  "Crash 500 Index",
  "Crash 1000 Index",
  "Step Index",
  "Jump 25 Index",
  "Jump 50 Index",
  "Jump 75 Index",
  "Jump 100 Index",
] as const;

export const ZONE_TYPES = ["FVG", "OB"] as const;
export const TIMEFRAMES = ["1M", "5M", "15M", "30M", "1H", "4H", "D1", "W1"] as const;
export const ENTRY_TRIGGERS = [
  "BOS",
  "CHoCH",
  "Wick rejection",
  "Engulfing",
  "Liquidity sweep",
  "M15 FVG tap",
  "No trigger",
] as const;
export const GRADES = ["A", "B", "C"] as const;
export const OUTCOMES = ["Win", "Loss", "BE", "No trade"] as const;
export const DIRECTIONS = ["BUY", "SELL"] as const;

export const MISTAKE_TAGS = [
  "Entered early",
  "Wrong bias",
  "TP too early",
  "Overtraded",
  "No confirmation",
  "Moved SL",
  "Revenge trade",
  "Ignored HTF",
  "Chased entry",
] as const;

export type Instrument = (typeof INSTRUMENTS)[number];
export type ZoneType = (typeof ZONE_TYPES)[number];
export type Timeframe = (typeof TIMEFRAMES)[number];
export type EntryTrigger = (typeof ENTRY_TRIGGERS)[number];
export type Grade = (typeof GRADES)[number];
export type Outcome = (typeof OUTCOMES)[number];
export type Direction = (typeof DIRECTIONS)[number];

export const SCREENSHOT_TIMEFRAMES = [
  'Monthly', 'Weekly', 'Daily', '4H', '1H', '30M', '15M', '5M', '1M', 'Extra',
] as const;
export type ScreenshotTimeframe = (typeof SCREENSHOT_TIMEFRAMES)[number];

export type MediaAttachment = {
  id: string;
  timeframe: ScreenshotTimeframe;
  inputType: 'file' | 'link';
  value: string | null; // base64 data URL for file, or URL string for link
  fileName?: string;
};

export type TradeDraft = {
  datetime: string;
  instrument: Instrument;
  direction: Direction;
  zoneType: ZoneType;
  htfZoneTf: Timeframe;
  entryTf: Timeframe;
  entryTrigger: EntryTrigger;
  algoStructure: Grade;
  zoneQuality: Grade;
  slSize: string;
  plannedR: string;
  resultR: string;
  outcome: Outcome;
  mistakes: string[];
  whyTaken: string;
  improvement: string;
  media: MediaAttachment[];
};

export type Trade = Omit<TradeDraft, "slSize" | "plannedR" | "resultR"> & {
  id: string;
  createdAt: string;
  slSize: number | null;
  plannedR: number | null;
  resultR: number | null;
  takeTrade: "YES" | "NO" | "NO DATA";
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function emptyDraft(): TradeDraft {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    datetime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
    instrument: "Volatility 75 Index",
    direction: "BUY",
    zoneType: "FVG",
    htfZoneTf: "4H",
    entryTf: "15M",
    entryTrigger: "BOS",
    algoStructure: "A",
    zoneQuality: "A",
    slSize: "",
    plannedR: "2",
    resultR: "",
    outcome: "No trade",
    mistakes: [],
    whyTaken: "",
    improvement: "",
    media: [],
  };
}
