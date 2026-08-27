import {
  DIRECTIONS,
  ENTRY_TRIGGERS,
  GRADES,
  INSTRUMENTS,
  MISTAKE_TAGS,
  OUTCOMES,
  TIMEFRAMES,
  ZONE_TYPES,
  type Direction,
  type TradeDraft,
} from "@/lib/trading/types";
import { Chip, Field, GlassCard, Input, SectionTitle, Select, Textarea } from "./primitives";
import { MediaAttachments } from "./MediaAttachments";
import { cn } from "@/lib/utils";

export function TradeForm({
  draft,
  update,
}: {
  draft: TradeDraft;
  update: <K extends keyof TradeDraft>(key: K, value: TradeDraft[K]) => void;
}) {
  const toggleMistake = (tag: string) =>
    update(
      "mistakes",
      draft.mistakes.includes(tag)
        ? draft.mistakes.filter((m) => m !== tag)
        : [...draft.mistakes, tag],
    );

  return (
    <GlassCard className="p-5 sm:p-6">
      <SectionTitle hint="Every field feeds the model dataset">Trade entry</SectionTitle>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Date / Time" className="sm:col-span-1">
          <Input
            type="datetime-local"
            value={draft.datetime}
            onChange={(e) => update("datetime", e.target.value)}
          />
        </Field>

        <Field label="Instrument" className="sm:col-span-1">
          <Select
            options={INSTRUMENTS}
            value={draft.instrument}
            onChange={(e) => update("instrument", e.target.value as TradeDraft["instrument"])}
          />
        </Field>

        <Field label="Direction">
          <div className="grid grid-cols-2 gap-2">
            {DIRECTIONS.map((d: Direction) => {
              const active = draft.direction === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => update("direction", d)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 hover:-translate-y-0.5",
                    active && d === "BUY" && "border-bull/60 bg-bull/15 text-bull shadow-bull-glow",
                    active && d === "SELL" && "border-bear/60 bg-bear/15 text-bear shadow-bear-glow",
                    !active && "border-glass-border bg-glass text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Zone type">
          <Select
            options={ZONE_TYPES}
            value={draft.zoneType}
            onChange={(e) => update("zoneType", e.target.value as TradeDraft["zoneType"])}
          />
        </Field>
        <Field label="HTF zone TF">
          <Select
            options={TIMEFRAMES}
            value={draft.htfZoneTf}
            onChange={(e) => update("htfZoneTf", e.target.value as TradeDraft["htfZoneTf"])}
          />
        </Field>
        <Field label="Entry TF">
          <Select
            options={TIMEFRAMES}
            value={draft.entryTf}
            onChange={(e) => update("entryTf", e.target.value as TradeDraft["entryTf"])}
          />
        </Field>

        <Field label="Entry trigger">
          <Select
            options={ENTRY_TRIGGERS}
            value={draft.entryTrigger}
            onChange={(e) => update("entryTrigger", e.target.value as TradeDraft["entryTrigger"])}
          />
        </Field>
        <Field label="4H algo structure">
          <Select
            options={GRADES}
            value={draft.algoStructure}
            onChange={(e) => update("algoStructure", e.target.value as TradeDraft["algoStructure"])}
          />
        </Field>
        <Field label="Zone quality">
          <Select
            options={GRADES}
            value={draft.zoneQuality}
            onChange={(e) => update("zoneQuality", e.target.value as TradeDraft["zoneQuality"])}
          />
        </Field>

        <Field label="SL size">
          <Input
            type="number"
            step="any"
            placeholder="e.g. 120"
            value={draft.slSize}
            onChange={(e) => update("slSize", e.target.value)}
          />
        </Field>
        <Field label="Planned R">
          <Input
            type="number"
            step="any"
            placeholder="e.g. 2"
            value={draft.plannedR}
            onChange={(e) => update("plannedR", e.target.value)}
          />
        </Field>
        <Field label="Result (R)">
          <Input
            type="number"
            step="any"
            placeholder="e.g. 1.8 or -1"
            value={draft.resultR}
            onChange={(e) => update("resultR", e.target.value)}
          />
        </Field>

        <Field label="Outcome">
          <Select
            options={OUTCOMES}
            value={draft.outcome}
            onChange={(e) => update("outcome", e.target.value as TradeDraft["outcome"])}
          />
        </Field>
      </div>

      <div className="mt-6">
        <SectionTitle hint="Any tag forces a NO">Mistake tags</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {MISTAKE_TAGS.map((tag) => (
            <Chip
              key={tag}
              active={draft.mistakes.includes(tag)}
              onClick={() => toggleMistake(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Why I took it">
          <Textarea
            placeholder="Bias, confluence, session…"
            value={draft.whyTaken}
            onChange={(e) => update("whyTaken", e.target.value)}
          />
        </Field>
        <Field label="One improvement">
          <Textarea
            placeholder="What I will do differently next time…"
            value={draft.improvement}
            onChange={(e) => update("improvement", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6">
        <MediaAttachments
          media={draft.media}
          onUpdate={(media) => update('media', media)}
        />
      </div>
    </GlassCard>
  );
}
