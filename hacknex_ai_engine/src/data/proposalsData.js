// ─── Seed Data for Proposal Queue Page ───────────────────────────────────────

export const initialProposalQueue = [
  {
    id: "PROP-MH-2026-001",
    name: "NH-48 Highway Expansion",
    district: "Pune",
    purpose: "Highway Expansion",
    area: 450,
    families: 210,
    submittedDate: "2026-09-22",
    status: "Pending",
    submittedBy: "Amit Sharma (District Collector, Pune)",
    description: "Acquisition of 450 acres across Haveli and Mandawali villages for 6-lane widening of National Highway 48.",
    documents: [
      { name: "SIA_Report_NH48_Pune.pdf", size: "2.4 MB" },
      { name: "Gram_Sabha_Resolution_Signed.pdf", size: "1.1 MB" },
      { name: "Land_Parcel_Boundary_Index.geojson", size: "850 KB" }
    ],
    coordinates: { lat: 18.5204, lng: 73.8567 },
    plotBounds: [
      [18.5150, 73.8500],
      [18.5150, 73.8630],
      [18.5250, 73.8630],
      [18.5250, 73.8500]
    ]
  },
  {
    id: "PROP-MH-2026-002",
    name: "NPCIL Power Plant Zone B",
    district: "Nashik",
    purpose: "Nuclear Power / Energy",
    area: 230,
    families: 145,
    submittedDate: "2026-09-20",
    status: "Pending",
    submittedBy: "Suresh Rao (District Collector, Nashik)",
    description: "Acquisition of 230 acres in Sinnar tehsil for auxiliary cooling facility & safety buffer zone of NPCIL.",
    documents: [
      { name: "NPCIL_BufferZone_SIA.pdf", size: "3.8 MB" },
      { name: "Environment_Clearance_NOC.pdf", size: "1.9 MB" }
    ],
    coordinates: { lat: 20.0063, lng: 73.7918 },
    plotBounds: [
      [20.0000, 73.7850],
      [20.0000, 73.7980],
      [20.0120, 73.7980],
      [20.0120, 73.7850]
    ]
  },
  {
    id: "PROP-MH-2026-003",
    name: "Nagpur Freight Corridor Railway Line",
    district: "Nagpur",
    purpose: "Railway Infrastructure",
    area: 380,
    families: 190,
    submittedDate: "2026-09-18",
    status: "Pending",
    submittedBy: "Praveen Deshmukh (District Collector, Nagpur)",
    description: "Dedicated freight rail spur connecting MIHAN Multi-modal Hub to Central Railway main trunk line.",
    documents: [
      { name: "Rail_Corridor_Alignment_Map.pdf", size: "4.2 MB" },
      { name: "Gram_Panchayat_Consent_Nagpur.pdf", size: "920 KB" }
    ],
    coordinates: { lat: 21.1458, lng: 79.0882 },
    plotBounds: [
      [21.1400, 79.0800],
      [21.1400, 79.0960],
      [21.1500, 79.0960],
      [21.1500, 79.0800]
    ]
  },
  {
    id: "PROP-MH-2026-004",
    name: "Mumbai Trans Harbour Approach Link",
    district: "Mumbai",
    purpose: "Urban Bridge & Expressway",
    area: 620,
    families: 280,
    submittedDate: "2026-09-10",
    status: "Approved",
    approvedDate: "2026-09-15",
    submittedBy: "Kavita Patil (District Collector, Mumbai)",
    description: "Land acquisition for Eastern Freeway connecting elevated ramp to Sewri interchange.",
    documents: [
      { name: "MTHL_Feasibility_Report.pdf", size: "5.1 MB" }
    ],
    coordinates: { lat: 19.0330, lng: 72.9100 },
    plotBounds: [
      [19.0280, 72.9050],
      [19.0280, 72.9150],
      [19.0380, 72.9150],
      [19.0380, 72.9050]
    ]
  },
  {
    id: "PROP-MH-2026-005",
    name: "Pune Tech Park Zone B",
    district: "Pune",
    purpose: "IT Infrastructure & SEZ",
    area: 320,
    families: 95,
    submittedDate: "2026-09-02",
    status: "Rejected",
    rejectedDate: "2026-09-14",
    rejectionReason: "Environmental clearance certificate missing from SIA documentation and Gram Sabha resolution not attached.",
    submittedBy: "Amit Sharma (District Collector, Pune)",
    description: "Proposed 320-acre SEZ expansion near Hinjawadi Phase 4.",
    documents: [
      { name: "Tech_Park_Preliminary_Notice.pdf", size: "1.4 MB" }
    ],
    coordinates: { lat: 18.5912, lng: 73.7389 },
    plotBounds: [
      [18.5860, 73.7330],
      [18.5860, 73.7440],
      [18.5960, 73.7440],
      [18.5960, 73.7330]
    ]
  }
];
