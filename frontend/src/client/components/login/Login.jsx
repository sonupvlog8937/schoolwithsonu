import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useFormik } from "formik";
import { loginSchema } from "../../../yupSchema/loginSchema";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { storeUserSession } from "../../../utils/authUtils";
import { APP_NAME, LOGO_URL } from "../../../branding";

import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CalculateIcon from "@mui/icons-material/Calculate";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SecurityIcon from "@mui/icons-material/Security";
import ShieldIcon from "@mui/icons-material/Shield";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import DevicesIcon from "@mui/icons-material/Devices";

// ─── Design tokens: white base, colourful multi-accent theme ───
const C = {
  page: "#ffffff",
  border: "#e6e9f0",
  heading: "#0f172a",
  body: "#5b6472",
  muted: "#94a3b8",
  primary: "#6366f1", // indigo — main CTA accent
  primaryDark: "#4338ca",
  primarySoft: "#eef2ff",
  navy: "#0f172a",
};

// Each role gets its own colour, same pattern as the feature cards on Home.jsx
const ROLES = [
  { value: "student", label: "Student", icon: <SchoolIcon fontSize="small" />, color: "#3b82f6", bg: "#eff6ff" },
  { value: "teacher", label: "Teacher", icon: <PersonIcon fontSize="small" />, color: "#10b981", bg: "#ecfdf5" },
  { value: "parent", label: "Parent", icon: <FamilyRestroomIcon fontSize="small" />, color: "#8b5cf6", bg: "#f5f3ff" },
  { value: "school_owner", label: "Admin (School Owner)", icon: <AdminPanelSettingsIcon fontSize="small" />, color: "#f59e0b", bg: "#fffbeb" },
  { value: "accountant", label: "Accountant", icon: <CalculateIcon fontSize="small" />, color: "#06b6d4", bg: "#ecfeff" },
  { value: "librarian", label: "Librarian", icon: <MenuBookIcon fontSize="small" />, color: "#ec4899", bg: "#fdf2f8" },
  { value: "receptionist", label: "Receptionist", icon: <SupportAgentIcon fontSize="small" />, color: "#14b8a6", bg: "#f0fdfa" },
  { value: "super_admin", label: "Super Admin", icon: <SecurityIcon fontSize="small" />, color: "#ef4444", bg: "#fef2f2" },
  { value: "vice_admin", label: "Vice Admin", icon: <ShieldIcon fontSize="small" />, color: "#6366f1", bg: "#eef2ff" },
];

const ROLE_ROUTES = {
  school_owner: { url: "/school/login", nav: "/school" },
  teacher: { url: "/teacher/login", nav: "/teacher" },
  student: { url: "/student/login", nav: "/student" },
  accountant: { url: "/accountant/login", nav: "/accountant" },
  librarian: { url: "/librarian/login", nav: "/librarian" },
  receptionist: { url: "/receptionist/login", nav: "/receptionist" },
  parent: { url: "/parent/login", nav: "/parent" },
  super_admin: { url: "/super-admin/login", nav: "/super-admin" },
  vice_admin: { url: "/vice-admin/login", nav: "/vice-admin" },
};

const HIGHLIGHTS = [
  { icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />, text: "256-bit encrypted sign-in", color: "#4ade80" },
  { icon: <FlashOnIcon sx={{ fontSize: 18 }} />, text: "Role-based instant access", color: "#fbbf24" },
  { icon: <DevicesIcon sx={{ fontSize: 18 }} />, text: "Works on web, Android & iOS", color: "#60a5fa" },
];

