import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ChatMessage, MediaAttachment, Trade } from './types';

const CHAT_KEY = 'td.chat.v1';

export const SEED_MESSAGE: ChatMessage = {
  id: 'seed',
  role: 'assistant',
  content:
    'I have analyzed your saved trades. What would you like to know about your win probabilities or mistakes?',
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

type DbTrade = {
  id: string;
  created_at: string;
  datetime: string;
  instrument: string;
  direction: string;
  zone_type: string;
  htf_zone_tf: string;
  entry_tf: string;
  entry_trigger: string;
  algo_structure: string;
  zone_quality: string;
  sl_size: number | null;
  planned_r: number | null;
  result_r: number | null;
  outcome: string;
  mistakes: string[];
  why_taken: string;
  improvement: string;
  take_trade: string;
  screenshots: MediaAttachment[];
};

function dbToTrade(row: DbTrade): Trade {
  return {
    id: row.id,
    createdAt: row.created_at,
    datetime: row.datetime,
    instrument: row.instrument as Trade['instrument'],
    direction: row.direction as Trade['direction'],
    zoneType: row.zone_type as Trade['zoneType'],
    htfZoneTf: row.htf_zone_tf as Trade['htfZoneTf'],
    entryTf: row.entry_tf as Trade['entryTf'],
    entryTrigger: row.entry_trigger as Trade['entryTrigger'],
    algoStructure: row.algo_structure as Trade['algoStructure'],
    zoneQuality: row.zone_quality as Trade['zoneQuality'],
    slSize: row.sl_size,
    plannedR: row.planned_r,
    resultR: row.result_r,
    outcome: row.outcome as Trade['outcome'],
    mistakes: row.mistakes ?? [],
    whyTaken: row.why_taken ?? '',
    improvement: row.improvement ?? '',
    takeTrade: row.take_trade as Trade['takeTrade'],
    media: row.screenshots ?? [],
  };
}

async function uploadMedia(tradeId: string, attachments: MediaAttachment[]): Promise<MediaAttachment[]> {
  const uploaded: MediaAttachment[] = [];

  for (const item of attachments) {
    if (item.inputType === 'link' || !item.value || !item.value.startsWith('data:')) {
      uploaded.push({ ...item, value: item.value });
      continue;
    }

    // Convert base64 to blob
    const res = await fetch(item.value);
    const blob = await res.blob();
    const ext = blob.type.split('/')[1] || 'png';
    const path = `${tradeId}/${item.timeframe}_${item.id}.${ext}`;

    const { error } = await supabase.storage
      .from('trade-screenshots')
      .upload(path, blob, { contentType: blob.type, upsert: true });

    if (error) {
      console.error('Upload error:', error);
      uploaded.push({ ...item, value: null });
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('trade-screenshots')
      .getPublicUrl(path);

    uploaded.push({ ...item, value: urlData.publicUrl });
  }

  return uploaded;
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fetchTrades = async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch trades:', error);
        setHydrated(true);
        return;
      }

      setTrades((data as DbTrade[]).map(dbToTrade));
      setHydrated(true);
    };

    fetchTrades();
  }, []);

  const addTrade = useCallback(async (trade: Trade) => {
    // Upload any media files to Supabase Storage first
    const uploadedMedia = await uploadMedia(trade.id, trade.media);

    const row = {
      id: trade.id,
      created_at: trade.createdAt,
      datetime: trade.datetime,
      instrument: trade.instrument,
      direction: trade.direction,
      zone_type: trade.zoneType,
      htf_zone_tf: trade.htfZoneTf,
      entry_tf: trade.entryTf,
      entry_trigger: trade.entryTrigger,
      algo_structure: trade.algoStructure,
      zone_quality: trade.zoneQuality,
      sl_size: trade.slSize,
      planned_r: trade.plannedR,
      result_r: trade.resultR,
      outcome: trade.outcome,
      mistakes: trade.mistakes,
      why_taken: trade.whyTaken,
      improvement: trade.improvement,
      take_trade: trade.takeTrade,
      screenshots: uploadedMedia,
    };

    const { error } = await supabase.from('trades').insert(row);

    if (error) {
      console.error('Failed to save trade:', error);
      return;
    }

    const savedTrade = { ...trade, media: uploadedMedia };
    setTrades((prev) => [savedTrade, ...prev]);
  }, []);

  const removeTrade = useCallback(async (id: string) => {
    const { error } = await supabase.from('trades').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete trade:', error);
      return;
    }

    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { trades, hydrated, addTrade, removeTrade };
}

export function useMentorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([SEED_MESSAGE]);

  useEffect(() => {
    const stored = readLocal<ChatMessage[] | null>(CHAT_KEY, null);
    if (stored && stored.length) setMessages(stored);
  }, []);

  const persist = useCallback((next: ChatMessage[]) => {
    writeLocal(CHAT_KEY, next);
    return next;
  }, []);

  const clear = useCallback(() => {
    setMessages(persist([SEED_MESSAGE]));
  }, [persist]);

  return { messages, setMessages, persist, clear };
}
