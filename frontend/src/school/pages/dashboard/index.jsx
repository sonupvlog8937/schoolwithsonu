import { useEffect, useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Avatar,
  CircularProgress, LinearProgress, Chip, GlobalStyles,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../environment";

import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import WarningIcon from "@mui/icons-material/Warning";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CakeIcon from "@mui/icons-material/Cake";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/* ---------- Animations ---------- */
const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const growUp = keyframes`from{transform:scaleY(0)}to{transform:scaleY(1)}`;
const drift = keyframes`0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-30px)}`;
const flow = keyframes`0%{background-position:0% 50%}100%{background-position:100% 50%}`;
const pulse = keyframes`0%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}70%{box-shadow:0 0 0 10px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}`;

// "backwards" fill-mode so hover transforms still work after entrance ends
const reveal = (i = 0) => ({
  animation: `${fadeUp} .65s cubic-bezier(.2,.8,.2,1) ${i * 60}ms backwards`,
});

const cardBase = {
  borderRadius: "16px",
  backgroundColor: "#fff",
  border: "1px solid rgba(255,255,255,.9)",
  boxShadow: "0 4px 18px rgba(99,102,241,.08)",
  transition: "transform .3s ease, box-shadow .3s ease",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 28px rgba(99,102,241,.16)" },
};

/* ---------- Count-up hook ---------- */
function useCountUp(target, duration = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const end = Number(target) || 0;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      setV(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function Count({ value, suffix = "", format }) {
  const v = useCountUp(value);
  const dec = Number.isInteger(Number(value)) ? 0 : 1;
  return <>{format ? format(v) : v.toFixed(dec)}{suffix}</>;
}

const pct = (n, total) => (total ? Math.min(((n || 0) / total) * 100, 100) : 0);

/* ---------- Main ---------- */
export default function SchoolDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const authHeader = token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}`;
      const response = await axios.get(`${baseUrl}/dashboard/stats`, {
        headers: { Authorization: authHeader },
      });
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)} K`;
    return Math.round(amount || 0).toString();
  };

  const formatDate = () =>
    new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress sx={{ color: "#ec4899" }} />
      </Box>
    );
  }
  if (error) {
    return <Box sx={{ p: 3 }}><Typography color="error" sx={{ fontSize: 13 }}>{error}</Typography></Box>;
  }

  const data = dashboardData || {};
  const total = data.totalStudents || 0;
  const schoolName = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.school_name; } catch { return null; }
  })() || "School Dashboard";

  const stats = [
    { icon: PeopleIcon, title: "Total Students", value: total, grad: ["#ff6b6b", "#ff9a56"], to: "/school/students/admission" },
    { icon: CheckCircleIcon, title: "Today's Attendance", value: data.todayAttendancePercentage || 0, suffix: "%", grad: ["#10b981", "#34d399"], to: "/school/attendance" },
    { icon: CurrencyRupeeIcon, title: "Today's Collection", value: data.todayCollection || 0, format: formatCurrency, grad: ["#f59e0b", "#fcd34d"], to: "/school/fees/search-payment" },
    { icon: WarningIcon, title: "Absent Today", value: data.absentToday || 0, grad: ["#f43f5e", "#fb7185"], to: "/school/attendance" },
    { icon: CurrencyRupeeIcon, title: "Fee Due Students", value: data.feeDueStudents || 0, grad: ["#8b5cf6", "#a78bfa"], to: "/school/fees/search-due" },
  ];

  // Backend can send: weeklyAttendance: [{ day: "Mon", percentage: 92 }, ...]
  const week = Array.isArray(data.weeklyAttendance) && data.weeklyAttendance.length ? data.weeklyAttendance : null;
  const barColors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#f43f5e"];

  return (
    <Box sx={{ position: "relative", overflow: "hidden", minHeight: "100vh", p: { xs: 2, md: 3 },
      background: "linear-gradient(135deg,#f3f5ff 0%,#fff4f8 50%,#effcf8 100%)" }}>
      <GlobalStyles styles={{
        "@import": "url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap')",
        "@media (prefers-reduced-motion: reduce)": { "*": { animation: "none !important", transition: "none !important" } },
      }} />

      {/* soft floating color blobs */}
      {[
        { c: "#a78bfa", t: -80, l: -60, s: 280, d: 14 },
        { c: "#fb7185", t: 240, l: "70%", s: 260, d: 18 },
        { c: "#34d399", t: 620, l: "10%", s: 240, d: 16 },
      ].map((b, i) => (
        <Box key={i} sx={{ position: "absolute", top: b.t, left: b.l, width: b.s, height: b.s, borderRadius: "50%",
          background: b.c, opacity: 0.16, filter: "blur(70px)", pointerEvents: "none",
          animation: `${drift} ${b.d}s ease-in-out infinite` }} />
      ))}

      <Box sx={{ position: "relative", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif", "& *": { fontFamily: "inherit !important" } }}>
        {/* Header */}
        <Card sx={{ mb: 2.5, borderRadius: "18px", color: "#fff", ...reveal(0),
          background: "linear-gradient(120deg,#6366f1,#ec4899,#f97316,#6366f1)", backgroundSize: "300% 300%",
          animation: `${fadeUp} .65s cubic-bezier(.2,.8,.2,1) backwards, ${flow} 14s linear infinite alternate`,
          boxShadow: "0 12px 30px rgba(236,72,153,.28)" }}>
          <CardContent sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "center", py: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: "rgba(255,255,255,.25)", border: "2px solid rgba(255,255,255,.7)" }}>
                <PeopleIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>{schoolName}</Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.9 }}>Here's what's happening at your school today</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Chip label="+ Collect Fee" onClick={() => navigate("/school/fee-collection")}
                sx={{ height: 28, fontSize: 12, bgcolor: "#10b981", color: "#fff", fontWeight: 700, animation: `${pulse} 2.2s infinite`,
                  "&:hover": { bgcolor: "#059669" } }} />
              <Chip label={formatDate()} icon={<EventIcon sx={{ color: "#fff !important", fontSize: 16 }} />}
                sx={{ height: 28, fontSize: 12, bgcolor: "rgba(255,255,255,.22)", color: "#fff", fontWeight: 600, backdropFilter: "blur(6px)" }} />
            </Box>
          </CardContent>
        </Card>

        {/* Main stats */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {stats.map((s, i) => (
            <Grid item xs={12} sm={6} md={2.4} key={s.title}>
              <StatCard {...s} delay={i + 1} onClick={() => navigate(s.to)} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          {/* Left column */}
          <Grid item xs={12} md={7}>
            <Panel icon={AssignmentIcon} color="#6366f1" title="Weekly Attendance" action="View All" delay={6}
              onAction={() => navigate("/school/attendance")} sx={{ mb: 2.5, height: "auto" }}>
              {week ? (
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 160, px: 1 }}>
                  {week.map((d, i) => {
                    const c = barColors[i % barColors.length];
                    return (
                      <Box key={d.day} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: c }}>{d.percentage}%</Typography>
                        <Box sx={{ width: "100%", maxWidth: 34, height: Math.max(d.percentage, 4) * 1.05, mt: 0.5,
                          borderRadius: "8px 8px 3px 3px", background: `linear-gradient(180deg,${c},${c}77)`,
                          transformOrigin: "bottom", animation: `${growUp} .9s cubic-bezier(.2,.8,.2,1) ${350 + i * 90}ms backwards`,
                          transition: "filter .2s", "&:hover": { filter: "brightness(1.12)" } }} />
                        <Typography sx={{ fontSize: 10.5, color: "#64748b", mt: 0.5 }}>{d.day}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ py: 5, textAlign: "center", color: "#94a3b8" }}>
                  <EventIcon sx={{ fontSize: 36, mb: 0.5, opacity: 0.5 }} />
                  <Typography sx={{ fontSize: 12 }}>Weekly attendance data not available yet</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2.5, mt: 2, flexWrap: "wrap" }}>
                {[
                  ["Present", Math.max(total - (data.absentToday || 0), 0), "#10b981"],
                  ["Absent", data.absentToday || 0, "#ef4444"],
                  ["Leave", data.staffLeave || 0, "#f59e0b"],
                ].map(([l, v, c]) => (
                  <Box key={l} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: c }} />
                    <Typography sx={{ fontSize: 11.5, color: "#475569" }}>{l}: <b>{v}</b></Typography>
                  </Box>
                ))}
              </Box>
            </Panel>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <InfoCard icon={EventIcon} color="#10b981" title="Upcoming Events" value={data.upcomingHolidays || 0}
                  subtitle={data.upcomingHolidays > 0 ? "Events coming up" : "No upcoming events"} delay={7} />
              </Grid>
              <Grid item xs={12} md={4}>
                <InfoCard icon={CakeIcon} color="#ec4899" title="Today's Birthdays" value={data.birthdays || 0}
                  subtitle={data.birthdays > 0 ? `${data.birthdays} birthdays today` : "No birthdays today"} delay={8} />
              </Grid>
              <Grid item xs={12} md={4}>
                <InfoCard icon={AssignmentIcon} color="#f59e0b" title="Upcoming Exams" value={2}
                  subtitle="TERM-I - SUMMATIVE" delay={9} onClick={() => navigate("/school/examinations")} />
              </Grid>
            </Grid>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={5}>
            <Panel icon={CheckCircleIcon} color="#f59e0b" title="Today's Summary" delay={6}>
              <Grid container spacing={1.5}>
                {[
                  { icon: CurrencyRupeeIcon, label: "Fee Collected", value: data.todayCollection || 0, format: formatCurrency, color: "#10b981" },
                  { icon: PersonAddIcon, label: "New Admissions", value: data.newAdmissions || 0, color: "#3b82f6" },
                  { icon: ReportProblemIcon, label: "Complaints", value: data.complaints || 0, color: "#f59e0b" },
                  { icon: CakeIcon, label: "Birthdays", value: data.birthdays || 0, color: "#ec4899" },
                ].map((s) => (
                  <Grid item xs={6} key={s.label}><SummaryItem {...s} /></Grid>
                ))}
              </Grid>
            </Panel>
          </Grid>

          {/* Metric cards */}
          {[
            { icon: PeopleIcon, color: "#10b981", title: "Total Staff", value: data.totalStaff || 0, subtitle: `${data.totalTeachers || 0} Teachers` },
            { icon: MenuBookIcon, color: "#f59e0b", title: "Library Books", value: data.libraryBooks || 0, subtitle: "0 Issued", to: "/school/library/books" },
            { icon: DirectionsBusIcon, color: "#06b6d4", title: "Vehicles", value: data.vehicles?.students || 0, suffix: " Students", subtitle: `${data.vehicles?.routes || 0} Routes`, to: "/school/transport/routes" },
            { icon: EventIcon, color: "#8b5cf6", title: "Upcoming Holidays", value: data.upcomingHolidays || 0, subtitle: "This Quarter" },
          ].map((m, i) => (
            <Grid item xs={12} sm={6} md={3} key={m.title}>
              <MetricCard {...m} delay={10 + i} onClick={m.to ? () => navigate(m.to) : undefined} />
            </Grid>
          ))}

          {/* Gender Ratio */}
          <Grid item xs={12} sm={6} md={3}>
            <Panel icon={PeopleIcon} color="#ec4899" title="Gender Ratio" delay={14}>
              <GenderRow icon={MaleIcon} color="#3b82f6" label="Boys" count={data.genderRatio?.boys || 0} value={pct(data.genderRatio?.boys, total)} />
              <GenderRow icon={FemaleIcon} color="#ec4899" label="Girls" count={data.genderRatio?.girls || 0} value={pct(data.genderRatio?.girls, total)} last />
            </Panel>
          </Grid>

          {/* Staff Today */}
          <Grid item xs={12} sm={6} md={3}>
            <Panel icon={PeopleIcon} color="#10b981" title="Staff Today" delay={15}>
              <StaffRing value={pct(data.staffPresent, data.totalStaff)} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5 }}>
                {[["Present", data.staffPresent, "#10b981"], ["Absent", data.staffAbsent, "#ef4444"], ["Leave", data.staffLeave, "#f59e0b"]].map(([l, v, c]) => (
                  <Typography key={l} sx={{ fontSize: 11, color: c, fontWeight: 700 }}>● {l}: {v || 0}</Typography>
                ))}
              </Box>
            </Panel>
          </Grid>

          {/* Fee Collection */}
          <Grid item xs={12} sm={6} md={3}>
            <Panel icon={CurrencyRupeeIcon} color="#f59e0b" title="Fee Collection" delay={16}>
              <AnimatedBar value={data.feeCollected || 0} color="linear-gradient(90deg,#10b981,#34d399)" track="#fee2e2" height={14} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.2 }}>
                <Typography sx={{ fontSize: 11.5, color: "#10b981", fontWeight: 700 }}>{Number(data.feeCollected || 0).toFixed(2)}% Collected</Typography>
                <Typography sx={{ fontSize: 11.5, color: "#ef4444", fontWeight: 700 }}>{Number(data.feePending || 0).toFixed(2)}% Pending</Typography>
              </Box>
            </Panel>
          </Grid>

          {/* Pending Items */}
          <Grid item xs={12} sm={6} md={3}>
            <Panel icon={WarningIcon} color="#f43f5e" title="Pending Items" delay={17}>
              <Box sx={{ display: "flex", justifyContent: "space-around", pt: 0.5 }}>
                {[
                  ["Fee Dues", data.pendingItems?.feeDues, "#8b5cf6"],
                  ["Complaints", data.pendingItems?.complaints, "#f59e0b"],
                  ["Overdue Docs", data.pendingItems?.overdueDocs, "#ef4444"],
                ].map(([l, v, c]) => (
                  <Box key={l} sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: c, lineHeight: 1.2 }}><Count value={v || 0} /></Typography>
                    <Typography sx={{ fontSize: 10.5, color: "#64748b" }}>{l}</Typography>
                  </Box>
                ))}
              </Box>
            </Panel>
          </Grid>

          {/* Complaint Overview */}
          <Grid item xs={12} md={6}>
            <Panel icon={ReportProblemIcon} color="#ff6b6b" title="Complaint Overview" delay={18}>
              <Grid container spacing={1.5}>
                {[["Total", data.complaints || 0, "#3b82f6"], ["In Progress", 0, "#f59e0b"], ["Resolved", 0, "#10b981"]].map(([l, v, c]) => (
                  <Grid item xs={4} key={l}><MiniTile label={l} value={v} color={c} big /></Grid>
                ))}
              </Grid>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#334155", mt: 2, mb: 1 }}>Priority</Typography>
              <Grid container spacing={1.5}>
                {[["Low", "#64748b"], ["Medium", "#f59e0b"], ["High", "#ff6b6b"], ["Critical", "#ef4444"]].map(([l, c]) => (
                  <Grid item xs={3} key={l}><MiniTile label={l} value={0} color={c} /></Grid>
                ))}
              </Grid>
            </Panel>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

