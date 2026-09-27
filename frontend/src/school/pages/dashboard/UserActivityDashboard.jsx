import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
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
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
const growY = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;
const growX = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
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

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const NO_MOTION = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };
const enter = (ms = 0) => ({ animation: `${fadeUp} .55s ${EASE} ${ms}ms backwards`, ...NO_MOTION });

/* ---------- Config ---------- */
const ranges = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

// [key, label, Icon, gradientFrom, gradientTo]
const cards = [
  ["totalUsers", "Total users", PeopleOutlineIcon, "#6366f1", "#8b5cf6"],
  ["active", "Active", CheckCircleOutlineIcon, "#10b981", "#65a30d"],
  ["inactive", "Inactive", WarningAmberIcon, "#f43f5e", "#ef4444"],
  ["activeToday", "Active today", ShowChartIcon, "#0ea5e9", "#2563eb"],
  ["neverLoggedIn", "Never logged in", WarningAmberIcon, "#f97316", "#f59e0b"],
];

const BAR_GRADIENTS = [
  ["#6366f1", "#a78bfa"],
  ["#0ea5e9", "#67e8f9"],
  ["#10b981", "#6ee7b7"],
  ["#f59e0b", "#fcd34d"],
  ["#ec4899", "#f9a8d4"],
  ["#8b5cf6", "#d8b4fe"],
];
const AVATAR_GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#ec4899", "#f43f5e"],
  ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#14b8a6"],
  ["#f59e0b", "#f97316"],
  ["#8b5cf6", "#d946ef"],
];
const ROLE_TINTS = [
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
const utilTone = (pct) => (pct >= 70 ? ["#10b981", "#84cc16"] : pct >= 40 ? ["#f59e0b", "#f97316"] : ["#f43f5e", "#ef4444"]);

const date = (value) => (value ? new Date(value).toLocaleDateString() : "-");

/* ---------- Count-up hook ---------- */
function useCountUp(target, duration = 900) {
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
  return Math.round(val);
}

/* ---------- Stat card ---------- */
function StatCard({ label, value, Icon, from, to, delay, loading, footer }) {
  const numeric = Number.isFinite(Number(value)) && value !== null && value !== undefined && value !== "";
  const shown = useCountUp(numeric ? Number(value) : 0);
  return (
    <Card
      sx={{
        ...enter(delay),
        position: "relative",
        overflow: "hidden",
        minHeight: 92,
        borderRadius: "14px",
        border: "1px solid rgba(148,163,184,.16)",
        boxShadow: `0 4px 14px ${from}14`,
        background: `linear-gradient(135deg, #ffffff 55%, ${from}14 100%)`,
        transition: `transform .35s ${EASE}, box-shadow .35s ${EASE}`,
        "&:hover": { transform: "translateY(-3px)", boxShadow: `0 14px 26px ${from}30` },
      }}
    >
      <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3.5, background: `linear-gradient(180deg, ${from}, ${to})` }} />
      <CardContent sx={{ p: 1.75, pl: 2.25, "&:last-child": { pb: 1.75 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
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
                {numeric ? shown : "-"}
              </Typography>
            )}
            {footer}
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              width: 34,
              height: 34,
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
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ---------- Small shared bits ---------- */
const selectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.5,
      borderRadius: "12px",
      boxShadow: "0 12px 30px rgba(15,23,42,.14)",
      "& .MuiMenuItem-root": { fontSize: 12, transition: "background .2s ease" },
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "#eef2ff", color: "#4338ca", fontWeight: 600 },
    },
  },
};

const filterSelectSx = {
  minWidth: 130,
  fontSize: 12,
  borderRadius: "10px",
  bgcolor: "#f8fafc",
  transition: "box-shadow .3s ease, background .3s ease",
  "& fieldset": { borderColor: "#e2e8f0", transition: "border-color .3s ease" },
  "&:hover fieldset": { borderColor: "#a5b4fc" },
  "&.Mui-focused": { bgcolor: "#fff", boxShadow: "0 0 0 3px rgba(99,102,241,.16)" },
  "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 1 },
  "& .MuiSelect-select": { py: 0.9 },
};

const pill = (bg, color, extra = {}) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.6,
  px: 1,
  py: 0.25,
  borderRadius: "20px",
  fontSize: 10.5,
  fontWeight: 700,
  whiteSpace: "nowrap",
  bgcolor: bg,
  color,
  ...extra,
});

export default function UserActivityDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((root) => root.schoolDashboards["user-activity"]);
  const data = state?.data || {};
  const [days, setDays] = useState(7);
  const [tab, setTab] = useState(0);
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const load = () => dispatch(fetchSchoolDashboard({ type: "user-activity", days, page, limit, search, role, status }));
  useEffect(() => {
    load();
  }, [dispatch, days, page, search, role, status]);

  const users = data.users || [];
  const roles = data.roleOptions || [];
  const daily = data.dailyActivity || [];
  const dailyMax = Math.max(...daily.map((item) => item.count), 1);
  const dailyPeak = daily.length ? Math.max(...daily.map((item) => item.count)) : 0;
  const dailyAvg = daily.length ? Math.round(daily.reduce((s, i) => s + (i.count || 0), 0) / daily.length) : 0;
  const dense = daily.length > 31;
  const roleRows = data.roleWiseUtilization || [];

  const isInitialLoading = Boolean(state?.loading && !state.data);
  const isRefreshing = Boolean(state?.loading);
  const utilization = data.totalUsers ? Math.round((data.active / data.totalUsers) * 100) : null;
  const isEmpty = (tab === 0 && !users.length) || (tab === 1 && !roleRows.length);
  const pagination = data.pagination || { page: 1, totalPages: 1, totalRecords: 0 };

  const glassBtn = {
    color: "#fff",
    textTransform: "none",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: "10px",
    px: 1.5,
    py: 0.3,
    bgcolor: "rgba(255,255,255,.16)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,.28)",
    transition: `all .3s ${EASE}`,
    "&:hover": { bgcolor: "rgba(255,255,255,.28)", transform: "translateY(-1px)" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, md: 3 },
        fontSize: 12,
        background:
          "radial-gradient(900px 500px at 100% 0%, #e0f2fe 0%, transparent 60%), radial-gradient(800px 500px at 0% 15%, #ede9fe 0%, transparent 55%), radial-gradient(900px 600px at 50% 100%, #dcfce7 0%, transparent 60%), #f8fafc",
      }}
    >
      {/* ---------- Header ---------- */}
      <Card
        sx={{
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          borderRadius: "18px",
          border: "none",
          background: "linear-gradient(120deg, #0ea5e9 0%, #4f46e5 40%, #9333ea 75%, #ec4899 100%)",
          backgroundSize: "220% 220%",
          animation: `${gradientShift} 14s ease-in-out infinite, ${fadeUp} .55s ${EASE} backwards`,
          boxShadow: "0 16px 36px rgba(79,70,229,.28)",
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
            background: "radial-gradient(circle, rgba(74,222,128,.4), transparent 70%)",
            animation: `${floatB} 11s ease-in-out infinite`,
            pointerEvents: "none",
            ...NO_MOTION,
          }}
        />
        <Box sx={{ position: "relative", px: { xs: 2, md: 2.5 }, py: { xs: 2, md: 2.25 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
            <Box>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 14, transition: `transform .3s ${EASE}` }} />}
                onClick={() => navigate("/school")}
                sx={{ ...glassBtn, mb: 1.25, "&:hover": { ...glassBtn["&:hover"], "& .MuiSvgIcon-root": { transform: "translateX(-3px)" } } }}
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
                  <PeopleOutlineIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 17, md: 20 }, lineHeight: 1.2 }}>User activity dashboard</Typography>
                  <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "rgba(255,255,255,.85)" }}>Monitor user engagement and ERP utilization</Typography>
                </Box>
              </Stack>
            </Box>

            <Stack direction="row" alignItems="center" gap={1}>
              <Select
                size="small"
                value={days}
                onChange={(event) => setDays(event.target.value)}
                MenuProps={selectMenuProps}
                sx={{
                  minWidth: 130,
                  bgcolor: "#fff",
                  color: "#4338ca",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: "10px",
                  boxShadow: "0 6px 16px rgba(15,23,42,.16)",
                  transition: `transform .3s ${EASE}, box-shadow .3s ${EASE}`,
                  "& fieldset": { border: 0 },
                  "& .MuiSelect-select": { py: 0.8 },
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 10px 22px rgba(15,23,42,.22)" },
                }}
              >
                {ranges.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              <IconButton
                onClick={load}
                disabled={isRefreshing}
                aria-label="Refresh"
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,.2)",
                  border: "1px solid rgba(255,255,255,.3)",
                  transition: `all .3s ${EASE}`,
                  "&:hover": { bgcolor: "rgba(255,255,255,.32)", transform: "translateY(-1px)" },
                  "&.Mui-disabled": { color: "rgba(255,255,255,.75)" },
                }}
              >
                <RefreshIcon sx={{ fontSize: 18, animation: isRefreshing ? `${spin} .9s linear infinite` : "none" }} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Card>

      {state?.error && (
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
          {state.error}
        </Box>
      )}

      {/* ---------- Stat cards ---------- */}
      <Box sx={{ display: "grid", gap: 1.5, mb: 2.5, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" } }}>
        {cards.map(([key, label, Icon, from, to], i) => (
          <StatCard
            key={key}
            label={label}
            value={data[key]}
            Icon={Icon}
            from={from}
            to={to}
            delay={80 + i * 50}
            loading={isInitialLoading}
            footer={
              key === "active" && !isInitialLoading ? (
                <Box sx={{ mt: 0.75 }}>
                  <Box sx={{ height: 4, borderRadius: 4, bgcolor: "#e2f5ea", overflow: "hidden" }}>
                    <Box
                      sx={{
                        height: "100%",
                        width: `${utilization || 0}%`,
                        borderRadius: 4,
                        transformOrigin: "left",
                        background: `linear-gradient(90deg, ${from}, ${to})`,
                        animation: `${growX} .9s ${EASE} .5s backwards`,
                        ...NO_MOTION,
                      }}
                    />
                  </Box>
                  <Typography sx={{ mt: 0.4, fontSize: 10, color: "#64748b" }}>{utilization !== null ? `${utilization}% utilization` : "-"}</Typography>
                </Box>
              ) : null
            }
          />
        ))}
      </Box>

      {/* ---------- Daily active users ---------- */}
      <Card
        sx={{
          ...enter(340),
          mb: 2.5,
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,.18)",
          boxShadow: "0 10px 30px rgba(79,70,229,.08)",
          bgcolor: "rgba(255,255,255,.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.75, md: 2 }, "&:last-child": { pb: { xs: 1.75, md: 2 } } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5} flexWrap="wrap">
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  boxShadow: "0 4px 10px rgba(14,165,233,.35)",
                }}
              >
                <BarChartIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: 14, color: "#17233b", fontWeight: 800 }}>Daily active users</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
              {daily.length > 0 && (
                <>
                  <Box component="span" sx={pill("#ecfdf5", "#059669")}>
                    Peak {dailyPeak}
                  </Box>
                  <Box component="span" sx={pill("#eff6ff", "#2563eb")}>
                    Avg {dailyAvg}
                  </Box>
                </>
              )}
              <Box component="span" sx={pill("#f5f3ff", "#7c3aed")}>
                Last {data.days || days} days
              </Box>
            </Stack>
          </Stack>

          <Box
            sx={{
              mt: 1.5,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": { background: "linear-gradient(135deg,#a5b4fc,#f9a8d4)", borderRadius: 6 },
            }}
          >
            {isInitialLoading ? (
              <Skeleton variant="rounded" height={150} animation="wave" />
            ) : daily.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>No activity in this period</Box>
            ) : (
              <Stack
                key={data.days || days}
                direction="row"
                alignItems="flex-end"
                justifyContent={dense ? "flex-start" : "space-around"}
                sx={{
                  height: 160,
                  minWidth: dense ? daily.length * 22 : "auto",
                  backgroundImage: "repeating-linear-gradient(to top, #eef2f7 0, #eef2f7 1px, transparent 1px, transparent 38px)",
                  backgroundPosition: "0 -20px",
                  borderRadius: "8px",
                }}
              >
                {daily.map((item, index) => {
                  const [c1, c2] = BAR_GRADIENTS[index % BAR_GRADIENTS.length];
                  const barH = Math.max((item.count / dailyMax) * 110, 4);
                  const isPeak = item.count === dailyPeak && dailyPeak > 0;
                  return (
                    <Box
                      key={item._id}
                      title={`${item._id}: ${item.count}`}
                      sx={{
                        textAlign: "center",
                        flex: dense ? "0 0 22px" : "0 1 auto",
                        cursor: "default",
                        "&:hover .bar": { filter: "brightness(1.08) saturate(1.2)", transform: "scaleY(1.04)" },
                      }}
                    >
                      <Typography sx={{ fontSize: 10, fontWeight: isPeak ? 800 : 600, color: isPeak ? c1 : "#475569" }}>{item.count}</Typography>
                      <Box
                        className="bar"
                        sx={{
                          mx: "auto",
                          width: dense ? 12 : 28,
                          height: `${barH}px`,
                          borderRadius: "6px 6px 0 0",
                          transformOrigin: "bottom",
                          background: `linear-gradient(180deg, ${c1}, ${c2})`,
                          boxShadow: isPeak ? `0 6px 14px ${c1}55` : "none",
                          animation: `${growY} .8s ${EASE} ${Math.min(index * 45, 700)}ms backwards`,
                          transition: `filter .3s ease, transform .3s ${EASE}`,
                          ...NO_MOTION,
                        }}
                      />
                      <Typography sx={{ fontSize: 9, color: "#94a3b8", mt: 0.25, visibility: dense && index % 5 !== 0 ? "hidden" : "visible" }}>
                        {String(item._id).slice(5)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ---------- Users / Role-wise ---------- */}
      <Card
        sx={{
          ...enter(420),
          overflow: "hidden",
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,.18)",
          boxShadow: "0 10px 30px rgba(79,70,229,.08)",
          bgcolor: "rgba(255,255,255,.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{
            px: 1.5,
            minHeight: 42,
            borderBottom: "1px solid #eef2f7",
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0", background: "linear-gradient(90deg, #6366f1, #ec4899)" },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              minHeight: 42,
              color: "#64748b",
              transition: "color .3s ease, background .3s ease",
              "&:hover": { color: "#4f46e5" },
              "&.Mui-selected": { color: "#4f46e5" },
            },
          }}
        >
          <Tab label="Users" />
          <Tab label="Role-wise utilization" />
        </Tabs>

        <Collapse in={tab === 0} timeout={350}>
          <Stack direction={{ xs: "column", md: "row" }} gap={1} sx={{ p: 1.5, pb: 0.5 }}>
            <Select size="small" value={role} onChange={(event) => setRole(event.target.value)} displayEmpty MenuProps={selectMenuProps} sx={filterSelectSx}>
              <MenuItem value="all">All roles</MenuItem>
              {roles.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
            <Select size="small" value={status} onChange={(event) => setStatus(event.target.value)} displayEmpty MenuProps={selectMenuProps} sx={filterSelectSx}>
              <MenuItem value="all">All statuses</MenuItem>
              {(data.statusOptions || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
            <TextField
              size="small"
              placeholder="Search name or username"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
                minWidth: { md: 220 },
                maxWidth: 300,
                width: "100%",
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
        </Collapse>

        <Box
          sx={{
            m: 1.5,
            overflowX: "auto",
            borderRadius: "12px",
            border: "1px solid #eef2f7",
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-thumb": { background: "linear-gradient(135deg,#a5b4fc,#f9a8d4)", borderRadius: 8 },
          }}
        >
          <Table size="small">
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
                {(tab === 0 ? ["User", "Role", "Last login", "Status"] : ["Role", "Total", "Active", "Utilization"]).map((item) => (
                  <TableCell key={item}>{item}</TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody key={tab}>
              {isInitialLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    <TableCell colSpan={4} sx={{ py: 1 }}>
                      <Skeleton variant="rounded" height={22} animation="wave" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isInitialLoading &&
                tab === 0 &&
                users.map((item, index) => {
                  const [g1, g2] = AVATAR_GRADIENTS[hashOf(item.user) % AVATAR_GRADIENTS.length];
                  const tint = ROLE_TINTS[hashOf(item.role) % ROLE_TINTS.length];
                  const isActive = item.status === "Active";
                  const isInactive = item.status === "Inactive";
                  return (
                    <TableRow
                      key={item._id || index}
                      sx={{
                        animation: `${rowIn} .45s ${EASE} ${Math.min(index * 30, 450)}ms backwards`,
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
                            {initialsOf(item.user)}
                          </Box>
                          <Box component="span" sx={{ fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>
                            {item.user || "-"}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {item.role ? (
                          <Box component="span" sx={pill(tint.bg, tint.color, { fontWeight: 600 })}>
                            {item.role}
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{date(item.createdAt)}</TableCell>
                      <TableCell>
                        {item.status ? (
                          <Box component="span" sx={pill(isActive ? "#d1fae5" : isInactive ? "#ffe4e6" : "#f1f5f9", isActive ? "#059669" : isInactive ? "#e11d48" : "#475569")}>
                            <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />
                            {isActive ? "Active" : isInactive ? "Inactive" : item.status}
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!isInitialLoading &&
                tab === 1 &&
                roleRows.map((item, index) => {
                  const tint = ROLE_TINTS[hashOf(item.role) % ROLE_TINTS.length];
                  const pct = item.total ? Math.round((item.active / item.total) * 100) : 0;
                  const [t1, t2] = utilTone(pct);
                  return (
                    <TableRow
                      key={item.role}
                      sx={{
                        animation: `${rowIn} .45s ${EASE} ${Math.min(index * 40, 450)}ms backwards`,
                        ...NO_MOTION,
                        transition: "background .25s ease",
                        "& td": { fontSize: 11.5, color: "#475569", borderBottom: "1px solid #f1f5f9", py: 1 },
                        "&:hover": { background: "linear-gradient(90deg, #eef2ff, #fdf4ff 60%, #fff)" },
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell>
                        {item.role ? (
                          <Box component="span" sx={pill(tint.bg, tint.color, { fontWeight: 600 })}>
                            {item.role}
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#1e293b !important" }}>{item.total || 0}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#059669 !important" }}>{item.active || 0}</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Box sx={{ flex: 1, height: 6, borderRadius: 6, bgcolor: "#f1f5f9", overflow: "hidden" }}>
                            <Box
                              sx={{
                                height: "100%",
                                width: `${pct}%`,
                                borderRadius: 6,
                                transformOrigin: "left",
                                background: `linear-gradient(90deg, ${t1}, ${t2})`,
                                animation: `${growX} .9s ${EASE} ${Math.min(index * 60, 500) + 150}ms backwards`,
                                ...NO_MOTION,
                              }}
                            />
                          </Box>
                          <Box component="span" sx={{ minWidth: 32, fontWeight: 700, fontSize: 11, color: t1 }}>
                            {pct}%
                          </Box>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!isInitialLoading && isEmpty && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 0 }}>
                    <Box sx={{ animation: `${popIn} .5s ${EASE}`, ...NO_MOTION }}>
                      <Box
                        sx={{
                          mx: "auto",
                          mb: 1.25,
                          width: 52,
                          height: 52,
                          borderRadius: "16px",
                          display: "grid",
                          placeItems: "center",
                          color: "#6366f1",
                          background: "linear-gradient(135deg, #eef2ff, #fce7f3)",
                        }}
                      >
                        <InboxOutlinedIcon sx={{ fontSize: 26 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>No data</Typography>
                      <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "#94a3b8" }}>
                        {tab === 0 && (search || role !== "all" || status !== "all") ? "Try changing the search or filters." : "Nothing to show for this period yet."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        {tab === 0 && <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, pb: 1 }}>
          <Typography sx={{ fontSize: 11, color: "#64748b" }}>{pagination.totalRecords} users</Typography>
          <Stack direction="row" alignItems="center" gap={1}>
            <Button size="small" disabled={pagination.page <= 1 || isRefreshing} onClick={() => setPage((value) => Math.max(value - 1, 1))}>Previous</Button>
            <Typography sx={{ fontSize: 11 }}>{pagination.page} / {pagination.totalPages}</Typography>
            <Button size="small" disabled={pagination.page >= pagination.totalPages || isRefreshing} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </Stack>
        </Stack>}
      </Card>
    </Box>
  );
}