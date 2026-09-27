import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import {
  Container, Button, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Select, MenuItem, Alert, FormControl, InputLabel, Box,
  Paper, Link, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TableContainer, Stack, Divider, TextField, InputAdornment, Tooltip,
  LinearProgress, IconButton, Collapse, Snackbar,
  CircularProgress, Avatar, ToggleButton, ToggleButtonGroup, useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Search, CheckCircle, Cancel, Schedule, Person, Phone, Email,
  School, CalendarToday, Download, Refresh,
  ExpandMore, ExpandLess, Groups, HowToReg, PersonOff, Percent,
  GridView, ViewList, Close, Info, Warning, PeopleAlt, RadioButtonUnchecked,
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { baseUrl } from '../../../environment';
import { AuthContext } from '../../../context/AuthContext';

/* ─── helpers ─── */
const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const getAvatarColor = (name = '') => {
  const colors = [
    '#4f46e5','#0891b2','#059669','#d97706','#dc2626',
    '#7c3aed','#db2777','#0284c7','#16a34a','#ea580c',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const AttendancePercentageBar = ({ value }) => {
  const color = value >= 75 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
        <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 700, color, minWidth: 36 }}>
        {value}%
      </Typography>
    </Box>
  );
};

/* ─── stat card ─── */
const StatCard = ({ icon, label, value, color, sublabel }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.25, sm: 1.5 },
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      gap: { xs: 1, sm: 1.5 },
      transition: 'box-shadow 0.2s',
      minWidth: 0,
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    }}
  >
    <Box
      sx={{
        width: { xs: 34, sm: 38 },
        height: { xs: 34, sm: 38 },
        borderRadius: 1.5,
        bgcolor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon, { sx: { color, fontSize: { xs: 18, sm: 20 } } })}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.62rem', sm: '0.7rem' }, mb: 0.1, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
        {value}
      </Typography>
      {sublabel && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: { xs: '0.58rem', sm: '0.65rem' }, display: { xs: 'none', sm: 'block' } }}>
          {sublabel}
        </Typography>
      )}
    </Box>
  </Paper>
);

/** Large tap targets, clear checked state with icons — production-friendly for phones. */
const PresentAbsentToggle = ({ value, onChange, disabled = false, compact = false }) => {
  const theme = useTheme();
  const isPresent = value === 'Present';
  const isAbsent = value === 'Absent';
  const h = compact ? 38 : 48;
  const iconSx = { fontSize: compact ? 18 : 22 };
  const labelSx = { fontWeight: 800, fontSize: compact ? '0.72rem' : '0.875rem', lineHeight: 1.2 };

  const presentIdle = {
    color: 'success.main',
    borderColor: alpha(theme.palette.success.main, 0.45),
    bgcolor: alpha(theme.palette.success.main, 0.06),
    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.12) },
  };
  const absentIdle = {
    color: 'error.main',
    borderColor: alpha(theme.palette.error.main, 0.45),
    bgcolor: alpha(theme.palette.error.main, 0.06),
    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) },
  };

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 0.75 }}
      sx={{
        width: '100%',
        maxWidth: compact ? 300 : 'none',
        touchAction: 'manipulation',
      }}
    >
      <Button
        disableElevation
        fullWidth
        variant={isPresent ? 'contained' : 'outlined'}
        color="success"
        disabled={disabled}
        onClick={() => onChange('Present')}
        aria-pressed={isPresent}
        aria-label="Mark present"
        startIcon={
          isPresent ? (
            <CheckCircle sx={iconSx} />
          ) : (
            <RadioButtonUnchecked sx={{ ...iconSx, opacity: 0.75 }} />
          )
        }
        sx={{
          minHeight: h,
          py: compact ? 0.5 : 1,
          px: 1,
          borderRadius: 2,
          textTransform: 'none',
          borderWidth: 2,
          boxShadow: isPresent ? 2 : 'none',
          transition: 'transform 0.12s ease, box-shadow 0.2s ease',
          '&:active': { transform: 'scale(0.98)' },
          ...(!isPresent ? presentIdle : {}),
          ...labelSx,
        }}
      >
        Present
      </Button>
      <Button
        disableElevation
        fullWidth
        variant={isAbsent ? 'contained' : 'outlined'}
        color="error"
        disabled={disabled}
        onClick={() => onChange('Absent')}
        aria-pressed={isAbsent}
        aria-label="Mark absent"
        startIcon={
          isAbsent ? (
            <Cancel sx={iconSx} />
          ) : (
            <RadioButtonUnchecked sx={{ ...iconSx, opacity: 0.75 }} />
          )
        }
        sx={{
          minHeight: h,
          py: compact ? 0.5 : 1,
          px: 1,
          borderRadius: 2,
          textTransform: 'none',
          borderWidth: 2,
          boxShadow: isAbsent ? 2 : 'none',
          transition: 'transform 0.12s ease, box-shadow 0.2s ease',
          '&:active': { transform: 'scale(0.98)' },
          ...(!isAbsent ? absentIdle : {}),
          ...labelSx,
        }}
      >
        Absent
      </Button>
    </Stack>
  );
};

