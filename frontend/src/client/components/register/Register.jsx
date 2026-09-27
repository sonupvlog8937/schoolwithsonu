import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useFormik } from "formik";
import { registerSchema } from "../../../yupSchema/registerSchema";
import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

import SchoolIcon from "@mui/icons-material/School";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentIcon from "@mui/icons-material/Payment";

// ─── Design tokens: white base, colourful multi-accent theme ───
const C = {
  page: "#ffffff",
  border: "#e6e9f0",
  heading: "#0f172a",
  body: "#5b6472",
  muted: "#94a3b8",
};

const PERKS = [
  { icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />, text: "Verified & secure onboarding", color: "#4ade80" },
  { icon: <GroupsIcon sx={{ fontSize: 18 }} />, text: "Manage students, staff & parents", color: "#60a5fa" },
  { icon: <PaymentIcon sx={{ fontSize: 18 }} />, text: "Fee collection ready on day one", color: "#fbbf24" },
];

const getPasswordStrength = (pwd = "") => {
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  if (!pwd) return { label: "", value: 0, color: C.muted };
  if (score <= 2) return { label: "Weak", value: 33, color: "#ef4444" };
  if (score <= 3) return { label: "Medium", value: 66, color: "#f59e0b" };
  return { label: "Strong", value: 100, color: "#10b981" };
};

