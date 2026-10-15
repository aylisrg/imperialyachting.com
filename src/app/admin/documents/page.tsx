"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Loader2, Mail } from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { DocumentContactRow } from "@/lib/supabase/types";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const PMS_STATUS_STYLE: Record<DocumentContactRow["pms_sync_status"], string> = {
  pending: "text-amber-300 bg-amber-500/10",
  synced: "text-emerald-300 bg-emerald-500/10",
  failed: "text-red-300 bg-red-500/10",
  skipped: "text-white/40 bg-white/5",
};

export default function AdminDocumentContacts() {
  const [contacts, setContacts] = useState<DocumentContactRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("document_contacts")
        .select("*")
        .order("first_seen_at", { ascending: false });
      if (data) setContacts(data as DocumentContactRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const verified = contacts.filter((c) => c.verified_at).length;

  return (
    <>
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin" className="text-white/40 hover:text-white/60 text-sm">
            Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/60 text-sm">Docs</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Document contacts</h1>
        <p className="mt-1 text-white/50 mb-8">
          Everyone who asked for access to /documents, newest first.
          {contacts.length > 0 && ` ${verified} of ${contacts.length} confirmed their email.`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20 bg-navy-800 rounded-2xl border border-white/5">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-white/50">No requests yet</h2>
          </div>
        ) : (
          <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">First seen</th>
                  <th className="px-5 py-3 font-medium">Confirmed</th>
                  <th className="px-5 py-3 font-medium">Last sign-in</th>
                  <th className="px-5 py-3 font-medium text-right">Sign-ins</th>
                  <th className="px-5 py-3 font-medium text-right">Downloads</th>
                  <th className="px-5 py-3 font-medium">Country</th>
                  <th className="px-5 py-3 font-medium">PMS</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {c.email}
                      </a>
                      {(c.name || c.company) && (
                        <p className="mt-1 text-white/50">
                          {[c.name, c.company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-white/50 whitespace-nowrap">{formatDate(c.first_seen_at)}</td>
                    <td className="px-5 py-3 text-white/50 whitespace-nowrap">
                      {c.verified_at ? formatDate(c.verified_at) : <span className="text-white/30">not yet</span>}
                    </td>
                    <td className="px-5 py-3 text-white/50 whitespace-nowrap">{formatDate(c.last_login_at)}</td>
                    <td className="px-5 py-3 text-white/70 text-right">{c.login_count}</td>
                    <td className="px-5 py-3 text-white/70 text-right">{c.download_count}</td>
                    <td className="px-5 py-3 text-white/50">{c.last_country || "—"}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs ${PMS_STATUS_STYLE[c.pms_sync_status]}`}
                        title={c.pms_last_error ?? undefined}
                      >
                        {c.pms_sync_status}
                      </span>
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
