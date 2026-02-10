"use client";

import {
  Shield,
  Eye,
  Star,
  Handshake,
  Linkedin,
  Ship,
  Users,
  Clock,
  Award,
  FileText,
  Building2,
  Receipt,
} from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { companyInfo } from "@/data/company";
import { SITE_CONFIG } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

const valueIcons: Record<string, LucideIcon> = {
  Reliability: Shield,
  Transparency: Eye,
  Excellence: Star,
  "Long-term Partnership": Handshake,
};

const stats = [
  {
    icon: Ship,
    value: String(companyInfo.stats.fleetSize),
    label: "Owned Yachts",
  },
  {
    icon: Users,
    value: companyInfo.stats.happyClients,
    label: "Happy Clients",
  },
  {
    icon: Clock,
    value: companyInfo.stats.charterHours,
    label: "Charter Hours",
  },
  {
    icon: Award,
    value: `Since ${companyInfo.founded}`,
    label: "Established",
  },
];

const credentials = [
  {
    icon: FileText,
    label: "Trade License",
    value: SITE_CONFIG.license,
  },
  {
    icon: Building2,
    label: "Company Registration",
    value: SITE_CONFIG.companyRegistration,
  },
  {
    icon: Receipt,
    label: "Tax Registration (TRN)",
    value: SITE_CONFIG.taxId,
  },
];

export function AboutPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-navy-950">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gold-500/[0.04] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sea-500/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="animate-hero-1">
            <Badge variant="gold">About Us</Badge>
          </div>

          <h1
            className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto animate-hero-2"
          >
            Our <span className="text-gold-gradient">Story</span>
          </h1>

          <p
            className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-hero-3"
          >
            Founded in {companyInfo.founded}, Imperial Yachting was born from a
            passion for the sea and a commitment to redefining luxury yacht
            experiences in Dubai. We are a fleet owner, not a broker — meaning
            every detail, from maintenance to hospitality, is under our direct
            control.
          </p>
        </Container>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-navy-900 border-y border-white/5">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Reveal
                  key={stat.label}
                  delay={i * 100}
                  className="text-center"
                >
                  <Icon className="w-6 h-6 text-gold-500/60 mx-auto mb-3" />
                  <p className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-white/40">{stat.label}</p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CEO Section */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <div className="max-w-5xl mx-auto">
            <Reveal className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 items-center">
              {companyInfo.team.map((member, index) => (
                <div key={member.name} className="contents">
                  {/* Photo */}
                  <div className={`md:col-span-2 ${index % 2 !== 0 ? "md:order-last" : ""}`}>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-navy-800">
                      {/* Image */}
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-navy-800 to-sea-500/10" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-gold-400/60" />
                              </div>
                              <p className="text-white/30 text-sm">Photo</p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Gold border accent */}
                      <div className="absolute inset-0 rounded-2xl border border-gold-500/10" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-3">
                    <Badge variant="gold">Leadership</Badge>

                    <h2 className="mt-4 font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {member.name}
                    </h2>

                    <p className="mt-1 text-gold-400 font-medium">
                      {member.role}
                    </p>

                    <p className="mt-6 text-white/50 leading-relaxed text-lg">
                      {member.bio}
                    </p>

                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-medium"
                      >
                        <Linkedin className="w-4 h-4" />
                        Connect on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Company Values */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Our Values"
            subtitle="The principles that guide every decision we make and every experience we create."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyInfo.values.map((value, i) => {
              const Icon = valueIcons[value.title] ?? Star;
              return (
                <Reveal
                  key={value.title}
                  delay={i * 100}
                  className="glass-card rounded-2xl p-8 text-center hover:border-gold-500/30 transition-all duration-500"
                >
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-gold-400" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed">
                    {value.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Credentials */}
      <section className="py-24 sm:py-32 bg-navy-950">
        <Container>
          <SectionHeading
            title="Credentials & Licensing"
            subtitle="Imperial Yachting is a fully licensed and registered company operating in the UAE."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {credentials.map((cred, i) => {
              const Icon = cred.icon;
              return (
                <Reveal
                  key={cred.label}
                  delay={i * 100}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <p className="text-sm text-white/40 mb-1">{cred.label}</p>
                  <p className="font-heading text-lg font-bold text-white tracking-wide">
                    {cred.value}
                  </p>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-8 text-center">
            <p className="text-sm text-white/30">
              <span className="text-white/50 font-medium">
                {SITE_CONFIG.legalName}
              </span>{" "}
              &mdash;{" "}
              {SITE_CONFIG.address.street}, {SITE_CONFIG.address.area},{" "}
              {SITE_CONFIG.address.city}, {SITE_CONFIG.address.country}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Partners Placeholder */}
      <section className="py-24 sm:py-32 bg-navy-900">
        <Container>
          <SectionHeading
            title="Our Partners"
            subtitle="Trusted by leading brands and organizations in the yachting and luxury sectors."
            align="center"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[1, 2, 3, 4].map((_, i) => (
              <Reveal
                key={i}
                delay={i * 100}
                className="glass-card rounded-xl aspect-[3/2] flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mx-auto mb-2">
                    <Building2 className="w-5 h-5 text-white/20" />
                  </div>
                  <p className="text-xs text-white/20">Partner Logo</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-navy-800">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.06] via-transparent to-gold-400/[0.03]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </div>

        <Container className="relative z-10 text-center">
          <div className="gold-line mx-auto mb-8" />

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto">
            Experience the Imperial Difference
          </h2>

          <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re looking to charter a yacht, manage your vessel,
            or grow your brand, we&apos;re here to help.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/contact">
              Get in Touch
            </Button>
            <Button variant="secondary" size="lg" href="/fleet">
              Explore Our Fleet
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
