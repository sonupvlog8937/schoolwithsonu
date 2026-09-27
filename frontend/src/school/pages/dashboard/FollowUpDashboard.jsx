import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoopIcon from "@mui/icons-material/Loop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { fetchSchoolDashboard } from "../../../state/schoolDashboardsSlice";
import { fetchEnquiries } from "../../../state/admissionEnquirySlice";

/* ---------- Animations & tokens ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const floaty = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;
const shift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const NO_MOTION = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };
// "backwards" fill so hover transforms keep working after the entrance ends
const enter = (ms = 0) => ({ animation: `${fadeUp} .5s ${EASE} ${ms}ms backwards`, ...NO_MOTION });

const GRADS = [
  ["#f472b6", "#db2777"],
  ["#34d399", "#059669"],
  ["#60a5fa", "#4f46e5"],
  ["#fbbf24", "#f97316"],
  ["#fb7185", "#e11d48"],
  ["#a78bfa", "#7c3aed"],
];

const cardSx = {
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,.18)",
  boxShadow: "0 6px 20px rgba(15,23,42,.05)",
  transition: `transform .35s ${EASE}, box-shadow .35s ${EASE}`,
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 30px rgba(15,23,42,.09)" },
};

const fieldSx = {
  "& .MuiInputBase-input": { fontSize: 12.5 },
  "& .MuiInputLabel-root": { fontSize: 12.5 },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "#fff",
    transition: "box-shadow .25s ease",
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(236,72,153,.15)" },
    "&.Mui-focused fieldset": { borderColor: "#ec4899" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ec4899" },
};

const headSx = {
  "& th": {
    background: "linear-gradient(90deg,#fdf2f8,#eef2ff)",
    fontWeight: 700,
    fontSize: 11.5,
    color: "#475569",
    borderBottom: "2px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// overdue = red, today = amber, upcoming = green
const dueTone = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  const t = new Date();
  d.setHours(0, 0, 0, 0);
  t.setHours(0, 0, 0, 0);
  if (d < t) return "#ef4444";
  if (d.getTime() === t.getTime()) return "#f59e0b";
  return "#10b981";
};

/* ---------- Small components (outside main so they don't remount/re-animate) ---------- */

// Number that counts up smoothly
function CountUp({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    let raf;
    let start;
    const step = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / 900, 1);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{Math.round(n).toLocaleString("en-IN")}</>;
}

function StatCard({ label, value, icon: Icon, g, delay }) {
  return (
    <Card
      sx={{
        ...cardSx,
        ...enter(delay),
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        border: "none",
        minHeight: 118,
        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
        boxShadow: `0 10px 24px ${g[1]}40`,
        "&:hover": { transform: "translateY(-4px)", boxShadow: `0 16px 32px ${g[1]}59` },
      }}
    >
      <Box sx={{ position: "absolute", top: -26, right: -26, width: 84, height: 84, borderRadius: "50%", bgcolor: "rgba(255,255,255,.16)" }} />
      <Box sx={{ position: "absolute", bottom: -34, left: -10, width: 60, height: 60, borderRadius: "50%", bgcolor: "rgba(255,255,255,.10)" }} />
      <CardContent sx={{ position: "relative", p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: "11px", bgcolor: "rgba(255,255,255,.22)", mb: 1.25 }}>
          <Icon sx={{ fontSize: 19 }} />
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          <CountUp value={value} />
        </Typography>
        <Typography sx={{ fontSize: 11, mt: 0.4, fontWeight: 600, opacity: 0.94 }}>{label}</Typography>
      </CardContent>
    </Card>
  );
}

function PanelHeader({ icon: Icon, color, title }) {
  return (
    <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.25, borderBottom: "1px solid #edf0f2", background: `linear-gradient(90deg,${color}14,transparent)` }}>
      <Box sx={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: "9px", bgcolor: `${color}22`, color }}>
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#17233b" }}>{title}</Typography>
    </Box>
  );
}

function FileSearchIcon({ size, color, sx }) {
  return <SearchOffIcon sx={{ fontSize: size, color, animation: `${floaty} 3s ease-in-out infinite`, ...NO_MOTION, ...sx }} />;
}

