// Manufacturer / factory specs per yacht model — what brokers actually need.
// Numbers sourced from publicly available manufacturer datasheets.

// Curated model overview used when the database description is empty or just
// placeholder text. Adds publication-grade copy that brokers can hand to
// clients without sounding generic.
export const MODEL_OVERVIEW = {
  "vd-40":
    "The VanDutch 40 is one of the most instantly recognisable silhouettes in the day-yacht segment. Conceived by Dutch naval architect Frank Mulder, its uncluttered “walk-around” deck and flush-mounted hardware give it the visual purity of a supercar. The 2024 refit takes that signature design and layers in the modern essentials Dubai charter clients expect — a 3 kW concert-grade audio rig, AirPlay-ready Wi-Fi, full air-conditioning and an electrically-actuated bathing platform. It is the rare yacht that performs as well as a head-turner as it does as a day-cruising platform for 10.",
  "monte-carlo-6":
    "The Monte Carlo 6 is the long-range flagship of Beneteau’s sport-flybridge line, drawn by Italian studio Nuvolari & Lenard and built at the Monte Carlo Yachts shipyard in Monfalcone. Its variable-deadrise deep-V hull pairs cruising stability with 31-knot sprint performance, while twin Cummins QSC 8.3 engines driving Zeus pod drives deliver joystick docking and SkyHook station-keeping. Three en-suite cabins (full-beam master, forepeak VIP and twin) accommodate up to six guests overnight, with the flybridge, aft cockpit and bow lounger comfortably seating fifteen for day charter. Hand-laid teak, solid marble fittings and an Italian-designed saloon give the MC6 the unmistakable feel of a much larger superyacht.",
  evo4:
    "The Evo R4 (marketed as the Evo 43) is one of the most architecturally radical day yachts launched in the last decade. Designed by Naples-based Valerio Rivellini for Sea Engineering, two pairs of hydraulically actuated bulwarks fold outboard at anchor, transforming the cockpit from a 4.2 m beam underway into a 6.4 m, 40 m² floating beach club. Underway, twin Volvo IPS 600s deliver a 37-knot top speed and joystick docking; at rest, the convertible furniture, integrated e-Foil, sun pads and shaded saloon turn the boat into a private waterfront terrace. It is the most photographable yacht on the Dubai charter circuit.",
};

export const YACHT_FACTS = {
  "vd-40": {
    yearOverride: null,
    refitOverride: null,
    factory: {
      Designer: "Frank Mulder",
      Builder: "Van Dutch (Netherlands)",
      Model: "Van Dutch 40",
      "Hull material": "GRP composite",
      "Hull type": "Deep-V planing",
      LOA: "12.50 m  /  41' 0\"",
      Beam: "3.55 m  /  11' 8\"",
      Draft: "0.95 m  /  3' 1\"",
      Displacement: "7,800 kg",
      "Fuel capacity": "750 L",
      "Water capacity": "140 L",
      Engines: "2 × Volvo Penta D6-330",
      "Total power": "660 HP",
      "Max speed": "38 knots",
      "Cruising speed": "28 knots",
      Range: "approx. 250 nm",
      Cabins: "1 double + saloon convertible",
      Heads: "1 (electric)",
      "Guests (day)": "10",
      "Guests (overnight)": "2",
    },
    features: [
      "Iconic minimalist “walk-around” deck",
      "3 kW concert-grade sound system",
      "Wi-Fi + AirPlay streaming",
      "Air-conditioned cabin",
      "Hydraulic swim platform",
      "Massive forward & aft sun pads",
      "Electric head + freshwater shower",
      "2024 full refit",
    ],
  },

  "monte-carlo-6": {
    // The site lists 2021; user confirmed actual hull is 2020.
    yearOverride: 2020,
    refitOverride: null,
    factory: {
      Designer: "Nuvolari · Lenard",
      Builder: "Beneteau · Monte Carlo Yachts",
      Model: "Monte Carlo 6 (MC6)",
      "Hull material": "GRP composite",
      "Hull type": "Deep-V planing (variable deadrise)",
      LOA: "18.39 m  /  60' 4\"",
      Beam: "4.85 m  /  15' 11\"",
      Draft: "1.40 m  /  4' 7\"",
      Displacement: "26,000 kg (light)",
      "Fuel capacity": "2,500 L",
      "Water capacity": "530 L",
      Engines: "2 × Cummins QSC 8.3",
      "Drive system": "Cummins Zeus pod drives",
      "Total power": "1,200 HP",
      "Max speed": "31 knots",
      "Cruising speed": "25 knots",
      Range: "approx. 310 nm",
      Cabins: "3 (Master + VIP + Twin)",
      Heads: "3 en-suite",
      "Guests (day)": "15",
      "Guests (overnight)": "6",
      Crew: "1 (separate quarters)",
    },
    features: [
      "Three en-suite cabins, full-beam master",
      "Cummins Zeus pod drives — joystick docking & SkyHook station-keeping",
      "Hydraulic swim platform / tender garage",
      "Large flybridge with wet bar",
      "Open-air aft cockpit dining for 10",
      "Italian-designed interior — solid teak & marble",
      "Stabilisers ready",
      "Full air-conditioning & generator",
    ],
  },

  "evo4": {
    yearOverride: null,
    refitOverride: null,
    factory: {
      Designer: "Valerio Rivellini",
      Builder: "Evo Yachts (Sea Engineering)",
      Model: "Evo R4 / Evo 43",
      "Hull material": "GRP composite",
      "Hull type": "Deep-V planing",
      LOA: "13.30 m  /  43' 8\"",
      "Beam (closed)": "4.20 m  /  13' 9\"",
      "Beam (Beach Mode)": "6.40 m  /  21' 0\"",
      Draft: "1.05 m  /  3' 5\"",
      Displacement: "10,500 kg",
      "Fuel capacity": "750 L",
      "Water capacity": "200 L",
      Engines: "2 × Volvo Penta IPS 600",
      "Total power": "870 HP",
      "Max speed": "37 knots",
      "Cruising speed": "28 knots",
      Range: "approx. 280 nm",
      Cabins: "1 double + saloon convertible",
      Heads: "1 en-suite",
      "Guests (day)": "10",
      "Guests (overnight)": "2",
    },
    features: [
      "Hydraulic fold-out terraces — 40 m² beach club at anchor",
      "Volvo IPS joystick docking",
      "e-Foil on board",
      "Hydraulic swim platform",
      "Cockpit convertible dining ↔ sun lounger",
      "Italian-designed minimalist interior",
      "Bow sun pad with adjustable backrests",
      "Air-conditioning & onboard fridge / freezer",
    ],
  },
};
