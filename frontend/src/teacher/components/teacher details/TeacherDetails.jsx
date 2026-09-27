import {
  Avatar, Box, Chip, Divider, Grid, IconButton, Paper,
  Skeleton, Snackbar, Alert, Stack, Tooltip, Typography,
  useMediaQuery, useTheme,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";

// MUI Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

// ── Print CSS ────────────────────────────────────────────────────────────────
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #td-print, #td-print * { visibility: visible !important; }
  #td-print { position: fixed; inset: 0; padding: 32px; background: #fff; }
  .no-print { display: none !important; }
}
`;

// ── Info Row component ───────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, copyable, onCopy }) => (
  <Box sx={{
    display: "flex", alignItems: "center",
    px: { xs: 2, md: 3 }, py: 1.5,
    borderBottom: "1px solid #F1F5F9",
    "&:last-of-type": { borderBottom: "none" },
    gap: 2,
    "&:hover": { background: "#FAFBFF" },
    transition: "background 0.15s",
  }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: 2, flexShrink: 0,
      background: "linear-gradient(135deg,#EEF2FF,#E0E7FF)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#6366F1",
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{
        fontWeight: 700, color: "#94A3B8",
        textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10, display: "block",
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontWeight: 600, color: "#1E293B", fontSize: 14,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value || "—"}
      </Typography>
    </Box>
    {copyable && value && (
      <Tooltip title="Copy" arrow>
        <IconButton size="small" onClick={() => onCopy(value)}
          className="no-print"
          sx={{
            color: "#94A3B8", p: 0.75, flexShrink: 0,
            "&:hover": { color: "#6366F1", background: "#EEF2FF" },
            transition: "all 0.15s",
          }}>
          <ContentCopyIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

// ── Skeleton loader ──────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <Box sx={{ px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E0E7FF", overflow: "hidden" }}>
      {/* Banner skeleton */}
      <Skeleton variant="rectangular" height={120} />
      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, mt: -5, mb: 3 }}>
          <Skeleton variant="circular" width={100} height={100} />
          <Box sx={{ flex: 1, pb: 1 }}>
            <Skeleton width="50%" height={28} sx={{ mb: 0.5 }} />
            <Skeleton width="30%" height={18} />
          </Box>
        </Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 2 }} />
        ))}
      </Box>
    </Paper>
  </Box>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function TeacherDetails() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "" });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Inject print style
  useEffect(() => {
    const s = document.createElement("style");
    s.innerHTML = PRINT_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const getTeacherDetails = () => {
    setLoading(true);
    axios.get(`${baseUrl}/teacher/fetch-own`)
      .then((resp) => {
        setTeacher(resp.data.data);
      })
      .catch((e) => console.error("Error fetching teacher:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { getTeacherDetails(); }, []);

  const handleCopy = (val) => {
    navigator.clipboard.writeText(val).then(() => {
      setSnack({ open: true, msg: `Copied: ${val}` });
    });
  };

  // Derive initials for avatar fallback
  const initials = teacher?.name
    ? teacher.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "T";

  // Gender badge color
  const genderColor = teacher?.gender?.toLowerCase() === "female"
    ? { bg: "#FDF4FF", text: "#A21CAF", border: "#E879F9" }
    : teacher?.gender?.toLowerCase() === "male"
    ? { bg: "#EFF6FF", text: "#1D4ED8", border: "#60A5FA" }
    : { bg: "#F8FAFC", text: "#475569", border: "#94A3B8" };

  if (loading) return <ProfileSkeleton />;

  if (!teacher) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Box sx={{ textAlign: "center" }}>
        <BadgeOutlinedIcon sx={{ fontSize: 56, color: "#CBD5E1", mb: 1 }} />
        <Typography sx={{ fontWeight: 700, color: "#94A3B8" }}>No teacher data found.</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      px: { xs: 1.5, sm: 2, md: 3 },
      py: { xs: 2, md: 3 },
      background: "#F8FAFF",
      minHeight: "100vh",
    }}>
      <Box id="td-print" sx={{ maxWidth: 860, mx: "auto" }}>

        {/* ── Profile Card ── */}
        <Paper elevation={0} sx={{
          borderRadius: 4,
          border: "1px solid #E0E7FF",
          overflow: "hidden",
          mb: 2,
        }}>

          {/* Banner */}
          <Box sx={{
            height: { xs: 100, md: 130 },
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
            position: "relative",
          }}>
            {/* Decorative circles */}
            <Box sx={{
              position: "absolute", right: -30, top: -30,
              width: 160, height: 160, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }} />
            <Box sx={{
              position: "absolute", right: 60, top: 40,
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }} />
            {/* Print button */}
            <Tooltip title="Print Profile" arrow>
              <IconButton
                className="no-print"
                onClick={() => window.print()}
                sx={{
                  position: "absolute", top: 12, right: 12,
                  color: "rgba(255,255,255,0.85)",
                  background: "rgba(255,255,255,0.15)",
                  "&:hover": { background: "rgba(255,255,255,0.25)" },
                  backdropFilter: "blur(4px)",
                }}
              >
                <PrintIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Avatar + Name row */}
          <Box sx={{
            px: { xs: 2, md: 3 },
            pb: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "flex-end" },
            gap: { xs: 1, sm: 2 },
            mt: { xs: "-50px", md: "-56px" },
          }}>
            {/* Avatar */}
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              {!imgError && teacher.teacher_image ? (
                <Box
                  component="img"
                  src={`/images/uploaded/teacher/${teacher.teacher_image}`}
                  alt={teacher.name}
                  onError={() => setImgError(true)}
                  sx={{
                    width: { xs: 96, md: 110 },
                    height: { xs: 96, md: 110 },
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    objectFit: "cover",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
                    display: "block",
                  }}
                />
              ) : (
                <Avatar sx={{
                  width: { xs: 96, md: 110 },
                  height: { xs: 96, md: 110 },
                  fontSize: { xs: 32, md: 38 },
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                  border: "4px solid #fff",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
                }}>
                  {initials}
                </Avatar>
              )}
              {/* Online dot */}
              <Box sx={{
                position: "absolute", bottom: 6, right: 6,
                width: 14, height: 14, borderRadius: "50%",
                background: "#22C55E", border: "2px solid #fff",
              }} />
            </Box>

            {/* Name + meta */}
            <Box sx={{
              flex: 1, pb: { sm: 1 },
              textAlign: { xs: "center", sm: "left" },
            }}>
              <Stack direction="row" alignItems="center"
                justifyContent={{ xs: "center", sm: "flex-start" }}
                spacing={1} sx={{ flexWrap: "wrap" }}>
                <Typography sx={{
                  fontWeight: 800, fontSize: { xs: 20, md: 24 },
                  color: "#1E1B4B", lineHeight: 1.2,
                }}>
                  {teacher.name}
                </Typography>
                <VerifiedOutlinedIcon sx={{ color: "#6366F1", fontSize: 20 }} />
              </Stack>
              <Stack direction="row" spacing={1} mt={0.75}
                justifyContent={{ xs: "center", sm: "flex-start" }}
                flexWrap="wrap" gap={0.75}>
                <Chip label="Teacher" size="small" sx={{
                  height: 22, fontSize: 11, fontWeight: 700,
                  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                  color: "#fff", border: "none",
                }} />
                {teacher.gender && (
                  <Chip label={teacher.gender} size="small" sx={{
                    height: 22, fontSize: 11, fontWeight: 700,
                    background: genderColor.bg,
                    color: genderColor.text,
                    border: `1.5px solid ${genderColor.border}`,
                  }} />
                )}
                {teacher.qualification && (
                  <Chip label={teacher.qualification} size="small" sx={{
                    height: 22, fontSize: 11, fontWeight: 700,
                    background: "#F0FDF4", color: "#15803D",
                    border: "1.5px solid #4ADE80",
                  }} />
                )}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "#F1F5F9" }} />

          {/* ── Info rows ── */}
          <Box>
            <InfoRow
              icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
              label="Full Name"
              value={teacher.name}
              copyable
              onCopy={handleCopy}
            />
            <InfoRow
              icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Email Address"
              value={teacher.email}
              copyable
              onCopy={handleCopy}
            />
            <InfoRow
              icon={<CakeOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Age"
              value={teacher.age ? `${teacher.age} years` : null}
            />
            <InfoRow
              icon={<WcOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Gender"
              value={teacher.gender}
            />
            <InfoRow
              icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />}
              label="Qualification"
              value={teacher.qualification}
            />
            {/* Show subject if available */}
            {teacher.subject?.subject_name && (
              <InfoRow
                icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Subject"
                value={teacher.subject.subject_name}
              />
            )}
          </Box>
        </Paper>

        {/* ── Stats row ── */}
        <Grid container spacing={{ xs: 1, md: 1.5 }} className="no-print">
          {[
            { label: "Experience", value: teacher.experience ? `${teacher.experience} yrs` : "N/A", color: "#6366F1", bg: "#EEF2FF" },
            { label: "Age", value: teacher.age ? `${teacher.age} yrs` : "N/A", color: "#EA580C", bg: "#FFF7ED" },
            { label: "Qualification", value: teacher.qualification || "N/A", color: "#0891B2", bg: "#ECFEFF" },
          ].map((s) => (
            <Grid item xs={4} key={s.label}>
              <Paper elevation={0} sx={{
                p: { xs: 1.25, md: 2 }, borderRadius: 3,
                border: "1px solid #E8EAFF", background: s.bg,
                textAlign: "center",
              }}>
                <Typography sx={{
                  fontWeight: 800, color: s.color,
                  fontSize: { xs: 14, md: 18 }, lineHeight: 1.2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary"
                  sx={{ fontWeight: 600, fontSize: { xs: 9, md: 11 } }}>
                  {s.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Copy snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled"
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}