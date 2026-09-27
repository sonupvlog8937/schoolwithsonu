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
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoopIcon from "@mui/icons-material/Loop";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditNoteIcon from "@mui/icons-material/EditNote";
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
const grow = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
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
  ["#fb923c", "#ea580c"],
  ["#fbbf24", "#f59e0b"],
  ["#60a5fa", "#4f46e5"],
  ["#34d399", "#059669"],
  ["#fb7185", "#e11d48"],
  ["#a78bfa", "#7c3aed"],
];
const ACCENTS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6"];
const pick = (str, list) => list[[...String(str ?? "")].reduce((a, c) => a + c.charCodeAt(0), 0) % list.length];

const PRIORITY_COLORS = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444", Critical: "#be123c" };
const ACTION_COLORS = { Seen: "#3b82f6", Initiated: "#f59e0b", Progressed: "#8b5cf6", Resolved: "#10b981" };

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
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(239,68,68,.15)" },
    "&.Mui-focused fieldset": { borderColor: "#ef4444" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ef4444" },
};

const headSx = {
  "& th": {
    background: "linear-gradient(90deg,#fff1f2,#fff7ed,#eef2ff)",
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

function Pill({ label, color, outlined }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.2,
        borderRadius: "8px",
        bgcolor: outlined ? "transparent" : `${color}1A`,
        border: outlined ? `1px solid ${color}66` : "1px solid transparent",
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

function EmptyState({ text }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <SearchOffIcon sx={{ fontSize: 44, color: "#cbd5e1", animation: `${floaty} 3s ease-in-out infinite`, ...NO_MOTION }} />
      <Typography sx={{ color: "#94a3b8", fontSize: 12.5, mt: 1 }}>{text}</Typography>
    </Box>
  );
}

function SectionTitle({ icon: Icon, color, children }) {
  return (
    <Stack direction="row" alignItems="center" gap={1.25} mb={2}>
      <Box sx={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: "9px", bgcolor: `${color}22`, color }}>
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#17233b" }}>{children}</Typography>
    </Stack>
  );
}

export default function ComplaintDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state) => state.schoolDashboards["complaint"]);
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    dispatch(fetchSchoolDashboard("complaint"));
  }, [dispatch]);

  const dashboard = data || {};
  const complaints = dashboard.complaints || [];
  const priority = dashboard.priority || { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const statusOptions = dashboard.statusOptions || ["Open", "In Progress", "Resolved", "Closed"];
  const priorityOptions = dashboard.priorityOptions || ["Low", "Medium", "High"];
  const actionBreakdown = Array.isArray(dashboard.actionBreakdown)
    ? dashboard.actionBreakdown
    : Object.entries(dashboard.actionBreakdown || {}).map(([label, value]) => ({ label, value }));

  const stats = [
    { key: "total", label: "Total complaints", value: dashboard.total || 0, icon: EditNoteIcon, g: GRADS[0] },
    { key: "pending", label: "Pending", value: dashboard.pending || 0, icon: AccessTimeIcon, g: GRADS[1] },
    { key: "inProgress", label: "In progress", value: dashboard.inProgress || 0, icon: LoopIcon, g: GRADS[2] },
    { key: "resolved", label: "Resolved", value: dashboard.resolved || 0, icon: CheckCircleOutlineIcon, g: GRADS[3] },
    { key: "unresolved", label: "Unresolved", value: dashboard.unresolved || 0, icon: WarningAmberIcon, g: GRADS[4] },
    { key: "todays", label: "Today's", value: dashboard.todays || 0, icon: CalendarMonthIcon, g: GRADS[5] },
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    if (statusFilter !== "all" && complaint.status !== statusFilter) return false;
    if (priorityFilter !== "all" && complaint.priority !== priorityFilter) return false;
    if (dateFrom && new Date(complaint.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(complaint.date) > new Date(dateTo)) return false;
    return true;
  });

  const totalComplaints = dashboard.total || 0;
  const priorityTotal = Object.values(priority).reduce((a, b) => a + (Number(b) || 0), 0);

  if (loading && !data) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#ef4444" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        background:
          "radial-gradient(900px 420px at 0% 0%, rgba(239,68,68,.09), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(99,102,241,.10), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(245,158,11,.08), transparent 60%), #f8fafc",
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
          background: "linear-gradient(120deg,#ef4444 0%,#f97316 40%,#ec4899 75%,#a855f7 100%)",
          backgroundSize: "200% 200%",
          animation: `${fadeUp} .5s ${EASE} backwards, ${shift} 12s ease infinite`,
          boxShadow: "0 12px 28px rgba(239,68,68,.30)",
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
              <WarningAmberIcon sx={{ fontSize: 26 }} />
              Complaint Dashboard
            </Typography>
            <Typography sx={{ mt: 0.4, fontSize: 12, opacity: 0.92 }}>Track complaints, priorities, and resolution progress</Typography>
          </Box>
          <Stack direction="row" gap={1.25}>
            <Button
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16, transition: `transform .5s ${EASE}` }} />}
              onClick={() => dispatch(fetchSchoolDashboard("complaint"))}
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
              onClick={() => navigate("/school/front-office/complaint")}
              sx={{
                bgcolor: "#fff", color: "#dc2626", textTransform: "none", fontWeight: 700, fontSize: 12, borderRadius: "10px",
                boxShadow: "0 6px 16px rgba(0,0,0,.15)", transition: `all .25s ${EASE}`,
                "&:hover": { bgcolor: "#fef2f2", transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(0,0,0,.2)" },
              }}
            >
              All Complaints
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

      {/* Priority Breakdown */}
      <Card sx={{ ...cardSx, ...enter(420), mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <SectionTitle icon={WarningAmberIcon} color="#ef4444">Priority Breakdown</SectionTitle>
          <Grid container spacing={1.5}>
            {Object.entries(priority).map(([key, value], i) => {
              const c = PRIORITY_COLORS[key] || "#64748b";
              const pct = priorityTotal > 0 ? ((Number(value) || 0) / priorityTotal) * 100 : 0;
              return (
                <Grid item xs={6} md={3} key={key}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: `${c}0F`,
                      border: `1px solid ${c}26`,
                      borderLeft: `4px solid ${c}`,
                      transition: `transform .3s ${EASE}, box-shadow .3s ${EASE}`,
                      "&:hover": { transform: "translateY(-3px)", boxShadow: `0 10px 20px ${c}33` },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: c }}>{key}</Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#17233b" }}>
                        <CountUp value={value} />
                      </Typography>
                    </Box>
                    <Box sx={{ height: 5, mt: 1, borderRadius: 3, bgcolor: `${c}22`, overflow: "hidden" }}>
                      <Box
                        sx={{
                          height: "100%", width: `${pct}%`, borderRadius: 3, transformOrigin: "left",
                          background: `linear-gradient(90deg,${c},${c}99)`,
                          animation: `${grow} 1s ${EASE} ${500 + i * 100}ms backwards`, ...NO_MOTION,
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs and Table */}
      <Card sx={{ ...cardSx, ...enter(480), overflow: "hidden" }}>
        <Box sx={{ borderBottom: "1px solid #edf0f2" }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{ px: 2, minHeight: 44 }}
            TabIndicatorProps={{ sx: { height: 3, borderRadius: 3, background: "linear-gradient(90deg,#ef4444,#f97316,#ec4899)" } }}
          >
            {["Complaints", "Action Breakdown"].map((label) => (
              <Tab
                key={label}
                label={label}
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: 13, minHeight: 44, transition: "color .25s ease",
                  "&.Mui-selected": { color: "#dc2626" },
                  "&:hover": { color: "#f87171" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CardContent sx={{ p: 2 }}>
          {/* key = tab, so content fades in smoothly on switch */}
          <Box key={activeTab} sx={enter(0)}>
            {activeTab === 0 ? (
              <>
                {/* Filters */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                  <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 150, fontSize: 12.5, ...fieldSx }}>
                    <MenuItem value="all" sx={{ fontSize: 12.5 }}>All Status</MenuItem>
                    {statusOptions.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: 12.5 }}>{option}</MenuItem>
                    ))}
                  </Select>
                  <Select size="small" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} displayEmpty sx={{ minWidth: 130, fontSize: 12.5, ...fieldSx }}>
                    <MenuItem value="all" sx={{ fontSize: 12.5 }}>All Priority</MenuItem>
                    {priorityOptions.map((option) => (
                      <MenuItem key={option} value={option} sx={{ fontSize: 12.5, color: PRIORITY_COLORS[option] }}>{option}</MenuItem>
                    ))}
                  </Select>
                  <TextField size="small" type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, ...fieldSx }} />
                  <TextField size="small" type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, ...fieldSx }} />
                </Stack>

                {/* Complaints Table */}
                <Box sx={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={headSx}>
                        {["Name", "Grade", "Section", "Type", "Priority", "Status", "Complaint", "Date", "User"].map((h) => (
                          <TableCell key={h}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((complaint, index) => {
                          const pc = PRIORITY_COLORS[complaint.priority];
                          const ac = ACTION_COLORS[complaint.actionTaken];
                          return (
                            <TableRow
                              key={index}
                              sx={{
                                animation: `${rowIn} .35s ${EASE} ${Math.min(index, 12) * 30}ms backwards`,
                                transition: "background .25s ease",
                                "& td": { fontSize: 12, borderBottom: "1px solid #f1f5f9" },
                                "&:hover": { bgcolor: "#fff7f7" },
                                ...NO_MOTION,
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Initial text={complaint.complaintBy} color={pick(complaint.complaintBy, ACCENTS)} />
                                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{complaint.complaintBy || "-"}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{complaint.grade || "-"}</TableCell>
                              <TableCell>{complaint.section || "-"}</TableCell>
                              <TableCell>
                                {complaint.complaintType ? <Pill label={complaint.complaintType} color={pick(complaint.complaintType, ACCENTS)} /> : "-"}
                              </TableCell>
                              <TableCell>
                                {complaint.priority ? <Pill label={complaint.priority} color={pc || "#64748b"} /> : "-"}
                              </TableCell>
                              <TableCell>
                                {complaint.actionTaken ? <Pill label={complaint.actionTaken} color={ac || "#64748b"} outlined /> : "-"}
                              </TableCell>
                              <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#475569" }} title={complaint.complaint}>
                                {complaint.complaint || "-"}
                              </TableCell>
                              <TableCell sx={{ color: "#64748b", whiteSpace: "nowrap" }}>{formatDate(complaint.date)}</TableCell>
                              <TableCell sx={{ color: "#7c3aed", fontWeight: 500 }}>{complaint.user || "-"}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 7, borderBottom: "none" }}>
                            <EmptyState text="No complaints found" />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </>
            ) : (
              /* Action Breakdown Table */
              <Box sx={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={headSx}>
                      <TableCell>Action Status</TableCell>
                      <TableCell align="center">Count</TableCell>
                      <TableCell align="center" sx={{ minWidth: 200 }}>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {actionBreakdown.map(({ label: status, value: count }, index) => {
                      const c = ACTION_COLORS[status] || "#64748b";
                      const pct = totalComplaints > 0 ? Math.min((count / totalComplaints) * 100, 100) : 0;
                      return (
                        <TableRow
                          key={status}
                          sx={{
                            animation: `${rowIn} .35s ${EASE} ${index * 50}ms backwards`,
                            transition: "background .25s ease",
                            "& td": { fontSize: 12, borderBottom: "1px solid #f1f5f9" },
                            "&:hover": { bgcolor: `${c}0D` },
                            ...NO_MOTION,
                          }}
                        >
                          <TableCell><Pill label={status} color={c} outlined /></TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: "#1e293b" }}>{count}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: `${c}22`, overflow: "hidden" }}>
                                <Box
                                  sx={{
                                    height: "100%", width: `${pct}%`, borderRadius: 3, transformOrigin: "left",
                                    background: `linear-gradient(90deg,${c},${c}99)`,
                                    animation: `${grow} 1s ${EASE} ${200 + index * 90}ms backwards`, ...NO_MOTION,
                                  }}
                                />
                              </Box>
                              <Typography sx={{ fontSize: 11.5, minWidth: 42, textAlign: "right", fontWeight: 700, color: c }}>
                                {totalComplaints > 0 ? ((count / totalComplaints) * 100).toFixed(1) : "0.0"}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}