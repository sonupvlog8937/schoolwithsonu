import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  Payments as PaymentsIcon,
} from "@mui/icons-material";
import { alpha, styled, keyframes } from "@mui/material/styles";
import axios from "axios";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import {
  fetchFeeStudents,
  setFeeFilters,
  setSelectedStudent,
  clearFeeMessages,
  selectFeeCollectionFilters,
} from "../../../state/feeCollectionSlice";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  primaryDark: "#6D28D9",
  white: "#FFFFFF",
  purple50: "#FAF5FF",
  purple100: "#F3E8FF",
  purple200: "#E9D5FF",
  gray: "#6B7280",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageContainer = styled(Box)({
  padding: "clamp(16px, 3vw, 32px)",
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${BRAND.purple50} 0%, ${BRAND.white} 50%, ${BRAND.purple50} 100%)`,
});

const GlassCard = styled(Paper)({
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${alpha(BRAND.primary, 0.15)}`,
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeIn} 0.4s ease`,
});

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

const SelectField = styled(FormControl)({
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeesCollection() {
  useDocumentTitle("Collect Fees");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    students,
    studentsPagination,
    studentsLoading,
    error,
  } = useSelector((s) => s.feeCollection);
  const filters = useSelector(selectFeeCollectionFilters);

  const [classes, setClasses] = useState([]);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef(null);

  // ─── Fetch Classes ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/api/class/all");
        setClasses(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // ─── Fetch Students ───────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    console.log('Fetching students with filters:', filters);
    dispatch(fetchFeeStudents(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Handle Search ────────────────────────────────────────────────────────
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setFeeFilters({ search: value, page: 1 }));
    }, 400);
  };

  // ─── Handle Filter Change ─────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    dispatch(setFeeFilters({ [key]: value, page: 1 }));
  };

  // ─── Handle Student Select ────────────────────────────────────────────────
  const handleStudentSelect = (student) => {
    dispatch(setSelectedStudent(student));
    navigate(`/school/fee-collection/collect/${student._id}`);
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

  // Get unique sections from students
  const sections = [...new Set(students.map(s => s.section).filter(Boolean))];

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
            }}
          >
            Collect Fees {studentsPagination.total > 0 && `(${studentsPagination.total} Students)`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
            Search and select a student to collect fees
          </Typography>
        </Box>
      </Stack>

      {/* ── Error Display ─────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => dispatch(clearFeeMessages())}>
          {error}
        </Alert>
      )}

      {/* ── Select Criteria Card ──────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.primary, mb: 2 }}>
          Select Criteria
        </Typography>
        
        <Grid2 container spacing={2} alignItems="flex-end">
          {/* Class Filter */}
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField fullWidth size="small">
              <InputLabel>Class *</InputLabel>
              <Select
                value={filters.classId || ""}
                label="Class *"
                onChange={(e) => handleFilterChange("classId", e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.className || cls.class_text}
                  </MenuItem>
                ))}
              </Select>
            </SelectField>
          </Grid2>

          {/* Section Filter */}
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField fullWidth size="small">
              <InputLabel>Section</InputLabel>
              <Select
                value={filters.section || ""}
                label="Section"
                onChange={(e) => handleFilterChange("section", e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                {sections.map((section) => (
                  <MenuItem key={section} value={section}>
                    {section}
                  </MenuItem>
                ))}
              </Select>
            </SelectField>
          </Grid2>

          {/* Search Field */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <SearchField
              fullWidth
              size="small"
              placeholder="Search By Student Name, Roll Number, Enroll Number, National Id, Local Id Etc."
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

          {/* Action Buttons */}
          <Grid2 size={{ xs: 12, md: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchData}
                startIcon={<SearchIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${BRAND.gray} 0%, #4B5563 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, #4B5563 0%, ${BRAND.gray} 100%)`,
                  },
                }}
              >
                Search
              </Button>
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
            </Stack>
          </Grid2>
        </Grid2>
      </GlassCard>

      {/* ── Student List Card ─────────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ p: 2, bgcolor: alpha(BRAND.primary, 0.05), borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.primary }}>
            Student List
          </Typography>
        </Box>

        {/* Loading State */}
        {studentsLoading && students.length === 0 ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        ) : students.length === 0 ? (
          // Empty State
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Box
              component="img"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg fill='%23E5E7EB'%3E%3Crect x='60' y='40' width='80' height='100' rx='4'/%3E%3Crect x='70' y='60' width='60' height='4' rx='2'/%3E%3Crect x='70' y='75' width='60' height='4' rx='2'/%3E%3Crect x='70' y='90' width='40' height='4' rx='2'/%3E%3C/g%3E%3C/svg%3E"
              sx={{ width: 120, height: 120, opacity: 0.5, mb: 2, mx: "auto" }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: "1rem" }}>
              No data available in table
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.85rem", mb: 2 }}>
              ← Add new record or search with different criteria.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
              Records: 0 to 0 of 0
            </Typography>
          </Box>
        ) : (
          // Table with Data
          <>
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
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.secondary", py: 1.5 }} align="center">Action</TableCell>
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
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PaymentsIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleStudentSelect(student)}
                            sx={{
                              fontSize: "0.9rem",
                              textTransform: "none",
                              fontWeight: 600,
                              px: 2,
                              py: 0.75,
                              borderRadius: 1.5,
                              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
                              "&:hover": {
                                background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%)`,
                              },
                            }}
                          >
                            Collect Fees
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer with Record Count */}
            <Box sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.primary, 0.1)}`, bgcolor: alpha(BRAND.purple50, 0.3) }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                Records: {((studentsPagination.page - 1) * studentsPagination.limit) + 1} to {Math.min(studentsPagination.page * studentsPagination.limit, studentsPagination.total)} of {studentsPagination.total}
              </Typography>
            </Box>
          </>
        )}
      </GlassCard>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {studentsPagination.pages > 1 && (
        <GlassCard elevation={0} sx={{ p: 2, mt: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
              Showing page {studentsPagination.page} of {studentsPagination.pages}
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
    </PageContainer>
  );
}
