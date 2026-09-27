import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useFormik } from "formik";
import axios from "axios";
import { descriptionSchema } from "../../../yupSchema/contactSchema";
import { baseUrl } from "../../../environment";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import SubjectIcon from "@mui/icons-material/Subject";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

// ─── Design tokens: white + colourful accents ───
const C = {
  page: "#ffffff",
  border: "#eef0f4",
  heading: "#1c1917",
  body: "#78716c",
  muted: "#a8a29e",
  navy: "#1c1917",
  // colourful palette (used for accents, header blobs, contact-card icons, CTA gradient)
  pink: "#ec4899",
  purple: "#8b5cf6",
  blue: "#3b82f6",
  teal: "#14b8a6",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

const DESCRIPTION_LIMIT = 500;

const CONTACT_DETAILS = [
  { icon: <MailOutlineIcon sx={{ fontSize: 20 }} />, label: "Email", value: "support@example.com", color: C.pink },
  { icon: <PhoneIcon sx={{ fontSize: 20 }} />, label: "Phone", value: "+91 98765 43210", color: C.blue },
  { icon: <LocationOnIcon sx={{ fontSize: 20 }} />, label: "Address", value: "Patna, Bihar, India", color: C.teal },
  { icon: <AccessTimeIcon sx={{ fontSize: 20 }} />, label: "Working Hours", value: "Mon – Sat, 9 AM – 6 PM", color: C.amber },
];

const SOCIALS = [
  { Icon: FacebookIcon, color: C.blue },
  { Icon: TwitterIcon, color: C.teal },
  { Icon: LinkedInIcon, color: C.purple },
];

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, type: "success", message: "" });

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const initialValues = { email: "", subject: "", description: "" };

  const Formik = useFormik({
    initialValues,
    validationSchema: descriptionSchema,
    onSubmit: (values) => {
      setSubmitting(true);
      axios
        .post(`${baseUrl}/contact`, { ...values })
        .then((resp) => {
          setSnackbar({ open: true, type: "success", message: resp.data?.message || "Message sent — we'll get back to you soon." });
          Formik.resetForm();
        })
        .catch((e) => {
          setSnackbar({ open: true, type: "error", message: e.response?.data?.message || "Something went wrong. Please try again." });
        })
        .finally(() => setSubmitting(false));
    },
  });

  const descLength = Formik.values.description?.length || 0;

  return (
    <Box sx={{ width: "100%", bgcolor: C.page }}>
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={closeSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={closeSnackbar} severity={snackbar.type} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Header ── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${C.navy} 0%, #292524 100%)`,
          color: "#fff",
          textAlign: "center",
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -70, right: -60, width: 240, height: 240, borderRadius: "50%", bgcolor: alpha(C.pink, 0.22) }} />
        <Box sx={{ position: "absolute", bottom: -60, left: -50, width: 200, height: 200, borderRadius: "50%", bgcolor: alpha(C.blue, 0.2) }} />
        <Box sx={{ position: "absolute", top: 30, left: "40%", width: 120, height: 120, borderRadius: "50%", bgcolor: alpha(C.amber, 0.15) }} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.9rem", md: "2.4rem" },
              mb: 1,
              background: `linear-gradient(90deg, ${C.pink}, ${C.amber}, ${C.teal})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            Get in touch
          </Typography>
          <Typography sx={{ opacity: 0.85, fontSize: "0.92rem", maxWidth: 460, mx: "auto" }}>
            Have a question or need help? Fill out the form below and our team will respond within 24 hours.
          </Typography>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ maxWidth: 980, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
          {/* Left: contact info */}
          <Box sx={{ width: { xs: "100%", md: 320 }, flexShrink: 0 }}>
            <Box
              sx={{
                borderRadius: 3,
                p: 3.5,
                background: `linear-gradient(160deg, ${C.purple} 0%, ${C.pink} 50%, ${C.rose} 100%)`,
                color: "#fff",
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", mb: 0.5 }}>Contact information</Typography>
              <Typography sx={{ opacity: 0.92, fontSize: "0.82rem", mb: 3 }}>
                Reach out to us directly — we're happy to help.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
                {CONTACT_DETAILS.map((item) => (
                  <Box key={item.label} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        bgcolor: "rgba(255,255,255,0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.72rem", opacity: 0.85, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: "flex", gap: 1, mt: 4 }}>
                {SOCIALS.map(({ Icon, color }, i) => (
                  <Box
                    key={i}
                    component="a"
                    href="#"
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                      textDecoration: "none",
                      transition: "transform 0.15s",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right: form */}
          <Paper
            elevation={0}
            sx={{ flex: 1, p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: "#fff" }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: C.heading, mb: 0.5 }}>Send us a message</Typography>
            <Typography sx={{ color: C.body, fontSize: "0.85rem", mb: 3 }}>
              Fill in the details below and we'll get back to you shortly.
            </Typography>

            <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
              <TextField
                fullWidth
                size="small"
                sx={{
                  mb: 2.25,
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.blue },
                  "& label.Mui-focused": { color: C.blue },
                }}
                id="email"
                label="Email"
                variant="outlined"
                name="email"
                value={Formik.values.email}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.email && Boolean(Formik.errors.email)}
                helperText={Formik.touched.email && Formik.errors.email}
                InputProps={{
                  startAdornment: <MailOutlineIcon sx={{ fontSize: 18, color: C.blue, mr: 1 }} />,
                }}
              />

              <TextField
                fullWidth
                size="small"
                sx={{
                  mb: 2.25,
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.teal },
                  "& label.Mui-focused": { color: C.teal },
                }}
                id="subject"
                label="Subject"
                variant="outlined"
                name="subject"
                value={Formik.values.subject}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.subject && Boolean(Formik.errors.subject)}
                helperText={Formik.touched.subject && Formik.errors.subject}
                InputProps={{
                  startAdornment: <SubjectIcon sx={{ fontSize: 18, color: C.teal, mr: 1 }} />,
                }}
              />

              <TextField
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.pink },
                  "& label.Mui-focused": { color: C.pink },
                }}
                id="description"
                label="Description"
                variant="outlined"
                name="description"
                value={Formik.values.description}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.description && Boolean(Formik.errors.description)}
                helperText={
                  (Formik.touched.description && Formik.errors.description) ||
                  `${descLength}/${DESCRIPTION_LIMIT} characters`
                }
                multiline
                rows={4}
                inputProps={{ maxLength: DESCRIPTION_LIMIT }}
              />

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  disabled={submitting}
                  endIcon={!submitting && <SendIcon sx={{ fontSize: 17 }} />}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    background: `linear-gradient(90deg, ${C.purple}, ${C.pink} 60%, ${C.amber})`,
                    boxShadow: `0 8px 20px ${alpha(C.pink, 0.35)}`,
                    "&:hover": {
                      background: `linear-gradient(90deg, ${C.purple}, ${C.rose} 60%, ${C.amber})`,
                      boxShadow: `0 10px 24px ${alpha(C.pink, 0.45)}`,
                    },
                  }}
                >
                  {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Send Message"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}