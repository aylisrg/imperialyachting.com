"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Trash2,
  Loader2,
  ImageIcon,
  Star,
  GripVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { YachtImage } from "@/lib/supabase/types";
import {
  compressImage,
  shouldCompressImage,
  formatFileSize,
  getOptimalCompressionSettings,
} from "@/lib/image-compression";

const CATEGORIES = [
  { value: "hero", label: "Hero (Main)" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "cabin", label: "Cabin" },
  { value: "deck", label: "Deck" },
  { value: "dining", label: "Dining" },
  { value: "other", label: "Other" },
] as const;

interface PhotoUploaderProps {
  yachtId: string;
  images: YachtImage[];
  onRefresh: () => void;
}

export function PhotoUploader({ yachtId, images, onRefresh }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      setUploadProgress([]);
      const supabase = createClient();

      const fileArray = Array.from(files).filter((f) =>
        ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(f.type)
      );

      if (fileArray.length === 0) {
        alert("Please select valid image files (JPEG, PNG, WebP, or AVIF)");
        setUploading(false);
        return;
      }

      for (const file of fileArray) {
        const originalSize = formatFileSize(file.size);
        let processedFile = file;

        // Compress image if needed
        if (shouldCompressImage(file, 2)) {
          setUploadProgress((prev) => [
            ...prev,
            `Compressing ${file.name} (${originalSize})...`,
          ]);

          try {
            const compressionSettings = getOptimalCompressionSettings(file.size);
            const result = await compressImage(file, {
              ...compressionSettings,
              onProgress: (progress) => {
                setUploadProgress((prev) => {
                  const newProgress = [...prev];
                  newProgress[newProgress.length - 1] =
                    `Compressing ${file.name}: ${progress}%`;
                  return newProgress;
                });
              },
            });

            processedFile = result.compressedFile;
            const compressedSize = formatFileSize(result.compressedSize);
            setUploadProgress((prev) => [
              ...prev.slice(0, -1),
              `Compressed ${file.name}: ${originalSize} → ${compressedSize} (${result.compressionPercentage}% saved)`,
            ]);
          } catch (error) {
            console.error("Compression failed:", error);
            setUploadProgress((prev) => [
              ...prev.slice(0, -1),
              `Compression failed for ${file.name}, uploading original...`,
            ]);
            // Continue with original file if compression fails
          }
        } else {
          setUploadProgress((prev) => [
            ...prev,
            `${file.name} is already optimized (${originalSize})`,
          ]);
        }

        // Generate filename from processed file
        const fileName = `${Date.now()}-${processedFile.name.replace(/[^a-z0-9.-]/gi, "_")}`;
        const storagePath = `${yachtId}/${fileName}`;

        setUploadProgress((prev) => [...prev, `Uploading ${file.name}...`]);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("yacht-photos")
          .upload(storagePath, processedFile, {
            cacheControl: "31536000",
            upsert: false,
          });

        if (uploadError) {
          setUploadProgress((prev) => [
            ...prev,
            `Failed: ${file.name} — ${uploadError.message}`,
          ]);
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("yacht-photos").getPublicUrl(storagePath);

        // Determine category from filename
        let category: string = "other";
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes("hero")) category = "hero";
        else if (lowerName.includes("exterior")) category = "exterior";
        else if (lowerName.includes("interior")) category = "interior";
        else if (lowerName.includes("cabin")) category = "cabin";
        else if (lowerName.includes("deck") || lowerName.includes("flybridge"))
          category = "deck";
        else if (lowerName.includes("dining")) category = "dining";

        // Save to database
        await supabase.from("yacht_images").insert({
          yacht_id: yachtId,
          url: publicUrl,
          storage_path: storagePath,
          category,
          sort_order: images.length + fileArray.indexOf(file),
        });

        setUploadProgress((prev) => [
          ...prev.slice(0, -1),
          `✓ Uploaded: ${file.name}`,
        ]);
      }

      setUploading(false);
      onRefresh();
    },
    [yachtId, images.length, onRefresh]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        uploadFiles(e.target.files);
      }
    },
    [uploadFiles]
  );

  async function deleteImage(image: YachtImage) {
    if (!confirm("Delete this photo?")) return;

    const supabase = createClient();

    // Remove from storage
    if (image.storage_path) {
      await supabase.storage.from("yacht-photos").remove([image.storage_path]);
    }

    // Remove from database
    await supabase.from("yacht_images").delete().eq("id", image.id);
    onRefresh();
  }

  async function updateCategory(imageId: string, category: string) {
    // When setting to hero, use the full hero-promotion logic
    if (category === "hero") {
      await setAsHero(imageId);
      return;
    }
    const supabase = createClient();
    await supabase
      .from("yacht_images")
      .update({ category })
      .eq("id", imageId);
    onRefresh();
  }

  async function setAsHero(imageId: string) {
    const supabase = createClient();
    // Demote all existing hero images to exterior and shift their sort_order
    // so they don't conflict with the new hero at sort_order 0
    const existingHeroes = images.filter(
      (img) => img.category === "hero" && img.id !== imageId
    );
    for (const hero of existingHeroes) {
      await supabase
        .from("yacht_images")
        .update({ category: "exterior", sort_order: images.length })
        .eq("id", hero.id);
    }
    // Set selected image as hero at position 0
    await supabase
      .from("yacht_images")
      .update({ category: "hero", sort_order: 0 })
      .eq("id", imageId);
    onRefresh();
  }

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-gold-500 bg-gold-500/5"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto" />
            <p className="text-white/60">Uploading photos...</p>
            <div className="text-sm text-white/40 space-y-1">
              {uploadProgress.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 font-medium">
              Drag & drop photos here, or click to browse
            </p>
            <p className="mt-2 text-sm text-white/30">
              JPEG, PNG, WebP, AVIF &middot; Large files will be automatically
              compressed
            </p>
            <p className="mt-1 text-xs text-white/20">
              Max recommended: 2048px &middot; Files &gt;2MB compressed to ~2MB
            </p>
          </>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold text-white mb-4">
            Photos ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative bg-navy-800 rounded-xl overflow-hidden border border-white/5"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Hero badge */}
                  {image.category === "hero" && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gold-500/90 text-navy-950 text-xs font-bold">
                      <Star className="w-3 h-3" />
                      Hero
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {image.category !== "hero" && (
                      <button
                        onClick={() => setAsHero(image.id)}
                        className="p-2 rounded-lg bg-gold-500/80 text-navy-950 hover:bg-gold-500"
                        title="Set as hero image"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteImage(image)}
                      className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category selector */}
                <div className="p-2">
                  <select
                    value={image.category}
                    onChange={(e) => updateCategory(image.id, e.target.value)}
                    className="w-full px-2 py-1 rounded bg-navy-900 border border-white/5 text-white/60 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-12 bg-navy-800 rounded-xl border border-white/5">
          <ImageIcon className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-white/40">No photos uploaded yet</p>
          <p className="mt-1 text-sm text-white/25">
            Drag & drop or click the upload area above
          </p>
        </div>
      )}
    </div>
  );
}
