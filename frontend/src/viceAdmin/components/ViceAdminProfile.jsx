import { Avatar, Box, Chip, Divider, IconButton, Paper, Skeleton, Snackbar, Alert, Stack, Tooltip, Typography, Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../environment";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkIcon from "@mui/icons-material/Work";
import { alpha } from "@mui/material/styles";

const PRINT_CSS = `@media print { body * { visibility: hidden !important; } #profile-print, #profile-print * { visibility: visible !important; } #profile-print { position: fixed; inset: 0; padding: 32px; background: #fff; } .no-print { display: none !important; } }`;

const InfoRow = ({ icon, label, value, copyable, onCopy }) => (
  <Box sx={{ display: "flex", alignItems: "center", px: { xs: 2, md: 3 }, py: 1.5, borderBottom: "1px solid #F1F5F9", "&:last-of-type": { borderBottom: "none" }, gap: 2, "&:hover": { background: "#FAFBFF" } }}>
    <Box sx={{ width: 36, height: 36, borderRadius: 2, flexShrink: 0, background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563b0" }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10, display: "block" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 600, color: "#1E293B", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</Typography>
    </Box>
    {copyable && value && (<Tooltip title="Copy" arrow><IconButton size="small" onClick={() => onCopy(value)} className="no-print" sx={{ color: "#94A3B8", p: 0.75, "&:hover": { color: "#2563b0", background: "#dbeafe" } }}><ContentCopyIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>)}
  </Box>
);

const PERM_LABELS = {
  canManageStudents:   "Manage Students",
  canManageTeachers:   "Manage Teachers",
  canManageClasses:    "Manage Classes",
  canManageFees:       "Manage Fees",
  canManageAttendance: "Manage Attendance",
  canManageExams:      "Manage Exams",
  canManageNotices:    "Manage Notices",
  canViewReports:      "View Reports",
};

export default function ViceAdminProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "" });

  useEffect(() => { const s = document.createElement("style"); s.innerHTML = PRINT_CSS; document.head.appendChild(s); return () => document.head.removeChild(s); }, []);
  useEffect(() => { axios.get(`${baseUrl}/vice-admin/me`).then((r) => setData(r.data.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleCopy = (val) => navigator.clipboard.writeText(val).then(() => setSnack({ open: true, msg: `Copied: ${val}` }));
  const initials = data?.name ? data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "VA";

  if (loading) return (
    <Box sx={{ px: { xs: 1.5, md: 3 }, py: 3, maxWidth: 900, mx: "auto" }}>
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E0E7FF", overflow: "hidden" }}>
        <Skeleton variant="rectangular" height={130} />
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, mt: -5, mb: 3 }}>
            <Skeleton variant="circular" width={100} height={100} />
            <Box sx={{ flex: 1, pb: 1 }}><Skeleton width="50%" height={28} sx={{ mb: 0.5 }} /><Skeleton width="30%" height={18} /></Box>
          </Box>
          {[1,2,3,4,5].map((i) => <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 2 }} />)}
        </Box>
      </Paper>
    </Box>
  );

  if (!data) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Box sx={{ textAlign: "center" }}><BadgeOutlinedIcon sx={{ fontSize: 56, color: "#CBD5E1", mb: 1 }} /><Typography sx={{ fontWeight: 700, color: "#94A3B8" }}>No data found.</Typography></Box>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 }, background: "#F8FAFF", minHeight: "100vh" }}>
      <Box id="profile-print" sx={{ maxWidth: 860, mx: "auto" }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #dbeafe", overflow: "hidden", mb: 2 }}>
          {/* Banner */}
          <Box sx={{ height: { xs: 100, md: 130 }, background: "linear-gradient(135deg,#1e3a5f 0%,#2563b0 50%,#3b82f6 100%)", position: "relative" }}>
            <Box sx={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <Tooltip title="Print Profile" arrow>
              <IconButton className="no-print" onClick={() => window.print()} sx={{ position: "absolute", top: 12, right: 12, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.15)", "&:hover": { background: "rgba(255,255,255,0.25)" } }}>
                <PrintIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Avatar + Name */}
          <Box sx={{ px: { xs: 2, md: 3 }, pb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-end" }, gap: { xs: 1, sm: 2 }, mt: { xs: "-50px", md: "-56px" } }}>
            <Avatar sx={{ width: { xs: 96, md: 110 }, height: { xs: 96, md: 110 }, fontSize: { xs: 32, md: 38 }, fontWeight: 800, background: "linear-gradient(135deg,#1e3a5f,#2563b0)", border: "4px solid #fff", boxShadow: "0 4px 20px rgba(37,99,176,0.3)" }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, pb: { sm: 1 }, textAlign: { xs: "center", sm: "left" } }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 }, color: "#1E1B4B", lineHeight: 1.2 }}>{data.name}</Typography>
              <Stack direction="row" spacing={1} mt={0.75} justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap" gap={0.75}>
                <Chip label="Vice Admin" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg,#1e3a5f,#2563b0)", color: "#fff" }} />
                <Chip label={data.status} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, bgcolor: data.status === "Active" ? alpha("#059669", 0.1) : alpha("#dc2626", 0.1), color: data.status === "Active" ? "#059669" : "#dc2626", border: `1px solid ${data.status === "Active" ? alpha("#059669", 0.3) : alpha("#dc2626", 0.3)}` }} />
                {data.qualification && <Chip label={data.qualification} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#15803D", border: "1.5px solid #4ADE80" }} />}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "#dbeafe" }} />

          <Box>
            <InfoRow icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />} label="Full Name" value={data.name} copyable onCopy={handleCopy} />
            <InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />} label="Email" value={data.email} copyable onCopy={handleCopy} />
            <InfoRow icon={<PhoneIcon sx={{ fontSize: 18 }} />} label="Phone" value={data.phone} copyable onCopy={handleCopy} />
            <InfoRow icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />} label="Qualification" value={data.qualification} />
            <InfoRow icon={<WorkIcon sx={{ fontSize: 18 }} />} label="Experience" value={data.experience} />
            <InfoRow icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />} label="School" value={data.school?.school_name} />
          </Box>
        </Paper>

        {/* Permissions */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #dbeafe", overflow: "hidden" }}>
          <Box sx={{ p: 2.5, borderBottom: "1px solid #dbeafe", bgcolor: alpha("#2563b0", 0.04) }}>
            <Typography variant="h6" fontWeight={800}>My Permissions</Typography>
            <Typography variant="caption" color="text.secondary">Access rights assigned by school admin</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {Object.entries(PERM_LABELS).map(([key, label]) => {
                const granted = data.permissions?.[key] !== false;
                return (
                  <Grid item xs={12} sm={6} key={key}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1, borderRadius: 2, bgcolor: granted ? alpha("#059669", 0.05) : alpha("#dc2626", 0.05) }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: granted ? "#059669" : "#dc2626", flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>{label}</Typography>
                      <Chip size="small" label={granted ? "✓" : "✗"} sx={{ height: 20, fontSize: "0.7rem", fontWeight: 800, bgcolor: granted ? alpha("#059669", 0.15) : alpha("#dc2626", 0.15), color: granted ? "#059669" : "#dc2626" }} />
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setSnack((p) => ({ ...p, open: false }))} sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
