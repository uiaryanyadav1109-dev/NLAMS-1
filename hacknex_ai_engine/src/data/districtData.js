// ─── Seed Data for District Officer Dashboard (Pune District) ────────────────

export const districtProfile = {
  district: "Pune",
  districtHi: "पुणे",
  state: "Maharashtra",
  emblem: "📋",
  officer: {
    name: "Amit Sharma",
    designation: "District Collector & Magistrate",
    department: "District Revenue Office, Pune",
    email: "collector.pune@maharashtra.gov.in",
    phone: "+91 94220 12345",
  },
  unreadNotifications: 5,
};

// ─── District KPIs ───────────────────────────────────────────────────────────
export const districtKPI = {
  totalProposals: 6,
  activeProjects: 3,
  familiesAffected: 1410,
  compensationPending: 185.0, // crore
  trends: {
    proposals: { dir: "up", val: "+1 this month" },
    projects: { dir: "up", val: "2 ongoing, 1 delayed" },
    families: { dir: "up", val: "320 verified" },
    compensation: { dir: "down", val: "₹112 Cr paid" },
  },
};

// ─── Proposals Submitted by this District Officer ───────────────────────────
export const districtProposals = [
  {
    id: "PROP-PUN-2026-001",
    name: "Pune–Satara Expressway Extension",
    purpose: "Expressway Widening",
    area: 680,
    families: 210,
    compensationEst: 142.5,
    submittedDate: "2026-09-18",
    status: "Pending", // 🟡 Pending
    statusNote: "Under review by State Revenue Secretary",
  },
  {
    id: "PROP-PUN-2026-002",
    name: "Haveli Industrial Logistics Hub",
    purpose: "Industrial Infrastructure",
    area: 450,
    families: 180,
    compensationEst: 95.0,
    submittedDate: "2026-09-10",
    status: "Approved", // 🟢 Approved
    statusNote: "Approved by State Govt. Forwarded to MoRTH for final clearance.",
  },
  {
    id: "PROP-PUN-2026-003",
    name: "Pune Tech Park Zone B",
    purpose: "IT Infrastructure & SEZ",
    area: 320,
    families: 95,
    compensationEst: 78.0,
    submittedDate: "2026-09-02",
    status: "Rejected", // 🔴 Rejected
    rejectionReason: "Environmental clearance certificate missing from SIA documentation and Gram Sabha resolution not attached.",
    rejectedDate: "2026-09-14",
  },
  {
    id: "PROP-PUN-2026-004",
    name: "NH-48 Land Acquisition Pune",
    purpose: "National Highway Expansion",
    area: 1250,
    families: 320,
    compensationEst: 185.5,
    submittedDate: "2025-06-10",
    status: "Live", // 🔵 Live
    statusNote: "Fully approved & active in Compensation phase",
  },
  {
    id: "PROP-PUN-2026-005",
    name: "Pune Ring Road Western Arc",
    purpose: "Outer Ring Road",
    area: 780,
    families: 290,
    compensationEst: 210.0,
    submittedDate: "2025-08-15",
    status: "Live", // 🔵 Live
    statusNote: "Fully approved & active in Compensation phase (Delayed)",
  },
  {
    id: "PROP-PUN-2026-006",
    name: "Mulshi Water Storage Reservoir",
    purpose: "Irrigation & Drinking Water",
    area: 890,
    families: 315,
    compensationEst: 160.0,
    submittedDate: "2026-08-28",
    status: "Approved", // 🟢 Approved
    statusNote: "Approved by State Cabinet. Final award declaration under progress.",
  },
];

// ─── Ongoing Live Projects in Pune District ────────────────────────────────
export const districtOngoingProjects = [
  {
    id: 1,
    name: "NH-48 Land Acquisition Pune",
    purpose: "National Highway Expansion",
    stage: "Compensation",
    area: 1250,
    families: 320,
    compensationPercent: 60,
    lastUpdated: "2026-09-22",
    delayed: false,
    delayDays: 0,
    coordinates: [18.5204, 73.8567],
    tehsil: "Haveli",
  },
  {
    id: 5,
    name: "Pune Ring Road Western Arc",
    purpose: "Outer Ring Road",
    stage: "Compensation",
    area: 780,
    families: 290,
    compensationPercent: 48,
    lastUpdated: "2026-09-19",
    delayed: true,
    delayDays: 45,
    coordinates: [18.4500, 73.7800],
    tehsil: "Mulshi",
  },
  {
    id: 13,
    name: "Pune Metro Line 3 Depot",
    purpose: "Urban Transit Corridor",
    stage: "Possession",
    area: 340,
    families: 140,
    compensationPercent: 85,
    lastUpdated: "2026-09-23",
    delayed: false,
    delayDays: 0,
    coordinates: [18.5912, 73.7389],
    tehsil: "Hinjawadi",
  },
];

// ─── Field Officer Ground Activity Feed ────────────────────────────────────
export const fieldActivityFeed = [
  {
    id: 1,
    officerName: "Ramesh Patil",
    role: "Field Surveyor",
    avatarColor: "from-emerald-500 to-teal-700",
    message: "Geo-tagged 14 land parcels for NH-48 Pune expansion in Mandawali village",
    timestamp: "2 hrs ago",
    project: "NH-48 Land Acquisition Pune",
    type: "geotag",
  },
  {
    id: 2,
    officerName: "Suresh Deshmukh",
    role: "Revenue Inspector",
    avatarColor: "from-blue-500 to-indigo-700",
    message: "Uploaded 8 site inspection photos & boundary verification sheets for Pune Ring Road",
    timestamp: "5 hrs ago",
    project: "Pune Ring Road Western Arc",
    type: "photo",
  },
  {
    id: 3,
    officerName: "Priya Kulkarni",
    role: "R&R Officer",
    avatarColor: "from-amber-500 to-orange-700",
    message: "Completed Gram Sabha public hearing with 45 affected landowners in Hinjawadi",
    timestamp: "8 hrs ago",
    project: "Pune Metro Line 3 Depot",
    type: "hearing",
  },
  {
    id: 4,
    officerName: "Vikas Shinde",
    role: "Land Valuation Officer",
    avatarColor: "from-purple-500 to-violet-700",
    message: "Verified bank account details for 32 compensation claims in Mulshi tehsil",
    timestamp: "12 hrs ago",
    project: "Pune Ring Road Western Arc",
    type: "verification",
  },
];

// ─── Rejected Proposals List ───────────────────────────────────────────────
export const rejectedProposals = districtProposals.filter(p => p.status === "Rejected");
