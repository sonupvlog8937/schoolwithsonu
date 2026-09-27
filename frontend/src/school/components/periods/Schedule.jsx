import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, IconButton,
  Tooltip, Alert, Snackbar, Badge, Divider,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { baseUrl } from "../../../environment";
import AssignPeriod2 from "../../../school/components/assign period/AssignPeriod2";
import PageHeader from "../../../school/ui/PageHeader";
import SectionCard from "../../../school/ui/SectionCard";

// ── Subject color palette ────────────────────────────────────────────────────
const SUBJECT_COLORS = [
  { bg: "#EEF2FF", border: "#818CF8", text: "#3730A3", dot: "#6366F1" },
  { bg: "#FFF7ED", border: "#FB923C", text: "#C2410C", dot: "#F97316" },
  { bg: "#F0FDF4", border: "#4ADE80", text: "#15803D", dot: "#22C55E" },
  { bg: "#FDF4FF", border: "#E879F9", text: "#A21CAF", dot: "#D946EF" },
  { bg: "#FFFBEB", border: "#FBBF24", text: "#92400E", dot: "#F59E0B" },
  { bg: "#EFF6FF", border: "#60A5FA", text: "#1D4ED8", dot: "#3B82F6" },
  { bg: "#FFF1F2", border: "#FB7185", text: "#BE123C", dot: "#F43F5E" },
  { bg: "#F0FDFA", border: "#2DD4BF", text: "#0F766E", dot: "#14B8A6" },
];
const getSubjectColor = (name) => {
  if (!name) return SUBJECT_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length];
};

// ── Period slots ─────────────────────────────────────────────────────────────
const PERIOD_SLOTS = [
  { id: 1, label: "1st", startHour: 10, endHour: 11 },
  { id: 2, label: "2nd", startHour: 11, endHour: 12 },
  { id: 3, label: "3rd", startHour: 12, endHour: 13 },
  { id: 4, label: "4th", startHour: 13, endHour: 14 },
  { id: 5, label: "5th", startHour: 14, endHour: 15 },
  { id: 6, label: "6th", startHour: 15, endHour: 16 },
];
const getSlotIdFromDate = (d) => {
  const h = new Date(d).getHours();
  return PERIOD_SLOTS.find((s) => s.startHour === h)?.id || null;
};

// ── Print style ──────────────────────────────────────────────────────────────
const PRINT_CSS = `@media print{body *{visibility:hidden!important}#sch-print,#sch-print *{visibility:visible!important}#sch-print{position:fixed;inset:0;padding:20px;background:#fff}.no-print{display:none!important}}`;

