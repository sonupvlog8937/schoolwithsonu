import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PhoneIcon from "@mui/icons-material/Phone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Link } from "react-router-dom";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import Attendee from "./attendee/Attendee";
import PageHeader from "../../../school/ui/PageHeader";
import SectionCard from "../../../school/ui/SectionCard";

// ── Helpers ──────────────────────────────────────────────────────────────────
const getPctColor = (pct) => {
  if (pct >= 75) return { bg: "#dcfce7", text: "#166534", bar: "#22c55e" };
  if (pct >= 50) return { bg: "#fef9c3", text: "#854d0e", bar: "#eab308" };
  return { bg: "#fee2e2", text: "#991b1b", bar: "#ef4444" };
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, icon, color, loading, subtitle }) => (
  <Card
    elevation={0}
    sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden", height: "100%" }}
  >
    <Box sx={{ display: "flex", height: "100%" }}>
      <Box sx={{ width: 5, bgcolor: color, flexShrink: 0 }} />
      <CardContent sx={{ flex: 1, py: 2, px: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 10 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={64} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {value ?? 0}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
          <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: alpha(color, 0.12), color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Box>
  </Card>
);

// ── AttendancePctBar ──────────────────────────────────────────────────────────
const AttendancePctBar = ({ pct }) => {
  const colors = getPctColor(pct);
  return (
    <Box sx={{ minWidth: 90 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.3}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text, fontSize: 11 }}>
          {pct}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(pct, 100)}
        sx={{
          height: 5, borderRadius: 3,
          bgcolor: alpha(colors.bar, 0.18),
          "& .MuiLinearProgress-bar": { bgcolor: colors.bar, borderRadius: 3 },
        }}
      />
    </Box>
  );
};

// ── Student Detail Dialog ─────────────────────────────────────────────────────
const StudentDetailDialog = ({ student, onClose }) => {
  if (!student) return null;
  const pct = student.attendanceSummary?.attendancePercentage || 0;
  const colors = getPctColor(pct);
  const initials = getInitials(student.name);

  return (
    <Dialog open={Boolean(student)} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Student Attendance Detail</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {/* Header strip */}
        <Box sx={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)", p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "rgba(255,255,255,0.20)", fontSize: 20, fontWeight: 800, color: "#fff" }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{student.name}</Typography>
            <Stack direction="row" spacing={1} mt={0.5}>
              {student.roll_number && (
                <Chip label={`Roll #${student.roll_number}`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, height: 20 }} />
              )}
              {student.student_class?.class_text && (
                <Chip label={student.student_class.class_text} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 700, height: 20 }} />
              )}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ p: 2.5 }}>
          {/* Attendance ring — CSS only */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ position: "relative", width: 120, height: 120, mx: "auto" }}>
                {/* Outer ring via SVG */}
                <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke={alpha(colors.bar, 0.18)} strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={colors.bar} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1, color: colors.text }}>{pct}%</Typography>
                  <Typography variant="caption" color="text.secondary">present</Typography>
                </Box>
              </Box>
              <Chip
                label={pct >= 75 ? "Good Standing" : pct >= 50 ? "At Risk" : "Critical"}
                size="small"
                sx={{ mt: 1, bgcolor: colors.bg, color: colors.text, fontWeight: 700, fontSize: 11 }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Info grid */}
          <Grid container spacing={1.5}>
            {[
              { label: "Present Days",  value: student.attendanceSummary?.presentCount || 0,  color: "#059669" },
              { label: "Absent Days",   value: student.attendanceSummary?.absentCount || 0,   color: "#dc2626" },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 6 }}>
                <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 2, bgcolor: alpha(stat.color, 0.08), border: "1px solid", borderColor: alpha(stat.color, 0.20) }}>
                  <Typography sx={{ fontWeight: 900, fontSize: 24, color: stat.color }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Guardian info */}
          <Stack spacing={1}>
            {[
              { label: "Guardian",       value: student.guardian },
              { label: "Guardian Phone", value: student.guardian_phone },
            ].map((row) => row.value ? (
              <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.value}</Typography>
              </Stack>
            ) : null)}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        {student.guardian_phone && (
          <Button
            component="a" href={`tel:${student.guardian_phone}`}
            variant="contained" startIcon={<PhoneIcon />}
            sx={{ textTransform: "none", borderRadius: 2, boxShadow: "none", fontWeight: 700 }}
          >
            Call Guardian
          </Button>
        )}
        <Button
          component={Link} to={`/school/attendance-student/${student._id}`}
          variant="outlined" endIcon={<ArrowForwardIcon />}
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
        >
          Full Records
        </Button>
        <Button onClick={onClose} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Mobile Student Card ───────────────────────────────────────────────────────