/* ─── main ─── */
/** Same calendar day + class → remember submit (Vercel refresh / private mode safe). Next day = new date in key. */
const attendanceSubmittedStorageKey = (classId, dateStr) =>
  classId && dateStr ? `teacher_attendance_submitted_${String(classId)}_${dateStr}` : null;

const readAttendanceSubmittedFlag = (key) => {
  if (!key) return false;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1') return true;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key) === '1') return true;
  } catch {
    /* quota / private mode */
  }
  return false;
};

const writeAttendanceSubmittedFlag = (key) => {
  if (!key) return;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, '1');
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
};

/** Server summary: everyone has today's Present/Absent → treat as locked (works after refresh on Vercel). */
const isFullyMarkedFromSummary = (summary) => {
  if (!summary) return false;
  const total = Number(summary.totalStudents) || 0;
  const marked = Number(summary.markedCount) || 0;
  return total > 0 && marked >= total;
};

const AttendanceTeacher = () => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const teacherId = user?.id || user?._id;

  /* state */
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendeeClass, setAttendeeClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [overview, setOverview] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [bulkMode, setBulkMode] = useState(null); // 'all-present' | 'all-absent'

  const todayDate = moment().format('YYYY-MM-DD');
  const todayFormatted = moment().format('dddd, MMMM D, YYYY');

  /* ─── fetch attendee classes ─── */
  useEffect(() => {
    axios.get(`${baseUrl}/class/attendee`)
      .then((r) => setAttendeeClass(r.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  /* ─── fetch class data ─── */
  useEffect(() => {
    if (!selectedClass?.id) {
      setStudents([]); setAttendanceStatus({});
      setAttendanceTaken(false); setOverview(null); setPeriods([]);
      return;
    }
    const persistKey = attendanceSubmittedStorageKey(selectedClass.id, todayDate);
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [checkSettled, overviewSettled] = await Promise.allSettled([
          axios.get(`${baseUrl}/attendance/check/${selectedClass.id}`, { params: { date: todayDate } }),
          axios.get(`${baseUrl}/attendance/class/${selectedClass.id}/overview`, { params: { date: todayDate } }),
        ]);

        let fromCheck = false;
        if (checkSettled.status === 'fulfilled') {
          fromCheck = Boolean(checkSettled.value.data?.attendanceTaken);
        } else {
          console.error(checkSettled.reason);
        }

        let summary = null;
        let studentsData = [];
        if (overviewSettled.status === 'fulfilled') {
          summary = overviewSettled.value.data?.summary || null;
          studentsData = overviewSettled.value.data?.data || [];
        } else {
          console.error(overviewSettled.reason);
        }

        const fullyMarked = isFullyMarkedFromSummary(summary);
        if (fullyMarked && persistKey) writeAttendanceSubmittedFlag(persistKey);

        const persisted = readAttendanceSubmittedFlag(persistKey);
        const isTaken = fromCheck || persisted || fullyMarked;

        if (cancelled) return;
        setAttendanceTaken(isTaken);
        setStudents(studentsData);
        setOverview(summary);

        const init = {};
        studentsData.forEach((s) => {
          init[s._id] = (s.todayStatus === 'Present' || s.todayStatus === 'Absent')
            ? s.todayStatus : 'Present';
        });
        setAttendanceStatus(init);

        if (teacherId) {
          try {
            const pr = await axios.get(`${baseUrl}/period/teacher/${teacherId}`);
            if (cancelled) return;
            const filtered = (pr.data?.periods || []).filter((p) =>
              String(p.class?._id || p.class) === String(selectedClass.id)
            );
            setPeriods(filtered);
          } catch {
            if (!cancelled) setPeriods([]);
          }
        } else if (!cancelled) {
          setPeriods([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [todayDate, selectedClass, teacherId]);

  /* ─── handlers ─── */
  const handleStatusChange = useCallback((id, status) => {
    setAttendanceStatus((prev) => ({ ...prev, [id]: status }));
  }, []);

  const handleClassChange = (e) => {
    const val = e.target.value;
    if (!val) { setSelectedClass(null); return; }
    const row = attendeeClass.find((c) => String(c.classId) === String(val));
    setSelectedClass({ id: val, class_text: row?.class_text ?? '' });
    setSearchQuery(''); setFilterStatus('all');
  };

  const handleBulkMark = (status) => {
    const updated = {};
    filteredStudents.forEach((s) => { updated[s._id] = status; });
    setAttendanceStatus((prev) => ({ ...prev, ...updated }));
    setBulkMode(status === 'Present' ? 'all-present' : 'all-absent');
    setTimeout(() => setBulkMode(null), 1500);
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    setConfirmDialog(false);
    try {
      await Promise.all(
        students.map((s) =>
          axios.post(`${baseUrl}/attendance/mark`, {
            studentId: s._id, date: todayDate,
            status: attendanceStatus[s._id], classId: selectedClass.id,
          })
        )
      );
      const persistKey = attendanceSubmittedStorageKey(selectedClass.id, todayDate);
      if (persistKey) writeAttendanceSubmittedFlag(persistKey);
      setAttendanceTaken(true);
      setSnackbar({ open: true, message: 'Attendance submitted successfully!', severity: 'success' });
      const overRes = await axios.get(`${baseUrl}/attendance/class/${selectedClass.id}/overview`, { params: { date: todayDate } });
      const summ = overRes.data?.summary || null;
      setOverview(summ);
      setStudents(overRes.data?.data || []);
      if (isFullyMarkedFromSummary(summ) && persistKey) writeAttendanceSubmittedFlag(persistKey);
    } catch {
      setSnackbar({ open: true, message: 'Failed to submit attendance. Try again.', severity: 'error' });
    } finally { setSubmitting(false); }
  };

  const exportCSV = () => {
    const rows = [['Name', 'Roll No', 'Gender', 'Age', 'Guardian', 'Phone', 'Email', 'Overall %', 'Today Status']];
    students.forEach((s) => rows.push([
      s.name, s.roll_number || '-', s.gender || '-', s.age || '-',
      s.guardian || '-', s.guardian_phone || '-', s.email || '-',
      `${s.attendanceSummary?.attendancePercentage || 0}%`,
      attendanceStatus[s._id] || s.todayStatus || '-',
    ]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance_${selectedClass.class_text}_${todayDate}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  /* ─── derived ─── */
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.roll_number || '').includes(searchQuery);
      const status = attendanceStatus[s._id] || s.todayStatus;
      const matchFilter =
        filterStatus === 'all' ? true :
        filterStatus === 'present' ? status === 'Present' :
        filterStatus === 'absent' ? status === 'Absent' : true;
      return matchSearch && matchFilter;
    });
  }, [students, searchQuery, filterStatus, attendanceStatus]);

  const presentCount = useMemo(
    () => Object.values(attendanceStatus).filter((v) => v === 'Present').length,
    [attendanceStatus]
  );
  const absentCount = useMemo(
    () => Object.values(attendanceStatus).filter((v) => v === 'Absent').length,
    [attendanceStatus]
  );

  const scheduleRows = useMemo(
    () => [...periods].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [periods]
  );

  /* ─── loading ─── */
  if (loading && !selectedClass) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={44} thickness={4} />
        <Typography color="text.secondary">Loading attendance data…</Typography>
      </Box>
    );
  }

  /* ─── render ─── */
  return (
    <Container
      maxWidth="xl"
      disableGutters={isSmDown}
      sx={{
        py: { xs: 1.5, sm: 2, md: 4 },
        px: { xs: 1.5, sm: 2, md: 3 },
        pb: {
          xs:
            selectedClass && students.length > 0 && !attendanceTaken
              ? 'calc(112px + env(safe-area-inset-bottom, 0px))'
              : 2,
          md: 4,
        },
        maxWidth: '100% !important',
      }}
    >

      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: { xs: 2, md: 3 },
          gap: 1.5,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            }}
          >
            Attendance
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}
          >
            <CalendarToday sx={{ fontSize: { xs: 16, sm: 14 }, flexShrink: 0 }} /> {todayFormatted}
          </Typography>
        </Box>
        {selectedClass && students.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            fullWidth={isSmDown}
            startIcon={<Download />}
            onClick={exportCSV}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
          >
            Export CSV
          </Button>
        )}
      </Box>

      {/* ── No class alert ── */}
      {attendeeClass.length === 0 && !loading && (
        <Alert
          severity="warning" icon={<Warning />}
          sx={{ borderRadius: 3, mb: 3 }}
        >
          You are not assigned as class attendee or subject teacher for any class. Please contact the admin.
        </Alert>
      )}

      {/* ── Class selector ── */}
      {attendeeClass.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            mb: { xs: 2, md: 3 },
            borderRadius: { xs: 2, md: 3 },
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: { xs: 'stretch', sm: 'center' },
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <FormControl size="small" sx={{ minWidth: 0, width: { xs: '100%', sm: 240 } }}>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass ? selectedClass.id : ''}
                onChange={handleClassChange}
                label="Select Class"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">— Select a class —</MenuItem>
                {attendeeClass.map((c) => (
                  <MenuItem key={String(c.classId)} value={String(c.classId)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School fontSize="small" color="primary" />
                      {c.class_text}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'space-between', sm: 'flex-start' },
              }}
            >
              {selectedClass && (
                <Chip
                  label={attendanceTaken ? 'Attendance Taken' : 'Pending'}
                  color={attendanceTaken ? 'success' : 'warning'}
                  icon={attendanceTaken ? <CheckCircle /> : <Schedule />}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
              {selectedClass && (
                <Tooltip title="Refresh">
                  <IconButton
                    size="small"
                    onClick={() => { const c = selectedClass; setSelectedClass(null); setTimeout(() => setSelectedClass(c), 100); }}
                    sx={{ ml: { xs: 0, sm: 0 } }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {/* ── Loading bar ── */}
      {loading && <LinearProgress sx={{ borderRadius: 4, mb: 2 }} />}

      {/* ── Stats ── */}
      {selectedClass && overview && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 1, sm: 1.5 },
            mb: { xs: 2, md: 3 },
            width: '100%',
            maxWidth: { xs: '100%', md: 900 },
          }}
        >
          <StatCard icon={<PeopleAlt />} label="Total Students" value={overview.totalStudents || 0} color="#4f46e5" />
          <StatCard icon={<HowToReg />} label="Present Today" value={attendanceTaken ? (overview.presentCount || 0) : presentCount} color="#16a34a" />
          <StatCard icon={<PersonOff />} label="Absent Today" value={attendanceTaken ? (overview.absentCount || 0) : absentCount} color="#dc2626" />
          <StatCard
            icon={<Percent />}
            label="Attendance Rate"
            value={`${overview.attendancePercentage || 0}%`}
            color="#0891b2"
            sublabel="Overall class average"
          />
        </Box>
      )}

      {/* ── Already taken ── */}
      {selectedClass && attendanceTaken && (
        <Alert
          severity="success" icon={<CheckCircle />}
          sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}
        >
          Attendance for <strong>{selectedClass.class_text}</strong> has already been recorded for today.
        </Alert>
      )}

      {/* ── No students ── */}
      {selectedClass && !loading && !attendanceTaken && students.length === 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          No students enrolled in <strong>{selectedClass.class_text}</strong> yet.
        </Alert>
      )}

      {/* ── Student table/grid ── */}
      {selectedClass && students.length > 0 && (
        <>
          {/* Toolbar */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: 2,
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 1.5,
                flexWrap: 'wrap',
                alignItems: { xs: 'stretch', lg: 'center' },
              }}
            >
              <TextField
                size="small"
                placeholder="Search name or roll no…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label="Clear search" onClick={() => setSearchQuery('')}>
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 },
                }}
                sx={{ flex: { lg: 1 }, minWidth: { xs: 0, sm: 180 }, width: { xs: '100%', lg: 'auto' } }}
              />
              <ToggleButtonGroup
                value={filterStatus}
                exclusive
                onChange={(_, v) => v && setFilterStatus(v)}
                size="small"
                sx={{
                  alignSelf: { xs: 'stretch', lg: 'center' },
                  width: { xs: '100%', lg: 'auto' },
                  '& .MuiToggleButton-root': { flex: { xs: 1, lg: 'none' }, py: 1 },
                }}
              >
                <ToggleButton value="all" sx={{ px: 1.5, textTransform: 'none', fontWeight: 700 }}>
                  All
                </ToggleButton>
                <ToggleButton value="present" sx={{ px: 1.5, textTransform: 'none', fontWeight: 700, color: 'success.main' }}>
                  Present
                </ToggleButton>
                <ToggleButton value="absent" sx={{ px: 1.5, textTransform: 'none', fontWeight: 700, color: 'error.main' }}>
                  Absent
                </ToggleButton>
              </ToggleButtonGroup>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  width: { xs: '100%', lg: 'auto' },
                  ml: { lg: 'auto' },
                  alignItems: 'center',
                }}
              >
                {!attendanceTaken && (
                  <>
                    <Button
                      size="medium"
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleBulkMark('Present')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        flex: { xs: 1, sm: 'none' },
                        minHeight: 44,
                      }}
                    >
                      All present
                    </Button>
                    <Button
                      size="medium"
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleBulkMark('Absent')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        flex: { xs: 1, sm: 'none' },
                        minHeight: 44,
                      }}
                    >
                      All absent
                    </Button>
                  </>
                )}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: { md: 'auto' } }}>
                  <Tooltip title="Table view">
                    <IconButton size="small" onClick={() => setViewMode('table')} color={viewMode === 'table' ? 'primary' : 'default'}>
                      <ViewList />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Grid view">
                    <IconButton size="small" onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
                      <GridView />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
            {filteredStudents.length !== students.length && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Showing {filteredStudents.length} of {students.length} students
              </Typography>
            )}
          </Paper>

          {/* ── Desktop Table ── */}
          {viewMode === 'table' && (
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
              <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 960 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['Student', 'Roll No', 'Gender', 'Age', 'Guardian', 'Phone', 'Email', 'Attendance %', "Today's Status", 'Action', 'Details'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <Search sx={{ fontSize: 40, opacity: 0.3 }} />
                            <Typography>No students match your search</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.map((student) => {
                      const status = attendanceStatus[student._id] || student.todayStatus;
                      return (
                        <TableRow key={student._id} hover sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                          {/* Student */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700, bgcolor: getAvatarColor(student.name) }}>
                                {getInitials(student.name)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Typography variant="body2">{student.roll_number || '—'}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{student.gender || '—'}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{student.age || '—'}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{student.guardian || '—'}</Typography></TableCell>
                          <TableCell>
                            {student.guardian_phone ? (
                              <Link href={`tel:${student.guardian_phone}`} underline="hover" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone sx={{ fontSize: 13 }} />{student.guardian_phone}
                              </Link>
                            ) : '—'}
                          </TableCell>
                          <TableCell><Typography variant="body2" noWrap>{student.email || '—'}</Typography></TableCell>
                          {/* Attendance % bar */}
                          <TableCell sx={{ minWidth: 130 }}>
                            <AttendancePercentageBar value={student.attendanceSummary?.attendancePercentage || 0} />
                          </TableCell>
                          {/* Today chip */}
                          <TableCell>
                            <Chip
                              size="small"
                              label={student.todayStatus || 'Not Marked'}
                              color={student.todayStatus === 'Present' ? 'success' : student.todayStatus === 'Absent' ? 'error' : 'default'}
                              variant={student.todayStatus ? 'filled' : 'outlined'}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          {/* Action */}
                          <TableCell>
                            {attendanceTaken ? (
                              <Chip
                                size="small"
                                label={status || 'Not Marked'}
                                color={status === 'Present' ? 'success' : status === 'Absent' ? 'error' : 'default'}
                                variant={status ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 700 }}
                              />
                            ) : (
                              <PresentAbsentToggle
                                compact
                                disabled={submitting}
                                value={attendanceStatus[student._id]}
                                onChange={(v) => handleStatusChange(student._id, v)}
                              />
                            )}
                          </TableCell>
                          {/* Details */}
                          <TableCell>
                            <Button
                              size="small" variant="outlined"
                              onClick={() => setSelectedStudent(student)}
                              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* ── Desktop Grid ── */}
          {viewMode === 'grid' && (
            <Box
              sx={{
                display: { xs: 'none', md: 'grid' },
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 2,
              }}
            >
              {filteredStudents.map((student) => {
                const status = attendanceStatus[student._id];
                return (
                  <Paper
                    key={student._id} elevation={0}
                    sx={{
                      p: 2.5, borderRadius: 3, border: '1px solid',
                      borderColor: status === 'Present' ? '#bbf7d0' : status === 'Absent' ? '#fecaca' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 40, height: 40, fontWeight: 700, bgcolor: getAvatarColor(student.name) }}>
                          {getInitials(student.name)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{student.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Roll: {student.roll_number || '—'}</Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => setSelectedStudent(student)}>
                        <Info fontSize="small" />
                      </IconButton>
                    </Box>
                    <AttendancePercentageBar value={student.attendanceSummary?.attendancePercentage || 0} />
                    <Box sx={{ mt: 1.5 }}>
                      {attendanceTaken ? (
                        <Chip size="small" label={status || 'Not Marked'} color={status === 'Present' ? 'success' : status === 'Absent' ? 'error' : 'default'} sx={{ fontWeight: 700 }} />
                      ) : (
                        <PresentAbsentToggle
                          disabled={submitting}
                          value={status}
                          onChange={(v) => handleStatusChange(student._id, v)}
                        />
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* ── Mobile Cards ── */}
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filteredStudents.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Search sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No students match your search</Typography>
              </Paper>
            ) : filteredStudents.map((student) => {
              const status = attendanceStatus[student._id];
              return (
                <Paper
                  key={student._id} elevation={0}
                  sx={{
                    p: 2, borderRadius: 3, border: '1px solid',
                    borderColor: status === 'Present' ? '#bbf7d0' : status === 'Absent' ? '#fecaca' : 'divider',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Avatar sx={{ width: 38, height: 38, fontSize: '0.85rem', fontWeight: 700, bgcolor: getAvatarColor(student.name) }}>
                        {getInitials(student.name)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>{student.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Roll: {student.roll_number || '—'} · {student.gender || '—'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small" variant="text"
                      onClick={() => setSelectedStudent(student)}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', minWidth: 0 }}
                    >
                      Details
                    </Button>
                  </Box>

                  <AttendancePercentageBar value={student.attendanceSummary?.attendancePercentage || 0} />

                  <Box sx={{ mt: 1.5 }}>
                    {attendanceTaken ? (
                      <Chip
                        size="small"
                        label={status || 'Not Marked'}
                        color={status === 'Present' ? 'success' : status === 'Absent' ? 'error' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      <PresentAbsentToggle
                        disabled={submitting}
                        value={status}
                        onChange={(v) => handleStatusChange(student._id, v)}
                      />
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Stack>

          {/* ── Submit ── */}
          {!attendanceTaken && (
            <>
              <Box
                sx={{
                  mt: 3,
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setConfirmDialog(true)}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                  sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 800, px: 4, py: 1.25, minHeight: 48 }}
                >
                  {submitting ? 'Submitting…' : 'Submit attendance'}
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {presentCount} present · {absentCount} absent · {Math.max(0, students.length - presentCount - absentCount)} unmarked
                </Typography>
              </Box>
              <Box
                sx={{
                  display: { xs: 'block', md: 'none' },
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1100,
                  p: 1.5,
                  pt: 1,
                  bgcolor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
                  pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.75, fontWeight: 600 }}>
                  {presentCount} present · {absentCount} absent
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => setConfirmDialog(true)}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 800, py: 1.35, minHeight: 52 }}
                >
                  {submitting ? 'Submitting…' : 'Submit attendance'}
                </Button>
              </Box>
            </>
          )}
        </>
      )}

      {/* ── Class Schedule ── */}
      {selectedClass && (
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
              cursor: 'pointer',
              minHeight: 44,
            }}
            onClick={() => setScheduleOpen((p) => !p)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setScheduleOpen((p) => !p); } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
              <Schedule color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Class schedule
              </Typography>
              <Chip label={scheduleRows.length} size="small" color="primary" variant="outlined" />
            </Box>
            <IconButton size="small" aria-expanded={scheduleOpen} aria-label={scheduleOpen ? 'Collapse schedule' : 'Expand schedule'}>
              {scheduleOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={scheduleOpen}>
            {/* Mobile: stacked cards */}
            <Stack spacing={1.25} sx={{ display: { xs: 'flex', sm: 'none' } }}>
              {scheduleRows.length > 0 ? scheduleRows.map((p) => (
                <Paper
                  key={p._id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 0.5 }}>
                    {p.subject?.subject_name || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {p.teacher?.name || '—'}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
                    <Chip label={`Start ${moment(p.startTime).format('hh:mm A')}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    <Chip label={`End ${moment(p.endTime).format('hh:mm A')}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                  </Stack>
                </Paper>
              )) : (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography color="text.secondary">No schedule found for this class.</Typography>
                </Paper>
              )}
            </Stack>
            {/* sm+: table with horizontal scroll */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: { xs: 2, md: 3 },
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['Subject', 'Teacher', 'Start', 'End'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduleRows.length > 0 ? scheduleRows.map((p) => (
                      <TableRow key={p._id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{p.subject?.subject_name || '—'}</TableCell>
                        <TableCell>{p.teacher?.name || '—'}</TableCell>
                        <TableCell>
                          <Chip label={moment(p.startTime).format('ddd, hh:mm A')} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={moment(p.endTime).format('ddd, hh:mm A')} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No schedule found for this class.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Collapse>
        </Box>
      )}

      {/* ── Student Detail Dialog ── */}
      <Dialog
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        maxWidth="sm"
        fullWidth
        fullScreen={isSmDown}
        PaperProps={{ sx: { borderRadius: isSmDown ? 0 : 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedStudent && (
              <Avatar sx={{ width: 48, height: 48, fontWeight: 700, bgcolor: getAvatarColor(selectedStudent.name) }}>
                {getInitials(selectedStudent.name)}
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedStudent?.name}</Typography>
              <Typography variant="caption" color="text.secondary">Roll No: {selectedStudent?.roll_number || '—'}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedStudent && (
            <Stack spacing={2}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                {[
                  { icon: <Person />, label: 'Gender', val: selectedStudent.gender },
                  { icon: <CalendarToday />, label: 'Age', val: selectedStudent.age },
                  { icon: <Groups />, label: 'Guardian', val: selectedStudent.guardian },
                  { icon: <Email />, label: 'Email', val: selectedStudent.email },
                ].map(({ icon, label, val }) => (
                  <Box key={label} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'text.secondary' } })}
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{val || '—'}</Typography>
                  </Box>
                ))}
              </Box>

              {selectedStudent.guardian_phone && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">Guardian Phone</Typography>
                  <Box sx={{ mt: 0.3 }}>
                    <Link href={`tel:${selectedStudent.guardian_phone}`} underline="hover" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone sx={{ fontSize: 15 }} />{selectedStudent.guardian_phone}
                    </Link>
                  </Box>
                </Box>
              )}

              <Divider />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">Overall Attendance</Typography>
                  <AttendancePercentageBar value={selectedStudent.attendanceSummary?.attendancePercentage || 0} />
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">Today&apos;s status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={selectedStudent.todayStatus || 'Not Marked'}
                      color={selectedStudent.todayStatus === 'Present' ? 'success' : selectedStudent.todayStatus === 'Absent' ? 'error' : 'default'}
                      variant={selectedStudent.todayStatus ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setSelectedStudent(null)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm Submit Dialog ── */}
      <Dialog
        open={confirmDialog && !attendanceTaken}
        onClose={() => setConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isSmDown}
        PaperProps={{ sx: { borderRadius: isSmDown ? 0 : 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are about to submit attendance for <strong>{selectedClass?.class_text}</strong> on <strong>{todayFormatted}</strong>.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
            <Chip label={`${presentCount} present`} color="success" icon={<CheckCircle />} sx={{ fontWeight: 800 }} />
            <Chip label={`${absentCount} absent`} color="error" icon={<Cancel />} sx={{ fontWeight: 800 }} />
          </Stack>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2, fontSize: '0.8rem' }}>
            This action cannot be undone. Attendance will be locked for today.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setConfirmDialog(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={submitAttendance} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            Confirm & Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '&.MuiSnackbar-root': {
            bottom: { xs: 'calc(96px + env(safe-area-inset-bottom, 0px)) !important', sm: '24px !important' },
          },
        }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: 2.5, fontWeight: 600, boxShadow: 4 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AttendanceTeacher;