const REMEMBER_KEY = "login_remember_email";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [loginType, setLoginType] = useState("student");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const session = searchParams.get("session");
    if (session === "expired") {
      setMessage("Your session expired. Please sign in again.");
      setType("error");
      const next = new URLSearchParams(searchParams);
      next.delete("session");
      setSearchParams(next, { replace: true });
    } else if (session === "forbidden") {
      setMessage("You do not have access to that resource.");
      setType("error");
      const next = new URLSearchParams(searchParams);
      next.delete("session");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Restore remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      Formik.setFieldValue("email", saved);
      setRememberMe(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetMessage = () => setMessage("");

  const handleSelection = (e) => {
    setLoginType(e.target.value);
    Formik.setFieldValue("email", "");
    Formik.setFieldValue("password", "");
    Formik.setTouched({});
  };

  const initialValues = { email: "", password: "" };

  const Formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: (values) => {
      const route = ROLE_ROUTES[loginType];
      if (!route) return;

      setSubmitting(true);
      axios
        .post(`${baseUrl}${route.url}`, { ...values })
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
          const token = resp.headers.get("Authorization") || resp.data.token;
          if (resp.data.success) {
            // Use authUtils to store session with expiry
            storeUserSession(token, resp.data.user);
            
            if (rememberMe) {
              localStorage.setItem(REMEMBER_KEY, values.email);
            } else {
              localStorage.removeItem(REMEMBER_KEY);
            }
            navigate(route.nav);
            login(resp.data.user);
          }
          Formik.resetForm();
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Sign-in failed. Please try again.");
          setType("error");
        })
        .finally(() => setSubmitting(false));
    },
  });

  const activeRole = ROLES.find((r) => r.value === loginType);

  return (
    <Box sx={{ minHeight: "calc(100vh - 70px)", bgcolor: C.page, display: "flex" }}>
      {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}

      {/* ── Left brand panel — colourful multi-tone gradient ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "42%",
          minHeight: "calc(100vh - 70px)",
          p: 6,
          background: "linear-gradient(160deg, #6366f1 0%, #8b5cf6 45%, #ec4899 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -40, width: 260, height: 260, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)" }} />
        <Box sx={{ position: "absolute", top: "40%", left: "60%", width: 140, height: 140, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 6 }}>
            <Box component="img" src={LOGO_URL} alt={`${APP_NAME} logo`} sx={{ width: 34, height: 34, borderRadius: 1.5, objectFit: "cover" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.15rem" }}>{APP_NAME}</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 2, fontSize: "1.9rem" }}>
            One login for your entire school community.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.7, fontSize: "0.92rem", maxWidth: 340 }}>
            Students, teachers, parents, and staff — everyone signs in from a single, secure portal.
          </Typography>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {HIGHLIGHTS.map((item) => (
            <Box key={item.text} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: alpha(item.color, 0.25), color: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.85rem", opacity: 0.95 }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right form panel ── */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, md: 6 }, bgcolor: C.page }}>
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile brand header */}

          <Typography variant="h5" sx={{ fontWeight: 800, color: C.heading, mb: 0.5, fontSize: "1.5rem" }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: C.body, mb: 3.5, fontSize: "0.88rem" }}>
            Sign in to continue to your dashboard
          </Typography>

          <Paper
            elevation={0}
            sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: "#fff" }}
          >
            <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="login-role-label">I am signing in as</InputLabel>
                <Select
                  labelId="login-role-label"
                  label="I am signing in as"
                  value={loginType}
                  onChange={handleSelection}
                  renderValue={(val) => {
                    const r = ROLES.find((x) => x.value === val);
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ color: r?.color, display: "flex" }}>{r?.icon}</Box>
                        {r?.label}
                      </Box>
                    );
                  }}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: r.bg, color: r.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {r.icon}
                        </Box>
                        {r.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                id="email"
                label="Email / Username"
                variant="outlined"
                name="email"
                autoFocus
                value={Formik.values.email}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.email && Boolean(Formik.errors.email)}
                helperText={Formik.touched.email && Formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon sx={{ fontSize: 19, color: C.muted }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                size="small"
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                name="password"
                value={Formik.values.password}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.password && Boolean(Formik.errors.password)}
                helperText={Formik.touched.password && Formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 19, color: C.muted }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize: 19 }} /> : <VisibilityIcon sx={{ fontSize: 19 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5, mb: 2.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ color: C.muted, "&.Mui-checked": { color: "#8b5cf6" } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.82rem", color: C.body }}>Remember me</Typography>}
                />
                <Typography
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#ec4899", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  Forgot password?
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                disabled={submitting}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #ec4899 100%)",
                  boxShadow: `0 8px 20px ${alpha("#8b5cf6", 0.35)}`,
                  "&:hover": { boxShadow: `0 10px 24px ${alpha("#8b5cf6", 0.5)}`, opacity: 0.95 },
                  "&.Mui-disabled": { background: alpha("#8b5cf6", 0.4), color: "#fff" },
                }}
              >
                {submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : `Sign in as ${activeRole?.label}`}
              </Button>
            </Box>
          </Paper>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 3 }}>
            <Divider sx={{ flex: 1, borderColor: C.border }} />
            <Chip
              icon={<SecurityIcon sx={{ fontSize: 14 }} />}
              label="Secure encrypted login"
              size="small"
              sx={{ bgcolor: "#ecfdf5", color: "#059669", fontWeight: 600, fontSize: "0.68rem", height: 24 }}
            />
            <Divider sx={{ flex: 1, borderColor: C.border }} />
          </Box>

          <Typography sx={{ textAlign: "center", fontSize: "0.8rem", color: C.muted }}>
            Need help signing in? <RouterLink to="/contact" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Contact support</RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}