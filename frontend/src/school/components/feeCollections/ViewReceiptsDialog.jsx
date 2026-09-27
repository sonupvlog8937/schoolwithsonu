import { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useReactToPrint } from 'react-to-print';
import PrintReceipt from './PrintReceipt';
import './print.css';

const BRAND = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
};

const ViewReceiptsDialog = ({ open, onClose, student, feeAssignments, onPrintReceipt, onPrintPaidFees }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate totals
  const totals = {
    totalAmount: feeAssignments.reduce((sum, f) => sum + f.amount, 0),
    totalPaid: feeAssignments.reduce((sum, f) => sum + f.paidAmount, 0),
    totalDiscount: feeAssignments.reduce((sum, f) => sum + f.discountAmount, 0),
    totalFine: feeAssignments.reduce((sum, f) => sum + f.fineAmount, 0),
    totalBalance: feeAssignments.reduce((sum, f) => sum + f.balance, 0),
  };

  // Separate paid and unpaid fees
  const paidFees = feeAssignments.filter(f => f.status === 'Paid');
  const partialPaidFees = feeAssignments.filter(f => f.status === 'Partial');
  const unpaidFees = feeAssignments.filter(f => f.status === 'Unpaid');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}`, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: BRAND.primary }}>
              View All Receipts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
              {student?.firstName} {student?.lastName} ({student?.admissionNo})
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(BRAND.primary, 0.1) },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Summary Cards */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                bgcolor: alpha(BRAND.primary, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(BRAND.primary, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Amount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.primary, fontSize: '1.1rem' }}>
                {formatCurrency(totals.totalAmount)}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                bgcolor: alpha(BRAND.success, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(BRAND.success, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Paid
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.success, fontSize: '1.1rem' }}>
                {formatCurrency(totals.totalPaid)}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                bgcolor: alpha(BRAND.warning, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(BRAND.warning, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Discount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.warning, fontSize: '1.1rem' }}>
                {formatCurrency(totals.totalDiscount)}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                bgcolor: alpha(BRAND.error, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(BRAND.error, 0.2)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Balance
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.error, fontSize: '1.1rem' }}>
                {formatCurrency(totals.totalBalance)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Paid Fees Section */}
        {paidFees.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 2, color: BRAND.success }}>
              ✓ Paid Fees ({paidFees.length})
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(BRAND.success, 0.2)}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BRAND.success, 0.05) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fees Group</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fees Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Payment ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Mode</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Paid</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paidFees.map((fee, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{fee.feeMaster?.feesGroup || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{fee.feeMaster?.feesCode || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(fee.dueDate)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }} align="right">{formatCurrency(fee.amount)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {fee.payments?.length > 0 ? fee.payments[0].paymentId : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {fee.payments?.length > 0 ? fee.payments[0].paymentMode : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {fee.payments?.length > 0 ? formatDate(fee.payments[0].paymentDate) : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: BRAND.success, fontWeight: 600 }} align="right">
                        {formatCurrency(fee.paidAmount)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => onPrintReceipt(fee)}
                          sx={{
                            color: BRAND.gray,
                            '&:hover': { bgcolor: alpha(BRAND.gray, 0.1) },
                          }}
                        >
                          <PrintIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Partial Paid Fees Section */}
        {partialPaidFees.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 2, color: BRAND.warning }}>
              ⚠ Partial Paid Fees ({partialPaidFees.length})
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(BRAND.warning, 0.2)}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BRAND.warning, 0.05) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fees Group</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fees Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Payment ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Paid</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Balance</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partialPaidFees.map((fee, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{fee.feeMaster?.feesGroup || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{fee.feeMaster?.feesCode || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(fee.dueDate)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }} align="right">{formatCurrency(fee.amount)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {fee.payments?.length > 0 ? fee.payments[0].paymentId : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: BRAND.warning, fontWeight: 600 }} align="right">
                        {formatCurrency(fee.paidAmount)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: BRAND.error, fontWeight: 600 }} align="right">
                        {formatCurrency(fee.balance)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => onPrintReceipt(fee)}
                          sx={{
                            color: BRAND.gray,
                            '&:hover': { bgcolor: alpha(BRAND.gray, 0.1) },
                          }}
                        >
                          <PrintIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Unpaid Fees Section */}
        {unpaidFees.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 2, color: BRAND.error }}>
              ✗ Unpaid Fees ({unpaidFees.length})
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(BRAND.error, 0.2)}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BRAND.error, 0.05) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fees Group</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fees Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Balance</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unpaidFees.map((fee, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{fee.feeMaster?.feesGroup || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{fee.feeMaster?.feesCode || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(fee.dueDate)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }} align="right">{formatCurrency(fee.amount)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: BRAND.error, fontWeight: 600 }} align="right">
                        {formatCurrency(fee.balance)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => onPrintReceipt(fee)}
                          sx={{
                            color: BRAND.gray,
                            '&:hover': { bgcolor: alpha(BRAND.gray, 0.1) },
                          }}
                        >
                          <PrintIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* No Fees Message */}
        {feeAssignments.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No fees found for this student
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={onPrintPaidFees}
          disabled={paidFees.length === 0}
          sx={{
            textTransform: 'none',
            fontSize: '0.85rem',
            bgcolor: BRAND.success,
            '&:hover': { bgcolor: '#059669' },
            mr: 'auto',
          }}
        >
          Print Paid Fees ({paidFees.length})
        </Button>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontSize: '0.85rem',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewReceiptsDialog;
