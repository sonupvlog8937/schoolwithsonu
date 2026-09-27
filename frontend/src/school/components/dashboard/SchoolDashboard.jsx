import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Stack,
  Chip, CircularProgress, LinearProgress, Divider, IconButton,
  Paper, alpha, Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../environment";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import WarningIcon from "@mui/icons-material/Warning";
import CakeIcon from "@mui/icons-material/Cake";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventIcon from "@mui/icons-material/Event";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Color theme - White & Yellow/Orange
const THEME = {
  primary: "#ff6b35",      // Orange
  secondary: "#ffa726",    // Light orange
  success: "#4caf50",      // Green
  warning: "#ff9800",      // Yellow-orange
  error: "#ef5350",        // Red
  info: "#29b6f6",         // Blue
  purple: "#9c27b0",       // Purple
  bg: "#ffffff",           // White background
  cardBg: "#ffffff",       // White cards
  border: "#f5f5f5",       // Light gray border
};

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color, onClick, loading }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        border: "1px solid #f0f0f0",
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        "&:hover": onClick ? {
          boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
          transform: "translateY(-2px)",
        } : {},
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(color, 0.12),
              color: color,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Box sx={{ width: 80, height: 32, bgcolor: "#f5f5f5", borderRadius: 1, mt: 0.5 }} />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: color,
                  lineHeight: 1.2,
                  mt: 0.5,
                  fontSize: "1.8rem",
                }}
              >
                {value ?? 0}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {onClick && (
            <IconButton size="small" sx={{ color: color }}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// Summary Card Component
function SummaryCard({ icon, value, label, color }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.15)}`,
      }}
    >
      <Avatar sx={{ bgcolor: alpha(color, 0.15), color: color, width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: color }}>
          {value ?? 0}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [todayData, setTodayData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const authHeader = token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}`;

      const response = await axios.get(`${baseUrl}/dashboard/stats`, {
        headers: { Authorization: authHeader },
      });

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box sx={{ p: 3, bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 3,
          p: 3,
          mb: 3,
          border: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(THEME.primary, 0.12),
              color: THEME.primary,
            }}
          >
            <SchoolIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#1a1a2e" }}>
              WISDOM WORLD PUBLIC SCHOOL
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here's what's happening at your school today
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Chip
            icon={<CurrencyRupeeIcon />}
            label="Collect Fee"
            onClick={() => navigate("/school/fees/collect")}
            sx={{
              bgcolor: THEME.success,
              color: "white",
              fontWeight: 700,
              "&:hover": { bgcolor: "#388e3c" },
            }}
          />
          <Chip
            icon={<EventIcon />}
            label={today.split(",")[0] + ", " + today.split(",")[1].split(" ")[2] + " " + today.split(",")[1].split(" ")[1]}
            sx={{
              bgcolor: THEME.primary,
              color: "white",
              fontWeight: 700,
            }}
          />
        </Stack>
      </Box>

      {/* Main Stats - Top Row */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<PeopleIcon />}
            title="Total Students"
            value={stats?.totalStudents}
            color={THEME.primary}
            onClick={() => navigate("/school/students")}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<CheckCircleIcon />}
            title="Today's Attendance"
            value={`${stats?.todayAttendancePercentage ?? 0}%`}
            color={THEME.success}
            onClick={() => navigate("/school/attendance")}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<CurrencyRupeeIcon />}
            title="Today's Collection"
            value={`${((stats?.todayCollection ?? 0) / 1000).toFixed(1)} K`}
            color={THEME.warning}
            onClick={() => navigate("/school/fees/collect")}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<WarningIcon />}
            title="Absent Today"
            value={stats?.absentToday}
            color={THEME.error}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<TrendingUpIcon />}
            title="Fee Due Students"
            value={stats?.feeDueStudents}
            color={THEME.purple}
            onClick={() => navigate("/school/fees/search-due")}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Second Row - Charts & Summary */}
      <Grid container spacing={3} mb={3}>
        {/* Weekly Attendance */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  📊 Weekly Attendance
                </Typography>
                <Chip
                  label="View All →"
                  size="small"
                  clickable
                  onClick={() => navigate("/school/attendance")}
                  sx={{ color: THEME.primary, fontWeight: 700 }}
                />
              </Stack>
              <Box sx={{ height: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2 }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  📈 Attendance chart will be displayed here
                  <br />
                  (Integration with chart library needed)
                </Typography>
              </Box>
              <Stack direction="row" spacing={3} justifyContent="center" mt={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: THEME.success }} />
                  <Typography variant="caption">Present: 0</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: THEME.error }} />
                  <Typography variant="caption">Absent: 0</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: THEME.warning }} />
                  <Typography variant="caption">Leave: 0</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Summary */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                ☀️ Today's Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <SummaryCard
                    icon={<CurrencyRupeeIcon fontSize="small" />}
                    value={`${((stats?.todayCollection ?? 0) / 1000).toFixed(1)} K`}
                    label="Fee Collected"
                    color={THEME.success}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SummaryCard
                    icon={<PersonAddIcon fontSize="small" />}
                    value={stats?.newAdmissions}
                    label="New Admissions"
                    color={THEME.info}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SummaryCard
                    icon={<WarningIcon fontSize="small" />}
                    value={stats?.complaints}
                    label="Complaints"
                    color={THEME.warning}
                  />
                </Grid>
                <Grid item xs={6}>
                  <SummaryCard
                    icon={<CakeIcon fontSize="small" />}
                    value={stats?.birthdays}
                    label="Birthdays"
                    color={THEME.purple}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Third Row - Events, Birthdays, Exams */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2, minHeight: 180 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                  <EventIcon sx={{ color: THEME.success }} /> Upcoming Events
                </Typography>
                <Chip label="View All →" size="small" clickable sx={{ fontSize: "0.7rem", color: THEME.primary }} />
              </Stack>
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                <EventIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">No upcoming events</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2, minHeight: 180 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                  <CakeIcon sx={{ color: THEME.error }} /> Today's Birthdays
                </Typography>
                <Chip label="View All →" size="small" clickable sx={{ fontSize: "0.7rem", color: THEME.primary }} />
              </Stack>
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                <CakeIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">No birthdays today</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2, minHeight: 180 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                  <AssignmentIcon sx={{ color: THEME.error }} /> Upcoming Exams
                </Typography>
                <Chip label="View All →" size="small" clickable sx={{ fontSize: "0.7rem", color: THEME.primary }} />
              </Stack>
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                <AssignmentIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography variant="body2">No upcoming exams</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fourth Row - Additional Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(THEME.success, 0.12), color: THEME.success, mx: "auto", mb: 1 }}>
                <LocalLibraryIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.totalStaff ?? 24}</Typography>
              <Typography variant="body2" color="text.secondary">Total Staff</Typography>
              <Typography variant="caption" sx={{ color: THEME.success }}>{stats?.totalTeachers ?? 20} Teachers</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(THEME.primary, 0.12), color: THEME.primary, mx: "auto", mb: 1 }}>
                <MenuBookIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.libraryBooks ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">Library Books</Typography>
              <Typography variant="caption" sx={{ color: THEME.primary }}>{stats?.libraryBooks ?? 0} Issued</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(THEME.warning, 0.12), color: THEME.warning, mx: "auto", mb: 1 }}>
                <DirectionsBusIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Vehicles</Typography>
              <Typography variant="body2" color="text.secondary">{stats?.vehicles?.routes ?? 1} Routes · {stats?.vehicles?.students ?? 313} Students</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(THEME.info, 0.12), color: THEME.info, mx: "auto", mb: 1 }}>
                <BeachAccessIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{stats?.upcomingHolidays ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">Upcoming Holidays</Typography>
              <Typography variant="caption" sx={{ color: THEME.info }}>This Quarter</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fifth Row - Gender Ratio, Staff Today, Fee Collection, Pending Items */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon sx={{ fontSize: 18, color: THEME.primary }} /> Gender Ratio
              </Typography>
              <Stack direction="row" spacing={1} mb={1}>
                <Box sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: THEME.info }} style={{ width: `${((stats?.genderRatio?.boys ?? 516) / ((stats?.genderRatio?.boys ?? 516) + (stats?.genderRatio?.girls ?? 13))) * 100}%` }} />
                <Box sx={{ flex: 1, height: 8, borderRadius: 1, bgcolor: THEME.error }} style={{ width: `${((stats?.genderRatio?.girls ?? 13) / ((stats?.genderRatio?.boys ?? 516) + (stats?.genderRatio?.girls ?? 13))) * 100}%` }} />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ color: THEME.info }}>● 98%</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{stats?.genderRatio?.boys ?? 516} Boys</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" sx={{ color: THEME.error }}>● 2%</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{stats?.genderRatio?.girls ?? 13} Girls</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon sx={{ fontSize: 18, color: THEME.warning }} /> Staff Today
              </Typography>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: alpha(THEME.success, 0.15), color: THEME.success, mx: "auto", fontSize: "1.5rem", fontWeight: 800 }}>
                  {stats?.staffPresent ?? 0}%
                </Avatar>
                <Typography variant="caption" color="text.secondary">Present</Typography>
              </Box>
              <Stack spacing={0.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption">● Present: {stats?.staffPresent ?? 0}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" sx={{ color: THEME.error }}>● Absent: {stats?.staffAbsent ?? 0}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" sx={{ color: THEME.warning }}>● Leave: {stats?.staffLeave ?? 0}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <CurrencyRupeeIcon sx={{ fontSize: 18, color: THEME.success }} /> Fee Collection
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((stats?.feeCollected ?? 26.66) / ((stats?.feeCollected ?? 26.66) + (stats?.feePending ?? 35.57))) * 100}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  mb: 2,
                  bgcolor: alpha(THEME.error, 0.15),
                  "& .MuiLinearProgress-bar": { bgcolor: THEME.success },
                }}
              />
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: THEME.success }}>{stats?.feeCollected ?? 26.66} L</Typography>
                  <Typography variant="caption" color="text.secondary">Collected</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: THEME.error }}>{stats?.feePending ?? 35.57} L</Typography>
                  <Typography variant="caption" color="text.secondary">Pending</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <WarningIcon sx={{ fontSize: 18, color: THEME.warning }} /> Pending Items
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Fee Dues</Typography>
                  <Chip label={stats?.pendingItems?.feeDues ?? 526} size="small" sx={{ bgcolor: alpha(THEME.error, 0.12), color: THEME.error, fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Complaints</Typography>
                  <Chip label={stats?.pendingItems?.complaints ?? 0} size="small" sx={{ bgcolor: alpha(THEME.warning, 0.12), color: THEME.warning, fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Overdue Docs</Typography>
                  <Chip label={stats?.pendingItems?.overdueDocs ?? 0} size="small" sx={{ bgcolor: alpha(THEME.error, 0.12), color: THEME.error, fontWeight: 700 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Complaint Overview */}
      <Card elevation={0} sx={{ border: "1px solid #f0f0f0", borderRadius: 2, mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon sx={{ fontSize: 18, color: THEME.warning }} /> Complaint Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.primary }}>0</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.warning }}>0</Typography>
                <Typography variant="caption" color="text.secondary">In Progress</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.success }}>0</Typography>
                <Typography variant="caption" color="text.secondary">Resolved</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.error }}>0</Typography>
                <Typography variant="caption" color="text.secondary">Critical</Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.info }}>0</Typography>
                <Typography variant="caption" color="text.secondary">Low</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.info }}>0</Typography>
                <Typography variant="caption" color="text.secondary">Medium</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.warning }}>0</Typography>
                <Typography variant="caption" color="text.secondary">High</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.error }}>0</Typography>
                <Typography variant="caption" color="text.secondary">Critical</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
