import React, { useMemo } from "react";
import { GitBranch, Trash2 } from "lucide-react";
import { HabitIndicator } from "../../types/habitConfiguration";

interface Props {
  indicators: HabitIndicator[];
  target: HabitIndicator;
  onSave: (sourceIndicatorId: string, sourceOptionId: string) => void;
  onRemove: () => void;
}

export const ConditionBuilder: React.FC<Props> = ({ indicators, target, onSave, onRemove }) => {
  const condition = target.conditions[0];
  const source = useMemo(() => indicators.find((item) => item.id === condition?.sourceIndicatorId), [condition?.sourceIndicatorId, indicators]);
  const [sourceId, setSourceId] = React.useState(condition?.sourceIndicatorId ?? "");
  const [optionId, setOptionId] = React.useState(condition?.sourceOptionId ?? "");
  const availableSources = indicators.filter((item) => item.id !== target.id && item.order < target.order && item.options.length > 0);
  const selectedSource = availableSources.find((item) => item.id === sourceId) ?? source;

  React.useEffect(() => {
    setSourceId(condition?.sourceIndicatorId ?? "");
    setOptionId(condition?.sourceOptionId ?? "");
  }, [condition?.sourceIndicatorId, condition?.sourceOptionId]);

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm"><GitBranch className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-violet-700">Conditional indicator</p>
          <p className="mt-1 text-xs text-slate-600">Indikator ini hanya tampil jika jawaban indikator sebelumnya memenuhi kondisi berikut.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto] md:items-end">
            <label className="text-xs font-bold text-slate-600">Jika indikator
              <select value={sourceId} onChange={(e) => { setSourceId(e.target.value); setOptionId(""); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                <option value="">Pilih indikator</option>
                {availableSources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="pb-2 text-center text-xs font-black text-slate-400">=</div>
            <label className="text-xs font-bold text-slate-600">Memilih
              <select value={optionId} onChange={(e) => setOptionId(e.target.value)} disabled={!selectedSource} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 disabled:bg-slate-100">
                <option value="">Pilih pilihan</option>
                {selectedSource?.options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <button type="button" disabled={!sourceId || !optionId} onClick={() => onSave(sourceId, optionId)} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">Simpan kondisi</button>
          </div>
          {condition && <button type="button" onClick={onRemove} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /> Hapus kondisi</button>}
        </div>
      </div>
    </div>
  );
};
