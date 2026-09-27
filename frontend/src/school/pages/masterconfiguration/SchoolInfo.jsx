import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, CardContent, Divider, Grid, Skeleton, Stack, Switch, TextField, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolIcon from "@mui/icons-material/School";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { fetchSchoolData, updateSchoolData } from "../../../state/schoolSlice";

/* ---------- Animations ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(.85); }
  to   { opacity: 1; transform: scale(1); }
`;
const floatA = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(22px, -16px) scale(1.1); }
`;
const floatB = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-20px, 14px) scale(1.06); }
`;
const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const NO_MOTION = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };
const enter = (ms = 0) => ({ animation: `${fadeUp} .5s ${EASE} ${ms}ms backwards`, ...NO_MOTION });

const fields = [
  ["schoolName", "School Name", false, true],
  ["shortName", "Short Name", false, true],
  ["address", "School Address", true, true],
  ["affiliationNo", "Affiliation No.", false],
  ["registrationNo", "Registration No.", false],
  ["officeNo", "Office No. (Contact)", false],
  ["helpNo", "Help No. (Contact)", false],
  ["email", "Email", false],
  ["websiteAddress", "Website Address", false],
  ["facebookLink", "Facebook Link", false],
  ["instagramLink", "Instagram Link", false],
  ["twitterLink", "Twitter Link", false],
  ["youtubeLink", "YouTube Link", false],
  ["registrationDescription", "Registration Description", true],
  ["apiBiometric", "Api Biometric", false],
  ["apiBiometricKey", "Api Biometric Key", false],
  ["apiBiometricSecret", "Api Biometric Secret", false],
];

// [key, title, label, gradientFrom, gradientTo]
const assets = [
  ["logo", "Upload Logo", "Logo (200 X 200)", "#6366f1", "#8b5cf6"],
  ["principalSignature", "Upload Principal Signature", "Principal Signature (150 X 80)", "#0ea5e9", "#06b6d4"],
  ["dashboardBackground", "Upload Dashboard Background", "Dashboard Background", "#f59e0b", "#f97316"],
  ["boardLogo", "Upload Board Logo", "Affiliated Board Logo", "#10b981", "#14b8a6"],
  ["welcomeCard", "Upload Welcome Card", "Welcome Card", "#ec4899", "#f43f5e"],
];

const fieldSx = {
  "& .MuiInputBase-input, & .MuiInputBase-inputMultiline": { fontSize: 12.5 },
  "& .MuiInputLabel-root": { fontSize: 12.5 },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    bgcolor: "#f8fafc",
    transition: "background .3s ease, box-shadow .3s ease",
    "& fieldset": { borderColor: "#e2e8f0", transition: "border-color .3s ease" },
    "&:hover fieldset": { borderColor: "#c7d2fe" },
    "&.Mui-focused": { bgcolor: "#fff", boxShadow: "0 0 0 3px rgba(99,102,241,.14)" },
    "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 1 },
  },
};

export default function SchoolInfo() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const school = useSelector((root) => root.school.data);
  const schoolState = useSelector((root) => root.school);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => {
    dispatch(fetchSchoolData());
  }, [dispatch]);

  useEffect(() => {
    if (school) {
      const { status, ...schoolData } = school; // Exclude status field
      setForm({ ...schoolData, schoolName: school.school_name, logo: school.school_image });
    }
  }, [school]);

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const uploadImage = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, [key]: reader.result, [`${key}File`]: file }));
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = new FormData();
    const assetKeys = new Set(assets.map(([key]) => key));
    const editableKeys = new Set([...fields.map(([key]) => key), "saturdayWorking", "sundayWorking"]);
    // Don't send 'status' field as it's managed by backend
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "status" && editableKeys.has(key) && !key.endsWith("File") && !assetKeys.has(key) && value !== undefined && value !== null) {
        payload.append(key === "schoolName" ? "school_name" : key, value);
      }
    });
    assets.forEach(([key]) => {
      if (form[`${key}File`]) payload.append(key === "logo" ? "image" : key, form[`${key}File`]);
    });
    try {
      await dispatch(updateSchoolData(payload)).unwrap();
      dispatch(fetchSchoolData());
      setSavedPulse(true);
      setTimeout(() => setSavedPulse(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  const inputFields = useMemo(() => fields, []);
  const isInitialLoading = Boolean(schoolState?.loading && !school);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, md: 3 },
        fontSize: 12,
        background:
          "radial-gradient(900px 500px at 0% 0%, #ffe4e6 0%, transparent 60%), radial-gradient(800px 500px at 100% 10%, #ede9fe 0%, transparent 55%), radial-gradient(900px 600px at 50% 100%, #e0f2fe 0%, transparent 60%), #f8fafc",
      }}
    >
      <Card
        sx={{
          maxWidth: 1240,
          mx: "auto",
          overflow: "hidden",
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,.18)",
          boxShadow: "0 10px 30px rgba(244,81,44,.1)",
          bgcolor: "rgba(255,255,255,.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* ---------- Header ---------- */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            color: "#fff",
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.25 },
            background: "linear-gradient(120deg, #f4512c 0%, #ec4899 45%, #7c3aed 80%, #6366f1 100%)",
            backgroundSize: "220% 220%",
            animation: `${gradientShift} 14s ease-in-out infinite, ${fadeUp} .55s ${EASE} backwards`,
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 200,
              height: 200,
              top: -80,
              right: -40,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,.3), transparent 70%)",
              animation: `${floatA} 9s ease-in-out infinite`,
              pointerEvents: "none",
              ...NO_MOTION,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 160,
              height: 160,
              bottom: -80,
              left: "40%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(96,165,250,.35), transparent 70%)",
              animation: `${floatB} 11s ease-in-out infinite`,
              pointerEvents: "none",
              ...NO_MOTION,
            }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ position: "relative" }}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 14, transition: `transform .3s ${EASE}` }} />}
                onClick={() => navigate("/school/master/session")}
                sx={{
                  mb: 1.25,
                  py: 0.3,
                  px: 1.5,
                  color: "#fff",
                  textTransform: "none",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: "10px",
                  bgcolor: "rgba(255,255,255,.16)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,.28)",
                  transition: `all .3s ${EASE}`,
                  "&:hover": { bgcolor: "rgba(255,255,255,.28)", transform: "translateY(-1px)", "& .MuiSvgIcon-root": { transform: "translateX(-3px)" } },
                }}
              >
                Back
              </Button>
              <Stack direction="row" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,.2)",
                    border: "1px solid rgba(255,255,255,.3)",
                    animation: `${popIn} .6s ${EASE} 150ms backwards`,
                    ...NO_MOTION,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 19 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 16, md: 18 }, lineHeight: 1.2, letterSpacing: 0.3 }}>SCHOOL</Typography>
                  <Typography sx={{ mt: 0.15, fontSize: 11, color: "rgba(255,255,255,.85)" }}>Basic details, biometric setup and branding assets</Typography>
                </Box>
              </Stack>
            </Box>

            <Button
              startIcon={<RefreshIcon sx={{ fontSize: 15, animation: schoolState?.loading ? `${spin} .9s linear infinite` : "none" }} />}
              onClick={() => dispatch(fetchSchoolData())}
              disabled={schoolState?.loading}
              sx={{
                py: 0.4,
                px: 1.5,
                color: "#fff",
                textTransform: "none",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: "10px",
                bgcolor: "rgba(255,255,255,.16)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,.28)",
                transition: `all .3s ${EASE}`,
                "&:hover": { bgcolor: "rgba(255,255,255,.28)", transform: "translateY(-1px)" },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {schoolState.error && (
            <Box
              sx={{
                mb: 2,
                px: 2,
                py: 1,
                borderRadius: "12px",
                bgcolor: "#fff1f2",
                color: "#be123c",
                border: "1px solid #fecdd3",
                fontSize: 12,
                fontWeight: 500,
                animation: `${fadeUp} .4s ${EASE}`,
                ...NO_MOTION,
              }}
            >
              {schoolState.error}
            </Box>
          )}

          {isInitialLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={28} width={140} />
              <Grid container spacing={2.5}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Skeleton variant="rounded" height={42} animation="wave" />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ) : (
            <Box component="form" onSubmit={submit}>
              {/* Section label */}
              <SectionLabel icon={<SchoolIcon sx={{ fontSize: 15 }} />} text="School details" from="#f4512c" to="#ec4899" delay={40} />

              <Grid container spacing={2.5} sx={{ mt: 0.25 }}>
                {inputFields.map(([key, label, multiline, required], i) => (
                  <Grid item xs={12} md={6} key={key}>
                    <Box sx={enter(80 + i * 25)}>
                      <TextField
                        fullWidth
                        size="small"
                        required={required}
                        label={label}
                        multiline={multiline}
                        rows={multiline ? 2 : undefined}
                        value={form[key] || ""}
                        onChange={(event) => setValue(key, event.target.value)}
                        sx={fieldSx}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Biometric setup */}
              <Box sx={{ mt: 3.5 }}>
                <SectionLabel icon={<FingerprintIcon sx={{ fontSize: 15 }} />} text="Biometric setup" from="#6366f1" to="#8b5cf6" delay={520} />
              </Box>
              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={enter(560)}>
                    <SwitchField required label="Is Saturday Working" value={form.saturdayWorking} onChange={(value) => setValue("saturdayWorking", value)} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={enter(600)}>
                    <SwitchField required label="Is Sunday Working" value={form.sundayWorking} onChange={(value) => setValue("sundayWorking", value)} />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3.5 }} />

              {/* Assets */}
              <SectionLabel icon={<ImageOutlinedIcon sx={{ fontSize: 15 }} />} text="Branding assets" from="#0ea5e9" to="#10b981" delay={640} />
              <Grid container spacing={2.5} sx={{ mt: 0.25 }}>
                {assets.map(([key, title, label, from, to], i) => (
                  <Grid item xs={12} md={6} key={key}>
                    <Box
                      sx={{
                        ...enter(680 + i * 40),
                        p: 1.75,
                        borderRadius: "14px",
                        border: "1px solid rgba(148,163,184,.16)",
                        background: `linear-gradient(135deg, #ffffff 60%, ${from}0f 100%)`,
                        transition: `transform .3s ${EASE}, box-shadow .3s ${EASE}`,
                        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 10px 22px ${from}22` },
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            flexShrink: 0,
                            borderRadius: "9px",
                            display: "grid",
                            placeItems: "center",
                            color: "#fff",
                            background: `linear-gradient(135deg, ${from}, ${to})`,
                            boxShadow: `0 4px 10px ${from}55`,
                          }}
                        >
                          <ImageOutlinedIcon sx={{ fontSize: 14 }} />
                        </Box>
                        <Typography sx={{ color: from, fontWeight: 700, fontSize: 12.5 }}>{title}</Typography>
                      </Stack>
                      <Typography sx={{ color: "#64748b", fontSize: 11, mb: 1.25 }}>{label}</Typography>
                      <Button
                        component="label"
                        startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          textTransform: "none",
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#fff",
                          borderRadius: "9px",
                          px: 1.5,
                          py: 0.5,
                          background: `linear-gradient(135deg, ${from}, ${to})`,
                          boxShadow: `0 4px 10px ${from}45`,
                          transition: `all .3s ${EASE}`,
                          "&:hover": { transform: "translateY(-1px)", boxShadow: `0 8px 16px ${from}55` },
                        }}
                      >
                        Choose image
                        <input hidden type="file" accept="image/*" onChange={(event) => uploadImage(key, event.target.files?.[0])} />
                      </Button>
                      {form[key] && (
                        <Box
                          component="img"
                          src={form[key]}
                          alt={label}
                          sx={{
                            display: "block",
                            mt: 1.25,
                            maxWidth: "100%",
                            maxHeight: 120,
                            objectFit: "contain",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            bgcolor: "#f8fafc",
                            animation: `${popIn} .4s ${EASE}`,
                            ...NO_MOTION,
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, mt: 3.5 }}>
                {savedPulse && (
                  <Stack direction="row" alignItems="center" gap={0.5} sx={{ animation: `${popIn} .4s ${EASE}`, ...NO_MOTION }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: "#10b981" }} />
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#059669" }}>Saved</Typography>
                  </Stack>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || schoolState?.loading}
                  sx={{
                    textTransform: "none",
                    fontSize: 12.5,
                    fontWeight: 700,
                    borderRadius: "10px",
                    px: 2.5,
                    py: 0.7,
                    background: "linear-gradient(135deg, #f4512c, #ec4899)",
                    boxShadow: "0 6px 16px rgba(244,81,44,.35)",
                    transition: `all .3s ${EASE}`,
                    "&:hover": { background: "linear-gradient(135deg, #d93d1f, #db2777)", transform: "translateY(-1px)", boxShadow: "0 10px 22px rgba(219,39,119,.4)" },
                    "&:active": { transform: "scale(.97)" },
                    "&.Mui-disabled": { color: "rgba(255,255,255,.85)", background: "linear-gradient(135deg, #fca5a5, #f9a8d4)" },
                  }}
                >
                  {saving ? (
                    <Box component="span" sx={{ display: "inline-block", width: 18, height: 18, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.5)", borderTopColor: "#fff", animation: `${spin} .7s linear infinite` }} />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function SectionLabel({ icon, text, from, to, delay }) {
  return (
    <Stack direction="row" alignItems="center" gap={1} sx={enter(delay)}>
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: "9px",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: `0 4px 10px ${from}55`,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#17233b", letterSpacing: 0.2 }}>{text}</Typography>
    </Stack>
  );
}

function SwitchField({ label, required, value, onChange }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        maxWidth: 320,
        px: 1.5,
        py: 1,
        borderRadius: "10px",
        bgcolor: "#f5f3ff",
        transition: `background .3s ${EASE}`,
      }}
    >
      <Typography sx={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>
        {required && (
          <Box component="span" sx={{ color: "#f4512c", mr: 0.25 }}>
            *
          </Box>
        )}
        {label}
      </Typography>
      <Switch
        size="small"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: "#fff" },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            opacity: 1,
          },
          "& .MuiSwitch-track": { transition: `background .3s ${EASE}` },
        }}
      />
    </Stack>
  );
}