import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
} from "@mui/material";

// Redux actions
import {
  fetchStaffDashboard,
  fetchStaffAttendance,
  fetchUpcomingEvents,
  fetchUpcomingHolidays,
  fetchRecentNotices,
  setUser,
} from "../../../state/staffDashboardSlice";

// Icons
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import EventIcon from "@mui/icons-material/Event";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

/**
 * Staff Dashboard Component
 * Shows personalized dashboard for staff with attendance and events
 * Uses Redux Toolkit for state management
 *
 * UI: animated entrance (staggered fade/slide-up), hover lift + glow on
 * cards, colorful gradient accents per section, slightly smaller fonts
 * for a denser, cleaner look.
 */

// Keyframe animations injected once via a <style> tag (no extra deps needed)
const dashboardAnimationStyles = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmerPulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.35); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.dash-fade-in {
  animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.dash-header-gradient {
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}
.dash-hover-lift {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.dash-hover-lift:hover {
  transform: translateY(-4px);
}
.dash-stat-pulse:hover {
  animation: shimmerPulse 1.4s ease-out infinite;
}
.dash-icon-float {
  animation: floatIcon 3s ease-in-out infinite;
}
.dash-list-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.dash-list-item:hover {
  transform: translateX(4px);
}
`;

export default function StaffDashboard() {
  const dispatch = useDispatch();

  // Redux state
  const {
    user,
    attendance,
    events,
    holidays,
    notices,
    attendanceLoading,
    eventsLoading,
    holidaysLoading,
    noticesLoading,
  } = useSelector((state) => state.staffDashboard);

  useEffect(() => {
    // Fetch all dashboard data from the database
    // fetchStaffDashboard will set the user data from API
    dispatch(fetchStaffDashboard());
    dispatch(fetchStaffAttendance());
    dispatch(fetchUpcomingEvents());
    dispatch(fetchUpcomingHolidays());
    dispatch(fetchRecentNotices(5));
  }, [dispatch]);

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show loading state while attendance is loading
  const isMainLoading = attendanceLoading;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Inject keyframe animation styles once */}
      <style>{dashboardAnimationStyles}</style>

      {/* Header Card */}
      <Card
        className="dash-fade-in dash-header-gradient"
        sx={{
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(120deg, #667eea 0%, #764ba2 45%, #ec4899 100%)",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(118, 75, 162, 0.3)",
          animationDelay: "0s",
        }}
      >
        <CardContent sx={{ py: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              className="dash-icon-float"
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(255, 255, 255, 0.22)",
                fontSize: "20px",
                fontWeight: 700,
                border: "3px solid rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(4px)",
              }}
            >
              {getInitials(user?.firstName, user?.lastName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.3, fontSize: "18px" }}>
                Hello, {user?.firstName || "User"} {user?.lastName || ""}
              </Typography>
              <Typography
                sx={{
                  fontSize: "12px",
                  opacity: 0.95,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  fontWeight: 600,
                }}
              >
                {user?.role || "STAFF"} | {user?.designation || "TEACHING"}
              </Typography>
              <Typography
                sx={{
                  fontSize: "11.5px",
                  opacity: 0.85,
                  mt: 0.4,
                }}
              >
                {user?.school_name || "WISDOM WORLD PUBLIC SCHOOL"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* This Month's Attendance Section */}
        <Grid item xs={12} md={6}>
          <Card
            className="dash-fade-in dash-hover-lift"
            sx={{
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.08)",
              height: "100%",
              animationDelay: "0.08s",
              border: "1px solid rgba(16, 185, 129, 0.08)",
              "&:hover": {
                boxShadow: "0 12px 28px rgba(16, 185, 129, 0.18)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  mb: 2.5,
                  color: "#1e293b",
                  fontSize: "15px",
                }}
              >
                This Month's Attendance
              </Typography>

              {isMainLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "280px",
                  }}
                >
                  <CircularProgress sx={{ color: "#667eea" }} />
                </Box>
              ) : (
                <>
                  {/* Circular Progress */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-flex",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.03)" },
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={140}
                        thickness={4}
                        sx={{
                          color: "#e5e7eb",
                          position: "absolute",
                        }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={attendance.percentage || 0}
                        size={140}
                        thickness={4}
                        sx={{
                          color: "#10b981",
                          transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                          "& .MuiCircularProgress-circle": {
                            strokeLinecap: "round",
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: "absolute",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#10b981",
                            lineHeight: 1,
                            fontSize: "26px",
                            background:
                              "linear-gradient(135deg, #10b981, #059669)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {attendance.percentage || 0}%
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10.5px",
                            color: "#64748b",
                            mt: 0.4,
                            letterSpacing: "0.5px",
                            fontWeight: 600,
                          }}
                        >
                          ATTENDANCE
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Attendance Stats */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={4}>
                      <Paper
                        className="dash-stat-pulse dash-hover-lift"
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          background:
                            "linear-gradient(160deg, #ecfdf5 0%, #d1fae5 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(16, 185, 129, 0.15)",
                          cursor: "default",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 0.5,
                          }}
                        >
                          <CheckCircleOutlineIcon
                            sx={{ color: "#10b981", fontSize: 22 }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#10b981",
                            mb: 0.2,
                            fontSize: "18px",
                          }}
                        >
                          {attendance.present || 0}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            color: "#059669",
                            fontWeight: 700,
                            letterSpacing: "0.4px",
                          }}
                        >
                          PRESENT
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={4}>
                      <Paper
                        className="dash-stat-pulse dash-hover-lift"
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          background:
                            "linear-gradient(160deg, #fee2e2 0%, #fecaca 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(239, 68, 68, 0.15)",
                          cursor: "default",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 0.5,
                          }}
                        >
                          <CancelOutlinedIcon
                            sx={{ color: "#ef4444", fontSize: 22 }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#ef4444",
                            mb: 0.2,
                            fontSize: "18px",
                          }}
                        >
                          {attendance.absent || 0}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            color: "#dc2626",
                            fontWeight: 700,
                            letterSpacing: "0.4px",
                          }}
                        >
                          ABSENT
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={4}>
                      <Paper
                        className="dash-stat-pulse dash-hover-lift"
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          background:
                            "linear-gradient(160deg, #fef3c7 0%, #fde68a 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(245, 158, 11, 0.15)",
                          cursor: "default",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 0.5,
                          }}
                        >
                          <BeachAccessIcon
                            sx={{ color: "#f59e0b", fontSize: 22 }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#f59e0b",
                            mb: 0.2,
                            fontSize: "18px",
                          }}
                        >
                          {attendance.leave || 0}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            color: "#d97706",
                            fontWeight: 700,
                            letterSpacing: "0.4px",
                          }}
                        >
                          LEAVE
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Events and Holidays */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {/* Upcoming Events */}
            <Grid item xs={12}>
              <Card
                className="dash-fade-in dash-hover-lift"
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.08)",
                  animationDelay: "0.16s",
                  border: "1px solid rgba(99, 102, 241, 0.08)",
                  "&:hover": {
                    boxShadow: "0 12px 28px rgba(99, 102, 241, 0.18)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <EventIcon
                      className="dash-icon-float"
                      sx={{ color: "#6366f1", fontSize: 20 }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: "15px",
                      }}
                    >
                      Upcoming Events
                    </Typography>
                  </Box>

                  {eventsLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress size={26} sx={{ color: "#6366f1" }} />
                    </Box>
                  ) : events && events.length > 0 ? (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                    >
                      {events.map((event, index) => (
                        <Paper
                          key={index}
                          className="dash-list-item"
                          elevation={0}
                          sx={{
                            p: 1.5,
                            background:
                              "linear-gradient(135deg, #f5f6ff 0%, #eef0ff 100%)",
                            borderRadius: "10px",
                            borderLeft: "4px solid #6366f1",
                            cursor: "default",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#1e293b",
                              mb: 0.3,
                            }}
                          >
                            {event.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "#64748b",
                            }}
                          >
                            {formatDate(event.date)}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 2.5,
                        color: "#94a3b8",
                      }}
                    >
                      <EventIcon sx={{ fontSize: 34, mb: 1, opacity: 0.5 }} />
                      <Typography sx={{ fontSize: "12px" }}>
                        No upcoming events
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Holidays */}
            <Grid item xs={12}>
              <Card
                className="dash-fade-in dash-hover-lift"
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(245, 158, 11, 0.08)",
                  animationDelay: "0.24s",
                  border: "1px solid rgba(245, 158, 11, 0.08)",
                  "&:hover": {
                    boxShadow: "0 12px 28px rgba(245, 158, 11, 0.18)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <BeachAccessIcon
                      className="dash-icon-float"
                      sx={{ color: "#f59e0b", fontSize: 20 }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: "15px",
                      }}
                    >
                      Upcoming Holidays
                    </Typography>
                  </Box>

                  {holidaysLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress size={26} sx={{ color: "#f59e0b" }} />
                    </Box>
                  ) : holidays && holidays.length > 0 ? (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                    >
                      {holidays.map((holiday, index) => (
                        <Paper
                          key={index}
                          className="dash-list-item"
                          elevation={0}
                          sx={{
                            p: 1.5,
                            background:
                              "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                            borderRadius: "10px",
                            borderLeft: "4px solid #f59e0b",
                            cursor: "default",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#1e293b",
                              mb: 0.3,
                            }}
                          >
                            {holiday.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "#64748b",
                            }}
                          >
                            {formatDate(holiday.date)}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 2.5,
                        color: "#94a3b8",
                      }}
                    >
                      <BeachAccessIcon
                        sx={{ fontSize: 34, mb: 1, opacity: 0.5 }}
                      />
                      <Typography sx={{ fontSize: "12px" }}>
                        No upcoming holidays
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Notices & Circulars */}
        <Grid item xs={12}>
          <Card
            className="dash-fade-in dash-hover-lift"
            sx={{
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(236, 72, 153, 0.08)",
              animationDelay: "0.32s",
              border: "1px solid rgba(236, 72, 153, 0.08)",
              "&:hover": {
                boxShadow: "0 12px 28px rgba(236, 72, 153, 0.18)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <NotificationsActiveIcon
                  className="dash-icon-float"
                  sx={{ color: "#ec4899", fontSize: 20 }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "15px",
                  }}
                >
                  Notices & Circulars
                </Typography>
              </Box>

              {noticesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={26} sx={{ color: "#ec4899" }} />
                </Box>
              ) : notices && notices.length > 0 ? (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                >
                  {notices.map((notice, index) => (
                    <Paper
                      key={index}
                      className="dash-list-item"
                      elevation={0}
                      sx={{
                        p: 1.5,
                        background:
                          "linear-gradient(135deg, #fef2f2 0%, #fce7f3 100%)",
                        borderRadius: "10px",
                        borderLeft: "4px solid #ec4899",
                        cursor: "default",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(236, 72, 153, 0.15)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1e293b",
                          mb: 0.3,
                        }}
                      >
                        {notice.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#475569",
                          mb: 0.3,
                        }}
                      >
                        {notice.description}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "10px",
                          color: "#94a3b8",
                        }}
                      >
                        {formatDate(notice.createdAt)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 2.5,
                    color: "#94a3b8",
                  }}
                >
                  <NotificationsActiveIcon
                    sx={{ fontSize: 34, mb: 1, opacity: 0.5 }}
                  />
                  <Typography sx={{ fontSize: "12px" }}>No notices</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}