/* ---------- Reusable components ---------- */
function StatCard({ icon: Icon, title, value, suffix, format, grad, onClick, delay }) {
  return (
    <Card onClick={onClick} sx={{
      borderRadius: "16px", color: "#fff", position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default",
      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, boxShadow: `0 8px 20px ${grad[0]}44`,
      transition: "transform .3s ease, box-shadow .3s ease", ...reveal(delay),
      "&::after": { content: '""', position: "absolute", right: -26, top: -26, width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,.18)", pointerEvents: "none" },
      "&:hover": { transform: "translateY(-5px)", boxShadow: `0 14px 28px ${grad[0]}66` },
      "&:hover .arrow": { transform: "translateX(4px)" },
    }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,.25)", color: "#fff", width: 36, height: 36 }}><Icon sx={{ fontSize: 20 }} /></Avatar>
          {onClick && <ArrowForwardIcon className="arrow" sx={{ fontSize: 16, opacity: 0.9, transition: "transform .3s" }} />}
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 1.5, lineHeight: 1.1 }}>
          <Count value={value} suffix={suffix} format={format} />
        </Typography>
        <Typography sx={{ fontSize: 11.5, opacity: 0.92, mt: 0.3 }}>{title}</Typography>
      </CardContent>
    </Card>
  );
}

