import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  alpha,
  useTheme,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  PendingActions as PendingIcon,
  Receipt as ReceiptIcon,
  Notifications as NotificationsIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { AuthContext } from "../../../context/AuthContext";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const AccountantDashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/staff-dashboard/accountant`);
      if (response.data.success) {
        setDashboardData(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      setSnackbar({
        open: true,
        message: "Failed to load dashboard data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { collection, students, recentTransactions, weeklyTrend, notices } =
    dashboardData || {};

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <CustomizedSnackbars
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />

      {/* Header */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Accountant Dashboard
      </Typography>

      {/* Collection Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <MoneyIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Today's Collection
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(collection?.today?.amount)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {collection?.today?.count || 0} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <WalletIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Monthly Collection
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(collection?.month?.amount)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {collection?.month?.count || 0} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PendingIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Pending Fees
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(collection?.pending?.amount)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {collection?.pending?.count || 0} students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  mb: 1,
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={collection?.percentage || 0}
                  size={80}
                  thickness={5}
                  sx={{ color: theme.palette.success.main }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {collection?.percentage || 0}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" fontWeight="600" color="text.secondary">
                COLLECTION RATE
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Student Statistics */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        Student Fee Status
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <PeopleIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {students?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <CheckCircleIcon
                sx={{ fontSize: 40, color: "success.main", mb: 1 }}
              />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {students?.paid || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <TrendingUpIcon
                sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
              />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {students?.partial || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Partial
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <PendingIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {students?.pending || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Transactions */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <ReceiptIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                  Recent Transactions
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {recentTransactions && recentTransactions.length > 0 ? (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Student</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Fee Type</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Amount</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Method</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Date</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTransactions.map((txn, index) => (
                        <TableRow key={txn.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {txn.student}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {txn.admissionNo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{txn.feeType}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {formatCurrency(txn.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={txn.method || "Cash"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(txn.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 3 }}
                >
                  No recent transactions
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notices */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <NotificationsIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                  Notices
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {notices && notices.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: "auto" }}>
                  {notices.map((notice, index) => (
                    <React.Fragment key={notice.id}>
                      <ListItem
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          borderRadius: 1,
                          mb: 1,
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography variant="body2" fontWeight="600">
                          {notice.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {notice.message}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Chip
                            label={notice.audience}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notice.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </Typography>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 3 }}
                >
                  No notices
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountantDashboard;
