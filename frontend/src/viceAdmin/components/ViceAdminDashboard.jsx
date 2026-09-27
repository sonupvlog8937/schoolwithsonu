import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Avatar, Paper,
  Chip, CircularProgress, Grid, LinearProgress, Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ChecklistIcon from "@mui/icons-material/Checklist";
import GradingIcon from "@mui/icons-material/Grading";
import CampaignIcon from "@mui/icons-material/Campaign";
import LockIcon from "@mui/icons-material/Lock";
import { baseUrl } from "../../environment";
import { AuthContext } from "../../context/AuthContext";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, onClick, loading }) {
  return (
    <Card elevation={0} onClick={onClick}
      sx={{
        border: "1px solid", borderColor: "divider", borderRadius: 3,
        position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default",
        transition: "all .2s",
        "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: color, borderRadius: "12px 12px 0 0" },
        "&:hover": onClick ? { boxShadow: `0 8px 28px ${alpha(color, 0.2)}`, transform: "translateY(-2px)" } : {},
      }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem" }}>
              {label}
            </Typography>
            {loading
              ? <Box sx={{ width: 60, height: 36, bgcolor: "action.hover", borderRadius: 1, mt: 0.5 }} />
              : <Typography variant="h4" sx={{ fontWeight: 900, color, lineHeight: 1.1, mt: 0.5 }}>{value ?? 0}</Typography>}
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.2)}` }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Permission Badge ─────────────────────────────────────────────────────────
function PermBadge({ label, granted }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.8, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: granted ? "#059669" : "#dc2626", flexShrink: 0 }} />
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{label}</Typography>
      <Chip size="small" label={granted ? "Allowed" : "Restricted"}
        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700,
          bgcolor: granted ? alpha("#059669", 0.1) : alpha("#dc2626", 0.1),
          color: granted ? "#059669" : "#dc2626",
          border: `1px solid ${granted ? alpha("#059669", 0.3) : alpha("#dc2626", 0.3)}` }} />
    </Stack>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ViceAdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const perms = user?.permissions || {};

  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/student/fetch-with-query`),
      axios.get(`${baseUrl}/teacher/fetch-with-query`),
      axios.get(`${baseUrl}/class/fetch-all`),
      axios.get(`${baseUrl}/subject/fetch-all`),
    ])
      .then(([students, teachers, classes, subjects]) => {
        setStats({
          students: students.data.data?.length ?? 0,
          teachers: teachers.data.data?.length ?? 0,
          classes:  classes.data.data?.length  ?? 0,
          subjects: subjects.data.data?.length ?? 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: "Students",    value: stats?.students, color: "#2563b0", icon: <GroupsIcon sx={{ fontSize: 20, color: "#2563b0" }} />, permKey: "canManageStudents", link: "/vice-admin/students" },
    { label: "Teachers",    value: stats?.teachers, color: "#7c3aed", icon: <SchoolIcon  sx={{ fontSize: 20, color: "#7c3aed" }} />, permKey: "canManageTeachers", link: "/vice-admin/teachers" },
    { label: "Classes",     value: stats?.classes,  color: "#0891b2", icon: <ClassIcon   sx={{ fontSize: 20, color: "#0891b2" }} />, permKey: "canManageClasses",  link: "/vice-admin/classes" },
    { label: "Subjects",    value: stats?.subjects, color: "#059669", icon: <MenuBookIcon sx={{ fontSize: 20, color: "#059669" }} />, permKey: "canManageClasses",  link: "/vice-admin/subjects" },
  ];

  const PERM_LABELS = {
    canManageStudents:   "Manage Students",
    canManageTeachers:   "Manage Teachers",
    canManageClasses:    "Manage Classes & Subjects",
    canManageFees:       "Manage Fees",
    canManageAttendance: "Manage Attendance",
    canManageExams:      "Manage Examinations",
    canManageNotices:    "Manage Notices",
    canViewReports:      "View Reports",
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#1e3a5f", letterSpacing: -0.5 }}>
            Welcome, {user?.name?.split(" ")[0] || "Vice Admin"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.school_name} · Vice Admin Dashboard
          </Typography>
        </Box>
        <Chip label="Vice Admin" sx={{ fontWeight: 800, bgcolor: alpha("#2563b0", 0.1), color: "#2563b0", border: `1px solid ${alpha("#2563b0", 0.3)}` }} />
      </Stack>

      {/* Stat Cards */}
      <Grid container spacing={2} mb={3}>
        {STAT_CARDS.map((s) => {
          const allowed = perms[s.permKey] !== false;
          return (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              {allowed
                ? <StatCard {...s} loading={loading} onClick={() => navigate(s.link)} />
                : (
                  <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, opacity: 0.5 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LockIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                        <Typography variant="body2" color="text.disabled" fontWeight={600}>{s.label} — Restricted</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={2}>
        {/* Permissions Card */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: alpha("#2563b0", 0.04) }}>
              <Typography variant="h6" fontWeight={800}>My Permissions</Typography>
              <Typography variant="caption" color="text.secondary">Access rights assigned by school admin</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {Object.entries(PERM_LABELS).map(([key, label]) => (
                <PermBadge key={key} label={label} granted={perms[key] !== false} />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: alpha("#2563b0", 0.04) }}>
              <Typography variant="h6" fontWeight={800}>Quick Access</Typography>
              <Typography variant="caption" color="text.secondary">Navigate to your allowed sections</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={1.5}>
                {[
                  { label: "Attendance",   icon: <ChecklistIcon />, color: "#0891b2", link: "/vice-admin/attendance", perm: "canManageAttendance" },
                  { label: "Examinations", icon: <GradingIcon />,   color: "#7c3aed", link: "/vice-admin/exams",      perm: "canManageExams" },
                  { label: "Notice Board", icon: <CampaignIcon />,  color: "#d97706", link: "/vice-admin/notice",     perm: "canManageNotices" },
                ].map((item) => {
                  const allowed = perms[item.perm] !== false;
                  return (
                    <Grid item xs={12} sm={4} key={item.label}>
                      <Box
                        onClick={() => allowed && navigate(item.link)}
                        sx={{
                          p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                          cursor: allowed ? "pointer" : "not-allowed",
                          opacity: allowed ? 1 : 0.45,
                          transition: "all .2s",
                          "&:hover": allowed ? { bgcolor: alpha(item.color, 0.06), borderColor: alpha(item.color, 0.3), transform: "translateY(-2px)" } : {},
                        }}>
                        <Avatar sx={{ bgcolor: alpha(item.color, 0.12), color: item.color, width: 44, height: 44 }}>
                          {item.icon}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} textAlign="center">{item.label}</Typography>
                        {!allowed && <Chip size="small" label="Restricted" sx={{ height: 18, fontSize: "0.65rem", bgcolor: alpha("#dc2626", 0.1), color: "#dc2626" }} />}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
