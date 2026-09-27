import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Alert,
  Snackbar,
  Pagination,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Class as ClassIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  getFeeAssignmentDashboard,
  getStudentsWithFeeStatus,
  getFeeGroups,
  assignFeeToStudents,
  clearError,
  clearSuccess
} from '../../../state/feeAssignmentSlice';

/* ---------- Animations ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`;
const shift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const NO_MOTION = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// "backwards" fill (not "both") so hover transforms still work after the entrance ends
const enter = (ms = 0) => ({ animation: `${fadeUp} .5s ${EASE} ${ms}ms backwards`, ...NO_MOTION });
const enterRow = (ms = 0) => ({ animation: `${rowIn} .35s ${EASE} ${ms}ms backwards`, ...NO_MOTION });

/* ---------- Design tokens ---------- */
const GRADS = [
  ['#34d399', '#059669'],
  ['#60a5fa', '#4f46e5'],
  ['#a78bfa', '#db2777'],
  ['#fb7185', '#f97316'],
  ['#fbbf24', '#f59e0b'],
  ['#22d3ee', '#0284c7'],
];
const ACCENTS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
const pick = (str, list) =>
  list[[...String(str ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % list.length];

const cardSx = {
  borderRadius: '16px',
  border: '1px solid rgba(148,163,184,.18)',
  boxShadow: '0 6px 20px rgba(15,23,42,.05)',
  transition: `transform .35s ${EASE}, box-shadow .35s ${EASE}`,
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 30px rgba(15,23,42,.09)' },
};

const headSx = {
  '& th': {
    background: 'linear-gradient(90deg,#eef2ff,#fdf2f8)',
    fontSize: 11.5,
    fontWeight: 700,
    color: '#475569',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
};

const fieldSx = {
  '& .MuiInputBase-input': { fontSize: 12.5 },
  '& .MuiInputLabel-root': { fontSize: 12.5 },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    transition: 'box-shadow .25s ease',
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,.15)' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
};

const gradBtn = {
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '10px',
  color: '#fff',
  background: 'linear-gradient(135deg,#6366f1,#a855f7)',
  boxShadow: '0 6px 16px rgba(99,102,241,.35)',
  transition: `transform .25s ${EASE}, box-shadow .25s ${EASE}`,
  '&:hover': {
    background: 'linear-gradient(135deg,#5457e8,#9333ea)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 22px rgba(99,102,241,.45)',
  },
  '&.Mui-disabled': { color: 'rgba(255,255,255,.75)', background: '#cbd5e1', boxShadow: 'none' },
};

const glassBtn = {
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '10px',
  bgcolor: 'rgba(255,255,255,.18)',
  backdropFilter: 'blur(6px)',
  border: '1px solid rgba(255,255,255,.35)',
  transition: `all .25s ${EASE}`,
  '&:hover': { bgcolor: 'rgba(255,255,255,.3)', transform: 'translateY(-2px)' },
};

/* ---------- Small components (outside main so they don't remount/re-animate) ---------- */

// Number that counts up smoothly
function CountUp({ value, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    let raf;
    let start;
    const step = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / 900, 1);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{Math.round(n)}{suffix}</>;
}

function StatCard({ title, value, suffix, subtitle, icon, g, delay = 0 }) {
  return (
    <Card
      sx={{
        ...cardSx,
        ...enter(delay),
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        border: 'none',
        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
        boxShadow: `0 10px 24px ${g[1]}40`,
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 32px ${g[1]}59` },
      }}
    >
      <Box sx={{ position: 'absolute', top: -28, right: -28, width: 96, height: 96, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.16)' }} />
      <Box sx={{ position: 'absolute', bottom: -36, right: 26, width: 66, height: 66, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.10)' }} />
      <CardContent sx={{ p: 2.2, position: 'relative', '&:last-child': { pb: 2.2 } }}>
        <Box sx={{ width: 34, height: 34, borderRadius: '11px', bgcolor: 'rgba(255,255,255,.22)', display: 'grid', placeItems: 'center', mb: 1.5, '& svg': { fontSize: 19 } }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          <CountUp value={value} suffix={suffix} />
        </Typography>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, mt: 0.5, opacity: 0.95 }}>{title}</Typography>
        <Typography sx={{ fontSize: 10.5, opacity: 0.8 }}>{subtitle}</Typography>
      </CardContent>
    </Card>
  );
}

function Pill({ label, color }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.2,
        borderRadius: '8px',
        bgcolor: `${color}1A`,
        color,
        fontSize: 11,
        fontWeight: 700,
        transition: 'transform .2s ease',
        '&:hover': { transform: 'scale(1.08)' },
      }}
    >
      {label}
    </Box>
  );
}

function StatusChip({ assigned, label }) {
  const c = assigned ? '#059669' : '#dc2626';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1,
        py: 0.25,
        borderRadius: '999px',
        bgcolor: assigned ? '#10b9811F' : '#ef44441F',
        color: c,
        fontSize: 10.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'transform .2s ease',
        '&:hover': { transform: 'scale(1.06)' },
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c }} />
      {label}
    </Box>
  );
}

function Initial({ text, g, size = 28 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '10px',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontSize: size * 0.42,
        fontWeight: 700,
        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
      }}
    >
      {String(text ?? '?').charAt(0).toUpperCase()}
    </Box>
  );
}

function SectionTitle({ color, children, hint }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
      <Box sx={{ width: 4, height: 16, borderRadius: 2, bgcolor: color, alignSelf: 'center' }} />
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{children}</Typography>
      {hint && <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>{hint}</Typography>}
    </Box>
  );
}

const FeeAssignmentDashboard = () => {
  const dispatch = useDispatch();
  const {
    dashboard,
    students,
    feeGroups,
    pagination,
    loading,
    studentsLoading,
    feeGroupsLoading,
    assignmentLoading,
    error,
    successMessage
  } = useSelector((state) => state.feeAssignment);

  const { user } = useSelector((state) => state.login);
  
  // Get schoolId from multiple sources
  const getSchoolId = () => {
    // Try Redux user first
    if (user?.school?._id) return user.school._id;
    if (user?.school) return user.school;
    if (user?.schoolId) return user.schoolId;
    
    // Try localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.school?._id) return parsed.school._id;
        if (parsed?.school) return parsed.school;
        if (parsed?.schoolId) return parsed.schoolId;
      }
      
      // Try token decode
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.school) return payload.school;
        if (payload?.schoolId) return payload.schoolId;
      }
    } catch (error) {
      console.error('Error getting schoolId:', error);
    }
    
    return null;
  };
  
  const schoolId = getSchoolId();

  // Debug: Log schoolId
  useEffect(() => {
    console.log('🏫 User from Redux:', user);
    console.log('🏫 School ID:', schoolId);
    if (!schoolId) {
      console.error('❌ Could not determine school ID from any source!');
    }
  }, [user, schoolId]);

  // State
  const [filters, setFilters] = useState({
    session: new Date().getFullYear().toString(),
    classId: '',
    section: '',
    feeStatus: '',
    studentStatus: '',
    search: '',
    page: 1,
    limit: 20
  });

  // Filter options from backend (database-driven)
  const classOptions = dashboard?.filters?.classes || [];
  const sectionOptions = dashboard?.filters?.sections || [];
  const feeStatusOptions = dashboard?.filters?.feeStatuses || [];
  const studentStatusOptions = dashboard?.filters?.studentStatuses || [];

  // Debug: Log filter options
  useEffect(() => {
    console.log('📚 Full Dashboard State:', dashboard);
    console.log('📚 Dashboard Filters:', dashboard?.filters);
    console.log('📚 Classes from dashboard:', dashboard?.filters?.classes);
    console.log('📚 classOptions variable:', classOptions);
    console.log('📚 Classes Count:', classOptions.length);
    if (classOptions.length > 0) {
      console.log('📚 First class:', classOptions[0]);
    } else {
      console.warn('⚠️ No classes available! Dashboard filters:', dashboard?.filters);
    }
  }, [dashboard, classOptions]);

  // Show alert if no classes after loading
  useEffect(() => {
    if (!loading && classOptions.length === 0) {
      console.error('❌ No classes loaded even after dashboard finished loading!');
    }
  }, [loading, classOptions]);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedFeeGroup, setSelectedFeeGroup] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data on mount
  useEffect(() => {
    if (!schoolId) {
      console.error('❌ School ID not found! Cannot fetch dashboard data.');
      return;
    }
    
    console.log('✅ Fetching dashboard data for schoolId:', schoolId);
    
    // Force fetch dashboard data
    dispatch(getFeeAssignmentDashboard({
      schoolId,
      session: filters.session
    })).then((result) => {
      console.log('📊 Dashboard API Response:', result);
      if (result.payload) {
        console.log('📊 Filters from API:', result.payload.filters);
      }
    });
    
    dispatch(getFeeGroups(schoolId));
    fetchStudents();
  }, [schoolId, dispatch]);

  // Fetch students when filters change
  useEffect(() => {
    if (schoolId) {
      fetchStudents();
    }
  }, [filters.page, filters.classId, filters.section, filters.feeStatus, filters.studentStatus, filters.search]);

  const fetchStudents = () => {
    dispatch(getStudentsWithFeeStatus({
      schoolId,
      filters
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchStudents();
  };

  const handleResetFilters = () => {
    const resetValues = {
      session: new Date().getFullYear().toString(),
      classId: '',
      section: '',
      feeStatus: '',
      studentStatus: '',
      search: '',
      page: 1,
      limit: 20
    };
    setFilters(resetValues);
    setSelectedStudents([]);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const notAssignedIds = students
        .filter(s => s.feeStatus === 'Not Assigned')
        .map(s => s._id);
      setSelectedStudents(notAssignedIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleAssignFee = async () => {
    if (!selectedFeeGroup || selectedStudents.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select fee group and students',
        severity: 'warning'
      });
      return;
    }

    const assignmentData = {
      studentIds: selectedStudents,
      feeGroupId: selectedFeeGroup,
      session: filters.session,
      feeTypes: [], // Will be filled from fee group
      remarks: ''
    };

    const result = await dispatch(assignFeeToStudents({
      schoolId,
      assignmentData
    }));

    if (result.type.includes('fulfilled')) {
      setSnackbar({
        open: true,
        message: result.payload.message,
        severity: 'success'
      });
      setOpenAssignDialog(false);
      setSelectedStudents([]);
      setSelectedFeeGroup('');

      // Refresh data
      dispatch(getFeeAssignmentDashboard({
        schoolId,
        session: filters.session
      }));
      fetchStudents();
    }
  };

  const handleRefresh = () => {
    dispatch(getFeeAssignmentDashboard({
      schoolId,
      session: filters.session
    }));
    fetchStudents();
  };

  const handleExport = () => {
    // Export to Excel logic
    const csvContent = "data:text/csv;charset=utf-8,"
      + "S.No,Adm No,Name,Class,Section,Fee Status,Fee Group,Total Fee,Balance\n"
      + students.map((student, index) =>
          `${index + 1},${student.admissionNo},${student.name},${student.class},${student.section},${student.feeStatus},${student.feeGroup},${student.totalFee},${student.balance}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fee_assignment_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const notAssignedCount = students.filter(s => s.feeStatus === 'Not Assigned').length;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: '100vh',
        background:
          'radial-gradient(900px 420px at 0% 0%, rgba(99,102,241,.10), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(244,63,94,.08), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(16,185,129,.08), transparent 60%), #f8fafc',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          ...enter(0),
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2.5,
          borderRadius: '18px',
          color: '#fff',
          background: 'linear-gradient(120deg,#6366f1 0%,#a855f7 45%,#ec4899 75%,#f97316 100%)',
          backgroundSize: '200% 200%',
          animation: `${fadeUp} .5s ${EASE} backwards, ${shift} 12s ease infinite`,
          boxShadow: '0 12px 28px rgba(124,58,237,.30)',
          ...NO_MOTION,
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: 120, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.12)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: -20, width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.10)' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, md: 20 }, letterSpacing: '-0.02em' }}>
            Fee Assignment Dashboard
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.92, mt: 0.4 }}>
            Students with and without a fee group for the current session
          </Typography>
          <Box sx={{ mt: 1, display: 'inline-flex', px: 1.25, py: 0.3, borderRadius: '999px', bgcolor: 'rgba(255,255,255,.22)', fontSize: 10.5, fontWeight: 600 }}>
            Session {dashboard?.session || filters.session}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
          <Button startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} onClick={handleRefresh} size="small" sx={glassBtn}>
            Refresh
          </Button>
          <Button startIcon={<ExportIcon sx={{ fontSize: 16 }} />} onClick={handleExport} size="small" sx={glassBtn}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {loading ? (
        <LinearProgress
          sx={{
            mb: 3,
            height: 6,
            borderRadius: 3,
            bgcolor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg,#6366f1,#ec4899,#f97316)',
              borderRadius: 3,
            },
          }}
        />
      ) : (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Students"
              value={dashboard.totalStudents}
              subtitle={`${dashboard.totalStudents} students`}
              icon={<PeopleIcon />}
              g={GRADS[1]}
              delay={60}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Fee Assigned"
              value={dashboard.feeAssigned}
              subtitle={`${((dashboard.feeAssigned / dashboard.totalStudents) * 100 || 0).toFixed(1)}% of students`}
              icon={<CheckCircleIcon />}
              g={GRADS[0]}
              delay={120}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Fee Not Assigned"
              value={dashboard.feeNotAssigned}
              subtitle={`${dashboard.feeNotAssigned} students pending`}
              icon={<CancelIcon />}
              g={GRADS[3]}
              delay={180}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Grades Covered"
              value={dashboard.gradesCovered}
              suffix={` / ${dashboard.totalGrades}`}
              subtitle="grades fully assigned"
              icon={<ClassIcon />}
              g={GRADS[4]}
              delay={240}
            />
          </Grid>
        </Grid>
      )}

      {/* Grade-wise Breakdown */}
      <Card sx={{ ...cardSx, ...enter(300), mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <SectionTitle color="#6366f1" hint="Click a row to filter the list below">
            Grade-wise Breakdown
          </SectionTitle>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={headSx}>
                  <TableCell>Grade / Class</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Assigned</TableCell>
                  <TableCell align="right">Not Assigned</TableCell>
                  <TableCell align="right" sx={{ minWidth: 180 }}>Coverage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboard.gradeWiseBreakdown.map((grade, index) => {
                  const g = GRADS[index % GRADS.length];
                  const done = grade.coverage === 100;
                  return (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        ...enterRow(index * 40),
                        cursor: 'pointer',
                        transition: 'background .25s ease',
                        '& td': { fontSize: 12.5, borderBottom: '1px solid #f1f5f9' },
                        '&:hover': { bgcolor: `${g[1]}0D` },
                      }}
                      onClick={() => {
                        // Filter students by this grade
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Initial text={grade.className} g={g} />
                          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{grade.className}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right"><Pill label={grade.total} color="#3b82f6" /></TableCell>
                      <TableCell align="right"><Pill label={grade.assigned} color="#10b981" /></TableCell>
                      <TableCell align="right">
                        <Pill label={grade.notAssigned} color={grade.notAssigned > 0 ? '#ef4444' : '#94a3b8'} />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={grade.coverage || 0}
                            sx={{
                              flex: 1,
                              height: 7,
                              borderRadius: 4,
                              bgcolor: '#e2e8f0',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                transition: `transform 1.1s ${EASE}`,
                                background: done
                                  ? 'linear-gradient(90deg,#34d399,#059669)'
                                  : 'linear-gradient(90deg,#fbbf24,#f97316,#ec4899)',
                              },
                            }}
                          />
                          <Typography sx={{ fontSize: 11, minWidth: 38, textAlign: 'right', fontWeight: 700, color: done ? '#059669' : '#f97316' }}>
                            {(grade.coverage || 0).toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card sx={{ ...cardSx, ...enter(360) }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center" mb={2}>
            <SectionTitle color="#ec4899">Student List</SectionTitle>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              disabled={selectedStudents.length === 0}
              onClick={() => setOpenAssignDialog(true)}
              sx={{ ...gradBtn, mb: 2 }}
            >
              Assign Fee ({selectedStudents.length})
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Class"
                value={filters.classId}
                onChange={(e) => handleFilterChange('classId', e.target.value)}
                size="small"
                sx={fieldSx}
                helperText={`${classOptions.length} classes available`}
              >
                <MenuItem value="" sx={{ fontSize: 12.5 }}>All Classes</MenuItem>
                {classOptions.length === 0 && (
                  <MenuItem disabled sx={{ fontSize: 12.5, color: '#ef4444' }}>
                    No classes found
                  </MenuItem>
                )}
                {classOptions.map((cls, idx) => {
                  console.log(`Rendering class ${idx}:`, cls);
                  return (
                    <MenuItem key={cls._id || cls.value || `cls-${idx}`} value={cls._id || cls.value} sx={{ fontSize: 12.5 }}>
                      {cls.name || cls.label || cls.class_text || 'Class'}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Section"
                value={filters.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                size="small"
                sx={fieldSx}
              >
                <MenuItem value="" sx={{ fontSize: 12.5 }}>All Sections</MenuItem>
                {sectionOptions.map((section, idx) => (
                  <MenuItem 
                    key={section.value || section || `section-${idx}`} 
                    value={section.value || section} 
                    sx={{ fontSize: 12.5 }}
                  >
                    {section.label || section}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Fee Status"
                value={filters.feeStatus}
                onChange={(e) => handleFilterChange('feeStatus', e.target.value)}
                size="small"
                sx={fieldSx}
              >
                <MenuItem value="" sx={{ fontSize: 12.5 }}>All Students</MenuItem>
                {feeStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: 12.5, color: option.value === 'Assigned' ? '#059669' : '#dc2626' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Student Status"
                value={filters.studentStatus}
                onChange={(e) => handleFilterChange('studentStatus', e.target.value)}
                size="small"
                sx={fieldSx}
              >
                <MenuItem value="" sx={{ fontSize: 12.5 }}>All Status</MenuItem>
                {studentStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: 12.5 }}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search name, admission no..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={handleSearch} size="small" sx={{ fontSize: 11.5, textTransform: 'none', fontWeight: 600, color: '#6366f1' }}>
                        Search
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                onClick={handleResetFilters}
                sx={{
                  height: '100%',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '10px',
                  color: '#ec4899',
                  borderColor: '#ec489966',
                  transition: `all .25s ${EASE}`,
                  '&:hover': { borderColor: '#ec4899', bgcolor: '#fdf2f8', transform: 'translateY(-2px)' },
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>

          {/* Table */}
          {studentsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#a855f7' }} />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={headSx}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          sx={{ color: '#a5b4fc', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#6366f1' } }}
                          indeterminate={selectedStudents.length > 0 && selectedStudents.length < notAssignedCount}
                          checked={notAssignedCount > 0 && selectedStudents.length === notAssignedCount}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>S.No</TableCell>
                      <TableCell>Adm No</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Section</TableCell>
                      <TableCell>Father Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Fee Status</TableCell>
                      <TableCell>Fee Groups</TableCell>
                      <TableCell align="right">Total Fee</TableCell>
                      <TableCell align="right">Paid</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => {
                      const g = GRADS[(index + 1) % GRADS.length];
                      return (
                        <TableRow
                          key={student._id}
                          hover
                          selected={selectedStudents.includes(student._id)}
                          sx={{
                            ...enterRow(Math.min(index, 12) * 30),
                            transition: 'background .25s ease',
                            '& td': { fontSize: 12.5, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
                            '&:hover': { bgcolor: '#f5f7ff' },
                            '&.Mui-selected, &.Mui-selected:hover': { bgcolor: '#eef2ff' },
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              sx={{ color: '#a5b4fc', '&.Mui-checked': { color: '#6366f1' } }}
                              checked={selectedStudents.includes(student._id)}
                              onChange={() => handleSelectStudent(student._id)}
                              disabled={student.feeStatus === 'Assigned'}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#94a3b8' }}>{(pagination.currentPage - 1) * pagination.recordsPerPage + index + 1}</TableCell>
                          <TableCell>{student.admissionNo}</TableCell>
                          <TableCell sx={{ color: '#64748b' }}>{student.admissionNo}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Initial text={student.name} g={g} size={26} />
                              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{student.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Pill label={student.class} color={pick(student.class, ACCENTS)} /></TableCell>
                          <TableCell>
                            {student.section ? <Pill label={student.section} color={pick(student.section, ACCENTS)} /> : '-'}
                          </TableCell>
                          <TableCell>{student.fatherName || '-'}</TableCell>
                          <TableCell>{student.contact || '-'}</TableCell>
                          <TableCell>
                            <StatusChip assigned={student.feeStatus === 'Assigned'} label={student.feeStatus} />
                          </TableCell>
                          <TableCell sx={{ color: '#7c3aed', fontWeight: 500 }}>{student.feeGroup}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#1e293b' }}>₹{student.totalFee}</TableCell>
                          <TableCell align="right" sx={{ color: '#059669', fontWeight: 600 }}>₹{student.paidAmount}</TableCell>
                          <TableCell align="right" sx={{ color: student.balance > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>₹{student.balance}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center" mt={2}>
                <Typography sx={{ fontSize: 11.5, color: '#64748b' }}>
                  Total {pagination.totalRecords} students | {selectedStudents.length} selected | {pagination.currentPage} / {pagination.totalPages} pages
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={(e, page) => handleFilterChange('page', page)}
                  size="small"
                  sx={{
                    '& .MuiPaginationItem-root': { fontSize: 12, transition: `all .25s ${EASE}` },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      color: '#fff',
                      background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                      boxShadow: '0 4px 10px rgba(99,102,241,.35)',
                    },
                  }}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign Fee Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '18px', animation: `${popIn} .35s ${EASE}`, ...NO_MOTION } }}
      >
        <DialogTitle
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(120deg,#6366f1,#a855f7,#ec4899)',
          }}
        >
          Assign Fee Group
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ mt: 2, mb: 2, display: 'inline-flex', px: 1.25, py: 0.4, borderRadius: '999px', bgcolor: '#6366f11A', color: '#4f46e5', fontSize: 12, fontWeight: 600 }}>
            Assigning fee to {selectedStudents.length} student(s)
          </Box>
          <FormControl fullWidth sx={{ mt: 1, ...fieldSx }} size="small">
            <InputLabel>Select Fee Group</InputLabel>
            <Select
              value={selectedFeeGroup}
              onChange={(e) => setSelectedFeeGroup(e.target.value)}
              label="Select Fee Group"
              sx={{ fontSize: 13 }}
            >
              {feeGroups.map((group) => (
                <MenuItem key={group._id} value={group._id} sx={{ fontSize: 13 }}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAssignDialog(false)} sx={{ fontSize: 12.5, textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignFee}
            variant="contained"
            disabled={!selectedFeeGroup || assignmentLoading}
            sx={gradBtn}
          >
            {assignmentLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Assign Fee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ fontSize: 12.5, borderRadius: '12px', boxShadow: '0 10px 24px rgba(15,23,42,.18)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeeAssignmentDashboard;