import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { alpha, styled, keyframes } from "@mui/material/styles";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import {
  searchFeePayments,
  clearFeeMessages,
} from "../../../state/feeCollectionSlice";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  white: "#FFFFFF",
  purple50: "#FAF5FF",
  success: "#10B981",
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
export default function SearchFeesPayment() {
  useDocumentTitle("Search Fees Payment");
  const dispatch = useDispatch();

  const {
    searchedPayments,
    searchedPaymentsPagination,
    searchedPaymentsLoading,
    error,
    successMsg,
  } = useSelector((s) => s.feeCollection);

  const [paymentIdInput, setPaymentIdInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // ─── Handle Search by Payment ID ──────────────────────────────────────────
  const handleSearchByPaymentId = () => {
    if (!paymentIdInput.trim()) return;
    
    setHasSearched(true);
    dispatch(searchFeePayments({ paymentId: paymentIdInput.trim(), page: 1, limit: 10 }));
  };

  // ─── Handle Search in Results ─────────────────────────────────────────────
  const handleSearchInResults = () => {
    if (!hasSearched) return;
    
    dispatch(searchFeePayments({ 
      paymentId: paymentIdInput.trim(), 
      search: searchInput.trim(),
      page: 1,
      limit: 10 
    }));
  };

  // ─── Handle Page Change ───────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    dispatch(searchFeePayments({ 
      paymentId: paymentIdInput.trim(),
      search: searchInput.trim(),
      page: newPage,
      limit: 10 
    }));
  };

  // ─── Clear Messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (error || successMsg) {
      const t = setTimeout(() => dispatch(clearFeeMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [error, successMsg, dispatch]);

  // ─── Handle Print ─────────────────────────────────────────────────────────
  const handlePrint = (payment) => {
    const printWindow = window.open("", "_blank");
    const studentName = payment.student 
      ? `${payment.student.firstName} ${payment.student.lastName || ""}`.trim()
      : "N/A";
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${payment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #7C3AED; padding-bottom: 10px; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; background: #f9f9f9; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Fee Payment Receipt</h2>
            <p>Receipt No: ${payment.receiptNumber}</p>
          </div>
          <div class="details">
            <div class="row">
              <span class="label">Student Name:</span>
              <span class="value">${studentName}</span>
            </div>
            <div class="row">
              <span class="label">Class:</span>
              <span class="value">${payment.student?.class?.class_text || "N/A"}</span>
            </div>
            <div class="row">
              <span class="label">Payment Date:</span>
              <span class="value">${formatDate(payment.paymentDate)}</span>
            </div>
            <div class="row">
              <span class="label">Amount Paid:</span>
              <span class="value">${formatCurrency(payment.paidAmount)}</span>
            </div>
            <div class="row">
              <span class="label">Discount:</span>
              <span class="value">${formatCurrency(payment.discountAmount)}</span>
            </div>
            <div class="row">
              <span class="label">Fine:</span>
              <span class="value">${formatCurrency(payment.fineAmount)}</span>
            </div>
            <div class="row">
              <span class="label">Payment Mode:</span>
              <span class="value">${payment.paymentMode}</span>
            </div>
          </div>
          <div class="footer">
            <p>This is a computer-generated receipt</p>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
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
        Search Fees Payment
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

      {/* ── Search by Payment ID ──────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", minWidth: 100 }}>
            Payment ID *
          </Typography>
          <SearchField
            fullWidth
            size="small"
            placeholder="Enter Payment ID"
            value={paymentIdInput}
            onChange={(e) => setPaymentIdInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchByPaymentId();
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearchByPaymentId}
            disabled={!paymentIdInput.trim() || searchedPaymentsLoading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              minWidth: 120,
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%)`,
              },
            }}
          >
            {searchedPaymentsLoading ? <CircularProgress size={20} color="inherit" /> : "Search"}
          </Button>
        </Stack>
      </GlassCard>

      {/* ── Payment ID Detail ─────────────────────────────────────────────── */}
      {hasSearched && (
        <GlassCard elevation={0} sx={{ p: 0, overflow: "hidden" }}>
          <Box sx={{ p: 2, bgcolor: alpha(BRAND.primary, 0.05), borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "0.95rem", color: BRAND.primary }}>
              Payment ID Detail
            </Typography>
          </Box>

          {/* Search in Results */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
            <SearchField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchInResults();
                }
              }}
            />
          </Box>

          {/* Loading State */}
          {searchedPaymentsLoading ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress sx={{ color: BRAND.primary }} />
            </Box>
          ) : searchedPayments.length === 0 ? (
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
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Payment ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Class</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Fees Group</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Fee Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Mode</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }} align="right">Paid</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }} align="right">Discount</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }} align="right">Fine</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchedPayments.map((payment, i) => {
                      const studentName = payment.student 
                        ? `${payment.student.firstName} ${payment.student.lastName || ""}`.trim()
                        : "N/A";
                      
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
                            {payment.receiptNumber}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", py: 1.5, color: BRAND.primary, fontWeight: 600 }}>
                            {studentName}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                            {payment.student?.class?.class_text || "N/A"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                            {payment.discountGroup || "-"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                            {payment.feeType || "Regular"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", py: 1.5 }}>
                            {payment.paymentMode}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8rem", py: 1.5, fontWeight: 600, color: BRAND.success }}>
                            {formatCurrency(payment.paidAmount)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8rem", py: 1.5 }}>
                            {formatCurrency(payment.discountAmount)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8rem", py: 1.5 }}>
                            {formatCurrency(payment.fineAmount)}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="Print Receipt">
                                <IconButton
                                  size="small"
                                  onClick={() => handlePrint(payment)}
                                  sx={{
                                    color: BRAND.primary,
                                    "&:hover": { bgcolor: alpha(BRAND.primary, 0.1) },
                                  }}
                                >
                                  <PrintIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#3B82F6",
                                    "&:hover": { bgcolor: alpha("#3B82F6", 0.1) },
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
                  Records: {((searchedPaymentsPagination.page - 1) * searchedPaymentsPagination.limit) + 1} to {Math.min(searchedPaymentsPagination.page * searchedPaymentsPagination.limit, searchedPaymentsPagination.total)} of {searchedPaymentsPagination.total}
                </Typography>
              </Box>
            </>
          )}
        </GlassCard>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {hasSearched && searchedPayments.length > 0 && searchedPaymentsPagination.pages > 1 && (
        <GlassCard elevation={0} sx={{ p: 2, mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
              Page {searchedPaymentsPagination.page} of {searchedPaymentsPagination.pages}
            </Typography>
            <Pagination
              count={searchedPaymentsPagination.pages}
              page={searchedPaymentsPagination.page}
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
    </PageContainer>
  );
}
