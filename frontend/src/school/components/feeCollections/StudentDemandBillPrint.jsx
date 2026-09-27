import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getStudentDemandBill } from '../../../state/feeCollectionSlice';
import { useReactToPrint } from 'react-to-print';

const StudentDemandBillPrint = () => {
  const { studentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const printRef = useRef();

  const { demandBillDetails, demandBillLoading } = useSelector(
    (state) => state.feeCollection
  );

  useEffect(() => {
    if (studentId) {
      dispatch(getStudentDemandBill(studentId));
    }
  }, [dispatch, studentId]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Demand_Bill_${demandBillDetails?.student?.admissionNo || 'Unknown'}`,
  });

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
      month: 'short',
      year: 'numeric',
    });
  };

  if (demandBillLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!demandBillDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          No demand bill data found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const { student, feeAssignments, summary } = demandBillDetails;

  return (
    <Box sx={{ p: 3 }}>
      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print Demand Bill
        </Button>
      </Box>

      {/* Printable Content */}
      <Paper ref={printRef} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            DEMAND BILL
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Fee Payment Notice
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Student Information */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Student Name:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.firstName} {student.lastName || ''}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Admission No:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.admissionNo}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Class:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.class?.class_text || 'N/A'} - {student.section || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Father's Name:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.fatherName || 'N/A'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Mobile Number:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {student.mobileNumber || 'N/A'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Bill Date:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(new Date())}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Fee Details Table */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Fee Details
        </Typography>

        <TableContainer>
          <Table size="small" sx={{ border: '1px solid #e0e0e0' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                  S.No
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                  Fee Group
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                  Fee Code
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  Due Date
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  Amount (₹)
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  Paid (₹)
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  Discount (₹)
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  Fine (₹)
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  Balance (₹)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeAssignments.map((fee, index) => (
                <TableRow key={fee._id}>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    {fee.feeMaster?.feesGroup || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    {fee.feeMaster?.feesCode || 'N/A'}
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                    {formatDate(fee.dueDate)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                    {formatCurrency(fee.amount)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                    {formatCurrency(fee.paidAmount)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                    {formatCurrency(fee.discountAmount)}
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #e0e0e0' }}>
                    {formatCurrency(fee.fineAmount)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      border: '1px solid #e0e0e0',
                      fontWeight: 'bold',
                      color: fee.balance > 0 ? 'error.main' : 'success.main',
                    }}
                  >
                    {formatCurrency(fee.balance)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Summary Row */}
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell
                  colSpan={4}
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  TOTAL:
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  {formatCurrency(summary.totalAmount)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  {formatCurrency(summary.totalPaid)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  {formatCurrency(summary.totalDiscount)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}
                >
                  {formatCurrency(summary.totalFine)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 'bold',
                    border: '1px solid #e0e0e0',
                    color: summary.totalBalance > 0 ? 'error.main' : 'success.main',
                    fontSize: '1.1rem',
                  }}
                >
                  {formatCurrency(summary.totalBalance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Payment Instructions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Payment Instructions:
          </Typography>
          <Typography variant="body2" paragraph>
            • Please pay the outstanding balance by the due date to avoid late fees.
          </Typography>
          <Typography variant="body2" paragraph>
            • Payment can be made at the school office or through online banking.
          </Typography>
          <Typography variant="body2" paragraph>
            • Keep this demand bill for your records.
          </Typography>
          <Typography variant="body2" paragraph>
            • For any queries, please contact the school office.
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Generated on: {formatDate(new Date())}
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Authorized Signature
              </Typography>
              <Box sx={{ mt: 4, borderTop: '1px solid #000', width: 200, ml: 'auto' }} />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentDemandBillPrint;
