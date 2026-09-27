import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LoopIcon from "@mui/icons-material/Loop";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { fetchSchoolDashboard } from "../../../state/schoolDashboardsSlice";

/* ---------- Animations & tokens ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const growY = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;
const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(59,130,246,.55); }
  70%  { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
  100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
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
  ["#6366f1", "#334155"],
  ["#a78bfa", "#7c3aed"],
  ["#fb923c", "#ea580c"],
  ["#34d399", "#059669"],
  ["#38bdf8", "#2563eb"],
  ["#fb7185", "#e11d48"],
];
const BAR_GRADS = [
  ["#818cf8", "#4f46e5"],
  ["#f472b6", "#db2777"],
  ["#34d399", "#059669"],
  ["#fbbf24", "#f59e0b"],
  ["#38bdf8", "#0284c7"],
  ["#a78bfa", "#7c3aed"],
  ["#fb7185", "#e11d48"],
];
const TYPE_COLORS = {
  Parent: "#ec4899",
  Vendor: "#f59e0b",
  Guest: "#3b82f6",
  "Interview Candidate": "#8b5cf6",
  Staff: "#14b8a6",
  Other: "#64748b",
};
const ACCENTS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6"];
const pick = (str, list) => list[[...String(str ?? "")].reduce((a, c) => a + c.charCodeAt(0), 0) % list.length];

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
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(99,102,241,.15)" },
    "&.Mui-focused fieldset": { borderColor: "#6366f1" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
};

const headSx = {
  "& th": {
    background: "linear-gradient(90deg,#eef2ff,#fdf2f8,#ecfeff)",
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
        // "background" (not "bgcolor") so the gradient actually renders
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

function StatusPill({ status }) {
  if (!status) return "-";
  const isIn = status === "In";
  const c = isIn ? "#2563eb" : "#059669";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.7,
        px: 1,
        py: 0.25,
        borderRadius: "999px",
        bgcolor: isIn ? "#3b82f61A" : "#10b9811F",
        color: c,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: c, ...(isIn ? { animation: `${pulse} 1.8s infinite`, ...NO_MOTION } : {}) }} />
      {status}
    </Box>
  );
}

function Initial({ text, color, size = 26 }) {
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
        background: `linear-gradient(135deg,${color},${color}bb)`,
      }}
    >
      {String(text || "?").charAt(0).toUpperCase()}
    </Box>
  );
}

function SectionTitle({ icon: Icon, color, children }) {
  return (
    <Stack direction="row" alignItems="center" gap={1.25}>
      <Box sx={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: "9px", bgcolor: `${color}22`, color }}>
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#17233b" }}>{children}</Typography>
    </Stack>
  );
}

export default function VisitorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.schoolDashboards["visitor"]);
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    dispatch(fetchSchoolDashboard("visitor"));
  }, [dispatch]);

  const dashboard = data || {};
  const visitors = dashboard.visitors || [];
  const dailyVisitors = dashboard.dailyVisitors || [];

  const stats = [
    { key: "total", label: "Total visitors", value: dashboard.total || 0, icon: PeopleOutlineIcon, g: GRADS[0] },
    { key: "todaysVisitors", label: "Today's visitors", value: dashboard.todaysVisitors || 0, icon: CalendarMonthIcon, g: GRADS[1] },
    { key: "currentlyInside", label: "Currently inside", value: dashboard.currentlyInside || 0, icon: LoopIcon, g: GRADS[2] },
    { key: "checkedOutToday", label: "Checked out today", value: dashboard.checkedOutToday || 0, icon: CheckCircleOutlineIcon, g: GRADS[3] },
    { key: "thisWeek", label: "This week", value: dashboard.thisWeek || 0, icon: TrendingUpIcon, g: GRADS[4] },
    { key: "thisMonth", label: "This month", value: dashboard.thisMonth || 0, icon: CalendarMonthIcon, g: GRADS[5] },
  ];

  const visitorTypes = ["Parent", "Vendor", "Guest", "Interview Candidate", "Staff", "Other"];

  const filteredVisitors = visitors.filter((visitor) => {
    if (visitorTypeFilter !== "all" && visitor.visitorType !== visitorTypeFilter) return false;
    if (dateFrom && new Date(visitor.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(visitor.date) > new Date(dateTo)) return false;
    return true;
  });

  const maxCount = Math.max(...dailyVisitors.map((d) => d.count), 1);

  if (loading && !data) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        background:
          "radial-gradient(900px 420px at 0% 0%, rgba(99,102,241,.10), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(236,72,153,.08), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(14,165,233,.08), transparent 60%), #f8fafc",
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
          background: "linear-gradient(120deg,#334155 0%,#4f46e5 40%,#a855f7 75%,#ec4899 100%)",
          backgroundSize: "200% 200%",
          animation: `${fadeUp} .5s ${EASE} backwards, ${shift} 12s ease infinite`,
          boxShadow: "0 12px 28px rgba(79,70,229,.30)",
          ...NO_MOTION,
        }}
      >
        <Box sx={{ position: "absolute", top: -40, right: 160, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(255,255,255,.12)" }} />
        <Box sx={{ position: "absolute", bottom: -50, right: -20, width: 130, height: 130, borderRadius: "50%", bgcolor: "rgba(255,255,255,.10)" }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap" sx={{ position: "relative" }}>
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
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 22 }, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleOutlineIcon sx={{ fontSize: 26 }} />
              Visitor Dashboard
            </Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12, opacity: 0.92 }}>Track visitor check-ins, purposes, and footfall trends</Typography>
          </Box>
          <Stack direction="row" gap={1.25}>
            <Button
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16, transition: `transform .5s ${EASE}` }} />}
              onClick={() => dispatch(fetchSchoolDashboard("visitor"))}
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
              onClick={() => navigate("/school/front-office/visitor-book")}
              sx={{
                bgcolor: "#fff", color: "#4f46e5", textTransform: "none", fontWeight: 700, fontSize: 12, borderRadius: "10px",
                boxShadow: "0 6px 16px rgba(0,0,0,.15)", transition: `all .25s ${EASE}`,
                "&:hover": { bgcolor: "#eef2ff", transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(0,0,0,.2)" },
              }}
            >
              All Visitors
            </Button>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Box sx={{ mb: 2, px: 2, py: 1, borderRadius: "12px", bgcolor: "#ef44441A", color: "#dc2626", fontSize: 12.5, fontWeight: 500 }}>
          {error}
        </Box>
      )}

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(({ key, ...rest }, i) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <StatCard {...rest} delay={60 + i * 60} />
          </Grid>
        ))}
      </Grid>

      {/* Last 7 Days Chart */}
      <Card sx={{ ...cardSx, ...enter(420), mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box mb={2}>
            <SectionTitle icon={ShowChartIcon} color="#6366f1">Last 7 Days</SectionTitle>
          </Box>
          {dailyVisitors.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                gap: { xs: 1, md: 2 },
                height: 150,
                px: 1,
                borderBottom: "1px solid #e2e8f0",
                backgroundImage: "linear-gradient(#f1f5f9 1px, transparent 1px)",
                backgroundSize: "100% 30px",
              }}
            >
              {dailyVisitors.map((point, index) => {
                const [a, b] = BAR_GRADS[index % BAR_GRADS.length];
                return (
                  <Box key={index} sx={{ textAlign: "center", flex: 1, maxWidth: 70 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: b, mb: 0.5 }}>{point.count}</Typography>
                    <Box
                      sx={{
                        height: Math.max((point.count / maxCount) * 100, 4),
                        background: `linear-gradient(180deg,${a},${b})`,
                        borderRadius: "8px 8px 2px 2px",
                        transformOrigin: "bottom",
                        animation: `${growY} .9s ${EASE} ${500 + index * 80}ms backwards`,
                        transition: "filter .25s ease, box-shadow .25s ease",
                        "&:hover": { filter: "brightness(1.1) saturate(1.1)", boxShadow: `0 8px 16px ${b}55` },
                        ...NO_MOTION,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <SearchOffIcon sx={{ fontSize: 40, color: "#cbd5e1", animation: `${floaty} 3s ease-in-out infinite`, ...NO_MOTION }} />
              <Typography sx={{ color: "#94a3b8", fontSize: 12.5, mt: 1 }}>No data available</Typography>
            </Box>
          )}
          {dailyVisitors.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-around", gap: { xs: 1, md: 2 }, px: 1, mt: 0.75 }}>
              {dailyVisitors.map((point, index) => (
                <Typography key={index} sx={{ flex: 1, maxWidth: 70, textAlign: "center", fontSize: 10.5, color: "#64748b" }}>
                  {String(point._id || "").slice(5)}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recent Visitors */}
      <Card sx={{ ...cardSx, ...enter(480), overflow: "hidden" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box mb={2}>
            <SectionTitle icon={PeopleOutlineIcon} color="#ec4899">Recent Visitors</SectionTitle>
          </Box>

          {/* Filters */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Select size="small" value={visitorTypeFilter} onChange={(e) => setVisitorTypeFilter(e.target.value)} displayEmpty sx={{ minWidth: 160, fontSize: 12.5, ...fieldSx }}>
              <MenuItem value="all" sx={{ fontSize: 12.5 }}>Visitor Type</MenuItem>
              {visitorTypes.map((type) => (
                <MenuItem key={type} value={type} sx={{ fontSize: 12.5, color: TYPE_COLORS[type] }}>{type}</MenuItem>
              ))}
            </Select>
            <TextField size="small" type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, ...fieldSx }} />
            <TextField size="small" type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, ...fieldSx }} />
          </Stack>

          {/* Visitors Table */}
          <Box sx={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={headSx}>
                  {["Visitor", "Type", "Purpose", "Meeting With", "Date", "Check In / Out"].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisitors.length > 0 ? (
                  filteredVisitors.map((visitor, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        animation: `${rowIn} .35s ${EASE} ${Math.min(index, 12) * 30}ms backwards`,
                        transition: "background .25s ease",
                        "& td": { fontSize: 12, borderBottom: "1px solid #f1f5f9" },
                        "&:hover": { bgcolor: "#f7f8ff" },
                        ...NO_MOTION,
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Initial text={visitor.visitorName} color={pick(visitor.visitorName, ACCENTS)} />
                          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{visitor.visitorName || "-"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {visitor.visitorType ? <Pill label={visitor.visitorType} color={TYPE_COLORS[visitor.visitorType] || "#64748b"} /> : "-"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#475569" }} title={visitor.purpose}>
                        {visitor.purpose || "-"}
                      </TableCell>
                      <TableCell sx={{ color: "#7c3aed", fontWeight: 500 }}>{visitor.meetingWith || "-"}</TableCell>
                      <TableCell sx={{ color: "#64748b", whiteSpace: "nowrap" }}>{formatDate(visitor.date)}</TableCell>
                      <TableCell>
                        <StatusPill status={visitor.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 7, borderBottom: "none" }}>
                      <SearchOffIcon sx={{ fontSize: 44, color: "#cbd5e1", animation: `${floaty} 3s ease-in-out infinite`, ...NO_MOTION }} />
                      <Typography sx={{ color: "#94a3b8", fontSize: 12.5, mt: 1 }}>No visitors found</Typography>
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