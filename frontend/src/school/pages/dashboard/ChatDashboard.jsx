import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarIcon from "@mui/icons-material/Star";
import ReplayIcon from "@mui/icons-material/Replay";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { fetchSchoolDashboard } from "../../../state/schoolDashboardsSlice";

/* ---------- Animations ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(.85); }
  to   { opacity: 1; transform: scale(1); }
`;
const floatA = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(22px, -16px) scale(1.1); }
`;
const floatB = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-20px, 14px) scale(1.06); }
`;
const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;
const dotPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.6); opacity: .45; }
`;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const NO_MOTION = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };
const enter = (ms = 0) => ({ animation: `${fadeUp} .55s ${EASE} ${ms}ms backwards`, ...NO_MOTION });

/* ---------- Colors ---------- */
const STATUS = {
  Open: { color: "#d97706", bg: "#fef3c7" },
  "In Progress": { color: "#2563eb", bg: "#dbeafe" },
  Resolved: { color: "#059669", bg: "#d1fae5" },
  Closed: { color: "#7c3aed", bg: "#ede9fe" },
};
const STATUS_FALLBACK = { color: "#e11d48", bg: "#ffe4e6" };
const statusStyle = (s) => STATUS[s] || STATUS_FALLBACK;

const AVATAR_GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#ec4899", "#f43f5e"],
  ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#14b8a6"],
  ["#f59e0b", "#f97316"],
  ["#8b5cf6", "#d946ef"],
];
const CATEGORY_TINTS = [
  { bg: "#eef2ff", color: "#4f46e5" },
  { bg: "#fdf2f8", color: "#db2777" },
  { bg: "#ecfeff", color: "#0891b2" },
  { bg: "#ecfdf5", color: "#059669" },
  { bg: "#fff7ed", color: "#ea580c" },
  { bg: "#f5f3ff", color: "#7c3aed" },
];
const hashOf = (s = "") => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0);
const initialsOf = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w[0] || "").toUpperCase())
    .join("") || "?";

/* ---------- Formatters ---------- */
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

/* ---------- Count-up hook ---------- */
function useCountUp(target, duration = 900, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVal(target);
      return undefined;
    }
    let raf;
    let start;
    const step = (ts) => {
      if (start === undefined) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return decimals ? val.toFixed(decimals) : Math.round(val);
}

