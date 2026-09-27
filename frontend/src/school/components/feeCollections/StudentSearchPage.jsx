import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Avatar,
  Chip,
  InputAdornment,
  Pagination,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha, styled, keyframes } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  fetchFeeStudents,
  setFeeFilters,
  setSelectedStudent,
  clearFeeMessages,
  selectFeeCollectionFilters,
  getStudentFeesForCollection,
} from "../../../state/feeCollectionSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import PrintReceipt from "./PrintReceipt";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  primaryDark: "#6D28D9",
  white: "#FFFFFF",
  purple50: "#FAF5FF",
  purple100: "#F3E8FF",
  purple200: "#E9D5FF",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageContainer = styled(Box)(({ theme }) => ({
  padding: "clamp(16px, 3vw, 32px)",
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${BRAND.purple50} 0%, ${BRAND.white} 50%, ${BRAND.purple50} 100%)`,
  fontFamily: "'DM Sans', sans-serif",
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === "dark"
    ? "rgba(30,41,59,0.8)"
    : "rgba(255,255,255,0.95)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${alpha(BRAND.primary, 0.15)}`,
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeIn} 0.4s ease`,
}));

const StudentCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === "dark"
    ? "rgba(30,41,59,0.9)"
    : BRAND.white,
  border: `1px solid ${alpha(BRAND.primary, 0.1)}`,
  borderRadius: 12,
  transition: "all 0.25s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 32px ${alpha(BRAND.primary, 0.2)}`,
    borderColor: alpha(BRAND.primary, 0.3),
  },
}));

const SearchField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    background: BRAND.white,
    "& fieldset": {
      borderColor: alpha(BRAND.primary, 0.2),
    },
    "&:hover fieldset": {
      borderColor: alpha(BRAND.primary, 0.4),
    },
    "&.Mui-focused fieldset": {
      borderColor: BRAND.primary,
      borderWidth: 2,
    },
  },
});

