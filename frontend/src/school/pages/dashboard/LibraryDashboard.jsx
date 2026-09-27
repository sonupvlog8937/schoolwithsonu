import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ViewListIcon from "@mui/icons-material/ViewList";
import { fetchLibraryDashboard } from "../../../state/libraryDashboardSlice";

/* ---------- Animations & tokens ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const grow = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
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

const cardSx = {
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,.18)",
  boxShadow: "0 6px 20px rgba(15,23,42,.05)",
  transition: `transform .35s ${EASE}, box-shadow .35s ${EASE}`,
  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 30px rgba(15,23,42,.09)" },
};

const statCards = [
  { key: "totalBooks", label: "Total Books", icon: MenuBookIcon, g: ["#34d399", "#059669"] },
  { key: "issuedBooks", label: "Books Issued", icon: AssignmentReturnIcon, g: ["#60a5fa", "#4f46e5"] },
  { key: "returnedBooks", label: "Books Returned", icon: AssignmentReturnIcon, g: ["#a78bfa", "#db2777"] },
  { key: "availableBooks", label: "Available Books", icon: Inventory2Icon, g: ["#fb7185", "#f97316"] },
];

const overview = [
  ["totalBooks", "Total Books in Library", MenuBookIcon, "#16b981"],
  ["issuedBooks", "Currently Issued", AssignmentReturnIcon, "#1597e5"],
  ["returnedBooks", "Total Returned", AssignmentReturnIcon, "#7042bb"],
  ["availableBooks", "Available for Issue", Inventory2Icon, "#f59e0b"],
];

/* ---------- Helpers ---------- */
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
        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
        boxShadow: `0 10px 24px ${g[1]}40`,
        "&:hover": { transform: "translateY(-4px)", boxShadow: `0 16px 32px ${g[1]}59` },
      }}
    >
      <Box sx={{ position: "absolute", top: -28, right: -28, width: 96, height: 96, borderRadius: "50%", bgcolor: "rgba(255,255,255,.16)" }} />
      <Box sx={{ position: "absolute", bottom: -36, right: 26, width: 66, height: 66, borderRadius: "50%", bgcolor: "rgba(255,255,255,.10)" }} />
      <CardContent sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.75, p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: "13px", bgcolor: "rgba(255,255,255,.22)" }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <CountUp value={value} />
          </Typography>
          <Typography sx={{ fontSize: 11.5, mt: 0.4, opacity: 0.92 }}>{label}</Typography>
        </Box>
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

