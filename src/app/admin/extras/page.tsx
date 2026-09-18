"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { ExtraRow } from "@/lib/supabase/types";

const UNITS = ["per_booking", "per_hour", "per_guest"] as const;
const CATEGORIES = [
  "catering",
  "decor",
  "media",
  "entertainment",
  "watersports",
  "drinks",
  "general",
] as const;

type FormExtra = Omit<ExtraRow, "id" | "created_at" | "updated_at">;

const emptyExtra: FormExtra = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  unit: "per_booking",
  category: "general",
  image: "",
  active: true,
  sort_order: 0,
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminExtras() {
  const [extras, setExtras] = useState<ExtraRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormExtra>(emptyExtra);
  const [saving, setSaving] = useState(false);

  const loadExtras = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("extras")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setExtras(data as ExtraRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExtras();
  }, [loadExtras]);

  function startCreate() {
    setForm({ ...emptyExtra, sort_order: extras.length });
    setEditingId("new");
  }

  function startEdit(extra: ExtraRow) {
    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = extra;
    setForm(rest);
    setEditingId(extra.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyExtra);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const sanitized = {
      ...form,
      slug: generateSlug(form.slug || form.name),
    };

    try {
      if (editingId === "new") {
        const { error } = await supabase.from("extras").insert(sanitized);
        if (error) throw error;
      } else if (editingId) {
        const { error } = await supabase
          .from("extras")
          .update(sanitized)
          .eq("id", editingId);
        if (error) throw error;
      }
      cancelEdit();
      await loadExtras();
    } catch (err) {
      alert(`Error saving: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteExtra(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const supabase = createClient();
    await supabase.from("extras").delete().eq("id", id);
    loadExtras();
  }

  async function toggleActive(extra: ExtraRow) {
    const supabase = createClient();
    await supabase
      .from("extras")
      .update({ active: !extra.active })
      .eq("id", extra.id);
    loadExtras();
  }

  return (
    <>
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin" className="text-white/40 hover:text-white/60 text-sm">
                Dashboard
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-white/60 text-sm">Extras</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-white">
              Extras & Add-ons
            </h1>
            <p className="mt-1 text-white/50">
              Manage the catalog of add-on services customers can attach to a booking.
            </p>
          </div>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Extra
          </button>
        </div>

        {editingId && (
          <div className="mb-8 p-6 bg-navy-800 rounded-2xl border border-gold-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-white">
                {editingId === "new" ? "New Extra" : "Edit Extra"}
              </h2>
              <button onClick={cancelEdit} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: !f.slug || f.slug === generateSlug(f.name) ? generateSlug(name) : f.slug,
                    }));
                  }}
                  className="admin-input"
                  placeholder="Premium catering menu"
                />
              </FormField>
              <FormField label="Slug">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }))}
                  className="admin-input"
                  placeholder="premium-catering-menu"
                />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="admin-input"
                placeholder="Short description shown to customers"
              />
            </FormField>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField label="Price (AED)">
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                  className="admin-input"
                />
              </FormField>
              <FormField label="Unit">
                <select
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="admin-input"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="admin-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Sort Order">
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className="admin-input"
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 rounded border-white/20 bg-navy-900 text-gold-500 focus:ring-gold-500/50"
              />
              <label htmlFor="active" className="text-sm text-white/60">
                Active (visible to customers)
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-heading font-semibold hover:from-gold-400 hover:to-gold-500 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : extras.length === 0 ? (
          <div className="text-center py-20 bg-navy-800 rounded-2xl border border-white/5">
            <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-white/50">No extras yet</h2>
            <p className="mt-2 text-white/30 max-w-md mx-auto">
              Add your first extra to let customers add it to a booking.
            </p>
          </div>
        ) : (
          <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Unit</th>
                  <th className="px-5 py-3 font-medium">Active</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {extras.map((extra) => (
                  <tr key={extra.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{extra.name}</p>
                      <p className="text-white/30 text-xs">{extra.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-white/60">{extra.category}</td>
                    <td className="px-5 py-3 text-gold-400">{extra.price.toLocaleString()} AED</td>
                    <td className="px-5 py-3 text-white/50">{extra.unit}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(extra)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          extra.active
                            ? "bg-sea-500/15 text-sea-400"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {extra.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(extra)}
                          className="px-3 py-1.5 rounded-lg text-white/50 hover:text-gold-400 hover:bg-gold-500/5 transition-colors text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteExtra(extra.id, extra.name)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>
      {children}
    </div>
  );
}
