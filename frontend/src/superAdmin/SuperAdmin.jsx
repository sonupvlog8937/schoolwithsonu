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
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import PendingIcon from "@mui/icons-material/Pending";
import { APP_NAME, LOGO_URL } from "../branding";
import { AuthContext } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const drawerWidth = 260;
const openedMixin = (theme) => ({ width: drawerWidth, transition: theme.transitions.create("width", { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }), overflowX: "hidden" });
const closedMixin = (theme) => ({ transition: theme.transitions.create("width", { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }), overflowX: "hidden", width: `calc(${theme.spacing(7)} + 1px)`, [theme.breakpoints.up("sm")]: { width: `calc(${theme.spacing(8)} + 1px)` } });
const DrawerHeader = styled("div")(({ theme }) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", padding: theme.spacing(0, 1), ...theme.mixins.toolbar }));
const AppBar = styled(MuiAppBar, { shouldForwardProp: (p) => p !== "open" })(({ theme }) => ({ zIndex: theme.zIndex.drawer + 1, transition: theme.transitions.create(["width", "margin"], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }), variants: [{ props: ({ open }) => open, style: { marginLeft: drawerWidth, width: `calc(100% - ${drawerWidth}px)`, transition: theme.transitions.create(["width", "margin"], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) } }] }));
const Drawer = styled(MuiDrawer, { shouldForwardProp: (p) => p !== "open" })(({ theme }) => ({ width: drawerWidth, flexShrink: 0, whiteSpace: "nowrap", boxSizing: "border-box", variants: [{ props: ({ open }) => open, style: { ...openedMixin(theme), "& .MuiDrawer-paper": openedMixin(theme) } }, { props: ({ open }) => !open, style: { ...closedMixin(theme), "& .MuiDrawer-paper": closedMixin(theme) } }] }));

const NAV = [
  { link: "/super-admin/dashboard",        label: "Dashboard",        icon: DashboardIcon },
  { link: "/super-admin/pending-schools",  label: "Pending Approvals", icon: PendingIcon },
  { link: "/super-admin/schools",          label: "All Schools",      icon: SchoolIcon },
  { link: "/super-admin/admins",           label: "Admins",           icon: AdminPanelSettingsIcon },
  { link: "/super-admin/reports",          label: "Reports",          icon: BarChartIcon },
  { link: "/super-admin/settings",         label: "Settings",         icon: SettingsIcon },
  { link: "/logout",                       label: "Log Out",          icon: LogoutIcon },
];

export default function SuperAdmin() {
  const theme = useTheme();
  useDocumentTitle("Super Admin");
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const profileMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate("/super-admin/profile");
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    navigate("/logout");
  };

  const isActive = (link) => {
    if (!link || link === "/logout") return false;
    if (link === "/super-admin/dashboard") return location.pathname === "/super-admin" || location.pathname === "/super-admin/dashboard";
    return location.pathname.startsWith(link);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)" }}>
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {open ? (
            <>
              <IconButton color="inherit" onClick={() => setOpen(false)} edge="start" sx={{ mr: 0.5 }}>
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 900, flex: 1 }}>
                {APP_NAME}
              </Typography>
            </>
          ) : (
            <>
              <IconButton color="inherit" onClick={() => setOpen(true)} edge="start" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, flex: 1 }}>
                Super Admin — {APP_NAME}
              </Typography>
            </>
          )}
          
          {/* Profile Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "flex-end" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                {user?.name || "Super Admin"}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>
                Role: {user?.role || "SUPERADMIN"}
              </Typography>
            </Box>
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{
                  p: 0,
                  border: "2px solid rgba(255,255,255,0.3)",
                  "&:hover": { border: "2px solid rgba(255,255,255,0.6)" },
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "#dc2626",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                  }}
                  src={user?.image_url}
                >
                  {user?.name?.[0]?.toUpperCase() || "SA"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 4,
              sx: {
                minWidth: 240,
                mt: 1.5,
                borderRadius: 2,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1.2,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                {user?.name || "Super Admin"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || "superadmin@edusmart.com"}
              </Typography>
              <Chip
                label={user?.role || "SUPERADMIN"}
                size="small"
                sx={{
                  mt: 0.8,
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  bgcolor: alpha("#dc2626", 0.12),
                  color: "#dc2626",
                }}
              />
            </Box>
            
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Edit Profile" />
            </MenuItem>
            
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ justifyContent: "space-between", px: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1, flex: 1, minWidth: 0 }}>
            {open && <Box component="img" src={LOGO_URL} alt={APP_NAME} sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0 }} />}
            {open && (<Box sx={{ minWidth: 0 }}><Typography sx={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }} noWrap>{APP_NAME}</Typography><Chip size="small" label="Super Admin" sx={{ height: 20, fontWeight: 800, fontSize: "0.7rem", bgcolor: alpha("#dc2626", 0.12), color: "#dc2626", mt: 0.35 }} /></Box>)}
          </Box>
          <IconButton onClick={() => setOpen(false)}>{theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ height: "100%", px: open ? 1 : 0.5 }}>
          {NAV.map((item) => {
            const active = isActive(item.link);
            const isLogout = item.link === "/logout";
            const btn = (<ListItemButton selected={active} onClick={() => navigate(item.link)} sx={{ minHeight: 44, px: open ? 1.5 : 1.2, mb: 0.5, borderRadius: 2, justifyContent: open ? "initial" : "center", color: isLogout ? "error.main" : "text.primary", "&.Mui-selected": { bgcolor: alpha("#dc2626", 0.12), color: "#dc2626", "& .MuiListItemIcon-root": { color: "#dc2626" } }, "&:hover": { bgcolor: alpha(isLogout ? theme.palette.error.main : "#dc2626", 0.08) } }}><ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : "auto", justifyContent: "center", color: isLogout ? "error.main" : "text.secondary" }}><item.icon /></ListItemIcon><ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} /></ListItemButton>);
            return (<ListItem key={item.link} disablePadding sx={{ display: "block" }}>{open ? btn : <Tooltip title={item.label} placement="right" arrow>{btn}</Tooltip>}</ListItem>);
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}><DrawerHeader /><Breadcrumb /><Outlet /></Box>
    </Box>
  );
}
