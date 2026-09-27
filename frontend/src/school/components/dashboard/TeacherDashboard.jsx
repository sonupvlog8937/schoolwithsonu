import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventAvailable as EventAvailableIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Event as EventIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { AuthContext } from "../../../context/AuthContext";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const TeacherDashboard = () => {
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
      const response = await axios.get(`${baseUrl}/staff-dashboard/teacher`);
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

  const { teacher, attendance, todaySchedule, notices, upcomingExams, stats } =
    dashboardData || {};

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <CustomizedSnackbars
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />

      {/* Header Section */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={teacher?.image}
              alt={teacher?.name}
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                border: "4px solid rgba(255,255,255,0.3)",
              }}
            >
              {teacher?.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Hello, {teacher?.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {teacher?.qualification} | {teacher?.email}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                {teacher?.school}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Attendance Section */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        This Month's Attendance
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            }}
          >
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
                  value={attendance?.percentage || 0}
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
                    {attendance?.percentage || 0}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" fontWeight="600" color="text.secondary">
                ATTENDANCE
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
                {attendance?.present || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PRESENT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <CancelIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {attendance?.absent || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ABSENT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <EventAvailableIcon
                sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
              />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {attendance?.leave || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                LEAVE
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <ScheduleIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                  Today's Schedule
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {todaySchedule && todaySchedule.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: "auto" }}>
                  {todaySchedule.map((period, index) => (
                    <React.Fragment key={period.id}>
                      <ListItem
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          <Chip
                            label={`P${period.periodNumber}`}
                            size="small"
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography fontWeight="600">
                              {period.subject} - {period.class}
                            </Typography>
                          }
                          secondary={`${period.startTime} - ${period.endTime}`}
                        />
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
                  No classes scheduled for today
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events & Exams */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <EventIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" fontWeight="bold">
                  Upcoming Exams
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {upcomingExams && upcomingExams.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: "auto" }}>
                  {upcomingExams.map((exam, index) => (
                    <React.Fragment key={exam.id}>
                      <ListItem
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          <AssignmentIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography fontWeight="600">{exam.name}</Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {exam.class} - {exam.subject}
                              </Typography>
                              <br />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                component="span"
                              >
                                {new Date(exam.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Typography>
                            </>
                          }
                        />
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
                  No upcoming exams
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notices & Circulars */}
        <Grid item xs={12}>
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
                  Notices & Circulars
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {notices && notices.length > 0 ? (
                <List>
                  {notices.map((notice, index) => (
                    <React.Fragment key={notice.id}>
                      <ListItem
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          <CalendarTodayIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography fontWeight="600">
                              {notice.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {notice.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(notice.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Typography>
                            </>
                          }
                        />
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

export default TeacherDashboard;