const Schedule = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [events, setEvents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [classForAdd, setClassForAdd] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.innerHTML = PRINT_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const fetchData = async () => {
    try {
      const [cr, pr] = await Promise.all([
        axios.get(`${baseUrl}/class/fetch-all`),
        axios.get(`${baseUrl}/period/all`),
      ]);
      const sorted = [...(cr.data.data || [])].sort((a, b) => (a.class_num || 0) - (b.class_num || 0));
      setAllClasses(sorted);
      if (!classForAdd && sorted.length > 0) setClassForAdd(sorted[0]._id);
      setEvents(pr.data.periods || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const allSubjects = useMemo(() =>
    [...new Set(events.map((e) => e.subject?.subject_name).filter(Boolean))].sort(), [events]);
  const allTeachers = useMemo(() =>
    [...new Set(events.map((e) => e.teacher?.name).filter(Boolean))].sort(), [events]);

  const periodMap = useMemo(() => {
    const map = new Map();
    events.forEach((p) => {
      const sid = getSlotIdFromDate(p.startTime);
      const cid = p.class?._id || p.class;
      if (!sid || !cid) return;
      if (filterSubject && p.subject?.subject_name !== filterSubject) return;
      if (filterTeacher && p.teacher?.name !== filterTeacher) return;
      map.set(`${sid}-${cid}`, p);
    });
    return map;
  }, [events, filterSubject, filterTeacher]);

  const displayedClasses = useMemo(() =>
    filterClass === "all" ? allClasses : allClasses.filter((c) => c._id === filterClass),
    [allClasses, filterClass]);

  const activeFilters = [filterClass !== "all", !!filterSubject, !!filterTeacher].filter(Boolean).length;
  const clearFilters = () => { setFilterClass("all"); setFilterSubject(""); setFilterTeacher(""); };

  const closeEdit = () => { setOpenEdit(false); setSelectedEventId(null); fetchData(); };
  const closeAdd = () => { setOpenAdd(false); fetchData(); };

  const handleDelete = async () => {
    try {
      await axios.delete(`${baseUrl}/period/${delTarget._id}`);
      setSnack({ open: true, msg: "Period deleted!", sev: "success" });
      fetchData();
    } catch {
      setSnack({ open: true, msg: "Delete failed.", sev: "error" });
    } finally { setOpenDelete(false); setDelTarget(null); }
  };

  const handleExportCSV = () => {
    const rows = [["Period", "Time", "Class", "Subject", "Teacher"]];
    PERIOD_SLOTS.forEach((slot) => allClasses.forEach((cls) => {
      const p = periodMap.get(`${slot.id}-${cls._id}`);
      rows.push([slot.label, `${slot.startHour}:00-${slot.endHour}:00`,
        cls.class_text || "", p?.subject?.subject_name || "Free", p?.teacher?.name || "-"]);
    }));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "schedule.csv" });
    a.click();
    setSnack({ open: true, msg: "CSV exported!", sev: "success" });
  };

  const stats = useMemo(() => ({
    total: events.length,
    free: PERIOD_SLOTS.length * allClasses.length - events.length,
    subjects: new Set(events.map((e) => e.subject?.subject_name).filter(Boolean)).size,
  }), [events, allClasses]);

  const pageBg = isDark ? theme.palette.background.default : "#F8FAFF";
  const rowStripeA = theme.palette.background.paper;
  const rowStripeB = alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04);
  const rowHoverBg = alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08);
  const borderMain = alpha(theme.palette.primary.main, isDark ? 0.35 : 0.22);
  const headerAccent = theme.palette.primary.main;

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, bgcolor: pageBg, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2, flexShrink: 0,
            background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.75)})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ScheduleIcon sx={{ color: theme.palette.primary.contrastText, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
              Class Schedule
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage and view all class periods
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} className="no-print" flexWrap="wrap">
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon fontSize="small" />}
            onClick={handleExportCSV}
            sx={{
              textTransform: "none", borderRadius: 2, fontWeight: 600,
              borderColor: alpha(headerAccent, 0.45), color: headerAccent, fontSize: 13,
            }}>
            Export
          </Button>
          <Button size="small" variant="outlined" startIcon={<PrintIcon fontSize="small" />}
            onClick={() => window.print()}
            sx={{
              textTransform: "none", borderRadius: 2, fontWeight: 600,
              borderColor: alpha(headerAccent, 0.45), color: headerAccent, fontSize: 13,
            }}>
            Print
          </Button>
          <Button size="small" variant="contained" startIcon={<AddIcon fontSize="small" />}
            onClick={() => setOpenAdd(true)}
            sx={{
              textTransform: "none", borderRadius: 2, fontWeight: 700, boxShadow: "none", fontSize: 13,
              background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.82)})`,
              "&:hover": {
                background: `linear-gradient(135deg,${alpha(headerAccent, 0.92)},${alpha(headerAccent, 0.7)})`,
                boxShadow: `0 4px 12px ${alpha(headerAccent, 0.35)}`,
              },
            }}>
            Add Period
          </Button>
        </Stack>
      </Stack>

      {/* ── Stats ── */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} className="no-print">
        {[
          { label: "Total Periods", val: stats.total, color: headerAccent, tint: alpha(headerAccent, isDark ? 0.18 : 0.12) },
          { label: "Free Slots", val: stats.free, color: theme.palette.success.main, tint: alpha(theme.palette.success.main, isDark ? 0.18 : 0.12) },
          { label: "Subjects", val: stats.subjects, color: theme.palette.warning.main, tint: alpha(theme.palette.warning.main, isDark ? 0.18 : 0.12) },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{
            px: 2, py: 1.25, borderRadius: 2.5, border: "1px solid", borderColor: borderMain,
            bgcolor: s.tint, flex: "1 1 80px",
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
          </Paper>
        ))}
      </Stack>

      {/* ── Filter bar ── */}
      <Paper elevation={0} className="no-print"
        sx={{ mb: 2, px: 2, py: 1.25, borderRadius: 2.5, border: "1px solid", borderColor: borderMain, bgcolor: "background.paper" }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" gap={0.75}>
          <Badge badgeContent={activeFilters} color="primary"
            sx={{ "& .MuiBadge-badge": { fontSize: 10 } }}>
            <Button size="small"
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon fontSize="small" />}
              onClick={() => setShowFilters((p) => !p)}
              sx={{
                textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: 13,
                ...(showFilters
                  ? { background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.8)})`, boxShadow: "none", color: theme.palette.primary.contrastText }
                  : { borderColor: alpha(headerAccent, 0.45), color: headerAccent }),
              }}>
              Filters
            </Button>
          </Badge>

          {showFilters && [
            { label: "Class", value: filterClass, set: setFilterClass, items: [{ v: "all", t: "All Classes" }, ...allClasses.map((c) => ({ v: c._id, t: c.class_text }))] },
            { label: "Subject", value: filterSubject, set: setFilterSubject, items: [{ v: "", t: "All Subjects" }, ...allSubjects.map((s) => ({ v: s, t: s }))] },
            { label: "Teacher", value: filterTeacher, set: setFilterTeacher, items: [{ v: "", t: "All Teachers" }, ...allTeachers.map((t) => ({ v: t, t: t }))] },
          ].map((f) => (
            <FormControl key={f.label} size="small" sx={{ minWidth: 130 }}>
              <InputLabel sx={{ fontSize: 13 }}>{f.label}</InputLabel>
              <Select value={f.value} label={f.label} onChange={(e) => f.set(e.target.value)}
                sx={{ borderRadius: 2, fontSize: 13 }}>
                {f.items.map((i) => <MenuItem key={i.v} value={i.v} sx={{ fontSize: 13 }}>{i.t}</MenuItem>)}
              </Select>
            </FormControl>
          ))}

          {showFilters && activeFilters > 0 && (
            <Button size="small" startIcon={<CloseIcon fontSize="small" />} onClick={clearFilters}
              sx={{ textTransform: "none", color: "error.main", fontWeight: 600, fontSize: 13 }}>
              Clear
            </Button>
          )}

          {filterSubject && <Chip label={filterSubject} size="small" onDelete={() => setFilterSubject("")} sx={{ bgcolor: alpha(headerAccent, isDark ? 0.22 : 0.12), color: isDark ? theme.palette.primary.light : theme.palette.primary.dark, fontWeight: 600, fontSize: 11, height: 22 }} />}
          {filterTeacher && <Chip label={filterTeacher} size="small" onDelete={() => setFilterTeacher("")} sx={{ bgcolor: alpha(theme.palette.warning.main, isDark ? 0.22 : 0.15), color: theme.palette.warning[isDark ? "light" : "dark"], fontWeight: 600, fontSize: 11, height: 22 }} />}
          {filterClass !== "all" && <Chip label={allClasses.find((c) => c._id === filterClass)?.class_text} size="small" onDelete={() => setFilterClass("all")} sx={{ bgcolor: alpha(theme.palette.success.main, isDark ? 0.22 : 0.12), color: theme.palette.success[isDark ? "light" : "dark"], fontWeight: 600, fontSize: 11, height: 22 }} />}
        </Stack>
      </Paper>

      {/* ── Table ── */}
      <Paper elevation={0} id="sch-print"
        sx={{ borderRadius: 3, border: "1px solid", borderColor: borderMain, overflow: "hidden", bgcolor: "background.paper" }}>
        <TableContainer sx={{
          // Vertically scrollable within viewport, horizontal scroll if needed
          maxHeight: "calc(100vh - 300px)",
          overflowX: "auto",
          overflowY: "auto",
        }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              // Let columns share space proportionally; no fixed min forces overflow
              tableLayout: "auto",
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow>
                {/* Period col — sticky left */}
                <TableCell sx={{
                  width: "12%", minWidth: 120,
                  background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.72)})`,
                  color: theme.palette.primary.contrastText, fontWeight: 800, fontSize: 13, py: 1.5,
                  position: "sticky", left: 0, zIndex: 4,
                  borderRight: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                }}>
                  Period
                </TableCell>
                {displayedClasses.map((cls) => (
                  <TableCell key={cls._id} align="center" sx={{
                    background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.72)})`,
                    color: theme.palette.primary.contrastText, fontWeight: 800, fontSize: 12, py: 1.5, zIndex: 3,
                    whiteSpace: "nowrap",
                  }}>
                    {cls.class_text}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {PERIOD_SLOTS.map((slot, idx) => (
                <TableRow key={slot.id} sx={{
                  background: idx % 2 === 0 ? rowStripeA : rowStripeB,
                  "&:hover": { background: rowHoverBg },
                  transition: "background 0.12s",
                }}>
                  {/* Period label — sticky left */}
                  <TableCell sx={{
                    width: "12%", minWidth: 120,
                    position: "sticky", left: 0, zIndex: 2,
                    background: idx % 2 === 0 ? rowStripeA : rowStripeB,
                    borderRight: `2px solid ${alpha(headerAccent, 0.15)}`,
                    py: 1, px: 1.5,
                  }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg,${headerAccent},${alpha(headerAccent, 0.75)})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: theme.palette.primary.contrastText, fontWeight: 800, fontSize: 11,
                      }}>
                        {slot.id}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 12, color: "text.primary", lineHeight: 1.2 }}>
                          {slot.label} Period
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                          {slot.startHour}:00 – {slot.endHour}:00
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Subject cells */}
                  {displayedClasses.map((cls) => {
                    const period = periodMap.get(`${slot.id}-${cls._id}`);
                    const col = getSubjectColor(period?.subject?.subject_name);
                    return (
                      <TableCell key={`${slot.id}-${cls._id}`} align="center"
                        sx={{ py: 0.75, px: 0.75 }}>
                        {period ? (
                          <Box sx={{
                            background: col.bg,
                            border: `1.5px solid ${col.border}`,
                            borderRadius: 2, px: 1, py: 0.75,
                            cursor: "pointer", transition: "all 0.15s",
                            "&:hover": { transform: "translateY(-1px)", boxShadow: `0 3px 8px ${col.border}55` },
                            "&:hover .pact": { opacity: 1 },
                          }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: col.dot, mx: "auto", mb: 0.5 }} />
                            <Typography sx={{
                              fontWeight: 700, fontSize: 11, color: col.text, lineHeight: 1.3,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {period.subject?.subject_name || "Subject"}
                            </Typography>
                            <Typography variant="caption" sx={{
                              fontSize: 10, color: "text.secondary", display: "block",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {period.teacher?.name || "—"}
                            </Typography>
                            <Stack className="pact" direction="row" spacing={0.25}
                              justifyContent="center"
                              sx={{ mt: 0.5, opacity: 0, transition: "opacity 0.15s" }}>
                              <Tooltip title="Edit" arrow>
                                <IconButton size="small"
                                  onClick={() => { setSelectedEventId(period._id); setOpenEdit(true); }}
                                  sx={{ p: 0.25, color: col.text, background: `${col.border}25`, "&:hover": { background: `${col.border}45` } }}>
                                  <EditIcon sx={{ fontSize: 11 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" arrow>
                                <IconButton size="small"
                                  onClick={() => { setDelTarget(period); setOpenDelete(true); }}
                                  sx={{ p: 0.25, color: "error.main", bgcolor: alpha(theme.palette.error.main, 0.12), "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.22) } }}>
                                  <DeleteIcon sx={{ fontSize: 11 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        ) : (
                          <Box sx={{ border: "1.5px dashed", borderColor: "divider", borderRadius: 2, py: 1.25, bgcolor: alpha(theme.palette.action.hover, isDark ? 0.08 : 0.04) }}>
                            <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600, fontSize: 10 }}>
                              Free
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Legend ── */}
      {allSubjects.length > 0 && (
        <Paper elevation={0} className="no-print"
          sx={{ mt: 1.5, px: 2, py: 1.25, borderRadius: 2.5, border: "1px solid", borderColor: borderMain, bgcolor: "background.paper" }}>
          <Typography variant="caption" sx={{
            fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontSize: 10,
          }}>
            Subject Legend
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.75 }}>
            {allSubjects.map((subj) => {
              const c = getSubjectColor(subj);
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

      {/* ── Edit Dialog ── */}
      <Dialog open={openEdit} onClose={closeEdit} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary", py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditIcon sx={{ color: headerAccent, fontSize: 20 }} /><span>Edit Period</span>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedEventId && <AssignPeriod2 isEdit periodId={selectedEventId} close={closeEdit} />}
        </DialogContent>
        <DialogActions sx={{ px: 2.5 }}>
          <Button onClick={closeEdit} sx={{ textTransform: "none", borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Dialog ── */}
      <Dialog open={openAdd} onClose={closeAdd} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary", py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddIcon sx={{ color: headerAccent, fontSize: 20 }} /><span>Add New Period</span>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select label="Class" value={classForAdd}
                onChange={(e) => setClassForAdd(e.target.value)} sx={{ borderRadius: 2 }}>
                {allClasses.map((c) => <MenuItem key={c._id} value={c._id}>{c.class_text}</MenuItem>)}
              </Select>
            </FormControl>
            {classForAdd && <AssignPeriod2 classId={classForAdd} close={closeAdd} />}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5 }}>
          <Button onClick={closeAdd} sx={{ textTransform: "none", borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "error.main", py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteIcon sx={{ fontSize: 20 }} /><span>Delete Period?</span>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: 14 }}>
            Delete <strong>{delTarget?.subject?.subject_name || "this period"}</strong> from{" "}
            <strong>{delTarget?.class?.class_text || "this class"}</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} sx={{ textTransform: "none", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.sev} variant="filled"
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Schedule;