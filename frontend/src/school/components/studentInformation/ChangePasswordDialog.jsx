import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  FamilyRestroom as ParentIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { changeStudentPassword, clearMessages } from '../../../state/studentAdmissionSlice';

const ChangePasswordDialog = ({ open, onClose, studentId, studentName }) => {
  const dispatch = useDispatch();
  const { submitLoading, error, successMsg } = useSelector((s) => s.studentAdmission);

  const [userType, setUserType] = useState('student');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setLocalError('');
    setUserType('student');
    dispatch(clearMessages());
    onClose();
  };

  const handleSubmit = async () => {
    setLocalError('');
    if (!newPassword) return setLocalError('Password is required.');
    if (newPassword.length < 4) return setLocalError('Password must be at least 4 characters.');
    if (newPassword !== confirmPassword) return setLocalError('Passwords do not match.');

    const result = await dispatch(changeStudentPassword({ id: studentId, userType, newPassword }));
    if (result.meta.requestStatus === 'fulfilled') {
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Change Password
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontSize: '0.813rem' }}>
          {studentName}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* User Type Toggle */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
            Select User Type
          </Typography>
          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={(e, val) => val && setUserType(val)}
            fullWidth
            size="small"
          >
            <ToggleButton
              value="student"
              sx={{
                textTransform: 'none',
                fontSize: '0.813rem',
                '&.Mui-selected': {
                  backgroundColor: '#6a1b9a',
                  color: 'white',
                  '&:hover': { backgroundColor: '#4a148c' },
                },
              }}
            >
              <PersonIcon sx={{ mr: 1, fontSize: '1rem' }} />
              Student
            </ToggleButton>
            <ToggleButton
              value="parent"
              sx={{
                textTransform: 'none',
                fontSize: '0.813rem',
                '&.Mui-selected': {
                  backgroundColor: '#6a1b9a',
                  color: 'white',
                  '&:hover': { backgroundColor: '#4a148c' },
                },
              }}
            >
              <ParentIcon sx={{ mr: 1, fontSize: '1rem' }} />
              Parent
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* New Password */}
        <TextField
          fullWidth
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          inputProps={{ style: { fontSize: '0.875rem' } }}
          InputLabelProps={{ style: { fontSize: '0.875rem' } }}
        />

        {/* Confirm Password */}
        <TextField
          fullWidth
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          inputProps={{ style: { fontSize: '0.875rem' } }}
          InputLabelProps={{ style: { fontSize: '0.875rem' } }}
        />

        {/* Errors / Success */}
        {localError && (
          <Alert severity="error" sx={{ fontSize: '0.813rem', py: 0.5 }}>
            {localError}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ fontSize: '0.813rem', py: 0.5 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ fontSize: '0.813rem', py: 0.5 }}>
            {successMsg}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none', borderColor: '#6a1b9a', color: '#6a1b9a' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={submitLoading}
          sx={{
            textTransform: 'none',
            backgroundColor: '#6a1b9a',
            '&:hover': { backgroundColor: '#4a148c' },
          }}
        >
          {submitLoading ? <CircularProgress size={18} color="inherit" /> : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
