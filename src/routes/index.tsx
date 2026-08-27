import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileJson, LineChart, Save } from "lucide-react";
import { toast, Toaster } from "sonner";

import { StatCards } from "@/components/dashboard/StatCards";
import { TradeForm } from "@/components/dashboard/TradeForm";
import { TakeIndicator } from "@/components/dashboard/TakeIndicator";
import { MentorChat } from "@/components/dashboard/MentorChat";
import { TradesTable } from "@/components/dashboard/TradesTable";
import { evaluate } from "@/lib/trading/analysis";
import { downloadCsv, downloadJson } from "@/lib/trading/export";
import { useMentorChat, useTrades } from "@/lib/trading/storage";
import { emptyDraft, type Trade, type TradeDraft } from "@/lib/trading/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trading Dashboard — Journal + Model Dataset" },
      {
        name: "description",
        content:
          "Log synthetic-index trades, see whether your exact setup combination has won or lost before, export a model-ready dataset, and ask an AI mentor about your stats.",
      },
      { property: "og:title", content: "Trading Dashboard — Journal + Model Dataset" },
      {
        property: "og:description",
        content:
          "A dark, glassmorphic trading journal that learns from your own trades and tells you whether to take the setup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { trades, addTrade, removeTrade } = useTrades();
  const chat = useMentorChat();
  const [draft, setDraft] = useState<TradeDraft>(() => emptyDraft());

  const update = <K extends keyof TradeDraft>(key: K, value: TradeDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const verdict = useMemo(() => evaluate(draft, trades), [draft, trades]);

  const num = (v: string) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const saveTrade = async () => {
    const trade: Trade = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      slSize: num(draft.slSize),
      plannedR: num(draft.plannedR),
      resultR: num(draft.resultR),
      takeTrade: verdict.decision,
    };
    await addTrade(trade);
    setDraft(emptyDraft());
    toast.success("Trade saved to your journal");
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <Toaster theme="dark" position="top-right" />

      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-electric/15 text-electric shadow-electric-glow">
              <LineChart className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold tracking-tight sm:text-2xl">
                Trading Dashboard
              </h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                Journal + Model Dataset · synced to your cloud
              </p>
            </div>
          </div>
        </header>

        <StatCards trades={trades} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[3fr_2fr]">
          <TradeForm draft={draft} update={update} />

          <div className="space-y-6">
            <TakeIndicator verdict={verdict} />

            <button
              type="button"
              onClick={() => void saveTrade()}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary px-6 py-4 font-display text-base font-bold tracking-wide text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-electric-glow active:translate-y-0"
            >
              <Save className="h-5 w-5" /> Save Trade
            </button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => downloadCsv(trades)}
                disabled={!trades.length}
                className="glass-panel flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/90 transition-all duration-200 hover:-translate-y-0.5 hover:text-electric disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <Download className="h-4 w-4" /> Download CSV (Model-Ready)
              </button>
              <button
                type="button"
                onClick={() => downloadJson(trades)}
                disabled={!trades.length}
                className="glass-panel flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/90 transition-all duration-200 hover:-translate-y-0.5 hover:text-electric disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <FileJson className="h-4 w-4" /> Download JSON
              </button>
            </div>

            <MentorChat
              trades={trades}
              messages={chat.messages}
              setMessages={chat.setMessages}
              persist={chat.persist}
              clear={chat.clear}
            />
          </div>
        </div>

        <TradesTable trades={trades} onDelete={removeTrade} />
      </div>
    </div>
  );
}
