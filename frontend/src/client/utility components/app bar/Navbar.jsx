import React, { useState, useContext } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { APP_NAME, LOGO_URL } from '../../../branding';

import "./Navbar.css";

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { authenticated, user } = useContext(AuthContext);
  const location = useLocation();
  const theme = useTheme();

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backgroundColor: alpha(
          theme.palette.background.paper,
          theme.palette.mode === "dark" ? 0.78 : 0.86
        ),
        backdropFilter: "blur(14px) saturate(1.2)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '70px' }}>
          
          {/* DESKTOP LOGO */}
          <Box component={Link} to="/" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', textDecoration: 'none', mr: 2 }}>
            <img 
              src={LOGO_URL}
              alt={`${APP_NAME} logo`}
              style={{ height: '45px', width: '45px', marginRight: '10px', borderRadius: '8px' }} 
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: theme.palette.text.primary,
              }}
            >
              {APP_NAME}
            </Typography>
          </Box>

          {/* MOBILE MENU ICON */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {!authenticated ? [
                <MenuItem key="register" onClick={handleCloseNavMenu} component={Link} to="/register">
                  <AppRegistrationIcon sx={{ mr: 1, fontSize: '20px' }} /> Register
                </MenuItem>,
                <MenuItem key="login" onClick={handleCloseNavMenu} component={Link} to="/login">
                  <LoginIcon sx={{ mr: 1, fontSize: '20px' }} /> Login
                </MenuItem>
              ] : [
                <MenuItem key="dashboard" onClick={handleCloseNavMenu} component={Link} to={`/${user?.role?.toLowerCase()}`}>
                  <DashboardIcon sx={{ mr: 1, fontSize: '20px' }} /> Dashboard
                </MenuItem>,
                <MenuItem key="logout" onClick={handleCloseNavMenu} component={Link} to="/logout">
                  <LogoutIcon sx={{ mr: 1, fontSize: '20px', color: 'error.main' }} /> 
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              ]}
            </Menu>
          </Box>

          {/* MOBILE LOGO */}
          <Box component={Link} to="/" sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1, alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src={LOGO_URL}
              alt={`${APP_NAME} logo`}
              style={{ height: '35px', width: '35px', marginRight: '8px' }} 
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: theme.palette.text.primary,
              }}
            >
              {APP_NAME}
            </Typography>
          </Box>

          {/* DESKTOP MENU ITEMS */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: "flex-end", gap: 2, alignItems: 'center' }}>
            {!authenticated ? (
              <>
                <Button 
                  component={Link} 
                  to="/login"
                  variant={location.pathname === '/login' ? "contained" : "text"}
                  startIcon={<LoginIcon />}
                  sx={{ borderRadius: '8px', fontWeight: 600, textTransform: 'none' }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  to="/register"
                  variant="contained" 
                  sx={{ borderRadius: '8px', fontWeight: 600, textTransform: 'none', boxShadow: 'none' }}
                >
                  Register
                </Button>
              </>
            ) : (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, border: `2px solid ${theme.palette.primary.main}` }}>
                    {/* User initial as avatar if image is missing */}
                    <Avatar alt={user?.name || 'User'} src={user?.avatar}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem component={Link} to={`/${user?.role?.toLowerCase()}`} onClick={handleCloseUserMenu}>
                    <DashboardIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                    <Typography textAlign="center">Dashboard</Typography>
                  </MenuItem>
                  <MenuItem component={Link} to="/logout" onClick={handleCloseUserMenu}>
                    <LogoutIcon sx={{ mr: 1.5, color: 'error.main' }} />
                    <Typography textAlign="center" color="error.main">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;