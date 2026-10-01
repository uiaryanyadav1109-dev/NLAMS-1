/**
 * src/data/corridorsGeoJSON.js
 * 
 * Authentic Geospatial Datasets for National Infrastructure Corridors (PM Gati Shakti),
 * Cadastral Land Parcels, and Environmental Reserve Zones across India.
 */

// 1. NATIONAL INFRASTRUCTURE CORRIDORS (GeoJSON FeatureCollection)
export const INFRASTRUCTURE_CORRIDORS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "ganga-expressway",
      properties: {
        id: "CORR-UP-GE-01",
        name: "Ganga Expressway (Phase-2)",
        authority: "UPEIDA / NHAI",
        totalLengthKm: 594,
        speedLimitKmH: 120,
        estimatedCostCr: 36230,
        notifiedAreaHa: 7386.4,
        acquiredAreaHa: 6842.1,
        progressPct: 92.6,
        status: "CONSTRUCTION_ACTIVE",
        color: "#FF9933",
        weight: 6,
        dashArray: null,
        description: "6-Lane greenfield expressway connecting Meerut to Prayagraj via 12 districts."
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.7064, 28.9845], // Meerut
          [77.7812, 28.7306], // Hapur
          [77.8542, 28.4069], // Bulandshahr
          [78.4712, 28.8386], // Amroha
          [78.5714, 28.5833], // Sambhal
          [79.1245, 28.0321], // Badaun
          [79.9142, 27.8833], // Shahjahanpur
          [80.1342, 27.3942], // Hardoi
          [80.4878, 26.5393], // Unnao
          [81.2408, 26.2303], // Rae Bareli
          [81.9963, 25.9204], // Pratapgarh
          [81.8463, 25.4358]  // Prayagraj
        ]
      }
    },
    {
      type: "Feature",
      id: "delhi-mumbai-expressway",
      properties: {
        id: "CORR-NH-DME-02",
        name: "Delhi-Mumbai Expressway (NE-4)",
        authority: "NHAI / Ministry of MoRTH",
        totalLengthKm: 1386,
        speedLimitKmH: 120,
        estimatedCostCr: 98000,
        notifiedAreaHa: 15400.0,
        acquiredAreaHa: 14980.5,
        progressPct: 97.2,
        status: "PARTIALLY_OPERATIONAL",
        color: "#138808",
        weight: 6,
        dashArray: null,
        description: "8-Lane access-controlled expressway linking Sohna (Gurugram) to JNPT Mumbai."
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.0689, 28.2494], // Sohna / Gurugram
          [76.8404, 27.8083], // Nuh (Haryana)
          [76.6342, 27.2412], // Alwar (Rajasthan)
          [76.3533, 26.8914], // Dausa
          [76.1287, 26.0124], // Sawai Madhopur
          [75.8333, 25.1833], // Kota
          [75.0412, 23.8341], // Ratlam (MP)
          [73.6124, 22.8041], // Dahod (Gujarat)
          [73.1812, 22.3072], // Vadodara
          [72.8311, 21.1702], // Surat
          [72.9289, 20.3893], // Vapi
          [72.8777, 19.0760]  // Mumbai
        ]
      }
    },
    {
      type: "Feature",
      id: "eastern-dfc",
      properties: {
        id: "CORR-RLY-EDFC-03",
        name: "Eastern Dedicated Freight Corridor (EDFC)",
        authority: "DFCCIL / Ministry of Railways",
        totalLengthKm: 1875,
        speedLimitKmH: 100,
        estimatedCostCr: 51000,
        notifiedAreaHa: 11800.0,
        acquiredAreaHa: 11450.0,
        progressPct: 96.8,
        status: "COMMISSIONED",
        color: "#003580",
        weight: 5,
        dashArray: "6, 6",
        description: "Heavy freight rail corridor from Sahnewal (Ludhiana) to Dankuni (Kolkata)."
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [75.8573, 30.9010], // Ludhiana
          [76.7794, 30.3782], // Ambala
          [77.1025, 28.7041], // Delhi / Khurja
          [78.0081, 27.1767], // Agra / Tundla
          [80.3319, 26.4499], // Kanpur
          [81.8463, 25.4358], // Prayagraj
          [83.0064, 25.3176], // Varanasi / Pt Deen Dayal Upadhyaya
          [84.9994, 24.7914], // Gaya
          [86.4304, 23.7957], // Dhanbad
          [87.8550, 22.9868]  // Dankuni (WB)
        ]
      }
    }
  ]
};

