import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
  Svg,
  Path,
} from "@react-pdf/renderer";

// Brand palette mirrors the site
const COLOR = {
  navy950: "#03070D",
  navy900: "#0A1424",
  navy800: "#0F1E36",
  navy700: "#16284A",
  white: "#FFFFFF",
  white80: "rgba(255,255,255,0.82)",
  white60: "rgba(255,255,255,0.62)",
  white40: "rgba(255,255,255,0.4)",
  white10: "rgba(255,255,255,0.1)",
  gold: "#C9A24B",
  goldSoft: "#E2C277",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.navy950,
    color: COLOR.white,
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
  },
  pageCover: {
    backgroundColor: COLOR.navy950,
    color: COLOR.white,
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 0,
  },
  // ---------- COVER ----------
  coverImageWrap: {
    position: "relative",
    width: "100%",
    height: 540,
    backgroundColor: COLOR.navy900,
  },
  coverImage: { width: "100%", height: "100%", objectFit: "cover" },
  coverOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: "rgba(3,7,13,0.55)",
  },
  coverGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
    backgroundColor: "rgba(3,7,13,0.92)",
  },
  coverBody: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 40,
    paddingBottom: 44,
  },
  coverGoldLine: {
    width: 56,
    height: 2,
    backgroundColor: COLOR.gold,
    marginBottom: 18,
  },
  coverEyebrow: {
    color: COLOR.gold,
    fontSize: 9,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  coverName: {
    color: COLOR.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 44,
    letterSpacing: -0.5,
    lineHeight: 1.05,
  },
  coverTagline: {
    color: COLOR.goldSoft,
    fontSize: 14,
    marginTop: 8,
    fontFamily: "Helvetica-Oblique",
  },
  coverFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 28,
  },
  coverFooterLeft: { color: COLOR.white60, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" },
  coverFooterRight: { color: COLOR.gold, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },

  // ---------- HEADER ----------
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.white10,
  },
  headerName: { color: COLOR.white, fontFamily: "Helvetica-Bold", fontSize: 11, letterSpacing: 0.5 },
  headerBrand: { color: COLOR.gold, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },

  // ---------- SECTION ----------
  sectionGoldLine: { width: 36, height: 1.5, backgroundColor: COLOR.gold, marginBottom: 10 },
  sectionTitle: {
    color: COLOR.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    marginBottom: 4,
  },
  sectionSubtitle: { color: COLOR.white40, fontSize: 9, marginBottom: 16, letterSpacing: 0.5 },

  // ---------- QUICK SPECS ----------
  specsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: COLOR.navy800,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLOR.white10,
    padding: 14,
    marginBottom: 18,
  },
  specCell: {
    width: "33.333%",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  specLabel: { color: COLOR.white40, fontSize: 7.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  specValue: { color: COLOR.white, fontSize: 12, fontFamily: "Helvetica-Bold" },

  // ---------- DESCRIPTION ----------
  para: { color: COLOR.white80, fontSize: 10.5, lineHeight: 1.55, marginBottom: 8 },
  paraLead: { color: COLOR.gold, fontSize: 11.5, lineHeight: 1.5, marginBottom: 12, fontFamily: "Helvetica-Oblique" },

  // ---------- GALLERY ----------
  galleryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  galleryItem: {
    width: "49.2%",
    height: 160,
    marginBottom: 6,
    backgroundColor: COLOR.navy800,
    borderRadius: 4,
    overflow: "hidden",
  },
  galleryItemFull: {
    width: "100%",
    height: 280,
    marginBottom: 6,
    backgroundColor: COLOR.navy800,
    borderRadius: 4,
    overflow: "hidden",
  },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover" },

  // ---------- AMENITIES ----------
  chipsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  chip: {
    backgroundColor: COLOR.navy800,
    borderWidth: 0.5,
    borderColor: COLOR.white10,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { color: COLOR.white80, fontSize: 9.5 },

  // ---------- INCLUDED ----------
  includedRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  includedDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: COLOR.gold, marginRight: 9,
  },
  includedText: { color: COLOR.white80, fontSize: 10 },

  // ---------- VIDEO GRID ----------
  videoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  videoCard: {
    width: "48.5%",
    marginBottom: 10,
  },
  videoThumbWrap: {
    width: "100%",
    height: 110,
    backgroundColor: COLOR.navy800,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  videoThumb: { width: "100%", height: "100%", objectFit: "cover" },
  videoPlayBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    backgroundColor: "rgba(201,162,75,0.92)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayTriangle: { color: COLOR.navy950, fontSize: 14, fontFamily: "Helvetica-Bold" },
  videoLink: { color: COLOR.goldSoft, fontSize: 8.5, marginTop: 5, textDecoration: "none" },
  videoLabel: { color: COLOR.white60, fontSize: 8, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 },

  // ---------- FOOTER ----------
  pageFooter: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.white10,
  },
  pageFooterText: { color: COLOR.white40, fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },
});

// ---------------------------------------------------------------------------

function Header({ yacht }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerName}>{yacht.name}</Text>
      <Text style={styles.headerBrand}>Imperial Yachting · Fleet Dossier</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.pageFooter} fixed>
      <Text style={styles.pageFooterText}>Imperial Yachting — Dubai</Text>
      <Text
        style={styles.pageFooterText}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

function CleanDescription({ text }) {
  // Drop the noisy intro lines (sales bullets duplicated as paragraphs), keep
  // the prose. We split on blank lines and skip lines that are pure heading-style
  // (very short OR formatted as "Label: ...").
  const paragraphs = (text || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;

  // Lead: the first line that is a real sentence (>40 chars)
  const leadIdx = paragraphs.findIndex((p) => p.length >= 60);
  const lead = leadIdx >= 0 ? paragraphs[leadIdx] : paragraphs[0];
  const body = paragraphs.filter((_, i) => i !== leadIdx).slice(0, 8);

  return (
    <>
      <Text style={styles.paraLead}>{lead}</Text>
      {body.map((p, i) => (
        <Text key={i} style={styles.para}>
          {p}
        </Text>
      ))}
    </>
  );
}

function QuickSpecs({ yacht }) {
  const order = ["Length", "Capacity", "Builder", "Year", "Cabins", "Location"];
  const items = order
    .map((label) => ({ label, value: yacht.quickSpecs[label] }))
    .filter((x) => x.value);
  // Append speed if present in specs
  for (const s of yacht.specs) {
    if (!items.find((i) => i.label === s.label)) items.push(s);
  }
  return (
    <View style={styles.specsRow}>
      {items.map((it) => (
        <View key={it.label} style={styles.specCell}>
          <Text style={styles.specLabel}>{it.label}</Text>
          <Text style={styles.specValue}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

function Gallery({ images }) {
  if (!images || images.length === 0) return null;
  // Skip the hero (already used on cover) and lay out remaining photos as a
  // 2-column grid. wrap={false} per row to avoid a row splitting across pages.
  const photos = images.slice(1, 9);
  const rows = [];
  for (let i = 0; i < photos.length; i += 2) {
    rows.push(photos.slice(i, i + 2));
  }
  return (
    <View>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.galleryGrid} wrap={false}>
          {row.map((src, ci) => (
            <View key={ci} style={styles.galleryItem}>
              <Image src={src} style={styles.galleryImg} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Amenities({ items }) {
  // Filter out garbage data like "1223"
  const clean = (items || []).filter((x) => x && !/^\d+$/.test(x) && x.length > 2);
  if (clean.length === 0) return null;
  return (
    <View style={{ marginBottom: 20 }} wrap={false}>
      <View style={styles.sectionGoldLine} />
      <Text style={styles.sectionTitle}>Amenities</Text>
      <Text style={styles.sectionSubtitle}>Everything on board for comfort and enjoyment.</Text>
      <View style={styles.chipsRow}>
        {clean.map((label, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Included({ items }) {
  // Some yachts have a single string "Captain, Stew, Fuel" — split on commas.
  const flat = (items || [])
    .flatMap((x) => x.split(/,\s*/))
    .map((x) => x.trim())
    .filter(Boolean);
  if (flat.length === 0) return null;
  // Render in 2 columns
  const mid = Math.ceil(flat.length / 2);
  const col1 = flat.slice(0, mid);
  const col2 = flat.slice(mid);
  return (
    <View style={{ marginBottom: 20 }} wrap={false}>
      <View style={styles.sectionGoldLine} />
      <Text style={styles.sectionTitle}>What's Included</Text>
      <Text style={styles.sectionSubtitle}>Comes with every charter at no extra cost.</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          {col1.map((item, i) => (
            <View key={i} style={styles.includedRow}>
              <View style={styles.includedDot} />
              <Text style={styles.includedText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          {col2.map((item, i) => (
            <View key={i} style={styles.includedRow}>
              <View style={styles.includedDot} />
              <Text style={styles.includedText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Videos({ ids }) {
  if (!ids || ids.length === 0) return null;
  return (
    <View>
      <View style={styles.sectionGoldLine} />
      <Text style={styles.sectionTitle}>Watch on YouTube</Text>
      <Text style={styles.sectionSubtitle}>Tap any thumbnail to open the full video in your browser.</Text>
      <View style={styles.videoGrid}>
        {ids.map((id, i) => {
          const url = `https://www.youtube.com/watch?v=${id}`;
          const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
          return (
            <View key={id} style={styles.videoCard} wrap={false}>
              <Link src={url}>
                <View style={styles.videoThumbWrap}>
                  <Image src={thumb} style={styles.videoThumb} />
                  <View style={styles.videoPlayBadge}>
                    <Svg width="14" height="14" viewBox="0 0 14 14">
                      <Path d="M3 1 L12 7 L3 13 Z" fill={COLOR.navy950} />
                    </Svg>
                  </View>
                </View>
              </Link>
              <Text style={styles.videoLabel}>Video {i + 1}</Text>
              <Link src={url} style={styles.videoLink}>
                youtu.be/{id}
              </Link>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function BrochureDoc({ yacht }) {
  return (
    <Document
      title={`${yacht.name} — Fleet Dossier`}
      author="Imperial Yachting"
      subject={`${yacht.name} brochure for charter brokers`}
      keywords={`${yacht.name}, yacht charter, Dubai, ${yacht.brand}`}
    >
      {/* ---------- COVER PAGE ---------- */}
      <Page size="A4" style={styles.pageCover}>
        <View style={styles.coverImageWrap}>
          {yacht.images[0] && (
            <Image src={yacht.images[0]} style={styles.coverImage} />
          )}
          <View style={styles.coverOverlay} />
          <View style={styles.coverGradient} />
          <View style={styles.coverBody}>
            <View style={styles.coverGoldLine} />
            <Text style={styles.coverEyebrow}>Imperial Yachting · Dubai</Text>
            <Text style={styles.coverName}>{yacht.name}</Text>
            {yacht.tagline ? (
              <Text style={styles.coverTagline}>{yacht.tagline}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterLeft}>
            {yacht.quickSpecs.Length ? `${yacht.quickSpecs.Length}` : ""}
            {yacht.quickSpecs.Capacity ? `  ·  ${yacht.quickSpecs.Capacity}` : ""}
            {yacht.quickSpecs.Builder ? `  ·  ${yacht.quickSpecs.Builder}` : ""}
          </Text>
          <Text style={styles.coverFooterRight}>Fleet Dossier</Text>
        </View>
      </Page>

      {/* ---------- CONTENT — auto-paginates with fixed header/footer ---------- */}
      <Page size="A4" style={styles.page} wrap>
        <Header yacht={yacht} />

        <View wrap={false}>
          <View style={styles.sectionGoldLine} />
          <Text style={styles.sectionTitle}>At a Glance</Text>
          <Text style={styles.sectionSubtitle}>Key vessel specifications.</Text>
          <QuickSpecs yacht={yacht} />
        </View>

        <View style={styles.sectionGoldLine} />
        <Text style={styles.sectionTitle}>About this yacht</Text>
        <Text style={styles.sectionSubtitle}>Why this yacht stands out.</Text>
        <CleanDescription text={yacht.description} />

        {yacht.images && yacht.images.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <View wrap={false}>
              <View style={styles.sectionGoldLine} />
              <Text style={styles.sectionTitle}>Gallery</Text>
              <Text style={styles.sectionSubtitle}>On-board and on-water photography.</Text>
            </View>
            <Gallery images={yacht.images} />
          </View>
        )}

        <Amenities items={yacht.amenities} />
        <Included items={yacht.included} />
        <Videos ids={yacht.youtubeIds} />

        <Footer />
      </Page>
    </Document>
  );
}
