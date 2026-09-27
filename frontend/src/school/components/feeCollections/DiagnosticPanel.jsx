import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import axios from 'axios';

/**
 * Diagnostic Panel - For Testing Fee Assignment Flow
 * 
 * This component helps diagnose issues with fee assignments.
 * Remove this file after testing is complete.
 */
const DiagnosticPanel = () => {
  const [studentId, setStudentId] = useState('');
  const [feeMasterId, setFeeMasterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const BRAND = {
    primary: '#7C3AED',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  };

  const checkStudentFees = async () => {
    if (!studentId) {
      setError('Please enter a student ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.get(`/api/fee-collection/student-fees/${studentId}`);
      console.log('✅ Student Fees Response:', res.data);
      setResult({
        type: 'student',
        data: res.data.data,
      });
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkFeeMaster = async () => {
    if (!feeMasterId) {
      setError('Please enter a fee master ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.get(`/api/fee-collection/fee-master/${feeMasterId}`);
      console.log('✅ Fee Master Response:', res.data);
      setResult({
        type: 'feeMaster',
        data: res.data.data,
      });
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAssignments = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // This is a direct MongoDB query - you'll need to create this endpoint
      const res = await axios.get('/api/fee-collection/all-assignments');
      console.log('✅ All Assignments:', res.data);
      setResult({
        type: 'assignments',
        data: res.data.data,
      });
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Endpoint not available. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.95)',
          border: `2px solid ${alpha(BRAND.primary, 0.2)}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: BRAND.primary,
            mb: 1,
          }}
        >
          🔧 Fee Assignment Diagnostic Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use this panel to test and debug the fee assignment flow. Remove this component after testing.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Test 1: Check Student Fees */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
            Test 1: Check Student Fee Assignments
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student MongoDB _id"
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={checkStudentFees}
              disabled={loading}
              sx={{
                bgcolor: BRAND.primary,
                '&:hover': { bgcolor: '#6D28D9' },
              }}
            >
              Check Fees
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This will fetch all fee assignments for the student from StudentFeeAssignment collection
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Test 2: Check Fee Master */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
            Test 2: Check Fee Master Details
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Fee Master ID"
              value={feeMasterId}
              onChange={(e) => setFeeMasterId(e.target.value)}
              placeholder="Enter fee master MongoDB _id"
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={checkFeeMaster}
              disabled={loading}
              sx={{
                bgcolor: BRAND.success,
                '&:hover': { bgcolor: '#059669' },
              }}
            >
              Check Master
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This will fetch the fee master details from FeeMaster collection
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Test 3: Check All Assignments */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
            Test 3: Check All Assignments (Requires Custom Endpoint)
          </Typography>
          <Button
            variant="contained"
            onClick={checkAssignments}
            disabled={loading}
            sx={{
              bgcolor: BRAND.warning,
              '&:hover': { bgcolor: '#D97706' },
            }}
          >
            Check All Assignments
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This requires creating a custom endpoint to list all StudentFeeAssignment records
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(BRAND.success, 0.1),
              border: `1px solid ${alpha(BRAND.success, 0.3)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '0.95rem' }}>
              ✅ Result:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: '#1e1e1e',
                color: '#d4d4d4',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 400,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(result.data, null, 2)}
            </Box>

            {/* Interpretation */}
            {result.type === 'student' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Interpretation:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Student: {result.data.student?.firstName} {result.data.student?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Class: {result.data.student?.class?.class_text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Fee Assignments: {result.data.feeAssignments?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Total Balance: ₹{result.data.summary?.totalBalance || 0}
                </Typography>
                {result.data.feeAssignments?.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No fee assignments found for this student. Make sure you've assigned fees from Fee Master.
                  </Alert>
                )}
              </Box>
            )}

            {result.type === 'feeMaster' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Interpretation:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Fees Group: {result.data.feesGroup}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Fees Code: {result.data.feesCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Amount: ₹{result.data.amount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Class: {result.data.class?.class_text || 'All'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Section: {result.data.section || 'All'}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            How to use:
          </Typography>
          <Typography variant="body2" component="div">
            1. Open browser console (F12) to see detailed logs
            <br />
            2. Get a student ID from the database or student list
            <br />
            3. Click "Check Fees" to see if the student has any fee assignments
            <br />
            4. If no assignments found, go to Fee Master and click the green 📋 icon to assign fees
            <br />
            5. Check again to verify the assignment worked
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default DiagnosticPanel;