function Panel({ icon: Icon, color, title, action, onAction, delay = 0, children, sx }) {
  return (
    <Card sx={{ ...cardBase, overflow: "hidden", height: "100%", ...reveal(delay), ...sx }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: `${color}1f`, color }}><Icon sx={{ fontSize: 16 }} /></Avatar>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}</Typography>
          </Box>
          {action && (
            <Typography onClick={onAction} sx={{ fontSize: 11.5, fontWeight: 600, color, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              {action} →
            </Typography>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

function InfoCard({ icon: Icon, color, title, value, subtitle, delay, onClick }) {
  return (
    <Card onClick={onClick} sx={{ ...cardBase, height: "100%", cursor: onClick ? "pointer" : "default", ...reveal(delay),
      background: `linear-gradient(160deg, #fff 55%, ${color}14)` }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Avatar sx={{ bgcolor: `${color}22`, color, width: 32, height: 32 }}><Icon sx={{ fontSize: 18 }} /></Avatar>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>{title}</Typography>
        </Box>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.1 }}><Count value={value} /></Typography>
        <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.3 }}>{subtitle}</Typography>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ icon: Icon, label, value, format, color }) {
  return (
    <Box sx={{ borderRadius: "14px", p: 1.5, textAlign: "center", background: `linear-gradient(160deg, ${color}22, ${color}0d)`,
      transition: "transform .25s ease", "&:hover": { transform: "scale(1.04)" } }}>
      <Avatar sx={{ bgcolor: "#fff", color, width: 34, height: 34, mx: "auto", mb: 0.8, boxShadow: `0 4px 10px ${color}33` }}>
        <Icon sx={{ fontSize: 18 }} />
      </Avatar>
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}><Count value={value} format={format} /></Typography>
      <Typography sx={{ fontSize: 10.5, color: "#64748b" }}>{label}</Typography>
    </Box>
  );
}

