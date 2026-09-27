import { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, CircularProgress, Grid, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoopIcon from "@mui/icons-material/Loop";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { fetchSchoolDashboard } from "../../../state/schoolDashboardsSlice";

const configs = {
  "follow-up": { title: "Follow-up Dashboard", subtitle: "Manage upcoming follow-ups and communication tasks", icon: AccessTimeIcon, stats: [["total", "TOTAL FOLLOW-UPS", EditNoteIcon, "#10b981"], ["upcoming", "UPCOMING", CalendarMonthIcon, "#f59e0b"], ["overdue", "OVERDUE", WarningAmberIcon, "#ef4444"], ["completed", "COMPLETED", CheckCircleOutlineIcon, "#3b82f6"]], rows: "enquiries", columns: ["Student", "Follow-up Date", "Status", "Priority"] },
  complaint: { title: "Complaint Dashboard", subtitle: "Track complaints, priorities, and resolution progress", icon: WarningAmberIcon, stats: [["total", "TOTAL COMPLAINTS", EditNoteIcon, "#ff6b45"], ["pending", "PENDING", AccessTimeIcon, "#f59e0b"], ["inProgress", "IN PROGRESS", LoopIcon, "#3b82f6"], ["resolved", "RESOLVED", CheckCircleOutlineIcon, "#10b981"], ["unresolved", "UNRESOLVED", WarningAmberIcon, "#ef4444"], ["todays", "TODAY'S", CalendarMonthIcon, "#8b5cf6"]], rows: "complaints", columns: ["Name", "Type", "Priority", "Status", "Date"] },
  visitor: { title: "Visitor Dashboard", subtitle: "Track visitor check-ins, purposes, and footfall trends", icon: PeopleOutlineIcon, stats: [["total", "TOTAL VISITORS", PeopleOutlineIcon, "#334155"], ["todaysVisitors", "TODAY'S VISITORS", CalendarMonthIcon, "#7c3aed"], ["currentlyInside", "CURRENTLY INSIDE", LoopIcon, "#f97316"], ["checkedOutToday", "CHECKED OUT TODAY", CheckCircleOutlineIcon, "#65a30d"], ["thisWeek", "THIS WEEK", ShowChartIcon, "#1683ed"], ["thisMonth", "THIS MONTH", CalendarMonthIcon, "#ef233c"]], rows: "visitors", columns: ["Visitor", "Purpose", "Meeting With", "Date", "Status"] },
  chat: { title: "Chat Analytics Dashboard", subtitle: "Monitor chat activity, staff performance, and student interactions", icon: ChatBubbleOutlineIcon, stats: [["total", "TOTAL CHATS", ChatBubbleOutlineIcon, "#334155"], ["open", "OPEN", AccessTimeIcon, "#f59e0b"], ["inProgress", "IN PROGRESS", LoopIcon, "#3b82f6"], ["resolved", "RESOLVED", CheckCircleOutlineIcon, "#10b981"], ["reopened", "REOPENED", WarningAmberIcon, "#ef4444"]], rows: "tickets", columns: ["Ticket #", "Subject", "Category", "Student", "Status"] },
  "user-activity": { title: "User Activity Dashboard", subtitle: "Monitor user engagement and ERP utilization", icon: ShowChartIcon, stats: [["totalUsers", "TOTAL USERS", PeopleOutlineIcon, "#334155"], ["active", "ACTIVE (7D)", CheckCircleOutlineIcon, "#65a30d"], ["inactive", "INACTIVE", WarningAmberIcon, "#ef4444"], ["activeToday", "ACTIVE TODAY", ShowChartIcon, "#1683ed"], ["neverLoggedIn", "NEVER LOGGED IN", WarningAmberIcon, "#f97316"]], rows: "users", columns: ["User", "Role", "Action", "Status", "Date"] },
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";

export default function SchoolOperationsDashboard({ type }) {
  const config = configs[type];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((root) => root.schoolDashboards[type]);
  useEffect(() => { dispatch(fetchSchoolDashboard(type)); }, [dispatch, type]);
  const data = state?.data || {};
  const rows = data[config.rows] || [];
  const Icon = config.icon;
  const renderRow = (row) => {
    if (type === "follow-up") return [row.studentName || row.name, formatDate(row.followUpDate), row.status, row.priority];
    if (type === "complaint") return [row.complaintBy, row.complaintType, row.priority, row.status, formatDate(row.date)];
    if (type === "visitor") return [row.visitorName, row.purpose, row.meetingWith, formatDate(row.date), row.status];
    if (type === "chat") return [row.ticketNumber || "-", row.subject, row.category, row.student, row.status];
    return [row.user, row.role, row.action, row.status, formatDate(row.createdAt)];
  };

  return <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 3 }, background: "#f1f3f6" }}>
    <Card sx={{ borderRadius: 2, mb: 2.5, boxShadow: "0 4px 16px rgba(15,23,42,.08)" }}><CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: { xs: 2, md: 3 } } }}><Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}><Box><Typography sx={{ color: "#17233b", fontSize: { xs: 20, md: 23 }, fontWeight: 800, display: "flex", gap: 1, alignItems: "center" }}><Icon sx={{ color: "#f15b3a" }} />{config.title}</Typography><Typography sx={{ color: "#718096", fontSize: 12, mt: .6 }}>{config.subtitle}</Typography></Box><Stack direction="row" gap={1}><Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/school")} sx={{ display: { xs: "none", sm: "flex" }, color: "#f15b3a", textTransform: "none" }}>Back</Button><Button startIcon={<RefreshIcon />} onClick={() => dispatch(fetchSchoolDashboard(type))} variant="outlined" sx={{ color: "#f15b3a", borderColor: "#f15b3a", textTransform: "none" }}>Refresh</Button></Stack></Stack></CardContent></Card>
    {state?.error && <Typography color="error" sx={{ mb: 2 }}>{state.error}</Typography>}
    {state?.loading && !state.data ? <Box sx={{ display: "grid", placeItems: "center", minHeight: 250 }}><CircularProgress sx={{ color: "#f15b3a" }} /></Box> : <>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>{config.stats.map(([key, label, StatIcon, color]) => <Grid item xs={6} sm={4} md={12 / Math.min(config.stats.length, 6)} key={key}><Card sx={{ borderTop: `3px solid ${color}`, borderRadius: 2, minHeight: 128, boxShadow: "0 3px 12px rgba(15,23,42,.06)" }}><CardContent sx={{ textAlign: "center", p: 1.7 }}><StatIcon sx={{ color, bgcolor: `${color}15`, p: 1, borderRadius: 2, fontSize: 40 }} /><Typography sx={{ color: "#17233b", fontSize: 23, fontWeight: 800, mt: .5 }}>{data[key] ?? 0}</Typography><Typography sx={{ color: "#7b8794", fontSize: 10, fontWeight: 700 }}>{label}</Typography></CardContent></Card></Grid>)}</Grid>
      {type === "complaint" && <Card sx={{ mb: 2.5, borderRadius: 2 }}><CardContent><Typography sx={{ fontWeight: 800, mb: 1.5 }}>Priority Breakdown</Typography><Grid container spacing={1}>{Object.entries(data.priority || {}).map(([key, value]) => <Grid item xs={6} md={3} key={key}><Box sx={{ bgcolor: "#f4f6f9", p: 1.2, borderRadius: 1, display: "flex", justifyContent: "space-between" }}><Typography sx={{ fontSize: 12, color: "#3b82f6" }}>{key}</Typography><b>{value}</b></Box></Grid>)}</Grid></CardContent></Card>}
      {type === "visitor" && <Card sx={{ mb: 2.5, borderRadius: 2, minHeight: 150 }}><CardContent><Typography sx={{ fontWeight: 800, mb: 2 }}>Last 7 Days</Typography><Stack direction="row" justifyContent="space-around" alignItems="flex-end" sx={{ height: 80 }}>{(data.dailyVisitors || []).map((point) => <Box key={point._id} sx={{ textAlign: "center" }}><Typography sx={{ fontSize: 11 }}>{point.count}</Typography><Box sx={{ width: 34, height: Math.max(point.count * 8, 3), bgcolor: "#24619a", mt: .5 }} /><Typography sx={{ fontSize: 10, color: "#718096" }}>{point._id.slice(5)}</Typography></Box>)}</Stack></CardContent></Card>}
      <Card sx={{ borderRadius: 2, overflow: "hidden" }}><CardContent sx={{ pb: 1 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontWeight: 800 }}>{type === "chat" ? "Recent Chats" : type === "visitor" ? "Recent Visitors" : type === "user-activity" ? "Users" : type === "complaint" ? "Complaints" : "Follow-up Records"}</Typography><Select size="small" defaultValue="all" sx={{ fontSize: 12, minWidth: 115 }}><MenuItem value="all">All Records</MenuItem></Select></Stack></CardContent><Box sx={{ overflowX: "auto" }}><Table size="small" sx={{ minWidth: 720 }}><TableHead><TableRow>{config.columns.map((column) => <TableCell key={column} sx={{ bgcolor: "#f1f3f7", fontSize: 11, fontWeight: 700 }}>{column}</TableCell>)}</TableRow></TableHead><TableBody>{rows.length ? rows.map((row, index) => <TableRow key={row._id || index}>{renderRow(row).map((cell, cellIndex) => <TableCell key={cellIndex} sx={{ fontSize: 12 }}>{cell || "-"}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={config.columns.length} align="center" sx={{ py: 8, color: "#a0aec0" }}>No Data</TableCell></TableRow>}</TableBody></Table></Box></Card>
    </>}
  </Box>;
}

SchoolOperationsDashboard.propTypes = {
  type: PropTypes.oneOf(["follow-up", "complaint", "visitor", "chat", "user-activity"]).isRequired,
};
