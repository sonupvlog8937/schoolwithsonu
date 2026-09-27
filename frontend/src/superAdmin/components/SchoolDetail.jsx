import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Paper, Typography, Stack, Avatar, Chip, CircularProgress,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Snackbar, Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { baseUrl } from "../../environment";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StaffTable({ data, columns }) {
  if (!data?.length) return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary">No records found</Typography>
    </Box>
  );
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: alpha("#1a3c6e", 0.04) }}>
            {columns.map((c) => (
              <TableCell key={c} sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>{c}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row._id} hover>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: alpha("#1a3c6e", 0.12), color: "#1a3c6e", fontSize: 12, fontWeight: 800 }}>
                    {row.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                </Stack>
              </TableCell>
              <TableCell><Typography variant="caption">{row.email}</Typography></TableCell>
              <TableCell><Typography variant="caption">{row.phone || "—"}</Typography></TableCell>
              <TableCell><Typography variant="caption">{fmtDate(row.createdAt)}</Typography></TableCell>
              <TableCell>
                <Chip label={row.status || "Active"} size="small" color={row.status === "Inactive" ? "error" : "success"} sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function SchoolDetail() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [school, setSchool]   = useState(null);
  const [staff, setStaff]     = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState(0);
  const [snack, setSnack]     = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    Promise.all([
      axios.get(`${baseUrl}/super-admin/schools/${schoolId}`),
      axios.get(`${baseUrl}/super-admin/schools/${schoolId}/staff`),
      axios.get(`${baseUrl}/super-admin/schools/${schoolId}/students`),
    ])
      .then(([s, st, stu]) => { setSchool(s.data.data); setStaff(st.data.data); setStudents(stu.data.data || []); })
      .catch(() => setSnack({ open: true, msg: "Failed to load school data", sev: "error" }))
      .finally(() => setLoading(false));
  }, [schoolId]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><CircularProgress /></Box>;
  if (!school) return <Box sx={{ p: 3 }}><Typography color="error">School not found</Typography></Box>;

  const TABS = [
    { label: `Teachers (${staff?.teachers?.length ?? 0})`,      icon: <PeopleAltIcon sx={{ fontSize: 16 }} /> },
    { label: `Students (${students?.length ?? 0})`,             icon: <GroupsIcon sx={{ fontSize: 16 }} /> },
    { label: `Accountants (${staff?.accountants?.length ?? 0})`,icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} /> },
    { label: `Librarians (${staff?.librarians?.length ?? 0})`,  icon: <LocalLibraryIcon sx={{ fontSize: 16 }} /> },
    { label: `Receptionists (${staff?.receptionists?.length ?? 0})`, icon: <SupportAgentIcon sx={{ fontSize: 16 }} /> },
    { label: `Vice Admins (${staff?.viceAdmins?.length ?? 0})`, icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} /> },
  ];

  const STAFF_COLS = ["Name", "Email", "Phone", "Joined", "Status"];

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/super-admin/schools")}
        sx={{ mb: 2, textTransform: "none", fontWeight: 700, color: "#1a3c6e" }}>
        Back to Schools
      </Button>

      {/* School Info Card */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden", mb: 3 }}>
        <Box sx={{ height: 100, background: "linear-gradient(135deg,#1a3c6e,#2563b0)", position: "relative" }}>
          <Box sx={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        </Box>
        <Box sx={{ px: 3, pb: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-end" }, gap: 2, mt: "-48px" }}>
          <Avatar sx={{ width: 90, height: 90, bgcolor: alpha("#1a3c6e", 0.15), color: "#1a3c6e", fontSize: 32, fontWeight: 800, border: "4px solid #fff", boxShadow: "0 4px 20px rgba(26,60,110,0.2)" }}>
            {school.school_name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, pb: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h5" fontWeight={900} sx={{ color: "#1a1a2e" }}>{school.school_name}</Typography>
            <Stack direction="row" spacing={1} mt={0.5} justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap" gap={0.5}>
              <Chip label={school.email} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} />
              <Chip label={`Owner: ${school.owner_name}`} size="small" sx={{ height: 22, fontSize: "0.72rem", bgcolor: alpha("#1a3c6e", 0.08), color: "#1a3c6e" }} />
              <Chip label={`Registered: ${fmtDate(school.createdAt)}`} size="small" sx={{ height: 22, fontSize: "0.72rem" }} />
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Staff Tabs */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: alpha("#1a3c6e", 0.02) }}>
          {TABS.map((t, i) => (
            <Tab key={i} label={<Stack direction="row" alignItems="center" spacing={0.5}>{t.icon}<span>{t.label}</span></Stack>}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.82rem" }} />
          ))}
        </Tabs>

        {tab === 0 && <StaffTable data={staff?.teachers} columns={STAFF_COLS} />}
        {tab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha("#1a3c6e", 0.04) }}>
                  {["Name", "Email", "Roll No", "Class", "Joined"].map((c) => (
                    <TableCell key={c} sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>{c}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No students found</Typography></TableCell></TableRow>
                ) : students.map((s) => (
                  <TableRow key={s._id} hover>
                    <TableCell><Stack direction="row" alignItems="center" spacing={1}><Avatar sx={{ width: 28, height: 28, bgcolor: alpha("#2563b0", 0.12), color: "#2563b0", fontSize: 12, fontWeight: 800 }}>{s.name?.[0]?.toUpperCase()}</Avatar><Typography variant="body2" fontWeight={600}>{s.name}</Typography></Stack></TableCell>
                    <TableCell><Typography variant="caption">{s.email}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{s.roll_number || "—"}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{s.student_class?.class_text || "—"}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{fmtDate(s.createdAt)}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 2 && <StaffTable data={staff?.accountants} columns={STAFF_COLS} />}
        {tab === 3 && <StaffTable data={staff?.librarians} columns={STAFF_COLS} />}
        {tab === 4 && <StaffTable data={staff?.receptionists} columns={STAFF_COLS} />}
        {tab === 5 && <StaffTable data={staff?.viceAdmins} columns={STAFF_COLS} />}
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((p) => ({ ...p, open: false }))} sx={{ borderRadius: 3, fontWeight: 700 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
