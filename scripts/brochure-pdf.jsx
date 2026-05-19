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

// Brand palette mirrors the site (navy + gold)
const COLOR = {
  ink: "#03070D",          // deepest navy / near-black
  navy: "#0A1424",
  navySoft: "#0F1E36",
  navyEdge: "#16284A",
  white: "#FFFFFF",
  text: "#F2F4F7",
  text80: "rgba(242,244,247,0.82)",
  text65: "rgba(242,244,247,0.65)",
  text50: "rgba(242,244,247,0.5)",
  text35: "rgba(242,244,247,0.35)",
  hairline: "rgba(255,255,255,0.08)",
  gold: "#C9A24B",
  goldSoft: "#E2C277",
  goldDim: "rgba(201,162,75,0.6)",
};

const PAGE_MARGIN = 44;

const styles = StyleSheet.create({
  // ---------- generic pages ----------
  page: {
    backgroundColor: COLOR.ink,
    color: COLOR.text,
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 38,
    paddingBottom: 44,
    paddingHorizontal: PAGE_MARGIN,
  },
  pageBleed: {
    backgroundColor: COLOR.ink,
    color: COLOR.text,
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 0,
  },

  // ---------- COVER ----------
  coverImageWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 660, // ~78% of A4 (842pt)
    backgroundColor: COLOR.navy,
  },
  coverImage: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
  },
  coverScrim: {
    position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(3,7,13,0.32)",
  },
  coverGradient: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    height: "55%",
    backgroundColor: "rgba(3,7,13,0.85)",
  },
  coverEyebrow: {
    color: COLOR.gold,
    fontSize: 8.5,
    letterSpacing: 4,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  coverGoldLine: { width: 56, height: 2, backgroundColor: COLOR.gold, marginVertical: 14 },
  coverName: {
    color: COLOR.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 52,
    letterSpacing: -1,
    lineHeight: 1.02,
    marginBottom: 8,
  },
  coverTagline: {
    color: COLOR.goldSoft,
    fontFamily: "Helvetica-Oblique",
    fontSize: 14.5,
    marginBottom: 2,
  },
  coverCaption: {
    position: "absolute",
    left: PAGE_MARGIN,
    right: PAGE_MARGIN,
    bottom: 230, // sit just above the dark footer band
  },
  coverFooter: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    height: 182, // ~22% of A4
    paddingHorizontal: PAGE_MARGIN,
    paddingTop: 30,
    paddingBottom: 38,
    backgroundColor: COLOR.ink,
  },
  coverSpecsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 22,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
  },
  coverSpecCell: { flex: 1, paddingRight: 8 },
  coverSpecLabel: {
    color: COLOR.text35,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  coverSpecValue: {
    color: COLOR.white,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  coverFooterMark: {
    position: "absolute",
    right: PAGE_MARGIN,
    bottom: 14,
    color: COLOR.text35,
    fontSize: 7.5,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },

  // ---------- HEADER / FOOTER ----------
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 22,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
  },
  headerLeft: { color: COLOR.white, fontFamily: "Helvetica-Bold", fontSize: 10.5, letterSpacing: 0.4 },
  headerRight: { color: COLOR.gold, fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },

  pageFooter: {
    position: "absolute",
    left: PAGE_MARGIN, right: PAGE_MARGIN,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
  },
  pageFooterText: {
    color: COLOR.text35,
    fontSize: 7.5,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ---------- SECTION ----------
  sectionGoldLine: { width: 34, height: 1.5, backgroundColor: COLOR.gold, marginBottom: 11 },
  sectionEyebrow: {
    color: COLOR.gold,
    fontSize: 8,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  sectionTitle: {
    color: COLOR.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 5,
  },
  sectionSubtitle: {
    color: COLOR.text35,
    fontSize: 9,
    marginBottom: 18,
    letterSpacing: 0.4,
  },

  // ---------- AT A GLANCE GRID ----------
  glanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: COLOR.navySoft,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: COLOR.hairline,
    padding: 18,
    marginBottom: 26,
  },
  glanceCell: { width: "33.333%", paddingVertical: 10, paddingHorizontal: 6 },
  glanceLabel: { color: COLOR.text35, fontSize: 7, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 },
  glanceValue: { color: COLOR.white, fontSize: 13, fontFamily: "Helvetica-Bold" },

  // ---------- BODY TEXT ----------
  paraLead: {
    color: COLOR.goldSoft,
    fontFamily: "Helvetica-Oblique",
    fontSize: 12,
    lineHeight: 1.55,
    marginBottom: 14,
  },
  para: { color: COLOR.text80, fontSize: 10.5, lineHeight: 1.6, marginBottom: 9 },

  // ---------- FEATURES (key highlights) ----------
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  featureItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
    paddingRight: 12,
  },
  featureBullet: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: COLOR.gold,
    marginTop: 5, marginRight: 9, flexShrink: 0,
  },
  featureText: { color: COLOR.text80, fontSize: 10.2, lineHeight: 1.5, flex: 1 },

  // ---------- SPEC SHEET TABLE ----------
  specTable: { marginBottom: 16 },
  specSubhead: {
    color: COLOR.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingTop: 16,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.goldDim,
    marginBottom: 4,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingVertical: 6.5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.hairline,
  },
  specRowLabel: { color: COLOR.text65, fontSize: 9.5, flex: 1 },
  specRowValue: { color: COLOR.white, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "right" },
  specTwoCol: { flexDirection: "row", gap: 26 },
  specCol: { flex: 1 },

  // ---------- FULL-BLEED PHOTO PAGES ----------
  fullPhotoWrap: {
    width: 595.28,
    height: 841.89,
    backgroundColor: COLOR.navy,
  },
  fullPhotoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fullPhotoCaption: {
    position: "absolute",
    left: PAGE_MARGIN,
    bottom: 28,
    color: COLOR.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 3,
    textTransform: "uppercase",
    backgroundColor: "rgba(3,7,13,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  // ---------- GALLERY ----------
  galleryRow2: { flexDirection: "row", marginBottom: 8 },
  galleryHalf: {
    width: "49.4%",
    backgroundColor: COLOR.navy,
    overflow: "hidden",
  },
  galleryHalfRight: { marginLeft: "1.2%" },
  galleryFull: {
    width: "100%",
    backgroundColor: COLOR.navy,
    overflow: "hidden",
    marginBottom: 8,
  },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover" },
  galleryTallH: { height: 250 },
  galleryShortH: { height: 175 },
  galleryRowH: { height: 175 },

  // ---------- VIDEOS ----------
  videoGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  videoCard: {
    width: "31.5%",
    marginRight: "2.75%",
    marginBottom: 14,
  },
  videoCardEdge: {
    width: "31.5%",
    marginBottom: 14,
  },
  videoThumbWrap: {
    width: "100%",
    height: 100,
    backgroundColor: COLOR.navy,
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  videoThumb: { width: "100%", height: "100%", objectFit: "cover" },
  videoPlayBadge: {
    position: "absolute",
    top: "50%", left: "50%",
    width: 42, height: 42,
    marginLeft: -21, marginTop: -21,
    backgroundColor: "rgba(201,162,75,0.94)",
    borderRadius: 21,
    alignItems: "center", justifyContent: "center",
  },
  videoLabel: {
    color: COLOR.gold,
    fontSize: 7.5, letterSpacing: 2.2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginTop: 7,
  },
  videoLink: { color: COLOR.text65, fontSize: 8.5, marginTop: 2, textDecoration: "none" },

  // ---------- BACK MARK ----------
  endStamp: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.hairline,
    alignItems: "center",
  },
  endStampText: {
    color: COLOR.gold,
    fontSize: 8,
    letterSpacing: 4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Header({ yacht }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerLeft}>{yacht.name}</Text>
      <Text style={styles.headerRight}>Imperial Yachting · Fleet Dossier</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.pageFooter} fixed>
      <Text style={styles.pageFooterText}>Imperial Yachting — Dubai</Text>
      <Text
        style={styles.pageFooterText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function PlayTriangle() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Path d="M4 2 L13 8 L4 14 Z" fill={COLOR.ink} />
    </Svg>
  );
}

