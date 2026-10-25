"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

export interface CollegePhoto {
  type: string;
  title: string;
  path: string;
  alt: string;
}

interface PhotoGalleryProps {
  photos: CollegePhoto[];
  collegeName: string;
}

export function PhotoGallery({ photos, collegeName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % photos.length);
  }, [selectedIndex, photos.length]);

  const showPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos.length]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, closeLightbox, showNext, showPrev]);

  if (!photos || photos.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-500">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm">No campus photos recorded for this institution.</p>
      </div>
    );
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "campus":
        return "bg-blue-600/90 text-white";
      case "classroom":
        return "bg-indigo-600/90 text-white";
      case "lab":
        return "bg-purple-600/90 text-white";
      default:
        return "bg-slate-700/90 text-white";
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "campus":
        return "Campus Grounds";
      case "classroom":
        return "Smart Classroom";
      case "lab":
        return "Technical Lab";
      default:
        return "Facility";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Infrastructure &amp; Campus Verification Gallery
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
            {photos.length} Verified Photos
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
          Click any photo to inspect in high-resolution lightbox
        </span>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, idx) => (
          <div
            key={photo.path}
            onClick={() => openLightbox(idx)}
            className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xs cursor-pointer hover:shadow-md transition-all duration-200"
          >
            {/* Aspect Ratio Container with Lazy Loading */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-800">
              <img
                src={photo.path}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            </div>

            {/* Badges and Caption */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs ${getBadgeColor(
                  photo.type
                )}`}
              >
                {getLabel(photo.type)}
              </span>
            </div>

            <div className="absolute top-2.5 right-2.5">
              <span className="p-1 rounded-full bg-black/50 text-white/90 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <p className="text-xs font-semibold leading-tight line-clamp-1 drop-shadow-sm">
                {photo.title}
              </p>
              <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5 opacity-90">
                {photo.alt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/92 backdrop-blur-md p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/70 flex items-center justify-center text-blue-200 font-bold text-xs">
                {selectedIndex + 1}/{photos.length}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {photos[selectedIndex].title}
                </h4>
                <p className="text-xs text-slate-400">
                  {collegeName} • {getLabel(photos[selectedIndex].type)}
                </p>
              </div>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close photo preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Image View with Prev/Next Controls */}
          <div
            className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-4 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={showPrev}
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Photo Display */}
            <div className="relative max-h-[70vh] max-w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center">
              <img
                src={photos[selectedIndex].path}
                alt={photos[selectedIndex].alt}
                className="max-h-[68vh] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={showNext}
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-105"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Thumbnails & Captions */}
          <div
            className="w-full max-w-5xl flex flex-col items-center gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-slate-300 text-center max-w-2xl px-4 line-clamp-2">
              <span className="font-semibold text-blue-400">Alt description:</span>{" "}
              {photos[selectedIndex].alt}
            </p>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              {photos.map((p, idx) => (
                <button
                  key={p.path}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === selectedIndex
                      ? "border-blue-400 scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img src={p.path} alt={p.alt} className="w-full h-full object-cover" />
                  {idx === selectedIndex && (
                    <div className="absolute inset-0 bg-blue-500/20" />
                  )}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 flex items-center gap-2">
              <span>Use Left/Right arrow keys to navigate, Esc to close</span>
              <span>•</span>
              <span>Attribution: credits.md</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
