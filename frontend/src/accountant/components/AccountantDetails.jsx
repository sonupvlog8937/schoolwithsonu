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
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const PRINT_CSS = `@media print { body * { visibility: hidden !important; } #profile-print, #profile-print * { visibility: visible !important; } #profile-print { position: fixed; inset: 0; padding: 32px; background: #fff; } .no-print { display: none !important; } }`;

const InfoRow = ({ icon, label, value, copyable, onCopy }) => (
  <Box sx={{ display: "flex", alignItems: "center", px: { xs: 2, md: 3 }, py: 1.5, borderBottom: "1px solid #F1F5F9", "&:last-of-type": { borderBottom: "none" }, gap: 2, "&:hover": { background: "#FAFBFF" }, transition: "background 0.15s" }}>
    <Box sx={{ width: 36, height: 36, borderRadius: 2, flexShrink: 0, background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366F1" }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10, display: "block" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 600, color: "#1E293B", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</Typography>
    </Box>
    {copyable && value && (
      <Tooltip title="Copy" arrow>
        <IconButton size="small" onClick={() => onCopy(value)} className="no-print" sx={{ color: "#94A3B8", p: 0.75, "&:hover": { color: "#6366F1", background: "#EEF2FF" } }}>
          <ContentCopyIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

export default function AccountantDetails() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "" });

  useEffect(() => {
    const s = document.createElement("style"); s.innerHTML = PRINT_CSS; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    axios.get(`${baseUrl}/accountant/details`)
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (val) => navigator.clipboard.writeText(val).then(() => setSnack({ open: true, msg: `Copied: ${val}` }));
  const initials = data?.name ? data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AC";

  if (loading) return (
    <Box sx={{ px: { xs: 1.5, md: 3 }, py: 3, maxWidth: 900, mx: "auto" }}>
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E0E7FF", overflow: "hidden" }}>
        <Skeleton variant="rectangular" height={120} />
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, mt: -5, mb: 3 }}>
            <Skeleton variant="circular" width={100} height={100} />
            <Box sx={{ flex: 1, pb: 1 }}><Skeleton width="50%" height={28} sx={{ mb: 0.5 }} /><Skeleton width="30%" height={18} /></Box>
          </Box>
          {[1,2,3,4].map((i) => <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 2 }} />)}
        </Box>
      </Paper>
    </Box>
  );

  if (!data) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Box sx={{ textAlign: "center" }}>
        <BadgeOutlinedIcon sx={{ fontSize: 56, color: "#CBD5E1", mb: 1 }} />
        <Typography sx={{ fontWeight: 700, color: "#94A3B8" }}>No data found.</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 }, background: "#F8FAFF", minHeight: "100vh" }}>
      <Box id="profile-print" sx={{ maxWidth: 860, mx: "auto" }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E0E7FF", overflow: "hidden", mb: 2 }}>
          {/* Banner */}
          <Box sx={{ height: { xs: 100, md: 130 }, background: "linear-gradient(135deg,#0891B2 0%,#6366F1 50%,#8B5CF6 100%)", position: "relative" }}>
            <Box sx={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <Tooltip title="Print Profile" arrow>
              <IconButton className="no-print" onClick={() => window.print()} sx={{ position: "absolute", top: 12, right: 12, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.15)", "&:hover": { background: "rgba(255,255,255,0.25)" } }}>
                <PrintIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Avatar + Name */}
          <Box sx={{ px: { xs: 2, md: 3 }, pb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-end" }, gap: { xs: 1, sm: 2 }, mt: { xs: "-50px", md: "-56px" } }}>
            <Avatar sx={{ width: { xs: 96, md: 110 }, height: { xs: 96, md: 110 }, fontSize: { xs: 32, md: 38 }, fontWeight: 800, background: "linear-gradient(135deg,#0891B2,#6366F1)", border: "4px solid #fff", boxShadow: "0 4px 20px rgba(8,145,178,0.25)" }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, pb: { sm: 1 }, textAlign: { xs: "center", sm: "left" } }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 }, color: "#1E1B4B", lineHeight: 1.2 }}>{data.name}</Typography>
              <Stack direction="row" spacing={1} mt={0.75} justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap" gap={0.75}>
                <Chip label="Accountant" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg,#0891B2,#6366F1)", color: "#fff" }} />
                {data.qualification && <Chip label={data.qualification} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#15803D", border: "1.5px solid #4ADE80" }} />}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "#F1F5F9" }} />

          <Box>
            <InfoRow icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />} label="Full Name" value={data.name} copyable onCopy={handleCopy} />
            <InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />} label="Email" value={data.email} copyable onCopy={handleCopy} />
            <InfoRow icon={<PhoneIcon sx={{ fontSize: 18 }} />} label="Phone" value={data.phone} copyable onCopy={handleCopy} />
            <InfoRow icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />} label="Qualification" value={data.qualification} />
            <InfoRow icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />} label="Salary" value={data.salary ? `₹${data.salary}` : null} />
            <InfoRow icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />} label="School" value={data.school?.school_name} />
          </Box>
        </Paper>

        <Grid container spacing={{ xs: 1, md: 1.5 }} className="no-print">
          {[
            { label: "Qualification", value: data.qualification || "N/A", color: "#0891B2", bg: "#ECFEFF" },
            { label: "Experience",    value: data.experience    || "N/A", color: "#6366F1", bg: "#EEF2FF" },
            { label: "Salary",        value: data.salary ? `₹${data.salary}` : "N/A", color: "#059669", bg: "#F0FDF4" },
          ].map((s) => (
            <Grid item xs={4} key={s.label}>
              <Paper elevation={0} sx={{ p: { xs: 1.25, md: 2 }, borderRadius: 3, border: "1px solid #E8EAFF", background: s.bg, textAlign: "center" }}>
                <Typography sx={{ fontWeight: 800, color: s.color, fontSize: { xs: 14, md: 18 }, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: 9, md: 11 } }}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={2000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setSnack((p) => ({ ...p, open: false }))} sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
