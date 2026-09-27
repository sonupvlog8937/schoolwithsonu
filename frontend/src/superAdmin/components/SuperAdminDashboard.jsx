import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Stack, Avatar, Paper,
  Chip, CircularProgress, Grid, Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { baseUrl } from "../../environment";

function StatCard({ label, value, icon, color, onClick, loading }) {
  return (
    <Card elevation={0} onClick={onClick}
      sx={{
        border: "1px solid", borderColor: "divider", borderRadius: 3,
        position: "relative", overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
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

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/super-admin/stats`),
      axios.get(`${baseUrl}/super-admin/schools`, { params: { limit: 6 } }),
    ])
      .then(([s, sc]) => { setStats(s.data.data); setSchools(sc.data.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { label: "Total Schools",      value: stats?.totalSchools,      color: "#1a3c6e", icon: <SchoolIcon sx={{ fontSize: 20, color: "#1a3c6e" }} />, link: "/super-admin/schools" },
    { label: "Pending Approvals",  value: stats?.pendingSchools || 0, color: "#f59e0b", icon: <SchoolIcon sx={{ fontSize: 20, color: "#f59e0b" }} />, link: "/super-admin/pending-schools" },
    { label: "Total Students",     value: stats?.totalStudents,     color: "#2563b0", icon: <GroupsIcon sx={{ fontSize: 20, color: "#2563b0" }} /> },
    { label: "Total Teachers",     value: stats?.totalTeachers,     color: "#7c3aed", icon: <PeopleAltIcon sx={{ fontSize: 20, color: "#7c3aed" }} /> },
    { label: "Accountants",        value: stats?.totalAccountants,  color: "#0891b2", icon: <AccountBalanceWalletIcon sx={{ fontSize: 20, color: "#0891b2" }} /> },
    { label: "Librarians",         value: stats?.totalLibrarians,   color: "#059669", icon: <LocalLibraryIcon sx={{ fontSize: 20, color: "#059669" }} /> },
    { label: "Receptionists",      value: stats?.totalReceptionists,color: "#d97706", icon: <SupportAgentIcon sx={{ fontSize: 20, color: "#d97706" }} /> },
    { label: "Vice Admins",        value: stats?.totalViceAdmins,   color: "#dc2626", icon: <AdminPanelSettingsIcon sx={{ fontSize: 20, color: "#dc2626" }} /> },
    { label: "Total Staff",        value: stats?.totalStaff,        color: "#6b7280", icon: <PeopleAltIcon sx={{ fontSize: 20, color: "#6b7280" }} /> },
  ];

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#dc2626", 0.1) }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 28, color: "#dc2626" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#1a1a2e", letterSpacing: -0.5 }}>Super Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">System-wide overview — all schools & staff</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} mb={3}>
        {STATS.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <StatCard {...s} loading={loading} onClick={s.link ? () => navigate(s.link) : undefined} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>Recent Schools</Typography>
            <Typography variant="caption" color="text.secondary">Latest registered schools</Typography>
          </Box>
          <Chip label="View All" clickable onClick={() => navigate("/super-admin/schools")} sx={{ fontWeight: 700 }} />
        </Box>
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
        ) : schools.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <SchoolIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No schools found</Typography>
          </Box>
        ) : schools.map((school) => (
          <Box key={school._id}
            onClick={() => navigate(`/super-admin/schools/${school._id}`)}
            sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 }, "&:hover": { bgcolor: alpha("#1a3c6e", 0.03), cursor: "pointer" }, display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: alpha("#1a3c6e", 0.12), color: "#1a3c6e", fontWeight: 800 }}>
              {school.school_name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{school.school_name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{school.email}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">{new Date(school.createdAt).toLocaleDateString("en-IN")}</Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
