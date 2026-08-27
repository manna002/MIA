import { useState, useRef } from 'react';
import { ImagePlus, Link as LinkIcon, X, Plus } from 'lucide-react';
import { SCREENSHOT_TIMEFRAMES, type MediaAttachment, type ScreenshotTimeframe } from '@/lib/trading/types';
import { GlassCard, SectionTitle } from './primitives';
import { cn } from '@/lib/utils';

export function MediaAttachments({
  media,
  onUpdate,
}: {
  media: MediaAttachment[];
  onUpdate: (media: MediaAttachment[]) => void;
}) {
  const addRow = () => {
    onUpdate([
      ...media,
      {
        id: crypto.randomUUID(),
        timeframe: 'Extra' as ScreenshotTimeframe,
        inputType: 'file',
        value: null,
      },
    ]);
  };

  const updateRow = (id: string, patch: Partial<MediaAttachment>) => {
    onUpdate(media.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeRow = (id: string) => {
    onUpdate(media.filter((m) => m.id !== id));
  };

  return (
    <div className="mt-6">
      <SectionTitle hint="Attach charts for visual review">Screenshots</SectionTitle>

      <div className="space-y-3">
        {media.map((item) => (
          <MediaRow
            key={item.id}
            item={item}
            onUpdate={(patch) => updateRow(item.id, patch)}
            onRemove={() => removeRow(item.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-glass-border bg-glass px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-electric/50 hover:text-electric"
      >
        <Plus className="h-4 w-4" /> Add Screenshot
      </button>
    </div>
  );
}

function MediaRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: MediaAttachment;
  onUpdate: (patch: Partial<MediaAttachment>) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const readFile = (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () =>
      onUpdate({
        value: typeof reader.result === 'string' ? reader.result : null,
        fileName: file.name,
      });
    reader.readAsDataURL(file);
  };

  return (
    <div className="group relative rounded-xl border border-glass-border bg-surface-strong/60 p-3 transition-all duration-200 hover:border-electric/30">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 transition-all duration-200 hover:text-bear group-hover:opacity-100"
        aria-label="Remove attachment"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="mb-3 flex items-center gap-3">
        {/* Timeframe selector */}
        <select
          value={item.timeframe}
          onChange={(e) => onUpdate({ timeframe: e.target.value as ScreenshotTimeframe })}
          className="w-28 rounded-lg border border-glass-border bg-surface-strong px-2.5 py-1.5 text-xs font-medium text-foreground outline-none transition-all hover:border-electric/40 focus:border-electric"
        >
          {SCREENSHOT_TIMEFRAMES.map((tf) => (
            <option key={tf} value={tf} className="bg-popover text-popover-foreground">
              {tf}
            </option>
          ))}
        </select>

        {/* Input type toggle */}
        <div className="flex rounded-lg border border-glass-border bg-glass p-0.5">
          <button
            type="button"
            onClick={() => onUpdate({ inputType: 'file', value: null })}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200',
              item.inputType === 'file'
                ? 'bg-electric/15 text-electric shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <ImagePlus className="h-3 w-3" /> Upload
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ inputType: 'link', value: null })}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200',
              item.inputType === 'link'
                ? 'bg-electric/15 text-electric shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LinkIcon className="h-3 w-3" /> Link
          </button>
        </div>
      </div>

      {/* Upload area or link input */}
      {item.inputType === 'file' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            readFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed transition-all duration-200',
            over
              ? 'border-electric bg-electric/10'
              : 'border-glass-border bg-glass hover:border-electric/50 hover:bg-electric/5',
          )}
        >
          {item.value ? (
            <img
              src={item.value}
              alt={`${item.timeframe} chart`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-center">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                Drop image or click to upload
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => readFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <input
          type="url"
          placeholder="https://www.tradingview.com/chart/..."
          value={item.value ?? ''}
          onChange={(e) => onUpdate({ value: e.target.value || null })}
          className="w-full rounded-lg border border-glass-border bg-surface-strong px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-electric/40 focus:border-electric focus:ring-2 focus:ring-electric/25"
        />
      )}
    </div>
  );
}
