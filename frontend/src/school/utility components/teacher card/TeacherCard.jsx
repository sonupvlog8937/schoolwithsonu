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

// ── Inline SVG Icons ─────────────────────────────────────────────────────────
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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
const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconGender = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M12 12v8M9 18h6" />
  </svg>
);
const IconAge = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconDegree = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconSubject = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconExp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
const getImageSrc = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  return `/images/uploaded/teacher/${imagePath}`;
};

const convertDate = (dateData) => {
  if (!dateData) return "N/A";
  return new Date(dateData).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const AVATAR_COLORS = [
  ["#e3f2fd", "#1565c0"],
  ["#e8f5e9", "#2e7d32"],
  ["#ede7f6", "#4527a0"],
  ["#e0f2f1", "#00695c"],
  ["#fbe9e7", "#bf360c"],
];
const getAvatarColor = (name = "") => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

// ── InfoRow ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, action }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      py: 0.65,
      borderBottom: "1px solid",
      borderColor: "divider",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center", minWidth: 18, flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography variant="caption" sx={{ color: "text.secondary", minWidth: 100, flexShrink: 0, fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: "text.primary", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
    >
      {value || "N/A"}
    </Typography>
    {action}
  </Box>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function TeacherCardAdmin({ handleEdit, teacher, handleDelete }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const imageSrc = getImageSrc(teacher.teacher_image);
  const initials = getInitials(teacher.name);
  const [bgColor, textColor] = getAvatarColor(teacher.name);

  const handleCopyEmail = () => {
    if (teacher.email) {
      navigator.clipboard.writeText(teacher.email).then(() => {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      });
    }
  };

  const handleCopyPhone = () => {
    if (teacher.phone) {
      navigator.clipboard.writeText(teacher.phone).then(() => {
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
      });
    }
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      handleDelete(teacher._id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const genderColor =
    teacher.gender?.toLowerCase() === "male"
      ? { bg: "#e3f2fd", text: "#1565c0" }
      : teacher.gender?.toLowerCase() === "female"
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
      {/* ── Top Banner — blue/indigo for teachers ── */}
      <Box
        sx={{
          height: 72,
          background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
          borderRadius: "14px 14px 0 0",
          position: "relative",
        }}
      >
        {/* Role badge */}
        <Chip
          label="Teacher"
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
              {!imgLoaded && <Skeleton variant="circular" width={72} height={72} />}
              <Box
                component="img"
                src={imageSrc}
                alt={teacher.name}
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
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: textColor }}>
              {initials}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Card Content ── */}
      <CardContent sx={{ pt: "44px", px: 2, pb: 0 }}>
        {/* Name + Gender */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
              {teacher.name}
            </Typography>
            {teacher.qualification && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {teacher.qualification}
              </Typography>
            )}
          </Box>
          {teacher.gender && (
            <Chip
              icon={<span style={{ color: genderColor.text, marginLeft: 6, display: "flex" }}><IconGender /></span>}
              label={teacher.gender}
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
          <InfoRow
            icon={<IconMail />}
            label="Email"
            value={teacher.email}
            action={
              teacher.email ? (
                <Tooltip title={emailCopied ? "Copied!" : "Copy email"}>
                  <IconButton
                    size="small"
                    onClick={handleCopyEmail}
                    sx={{ color: emailCopied ? "success.main" : "text.secondary", p: 0.4, "&:hover": { color: "primary.main" } }}
                  >
                    {emailCopied ? <IconCheck /> : <IconCopy />}
                  </IconButton>
                </Tooltip>
              ) : null
            }
          />
          {teacher.phone && (
            <InfoRow
              icon={<IconPhone />}
              label="Phone"
              value={teacher.phone}
              action={
                <Tooltip title={phoneCopied ? "Copied!" : "Copy number"}>
                  <IconButton
                    size="small"
                    onClick={handleCopyPhone}
                    sx={{ color: phoneCopied ? "success.main" : "text.secondary", p: 0.4, "&:hover": { color: "primary.main" } }}
                  >
                    {phoneCopied ? <IconCheck /> : <IconCopy />}
                  </IconButton>
                </Tooltip>
              }
            />
          )}
          <InfoRow icon={<IconAge />}     label="Age"           value={teacher.age ? `${teacher.age} yrs` : null} />
          <InfoRow icon={<IconDegree />}  label="Qualification" value={teacher.qualification} />
          {teacher.subject && (
            <InfoRow icon={<IconSubject />} label="Subject" value={teacher.subject} />
          )}
          {teacher.experience && (
            <InfoRow icon={<IconExp />} label="Experience" value={`${teacher.experience} yrs`} />
          )}
          <InfoRow icon={<IconCalendar />} label="Date of Join" value={convertDate(teacher.createdAt)} />
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
          onClick={() => handleEdit(teacher._id)}
          sx={{
            flex: 1,
            borderColor: "divider",
            color: "text.primary",
            fontWeight: 600,
            fontSize: 12,
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              borderColor: "#1a73e8",
              color: "#1a73e8",
              bgcolor: "#f0f4ff",
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
            "&:hover": { bgcolor: "#b71c1c", boxShadow: "none" },
            transition: "background-color 0.2s ease",
          }}
        >
          {confirmDelete ? "Confirm?" : "Delete"}
        </Button>
      </CardActions>
    </Card>
  );
}