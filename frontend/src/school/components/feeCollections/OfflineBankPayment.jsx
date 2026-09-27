import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { alpha, styled, keyframes } from "@mui/material/styles";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import {
  getOfflineBankPayments,
  updateOfflineBankPaymentStatus,
  clearFeeMessages,
} from "../../../state/feeCollectionSlice";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  white: "#FFFFFF",
  purple50: "#FAF5FF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
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

// ─── Helper Functions ─────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
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
export default function OfflineBankPayment() {
  useDocumentTitle("Offline Bank Payments");
  const dispatch = useDispatch();

  const {
    offlineBankPayments,
    offlineBankPaymentsPagination,
    offlineBankPaymentsLoading,
    submitLoading,
    error,
    successMsg,
  } = useSelector((s) => s.feeCollection);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 100,
  });

  const [searchInput, setSearchInput] = useState("");
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [actionForm, setActionForm] = useState({
    paymentId: "",
    rejectionReason: "",
  });
  const debounceRef = useRef(null);

  // ─── Fetch Payments ───────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    console.log('🔄 Fetching offline bank payments with filters:', filters);
    dispatch(getOfflineBankPayments(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Handle Search ────────────────────────────────────────────────────────
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ ...filters, search: value, page: 1 });
    }, 400);
  };

  // ─── Handle Page Change ───────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // ─── Handle Action Click ──────────────────────────────────────────────────
  const handleActionClick = (payment, type) => {
    setSelectedPayment(payment);
    setActionType(type);
    setActionForm({
      paymentId: "",
      rejectionReason: "",
    });
    setActionDialog(true);
  };

  // ─── Handle Action Submit ─────────────────────────────────────────────────
  const handleActionSubmit = async () => {
    const statusData = {
      paymentId: selectedPayment._id,
      status: actionType === 'approve' ? 'Approved' : 'Rejected',
    };

    if (actionType === 'approve' && actionForm.paymentId) {
      statusData.paymentId = actionForm.paymentId;
    }

    if (actionType === 'reject' && actionForm.rejectionReason) {
      statusData.rejectionReason = actionForm.rejectionReason;
    }

    const result = await dispatch(updateOfflineBankPaymentStatus(statusData));

    if (updateOfflineBankPaymentStatus.fulfilled.match(result)) {
      setActionDialog(false);
      setSelectedPayment(null);
      fetchData(); // Refresh list
    }
  };

  // ─── Clear Messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (error || successMsg) {
      const t = setTimeout(() => dispatch(clearFeeMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [error, successMsg, dispatch]);

  // ─── Get Status Color ─────────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return { bg: alpha(BRAND.success, 0.1), color: BRAND.success };
      case 'Rejected':
        return { bg: alpha(BRAND.error, 0.1), color: BRAND.error };
      case 'Pending':
      default:
        return { bg: alpha(BRAND.warning, 0.1), color: BRAND.warning };
    }
  };

  return (
    <PageContainer>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: BRAND.primary,
          mb: 3,
          fontSize: "1.25rem",
        }}
      >
        Offline Bank Payments
      </Typography>

      {/* ── Error/Success Display ─────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => dispatch(clearFeeMessages())}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => dispatch(clearFeeMessages())}>
          {successMsg}
        </Alert>
      )}

      {/* ── Main Card ─────────────────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 0, overflow: "hidden" }}>
        {/* Search Field */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <SearchField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {offlineBankPaymentsLoading ? (
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
            <TextField
              select
              size="small"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
              <MenuItem value={500}>500</MenuItem>
            </TextField>
          </Stack>
        </Box>

        {/* Loading State */}
        {offlineBankPaymentsLoading && offlineBankPayments.length === 0 ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        ) : offlineBankPayments.length === 0 ? (
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
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Request ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Admission No</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Payment Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Submit Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }} align="right">Amount (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Status Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Payment ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offlineBankPayments.map((payment, i) => {
                    const statusStyle = getStatusColor(payment.status);
                    
                    return (
                      <TableRow
                        key={payment._id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: alpha(BRAND.primary, 0.02) },
                          animation: `${fadeIn} 0.3s ease ${i * 0.03}s both`,
                        }}
                      >
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5, fontWeight: 600 }}>
                          {payment.requestId}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          {payment.admissionNo || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5, color: BRAND.primary, fontWeight: 600 }}>
                          {payment.studentName || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          {payment.class?.class_text || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          {formatDate(payment.paymentDate)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          {formatDate(payment.submitDate)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: "0.8rem", py: 1.5, fontWeight: 600 }}>
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={payment.status}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          {formatDate(payment.statusDate)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                          {payment.paymentId || "-"}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {payment.status === 'Pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleActionClick(payment, 'approve')}
                                    sx={{
                                      color: BRAND.success,
                                      "&:hover": { bgcolor: alpha(BRAND.success, 0.1) },
                                    }}
                                  >
                                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleActionClick(payment, 'reject')}
                                    sx={{
                                      color: BRAND.error,
                                      "&:hover": { bgcolor: alpha(BRAND.error, 0.1) },
                                    }}
                                  >
                                    <CancelIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                sx={{
                                  color: BRAND.info,
                                  "&:hover": { bgcolor: alpha(BRAND.info, 0.1) },
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
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
                Records: {((offlineBankPaymentsPagination.page - 1) * offlineBankPaymentsPagination.limit) + 1} to {Math.min(offlineBankPaymentsPagination.page * offlineBankPaymentsPagination.limit, offlineBankPaymentsPagination.total)} of {offlineBankPaymentsPagination.total}
              </Typography>
            </Box>
          </>
        )}
      </GlassCard>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {offlineBankPayments.length > 0 && offlineBankPaymentsPagination.pages > 1 && (
        <GlassCard elevation={0} sx={{ p: 2, mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
              Page {offlineBankPaymentsPagination.page} of {offlineBankPaymentsPagination.pages}
            </Typography>
            <Pagination
              count={offlineBankPaymentsPagination.pages}
              page={offlineBankPaymentsPagination.page}
              onChange={(_, page) => handlePageChange(page)}
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

      {/* ── Action Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={actionDialog}
        onClose={() => setActionDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}`, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.primary }}>
              {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </Typography>
            <IconButton size="small" onClick={() => setActionDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            {selectedPayment && (
              <Box sx={{ p: 2, bgcolor: alpha(BRAND.info, 0.1), borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontSize: "0.85rem", mb: 1 }}>
                  <strong>Request ID:</strong> {selectedPayment.requestId}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem", mb: 1 }}>
                  <strong>Student:</strong> {selectedPayment.studentName}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  <strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}
                </Typography>
              </Box>
            )}

            {actionType === 'approve' && (
              <TextField
                size="small"
                label="Payment ID (Optional)"
                value={actionForm.paymentId}
                onChange={(e) => setActionForm({ ...actionForm, paymentId: e.target.value })}
                fullWidth
                placeholder="Enter bank transaction ID"
              />
            )}

            {actionType === 'reject' && (
              <TextField
                size="small"
                label="Rejection Reason"
                value={actionForm.rejectionReason}
                onChange={(e) => setActionForm({ ...actionForm, rejectionReason: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Enter reason for rejection"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <Button onClick={() => setActionDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActionSubmit}
            disabled={submitLoading}
            sx={{
              textTransform: "none",
              bgcolor: actionType === 'approve' ? BRAND.success : BRAND.error,
              "&:hover": {
                bgcolor: actionType === 'approve' ? "#059669" : "#DC2626",
              },
            }}
          >
            {submitLoading ? <CircularProgress size={20} color="inherit" /> : actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
