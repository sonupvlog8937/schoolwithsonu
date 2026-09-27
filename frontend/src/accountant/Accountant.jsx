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
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CampaignIcon from "@mui/icons-material/Campaign";
import LogoutIcon from "@mui/icons-material/Logout";
import { APP_NAME, LOGO_URL } from "../branding";
import { AuthContext } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const drawerWidth = 250;

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
  variants: [{ props: ({ open }) => open, style: { marginLeft: drawerWidth, width: `calc(100% - ${drawerWidth}px)`, transition: theme.transitions.create(["width", "margin"], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) } }],
}));
const Drawer = styled(MuiDrawer, { shouldForwardProp: (p) => p !== "open" })(({ theme }) => ({
  width: drawerWidth, flexShrink: 0, whiteSpace: "nowrap", boxSizing: "border-box",
  variants: [
    { props: ({ open }) => open,  style: { ...openedMixin(theme),  "& .MuiDrawer-paper": openedMixin(theme) } },
    { props: ({ open }) => !open, style: { ...closedMixin(theme), "& .MuiDrawer-paper": closedMixin(theme) } },
  ],
}));

const NAV = [
  { link: "/accountant/details",  label: "My Profile",   icon: DashboardIcon },
  { link: "/accountant/fees",     label: "Fees",         icon: AccountBalanceWalletIcon },
  { link: "/accountant/income",   label: "Income",       icon: ReceiptLongIcon },
  { link: "/accountant/expenses", label: "Expenses",     icon: ReceiptLongIcon },
  { link: "/accountant/notice",   label: "Notice",       icon: CampaignIcon },
  { link: "/logout",              label: "Log Out",      icon: LogoutIcon },
];

export default function Accountant() {
  const theme = useTheme();
  useDocumentTitle("Accountant");
  const [open, setOpen] = React.useState(false);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (link) => {
    if (!link || link === "/logout") return false;
    if (link === "/accountant/details") return location.pathname === "/accountant" || location.pathname === "/accountant/details";
    return location.pathname.startsWith(link);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {open ? (
            <>
              <IconButton color="inherit" onClick={() => setOpen(false)} edge="start" sx={{ mr: 0.5 }}>
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 900, letterSpacing: "-0.02em", flex: 1 }}>{APP_NAME}</Typography>
            </>
          ) : (
            <>
              <IconButton color="inherit" onClick={() => setOpen(true)} edge="start" sx={{ mr: 1 }}><MenuIcon /></IconButton>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, flex: 1 }}>{user?.school_name || APP_NAME}</Typography>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ justifyContent: "space-between", px: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1, flex: 1, minWidth: 0 }}>
            {open && <Box component="img" src={LOGO_URL} alt={APP_NAME} sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0 }} />}
            {open && (
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }} noWrap>{APP_NAME}</Typography>
                <Chip size="small" label="Accountant Panel" sx={{ height: 20, fontWeight: 800, fontSize: "0.7rem", bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, mt: 0.35 }} />
              </Box>
            )}
          </Box>
          <IconButton onClick={() => setOpen(false)}>{theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ height: "100%", px: open ? 1 : 0.5 }}>
          {NAV.map((item) => {
            const active = isActive(item.link);
            const isLogout = item.link === "/logout";
            const btn = (
              <ListItemButton selected={active} onClick={() => navigate(item.link)}
                sx={{ minHeight: 44, px: open ? 1.5 : 1.2, mb: 0.5, borderRadius: 2, justifyContent: open ? "initial" : "center", color: isLogout ? "error.main" : "text.primary",
                  "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, "& .MuiListItemIcon-root": { color: theme.palette.primary.main } },
                  "&:hover": { bgcolor: alpha(isLogout ? theme.palette.error.main : theme.palette.primary.main, 0.1) } }}>
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
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}
