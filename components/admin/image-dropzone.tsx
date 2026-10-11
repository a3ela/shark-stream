"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, Link as LinkIcon, RefreshCw } from "lucide-react";
import { uploadImageAction } from "@/lib/actions/upload";

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function ImageDropzone({
  value,
  onChange,
  label = "Logo Image",
  disabled = false,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadImageAction(formData);
      onChange(res.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      void handleFile(droppedFile);
    }
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      void handleFile(selectedFile);
    }
  }

  function handleRemove() {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="text-xs text-(--primary) hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="h-3 w-3" />
          {showUrlInput ? "Dropzone upload" : "Paste URL instead"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.ico,.svg"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {showUrlInput ? (
        <input
          type="url"
          value={value}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          placeholder="https://example.com/logo.png"
          className="w-full rounded-lg border border-(--border-color) bg-(--bg-glass) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-secondary)/40 focus:border-(--primary) focus:outline-none"
        />
      ) : value ? (
        /* Preview & Edit Area */
        <div className="relative flex items-center justify-between gap-4 rounded-xl border border-(--border-color) bg-(--bg-glass) p-3 transition-colors hover:border-(--border-color)/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-(--border-color) bg-black/20 p-1.5 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Logo preview"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-(--text-primary) truncate">
                Current Image
              </p>
              <p className="text-[11px] text-(--text-secondary)/60 truncate max-w-xs">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-white/5 px-2.5 py-1.5 text-xs font-medium text-(--text-primary) hover:bg-white/10 transition-colors cursor-pointer"
              title="Replace image"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Replace
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="inline-flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-(--primary) bg-(--primary)/10 scale-[1.01]"
              : "border-(--border-color) hover:border-(--primary)/50 bg-(--bg-glass)"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-(--primary)" />
              <p className="text-xs font-medium text-(--text-primary)">
                Uploading image to Cloudinary...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary) group-hover:scale-110 transition-transform">
                {isDragging ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <UploadCloud className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-(--text-primary)">
                  {isDragging ? "Drop your image here" : "Drag & drop image here, or browse"}
                </p>
                <p className="text-[11px] text-(--text-secondary)">
                  PNG, JPG, WebP, SVG, or ICO up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md px-2.5 py-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
