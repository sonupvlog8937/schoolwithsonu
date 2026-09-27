/* eslint-disable react/prop-types */

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

// ── Icons (inline SVG to avoid extra deps) ──────────────────────────────────
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconGender = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M12 12v8M9 18h6" />
  </svg>
);
const IconClass = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconID = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const formatAadharDisplay = (raw) => {
  const s = String(raw || "").replace(/\D/g, "");
  if (s.length !== 12) return raw?.trim() || null;
  return `${s.slice(0, 4)} ${s.slice(4, 8)} ${s.slice(8, 12)}`;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getImageSrc = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  return `/images/uploaded/student/${imagePath}`;
};

const convertDate = (dateData) => {
  if (!dateData) return "N/A";
  const date = new Date(dateData);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  ["#fff3e0", "#e65100"],
  ["#e3f2fd", "#1565c0"],
  ["#e8f5e9", "#2e7d32"],
  ["#fce4ec", "#880e4f"],
  ["#ede7f6", "#4527a0"],
];
const getAvatarColor = (name = "") => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

// ── InfoRow ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, action, multiline }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: multiline ? "flex-start" : "center",
      gap: 1,
      py: 0.6,
      borderBottom: "1px solid",
      borderColor: "divider",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box
      sx={{
        color: "text.secondary",
        display: "flex",
        alignItems: "center",
        minWidth: 18,
        flexShrink: 0,
        pt: multiline ? 0.25 : 0,
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="caption"
      sx={{ color: "text.secondary", minWidth: 94, flexShrink: 0, fontWeight: 500 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "text.primary",
        fontWeight: 500,
        flex: 1,
        ...(multiline
          ? { whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.45 }
          : { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }),
      }}
    >
      {value || "N/A"}
    </Typography>
    {action}
  </Box>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function StudentCardAdmin({ handleEdit, student, handleDelete }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const imageSrc = getImageSrc(student.student_image);
  const initials = getInitials(student.name);
  const [bgColor, textColor] = getAvatarColor(student.name);

  const handleCopyPhone = () => {
    if (student.guardian_phone) {
      navigator.clipboard.writeText(student.guardian_phone).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      handleDelete(student._id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const genderColor =
    student.gender?.toLowerCase() === "male"
      ? { bg: "#e3f2fd", text: "#1565c0" }
      : student.gender?.toLowerCase() === "female"
      ? { bg: "#fce4ec", text: "#880e4f" }
      : { bg: "#f5f5f5", text: "#616161" };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 360 },
        margin: "8px",
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "visible",
        position: "relative",
        transition: "box-shadow 0.25s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* ── Top Banner + Avatar ── */}
      <Box
        sx={{
          height: 72,
          background: "linear-gradient(135deg, #FF6B00 0%, #FF9A00 100%)",
          borderRadius: "14px 14px 0 0",
          position: "relative",
        }}
      >
        {/* Roll number badge */}
        {student.roll_number && (
          <Chip
            label={`Roll #${student.roll_number}`}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 10,
              bgcolor: "rgba(255,255,255,0.22)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 11,
              height: 22,
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* Avatar */}
        <Box
          sx={{
            position: "absolute",
            bottom: -36,
            left: 16,
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "3px solid #fff",
            overflow: "hidden",
            bgcolor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          }}
        >
          {imageSrc && !imgError ? (
            <>
              {!imgLoaded && (
                <Skeleton variant="circular" width={72} height={72} />
              )}
              <Box
                component="img"
                src={imageSrc}
                alt={student.name}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: imgLoaded ? "block" : "none",
                }}
              />
            </>
          ) : (
            <Typography
              sx={{ fontSize: 24, fontWeight: 700, color: textColor }}
            >
              {initials}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Card Content ── */}
      <CardContent sx={{ pt: "44px", px: 2, pb: 0 }}>
        {/* Name + Gender chip */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}
            >
              {student.name}
            </Typography>
            {student.student_class?.class_text && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {student.student_class.class_text}
              </Typography>
            )}
          </Box>
          {student.gender && (
            <Chip
              icon={<span style={{ color: genderColor.text, marginLeft: 6, display:"flex" }}><IconGender /></span>}
              label={student.gender}
              size="small"
              sx={{
                bgcolor: genderColor.bg,
                color: genderColor.text,
                fontWeight: 600,
                fontSize: 11,
                height: 22,
                mt: 0.3,
              }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Info rows */}
        <Box>
          <InfoRow icon={<IconID />} label="Roll Number" value={student.roll_number} />
          <InfoRow icon={<IconMapPin />} label="Address" value={student.address} multiline />
          <InfoRow icon={<IconID />} label="Aadhar" value={formatAadharDisplay(student.aadhar_number)} />
          <InfoRow icon={<IconClass />} label="Class" value={student.student_class?.class_text} />
          <InfoRow icon={<IconUser />} label="Age" value={student.age ? `${student.age} yrs` : null} />
          <InfoRow icon={<IconUser />} label="Guardian" value={student.guardian} />
          <InfoRow
            icon={<IconPhone />}
            label="Guardian Phone"
            value={student.guardian_phone}
            action={
              student.guardian_phone ? (
                <Tooltip title={copied ? "Copied!" : "Copy number"}>
                  <IconButton
                    size="small"
                    onClick={handleCopyPhone}
                    sx={{
                      color: copied ? "success.main" : "text.secondary",
                      p: 0.4,
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {copied ? <IconCheck /> : <IconCopy />}
                  </IconButton>
                </Tooltip>
              ) : null
            }
          />
          <InfoRow
            icon={<IconCalendar />}
            label="Admitted On"
            value={convertDate(student.createdAt)}
          />
        </Box>
      </CardContent>

      {/* ── Actions ── */}
      <CardActions
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1.5,
          gap: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          mt: 1.5,
          justifyContent: "space-between",
        }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<IconEdit />}
          onClick={() => handleEdit(student._id)}
          sx={{
            flex: 1,
            borderColor: "divider",
            color: "text.primary",
            fontWeight: 600,
            fontSize: 12,
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              borderColor: "#FF6B00",
              color: "#FF6B00",
              bgcolor: "#fff8f3",
            },
          }}
        >
          Edit
        </Button>

        <Button
          size="small"
          variant="contained"
          startIcon={<IconTrash />}
          onClick={handleDeleteClick}
          sx={{
            flex: 1,
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: 12,
            textTransform: "none",
            boxShadow: "none",
            bgcolor: confirmDelete ? "#b71c1c" : "#ef5350",
            "&:hover": {
              bgcolor: "#b71c1c",
              boxShadow: "none",
            },
            transition: "background-color 0.2s ease",
          }}
        >
          {confirmDelete ? "Confirm?" : "Delete"}
        </Button>
      </CardActions>
    </Card>
  );
}