function EmptyState({ size = 44, text = "No Data" }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <FileSearchIcon size={size} color="#cbd5e1" />
      <Typography sx={{ color: "#94a3b8", fontSize: 12.5, mt: 1 }}>{text}</Typography>
    </Box>
  );
}

function Pill({ label, color }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.2,
        borderRadius: "8px",
        bgcolor: `${color}1A`,
        color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        transition: "transform .2s ease",
        "&:hover": { transform: "scale(1.08)" },
      }}
    >
      {label}
    </Box>
  );
}

function Initial({ text, g, size = 26 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "10px",
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontSize: size * 0.42,
        fontWeight: 700,
        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
      }}
    >
      {String(text || "?").charAt(0).toUpperCase()}
    </Box>
  );
}

export default function FollowUpDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.schoolDashboards["follow-up"]);
  const admissionState = useSelector((state) => state.admissionEnquiry || {});
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [prmFilter, setPrmFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const currentUserName = useSelector((state) => state.login?.user?.name || state.login?.user?.fullName || "");

  useEffect(() => {
    dispatch(fetchSchoolDashboard("follow-up"));
    dispatch(fetchEnquiries({ page: 1, limit: 200 }));
  }, [dispatch]);

  const dashboard = data || {};
  const enquiries = dashboard.enquiries || [];
  const calls = dashboard.calls || [];
  const classWiseBreakdown = dashboard.classWiseBreakdown || [];
  const prmWisePerformance = dashboard.prmWisePerformance || [];

  const statusOptions = admissionState.statusOptions || [];
  const sourceOptions = admissionState.sourceOptions || [];
  const referenceOptions = admissionState.referenceOptions || [];
  const classOptions = admissionState.classes || [];

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...sourceOptions,
          ...statusOptions,
          ...calls.map((call) => call.callType).filter(Boolean),
          "Follow-up",
          "Remark",
        ]),
      ),
    [sourceOptions, statusOptions, calls],
  );

  const ownerOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...enquiries.map((entry) => entry.assignedTo).filter(Boolean),
          ...calls.map((call) => call.assignedTo).filter(Boolean),
        ]),
      ),
    [enquiries, calls],
  );

  const prmOptions = useMemo(
    () => Array.from(new Set([...referenceOptions, ...enquiries.map((entry) => entry.referredBy).filter(Boolean)])),
    [referenceOptions, enquiries],
  );

  // Calculate stats
  const stats = [
    { key: "total", label: "Total queries", value: dashboard.total || 0, icon: EditNoteIcon, g: GRADS[0] },
    { key: "active", label: "Active", value: dashboard.active || 0, icon: CheckCircleOutlineIcon, g: GRADS[1] },
    { key: "converted", label: "Converted", value: dashboard.converted || 0, icon: LoopIcon, g: GRADS[2] },
    { key: "upcoming", label: "Pending follow-ups", value: dashboard.upcoming || 0, icon: AccessTimeIcon, g: GRADS[3] },
    { key: "todayFollowUps", label: "Today's follow-ups", value: dashboard.todayFollowUps || 0, icon: NotificationsActiveIcon, g: GRADS[4] },
    { key: "unassigned", label: "Unassigned", value: dashboard.unassigned || 0, icon: PersonSearchIcon, g: GRADS[5] },
  ];

  // Combined records for table
  const records = [
    ...enquiries.map((e) => ({ ...e, type: e.status || "Follow-up", entityType: "Enquiry" })),
    ...calls.map((c) => ({ ...c, type: c.callType || "Follow-up", entityType: "Call" })),
  ].filter((record) => {
    const textMatch = !search || [record.studentName, record.name, record.phone, record.guardianName].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()));
    if (!textMatch) return false;
    if (statusFilter !== "all" && record.status !== statusFilter) return false;
    if (typeFilter !== "all" && ![record.type, record.entityType, record.callType].includes(typeFilter)) return false;
    if (ownerFilter === "mine") {
      const assignedName = String(record.assignedTo || record.name || record.studentName || "").toLowerCase();
      const currentUserLower = currentUserName.toLowerCase();
      if (currentUserLower && !assignedName.includes(currentUserLower)) return false;
      if (!currentUserLower && !(record.followUpDate || (record.status || "").toLowerCase().includes("follow"))) return false;
    }
    if (classFilter !== "all" && record.classInterested !== classFilter && record.className !== classFilter) return false;
    if (prmFilter !== "all" && record.referredBy !== prmFilter && record.source !== prmFilter) return false;
    if (dateFrom && record.followUpDate && new Date(record.followUpDate) < new Date(dateFrom)) return false;
    if (dateTo && record.followUpDate && new Date(record.followUpDate) > new Date(dateTo)) return false;
    return true;
  });

  if (loading && !data) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#ec4899" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background:
          "radial-gradient(900px 420px at 0% 0%, rgba(236,72,153,.10), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(99,102,241,.10), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(16,185,129,.07), transparent 60%), #f8fafc",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: { xs: 2.5, md: 3 },
          borderRadius: "18px",
          color: "#fff",
          background: "linear-gradient(120deg,#ec4899 0%,#a855f7 45%,#6366f1 80%,#0ea5e9 100%)",
          backgroundSize: "200% 200%",
          animation: `${fadeUp} .5s ${EASE} backwards, ${shift} 12s ease infinite`,
          boxShadow: "0 12px 28px rgba(168,85,247,.30)",
          ...NO_MOTION,
        }}
      >
        <Box sx={{ position: "absolute", top: -40, right: 160, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(255,255,255,.12)" }} />
        <Box sx={{ position: "absolute", bottom: -50, right: -20, width: 130, height: 130, borderRadius: "50%", bgcolor: "rgba(255,255,255,.10)" }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
          sx={{ position: "relative" }}
        >
          <Box>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/school")}
              sx={{
                p: 0, mb: 1, minWidth: 0, color: "rgba(255,255,255,.9)", textTransform: "none", fontSize: 12,
                "& .MuiButton-startIcon": { transition: `transform .25s ${EASE}` },
                "&:hover": { bgcolor: "transparent", color: "#fff", "& .MuiButton-startIcon": { transform: "translateX(-3px)" } },
              }}
            >
              Back to Dashboard
            </Button>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, md: 22 }, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 1 }}>
              <EditNoteIcon sx={{ fontSize: { xs: 22, md: 26 } }} />
              Admission & Follow-up Dashboard
            </Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12, opacity: 0.92 }}>Track admission queries, follow-ups, and PRM performance</Typography>
          </Box>
          <Stack direction="row" gap={1.25}>
            <Button
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16, transition: `transform .5s ${EASE}` }} />}
              onClick={() => dispatch(fetchSchoolDashboard("follow-up"))}
              sx={{
                color: "#fff", textTransform: "none", fontWeight: 700, fontSize: 12, borderRadius: "10px",
                bgcolor: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.4)", backdropFilter: "blur(6px)",
                transition: `all .25s ${EASE}`,
                "&:hover": { bgcolor: "rgba(255,255,255,.3)", transform: "translateY(-2px)", "& svg": { transform: "rotate(180deg)" } },
              }}
            >
              Refresh
            </Button>
            <Button
              size="small"
              onClick={() => navigate("/school/front-office/admission-enquiry")}
              sx={{
                bgcolor: "#fff", color: "#db2777", textTransform: "none", fontWeight: 700, fontSize: 12, borderRadius: "10px",
                boxShadow: "0 6px 16px rgba(0,0,0,.15)", transition: `all .25s ${EASE}`,
                "&:hover": { bgcolor: "#fdf2f8", transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(0,0,0,.2)" },
              }}
            >
              All Queries
            </Button>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Box sx={{ mb: 2, px: 2, py: 1, borderRadius: "12px", bgcolor: "#ef44441A", color: "#dc2626", fontSize: 12.5, fontWeight: 500 }}>
          {error}
        </Box>
      )}

      {/* Stats Grid - 6 Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(({ key, ...rest }, i) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <StatCard {...rest} delay={60 + i * 60} />
          </Grid>
        ))}
      </Grid>

      {/* Class-wise Breakdown & PRM-wise Performance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ ...cardSx, ...enter(420), minHeight: 200, height: "100%", overflow: "hidden" }}>
            <PanelHeader icon={BarChartIcon} color="#ec4899" title="Class-wise Breakdown" />
            <CardContent sx={{ p: 2 }}>
              {classWiseBreakdown.length > 0 ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, px: 1.25, py: 0.75, borderRadius: "10px", background: "linear-gradient(90deg,#fdf2f8,#eef2ff)" }}>
                    <Typography sx={{ flex: 1.5, fontSize: 11.5, fontWeight: 700, color: "#64748b" }}>Class</Typography>
                    <Typography sx={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: "#64748b", textAlign: "center" }}>Total</Typography>
                    <Typography sx={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: "#64748b", textAlign: "center" }}>Active</Typography>
                    <Typography sx={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: "#64748b", textAlign: "center" }}>Converted</Typography>
                  </Box>
                  {classWiseBreakdown.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 1.25,
                        py: 0.9,
                        borderRadius: "10px",
                        mb: 0.75,
                        bgcolor: index % 2 === 0 ? "#fafbfc" : "transparent",
                        transition: "all .25s ease",
                        "&:hover": { bgcolor: "#fdf7fb", transform: "translateX(4px)" },
                      }}
                    >
                      <Typography sx={{ flex: 1.5, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                        {item._id || "Not Specified"}
                      </Typography>
                      <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                        {item.total || 0}
                      </Typography>
                      <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#10b981", textAlign: "center" }}>
                        {item.active || 0}
                      </Typography>
                      <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#3b82f6", textAlign: "center" }}>
                        {item.converted || 0}
                      </Typography>
                    </Box>
                  ))}
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
                  <EmptyState size={48} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ ...cardSx, ...enter(480), minHeight: 200, height: "100%", overflow: "hidden" }}>
            <PanelHeader icon={ShowChartIcon} color="#6366f1" title="PRM-wise Performance" />
            <CardContent sx={{ p: 2 }}>
              {prmWisePerformance.length > 0 ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, px: 1.25, py: 0.75, borderRadius: "10px", background: "linear-gradient(90deg,#fdf2f8,#eef2ff)" }}>
                    <Typography sx={{ flex: 2, fontSize: 11.5, fontWeight: 700, color: "#64748b" }}>PRM</Typography>
                    <Typography sx={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: "#64748b", textAlign: "center" }}>Assigned</Typography>
                    <Typography sx={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: "#64748b", textAlign: "center" }}>Converted</Typography>
                  </Box>
                  {prmWisePerformance.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 1.25,
                        py: 0.9,
                        borderRadius: "10px",
                        mb: 0.75,
                        bgcolor: index % 2 === 0 ? "#fafbfc" : "transparent",
                        transition: "all .25s ease",
                        "&:hover": { bgcolor: "#f0f7ff", transform: "translateX(4px)" },
                      }}
                    >
                      <Typography sx={{ flex: 2, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                        {item.prmName || "Unknown"}
                      </Typography>
                      <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                        {item.assigned || 0}
                      </Typography>
                      <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#3b82f6", textAlign: "center" }}>
                        {item.converted || 0}
                      </Typography>
                    </Box>
                  ))}
                </>
              ) : (
                <Box sx={{ py: 3 }}>
                  <EmptyState size={38} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Table */}
      <Card sx={{ ...cardSx, ...enter(540), overflow: "hidden" }}>
        <Box sx={{ borderBottom: "1px solid #edf0f2" }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{ px: 2, minHeight: 44 }}
            TabIndicatorProps={{ sx: { height: 3, borderRadius: 3, background: "linear-gradient(90deg,#ec4899,#a855f7)" } }}
          >
            {["Follow-ups", "Admission Report"].map((label) => (
              <Tab
                key={label}
                label={label}
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: 13, minHeight: 44, transition: "color .25s ease",
                  "&.Mui-selected": { color: "#db2777" },
                  "&:hover": { color: "#ec4899" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CardContent sx={{ p: 2 }}>
          {/* Filters */}
          {activeTab === 0 ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <Button
                variant={ownerFilter === "mine" ? "contained" : "outlined"}
                size="small"
                onClick={() => {
                  setOwnerFilter("mine");
                  dispatch(fetchSchoolDashboard("follow-up"));
                }}
                sx={{
                  textTransform: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                  minWidth: 135,
                  bgcolor: ownerFilter === "mine" ? "#ec4899" : "#fff",
                  color: ownerFilter === "mine" ? "#fff" : "#64748b",
                  borderColor: ownerFilter === "mine" ? "#ec4899" : "#e2e8f0",
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: ownerFilter === "mine" ? "#db2777" : "#fdf2f8",
                    borderColor: "#ec4899",
                  },
                }}
              >
                My Follow-ups
              </Button>
              <Button
                variant={ownerFilter === "all" && typeFilter === "all" && !dateFrom && !dateTo ? "contained" : "outlined"}
                size="small"
                onClick={() => {
                  setOwnerFilter("all");
                  setTypeFilter("all");
                  setDateFrom("");
                  setDateTo("");
                  setSearch("");
                  dispatch(fetchSchoolDashboard("follow-up"));
                }}
                sx={{
                  textTransform: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                  minWidth: 80,
                  bgcolor: ownerFilter === "all" && typeFilter === "all" && !dateFrom && !dateTo ? "#6366f1" : "#fff",
                  color: ownerFilter === "all" && typeFilter === "all" && !dateFrom && !dateTo ? "#fff" : "#64748b",
                  borderColor: ownerFilter === "all" && typeFilter === "all" && !dateFrom && !dateTo ? "#6366f1" : "#e2e8f0",
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: ownerFilter === "all" && typeFilter === "all" && !dateFrom && !dateTo ? "#4f46e5" : "#eef2ff",
                    borderColor: "#6366f1",
                  },
                }}
              >
                All
              </Button>
              <Select
                size="small"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                displayEmpty
                sx={{ minWidth: 140, fontSize: 12.5, ...fieldSx }}
              >
                <MenuItem value="all" sx={{ fontSize: 12.5 }}>
                  Types
                </MenuItem>
                {typeOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: 12.5 }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                size="small"
                type="date"
                label="From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140, ...fieldSx }}
              />
              <TextField
                size="small"
                type="date"
                label="To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140, ...fieldSx }}
              />
            </Stack>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                placeholder="Search by name or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#ec4899" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 200, ...fieldSx }}
              />
              <Select size="small" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} displayEmpty sx={{ minWidth: 120, fontSize: 12.5, ...fieldSx }}>
                <MenuItem value="all" sx={{ fontSize: 12.5 }}>Class</MenuItem>
                {classOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: 12.5 }}>{option}</MenuItem>
                ))}
              </Select>
              <Select size="small" value={prmFilter} onChange={(e) => setPrmFilter(e.target.value)} displayEmpty sx={{ minWidth: 120, fontSize: 12.5, ...fieldSx }}>
                <MenuItem value="all" sx={{ fontSize: 12.5 }}>PRM</MenuItem>
                {prmOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: 12.5 }}>{option}</MenuItem>
                ))}
              </Select>
              <TextField size="small" type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, ...fieldSx }} />
              <TextField size="small" type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, ...fieldSx }} />
            </Stack>
          )}

          {/* Table (key = tab, so it fades in smoothly on switch) */}
          <Box key={activeTab} sx={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #f1f5f9", ...enter(0) }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={headSx}>
                  {(activeTab === 0
                    ? ["Student", "Type", "Message", "Follow-up Date", "By", "Created"]
                    : ["Name", "Father", "Class", "PRM", "Date", "Status"]
                  ).map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {activeTab === 0 && records.length > 0 ? (
                  records.map((record, index) => {
                    const tone = dueTone(record.followUpDate);
                    const name = record.studentName || record.name || "-";
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          animation: `${rowIn} .35s ${EASE} ${Math.min(index, 12) * 30}ms backwards`,
                          transition: "background .25s ease",
                          "& td": { fontSize: 12, borderBottom: "1px solid #f1f5f9" },
                          "&:hover": { bgcolor: "#fdf7fb" },
                          ...NO_MOTION,
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Initial text={name} g={GRADS[index % GRADS.length]} />
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Pill label={record.type} color={record.type === "Call" ? "#3b82f6" : "#ec4899"} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#475569" }} title={record.message || record.callType || ""}>
                          {record.message || record.callType || "-"}
                        </TableCell>
                        <TableCell>{tone ? <Pill label={formatDate(record.followUpDate)} color={tone} /> : "-"}</TableCell>
                        <TableCell sx={{ color: "#7c3aed", fontWeight: 500 }}>{record.assignedTo || "-"}</TableCell>
                        <TableCell sx={{ color: "#94a3b8" }}>{formatDate(record.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 7, borderBottom: "none" }}>
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}