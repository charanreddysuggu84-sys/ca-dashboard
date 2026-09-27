import React, { useMemo, useState } from "react";
import { assetUrl } from "../api";
import { formatDateTime } from "../helpers";
import type { CollegeDetail } from "../types";

export default function CollegeGallery({
  college,
  onDeletePhoto,
}: {
  college: CollegeDetail;
  onDeletePhoto: (updateId: string, photoId: string) => void;
}) {
  const allPhotos = useMemo(() => {
    const sorted = [...college.updates].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const photos: { id: number; url: string; date: string; updateId: string }[] = [];
    for (const u of sorted) {
      for (const p of u.photos) {
        photos.push({ id: p.id, url: p.url, date: u.created_at, updateId: u.id });
      }
    }
    return photos;
  }, [college.updates]);

  const [slideIndex, setSlideIndex] = useState(0);

  if (allPhotos.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
        No photos uploaded yet for {college.name}.
      </div>
    );
  }

  const safeIndex = Math.min(slideIndex, allPhotos.length - 1);
  const current = allPhotos[safeIndex];

  function handleDelete() {
    if (!window.confirm("Delete this photo? This cannot be undone.")) return;
    onDeletePhoto(current.updateId, String(current.id));
    setSlideIndex((i) => Math.max(0, Math.min(i, allPhotos.length - 2)));
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video">
        <img
          src={assetUrl(current.url)}
          alt=""
          className="w-full h-full object-contain bg-slate-900"
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/50 text-white text-sm px-4 py-2">
          <span>{formatDateTime(current.date)}</span>
          <span>{safeIndex + 1} / {allPhotos.length}</span>
        </div>
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 transition-colors text-white text-xs font-semibold rounded-lg px-2.5 py-1.5"
        >
          Delete photo
        </button>
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={() => setSlideIndex((i) => (i === 0 ? allPhotos.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 transition-colors text-white rounded-full w-9 h-9 flex items-center justify-center"
            >
              &lt;
            </button>
            <button
              onClick={() => setSlideIndex((i) => (i === allPhotos.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 transition-colors text-white rounded-full w-9 h-9 flex items-center justify-center"
            >
              &gt;
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allPhotos.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setSlideIndex(idx)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
              idx === safeIndex ? "border-emerald-500" : "border-transparent hover:border-slate-300"
            }`}
          >
            <img src={assetUrl(p.url)} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}