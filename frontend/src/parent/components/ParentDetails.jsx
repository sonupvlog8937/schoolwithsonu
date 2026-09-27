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
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import HomeIcon from "@mui/icons-material/Home";

const PRINT_CSS = `@media print { body * { visibility: hidden !important; } #profile-print, #profile-print * { visibility: visible !important; } #profile-print { position: fixed; inset: 0; padding: 32px; background: #fff; } .no-print { display: none !important; } }`;

const InfoRow = ({ icon, label, value, copyable, onCopy }) => (
  <Box sx={{ display: "flex", alignItems: "center", px: { xs: 2, md: 3 }, py: 1.5, borderBottom: "1px solid #F1F5F9", "&:last-of-type": { borderBottom: "none" }, gap: 2, "&:hover": { background: "#FAFBFF" }, transition: "background 0.15s" }}>
    <Box sx={{ width: 36, height: 36, borderRadius: 2, flexShrink: 0, background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10, display: "block" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 600, color: "#1E293B", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</Typography>
    </Box>
    {copyable && value && (
      <Tooltip title="Copy" arrow>
        <IconButton size="small" onClick={() => onCopy(value)} className="no-print" sx={{ color: "#94A3B8", p: 0.75, "&:hover": { color: "#F59E0B", background: "#FEF3C7" } }}>
          <ContentCopyIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

export default function ParentDetails() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "" });

  useEffect(() => {
    const s = document.createElement("style"); s.innerHTML = PRINT_CSS; document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    axios.get(`${baseUrl}/parent/details`)
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (val) => navigator.clipboard.writeText(val).then(() => setSnack({ open: true, msg: `Copied: ${val}` }));
  const initials = data?.name ? data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "PA";

  if (loading) return (
    <Box sx={{ px: { xs: 1.5, md: 3 }, py: 3, maxWidth: 900, mx: "auto" }}>
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #FDE68A", overflow: "hidden" }}>
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
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 }, background: "#FFFBEB", minHeight: "100vh" }}>
      <Box id="profile-print" sx={{ maxWidth: 860, mx: "auto" }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #FDE68A", overflow: "hidden", mb: 2 }}>
          {/* Banner */}
          <Box sx={{ height: { xs: 100, md: 130 }, background: "linear-gradient(135deg,#F59E0B 0%,#F97316 50%,#EF4444 100%)", position: "relative" }}>
            <Box sx={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <Tooltip title="Print Profile" arrow>
              <IconButton className="no-print" onClick={() => window.print()} sx={{ position: "absolute", top: 12, right: 12, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.15)", "&:hover": { background: "rgba(255,255,255,0.25)" } }}>
                <PrintIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Avatar + Name */}
          <Box sx={{ px: { xs: 2, md: 3 }, pb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-end" }, gap: { xs: 1, sm: 2 }, mt: { xs: "-50px", md: "-56px" } }}>
            <Avatar sx={{ width: { xs: 96, md: 110 }, height: { xs: 96, md: 110 }, fontSize: { xs: 32, md: 38 }, fontWeight: 800, background: "linear-gradient(135deg,#F59E0B,#F97316)", border: "4px solid #fff", boxShadow: "0 4px 20px rgba(245,158,11,0.25)" }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, pb: { sm: 1 }, textAlign: { xs: "center", sm: "left" } }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 }, color: "#1E1B4B", lineHeight: 1.2 }}>{data.name}</Typography>
              <Stack direction="row" spacing={1} mt={0.75} justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap" gap={0.75}>
                <Chip label="Parent" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg,#F59E0B,#F97316)", color: "#fff" }} />
                {data.relation && <Chip label={data.relation} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, background: "#FEF3C7", color: "#92400E", border: "1.5px solid #FCD34D" }} />}
                {data.children?.length > 0 && <Chip label={`${data.children.length} ${data.children.length === 1 ? 'Child' : 'Children'}`} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 700, background: "#DBEAFE", color: "#1E40AF", border: "1.5px solid #60A5FA" }} />}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "#F1F5F9" }} />

          <Box>
            <InfoRow icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />} label="Full Name" value={data.name} copyable onCopy={handleCopy} />
            <InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />} label="Email" value={data.email} copyable onCopy={handleCopy} />
            <InfoRow icon={<PhoneIcon sx={{ fontSize: 18 }} />} label="Phone" value={data.phone} copyable onCopy={handleCopy} />
            <InfoRow icon={<HomeIcon sx={{ fontSize: 18 }} />} label="Address" value={data.address} />
            <InfoRow icon={<WorkOutlineIcon sx={{ fontSize: 18 }} />} label="Occupation" value={data.occupation} />
            <InfoRow icon={<FamilyRestroomIcon sx={{ fontSize: 18 }} />} label="Relation" value={data.relation} />
            <InfoRow icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />} label="School" value={data.school?.school_name} />
          </Box>
        </Paper>

        <Grid container spacing={{ xs: 1, md: 1.5 }} className="no-print">
          {[
            { label: "Occupation", value: data.occupation || "N/A", color: "#F59E0B", bg: "#FEF3C7" },
            { label: "Relation",   value: data.relation   || "N/A", color: "#F97316", bg: "#FFEDD5" },
            { label: "Children",   value: data.children?.length || 0, color: "#3B82F6", bg: "#DBEAFE" },
          ].map((s) => (
            <Grid item xs={4} key={s.label}>
              <Paper elevation={0} sx={{ p: { xs: 1.25, md: 2 }, borderRadius: 3, border: "1px solid #FDE68A", background: s.bg, textAlign: "center" }}>
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