// 2. CADASTRAL LAND PARCELS (GeoJSON FeatureCollection)
export const CADASTRAL_PARCELS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "UP-MRT-2026-P01",
      properties: {
        parcel_id: "UP-MRT-2026-P01",
        khasra_no: "104/2",
        village: "Mohiuddinpur",
        tehsil: "Meerut",
        district: "Meerut",
        state: "Uttar Pradesh",
        owner_name: "Ram Singh, Baldev Singh & Smt. Kamlesh",
        land_category: "Agricultural (Triple Crop Irrigated)",
        area_sqm: 14200,
        area_ha: 1.42,
        notified_corridor: "Ganga Expressway (Phase-2)",
        status: "AWARD_PASSED",
        circle_rate_sqm: 1850,
        compensation_amount_inr: 5254000,
        disbursed_inr: 5254000,
        conflict_status: "CLEAR",
        acquisition_date: "14-Jan-2026"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.6842, 28.9321],
          [77.6895, 28.9324],
          [77.6892, 28.9285],
          [77.6838, 28.9282],
          [77.6842, 28.9321]
        ]]
      }
    },
    {
      type: "Feature",
      id: "UP-MRT-2026-P02",
      properties: {
        parcel_id: "UP-MRT-2026-P02",
        khasra_no: "204",
        village: "Shatabdi Nagar",
        tehsil: "Meerut",
        district: "Meerut",
        state: "Uttar Pradesh",
        owner_name: "Surendra Yadav & Brothers",
        land_category: "Commercial / Semi-Urban",
        area_sqm: 8500,
        area_ha: 0.85,
        notified_corridor: "Ganga Expressway (Phase-2)",
        status: "OBJECTION_PENDING",
        circle_rate_sqm: 3200,
        compensation_amount_inr: 5440000,
        disbursed_inr: 0,
        conflict_status: "CLEAR",
        acquisition_date: "Pending Hearing (Sec 15)"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.6920, 28.9350],
          [77.6965, 28.9355],
          [77.6960, 28.9318],
          [77.6915, 28.9314],
          [77.6920, 28.9350]
        ]]
      }
    },
    {
      type: "Feature",
      id: "UP-HPR-2026-P03",
      properties: {
        parcel_id: "UP-HPR-2026-P03",
        khasra_no: "318/1",
        village: "Babu Garh",
        tehsil: "Hapur",
        district: "Hapur",
        state: "Uttar Pradesh",
        owner_name: "Smt. Shanti Devi & Anil Kumar",
        land_category: "Agricultural",
        area_sqm: 21500,
        area_ha: 2.15,
        notified_corridor: "Ganga Expressway (Phase-2)",
        status: "COMPENSATION_SCHEDULED",
        circle_rate_sqm: 1450,
        compensation_amount_inr: 6235000,
        disbursed_inr: 3000000,
        conflict_status: "CLEAR",
        acquisition_date: "28-Feb-2026"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.7712, 28.7215],
          [77.7780, 28.7220],
          [77.7775, 28.7160],
          [77.7708, 28.7155],
          [77.7712, 28.7215]
        ]]
      }
    },
    // DELIBERATE OVERLAP ANOMALY PARCEL (For Demonstration of Feature 4 Verification Engine)
    {
      type: "Feature",
      id: "UP-MRT-2026-CONFLICT-08",
      properties: {
        parcel_id: "UP-MRT-2026-CONFLICT-08",
        khasra_no: "512/Forest-Adj",
        village: "Hastinapur Khadar",
        tehsil: "Mawana",
        district: "Meerut",
        state: "Uttar Pradesh",
        owner_name: "Chandra Prakash (Claimant) vs Forest Dept",
        land_category: "Restricted Sanctuary Buffer",
        area_sqm: 34200,
        area_ha: 3.42,
        notified_corridor: "Ganga Expressway (Phase-2)",
        status: "DISPUTED_OVERLAP",
        circle_rate_sqm: 900,
        compensation_amount_inr: 6156000,
        disbursed_inr: 0,
        conflict_status: "CRITICAL_OVERLAP",
        conflict_reason: "Overlaps with Hastinapur Wildlife Sanctuary Protected Eco-Sensitive Zone.",
        acquisition_date: "Under Section 64 Tribunal Review"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.9850, 29.1450],
          [78.0050, 29.1480],
          [78.0020, 29.1250],
          [77.9820, 29.1220],
          [77.9850, 29.1450]
        ]]
      }
    }
  ]
};

// 3. ENVIRONMENTAL & FOREST BUFFER ZONES (GeoJSON FeatureCollection)
export const PROTECTED_ZONES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "HASTINAPUR-SANCTUARY-BUFFER",
      properties: {
        zone_id: "ECO-HAST-01",
        name: "Hastinapur Wildlife Sanctuary (Eco-Sensitive Buffer)",
        category: "Protected Forest / Ramsar Wetland",
        governing_body: "Ministry of Environment, Forest & Climate Change (MoEFCC)",
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.28,
        restriction_level: "STRICT_PROHIBITION",
        statutory_notice: "No land acquisition without prior Standing Committee NBWL clearance."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.9700, 29.1600],
          [78.0200, 29.1650],
          [78.0300, 29.1100],
          [77.9650, 29.1050],
          [77.9700, 29.1600]
        ]]
      }
    },
    {
      type: "Feature",
      id: "SARISKA-TIGER-RESERVE-BUFFER",
      properties: {
        zone_id: "ECO-SARISKA-02",
        name: "Sariska Tiger Reserve Eco-Buffer (Alwar)",
        category: "Critical Tiger Habitat Buffer",
        governing_body: "Rajasthan Forest Department / NTCA",
        color: "#dc2626",
        fillColor: "#dc2626",
        fillOpacity: 0.22,
        restriction_level: "SURVEY_REQUIRED",
        statutory_notice: "Mandatory wildlife underpass compliance for Delhi-Mumbai Expressway."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [76.4500, 27.4200],
          [76.6200, 27.4300],
          [76.6000, 27.2000],
          [76.4300, 27.1900],
          [76.4500, 27.4200]
        ]]
      }
    }
  ]
};

// 4. MAP TILE PROVIDERS (Bhuvan ISRO, CartoDB Light, OpenStreetMap, Satellite)
export const MAP_LAYERS = {
  osm: {
    name: "OpenStreetMap Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: "Esri World Imagery (Satellite)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  },
  cartoLight: {
    name: "CartoDB Positron (High-Contrast Cadastral)",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  bhuvanStyle: {
    name: "Bhuvan ISRO GeoPlatform Hybrid",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Bhuvan ISRO Styled &copy; Survey of India / Esri"
  }
};
