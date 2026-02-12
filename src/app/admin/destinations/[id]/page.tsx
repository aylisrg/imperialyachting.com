"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { AdminHeader } from "../../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { DestinationRow } from "@/lib/supabase/types";

export default function DestinationEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sailingTime, setSailingTime] = useState("");
  const [bestFor, setBestFor] = useState<string[]>([]);
  const [bestForInput, setBestForInput] = useState("");
  const [image, setImage] = useState("");
  const [imageStoragePath, setImageStoragePath] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew) loadDestination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDestination() {
    const supabase = createClient();
    const { data } = await supabase
      .from("destinations")
      .select("*")
      .eq("id", id)
      .single();

    const dest = data as DestinationRow | null;
    if (dest) {
      setName(dest.name);
      setSlug(dest.slug);
      setDescription(dest.description || "");
      setSailingTime(dest.sailing_time || "");
      setBestFor(dest.best_for || []);
      setImage(dest.image || "");
      setHighlights(dest.highlights || []);
      setSortOrder(dest.sort_order || 0);
    }
    setLoading(false);
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  const handleUpload = useCallback(
    async (file: File) => {
      if (
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          file.type
        )
      ) {
        alert("Please select a valid image file (JPEG, PNG, WebP, or AVIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Max 5MB.");
        return;
      }

      setUploading(true);
      const supabase = createClient();

      // Delete old image if exists
      if (imageStoragePath) {
        await supabase.storage
          .from("destination-photos")
          .remove([imageStoragePath]);
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      const storagePath = `destinations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("destination-photos")
        .upload(storagePath, file, {
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        alert(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("destination-photos")
        .getPublicUrl(storagePath);

      setImage(publicUrl);
      setImageStoragePath(storagePath);
      setUploading(false);
    },
    [imageStoragePath]
  );

  async function removeImage() {
    if (!confirm("Remove this image?")) return;

    if (imageStoragePath) {
      const supabase = createClient();
      await supabase.storage
        .from("destination-photos")
        .remove([imageStoragePath]);
    }
    setImage("");
    setImageStoragePath("");
  }

  async function handleSave() {
    if (!name.trim() || !slug.trim()) {
      alert("Name and slug are required.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      sailing_time: sailingTime.trim(),
      best_for: bestFor,
      image,
      highlights,
      sort_order: sortOrder,
    };

    if (isNew) {
      const { error } = await supabase.from("destinations").insert(payload);
      if (error) {
        alert(`Error: ${error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("destinations")
        .update(payload)
        .eq("id", id);
      if (error) {
        alert(`Error: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.push("/admin/destinations");
  }

  function addBestFor() {
    const tag = bestForInput.trim();
    if (tag && !bestFor.includes(tag)) {
      setBestFor([...bestFor, tag]);
      setBestForInput("");
    }
  }

  function addHighlight() {
    const item = highlightInput.trim();
    if (item && !highlights.includes(item)) {
      setHighlights([...highlights, item]);
      setHighlightInput("");
    }
  }

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/destinations")}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">
                {isNew ? "Add Destination" : "Edit Destination"}
              </h1>
              <p className="mt-1 text-sm text-white/40">
                {isNew
                  ? "Create a new charter destination"
                  : `Editing: ${name}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
            <h2 className="font-heading text-lg font-bold text-white">
              Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Name <span className="text-gold-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (isNew) setSlug(generateSlug(e.target.value));
                  }}
                  className="admin-input"
                  placeholder="e.g. Palm Jumeirah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Slug <span className="text-gold-500">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="admin-input"
                  placeholder="palm-jumeirah"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="admin-input"
                placeholder="Describe this destination..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Sailing Time
                </label>
                <input
                  type="text"
                  value={sailingTime}
                  onChange={(e) => setSailingTime(e.target.value)}
                  className="admin-input"
                  placeholder="e.g. 15-30 min from Dubai Harbour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="admin-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
            <h2 className="font-heading text-lg font-bold text-white">
              Image
            </h2>

            {image ? (
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-navy-700">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
              >
                {uploading ? (
                  <div className="space-y-3">
                    <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto" />
                    <p className="text-white/60">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 font-medium">
                      Click to upload destination image
                    </p>
                    <p className="mt-2 text-sm text-white/30">
                      JPEG, PNG, WebP, AVIF &middot; Max 5MB
                    </p>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUpload(e.target.files[0]);
              }}
              className="hidden"
            />
          </div>

          {/* Best For Tags */}
          <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-4">
            <h2 className="font-heading text-lg font-bold text-white">
              Best For
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={bestForInput}
                onChange={(e) => setBestForInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBestFor();
                  }
                }}
                className="admin-input flex-1"
                placeholder="e.g. Photography, Sunset cruise"
              />
              <button
                onClick={addBestFor}
                className="px-4 py-2 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {bestFor.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/10 text-gold-400 text-sm"
                >
                  {tag}
                  <button
                    onClick={() =>
                      setBestFor(bestFor.filter((_, j) => j !== i))
                    }
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-4">
            <h2 className="font-heading text-lg font-bold text-white">
              Highlights
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                className="admin-input flex-1"
                placeholder="e.g. Crystal clear swimming spots"
              />
              <button
                onClick={addHighlight}
                className="px-4 py-2 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <ul className="space-y-2">
              {highlights.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between p-3 bg-navy-900 rounded-lg border border-white/5"
                >
                  <span className="text-sm text-white/70">{item}</span>
                  <button
                    onClick={() =>
                      setHighlights(highlights.filter((_, j) => j !== i))
                    }
                    className="p-1 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