const PrimaryButton = styled(Button)({
  borderRadius: 10,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "1rem",
  padding: "12px 28px",
  background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
  boxShadow: `0 4px 16px ${alpha(BRAND.primary, 0.3)}`,
  "&:hover": {
    background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%)`,
    boxShadow: `0 6px 24px ${alpha(BRAND.primary, 0.4)}`,
    transform: "translateY(-2px)",
  },
});

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getAvatarColor = (name = "") => {
  const colors = [
    "#7C3AED", "#6D28D9", "#059669", "#dc2626", "#0284c7",
    "#db2777", "#0891b2", "#65a30d", "#9333ea", "#ea580c",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

// ─── Format Currency ──────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentSearchPage() {
  useDocumentTitle("Collect Fee - Search Student");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    students,
    studentsPagination,
    studentsLoading,
    error,
    studentFeesForCollection,
    feeAssignments,
  } = useSelector((s) => s.feeCollection);
  const filters = useSelector(selectFeeCollectionFilters);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef(null);
  
  // View Receipt Dialog State
  const [viewReceiptDialog, setViewReceiptDialog] = useState(false);
  const [selectedStudentForReceipt, setSelectedStudentForReceipt] = useState(null);
  const [printDialog, setPrintDialog] = useState(false);

  // ─── Fetch Students ───────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    console.log('Fetching students with filters:', filters);
    dispatch(fetchFeeStudents(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Log students data for debugging
  useEffect(() => {
    console.log('Students data:', { students, studentsPagination, studentsLoading, error });
  }, [students, studentsPagination, studentsLoading, error]);

  // Log dialog state for debugging
  useEffect(() => {
    console.log('📊 Dialog State:', { 
      viewReceiptDialog, 
      selectedStudentForReceipt,
      feeAssignments: feeAssignments?.length || 0,
      studentFeesForCollection: studentFeesForCollection ? 'loaded' : 'not loaded'
    });
  }, [viewReceiptDialog, selectedStudentForReceipt, feeAssignments, studentFeesForCollection]);

  // ─── Handle Search ────────────────────────────────────────────────────────
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setFeeFilters({ search: value }));
    }, 400);
  };

  // ─── Handle Filter Change ─────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    dispatch(setFeeFilters({ [key]: value }));
  };

  // ─── Handle Student Select ────────────────────────────────────────────────
  const handleStudentSelect = (student) => {
    dispatch(setSelectedStudent(student));
    navigate(`/school/fee-collection/collect/${student._id}`);
  };

  // ─── Handle View Receipt ──────────────────────────────────────────────────
  const handleViewReceipt = async (student) => {
    console.log('🔍 View Receipt clicked for student:', student);
    setSelectedStudentForReceipt(student);
    setViewReceiptDialog(true); // Open dialog first
    // Fetch student fees
    try {
      const result = await dispatch(getStudentFeesForCollection(student._id));
      console.log('📊 Fees fetched:', result);
    } catch (error) {
      console.error('❌ Error fetching fees:', error);
    }
  };

  // ─── Handle Print Receipt ─────────────────────────────────────────────────
  const handlePrintReceipt = () => {
    setPrintDialog(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // ─── Clear Filters ────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchInput("");
    dispatch(setFeeFilters({ search: "", classId: "", section: "", page: 1 }));
  };

  // ─── Clear Messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearFeeMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  return (
    <PageContainer>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            boxShadow: `0 4px 16px ${alpha(BRAND.primary, 0.3)}`,
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: 22, color: BRAND.white }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: BRAND.primary,
              letterSpacing: "-0.5px",
              fontSize: "1.5rem",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Collect Fee {studentsPagination.total > 0 && `(${studentsPagination.total} Students)`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
            Search and select a student to collect fees
          </Typography>
        </Box>
      </Stack>

      {/* ── Search & Filters ──────────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 3, mb: 3 }}>
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 2, p: 2, bgcolor: alpha(BRAND.primary, 0.05), borderRadius: 2, fontSize: "0.75rem", fontFamily: "monospace" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, mb: 1 }}>Debug Info:</Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>Loading: {studentsLoading ? 'Yes' : 'No'}</Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>Students Count: {students.length}</Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>Total: {studentsPagination.total}</Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>Page: {studentsPagination.page} / {studentsPagination.pages}</Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>Filters: {JSON.stringify(filters)}</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: alpha("#dc2626", 0.1), borderRadius: 2, border: `1px solid ${alpha("#dc2626", 0.3)}` }}>
            <Typography sx={{ fontSize: "0.85rem", color: "#dc2626", fontWeight: 600 }}>
              Error: {error}
            </Typography>
          </Box>
        )}
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={{ xs: 12, md: 6 }}>
            <SearchField
              fullWidth
              size="small"
              placeholder="Search by name, admission no, roll no, father name, mobile..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {studentsLoading ? (
                        <CircularProgress size={18} sx={{ color: BRAND.primary }} />
                      ) : (
                        <SearchIcon sx={{ fontSize: 20, color: "text.disabled" }} />
                      )}
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleSearchChange("")}
                        sx={{ color: "text.disabled" }}
                      >
                        <ClearIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
            <SearchField
              fullWidth
              size="small"
              select
              label="Class"
              value={filters.classId}
              onChange={(e) => handleFilterChange("classId", e.target.value)}
            >
              <MenuItem value="">All Classes</MenuItem>
              {/* Add class options from API */}
            </SearchField>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
            <SearchField
              fullWidth
              size="small"
              select
              label="Section"
              value={filters.section}
              onChange={(e) => handleFilterChange("section", e.target.value)}
            >
              <MenuItem value="">All Sections</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
            </SearchField>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 2 }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={fetchData}
                  sx={{
                    border: `1px solid ${alpha(BRAND.primary, 0.2)}`,
                    borderRadius: 2,
                    color: BRAND.primary,
                    "&:hover": { bgcolor: alpha(BRAND.primary, 0.08) },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              {(filters.search || filters.classId || filters.section) && (
                <Tooltip title="Clear Filters">
                  <IconButton
                    onClick={handleClearFilters}
                    sx={{
                      border: `1px solid ${alpha("#dc2626", 0.2)}`,
                      borderRadius: 2,
                      color: "#dc2626",
                      "&:hover": { bgcolor: alpha("#dc2626", 0.08) },
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Grid2>
        </Grid2>
      </GlassCard>

      {/* ── Student List ──────────────────────────────────────────────────── */}
      {studentsLoading && students.length === 0 ? (
        <GlassCard elevation={0} sx={{ p: 2 }}>
          <Stack spacing={1}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={60} />
            ))}
          </Stack>
        </GlassCard>
      ) : students.length === 0 ? (
        <GlassCard elevation={0} sx={{ p: 6, textAlign: "center" }}>
          <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: "1rem" }}>
            No students found
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.8rem" }}>
            Try adjusting your search or filters
          </Typography>
        </GlassCard>
      ) : (
        <>
          <GlassCard elevation={0} sx={{ p: 0, overflow: "hidden" }}>
            <Box sx={{ p: 2, bgcolor: alpha(BRAND.primary, 0.05), borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.primary }}>
                Student List
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BRAND.primary, 0.03) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }}>Section</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }}>Admission No</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }}>Father Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }}>Date Of Birth</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }}>Mobile No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student, i) => {
                    const fullName = student.firstName 
                      ? `${student.firstName} ${student.lastName || ""}`.trim()
                      : student.studentName || "Unknown";
                    
                    return (
                      <TableRow
                        key={student._id}
                        hover
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: alpha(BRAND.primary, 0.03) },
                          animation: `${fadeIn} 0.3s ease ${i * 0.03}s both`,
                        }}
                      >
                        <TableCell sx={{ fontSize: "0.95rem", py: 1.5 }}>
                          {student.class?.className || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", py: 1.5 }}>
                          {student.section || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", py: 1.5 }}>
                          {student.admissionNo || student.admissionNumber || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", py: 1.5, fontWeight: 600, color: BRAND.primary }}>
                          {fullName}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", py: 1.5 }}>
                          {student.fatherName || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", py: 1.5 }}>
                          {student.dateOfBirth 
                            ? new Date(student.dateOfBirth).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.95rem", py: 1.5 }}>
                          {student.mobileNumber || "N/A"}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Receipt">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('🧾 Receipt icon clicked for:', student);
                                  handleViewReceipt(student);
                                }}
                                sx={{
                                  color: BRAND.primary,
                                  border: `1px solid ${alpha(BRAND.primary, 0.2)}`,
                                  borderRadius: 1.5,
                                  "&:hover": { 
                                    bgcolor: alpha(BRAND.primary, 0.08),
                                    borderColor: BRAND.primary,
                                  },
                                }}
                              >
                                <ReceiptIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleStudentSelect(student)}
                              sx={{
                                fontSize: "0.75rem",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2,
                                py: 0.5,
                                borderRadius: 1.5,
                                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
                                "&:hover": {
                                  background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%)`,
                                },
                              }}
                            >
                              Collect Fees
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                Records: 1 to {students.length} of {studentsPagination.total}
              </Typography>
            </Box>
          </GlassCard>

          {/* ── Pagination ────────────────────────────────────────────────── */}
          {studentsPagination.pages > 1 && (
            <GlassCard elevation={0} sx={{ p: 2, mt: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Showing {students.length} of {studentsPagination.total} students
                </Typography>
                <Pagination
                  count={studentsPagination.pages}
                  page={studentsPagination.page}
                  onChange={(_, page) => handleFilterChange("page", page)}
                  color="primary"
                  size="small"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    },
                    "& .Mui-selected": {
                      background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%) !important`,
                      color: "white !important",
                    },
                  }}
                />
              </Stack>
            </GlassCard>
          )}
        </>
      )}

      {/* ── View Receipt Dialog ───────────────────────────────────────────── */}
      <Dialog
        open={viewReceiptDialog}
        onClose={() => {
          console.log('🚪 Closing View Receipt Dialog');
          setViewReceiptDialog(false);
          setSelectedStudentForReceipt(null);
        }}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}`, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.primary }}>
                Student Fee Receipt
              </Typography>
              {selectedStudentForReceipt && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                  {selectedStudentForReceipt.firstName} {selectedStudentForReceipt.lastName} ({selectedStudentForReceipt.admissionNo || selectedStudentForReceipt.admissionNumber})
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrintReceipt}
                disabled={!feeAssignments || feeAssignments.length === 0}
                sx={{
                  textTransform: "none",
                  fontSize: "0.85rem",
                  bgcolor: BRAND.primary,
                  "&:hover": { bgcolor: BRAND.primaryDark },
                }}
              >
                Print
              </Button>
              <IconButton
                size="small"
                onClick={() => {
                  setViewReceiptDialog(false);
                  setSelectedStudentForReceipt(null);
                }}
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: alpha(BRAND.primary, 0.1) },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, minHeight: 300 }}>
          {studentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress sx={{ color: BRAND.primary }} size={50} />
                <Typography variant="body2" color="text.secondary">
                  Loading fee details...
                </Typography>
              </Stack>
            </Box>
          ) : !feeAssignments || feeAssignments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <ReceiptIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Fees Found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                This student has no fee records yet
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Summary Cards */}
              <Grid2 container spacing={2} sx={{ mb: 3 }}>
                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(BRAND.primary, 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha(BRAND.primary, 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.primary, fontSize: "1.1rem" }}>
                      {formatCurrency(feeAssignments.reduce((sum, f) => sum + f.amount, 0))}
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha("#10B981", 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha("#10B981", 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Paid Amount
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#10B981", fontSize: "1.1rem" }}>
                      {formatCurrency(feeAssignments.reduce((sum, f) => sum + f.paidAmount, 0))}
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha("#F59E0B", 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha("#F59E0B", 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Discount
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#F59E0B", fontSize: "1.1rem" }}>
                      {formatCurrency(feeAssignments.reduce((sum, f) => sum + f.discountAmount, 0))}
                    </Typography>
                  </Box>
                </Grid2>
                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha("#EF4444", 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha("#EF4444", 0.2)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                      Balance
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#EF4444", fontSize: "1.1rem" }}>
                      {formatCurrency(feeAssignments.reduce((sum, f) => sum + f.balance, 0))}
                    </Typography>
                  </Box>
                </Grid2>
              </Grid2>

              {/* Fees Table */}
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(BRAND.primary, 0.05) }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Fees Group</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Fees Code</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }} align="right">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }} align="right">Paid</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }} align="right">Discount</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }} align="right">Fine</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }} align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeAssignments.map((fee, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontSize: "0.75rem" }}>{fee.feeMaster?.feesGroup || "N/A"}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>{fee.feeMaster?.feesCode || "N/A"}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>{formatDate(fee.dueDate)}</TableCell>
                        <TableCell>
                          <Chip
                            label={fee.status}
                            size="small"
                            sx={{
                              bgcolor:
                                fee.status === "Paid"
                                  ? alpha("#10B981", 0.1)
                                  : fee.status === "Partial"
                                  ? alpha("#F59E0B", 0.1)
                                  : alpha("#EF4444", 0.1),
                              color:
                                fee.status === "Paid"
                                  ? "#10B981"
                                  : fee.status === "Partial"
                                  ? "#F59E0B"
                                  : "#EF4444",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {formatCurrency(fee.amount)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>
                          {formatCurrency(fee.paidAmount)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.75rem" }}>
                          {formatCurrency(fee.discountAmount)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.75rem" }}>
                          {formatCurrency(fee.fineAmount)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 600 }}>
                          {formatCurrency(fee.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <Button
            onClick={() => setViewReceiptDialog(false)}
            sx={{
              textTransform: "none",
              fontSize: "0.85rem",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Print Receipt Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={printDialog}
        onClose={() => setPrintDialog(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}`, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.primary }}>
              Fee Receipt
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  textTransform: "none",
                  fontSize: "0.85rem",
                  bgcolor: BRAND.primary,
                  "&:hover": { bgcolor: BRAND.primaryDark },
                }}
              >
                Print
              </Button>
              <IconButton
                size="small"
                onClick={() => setPrintDialog(false)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: alpha(BRAND.primary, 0.1) },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {studentFeesForCollection && feeAssignments && (
            <PrintReceipt
              student={studentFeesForCollection}
              feeAssignments={feeAssignments}
              schoolInfo={{
                name: "School Name",
                address: "School Address",
                logo: null,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