function splitParagraphs(text) {
  return (text || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Strip the marketing bullets that some descriptions duplicate as standalone
// "Label: text" lines just before the prose. Keeps the real narrative.
function cleanDescription(paragraphs) {
  const out = [];
  for (const p of paragraphs) {
    // Drop short headings ("The Vibe: ...") if next paragraph continues the same idea — keep as part of prose
    if (p.length < 8) continue;
    out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------

function CoverPage({ yacht }) {
  const items = [
    { label: "Length", value: yacht.quickSpecs.Length },
    { label: "Guests", value: yacht.quickSpecs.Capacity },
    { label: "Builder", value: yacht.quickSpecs.Builder },
    { label: "Year", value: yacht.quickSpecs.Year },
  ].filter((x) => x.value);

  return (
    <Page size="A4" style={styles.pageBleed}>
      <View style={styles.coverImageWrap}>
        {yacht.images[0] && <Image src={yacht.images[0]} style={styles.coverImage} />}
        <View style={styles.coverScrim} />
        <View style={styles.coverGradient} />
        <View style={styles.coverCaption}>
          <Text style={styles.coverEyebrow}>Imperial Yachting · Dubai</Text>
          <View style={styles.coverGoldLine} />
          <Text style={styles.coverName}>{yacht.name}</Text>
          {yacht.tagline ? <Text style={styles.coverTagline}>{yacht.tagline}</Text> : null}
        </View>
      </View>

      <View style={styles.coverFooter}>
        <View style={styles.coverSpecsRow}>
          {items.map((it) => (
            <View key={it.label} style={styles.coverSpecCell}>
              <Text style={styles.coverSpecLabel}>{it.label}</Text>
              <Text style={styles.coverSpecValue}>{it.value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.coverFooterMark}>Fleet Dossier</Text>
      </View>
    </Page>
  );
}

function GlanceAndAboutPage({ yacht }) {
  const order = ["Length", "Capacity", "Builder", "Year", "Cabins", "Location"];
  const glance = order
    .map((label) => ({ label, value: yacht.quickSpecs[label] }))
    .filter((x) => x.value);

  const paras = cleanDescription(splitParagraphs(yacht.description));
  const leadIdx = paras.findIndex((p) => p.length >= 80);
  const lead = leadIdx >= 0 ? paras[leadIdx] : paras[0];
  const rest = paras.filter((_, i) => i !== leadIdx).slice(0, 6);
  const hasDescription = !!lead;

  return (
    <Page size="A4" style={styles.page} wrap>
      <Header yacht={yacht} />

      <View wrap={false}>
        <Text style={styles.sectionEyebrow}>Specification Summary</Text>
        <View style={styles.sectionGoldLine} />
        <Text style={styles.sectionTitle}>At a Glance</Text>
        <Text style={styles.sectionSubtitle}>Key vessel details — full spec sheet on the following page.</Text>
        <View style={styles.glanceGrid}>
          {glance.map((it) => (
            <View key={it.label} style={styles.glanceCell}>
              <Text style={styles.glanceLabel}>{it.label}</Text>
              <Text style={styles.glanceValue}>{it.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {hasDescription && (
        <View>
          <Text style={styles.sectionEyebrow}>Overview</Text>
          <View style={styles.sectionGoldLine} />
          <Text style={styles.sectionTitle}>About the {yacht.name}</Text>
          <Text style={styles.sectionSubtitle}>What makes this yacht stand out.</Text>
          <Text style={styles.paraLead}>{lead}</Text>
          {rest.map((p, i) => (
            <Text key={i} style={styles.para}>{p}</Text>
          ))}
        </View>
      )}

      <Footer />
    </Page>
  );
}

function FullBleedPhoto({ src, caption }) {
  return (
    <Page size="A4" style={styles.pageBleed}>
      <View style={styles.fullPhotoWrap}>
        <Image src={src} style={styles.fullPhotoImg} />
      </View>
      {caption ? <Text style={styles.fullPhotoCaption}>{caption}</Text> : null}
    </Page>
  );
}

function SpecSheetPage({ yacht }) {
  const factory = yacht.factory || {};
  const features = yacht.features || [];

  // Group factory specs into a couple of meaningful columns.
  const dimensionKeys = [
    "Designer", "Builder", "Model", "Hull material", "Hull type",
    "LOA", "Beam", "Beam (closed)", "Beam (Beach Mode)", "Draft", "Displacement",
  ];
  const propulsionKeys = [
    "Engines", "Drive system", "Total power",
    "Max speed", "Cruising speed", "Range",
    "Fuel capacity", "Water capacity",
  ];
  const accommodationKeys = [
    "Cabins", "Heads", "Crew", "Guests (day)", "Guests (overnight)",
  ];

  const groups = [
    { title: "Design & Dimensions", keys: dimensionKeys },
    { title: "Performance & Capacity", keys: propulsionKeys },
    { title: "Accommodation", keys: accommodationKeys },
  ]
    .map((g) => ({
      ...g,
      rows: g.keys.filter((k) => factory[k]).map((k) => ({ label: k, value: factory[k] })),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <Page size="A4" style={styles.page} wrap>
      <Header yacht={yacht} />

      <View wrap={false}>
        <Text style={styles.sectionEyebrow}>Technical File</Text>
        <View style={styles.sectionGoldLine} />
        <Text style={styles.sectionTitle}>Specifications</Text>
        <Text style={styles.sectionSubtitle}>
          Factory data for the {factory.Model || yacht.name}. Verified against manufacturer datasheets.
        </Text>
      </View>

      <View style={styles.specTwoCol}>
        {/* Left column: Design & Dimensions + Accommodation */}
        <View style={styles.specCol}>
          {groups
            .filter((g) => g.title !== "Performance & Capacity")
            .map((g) => (
              <View key={g.title} style={styles.specTable}>
                <Text style={styles.specSubhead}>{g.title}</Text>
                {g.rows.map((r) => (
                  <View key={r.label} style={styles.specRow}>
                    <Text style={styles.specRowLabel}>{r.label}</Text>
                    <Text style={styles.specRowValue}>{r.value}</Text>
                  </View>
                ))}
              </View>
            ))}
        </View>

        {/* Right column: Performance & Capacity */}
        <View style={styles.specCol}>
          {groups
            .filter((g) => g.title === "Performance & Capacity")
            .map((g) => (
              <View key={g.title} style={styles.specTable}>
                <Text style={styles.specSubhead}>{g.title}</Text>
                {g.rows.map((r) => (
                  <View key={r.label} style={styles.specRow}>
                    <Text style={styles.specRowLabel}>{r.label}</Text>
                    <Text style={styles.specRowValue}>{r.value}</Text>
                  </View>
                ))}
              </View>
            ))}

          {features.length > 0 && (
            <View style={[styles.specTable, { marginTop: 4 }]}>
              <Text style={styles.specSubhead}>Key Features</Text>
              <View style={styles.featuresGrid}>
                {features.map((f, i) => (
                  <View key={i} style={[styles.featureItem, { width: "100%" }]}>
                    <View style={styles.featureBullet} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <Footer />
    </Page>
  );
}

function GalleryPages({ yacht }) {
  const photos = yacht.images || [];
  if (photos.length === 0) return null;

  // Split into pages of up to 6 photos, then choose an adaptive magazine layout
  // per page so we never leave a single photo orphaned.
  const PER_PAGE = 6;
  const pages = [];
  for (let i = 0; i < photos.length; i += PER_PAGE) {
    pages.push(photos.slice(i, i + PER_PAGE));
  }

  function renderRow(left, right, key) {
    return (
      <View style={styles.galleryRow2} wrap={false} key={key}>
        <View style={[styles.galleryHalf, styles.galleryRowH]}>
          {left && <Image src={left} style={styles.galleryImg} />}
        </View>
        {right ? (
          <View style={[styles.galleryHalf, styles.galleryHalfRight, styles.galleryRowH]}>
            <Image src={right} style={styles.galleryImg} />
          </View>
        ) : (
          <View style={[styles.galleryHalf, styles.galleryHalfRight, styles.galleryRowH, { backgroundColor: "transparent" }]} />
        )}
      </View>
    );
  }

  function layoutForBatch(batch) {
    const n = batch.length;
    if (n === 6) {
      // 3 rows × 2 cols, no hero — every photo gets balanced real estate.
      return (
        <>
          {renderRow(batch[0], batch[1], "r1")}
          {renderRow(batch[2], batch[3], "r2")}
          {renderRow(batch[4], batch[5], "r3")}
        </>
      );
    }
    if (n === 5) {
      return (
        <>
          <View style={[styles.galleryFull, styles.galleryTallH]}>
            <Image src={batch[0]} style={styles.galleryImg} />
          </View>
          {renderRow(batch[1], batch[2], "r1")}
          {renderRow(batch[3], batch[4], "r2")}
        </>
      );
    }
    if (n === 4) {
      return (
        <>
          {renderRow(batch[0], batch[1], "r1")}
          {renderRow(batch[2], batch[3], "r2")}
        </>
      );
    }
    if (n === 3) {
      return (
        <>
          <View style={[styles.galleryFull, styles.galleryTallH]}>
            <Image src={batch[0]} style={styles.galleryImg} />
          </View>
          {renderRow(batch[1], batch[2], "r1")}
        </>
      );
    }
    if (n === 2) {
      return renderRow(batch[0], batch[1], "r1");
    }
    return (
      <View style={[styles.galleryFull, styles.galleryTallH]}>
        <Image src={batch[0]} style={styles.galleryImg} />
      </View>
    );
  }

  return pages.map((batch, idx) => (
    <Page key={`gallery-${idx}`} size="A4" style={styles.page} wrap={false}>
      <Header yacht={yacht} />

      {idx === 0 && (
        <View wrap={false}>
          <Text style={styles.sectionEyebrow}>Photography</Text>
          <View style={styles.sectionGoldLine} />
          <Text style={styles.sectionTitle}>Gallery</Text>
          <Text style={styles.sectionSubtitle}>
            On-board, at sea, and on-deck imagery.
          </Text>
        </View>
      )}

      {layoutForBatch(batch)}

      <Footer />
    </Page>
  ));
}

function VideoPage({ yacht }) {
  const ids = yacht.youtubeIds || [];
  if (ids.length === 0) return null;

  return (
    <Page size="A4" style={styles.page} wrap>
      <Header yacht={yacht} />

      <View wrap={false}>
        <Text style={styles.sectionEyebrow}>On Camera</Text>
        <View style={styles.sectionGoldLine} />
        <Text style={styles.sectionTitle}>Watch on YouTube</Text>
        <Text style={styles.sectionSubtitle}>
          Tap any thumbnail to open the full video in your browser.
        </Text>
      </View>

      <View style={styles.videoGrid}>
        {ids.map((id, i) => {
          const url = `https://www.youtube.com/watch?v=${id}`;
          const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
          // 3 columns: every third card has no right margin.
          const cardStyle = (i + 1) % 3 === 0 ? styles.videoCardEdge : styles.videoCard;
          return (
            <View key={id} style={cardStyle} wrap={false}>
              <Link src={url}>
                <View style={styles.videoThumbWrap}>
                  <Image src={thumb} style={styles.videoThumb} />
                  <View style={styles.videoPlayBadge}>
                    <PlayTriangle />
                  </View>
                </View>
              </Link>
              <Text style={styles.videoLabel}>Video {String(i + 1).padStart(2, "0")}</Text>
              <Link src={url} style={styles.videoLink}>
                youtu.be/{id}
              </Link>
            </View>
          );
        })}
      </View>

      <View style={styles.endStamp}>
        <Text style={styles.endStampText}>End of Dossier · Imperial Yachting</Text>
      </View>

      <Footer />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export function BrochureDoc({ yacht }) {
  // Page layout:
  //   1. Cover (hero photo, name, tagline, quick specs)
  //   2. Full-bleed feature photo #2
  //   3. At a Glance + About
  //   4. Full Technical Specifications + Key Features
  //   5. Full-bleed feature photo #3 (if available)
  //   6+. Gallery (4 photos per page)
  //   N. Watch on YouTube
  const images = yacht.images || [];
  const featurePhoto1 = images[1] || images[0];
  const featurePhoto2 = images.length > 4 ? images[Math.floor(images.length / 2)] : null;

  return (
    <Document
      title={`${yacht.name} — Fleet Dossier`}
      author="Imperial Yachting"
      subject={`${yacht.name} — Charter brochure for brokers`}
      keywords={`${yacht.name}, yacht charter, Dubai, ${yacht.brand}, ${yacht.factory?.Model || ""}`}
    >
      <CoverPage yacht={yacht} />
      {featurePhoto1 && <FullBleedPhoto src={featurePhoto1} caption={yacht.name} />}
      <GlanceAndAboutPage yacht={yacht} />
      {Object.keys(yacht.factory || {}).length > 0 && <SpecSheetPage yacht={yacht} />}
      {featurePhoto2 && <FullBleedPhoto src={featurePhoto2} caption={`${yacht.name} · Dubai Harbour`} />}
      {GalleryPages({ yacht })}
      <VideoPage yacht={yacht} />
    </Document>
  );
}
