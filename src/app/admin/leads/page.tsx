"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Users, Loader2, Mail, Phone } from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { LeadRow } from "@/lib/supabase/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setLeads(data as LeadRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <>
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin" className="text-white/40 hover:text-white/60 text-sm">
            Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white/60 text-sm">Leads</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-white mb-1">Leads</h1>
        <p className="mt-1 text-white/50 mb-8">
          Contact-form and inquiry submissions, newest first.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 bg-navy-800 rounded-2xl border border-white/5">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-white/50">No leads yet</h2>
          </div>
        ) : (
          <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-white/40 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Inquiry</th>
                  <th className="px-5 py-3 font-medium">Preferred Date</th>
                  <th className="px-5 py-3 font-medium">Message</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-white/50 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                    <td className="px-5 py-3 text-white font-medium whitespace-nowrap">{lead.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1.5 text-white/50 hover:text-white"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/60 whitespace-nowrap">{lead.inquiry_type}</td>
                    <td className="px-5 py-3 text-white/50 whitespace-nowrap">
                      {lead.preferred_date || "—"}
                    </td>
                    <td className="px-5 py-3 text-white/50 max-w-xs">{lead.message || "—"}</td>
                    <td className="px-5 py-3 text-white/40 whitespace-nowrap">{lead.source}</td>
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
