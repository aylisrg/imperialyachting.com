"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Video,
} from "lucide-react";
import { AdminHeader } from "../../components/AdminHeader";
import { PhotoUploader } from "../../components/PhotoUploader";
import { createClient } from "@/lib/supabase/client";
import type {
  Database,
  Yacht,
  YachtImage,
  YachtSpec,
  YachtAmenity as YachtAmenityType,
  YachtPricing,
  YachtIncluded,
} from "@/lib/supabase/types";

type FormYacht = Omit<Yacht, "id" | "created_at" | "updated_at">;

const defaultYacht: FormYacht = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  builder: "",
  year: 2024,
  refit: null,
  length_ft: 0,
  length_m: 0,
  capacity: 0,
  cabins: null,
  location: "Dubai Harbour",
  featured: false,
  youtube_shorts: [],
  youtube_video: "",
  show_videos: false,
};

export default function YachtEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [yacht, setYacht] = useState<FormYacht>(defaultYacht);
  const [images, setImages] = useState<YachtImage[]>([]);
  const [specs, setSpecs] = useState<Omit<YachtSpec, "id">[]>([]);
  const [amenities, setAmenities] = useState<Omit<YachtAmenityType, "id">[]>([]);
  const [pricing, setPricing] = useState<Omit<YachtPricing, "id">[]>([]);
  const [included, setIncluded] = useState<Omit<YachtIncluded, "id">[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "photos" | "videos" | "specs" | "pricing">("details");

  const loadYacht = useCallback(async () => {
    if (isNew) return;
    const supabase = createClient();

    const [yachtRes, imagesRes, specsRes, amenitiesRes, pricingRes, includedRes] =
      await Promise.all([
        supabase.from("yachts").select("*").eq("id", id).single(),
        supabase.from("yacht_images").select("*").eq("yacht_id", id).order("sort_order"),
        supabase.from("yacht_specs").select("*").eq("yacht_id", id).order("sort_order"),
        supabase.from("yacht_amenities").select("*").eq("yacht_id", id).order("sort_order"),
        supabase.from("yacht_pricing").select("*").eq("yacht_id", id).order("sort_order"),
        supabase.from("yacht_included").select("*").eq("yacht_id", id).order("sort_order"),
      ]);

    if (yachtRes.data) {
      const raw = yachtRes.data as Yacht;
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = raw;
      setYacht(rest);
    }
    if (imagesRes.data) setImages(imagesRes.data as YachtImage[]);
    if (specsRes.data) setSpecs(specsRes.data as YachtSpec[]);
    if (amenitiesRes.data) setAmenities(amenitiesRes.data as YachtAmenityType[]);
    if (pricingRes.data) setPricing(pricingRes.data as YachtPricing[]);
    if (includedRes.data) setIncluded(includedRes.data as YachtIncluded[]);

    setLoading(false);
  }, [id, isNew]);

  useEffect(() => {
    loadYacht();
  }, [loadYacht]);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    try {
      let yachtId = id;

      if (isNew) {
        const { data, error } = await supabase
          .from("yachts")
          .insert(yacht as Database["public"]["Tables"]["yachts"]["Insert"])
          .select("id")
          .single();
        if (error) throw error;
        yachtId = (data as { id: string }).id;
      } else {
        const { error } = await supabase
          .from("yachts")
          .update(yacht as Database["public"]["Tables"]["yachts"]["Update"])
          .eq("id", id);
        if (error) throw error;
      }

      // Save specs
      await supabase.from("yacht_specs").delete().eq("yacht_id", yachtId);
      if (specs.length > 0) {
        const specInserts = specs.map((s, i) => ({
          yacht_id: yachtId,
          label: s.label,
          value: s.value,
          sort_order: i,
        })) as Database["public"]["Tables"]["yacht_specs"]["Insert"][];
        await supabase.from("yacht_specs").insert(specInserts);
      }

      // Save amenities
      await supabase.from("yacht_amenities").delete().eq("yacht_id", yachtId);
      if (amenities.length > 0) {
        const amenityInserts = amenities.map((a, i) => ({
          yacht_id: yachtId,
          icon: a.icon,
          label: a.label,
          sort_order: i,
        })) as Database["public"]["Tables"]["yacht_amenities"]["Insert"][];
        await supabase.from("yacht_amenities").insert(amenityInserts);
      }

      // Save pricing
      await supabase.from("yacht_pricing").delete().eq("yacht_id", yachtId);
      if (pricing.length > 0) {
        const pricingInserts = pricing.map((p, i) => ({
          yacht_id: yachtId,
          season: p.season,
          period: p.period,
          daily: p.daily,
          weekly: p.weekly,
          monthly: p.monthly,
          daily_b2b: p.daily_b2b,
          weekly_b2b: p.weekly_b2b,
          monthly_b2b: p.monthly_b2b,
          sort_order: i,
        })) as Database["public"]["Tables"]["yacht_pricing"]["Insert"][];
        await supabase.from("yacht_pricing").insert(pricingInserts);
      }

      // Save included items
      await supabase.from("yacht_included").delete().eq("yacht_id", yachtId);
      if (included.length > 0) {
        const includedInserts = included.map((item, i) => ({
          yacht_id: yachtId,
          item: item.item,
          sort_order: i,
        })) as Database["public"]["Tables"]["yacht_included"]["Insert"][];
        await supabase.from("yacht_included").insert(includedInserts);
      }

      if (isNew) {
        router.push(`/admin/yachts/${yachtId}`);
      }
      router.refresh();
      alert("Saved successfully!");
    } catch (err) {
      alert(`Error saving: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
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

  const tabs = [
    { id: "details" as const, label: "Details" },
    { id: "photos" as const, label: `Photos (${images.length})`, disabled: isNew },
    { id: "videos" as const, label: `Videos${yacht.youtube_shorts.length > 0 ? ` (${yacht.youtube_shorts.length})` : ""}` },
    { id: "specs" as const, label: "Specs & Amenities" },
    { id: "pricing" as const, label: "Pricing" },
  ];

  return (
    <>
      <AdminHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back & Save */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Fleet
          </button>
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
            {isNew ? "Create Yacht" : "Save Changes"}
          </button>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl font-bold text-white mb-6">
          {isNew ? "Add New Yacht" : `Edit: ${yacht.name}`}
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-navy-800 rounded-xl p-1 border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                  : tab.disabled
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <DetailsTab yacht={yacht} setYacht={setYacht} generateSlug={generateSlug} />
        )}
        {activeTab === "photos" && !isNew && (
          <PhotoUploader yachtId={id} images={images} onRefresh={loadYacht} />
        )}
        {activeTab === "videos" && (
          <VideosTab yacht={yacht} setYacht={setYacht} />
        )}
        {activeTab === "specs" && (
          <SpecsTab
            specs={specs}
            setSpecs={setSpecs}
            amenities={amenities}
            setAmenities={setAmenities}
            included={included}
            setIncluded={setIncluded}
          />
        )}
        {activeTab === "pricing" && (
          <PricingTab pricing={pricing} setPricing={setPricing} />
        )}
      </div>
    </>
  );
}

/* ============================================================
   Tab: Details
   ============================================================ */
function DetailsTab({
  yacht,
  setYacht,
  generateSlug,
}: {
  yacht: FormYacht;
  setYacht: (y: FormYacht) => void;
  generateSlug: (name: string) => string;
}) {
  function update(field: keyof FormYacht, value: unknown) {
    setYacht({ ...yacht, [field]: value });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Yacht Name" required>
          <input
            type="text"
            value={yacht.name}
            onChange={(e) => {
              update("name", e.target.value);
              if (!yacht.slug || yacht.slug === generateSlug(yacht.name)) {
                update("slug", generateSlug(e.target.value));
              }
            }}
            className="admin-input"
            placeholder="Monte Carlo 6"
          />
        </Field>
        <Field label="URL Slug" required>
          <input
            type="text"
            value={yacht.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="admin-input"
            placeholder="monte-carlo-6"
          />
        </Field>
      </div>

      <Field label="Tagline">
        <input
          type="text"
          value={yacht.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          className="admin-input"
          placeholder="60ft of Pure Italian Elegance"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={yacht.description}
          onChange={(e) => update("description", e.target.value)}
          rows={5}
          className="admin-input"
          placeholder="Full description of the yacht..."
        />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <Field label="Builder">
          <input
            type="text"
            value={yacht.builder}
            onChange={(e) => update("builder", e.target.value)}
            className="admin-input"
            placeholder="Monte Carlo Yachts"
          />
        </Field>
        <Field label="Year">
          <input
            type="number"
            value={yacht.year}
            onChange={(e) => update("year", parseInt(e.target.value) || 0)}
            className="admin-input"
          />
        </Field>
        <Field label="Refit Year">
          <input
            type="number"
            value={yacht.refit || ""}
            onChange={(e) =>
              update("refit", e.target.value ? parseInt(e.target.value) : null)
            }
            className="admin-input"
            placeholder="Optional"
          />
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            value={yacht.capacity}
            onChange={(e) => update("capacity", parseInt(e.target.value) || 0)}
            className="admin-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <Field label="Length (ft)">
          <input
            type="number"
            value={yacht.length_ft}
            onChange={(e) => update("length_ft", parseInt(e.target.value) || 0)}
            className="admin-input"
          />
        </Field>
        <Field label="Length (m)">
          <input
            type="number"
            value={yacht.length_m}
            onChange={(e) => update("length_m", parseInt(e.target.value) || 0)}
            className="admin-input"
          />
        </Field>
        <Field label="Cabins">
          <input
            type="number"
            value={yacht.cabins || ""}
            onChange={(e) =>
              update("cabins", e.target.value ? parseInt(e.target.value) : null)
            }
            className="admin-input"
            placeholder="Optional"
          />
        </Field>
        <Field label="Location">
          <input
            type="text"
            value={yacht.location}
            onChange={(e) => update("location", e.target.value)}
            className="admin-input"
            placeholder="Dubai Harbour"
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          checked={yacht.featured}
          onChange={(e) => update("featured", e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-navy-900 text-gold-500 focus:ring-gold-500/50"
        />
        <label htmlFor="featured" className="text-sm text-white/60">
          Featured yacht (shown prominently on homepage)
        </label>
      </div>
    </div>
  );
}

/* ============================================================
   Tab: Specs & Amenities
   ============================================================ */
function SpecsTab({
  specs,
  setSpecs,
  amenities,
  setAmenities,
  included,
  setIncluded,
}: {
  specs: Omit<YachtSpec, "id">[];
  setSpecs: (s: Omit<YachtSpec, "id">[]) => void;
  amenities: Omit<YachtAmenityType, "id">[];
  setAmenities: (a: Omit<YachtAmenityType, "id">[]) => void;
  included: Omit<YachtIncluded, "id">[];
  setIncluded: (i: Omit<YachtIncluded, "id">[]) => void;
}) {
  return (
    <div className="space-y-10">
      {/* Specifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-white">
            Specifications
          </h3>
          <button
            onClick={() =>
              setSpecs([...specs, { yacht_id: "", label: "", value: "", sort_order: specs.length }])
            }
            className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300"
          >
            <Plus className="w-4 h-4" /> Add Spec
          </button>
        </div>
        <div className="space-y-3">
          {specs.map((spec, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0" />
              <input
                type="text"
                value={spec.label}
                onChange={(e) => {
                  const updated = [...specs];
                  updated[i] = { ...updated[i], label: e.target.value };
                  setSpecs(updated);
                }}
                className="admin-input flex-1"
                placeholder="Label (e.g. Length)"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => {
                  const updated = [...specs];
                  updated[i] = { ...updated[i], value: e.target.value };
                  setSpecs(updated);
                }}
                className="admin-input flex-1"
                placeholder="Value (e.g. 60 ft / 18 m)"
              />
              <button
                onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                className="p-2 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-white">
            Amenities
          </h3>
          <button
            onClick={() =>
              setAmenities([
                ...amenities,
                { yacht_id: "", icon: "anchor", label: "", sort_order: amenities.length },
              ])
            }
            className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300"
          >
            <Plus className="w-4 h-4" /> Add Amenity
          </button>
        </div>
        <div className="space-y-3">
          {amenities.map((amenity, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0" />
              <select
                value={amenity.icon}
                onChange={(e) => {
                  const updated = [...amenities];
                  updated[i] = { ...updated[i], icon: e.target.value };
                  setAmenities(updated);
                }}
                className="admin-input w-40"
              >
                {["wifi", "speaker", "utensils", "waves", "shield", "droplets", "sun", "anchor", "snowflake"].map(
                  (icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  )
                )}
              </select>
              <input
                type="text"
                value={amenity.label}
                onChange={(e) => {
                  const updated = [...amenities];
                  updated[i] = { ...updated[i], label: e.target.value };
                  setAmenities(updated);
                }}
                className="admin-input flex-1"
                placeholder="Amenity name (e.g. WiFi)"
              />
              <button
                onClick={() => setAmenities(amenities.filter((_, j) => j !== i))}
                className="p-2 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* What's Included */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-white">
            What&apos;s Included
          </h3>
          <button
            onClick={() =>
              setIncluded([
                ...included,
                { yacht_id: "", item: "", sort_order: included.length },
              ])
            }
            className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
        <div className="space-y-3">
          {included.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0" />
              <input
                type="text"
                value={item.item}
                onChange={(e) => {
                  const updated = [...included];
                  updated[i] = { ...updated[i], item: e.target.value };
                  setIncluded(updated);
                }}
                className="admin-input flex-1"
                placeholder="e.g. Professional Captain & Crew"
              />
              <button
                onClick={() => setIncluded(included.filter((_, j) => j !== i))}
                className="p-2 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Tab: Pricing
   ============================================================ */
function PricingTab({
  pricing,
  setPricing,
}: {
  pricing: Omit<YachtPricing, "id">[];
  setPricing: (p: Omit<YachtPricing, "id">[]) => void;
}) {
  function updatePricing(index: number, field: string, value: unknown) {
    const updated = [...pricing];
    updated[index] = { ...updated[index], [field]: value };
    setPricing(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-white">
          Season Pricing (AED)
        </h3>
        <button
          onClick={() =>
            setPricing([
              ...pricing,
              {
                yacht_id: "",
                season: "",
                period: "",
                hourly: null,
                daily: null,
                weekly: null,
                monthly: null,
                hourly_b2b: null,
                daily_b2b: null,
                weekly_b2b: null,
                monthly_b2b: null,
                sort_order: pricing.length,
              },
            ])
          }
          className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300"
        >
          <Plus className="w-4 h-4" /> Add Season
        </button>
      </div>

      <div className="space-y-6">
        {pricing.map((season, i) => (
          <div
            key={i}
            className="p-5 bg-navy-800 rounded-xl border border-white/5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                <input
                  type="text"
                  value={season.season}
                  onChange={(e) => updatePricing(i, "season", e.target.value)}
                  className="admin-input"
                  placeholder="Season name (e.g. Regular Season)"
                />
                <input
                  type="text"
                  value={season.period}
                  onChange={(e) => updatePricing(i, "period", e.target.value)}
                  className="admin-input"
                  placeholder="Period (e.g. October — April)"
                />
              </div>
              <button
                onClick={() => setPricing(pricing.filter((_, j) => j !== i))}
                className="p-2 text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Field label="Hourly" compact>
                <input
                  type="number"
                  value={season.hourly ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "hourly",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Daily" compact>
                <input
                  type="number"
                  value={season.daily ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "daily",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Weekly" compact>
                <input
                  type="number"
                  value={season.weekly ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "weekly",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Monthly" compact>
                <input
                  type="number"
                  value={season.monthly ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "monthly",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Field label="Hourly B2B" compact>
                <input
                  type="number"
                  value={season.hourly_b2b ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "hourly_b2b",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Daily B2B" compact>
                <input
                  type="number"
                  value={season.daily_b2b ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "daily_b2b",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Weekly B2B" compact>
                <input
                  type="number"
                  value={season.weekly_b2b ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "weekly_b2b",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
              <Field label="Monthly B2B" compact>
                <input
                  type="number"
                  value={season.monthly_b2b ?? ""}
                  onChange={(e) =>
                    updatePricing(
                      i,
                      "monthly_b2b",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="admin-input"
                  placeholder="—"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Tab: Videos
   ============================================================ */
function VideosTab({
  yacht,
  setYacht,
}: {
  yacht: FormYacht;
  setYacht: (y: FormYacht) => void;
}) {
  function addShort() {
    setYacht({
      ...yacht,
      youtube_shorts: [...yacht.youtube_shorts, ""],
    });
  }

  function updateShort(index: number, value: string) {
    const updated = [...yacht.youtube_shorts];
    updated[index] = value;
    setYacht({ ...yacht, youtube_shorts: updated });
  }

  function removeShort(index: number) {
    setYacht({
      ...yacht,
      youtube_shorts: yacht.youtube_shorts.filter((_, i) => i !== index),
    });
  }

  function extractVideoId(url: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Show/Hide Toggle */}
      <div className="p-5 bg-navy-800 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="show_videos"
            checked={yacht.show_videos}
            onChange={(e) =>
              setYacht({ ...yacht, show_videos: e.target.checked })
            }
            className="w-4 h-4 rounded border-white/20 bg-navy-900 text-gold-500 focus:ring-gold-500/50"
          />
          <label htmlFor="show_videos" className="text-sm text-white/80 font-medium">
            Show video section on yacht page
          </label>
        </div>
        <p className="mt-2 text-xs text-white/40 ml-7">
          When disabled, the video block will be completely hidden even if videos are added below.
        </p>
      </div>

      {/* Main YouTube Video */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5 text-gold-500" />
          <h3 className="font-heading text-lg font-bold text-white">
            Main Video (YouTube)
          </h3>
        </div>
        <p className="text-xs text-white/40 mb-3">
          Paste a YouTube video URL. This will be displayed as a large player with a thumbnail preview.
        </p>
        <input
          type="text"
          value={yacht.youtube_video}
          onChange={(e) =>
            setYacht({ ...yacht, youtube_video: e.target.value })
          }
          className="admin-input w-full"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {yacht.youtube_video && extractVideoId(yacht.youtube_video) && (
          <div className="mt-3 relative aspect-video max-w-md rounded-lg overflow-hidden bg-navy-900">
            <img
              src={`https://img.youtube.com/vi/${extractVideoId(yacht.youtube_video)}/mqdefault.jpg`}
              alt="Video preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[18px] border-l-white border-y-[12px] border-y-transparent ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* YouTube Shorts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22.95.25 1.45.03.5.04 1.05.04 1.38 0 .33-.01.88-.04 1.38-.03.5-.12.98-.25 1.45-.27.95-1.04 1.72-2 2.04-.47.13-.95.22-1.45.25-.5.03-1.05.04-1.38.04H7.27c-.33 0-.88-.01-1.38-.04-.5-.03-.98-.12-1.45-.25-.95-.32-1.72-1.09-2-2.04-.13-.47-.22-.95-.25-1.45C2.16 12.88 2.15 12.33 2.15 12s.01-.88.04-1.38c.03-.5.12-.98.25-1.45.28-.95 1.05-1.72 2-2.04.47-.13.95-.22 1.45-.25.5-.03 1.05-.04 1.38-.04h9.46c.33 0 .88.01 1.38.04.5.03.98.12 1.45.25.96.32 1.73 1.09 2 2.04z"/>
            </svg>
            <h3 className="font-heading text-lg font-bold text-white">
              YouTube Shorts
            </h3>
          </div>
          <button
            onClick={addShort}
            className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300"
          >
            <Plus className="w-4 h-4" /> Add Short
          </button>
        </div>
        <p className="text-xs text-white/40 mb-3">
          Paste YouTube Shorts URLs. They will be displayed as vertical 9:16 video cards.
        </p>
        <div className="space-y-3">
          {yacht.youtube_shorts.map((url, i) => {
            const videoId = extractVideoId(url);
            return (
              <div key={i} className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0" />
                {videoId && (
                  <div className="relative w-10 h-[70px] rounded-md overflow-hidden flex-shrink-0 bg-navy-900">
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/oar2.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateShort(i, e.target.value)}
                  className="admin-input flex-1"
                  placeholder="https://www.youtube.com/shorts/..."
                />
                <button
                  onClick={() => removeShort(i)}
                  className="p-2 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {yacht.youtube_shorts.length === 0 && (
            <div className="text-center py-8 text-white/30 border border-dashed border-white/10 rounded-xl">
              <p className="text-sm">No shorts added yet</p>
              <button
                onClick={addShort}
                className="mt-2 text-sm text-gold-400 hover:text-gold-300"
              >
                + Add your first Short
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Shared Components
   ============================================================ */
function Field({
  label,
  required,
  compact,
  children,
}: {
  label: string;
  required?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={`block font-medium text-white/60 ${compact ? "text-xs mb-1" : "text-sm mb-2"}`}>
        {label}
        {required && <span className="text-gold-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
