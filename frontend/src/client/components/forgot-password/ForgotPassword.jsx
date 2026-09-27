import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  alpha,
  Chip,
  Divider,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { APP_NAME, LOGO_URL } from "../../../branding";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockResetIcon from "@mui/icons-material/LockReset";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import TimerIcon from "@mui/icons-material/Timer";
import SecurityIcon from "@mui/icons-material/Security";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// ─── Design tokens matching Login page ───
const C = {
  page: "#ffffff",
  border: "#e6e9f0",
  heading: "#0f172a",
  body: "#5b6472",
  muted: "#94a3b8",
  primary: "#6366f1",
  primaryDark: "#4338ca",
  primarySoft: "#eef2ff",
  success: "#10b981",
  error: "#ef4444",
};

const STEPS = ["Verify Email", "Verify OTP", "Reset Password"];

const SECURITY_TIPS = [
  { icon: <SecurityIcon sx={{ fontSize: 18 }} />, text: "Use 8+ characters with numbers & symbols", color: "#3b82f6" },
  { icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />, text: "Never share your password with anyone", color: "#10b981" },
  { icon: <TimerIcon sx={{ fontSize: 18 }} />, text: "OTP valid for 10 minutes only", color: "#f59e0b" },
];

export default function ForgotPassword() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();

  // Step 1: Email validation schema
  const emailSchema = yup.object({
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  });

  // Step 2: OTP validation schema
  const otpSchema = yup.object({
    otp: yup
      .string()
      .length(6, "OTP must be 6 digits")
      .matches(/^\d+$/, "OTP must contain only numbers")
      .required("OTP is required"),
  });

  // Step 3: Password reset schema
  const passwordSchema = yup.object({
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[0-9]/, "Must contain at least one number")
      .matches(/[@$!%*?&#]/, "Must contain at least one special character")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  // Formik for Step 1 - Email
  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const response = await axios.post(`${baseUrl}/api/auth/forgot-password`, {
          email: values.email,
        });
        setEmail(values.email);
        setMessage({ type: "success", text: response.data.message || "OTP sent to your email!" });
        setActiveStep(1);
        startResendTimer();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to send OTP. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Formik for Step 2 - OTP
  const otpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const response = await axios.post(`${baseUrl}/api/auth/verify-otp`, {
          email,
          otp: values.otp,
        });
        setOtp(values.otp);
        setMessage({ type: "success", text: "OTP verified successfully!" });
        setActiveStep(2);
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Invalid OTP. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Formik for Step 3 - Password Reset
  const passwordFormik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const response = await axios.post(`${baseUrl}/api/auth/reset-password`, {
          email,
          otp,
          password: values.password,
        });
        setMessage({ type: "success", text: "Password reset successfully!" });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to reset password. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Resend OTP functionality
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await axios.post(`${baseUrl}/api/auth/resend-otp`, { email });
      setMessage({ type: "success", text: "OTP resent to your email!" });
      startResendTimer();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to resend OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Timer for resend OTP (60 seconds)
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setMessage({ type: "", text: "" });
    } else {
      navigate("/login");
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 70px)", bgcolor: C.page, display: "flex" }}>
      {/* ── Left brand panel with gradient ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "42%",
          minHeight: "calc(100vh - 70px)",
          p: 6,
          background: "linear-gradient(160deg, #ec4899 0%, #8b5cf6 45%, #6366f1 100%)",
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
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.15rem" }}>
              {APP_NAME}
            </Typography>
          </Box>
          <LockResetIcon sx={{ fontSize: 64, mb: 3, opacity: 0.9 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 2, fontSize: "1.9rem" }}>
            Secure Password Recovery
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.7, fontSize: "0.92rem", maxWidth: 340 }}>
            Reset your password in three simple steps. We'll verify your identity to keep your account secure.
          </Typography>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {SECURITY_TIPS.map((item) => (
            <Box key={item.text} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1.5,
                  bgcolor: alpha(item.color, 0.25),
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.85rem", opacity: 0.95 }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right form panel ── */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, md: 6 }, bgcolor: C.page }}>
        <Box sx={{ width: "100%", maxWidth: 480 }}>
          <Box sx={{ mb: 3 }}>
            {/* <IconButton onClick={handleBack} sx={{ mb: 2, color: C.body, "&:hover": { bgcolor: C.primarySoft } }}>
              <ArrowBackIcon />
            </IconButton> */}
            <Typography variant="h5" sx={{ fontWeight: 800, color: C.heading, mb: 0.5, fontSize: "1.5rem" }}>
              Reset Your Password
            </Typography>
            <Typography variant="body2" sx={{ color: C.body, mb: 3, fontSize: "0.88rem" }}>
              Follow the steps below to recover your account
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Alert Messages */}
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: "", text: "" })}>
              {message.text}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: "#fff" }}>
            {/* Step 1: Email */}
            {activeStep === 0 && (
              <Box component="form" noValidate onSubmit={emailFormik.handleSubmit}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.heading, mb: 2 }}>
                  Enter your email address
                </Typography>
                <Typography variant="body2" sx={{ color: C.body, mb: 3, fontSize: "0.85rem" }}>
                  We'll send a 6-digit OTP to your registered email address
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="email"
                  name="email"
                  label="Email Address"
                  autoFocus
                  value={emailFormik.values.email}
                  onChange={emailFormik.handleChange}
                  onBlur={emailFormik.handleBlur}
                  error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
                  helperText={emailFormik.touched.email && emailFormik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon sx={{ fontSize: 19, color: C.muted }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disableElevation
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 55%, #6366f1 100%)",
                    boxShadow: `0 8px 20px ${alpha("#8b5cf6", 0.35)}`,
                    "&:hover": { boxShadow: `0 10px 24px ${alpha("#8b5cf6", 0.5)}`, opacity: 0.95 },
                    "&.Mui-disabled": { background: alpha("#8b5cf6", 0.4), color: "#fff" },
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Send OTP"}
                </Button>
              </Box>
            )}

            {/* Step 2: OTP Verification */}
            {activeStep === 1 && (
              <Box component="form" noValidate onSubmit={otpFormik.handleSubmit}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.heading, mb: 2 }}>
                  Enter verification code
                </Typography>
                <Typography variant="body2" sx={{ color: C.body, mb: 3, fontSize: "0.85rem" }}>
                  We sent a 6-digit code to <strong>{email}</strong>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  id="otp"
                  name="otp"
                  label="6-Digit OTP"
                  autoFocus
                  inputProps={{ maxLength: 6, style: { textAlign: "center", letterSpacing: "0.5em", fontSize: "1.2rem" } }}
                  value={otpFormik.values.otp}
                  onChange={otpFormik.handleChange}
                  onBlur={otpFormik.handleBlur}
                  error={otpFormik.touched.otp && Boolean(otpFormik.errors.otp)}
                  helperText={otpFormik.touched.otp && otpFormik.errors.otp}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ fontSize: 19, color: C.muted }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 3 }}>
                  <Typography variant="body2" sx={{ color: C.body, fontSize: "0.85rem", mr: 1 }}>
                    Didn't receive the code?
                  </Typography>
                  <Button
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0 || loading}
                    sx={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "none", color: "#ec4899", p: 0, minWidth: "auto" }}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </Button>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disableElevation
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 55%, #6366f1 100%)",
                    boxShadow: `0 8px 20px ${alpha("#8b5cf6", 0.35)}`,
                    "&:hover": { boxShadow: `0 10px 24px ${alpha("#8b5cf6", 0.5)}`, opacity: 0.95 },
                    "&.Mui-disabled": { background: alpha("#8b5cf6", 0.4), color: "#fff" },
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Verify OTP"}
                </Button>
              </Box>
            )}

            {/* Step 3: Reset Password */}
            {activeStep === 2 && (
              <Box component="form" noValidate onSubmit={passwordFormik.handleSubmit}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 48, color: C.success, mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.heading, mb: 1 }}>
                    Email Verified!
                  </Typography>
                  <Typography variant="body2" sx={{ color: C.body, fontSize: "0.85rem" }}>
                    Create a strong new password for your account
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  id="password"
                  name="password"
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  autoFocus
                  value={passwordFormik.values.password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.password && Boolean(passwordFormik.errors.password)}
                  helperText={passwordFormik.touched.password && passwordFormik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ fontSize: 19, color: C.muted }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOffIcon sx={{ fontSize: 19 }} /> : <VisibilityIcon sx={{ fontSize: 19 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ fontSize: 19, color: C.muted }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                          {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 19 }} /> : <VisibilityIcon sx={{ fontSize: 19 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disableElevation
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 55%, #6366f1 100%)",
                    boxShadow: `0 8px 20px ${alpha("#8b5cf6", 0.35)}`,
                    "&:hover": { boxShadow: `0 10px 24px ${alpha("#8b5cf6", 0.5)}`, opacity: 0.95 },
                    "&.Mui-disabled": { background: alpha("#8b5cf6", 0.4), color: "#fff" },
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Reset Password"}
                </Button>
              </Box>
            )}
          </Paper>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 3 }}>
            <Divider sx={{ flex: 1, borderColor: C.border }} />
            <Chip
              icon={<SecurityIcon sx={{ fontSize: 14 }} />}
              label="Secure password recovery"
              size="small"
              sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 600, fontSize: "0.68rem", height: 24 }}
            />
            <Divider sx={{ flex: 1, borderColor: C.border }} />
          </Box>

          <Typography sx={{ textAlign: "center", fontSize: "0.85rem", color: C.body }}>
            Remember your password?{" "}
            <RouterLink to="/login" style={{ color: "#ec4899", fontWeight: 600, textDecoration: "none" }}>
              Back to Sign In
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
