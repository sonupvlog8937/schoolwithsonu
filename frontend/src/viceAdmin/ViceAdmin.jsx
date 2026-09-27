import * as React from "react";
import { styled, useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ChecklistIcon from "@mui/icons-material/Checklist";
import GradingIcon from "@mui/icons-material/Grading";
import CampaignIcon from "@mui/icons-material/Campaign";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { APP_NAME, LOGO_URL } from "../branding";
import { AuthContext } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const drawerWidth = 260;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  overflowX: "hidden",
});
const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: { width: `calc(${theme.spacing(8)} + 1px)` },
});
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: theme.spacing(0, 1), ...theme.mixins.toolbar,
}));
const AppBar = styled(MuiAppBar, { shouldForwardProp: (p) => p !== "open" })(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
  variants: [{
    props: ({ open }) => open,
    style: { marginLeft: drawerWidth, width: `calc(100% - ${drawerWidth}px)`, transition: theme.transitions.create(["width", "margin"], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) },
  }],
}));
const Drawer = styled(MuiDrawer, { shouldForwardProp: (p) => p !== "open" })(({ theme }) => ({
  width: drawerWidth, flexShrink: 0, whiteSpace: "nowrap", boxSizing: "border-box",
  variants: [
    { props: ({ open }) => open,  style: { ...openedMixin(theme),  "& .MuiDrawer-paper": openedMixin(theme) } },
    { props: ({ open }) => !open, style: { ...closedMixin(theme), "& .MuiDrawer-paper": closedMixin(theme) } },
  ],
}));

// Nav items — each has an optional `permKey` that maps to user.permissions
const NAV_ITEMS = [
  { link: "/vice-admin/dashboard",  label: "Dashboard",   icon: DashboardIcon,  permKey: null },
  { link: "/vice-admin/profile",    label: "My Profile",  icon: PersonIcon,     permKey: null },
  { section: "ACADEMICS" },
  { link: "/vice-admin/students",   label: "Students",    icon: GroupsIcon,     permKey: "canManageStudents" },
  { link: "/vice-admin/teachers",   label: "Teachers",    icon: SchoolIcon,     permKey: "canManageTeachers" },
  { link: "/vice-admin/classes",    label: "Classes",     icon: ClassIcon,      permKey: "canManageClasses" },
  { link: "/vice-admin/subjects",   label: "Subjects",    icon: MenuBookIcon,   permKey: "canManageClasses" },
  { section: "MANAGEMENT" },
  { link: "/vice-admin/attendance", label: "Attendance",  icon: ChecklistIcon,  permKey: "canManageAttendance" },
  { link: "/vice-admin/exams",      label: "Examinations",icon: GradingIcon,    permKey: "canManageExams" },
  { link: "/vice-admin/notice",     label: "Notice",      icon: CampaignIcon,   permKey: "canManageNotices" },
  { link: "/vice-admin/reports",    label: "Reports",     icon: BarChartIcon,   permKey: "canViewReports" },
  { link: "/logout",                label: "Log Out",     icon: LogoutIcon,     permKey: null },
];

export default function ViceAdmin() {
  const theme = useTheme();
  useDocumentTitle("Vice Admin");
  const [open, setOpen] = React.useState(false);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const permissions = user?.permissions || {};

  // Filter nav items based on permissions
  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.section) return true;
    if (!item.permKey) return true;
    return permissions[item.permKey] !== false;
  });

  const isActive = (link) => {
    if (!link || link === "/logout") return false;
    if (link === "/vice-admin/dashboard") return location.pathname === "/vice-admin" || location.pathname === "/vice-admin/dashboard";
    return location.pathname.startsWith(link);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* ── AppBar ── */}
      <AppBar position="fixed" open={open} sx={{ background: "linear-gradient(135deg,#1e3a5f,#2563b0)" }}>
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {open ? (
            <>
              <IconButton color="inherit" onClick={() => setOpen(false)} edge="start" sx={{ mr: 0.5 }}>
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 900, letterSpacing: "-0.02em", flex: 1 }}>
                {APP_NAME}
              </Typography>
            </>
          ) : (
            <>
              <IconButton color="inherit" onClick={() => setOpen(true)} edge="start" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, flex: 1 }}>
                {user?.school_name || APP_NAME}
              </Typography>
              <Chip label="Vice Admin" size="small" sx={{ height: 22, fontWeight: 800, fontSize: "0.7rem", bgcolor: alpha("#fff", 0.2), color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }} />
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Drawer ── */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ justifyContent: "space-between", px: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1, flex: 1, minWidth: 0 }}>
            {open && (
              <Box component="img" src={LOGO_URL} alt={APP_NAME}
                sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0 }} />
            )}
            {open && (
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }} noWrap>
                  {APP_NAME}
                </Typography>
                <Chip size="small" label="Vice Admin Panel"
                  sx={{ height: 20, fontWeight: 800, fontSize: "0.7rem", bgcolor: alpha("#2563b0", 0.12), color: "#2563b0", mt: 0.35 }} />
              </Box>
            )}
          </Box>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />

        {/* User info strip */}
        {open && user && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: alpha("#2563b0", 0.05), borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" fontWeight={700} noWrap>{user.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
          </Box>
        )}

        <List sx={{ height: "100%", px: open ? 1 : 0.5, pt: 1 }}>
          {visibleNav.map((item, idx) => {
            // Section header
            if (item.section) {
              return open ? (
                <Box key={`sec-${idx}`} sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.65rem" }}>
                    {item.section}
                  </Typography>
                </Box>
              ) : <Divider key={`sec-${idx}`} sx={{ my: 0.5 }} />;
            }

            const active   = isActive(item.link);
            const isLogout = item.link === "/logout";

            const btn = (
              <ListItemButton
                selected={active}
                onClick={() => navigate(item.link)}
                sx={{
                  minHeight: 44, px: open ? 1.5 : 1.2, mb: 0.5, borderRadius: 2,
                  justifyContent: open ? "initial" : "center",
                  color: isLogout ? "error.main" : "text.primary",
                  "&.Mui-selected": {
                    bgcolor: alpha("#2563b0", theme.palette.mode === "dark" ? 0.24 : 0.12),
                    color: "#2563b0",
                    "& .MuiListItemIcon-root": { color: "#2563b0" },
                  },
                  "&:hover": { bgcolor: alpha(isLogout ? theme.palette.error.main : "#2563b0", 0.1) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : "auto", justifyContent: "center", color: isLogout ? "error.main" : "text.secondary" }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            );

            return (
              <ListItem key={item.link} disablePadding sx={{ display: "block" }}>
                {open ? btn : <Tooltip title={item.label} placement="right" arrow>{btn}</Tooltip>}
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* ── Main content ── */}
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}>
        <DrawerHeader />
        <Breadcrumb />
        <Outlet />
      </Box>
    </Box>
  );
}