export default function LibraryDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.libraryDashboard);

  useEffect(() => { dispatch(fetchLibraryDashboard()); }, [dispatch]);

  const dashboard = data || {};
  const total = Number(dashboard.totalBooks) || 0;
  const actions = [
    ["Issue a Book", "Issue a book to a student or staff member", AddIcon, "#16a34a", "/school/library/books"],
    ["Issue Log", "View all issued and returned books", ViewListIcon, "#1597e5", "/school/library/books"],
    ["Book Database", "Manage all books in the library", MenuBookIcon, "#7042bb", "/school/library/books"],
    ["Library Report", "Generate and download reports", AssessmentIcon, "#f97316", "/school/library/books"],
  ];

  if (loading && !data) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#16b981" }} />
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
          "radial-gradient(900px 420px at 0% 0%, rgba(16,185,129,.10), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(99,102,241,.10), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(249,115,22,.08), transparent 60%), #f4f6fa",
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
          background: "linear-gradient(120deg,#10b981 0%,#0ea5e9 45%,#6366f1 80%,#a855f7 100%)",
          backgroundSize: "200% 200%",
          animation: `${fadeUp} .5s ${EASE} backwards, ${shift} 12s ease infinite`,
          boxShadow: "0 12px 28px rgba(14,165,233,.28)",
          ...NO_MOTION,
        }}
      >
        <Box sx={{ position: "absolute", top: -40, right: 140, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(255,255,255,.12)" }} />
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
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 22 }, letterSpacing: "-0.02em" }}>
              Library Management
            </Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12, opacity: 0.92 }}>Overview of books, issues and returns</Typography>
          </Box>
          <Stack direction="row" gap={1.25} flexWrap="wrap">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/school/library/books")}
              sx={{
                bgcolor: "#fff", color: "#059669", textTransform: "none", fontWeight: 700, fontSize: 12, borderRadius: "10px", boxShadow: "0 6px 16px rgba(0,0,0,.15)",
                transition: `all .25s ${EASE}`,
                "&:hover": { bgcolor: "#ecfdf5", transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(0,0,0,.2)" },
              }}
            >
              Issue Book
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/school/library/books")}
              sx={{
                color: "#fff", textTransform: "none", fontWeight: 700, fontSize: 12, borderRadius: "10px",
                bgcolor: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.4)", backdropFilter: "blur(6px)",
                transition: `all .25s ${EASE}`,
                "&:hover": { bgcolor: "rgba(255,255,255,.3)", transform: "translateY(-2px)", border: "1px solid rgba(255,255,255,.6)" },
              }}
            >
              View Books
            </Button>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Box sx={{ mb: 2, px: 2, py: 1, borderRadius: "12px", bgcolor: "#ef44441A", color: "#dc2626", fontSize: 12.5, fontWeight: 500 }}>
          {error}
        </Box>
      )}

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map(({ key, ...rest }, i) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <StatCard {...rest} value={dashboard[key] || 0} delay={60 + i * 60} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ ...cardSx, ...enter(320), height: "100%", overflow: "hidden" }}>
            <PanelHeader icon={AssessmentIcon} color="#6366f1" title="Library Overview" />
            <CardContent sx={{ p: 2.5 }}>
              {overview.map(([key, label, Icon, color], i) => {
                const value = Number(dashboard[key]) || 0;
                const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
                return (
                  <Box
                    key={key}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5, p: 1.5, mb: 1.25, borderRadius: "14px",
                      bgcolor: `${color}0D`, border: `1px solid ${color}1F`,
                      transition: `transform .3s ${EASE}, background .3s ease`,
                      "&:hover": { transform: "translateX(4px)", bgcolor: `${color}18` },
                    }}
                  >
                    <Box sx={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "12px", bgcolor: `${color}22`, color, flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 19 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <Typography sx={{ fontSize: 12, color: "#64748b" }}>{label}</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 14, color }}>
                          <CountUp value={value} />
                        </Typography>
                      </Box>
                      <Box sx={{ height: 5, mt: 0.9, borderRadius: 3, bgcolor: `${color}22`, overflow: "hidden" }}>
                        <Box
                          sx={{
                            height: "100%", width: `${pct}%`, borderRadius: 3, transformOrigin: "left",
                            background: `linear-gradient(90deg,${color},${color}99)`,
                            animation: `${grow} 1s ${EASE} ${400 + i * 100}ms backwards`, ...NO_MOTION,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardSx, ...enter(380), height: "100%", overflow: "hidden" }}>
            <PanelHeader icon={ViewListIcon} color="#f97316" title="Quick Actions" />
            <CardContent sx={{ p: 2 }}>
              {actions.map(([title, description, Icon, color, to]) => (
                <Button
                  key={title}
                  onClick={() => navigate(to)}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start", textAlign: "left", p: 1.25, mb: 1, borderRadius: "14px", textTransform: "none",
                    color: "#17233b", bgcolor: `${color}0D`, border: `1px solid ${color}22`,
                    transition: `all .3s ${EASE}`,
                    "& .qa-icon": { transition: `all .3s ${EASE}` },
                    "&:hover": {
                      bgcolor: color, color: "#fff", transform: "translateY(-2px)", boxShadow: `0 10px 20px ${color}55`,
                      "& .qa-icon": { bgcolor: "rgba(255,255,255,.25)", color: "#fff", transform: "rotate(-6deg) scale(1.08)" },
                      "& .qa-sub": { color: "rgba(255,255,255,.85)" },
                    },
                  }}
                >
                  <Box className="qa-icon" sx={{ width: 36, height: 36, mr: 1.5, display: "grid", placeItems: "center", borderRadius: "11px", bgcolor: `${color}22`, color, flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "inherit" }}>{title}</Typography>
                    <Typography className="qa-sub" sx={{ fontSize: 11, color: "#718096", transition: "color .3s ease" }}>{description}</Typography>
                  </Box>
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}