/* ---------- Stat card ---------- */
function StatCard({ label, value, decimals = 0, icon, from, to, delay = 0, loading }) {
  const shown = useCountUp(Number(value) || 0, 900, decimals);
  return (
    <Card
      sx={{
        ...enter(delay),
        position: "relative",
        overflow: "hidden",
        borderRadius: "14px",
        border: "1px solid rgba(148,163,184,.16)",
        boxShadow: `0 4px 14px ${from}14`,
        background: `linear-gradient(135deg, #ffffff 55%, ${from}12 100%)`,
        transition: `transform .35s ${EASE}, box-shadow .35s ${EASE}`,
        "&:hover": { transform: "translateY(-3px)", boxShadow: `0 14px 26px ${from}30` },
      }}
    >
      <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3.5, background: `linear-gradient(180deg, ${from}, ${to})` }} />
      <CardContent sx={{ p: 1.75, pl: 2.25, "&:last-child": { pb: 1.75 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>{label}</Typography>
            {loading ? (
              <Skeleton width={44} height={30} animation="wave" />
            ) : (
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {shown}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: "11px",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: `linear-gradient(135deg, ${from}, ${to})`,
              boxShadow: `0 6px 14px ${from}55`,
              transition: `transform .4s ${EASE}`,
              ".MuiCard-root:hover &": { transform: "rotate(-8deg) scale(1.1)" },
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ChatDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.schoolDashboards["chat"]) || {};
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    dispatch(fetchSchoolDashboard("chat"));
  }, [dispatch]);

  const tickets = useMemo(() => (data && data.tickets) || [], [data]);
  const isInitialLoading = Boolean(loading && !data);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (statusFilter !== "All" && ticket.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(ticket.ticketNumber || "").toLowerCase().includes(q) ||
        String(ticket.subject || "").toLowerCase().includes(q) ||
        String(ticket.category || "").toLowerCase().includes(q) ||
        String(ticket.student || "").toLowerCase().includes(q)
      );
    });
  }, [tickets, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    tickets.forEach((t) => {
      if (t.status) counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tickets]);

  const statusList = useMemo(() => ["All", ...Object.keys(statusCounts)], [statusCounts]);

  const stats = useMemo(() => {
    const rated = tickets.filter((t) => Number(t.rating) > 0);
    const avg = rated.length ? rated.reduce((sum, t) => sum + Number(t.rating), 0) / rated.length : 0;
    return {
      total: tickets.length,
      open: statusCounts["Open"] || 0,
      inProgress: statusCounts["In Progress"] || 0,
      resolved: statusCounts["Resolved"] || 0,
      avgRating: avg,
      reopened: tickets.filter((t) => t.reopened).length,
    };
  }, [tickets, statusCounts]);

  const hasActiveFilter = Boolean(search) || statusFilter !== "All";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const glassBtn = {
    color: "#fff",
    textTransform: "none",
    fontSize: 11.5,
    fontWeight: 600,
    borderRadius: "10px",
    px: 1.5,
    bgcolor: "rgba(255,255,255,.16)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,.28)",
    transition: `all .3s ${EASE}`,
    "&:hover": { bgcolor: "rgba(255,255,255,.28)", transform: "translateY(-1px)" },
    "&.Mui-disabled": { color: "rgba(255,255,255,.7)" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, md: 3 },
        fontSize: 12,
        background:
          "radial-gradient(900px 500px at 0% 0%, #ede9fe 0%, transparent 60%), radial-gradient(800px 500px at 100% 10%, #cffafe 0%, transparent 55%), radial-gradient(900px 600px at 50% 100%, #fce7f3 0%, transparent 60%), #f8fafc",
      }}
    >
      {/* ---------- Header ---------- */}
      <Card
        sx={{
          ...enter(0),
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          borderRadius: "18px",
          border: "none",
          background: "linear-gradient(120deg, #4f46e5 0%, #7c3aed 40%, #db2777 75%, #f97316 100%)",
          backgroundSize: "220% 220%",
          animation: `${gradientShift} 14s ease-in-out infinite, ${fadeUp} .55s ${EASE} backwards`,
          boxShadow: "0 16px 36px rgba(99,102,241,.28)",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            top: -90,
            right: -40,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,.35), transparent 70%)",
            animation: `${floatA} 9s ease-in-out infinite`,
            pointerEvents: "none",
            ...NO_MOTION,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            bottom: -90,
            left: "35%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,.4), transparent 70%)",
            animation: `${floatB} 11s ease-in-out infinite`,
            pointerEvents: "none",
            ...NO_MOTION,
          }}
        />
        <CardContent sx={{ position: "relative", p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
            <Box>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 14, transition: `transform .3s ${EASE}` }} />}
                onClick={() => navigate("/school")}
                sx={{ ...glassBtn, mb: 1.25, py: 0.3, fontSize: 11, "&:hover .MuiSvgIcon-root": { transform: "translateX(-3px)" } }}
              >
                Back to dashboard
              </Button>
              <Stack direction="row" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,.2)",
                    border: "1px solid rgba(255,255,255,.3)",
                    animation: `${popIn} .6s ${EASE} 150ms backwards`,
                    ...NO_MOTION,
                  }}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 17, md: 20 }, lineHeight: 1.2 }}>Chat analytics dashboard</Typography>
                  <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "rgba(255,255,255,.85)" }}>
                    Monitor chat activity, staff performance, and student interactions
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Button
              size="small"
              disabled={loading}
              startIcon={<RefreshIcon sx={{ fontSize: 16, animation: loading ? `${spin} .9s linear infinite` : "none" }} />}
              onClick={() => dispatch(fetchSchoolDashboard("chat"))}
              sx={{
                ...glassBtn,
                bgcolor: "#fff",
                color: "#4f46e5",
                fontWeight: 700,
                py: 0.6,
                border: "none",
                boxShadow: "0 6px 16px rgba(15,23,42,.18)",
                "&:hover": { bgcolor: "#f5f3ff", transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(15,23,42,.24)" },
                "&.Mui-disabled": { bgcolor: "rgba(255,255,255,.85)", color: "#818cf8" },
              }}
            >
              {loading ? "Refreshing" : "Refresh"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1,
            borderRadius: "12px",
            bgcolor: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecdd3",
            fontSize: 12,
            fontWeight: 500,
            animation: `${fadeUp} .4s ${EASE}`,
            ...NO_MOTION,
          }}
        >
          {error}
        </Box>
      )}

      {/* ---------- Stat cards ---------- */}
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          mb: 2.5,
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
        }}
      >
        <StatCard label="Total chats" value={stats.total} icon={<ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />} from="#6366f1" to="#8b5cf6" delay={80} loading={isInitialLoading} />
        <StatCard label="Open" value={stats.open} icon={<ErrorOutlineIcon sx={{ fontSize: 18 }} />} from="#f59e0b" to="#f97316" delay={130} loading={isInitialLoading} />
        <StatCard label="In progress" value={stats.inProgress} icon={<HourglassEmptyIcon sx={{ fontSize: 18 }} />} from="#0ea5e9" to="#2563eb" delay={180} loading={isInitialLoading} />
        <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />} from="#10b981" to="#14b8a6" delay={230} loading={isInitialLoading} />
        <StatCard label="Avg. rating" value={stats.avgRating} decimals={1} icon={<StarIcon sx={{ fontSize: 18 }} />} from="#ec4899" to="#f43f5e" delay={280} loading={isInitialLoading} />
        <StatCard label="Reopened" value={stats.reopened} icon={<ReplayIcon sx={{ fontSize: 18 }} />} from="#8b5cf6" to="#d946ef" delay={330} loading={isInitialLoading} />
      </Box>

      {/* ---------- Recent chats ---------- */}
      <Card
        sx={{
          ...enter(380),
          overflow: "hidden",
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,.18)",
          boxShadow: "0 10px 30px rgba(79,70,229,.08)",
          bgcolor: "rgba(255,255,255,.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
          {/* Toolbar */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5} flexWrap="wrap" mb={1.5}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  boxShadow: "0 4px 10px rgba(99,102,241,.35)",
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#17233b" }}>Recent chats</Typography>
              <Box
                key={filteredTickets.length}
                sx={{
                  px: 1,
                  py: 0.15,
                  borderRadius: "20px",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#4f46e5",
                  bgcolor: "#eef2ff",
                  animation: `${popIn} .35s ${EASE}`,
                  ...NO_MOTION,
                }}
              >
                {filteredTickets.length}
                {hasActiveFilter ? ` of ${tickets.length}` : ""}
              </Box>
            </Stack>

            <TextField
              size="small"
              placeholder="Search student, ticket, or subject"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: "#6366f1" }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={() => setSearch("")} sx={{ p: 0.25 }}>
                      <CloseIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                width: "100%",
                maxWidth: 300,
                transition: `max-width .45s ${EASE}`,
                "&:focus-within": { maxWidth: 420 },
                "& .MuiInputBase-input": { fontSize: 12 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "#f8fafc",
                  transition: "background .3s ease, box-shadow .3s ease",
                  "& fieldset": { borderColor: "#e2e8f0", transition: "border-color .3s ease" },
                  "&:hover fieldset": { borderColor: "#a5b4fc" },
                  "&.Mui-focused": { bgcolor: "#fff", boxShadow: "0 0 0 3px rgba(99,102,241,.16)" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 1 },
                },
              }}
            />
          </Stack>

          {/* Status filter chips */}
          <Stack direction="row" gap={0.75} flexWrap="wrap" mb={1.75}>
            {statusList.map((s) => {
              const active = statusFilter === s;
              const tone = s === "All" ? { color: "#4f46e5", bg: "#eef2ff" } : statusStyle(s);
              const count = s === "All" ? tickets.length : statusCounts[s];
              return (
                <Box
                  key={s}
                  component="button"
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.25,
                    py: 0.45,
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    borderRadius: "20px",
                    border: `1px solid ${active ? tone.color : "transparent"}`,
                    color: active ? "#fff" : tone.color,
                    bgcolor: active ? tone.color : tone.bg,
                    boxShadow: active ? `0 6px 14px ${tone.color}55` : "none",
                    transition: `all .3s ${EASE}`,
                    "&:hover": { transform: "translateY(-1px)", boxShadow: `0 6px 14px ${tone.color}40` },
                    "&:active": { transform: "scale(.96)" },
                    "&:focus-visible": { outline: `2px solid ${tone.color}`, outlineOffset: 2 },
                  }}
                >
                  {s}
                  <Box
                    component="span"
                    sx={{
                      px: 0.7,
                      borderRadius: "10px",
                      fontSize: 10,
                      lineHeight: "16px",
                      bgcolor: active ? "rgba(255,255,255,.28)" : "rgba(255,255,255,.75)",
                      transition: "background .3s ease",
                    }}
                  >
                    {count}
                  </Box>
                </Box>
              );
            })}
          </Stack>

          {/* Table */}
          <Box
            sx={{
              overflow: "auto",
              maxHeight: 560,
              borderRadius: "12px",
              border: "1px solid #eef2f7",
              "&::-webkit-scrollbar": { height: 8, width: 8 },
              "&::-webkit-scrollbar-thumb": { background: "linear-gradient(135deg,#a5b4fc,#f9a8d4)", borderRadius: 8 },
              "&::-webkit-scrollbar-track": { background: "#f8fafc" },
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      background: "linear-gradient(180deg, #f5f3ff, #eef2ff)",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#4338ca",
                      borderBottom: "2px solid #c7d2fe",
                      whiteSpace: "nowrap",
                      py: 1,
                    },
                  }}
                >
                  <TableCell>Ticket</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Assigned to</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>TAT</TableCell>
                  <TableCell>Reopened</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody key={statusFilter}>
                {isInitialLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell colSpan={13} sx={{ py: 1 }}>
                        <Skeleton variant="rounded" height={22} animation="wave" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!isInitialLoading &&
                  filteredTickets.map((ticket, index) => {
                    const st = statusStyle(ticket.status);
                    const [g1, g2] = AVATAR_GRADIENTS[hashOf(ticket.student) % AVATAR_GRADIENTS.length];
                    const cat = CATEGORY_TINTS[hashOf(ticket.category) % CATEGORY_TINTS.length];
                    return (
                      <TableRow
                        key={ticket.id || `${ticket.ticketNumber}-${index}`}
                        sx={{
                          animation: `${rowIn} .45s ${EASE} ${Math.min(index * 35, 450)}ms backwards`,
                          ...NO_MOTION,
                          transition: "background .25s ease",
                          "& td": { fontSize: 11.5, color: "#475569", borderBottom: "1px solid #f1f5f9", py: 0.9 },
                          "&:hover": { background: "linear-gradient(90deg, #eef2ff, #fdf4ff 60%, #fff)" },
                          "& td:first-of-type": { boxShadow: "inset 3px 0 0 transparent", transition: "box-shadow .25s ease" },
                          "&:hover td:first-of-type": { boxShadow: "inset 3px 0 0 #6366f1" },
                          "&:last-child td": { borderBottom: 0 },
                        }}
                      >
                        <TableCell>
                          <Box
                            component="span"
                            sx={{ px: 0.9, py: 0.25, borderRadius: "6px", fontSize: 11, fontWeight: 700, color: "#4f46e5", bgcolor: "#eef2ff", whiteSpace: "nowrap" }}
                          >
                            {ticket.ticketNumber || "-"}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1e293b !important", fontWeight: 500 }} title={ticket.subject}>
                          {ticket.subject || "-"}
                        </TableCell>

                        <TableCell>
                          {ticket.category ? (
                            <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: "20px", fontSize: 10.5, fontWeight: 600, color: cat.color, bgcolor: cat.bg, whiteSpace: "nowrap" }}>
                              {ticket.category}
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                flexShrink: 0,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: "#fff",
                                background: `linear-gradient(135deg, ${g1}, ${g2})`,
                                boxShadow: `0 3px 8px ${g1}55`,
                              }}
                            >
                              {initialsOf(ticket.student)}
                            </Box>
                            <Box component="span" sx={{ fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>
                              {ticket.student || "-"}
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>{ticket.grade || "-"}</TableCell>

                        <TableCell>
                          {ticket.section ? (
                            <Box component="span" sx={{ px: 0.8, py: 0.2, borderRadius: "6px", fontSize: 10.5, fontWeight: 600, bgcolor: "#f1f5f9", color: "#475569" }}>
                              {ticket.section}
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell sx={{ whiteSpace: "nowrap" }}>{ticket.assignedTo || "-"}</TableCell>

                        <TableCell>
                          {ticket.status ? (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.6,
                                px: 1,
                                py: 0.3,
                                borderRadius: "20px",
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: st.color,
                                bgcolor: st.bg,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: st.color,
                                  animation: ticket.status === "Open" || ticket.status === "In Progress" ? `${dotPulse} 1.8s ease-in-out infinite` : "none",
                                  ...NO_MOTION,
                                }}
                              />
                              {ticket.status}
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          {ticket.rating ? (
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.9, py: 0.25, borderRadius: "20px", fontSize: 10.5, fontWeight: 700, color: "#b45309", bgcolor: "#fffbeb" }}>
                              <StarIcon sx={{ fontSize: 12, color: "#f59e0b" }} />
                              {ticket.rating}
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          {ticket.tat ? (
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.9, py: 0.25, borderRadius: "20px", fontSize: 10.5, fontWeight: 600, color: "#0e7490", bgcolor: "#ecfeff", whiteSpace: "nowrap" }}>
                              <AccessTimeIcon sx={{ fontSize: 12 }} />
                              {ticket.tat}
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          {ticket.reopened ? (
                            <Box component="span" sx={{ px: 0.9, py: 0.25, borderRadius: "20px", fontSize: 10.5, fontWeight: 700, color: "#be123c", bgcolor: "#fff1f2" }}>
                              Yes
                            </Box>
                          ) : (
                            <Box component="span" sx={{ color: "#94a3b8" }}>
                              No
                            </Box>
                          )}
                        </TableCell>

                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(ticket.createdAt)}
                          <br />
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>{formatTime(ticket.createdAt)}</span>
                        </TableCell>

                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 13 }} />}
                            sx={{
                              minWidth: 0,
                              px: 1.25,
                              py: 0.3,
                              fontSize: 10.5,
                              fontWeight: 700,
                              textTransform: "none",
                              color: "#fff",
                              borderRadius: "8px",
                              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              boxShadow: "0 4px 10px rgba(99,102,241,.3)",
                              transition: `all .3s ${EASE}`,
                              "& .MuiButton-startIcon": { mr: 0.5, ml: 0 },
                              "&:hover": {
                                background: "linear-gradient(135deg, #4f46e5, #db2777)",
                                transform: "translateY(-1px)",
                                boxShadow: "0 8px 16px rgba(124,58,237,.38)",
                              },
                              "&:active": { transform: "scale(.96)" },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {!isInitialLoading && filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 7, borderBottom: 0 }}>
                      <Box sx={{ animation: `${popIn} .5s ${EASE}`, ...NO_MOTION }}>
                        <Box
                          sx={{
                            mx: "auto",
                            mb: 1.5,
                            width: 56,
                            height: 56,
                            borderRadius: "18px",
                            display: "grid",
                            placeItems: "center",
                            color: "#6366f1",
                            background: "linear-gradient(135deg, #eef2ff, #fce7f3)",
                          }}
                        >
                          <InboxOutlinedIcon sx={{ fontSize: 28 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>No chats found</Typography>
                        <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "#94a3b8" }}>
                          {hasActiveFilter ? "Try a different search or status." : "New chats will show up here."}
                        </Typography>
                        {hasActiveFilter && (
                          <Button
                            size="small"
                            onClick={clearFilters}
                            sx={{ mt: 1.5, textTransform: "none", fontSize: 11.5, fontWeight: 700, color: "#4f46e5", borderRadius: "10px", bgcolor: "#eef2ff", px: 1.5, "&:hover": { bgcolor: "#e0e7ff" } }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </Box>
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