export default function Register() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const resetMessage = () => setMessage("");

  const setImage = (selected) => {
    if (!selected) return;
    setImageUrl(URL.createObjectURL(selected));
    setFile(selected);
  };

  const clearImage = () => {
    setFile(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initialValues = {
    school_name: "",
    email: "",
    owner_name: "",
    address: "",
    password: "",
    confirm_password: "",
  };

  const Formik = useFormik({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: (values) => {
      if (!file) {
        setMessage("Please provide a school image.");
        setType("error");
        return;
      }

      const fd = new FormData();
      fd.append("image", file, file.name);
      fd.append("school_name", values.school_name);
      fd.append("email", values.email);
      fd.append("owner_name", values.owner_name);
      fd.append("address", values.address);
      fd.append("password", values.password);

      setSubmitting(true);
      axios
        .post(`${baseUrl}/school/register`, fd)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
          clearImage();
          Formik.resetForm();
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Registration failed. Please try again.");
          setType("error");
        })
        .finally(() => setSubmitting(false));
    },
  });

  const strength = useMemo(() => getPasswordStrength(Formik.values.password), [Formik.values.password]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: C.page, display: "flex" }}>
      {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}

      {/* ── Left colourful panel ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "flex-start",
          width: "40%",
          p: 6,
          background: "linear-gradient(160deg, #6366f1 0%, #8b5cf6 45%, #ec4899 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -40, width: 260, height: 260, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 6 }}>
            <SchoolIcon sx={{ fontSize: 30 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.15rem" }}>School Registration</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 2, fontSize: "1.9rem" }}>
            Bring your school online in minutes.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.7, fontSize: "0.92rem", maxWidth: 340 }}>
            Set up attendance, fees, notifications and a parent portal — all from one free registration.
          </Typography>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 1.5, mt: 6 }}>
          {PERKS.map((item) => (
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
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, md: 6 } }}>
        <Box sx={{ width: "100%", maxWidth: 520 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 3, justifyContent: "center" }}>
            <SchoolIcon sx={{ fontSize: 24, color: "#8b5cf6" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: C.heading, fontSize: "1.1rem" }}>School Registration</Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: C.heading, mb: 0.5, fontSize: "1.5rem" }}>
            Register your school
          </Typography>
          <Typography variant="body2" sx={{ color: C.body, mb: 3, fontSize: "0.88rem" }}>
            Fill in the details below to create your school's account.
          </Typography>

          <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: "#fff" }}>
            <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
              {/* ── Image upload dropzone ── */}
              <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: C.heading, mb: 1 }}>School Picture</Typography>
              <Box
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  setImage(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${dragOver ? "#8b5cf6" : C.border}`,
                  borderRadius: 2.5,
                  bgcolor: dragOver ? alpha("#8b5cf6", 0.06) : "#fafafa",
                  cursor: "pointer",
                  p: 1.5,
                  minHeight: file ? "auto" : 96,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                  textAlign: "center",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#8b5cf6", bgcolor: alpha("#8b5cf6", 0.04) },
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setImage(e.target.files?.[0])}
                />
                {file ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="School preview"
                      sx={{ width: 56, height: 56, borderRadius: 2, objectFit: "cover" }}
                    />
                    <Box sx={{ flex: 1, textAlign: "left" }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: C.heading }}>{file.name}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: "#10b981" }} />
                        <Typography sx={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>Ready to upload</Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); clearImage(); }}
                      sx={{ color: C.muted, "&:hover": { color: "#ef4444" } }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 28, color: "#8b5cf6", mb: 0.5 }} />
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: C.heading }}>
                      Click or drag an image to upload
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: C.muted, mt: 0.3 }}>PNG or JPG, up to 5MB</Typography>
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                label="School Name"
                variant="outlined"
                name="school_name"
                value={Formik.values.school_name}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.school_name && Boolean(Formik.errors.school_name)}
                helperText={Formik.touched.school_name && Formik.errors.school_name}
                InputProps={{ startAdornment: <InputAdornment position="start"><SchoolIcon sx={{ fontSize: 19, color: C.muted }} /></InputAdornment> }}
              />

              <TextField
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                label="Email"
                variant="outlined"
                name="email"
                value={Formik.values.email}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.email && Boolean(Formik.errors.email)}
                helperText={Formik.touched.email && Formik.errors.email}
                InputProps={{ startAdornment: <InputAdornment position="start"><MailOutlineIcon sx={{ fontSize: 19, color: C.muted }} /></InputAdornment> }}
              />

              <TextField
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                label="Your Name"
                variant="outlined"
                name="owner_name"
                value={Formik.values.owner_name}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.owner_name && Boolean(Formik.errors.owner_name)}
                helperText={Formik.touched.owner_name && Formik.errors.owner_name}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 19, color: C.muted }} /></InputAdornment> }}
              />

              <TextField
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                label="School Address"
                variant="outlined"
                name="address"
                multiline
                rows={3}
                value={Formik.values.address}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.address && Boolean(Formik.errors.address)}
                helperText={Formik.touched.address && Formik.errors.address}
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}><LocationOnOutlinedIcon sx={{ fontSize: 19, color: C.muted }} /></InputAdornment> }}
              />

              <TextField
                fullWidth
                size="small"
                sx={{ mb: strength.label ? 0.75 : 2 }}
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
                  startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 19, color: C.muted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize: 19 }} /> : <VisibilityIcon sx={{ fontSize: 19 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  height: 18,
                  visibility: strength.label ? "visible" : "hidden",
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={strength.value}
                  sx={{
                    flex: 1,
                    height: 5,
                    borderRadius: 5,
                    bgcolor: alpha(strength.color, 0.15),
                    "& .MuiLinearProgress-bar": { bgcolor: strength.color, borderRadius: 5 },
                  }}
                />
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: strength.color, minWidth: 48 }}>
                  {strength.label}
                </Typography>
              </Box>

              <TextField
                fullWidth
                size="small"
                sx={{ mb: 3 }}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                variant="outlined"
                name="confirm_password"
                value={Formik.values.confirm_password}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.confirm_password && Boolean(Formik.errors.confirm_password)}
                helperText={Formik.touched.confirm_password && Formik.errors.confirm_password}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 19, color: C.muted }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirmPassword((p) => !p)} edge="end">
                        {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 19 }} /> : <VisibilityIcon sx={{ fontSize: 19 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

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
                {submitting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Register School"}
              </Button>
            </Box>
          </Paper>

          <Typography sx={{ textAlign: "center", fontSize: "0.8rem", color: C.muted, mt: 3 }}>
            Already registered? <Box component="a" href="/login" sx={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Sign in instead</Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}