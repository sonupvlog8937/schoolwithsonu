import React, { useContext, useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Chip, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Avatar,
  Skeleton, Alert, useMediaQuery, useTheme, Divider, Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FreeBreakfastOutlinedIcon from "@mui/icons-material/FreeBreakfastOutlined";
import { baseUrl } from "../../../environment";
import { AuthContext } from "../../../context/AuthContext";
import { PERIOD_SLOTS, getSlotIdFromDate } from "../../../utils/scheduleSlots";

// ── Subject color map ────────────────────────────────────────────────────────
const PALETTE = [
  { bg: "#EEF2FF", border: "#818CF8", text: "#3730A3", dot: "#6366F1", light: "#C7D2FE" },
  { bg: "#FFF7ED", border: "#FB923C", text: "#C2410C", dot: "#F97316", light: "#FED7AA" },
  { bg: "#F0FDF4", border: "#4ADE80", text: "#15803D", dot: "#22C55E", light: "#BBF7D0" },
  { bg: "#FDF4FF", border: "#E879F9", text: "#A21CAF", dot: "#D946EF", light: "#F5D0FE" },
  { bg: "#FFFBEB", border: "#FBBF24", text: "#92400E", dot: "#F59E0B", light: "#FDE68A" },
  { bg: "#EFF6FF", border: "#60A5FA", text: "#1D4ED8", dot: "#3B82F6", light: "#BFDBFE" },
  { bg: "#FFF1F2", border: "#FB7185", text: "#BE123C", dot: "#F43F5E", light: "#FECDD3" },
  { bg: "#F0FDFA", border: "#2DD4BF", text: "#0F766E", dot: "#14B8A6", light: "#99F6E4" },
];
const getColor = (name) => {
  if (!name) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

// ── Print CSS ────────────────────────────────────────────────────────────────
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #ts-print, #ts-print * { visibility: visible !important; }
  #ts-print { position: fixed; inset: 0; padding: 24px; background: #fff; }
  .no-print { display: none !important; }
}
`;

// ── Skeleton loader row ──────────────────────────────────────────────────────
const SkeletonRow = () => (
  <TableRow>
    {[130, 90, 120, 150].map((w, i) => (
      <TableCell key={i}><Skeleton variant="rounded" width={w} height={20} /></TableCell>
    ))}
  </TableRow>
);

// ── Mobile Card for one period ───────────────────────────────────────────────
const MobilePeriodCard = ({ slot, list }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const hasPeriod = list.length > 0;
  const col = hasPeriod ? getColor(list[0]?.subject?.subject_name) : null;
  const idleHeaderBg = isDark ? alpha(theme.palette.primary.main, 0.06) : "#F8FAFF";

  return (
    <Paper elevation={0} sx={{
      border: hasPeriod ? `1.5px solid ${col.border}` : "1.5px dashed",
      borderColor: hasPeriod ? undefined : "divider",
      borderRadius: 3,
      overflow: "hidden",
      mb: 1.5,
      bgcolor: "background.paper",
      transition: "box-shadow 0.2s",
      ...(hasPeriod && { "&:hover": { boxShadow: `0 4px 16px ${col.border}33` } }),
    }}>
      {/* Period header */}
      <Box sx={{
        px: 2, py: 1,
        background: hasPeriod
          ? `linear-gradient(135deg, ${col.bg}, ${col.light}22)`
          : idleHeaderBg,
        borderBottom: hasPeriod ? `1px solid ${col.border}44` : `1px solid ${theme.palette.divider}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{
            width: 28, height: 28, borderRadius: "50%",
            background: hasPeriod
              ? `linear-gradient(135deg, ${col.dot}, ${col.border})`
              : `linear-gradient(135deg,${theme.palette.grey[500]},${theme.palette.grey[600]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: theme.palette.common.white, fontWeight: 800, fontSize: 12, flexShrink: 0,
          }}>
            {slot.id}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: "text.primary", lineHeight: 1.2 }}>
              {slot.label} Period
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 10 }}>
              {slot.startHour}:00 – {slot.endHour}:00
            </Typography>
          </Box>
        </Stack>
        {hasPeriod ? (
          <CheckCircleOutlineIcon sx={{ color: col.dot, fontSize: 18 }} />
        ) : (
          <Chip label="Free" size="small" sx={{
            height: 20, fontSize: 10, fontWeight: 700,
            border: "1.5px dashed", borderColor: "divider", color: "text.disabled", bgcolor: "transparent",
          }} />
        )}
      </Box>

      {/* Period body */}
      {hasPeriod && list.map((period) => (
        <Box key={period._id} sx={{ px: 2, py: 1.25 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <ClassOutlinedIcon sx={{ fontSize: 14, color: col.dot }} />
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: col.text }}>
                {period.class?.class_text || "—"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <MenuBookOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>
                {period.subject?.subject_name || "—"}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      ))}

      {!hasPeriod && (
        <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
          <FreeBreakfastOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
            No class assigned for this period
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const TeacherSchedule = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const pageBg = isDark ? theme.palette.background.default : "#F8FAFF";
  const borderMain = alpha(theme.palette.primary.main, isDark ? 0.35 : 0.22);
  const headerAccent = theme.palette.primary.main;
  const rowPaper = theme.palette.background.paper;
  const rowAlt = alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04);
  const rowHover = alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08);

  // Inject print style
  useEffect(() => {
    const s = document.createElement("style");
    s.innerHTML = PRINT_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const fetchData = async () => {
    const teacherId = user?.id;
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${baseUrl}/period/teacher/${teacherId}`);
      setEvents(resp.data.periods || []);
    } catch {
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  // slot id → list of periods for this teacher
  const periodsBySlot = useMemo(() => {
    const map = new Map();
    (events || []).forEach((period) => {
      const slotId = getSlotIdFromDate(period.startTime);
      if (!slotId) return;
      const list = map.get(slotId) || [];
      list.push(period);
      map.set(slotId, list);
    });
    return map;
  }, [events]);

  // Stats
  const stats = useMemo(() => {
    const assigned = events.length;
    const free = PERIOD_SLOTS.length - new Set(events.map((e) => getSlotIdFromDate(e.startTime)).filter(Boolean)).size;
    const subjects = new Set(events.map((e) => e.subject?.subject_name).filter(Boolean)).size;
    const classes = new Set(events.map((e) => e.class?._id || e.class).filter(Boolean)).size;
    return { assigned, free, subjects, classes };
  }, [events]);

  // Teacher initials for avatar
  const teacherName = user?.name || "Teacher";
  const initials = teacherName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 }, bgcolor: pageBg, minHeight: "100vh" }}>

      {/* ── Profile + Header ── */}
      <Paper elevation={0} sx={{
        mb: 2.5, p: { xs: 2, md: 2.5 },
        borderRadius: 3, border: "1px solid", borderColor: borderMain,
        bgcolor: "background.paper",
        background: isDark
          ? `linear-gradient(135deg, ${alpha(headerAccent, 0.12)} 0%, ${theme.palette.background.paper} 55%, ${alpha(theme.palette.warning.main, 0.08)} 100%)`
          : "linear-gradient(135deg, #EEF2FF 0%, #F8FAFF 60%, #FFF7ED 100%)",
      }}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{
              width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 },
              background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.75)})`,
              fontSize: { xs: 18, md: 22 }, fontWeight: 800,
            }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{
                fontWeight: 700, color: headerAccent, textTransform: "uppercase",
                letterSpacing: 1, fontSize: 10,
              }}>
                My Weekly Schedule
              </Typography>
              <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: { xs: 18, md: 22 }, lineHeight: 1.2 }}>
                {teacherName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Showing periods assigned by school administration
              </Typography>
            </Box>
          </Stack>

          {/* Print button */}
          <Tooltip title="Print Schedule">
            <Box
              className="no-print"
              onClick={() => window.print()}
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                px: 2, py: 1, borderRadius: 2, cursor: "pointer",
                border: "1.5px solid", borderColor: alpha(headerAccent, 0.45), color: headerAccent,
                fontWeight: 700, fontSize: 13,
                "&:hover": { bgcolor: alpha(headerAccent, isDark ? 0.12 : 0.08) },
                transition: "background 0.15s",
                flexShrink: 0,
              }}
            >
              🖨️ Print
            </Box>
          </Tooltip>
        </Stack>
      </Paper>

      {/* ── Stats Cards ── */}
      {!loading && !error && (
        <Stack direction="row" spacing={{ xs: 1, md: 1.5 }} sx={{ mb: 2.5 }} className="no-print">
          {[
            { label: "Assigned", val: stats.assigned, color: headerAccent, tint: alpha(headerAccent, isDark ? 0.18 : 0.12) },
            { label: "Free Slots", val: stats.free, color: theme.palette.success.main, tint: alpha(theme.palette.success.main, isDark ? 0.18 : 0.12) },
            { label: "Subjects", val: stats.subjects, color: theme.palette.warning.main, tint: alpha(theme.palette.warning.main, isDark ? 0.18 : 0.12) },
            { label: "Classes", val: stats.classes, color: theme.palette.info.main, tint: alpha(theme.palette.info.main, isDark ? 0.18 : 0.12) },
          ].map((s) => (
            <Paper key={s.label} elevation={0} sx={{
              flex: "1 1 60px", px: { xs: 1.25, md: 2 }, py: { xs: 1, md: 1.25 },
              borderRadius: 2.5, border: "1px solid", borderColor: borderMain, bgcolor: s.tint,
            }}>
              <Typography sx={{ fontWeight: 800, color: s.color, fontSize: { xs: 20, md: 24 }, lineHeight: 1 }}>
                {s.val}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: 9, md: 11 } }}>
                {s.label}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}

      {/* ── Error state ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* ── MOBILE VIEW: Cards ── */}
      {isMobile && (
        <Box>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{ mb: 1.5, p: 2, borderRadius: 3, border: "1px solid", borderColor: borderMain, bgcolor: "background.paper" }}>
                  <Skeleton variant="rounded" height={60} />
                </Paper>
              ))
            : PERIOD_SLOTS.map((slot) => (
                <MobilePeriodCard key={slot.id} slot={slot} list={periodsBySlot.get(slot.id) || []} />
              ))
          }
        </Box>
      )}

      {/* ── DESKTOP/TABLET VIEW: Table ── */}
      {!isMobile && (
        <Paper elevation={0} id="ts-print" sx={{ borderRadius: 3, border: "1px solid", borderColor: borderMain, overflow: "hidden", bgcolor: "background.paper" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
            <Table stickyHeader size={isTablet ? "small" : "medium"} sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  {[
                    { label: "Period", icon: <ScheduleIcon sx={{ fontSize: 14 }} />, w: "20%" },
                    { label: "Time", icon: <AccessTimeIcon sx={{ fontSize: 14 }} />, w: "18%" },
                    { label: "Class", icon: <ClassOutlinedIcon sx={{ fontSize: 14 }} />, w: "22%" },
                    { label: "Subject", icon: <MenuBookOutlinedIcon sx={{ fontSize: 14 }} />, w: "40%" },
                  ].map((col) => (
                    <TableCell key={col.label} sx={{
                      width: col.w,
                      background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.72)})`,
                      color: theme.palette.primary.contrastText, fontWeight: 800,
                      fontSize: isTablet ? 12 : 13, py: 1.5,
                      zIndex: 3,
                    }}>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        {col.icon}
                        <span>{col.label}</span>
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : PERIOD_SLOTS.map((slot, idx) => {
                      const list = periodsBySlot.get(slot.id) || [];
                      const hasPeriod = list.length > 0;
                      const col = hasPeriod ? getColor(list[0]?.subject?.subject_name) : null;

                      return (
                        <TableRow key={slot.id} sx={{
                          background: hasPeriod
                            ? col.bg
                            : idx % 2 === 0 ? rowPaper : rowAlt,
                          borderLeft: hasPeriod ? `3px solid ${col.border}` : "3px solid transparent",
                          "&:hover": { background: hasPeriod ? col.bg : rowHover },
                          transition: "background 0.12s",
                        }}>
                          {/* Period */}
                          <TableCell sx={{ py: 1.25 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{
                                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                background: hasPeriod
                                  ? `linear-gradient(135deg,${col.dot},${col.border})`
                                  : `linear-gradient(135deg,${theme.palette.grey[500]},${theme.palette.grey[600]})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: theme.palette.common.white, fontWeight: 800, fontSize: 12,
                              }}>
                                {slot.id}
                              </Box>
                              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "text.primary" }}>
                                {slot.label} Period
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Time */}
                          <TableCell sx={{ py: 1.25 }}>
                            <Chip
                              size="small"
                              label={`${slot.startHour}:00 – ${slot.endHour}:00`}
                              sx={{
                                fontSize: 11, fontWeight: 600, height: 22,
                                background: hasPeriod ? `${col.dot}18` : alpha(theme.palette.action.hover, isDark ? 0.15 : 0.5),
                                color: hasPeriod ? col.text : "text.secondary",
                                border: "none",
                              }}
                            />
                          </TableCell>

                          {/* Class */}
                          <TableCell sx={{ py: 1.25 }}>
                            {hasPeriod ? (
                              <Stack spacing={0.5}>
                                {list.map((period) => (
                                  <Stack key={period._id} direction="row" alignItems="center" spacing={0.75}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: col.text }}>
                                      {period.class?.class_text || "—"}
                                    </Typography>
                                  </Stack>
                                ))}
                              </Stack>
                            ) : (
                              <Chip size="small" label="Free" sx={{
                                height: 22, fontSize: 11, fontWeight: 700,
                                border: "1.5px dashed", borderColor: "divider",
                                color: "text.disabled", bgcolor: "transparent",
                              }} />
                            )}
                          </TableCell>

                          {/* Subject */}
                          <TableCell sx={{ py: 1.25 }}>
                            {hasPeriod ? (
                              <Stack spacing={0.5}>
                                {list.map((period) => (
                                  <Box key={period._id} sx={{
                                    display: "inline-flex", alignItems: "center",
                                    px: 1.25, py: 0.4,
                                    background: col.bg,
                                    border: `1.5px solid ${col.border}`,
                                    borderRadius: 1.5,
                                    width: "fit-content",
                                  }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: 12, color: col.text }}>
                                      {period.subject?.subject_name || "—"}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic", fontSize: 12 }}>
                                No subject assigned
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ── Subject legend ── */}
      {!loading && !error && events.length > 0 && (
        <Paper elevation={0} className="no-print" sx={{
          mt: 2, px: 2, py: 1.5, borderRadius: 2.5, border: "1px solid", borderColor: borderMain, bgcolor: "background.paper",
        }}>
          <Typography variant="caption" sx={{
            fontWeight: 700, color: "text.secondary",
            textTransform: "uppercase", letterSpacing: 0.5, fontSize: 10,
          }}>
            Your Subjects
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
            {[...new Set(events.map((e) => e.subject?.subject_name).filter(Boolean))].sort().map((subj) => {
              const c = getColor(subj);
              return (
                <Chip key={subj} label={subj} size="small" sx={{
                  background: c.bg, border: `1.5px solid ${c.border}`,
                  color: c.text, fontWeight: 600, fontSize: 11, height: 22,
                }}
                  icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, ml: "6px !important", mr: "-2px" }} />}
                />
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && events.length === 0 && (
        <Paper elevation={0} sx={{
          mt: 2, p: 4, borderRadius: 3, border: "1.5px dashed", borderColor: "divider",
          textAlign: "center", bgcolor: "background.paper",
        }}>
          <ScheduleIcon sx={{ fontSize: 48, color: "divider", mb: 1 }} />
          <Typography sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}>
            No periods assigned yet
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Your schedule will appear here once the school admin assigns periods to you.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TeacherSchedule;