const MobileStudentCard = ({ student, index, onView }) => {
  const pct = student.attendanceSummary?.attendancePercentage || 0;
  const colors = getPctColor(pct);
  return (
    <Card elevation={0} sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", mb: 1.5 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 38, height: 38, bgcolor: alpha("#1d4ed8", 0.10), color: "#1d4ed8", fontSize: 13, fontWeight: 800 }}>
              {getInitials(student.name)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{student.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Roll #{student.roll_number || index + 1} · {student.student_class?.class_text || "N/A"}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={`${pct}%`}
            sx={{ bgcolor: colors.bg, color: colors.text, fontWeight: 700, fontSize: 11 }}
          />
        </Stack>

        <Stack direction="row" spacing={1} mb={1.2}>
          <Box sx={{ flex: 1, textAlign: "center", py: 0.8, borderRadius: 1.5, bgcolor: alpha("#059669", 0.08) }}>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#059669" }}>{student.attendanceSummary?.presentCount || 0}</Typography>
            <Typography variant="caption" color="text.secondary">Present</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", py: 0.8, borderRadius: 1.5, bgcolor: alpha("#dc2626", 0.08) }}>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#dc2626" }}>{student.attendanceSummary?.absentCount || 0}</Typography>
            <Typography variant="caption" color="text.secondary">Absent</Typography>
          </Box>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={Math.min(pct, 100)}
          sx={{ height: 5, borderRadius: 3, mb: 1.5, bgcolor: alpha(colors.bar, 0.18), "& .MuiLinearProgress-bar": { bgcolor: colors.bar, borderRadius: 3 } }}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {student.guardian_phone && (
            <IconButton size="small" component="a" href={`tel:${student.guardian_phone}`} sx={{ bgcolor: alpha("#059669", 0.10), color: "#059669" }}>
              <PhoneIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => onView(student)} sx={{ bgcolor: alpha("#1d4ed8", 0.10), color: "#1d4ed8" }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <Button
            component={Link} to={`/school/attendance-student/${student._id}`}
            size="small" variant="outlined" endIcon={<ArrowForwardIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, fontSize: 11 }}
          >
            Records
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StudentAttendanceList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [students, setStudents]         = useState([]);
  const [classSummary, setClassSummary] = useState([]);
  const [schoolSummary, setSchoolSummary] = useState({
    totalStudents: 0, presentCount: 0, absentCount: 0,
    markedCount: 0, attendancePercentage: 0, latestAttendanceDate: null,
  });
  const [loading, setLoading]           = useState(true);
  const [studentClass, setStudentClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [params, setParams]             = useState({});
  const [pagination, setPagination]     = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [message, setMessage]           = useState("");
  const [type, setType]                 = useState("success");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterOpen, setFilterOpen]     = useState(false);

  const resetMessage = () => setMessage("");
  const handleMessage = (nextType, nextMessage) => { setType(nextType); setMessage(nextMessage); };

  // ── Fetch classes ──────────────────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${baseUrl}/class/fetch-all`)
      .then((r) => setStudentClass(r.data.data || []))
      .catch(console.error);
  }, []);

  // ── Fetch attendance ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAttendanceOverview = async () => {
      setLoading(true);
      try {
        const r = await axios.get(`${baseUrl}/attendance/school/overview`, {
          params: { ...params, page: pagination.page, limit: pagination.limit },
        });
        setStudents(r.data.data || []);
        setClassSummary(r.data.classSummary || []);
        setSchoolSummary(r.data.schoolSummary || {
          totalStudents: 0, presentCount: 0, absentCount: 0,
          markedCount: 0, attendancePercentage: 0, latestAttendanceDate: null,
        });
        if (r.data.pagination) {
          setPagination((p) => ({ ...p, total: r.data.pagination.total, totalPages: r.data.pagination.totalPages }));
        }
      } catch (e) {
        console.error("Error fetching attendance:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceOverview();
  }, [params, pagination.page, pagination.limit, message]);

  const handleClass = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setPagination((p) => ({ ...p, page: 1 }));
    setParams((p) => { const n = { ...p }; classId ? (n.student_class = classId) : delete n.student_class; return n; });
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setPagination((p) => ({ ...p, page: 1 }));
    setParams((p) => { const n = { ...p }; v ? (n.search = v) : delete n.search; return n; });
  };

  const handleExport = () => {
    if (!students.length) return;
    const headers = ["Roll No,Name,Class,Present,Absent,Attendance %,Guardian,Phone"];
    const rows = students.map((s) =>
      [s.roll_number || "", s.name, s.student_class?.class_text || "", s.attendanceSummary?.presentCount || 0,
       s.attendanceSummary?.absentCount || 0, `${s.attendanceSummary?.attendancePercentage || 0}%`,
       s.guardian || "", s.guardian_phone || ""].join(",")
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "attendance.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const attendancePct = Math.round(schoolSummary.attendancePercentage || 0);

  const kpis = [
    { title: "Total Students", value: schoolSummary.totalStudents,  icon: <GroupsIcon fontSize="small" />,              color: "#1d4ed8" },
    { title: "Present Today",  value: schoolSummary.presentCount,   icon: <CheckCircleOutlineIcon fontSize="small" />,  color: "#059669" },
    { title: "Absent Today",   value: schoolSummary.absentCount,    icon: <HighlightOffIcon fontSize="small" />,        color: "#dc2626" },
    {
      title: "Attendance Rate",
      value: `${attendancePct}%`,
      icon: <TrendingUpIcon fontSize="small" />,
      color: attendancePct >= 75 ? "#059669" : attendancePct >= 50 ? "#d97706" : "#dc2626",
      subtitle: `${classSummary.length} classes tracked`,
    },
  ];

  const hasActiveFilter = selectedClass || params.search;

  return (
    <>
      {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}

      <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 2.5 }}>
        {/* ── Page Header ── */}
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1.5} mb={2.5}>
          <PageHeader
            title="Attendance"
            subtitle="Live attendance overview with per-student details and quick actions."
          />
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={handleExport}
              disabled={!students.length}
              variant="outlined"
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, fontSize: 13 }}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {/* ── KPI Row ── */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {kpis.map((kpi) => (
            <Grid key={kpi.title} size={{ xs: 6, sm: 6, lg: 3 }}>
              <KpiCard {...kpi} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* ── Latest attendance date banner ── */}
        {schoolSummary.latestAttendanceDate && (
          <Alert
            severity="info"
            icon={<CheckCircleOutlineIcon fontSize="small" />}
            sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
          >
            Latest attendance recorded on{" "}
            <strong>
              {new Date(schoolSummary.latestAttendanceDate).toLocaleDateString("en-IN", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}
            </strong>
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* ── Left: Filters + Mark Attendance ── */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Filters</Typography>
                  {hasActiveFilter && (
                    <Button
                      size="small"
                      onClick={() => { setSelectedClass(""); setParams({}); setPagination((p) => ({ ...p, page: 1 })); }}
                      sx={{ textTransform: "none", fontSize: 12, color: "error.main", fontWeight: 700 }}
                    >
                      Clear all
                    </Button>
                  )}
                </Stack>

                <TextField
                  label="Search student"
                  onChange={handleSearch}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment>,
                    sx: { borderRadius: 2 },
                  }}
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Student Class</InputLabel>
                  <Select value={selectedClass} label="Student Class" onChange={handleClass} sx={{ borderRadius: 2 }}>
                    <MenuItem value="">All Classes</MenuItem>
                    {studentClass.map((c) => (
                      <MenuItem key={c._id} value={c._id}>{c.class_text}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Class summary chips */}
                {classSummary.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Class Summary
                    </Typography>
                    <Stack spacing={0.8} mt={1}>
                      {classSummary.slice(0, 6).map((cls) => {
                        const pct = Math.round(cls.attendancePercentage || 0);
                        const colors = getPctColor(pct);
                        return (
                          <Stack key={cls._id || cls.class_text} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 70 }}>{cls.class_text}</Typography>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate" value={Math.min(pct, 100)}
                                sx={{ height: 5, borderRadius: 3, bgcolor: alpha(colors.bar, 0.18), "& .MuiLinearProgress-bar": { bgcolor: colors.bar, borderRadius: 3 } }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text, minWidth: 32, textAlign: "right" }}>
                              {pct}%
                            </Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                <Divider />

                {/* Mark attendance widget */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Mark Attendance</Typography>
                  {selectedClass ? (
                    <Attendee params={params} classId={selectedClass} handleMessage={handleMessage} />
                  ) : (
                    <Box sx={{ textAlign: "center", py: 2.5, bgcolor: "action.hover", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
                      <FilterListIcon sx={{ fontSize: 32, color: "text.disabled", mb: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Select a class to mark attendance
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </SectionCard>
          </Grid>

          {/* ── Right: Table / Cards ── */}
          <Grid size={{ xs: 12, md: 8 }}>
            <SectionCard sx={{ p: 0 }}>
              {/* Table header row */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pt: 2, pb: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Students
                  </Typography>
                  {!loading && (
                    <Chip label={`${pagination.total} total`} size="small" sx={{ fontSize: 11, height: 20, fontWeight: 600 }} />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Showing {students.length} of {pagination.total}
                </Typography>
              </Stack>

              <Divider />

              {/* ── Mobile card view ── */}
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {loading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} height={120} sx={{ borderRadius: 2, mb: 1.5 }} variant="rectangular" />)
                  ) : students.length > 0 ? (
                    students.map((s, i) => (
                      <MobileStudentCard key={s._id} student={s} index={i} onView={setSelectedStudent} />
                    ))
                  ) : (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <GroupsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography color="text.secondary">No students found</Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                /* ── Desktop table view ── */
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        {["Roll No.", "Student", "Class", "Present", "Absent", "Attendance", "Actions"].map((h, i) => (
                          <TableCell key={h} align={i >= 3 ? "center" : "left"}
                            sx={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4, color: "text.secondary", py: 1.2 }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        [...Array(6)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(7)].map((_, j) => (
                              <TableCell key={j}><Skeleton height={28} /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : students.length > 0 ? (
                        students.map((student, index) => {
                          const pct = student.attendanceSummary?.attendancePercentage || 0;
                          const colors = getPctColor(pct);
                          return (
                            <TableRow
                              key={student._id}
                              hover
                              sx={{
                                "&:hover": { bgcolor: "action.hover" },
                                borderLeft: `3px solid transparent`,
                                "&:hover .row-accent": { borderLeftColor: colors.bar },
                              }}
                            >
                              <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "text.secondary" }}>
                                {student.roll_number || index + 1}
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar
                                    sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 800, bgcolor: alpha("#1d4ed8", 0.10), color: "#1d4ed8" }}
                                  >
                                    {getInitials(student.name)}
                                  </Avatar>
                                  <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{student.name}</Typography>
                                    {student.guardian && (
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        {student.guardian}
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={student.student_class?.class_text || "N/A"}
                                  size="small"
                                  sx={{ fontSize: 11, height: 20, bgcolor: alpha("#0f766e", 0.09), color: "#0f766e", fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography sx={{ fontWeight: 700, color: "#059669" }}>
                                  {student.attendanceSummary?.presentCount || 0}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography sx={{ fontWeight: 700, color: "#dc2626" }}>
                                  {student.attendanceSummary?.absentCount || 0}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ minWidth: 110 }}>
                                <AttendancePctBar pct={pct} />
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <Tooltip title="View details">
                                    <IconButton
                                      size="small"
                                      onClick={() => setSelectedStudent(student)}
                                      sx={{ bgcolor: alpha("#1d4ed8", 0.08), color: "#1d4ed8", "&:hover": { bgcolor: alpha("#1d4ed8", 0.16) } }}
                                    >
                                      <VisibilityIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                  {student.guardian_phone && (
                                    <Tooltip title={`Call ${student.guardian}`}>
                                      <IconButton
                                        size="small"
                                        component="a" href={`tel:${student.guardian_phone}`}
                                        sx={{ bgcolor: alpha("#059669", 0.08), color: "#059669", "&:hover": { bgcolor: alpha("#059669", 0.16) } }}
                                      >
                                        <PhoneIcon sx={{ fontSize: 15 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Button
                                    component={Link}
                                    to={`/school/attendance-student/${student._id}`}
                                    size="small" variant="outlined"
                                    sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, fontSize: 11, py: 0.3, px: 1 }}
                                  >
                                    Records
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                            <GroupsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1, display: "block", mx: "auto" }} />
                            <Typography color="text.secondary">No students found</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* ── Pagination ── */}
              <Divider />
              <Stack
                direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between"
                spacing={1.5} sx={{ px: 2, py: 1.5 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {students.length} of {pagination.total} students
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Per page</InputLabel>
                    <Select
                      label="Per page" value={pagination.limit}
                      onChange={(e) => setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                      sx={{ borderRadius: 2 }}
                    >
                      {[5, 10, 20, 30].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Pagination
                    color="primary" shape="rounded"
                    page={pagination.page} count={pagination.totalPages || 1}
                    onChange={(_, v) => setPagination((p) => ({ ...p, page: v }))}
                    siblingCount={isMobile ? 0 : 1}
                  />
                </Stack>
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </Box>

      {/* ── Student Detail Dialog ── */}
      <StudentDetailDialog student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </>
  );
};

export default StudentAttendanceList;