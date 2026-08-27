import { MISTAKE_TAGS, type Trade } from './types';

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null) {
  if (value === null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(trades: Trade[]) {
  const headers = [
    'id',
    'datetime',
    'instrument',
    'direction',
    'zone_type',
    'htf_zone_tf',
    'entry_tf',
    'entry_trigger',
    'algo_structure_4h',
    'zone_quality',
    'sl_size',
    'planned_r',
    'result_r',
    'outcome',
    'outcome_binary',
    'take_trade',
    ...MISTAKE_TAGS.map((t) => `mistake_${t.toLowerCase().replace(/\s+/g, '_')}`),
    'why_taken',
    'improvement',
    'media_urls',
  ];

  const rows = trades.map((t) => [
    t.id,
    t.datetime,
    t.instrument,
    t.direction,
    t.zoneType,
    t.htfZoneTf,
    t.entryTf,
    t.entryTrigger,
    t.algoStructure,
    t.zoneQuality,
    t.slSize,
    t.plannedR,
    t.resultR,
    t.outcome,
    t.outcome === 'Win' ? 1 : t.outcome === 'Loss' ? 0 : '',
    t.takeTrade,
    ...MISTAKE_TAGS.map((tag) => (t.mistakes.includes(tag) ? 1 : 0)),
    t.whyTaken,
    t.improvement,
    t.media
      .filter((m) => m.value)
      .map((m) => `${m.timeframe}:${m.value}`)
      .join(';'),
  ]);

  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  download('trading-dataset.csv', csv, 'text/csv;charset=utf-8');
}

export function downloadJson(trades: Trade[]) {
  download('trading-journal.json', JSON.stringify(trades, null, 2), 'application/json');
}