function MetricCard({ icon: Icon, color, title, value, suffix, subtitle, delay, onClick }) {
  return (
    <Card onClick={onClick} sx={{ ...cardBase, cursor: onClick ? "pointer" : "default", ...reveal(delay) }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 42, height: 42, color: "#fff", background: `linear-gradient(135deg, ${color}, ${color}aa)`, boxShadow: `0 6px 14px ${color}44` }}>
            <Icon sx={{ fontSize: 22 }} />
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#64748b" }}>{title}</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}><Count value={value} suffix={suffix} /></Typography>
            <Typography sx={{ fontSize: 10.5, color }}>{subtitle}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function AnimatedBar({ value, color, track, height = 20 }) {
  const v = useCountUp(value, 1200);
  return (
    <LinearProgress variant="determinate" value={Math.min(v, 100)} sx={{
      height, borderRadius: height, bgcolor: track,
      "& .MuiLinearProgress-bar": { background: color, borderRadius: height, transition: "none" },
    }} />
  );
}

function GenderRow({ icon: Icon, color, label, count, value, last }) {
  return (
    <Box sx={{ mb: last ? 0 : 1.8 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Icon sx={{ color, fontSize: 18 }} />
          <Typography sx={{ fontSize: 11.5, color: "#475569" }}>{count} {label}</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 800, color }}><Count value={value} suffix="%" format={(n) => n.toFixed(0)} /></Typography>
      </Box>
      <AnimatedBar value={value} color={`linear-gradient(90deg, ${color}, ${color}99)`} track={`${color}22`} height={10} />
    </Box>
  );
}

function StaffRing({ value }) {
  const v = useCountUp(value, 1200);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 0.5 }}>
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress variant="determinate" value={100} size={82} thickness={5} sx={{ color: "#d1fae5", position: "absolute" }} />
        <CircularProgress variant="determinate" value={v} size={82} thickness={5} sx={{ color: "#10b981", "& .MuiCircularProgress-circle": { strokeLinecap: "round" } }} />
        <Box sx={{ inset: 0, position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#10b981" }}>{v.toFixed(0)}%</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#475569", mt: 0.8 }}>Present</Typography>
    </Box>
  );
}

function MiniTile({ label, value, color, big }) {
  return (
    <Box sx={{ textAlign: "center", borderRadius: "12px", py: big ? 1.4 : 1, background: `linear-gradient(160deg, ${color}1f, ${color}0a)`,
      transition: "transform .25s ease", "&:hover": { transform: "translateY(-2px)" } }}>
      <Typography sx={{ fontSize: big ? 20 : 16, fontWeight: 800, color, lineHeight: 1.2 }}><Count value={value} /></Typography>
      <Typography sx={{ fontSize: 10.5, color: "#64748b" }}>{label}</Typography>
    </Box>
  );
}