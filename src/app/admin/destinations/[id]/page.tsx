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
  X,
  Star,
} from "lucide-react";
import { AdminHeader } from "../../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import { getEmbedUrl } from "@/lib/utils";
import type { DestinationRow } from "@/lib/supabase/types";

type Tab = "details" | "media" | "content";

const tabLabels: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "media", label: "Media" },
  { id: "content", label: "Content" },
];

const categoryOptions = [
  { value: "destination", label: "Destination" },
  { value: "experience", label: "Experience" },
  { value: "activity", label: "Activity" },
];

export default function DestinationEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("details");

  // Details tab state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("destination");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [sailingTime, setSailingTime] = useState("");
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [sortOrder, setSortOrder] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapLabel, setMapLabel] = useState("");

  // Media tab state
  const [coverImage, setCoverImage] = useState("");
  const [coverStoragePath, setCoverStoragePath] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Content tab state
  const [bestFor, setBestFor] = useState<string[]>([]);
  const [bestForInput, setBestForInput] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");
  const [whatIncluded, setWhatIncluded] = useState<string[]>([]);
  const [whatIncludedInput, setWhatIncludedInput] = useState("");
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [itineraryInput, setItineraryInput] = useState("");

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      setCategory(dest.category || "destination");
      setShortDescription(dest.short_description || "");
      setDescription(dest.description || "");
      setDuration(dest.duration || "");
      setSailingTime(dest.sailing_time || "");
      setPriceFrom(dest.price_from ? String(dest.price_from) : "");
      setSortOrder(dest.sort_order || 0);
      setFeatured(dest.featured || false);
      setLatitude(dest.latitude ? String(dest.latitude) : "");
      setLongitude(dest.longitude ? String(dest.longitude) : "");
      setMapLabel(dest.map_label || "");

      setCoverImage(dest.cover_image || dest.image || "");
      setGalleryImages(dest.gallery_images || []);
      setVideoUrl(dest.video_url || "");

      setBestFor(dest.best_for || []);
      setHighlights(dest.highlights || []);
      setWhatIncluded(dest.what_included || []);
      setItinerary(dest.itinerary || []);
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

  // --- Upload helpers ---
  const validateFile = (file: File) => {
    if (
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type
      )
    ) {
      alert("Please select a valid image file (JPEG, PNG, WebP, or AVIF)");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return false;
    }
    return true;
  };

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
    const storagePath = `destinations/${fileName}`;

    const { error } = await supabase.storage
      .from("destination-photos")
      .upload(storagePath, file, { cacheControl: "31536000", upsert: false });

    if (error) {
      alert(`Upload failed: ${error.message}`);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("destination-photos").getPublicUrl(storagePath);

    return publicUrl;
  }, []);

  const handleCoverUpload = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;
      setUploadingCover(true);

      // Delete old cover if exists
      if (coverStoragePath) {
        const supabase = createClient();
        await supabase.storage
          .from("destination-photos")
          .remove([coverStoragePath]);
      }

      const url = await uploadFile(file);
      if (url) {
        setCoverImage(url);
        setCoverStoragePath("");
      }
      setUploadingCover(false);
    },
    [coverStoragePath, uploadFile]
  );

  const handleGalleryUpload = useCallback(
    async (files: FileList) => {
      setUploadingGallery(true);
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!validateFile(file)) continue;
        const url = await uploadFile(file);
        if (url) newUrls.push(url);
      }

      if (newUrls.length > 0) {
        setGalleryImages((prev) => [...prev, ...newUrls]);
      }
      setUploadingGallery(false);
    },
    [uploadFile]
  );

  function removeGalleryImage(index: number) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeCoverImage() {
    if (!confirm("Remove cover image?")) return;
    if (coverStoragePath) {
      const supabase = createClient();
      await supabase.storage
        .from("destination-photos")
        .remove([coverStoragePath]);
    }
    setCoverImage("");
    setCoverStoragePath("");
  }

  // --- Save ---
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
      category,
      short_description: shortDescription.trim() || null,
      description: description.trim(),
      duration: duration.trim() || null,
      sailing_time: sailingTime.trim(),
      price_from: priceFrom ? parseInt(priceFrom) || null : null,
      sort_order: sortOrder,
      featured,
      latitude: latitude ? parseFloat(latitude) || null : null,
      longitude: longitude ? parseFloat(longitude) || null : null,
      map_label: mapLabel.trim() || null,
      image: coverImage,
      cover_image: coverImage || null,
      gallery_images: galleryImages,
      video_url: videoUrl.trim() || null,
      best_for: bestFor,
      highlights,
      what_included: whatIncluded,
      itinerary,
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

  // --- Array helpers ---
  function addToArray(
    arr: string[],
    setArr: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void
  ) {
    const val = input.trim();
    if (val && !arr.includes(val)) {
      setArr([...arr, val]);
      setInput("");
    }
  }

  // --- Video preview ---
  const embedPreviewUrl = getEmbedUrl(videoUrl);

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  ? "Create a new destination or experience"
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

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-800 border border-white/5 mb-8">
          {tabLabels.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 shadow-lg shadow-gold-500/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Details */}
        {activeTab === "details" && (
          <div className="space-y-8">
            <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
              <h2 className="font-heading text-lg font-bold text-white">
                Basic Information
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
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="admin-input"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Short Description{" "}
                  <span className="text-white/30">(for cards)</span>
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="admin-input"
                  placeholder="Brief one-liner for preview cards..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Full Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="admin-input"
                  placeholder="Detailed description for the experience page..."
                />
              </div>
            </div>

            <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
              <h2 className="font-heading text-lg font-bold text-white">
                Details & Pricing
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="admin-input"
                    placeholder="e.g. 2-3 hours"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Price From (AED)
                  </label>
                  <input
                    type="number"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    className="admin-input"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(parseInt(e.target.value) || 0)
                    }
                    className="admin-input"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        featured
                          ? "bg-gold-500 border-gold-500"
                          : "border-white/20 bg-navy-900"
                      }`}
                      onClick={() => setFeatured(!featured)}
                    >
                      {featured && (
                        <Star className="w-3 h-3 text-navy-950" />
                      )}
                    </div>
                    <span
                      className="text-sm text-white/60"
                      onClick={() => setFeatured(!featured)}
                    >
                      Featured on homepage
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
              <h2 className="font-heading text-lg font-bold text-white">
                Location{" "}
                <span className="text-white/30 text-sm font-normal">
                  (for map)
                </span>
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="admin-input"
                    placeholder="e.g. 25.1124"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="admin-input"
                    placeholder="e.g. 55.1380"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Map Label
                  </label>
                  <input
                    type="text"
                    value={mapLabel}
                    onChange={(e) => setMapLabel(e.target.value)}
                    className="admin-input"
                    placeholder="Short label for map pin"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Media */}
        {activeTab === "media" && (
          <div className="space-y-8">
            {/* Cover Image */}
            <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
              <h2 className="font-heading text-lg font-bold text-white">
                Cover Image
              </h2>

              {coverImage ? (
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-navy-700">
                  <Image
                    src={coverImage}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                  <button
                    onClick={removeCoverImage}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
                >
                  {uploadingCover ? (
                    <div className="space-y-3">
                      <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto" />
                      <p className="text-white/60">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 font-medium">
                        Click to upload cover image
                      </p>
                      <p className="mt-2 text-sm text-white/30">
                        JPEG, PNG, WebP, AVIF &middot; Max 5MB
                      </p>
                    </>
                  )}
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]);
                }}
                className="hidden"
              />
            </div>

            {/* Gallery Images */}
            <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-white">
                  Gallery Images
                </h2>
                <span className="text-sm text-white/30">
                  {galleryImages.length} image
                  {galleryImages.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Upload area */}
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all"
              >
                {uploadingGallery ? (
                  <div className="space-y-3">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" />
                    <p className="text-white/60">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Plus className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60 font-medium text-sm">
                      Click to add gallery images
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      Multiple files supported
                    </p>
                  </>
                )}
              </div>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={(e) => {
                  if (e.target.files) handleGalleryUpload(e.target.files);
                }}
                className="hidden"
              />

              {/* Gallery grid */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {galleryImages.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-navy-700 group"
                    >
                      <Image
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      <button
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-navy-950/70 text-[10px] text-white/60">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video URL */}
            <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-5">
              <h2 className="font-heading text-lg font-bold text-white">
                Video
              </h2>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  YouTube or Vimeo URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="admin-input"
                  placeholder="e.g. https://youtube.com/watch?v=..."
                />
              </div>

              {/* Video Preview */}
              {embedPreviewUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-navy-700">
                  <iframe
                    src={embedPreviewUrl}
                    title="Video preview"
                    className="absolute inset-0 w-full h-full"
                    allow="fullscreen"
                    allowFullScreen
                  />
                </div>
              )}

              {videoUrl && !embedPreviewUrl && (
                <p className="text-sm text-red-400">
                  Unrecognized video URL format. Supported: YouTube, Vimeo.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Content */}
        {activeTab === "content" && (
          <div className="space-y-8">
            {/* Best For */}
            <ArrayEditor
              title="Best For"
              placeholder="e.g. Photography, Sunset cruise"
              items={bestFor}
              setItems={setBestFor}
              input={bestForInput}
              setInput={setBestForInput}
              onAdd={() =>
                addToArray(bestFor, setBestFor, bestForInput, setBestForInput)
              }
              tagStyle
            />

            {/* Highlights */}
            <ArrayEditor
              title="Highlights"
              placeholder="e.g. Crystal clear swimming spots"
              items={highlights}
              setItems={setHighlights}
              input={highlightInput}
              setInput={setHighlightInput}
              onAdd={() =>
                addToArray(
                  highlights,
                  setHighlights,
                  highlightInput,
                  setHighlightInput
                )
              }
            />

            {/* What's Included */}
            <ArrayEditor
              title="What's Included"
              placeholder="e.g. Professional crew, Refreshments"
              items={whatIncluded}
              setItems={setWhatIncluded}
              input={whatIncludedInput}
              setInput={setWhatIncludedInput}
              onAdd={() =>
                addToArray(
                  whatIncluded,
                  setWhatIncluded,
                  whatIncludedInput,
                  setWhatIncludedInput
                )
              }
            />

            {/* Itinerary */}
            <ArrayEditor
              title="Itinerary"
              placeholder="e.g. Board at Dubai Harbour, Set sail towards Palm Jumeirah"
              items={itinerary}
              setItems={setItinerary}
              input={itineraryInput}
              setInput={setItineraryInput}
              onAdd={() =>
                addToArray(
                  itinerary,
                  setItinerary,
                  itineraryInput,
                  setItineraryInput
                )
              }
              numbered
            />
          </div>
        )}
      </div>
    </>
  );
}

// --- Reusable ArrayEditor sub-component ---
function ArrayEditor({
  title,
  placeholder,
  items,
  setItems,
  input,
  setInput,
  onAdd,
  tagStyle,
  numbered,
}: {
  title: string;
  placeholder: string;
  items: string[];
  setItems: (v: string[]) => void;
  input: string;
  setInput: (v: string) => void;
  onAdd: () => void;
  tagStyle?: boolean;
  numbered?: boolean;
}) {
  return (
    <div className="p-6 bg-navy-800 rounded-xl border border-white/5 space-y-4">
      <h2 className="font-heading text-lg font-bold text-white">{title}</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          className="admin-input flex-1"
          placeholder={placeholder}
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {tagStyle ? (
        <div className="flex flex-wrap gap-2">
          {items.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/10 text-gold-400 text-sm"
            >
              {tag}
              <button
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between p-3 bg-navy-900 rounded-lg border border-white/5"
            >
              <div className="flex items-center gap-3">
                {numbered && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500/10 text-gold-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                )}
                <span className="text-sm text-white/70">{item}</span>
              </div>
              <button
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="p-1 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
