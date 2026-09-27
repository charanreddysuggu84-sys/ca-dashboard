import React, { useState } from "react";

import { useColleges } from "../CollegesContext";

import { api } from "../api";


export default function MergeCollegesModal({
  onClose,
  onMerged,
}: {
  onClose: () => void;
  onMerged: () => Promise<void>;
}) {
  const { colleges } = useColleges();

  const [sourceId, setSourceId] = useState("");

  const [targetId, setTargetId] = useState("");

  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState<string | null>(null);


  const sorted = [...colleges].sort((a, b) =>
    a.name.localeCompare(b.name)
  );


  async function handleMerge() {
    setErr(null);

    if (!sourceId || !targetId) {
      setErr("Pick both colleges.");
      return;
    }

    if (sourceId === targetId) {
      setErr("Pick two different colleges.");
      return;
    }


    const sourceName = sorted.find((c) => c.id === sourceId)?.name;

    const targetName = sorted.find((c) => c.id === targetId)?.name;


    if (
      !window.confirm(
        `Merge "${sourceName}" into "${targetName}"?\n\nAll applicants and daily updates from "${sourceName}" will move to "${targetName}", and "${sourceName}" will be deleted. This cannot be undone.`
      )
    ) {
      return;
    }


    setSaving(true);

    try {
      await api.mergeColleges(sourceId, targetId);

      await onMerged();
    } catch (e: any) {
      setErr(e?.message || "Could not merge.");
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4">

        <h3 className="text-lg font-semibold text-slate-800">
          Merge duplicate colleges
        </h3>


        <p className="text-sm text-slate-500">
          Use this when two entries are the same college (typo on the
          registration form). Pick the duplicate to remove, and the
          correct one to keep everything under.
        </p>


        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Duplicate (will be deleted)
          </label>

          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg p-2"
          >
            <option value="">Select college…</option>

            {sorted.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Keep everything under
          </label>

          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-lg p-2"
          >
            <option value="">Select college…</option>

            {sorted.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>


        {err && (
          <div className="text-xs text-red-600">
            {err}
          </div>
        )}


        <div className="flex gap-2 justify-end pt-2">

          <button
            onClick={onClose}
            disabled={saving}
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
          >
            Cancel
          </button>


          <button
            onClick={handleMerge}
            disabled={saving}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white disabled:opacity-50"
          >
            {saving ? "Merging…" : "Merge"}
          </button>

        </div>

      </div>

    </div>
  );
}