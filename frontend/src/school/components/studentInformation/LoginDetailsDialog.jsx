import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, ContentCopy as CopyIcon } from '@mui/icons-material';

const LoginDetailsDialog = ({ open, onClose, studentName, loginCredentials }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!loginCredentials) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Login Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#6a1b9a' }}>
          {studentName}
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User Type</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Password</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Parent</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  {loginCredentials.parentUsername}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {loginCredentials.parentPassword}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleCopy(
                        `Username: ${loginCredentials.parentUsername}\nPassword: ${loginCredentials.parentPassword}`
                      )
                    }
                    sx={{ color: '#6a1b9a' }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Student</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  {loginCredentials.studentUsername}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {loginCredentials.studentPassword}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleCopy(
                        `Username: ${loginCredentials.studentUsername}\nPassword: ${loginCredentials.studentPassword}`
                      )
                    }
                    sx={{ color: '#6a1b9a' }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.813rem', color: '#e65100' }}>
            <strong>Note:</strong> Please save these credentials securely. They will be used for
            login access.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#6a1b9a',
            '&:hover': { backgroundColor: '#4a148c' },
            textTransform: 'none',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDetailsDialog;
