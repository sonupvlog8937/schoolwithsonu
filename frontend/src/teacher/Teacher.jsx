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
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import ExplicitIcon from "@mui/icons-material/Explicit";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";
import LogoutIcon from "@mui/icons-material/Logout";
import TheatersIcon from "@mui/icons-material/Theaters";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Chip from "@mui/material/Chip";
import axios from "axios";
import { APP_NAME, LOGO_URL } from "../branding";
import { AuthContext } from "../context/AuthContext";
import { baseUrl } from "../environment";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const drawerWidth = 250;

const TEACHER_DOC_TITLE_MAP = {
  "/teacher": "Details",
  "/teacher/details": "Details",
  "/teacher/periods": "Schedule",
  "/teacher/attendance": "Attendance",
  "/teacher/examinations": "Examinations",
  "/teacher/notice": "Notices",
};

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          "& .MuiDrawer-paper": openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          "& .MuiDrawer-paper": closedMixin(theme),
        },
      },
    ],
  })
);

export default function Teacher() {
  const theme = useTheme();
  useDocumentTitle("Teacher", TEACHER_DOC_TITLE_MAP);
  const [open, setOpen] = React.useState(false);
  const [fetchedSchoolName, setFetchedSchoolName] = React.useState(null);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!user?.id) return;
    if (user?.school_name) return;
    let cancelled = false;
    axios
      .get(`${baseUrl}/teacher/fetch-own`)
      .then((r) => {
        const name = r.data?.data?.school?.school_name;
        if (!cancelled && name) setFetchedSchoolName(name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.school_name]);

  const topbarName =
    user?.school_name ||
    fetchedSchoolName ||
    user?.schoolName ||
    user?.school?.school_name ||
    user?.school?.name ||
    APP_NAME;

  const navArr = [
    { link: "/teacher/details", component: "Details", icon: TheatersIcon },
    { link: "/teacher/periods", component: "Periods", icon: CalendarMonthIcon },
    { link: "/teacher/attendance", component: "Attendance", icon: RecentActorsIcon },
    { link: "/teacher/examinations", component: "Examinations", icon: ExplicitIcon },
    { link: "/teacher/notice", component: "Notice", icon: CircleNotificationsIcon },
    { link: "/logout", component: "Log Out", icon: LogoutIcon },
  ];

  const isActive = (link) => {
    if (!link || link === "/logout") return false;
    if (link === "/teacher/details") return location.pathname === "/teacher" || location.pathname === "/teacher/details";
    return location.pathname.startsWith(link);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {open ? (
            <>
              <IconButton
                color="inherit"
                aria-label="close drawer"
                onClick={() => setOpen(false)}
                edge="start"
                sx={{ mr: 0.5 }}
              >
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ fontWeight: 900, letterSpacing: "-0.02em", flex: 1, minWidth: 0 }}
              >
                {APP_NAME}
              </Typography>
            </>
          ) : (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setOpen(true)}
                edge="start"
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, flex: 1, minWidth: 0 }}>
                {topbarName}
              </Typography>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ justifyContent: "space-between", px: 1, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1, minWidth: 0, flex: 1 }}>
            <Box
              component="img"
              src={LOGO_URL}
              alt={`${APP_NAME} logo`}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                flexShrink: 0,
                display: open ? "block" : "none",
              }}
            />
            {open ? (
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }} noWrap>
                  {APP_NAME}
                </Typography>
                <Chip
                  size="small"
                  label="Teacher Panel"
                  sx={{
                    height: 20,
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.12),
                    color: theme.palette.primary.main,
                    mt: 0.35,
                  }}
                />
              </Box>
            ) : null}
          </Box>
          <IconButton onClick={() => setOpen(false)} aria-label="close drawer" sx={{ flexShrink: 0 }}>
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ height: "100%", px: open ? 1 : 0.5 }}>
          {navArr.map((navItem) => {
            const active = isActive(navItem.link);
            const isLogout = navItem.link === "/logout";
            const button = (
              <ListItemButton
                selected={active}
                sx={{
                  minHeight: 44,
                  px: open ? 1.5 : 1.2,
                  mb: 0.5,
                  borderRadius: 2,
                  justifyContent: open ? "initial" : "center",
                  color: isLogout ? "error.main" : "text.primary",
                  "&.Mui-selected": {
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.12),
                    color: theme.palette.primary.main,
                    "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                  },
                  "&:hover": {
                    bgcolor: alpha(
                      isLogout ? theme.palette.error.main : theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.18 : 0.1
                    ),
                  },
                }}
                onClick={() => navigate(navItem.link)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 1.5 : "auto",
                    justifyContent: "center",
                    color: isLogout ? "error.main" : "text.secondary",
                  }}
                >
                  <navItem.icon />
                </ListItemIcon>
                <ListItemText primary={navItem.component} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            );

            return (
              <ListItem key={navItem.link} disablePadding sx={{ display: "block" }}>
                {open ? button : (
                  <Tooltip title={navItem.component} placement="right" arrow>
                    {button}
                  </Tooltip>
                )}
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}>
        <DrawerHeader />
        <Breadcrumb />
        <Outlet />
      </Box>
    </Box>
  );
}
