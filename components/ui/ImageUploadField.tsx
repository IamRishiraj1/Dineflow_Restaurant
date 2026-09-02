"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { compressImage, MAX_UPLOAD_SIZE_BYTES, ACCEPTED_IMAGE_TYPES } from "@/lib/image-compress";
import { Input } from "./Input";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

export function ImageUploadField({ label, value, onChange, hint }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPEG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError("That image is over 5MB — please choose a smaller one.");
      return;
    }

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Upload failed. Please try again.");

      onChange(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-ink-800">{label}</label>

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 text-ink-400 transition-colors hover:border-ember-400 hover:text-ember-500 disabled:cursor-wait",
            value && "border-solid border-ink-200"
          )}
          aria-label={value ? "Replace photo" : "Upload photo"}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : value ? (
            <Image src={value} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
            }}
          />
          <p className="text-xs text-ink-500">
            {isUploading
              ? "Uploading…"
              : "Click the square to upload a photo (JPEG, PNG, WEBP, or GIF, under 5MB)."}
          </p>

          {value && !isUploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-error-500"
            >
              <X className="h-3.5 w-3.5" /> Remove photo
            </button>
          )}

          {error && <p className="text-xs text-error-500">{error}</p>}

          <details className="text-xs">
            <summary className="cursor-pointer text-ink-400 hover:text-ink-600">
              Or paste an image URL instead
            </summary>
            <div className="mt-2">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://…"
                hint={hint}
              />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
