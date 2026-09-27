import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton,
  InputAdornment, InputLabel, MenuItem, Pagination, Paper, Select,
  Skeleton, Snackbar, Alert, Stack, TextField, Tooltip, Typography,
  useMediaQuery, useTheme, Fade, Collapse, Badge, LinearProgress,
  ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Link,
} from "@mui/material";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { getStudentValidationErrors } from "../../../yupSchema/studentSchema";
import StudentCardAdmin from "../../utility components/student card/StudentCard";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import WcIcon from "@mui/icons-material/Wc";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import TuneIcon from "@mui/icons-material/Tune";
import ViewListIcon from "@mui/icons-material/ViewList";

// ── Color palette ──────────────────────────────────────────────────────────────
const P = {
  indigo: "#4F46E5",
  indigoLight: "#EEF2FF",
  indigoBorder: "#C7D2FE",
  blue: "#1D4ED8",
  blueLight: "#EFF6FF",
  violet: "#7C3AED",
  rose: "#E11D48",
  roseLight: "#FFF1F2",
  emerald: "#059669",
  emeraldLight: "#ECFDF5",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  slate: "#475569",
  slateLight: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const AVATAR_COLORS = [
  "#4F46E5","#0891B2","#059669","#D97706","#DC2626",
  "#7C3AED","#DB2777","#0284C7","#16A34A","#EA580C",
];
const getAvatarColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

const getImageSrc = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `/images/uploaded/student/${p}`;
};

const formatAadharDisplay = (raw) => {
  const s = String(raw || "").replace(/\D/g, "");
  if (s.length !== 12) return raw?.trim() || "—";
  return `${s.slice(0, 4)} ${s.slice(4, 8)} ${s.slice(8, 12)}`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Compact stat pill */
const StatPill = ({ icon, label, value, color, bg }) => (
  <Paper
    elevation={0}
    sx={{
      flex: "1 1 80px", px: { xs: 1.5, md: 2 }, py: { xs: 1.2, md: 1.5 },
      borderRadius: 2.5, border: `1px solid ${P.border}`, background: bg,
      display: "flex", alignItems: "center", gap: 1.2,
      transition: "box-shadow .2s",
      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.07)" },
    }}
  >
    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {React.cloneElement(icon, { sx: { color, fontSize: 17 } })}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 800, color, fontSize: { xs: 17, md: 20 }, lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: 9, md: 11 }, letterSpacing: 0.3 }}>{label}</Typography>
    </Box>
  </Paper>
);

/** Form field wrapper */
const Field = ({ formik, name, label, type = "text", children, ...rest }) => (
  <Box>
    {children ? (
      <FormControl fullWidth size="small" error={formik.touched[name] && Boolean(formik.errors[name])}>
        <InputLabel>{label}</InputLabel>
        {children}
        {formik.touched[name] && formik.errors[name] && (
          <Typography variant="caption" color="error" sx={{ mt: 0.3, ml: 1.5, display: "block" }}>
            {formik.errors[name]}
          </Typography>
        )}
      </FormControl>
    ) : (
      <TextField
        fullWidth size="small" label={label} name={name} type={type}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched[name] && Boolean(formik.errors[name])}
        helperText={formik.touched[name] && formik.errors[name]}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        {...rest}
      />
    )}
  </Box>
);

/** Student list-row for table view */
const StudentRow = ({ student, onEdit, onDelete }) => {
  const color = getAvatarColor(student.name);
  const gc = { male: P.blue, female: "#A21CAF", other: P.slate }[student.gender?.toLowerCase()] || P.slate;
  const gbg = { male: P.blueLight, female: "#FDF4FF", other: P.slateLight }[student.gender?.toLowerCase()] || P.slateLight;
  return (
    <TableRow hover sx={{ "&:last-child td": { border: 0 }, transition: "background .15s" }}>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={getImageSrc(student.student_image)}
            sx={{ width: 36, height: 36, fontSize: "0.8rem", fontWeight: 700, bgcolor: color }}
          >
            {getInitials(student.name)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: P.text }}>{student.name}</Typography>
            <Typography variant="caption" color="text.secondary">{student.email}</Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.roll_number || "—"}</Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 200 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {student.address?.trim() || "—"}
        </Typography>
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "ui-monospace, monospace", fontSize: "0.8rem" }}>
          {formatAadharDisplay(student.aadhar_number)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          size="small" label={student.student_class?.class_text || "—"}
          icon={<SchoolIcon style={{ fontSize: 12 }} />}
          sx={{ fontWeight: 700, bgcolor: P.indigoLight, color: P.indigo, border: `1px solid ${P.indigoBorder}`, "& .MuiChip-icon": { color: P.indigo } }}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small" label={student.gender || "—"}
          sx={{ fontWeight: 700, bgcolor: gbg, color: gc, border: `1px solid ${gc}40`, fontSize: "0.72rem" }}
        />
      </TableCell>
      <TableCell><Typography variant="body2">{student.age || "—"}</Typography></TableCell>
      <TableCell>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.guardian || "—"}</Typography>
          {student.guardian_phone && (
            <Link href={`tel:${student.guardian_phone}`} variant="caption" underline="hover" sx={{ color: P.indigo, display: "flex", alignItems: "center", gap: 0.3 }}>
              <PhoneIcon sx={{ fontSize: 11 }} />{student.guardian_phone}
            </Link>
          )}
        </Box>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(student._id)}
              sx={{ bgcolor: P.indigoLight, color: P.indigo, "&:hover": { bgcolor: P.indigoBorder } }}>
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(student._id, student.name)}
              sx={{ bgcolor: P.roseLight, color: P.rose, "&:hover": { bgcolor: "#FECDD3" } }}>
              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function Students() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // state
  const [studentClass, setStudentClass] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: "" });
  const [viewMode, setViewMode] = useState("grid");
  const [showPassword, setShowPassword] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imgDragOver, setImgDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [params, setParams] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [submitting, setSubmitting] = useState(false);

  // image handlers
  const handleImageFile = (f) => { if (!f) return; setFile(f); setImageUrl(URL.createObjectURL(f)); };
  const addImage = (e) => handleImageFile(e.target.files[0]);
  const handleClearFile = () => { if (fileInputRef.current) fileInputRef.current.value = ""; setFile(null); setImageUrl(null); };
  const onDrop = (e) => { e.preventDefault(); setImgDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleImageFile(f); };

  // formik
  const Formik = useFormik({
    initialValues: { name: "", roll_number: "", address: "", aadhar_number: "", email: "", student_class: "", gender: "", age: "", guardian: "", guardian_phone: "", password: "" },
    validate: (values) => getStudentValidationErrors(values, isEdit),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        if (isEdit) {
          const fd = new FormData();
          Object.keys(values).forEach((k) => fd.append(k, values[k]));
          if (file) fd.append("image", file, file.name);
          const r = await axios.patch(`${baseUrl}/student/update/${editId}`, fd);
          setSnack({ open: true, msg: r.data.message, sev: "success" });
          cancelEdit(); fetchStudents();
        } else {
          const fd = new FormData();
          if (file) fd.append("image", file, file.name);
          Object.keys(values).forEach((k) => fd.append(k, values[k]));
          const r = await axios.post(`${baseUrl}/student/register`, fd);
          setSnack({ open: true, msg: r.data.message, sev: "success" });
          Formik.resetForm(); handleClearFile(); setFormOpen(false); fetchStudents();
        }
      } catch (e) {
        setSnack({ open: true, msg: e?.response?.data?.message || "Something went wrong.", sev: "error" });
      } finally { setSubmitting(false); }
    },
  });

  const cancelEdit = () => { setEdit(false); setEditId(null); Formik.resetForm(); handleClearFile(); setFormOpen(false); };

  const handleEdit = (id) => {
    setEdit(true); setFormOpen(true);
    axios.get(`${baseUrl}/student/fetch-single/${id}`)
      .then((r) => {
        const d = r.data.data;
        Formik.setValues({
          email: d.email || "",
          name: d.name || "",
          roll_number: d.roll_number || "",
          address: d.address || "",
          aadhar_number: d.aadhar_number || "",
          student_class: d.student_class?._id || "",
          gender: d.gender || "",
          age: d.age || "",
          guardian: d.guardian || "",
          guardian_phone: d.guardian_phone || "",
          password: "",
        });
        setImageUrl(getImageSrc(d.student_image)); setEditId(d._id);
      })
      .catch(() => setSnack({ open: true, msg: "Failed to fetch student data.", sev: "error" }));
  };

  const handleDeleteClick = (id, name) => setDeleteDialog({ open: true, id, name });
  const confirmDelete = () => {
    axios.delete(`${baseUrl}/student/delete/${deleteDialog.id}`)
      .then((r) => { setSnack({ open: true, msg: r.data.message, sev: "success" }); fetchStudents(); })
      .catch((e) => setSnack({ open: true, msg: e?.response?.data?.message || "Delete failed.", sev: "error" }))
      .finally(() => setDeleteDialog({ open: false, id: null, name: "" }));
  };

  const fetchStudentClass = () =>
    axios.get(`${baseUrl}/class/fetch-all`).then((r) => setStudentClass(r.data.data || [])).catch(() => {});

  const fetchStudents = useCallback(() => {
    setLoading(true);
    axios.get(`${baseUrl}/student/fetch-with-query`, { params: { ...params, page: pagination.page, limit: pagination.limit } })
      .then((r) => {
        setStudents(r.data.data || []);
        if (r.data.pagination) setPagination((p) => ({ ...p, total: r.data.pagination.total, totalPages: r.data.pagination.totalPages }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params, pagination.page, pagination.limit]);

  useEffect(() => { fetchStudents(); fetchStudentClass(); }, []);
  useEffect(() => { fetchStudents(); }, [params, pagination.page, pagination.limit]);

  // export
  const exportCSV = () => {
    const rows = [["Name", "Roll No", "Address", "Aadhar", "Email", "Class", "Gender", "Age", "Guardian", "Phone"]];
    students.forEach((s) =>
      rows.push([
        s.name,
        s.roll_number || "",
        (s.address || "").replace(/\n/g, " "),
        String(s.aadhar_number || "").replace(/\D/g, ""),
        s.email,
        s.student_class?.class_text || "",
        s.gender,
        s.age,
        s.guardian,
        s.guardian_phone,
      ])
    );
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "students.csv" }).click();
    setSnack({ open: true, msg: "Exported successfully!", sev: "success" });
  };

  // derived stats
  const maleCount = useMemo(() => students.filter((s) => s.gender?.toLowerCase() === "male").length, [students]);
  const femaleCount = useMemo(() => students.filter((s) => s.gender?.toLowerCase() === "female").length, [students]);

  // param helpers
  const setParam = (key, val) => { setParams((p) => ({ ...p, [key]: val || undefined })); setPagination((p) => ({ ...p, page: 1 })); };

  // ── Form dialog body ────────────────────────────────────────────────────────
  const FormBody = (
    <Box component="form" noValidate onSubmit={Formik.handleSubmit}>
      {/* Photo upload */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setImgDragOver(true); }}
        onDragLeave={() => setImgDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          mb: 2.5, border: `2px dashed ${imgDragOver ? P.indigo : P.indigoBorder}`,
          borderRadius: 3, p: 2.5, cursor: "pointer", textAlign: "center",
          background: imgDragOver ? P.indigoLight : "#FAFBFF",
          transition: "all 0.2s", "&:hover": { borderColor: P.indigo, background: P.indigoLight },
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={addImage} style={{ display: "none" }} />
        {imageUrl ? (
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <Box component="img" src={imageUrl} sx={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: `3px solid ${P.indigo}` }} />
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
              sx={{ position: "absolute", top: -6, right: -6, bgcolor: "#FEE2E2", color: P.rose, p: 0.4, "&:hover": { bgcolor: "#FECACA" } }}>
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 34, color: P.indigo, mb: 0.5 }} />
            <Typography variant="caption" sx={{ display: "block", color: P.textMuted, fontWeight: 600 }}>Photo (optional) — click or drag & drop</Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: 10 }}>PNG, JPG up to 5 MB</Typography>
          </>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="name" label="Full Name" /></Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="roll_number" label="Roll Number" /></Grid>
        <Grid item xs={12}>
          <Field formik={Formik} name="address" label="Address" multiline minRows={2} placeholder="House no., street, city, PIN…" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Field
            formik={Formik}
            name="aadhar_number"
            label="Aadhar number"
            placeholder="12-digit Aadhar"
            inputProps={{ inputMode: "numeric", maxLength: 14, autoComplete: "off" }}
          />
        </Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="email" label="Email Address" type="email" /></Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="age" label="Age" type="number" /></Grid>
        <Grid item xs={12} sm={6}>
          <Field formik={Formik} name="student_class" label="Class">
            <Select label="Class" name="student_class" size="small" value={Formik.values.student_class} onChange={Formik.handleChange} onBlur={Formik.handleBlur} sx={{ borderRadius: 2 }}>
              {studentClass.map((c) => <MenuItem key={c._id} value={c._id}>{c.class_text}</MenuItem>)}
            </Select>
          </Field>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Field formik={Formik} name="gender" label="Gender">
            <Select label="Gender" name="gender" size="small" value={Formik.values.gender} onChange={Formik.handleChange} onBlur={Formik.handleBlur} sx={{ borderRadius: 2 }}>
              <MenuItem value="">Select Gender</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </Field>
        </Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="guardian" label="Guardian Name" /></Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="guardian_phone" label="Guardian Phone" /></Grid>
        <Grid item xs={12}>
          <Field
            formik={Formik}
            name="password"
            label={isEdit ? "Password (required on update)" : "Password"}
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" fullWidth disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : (isEdit ? <EditIcon /> : <PersonAddAltIcon />)}
          sx={{ textTransform: "none", borderRadius: 2.5, fontWeight: 700, py: 1.3, background: `linear-gradient(135deg,${P.indigo},${P.violet})`, boxShadow: "none", "&:hover": { background: `linear-gradient(135deg,#4338CA,${P.violet})`, boxShadow: `0 4px 14px ${P.indigo}40` } }}>
          {submitting ? "Saving…" : isEdit ? "Update Student" : "Register Student"}
        </Button>
        {isEdit && (
          <Button variant="outlined" fullWidth onClick={cancelEdit}
            sx={{ textTransform: "none", borderRadius: 2.5, fontWeight: 600, py: 1.3, borderColor: P.indigoBorder, color: P.indigo }}>
            Cancel
          </Button>
        )}
      </Stack>
    </Box>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 2, md: 3 }, background: P.slateLight, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between" gap={2} sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: `linear-gradient(135deg,${P.indigo},${P.violet})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 12px ${P.indigo}30` }}>
            <PeopleOutlineIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 20, md: 24 }, color: P.text, lineHeight: 1.1, letterSpacing: "-0.4px" }}>Students</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Manage all enrolled students</Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchStudents} sx={{ border: `1px solid ${P.border}`, borderRadius: 2, bgcolor: "#fff" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon fontSize="small" />} onClick={exportCSV}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, borderColor: P.indigoBorder, color: P.indigo, bgcolor: "#fff", fontSize: 13 }}>
            Export CSV
          </Button>
          <Button size="small" variant="contained" startIcon={<PersonAddAltIcon fontSize="small" />}
            onClick={() => { setEdit(false); Formik.resetForm(); handleClearFile(); setFormOpen(true); }}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, boxShadow: "none", fontSize: 13, background: `linear-gradient(135deg,${P.indigo},${P.violet})`, "&:hover": { background: `linear-gradient(135deg,#4338CA,${P.violet})`, boxShadow: `0 4px 12px ${P.indigo}40` } }}>
            Add Student
          </Button>
        </Stack>
      </Stack>

      {/* ── Stats ── */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
        <StatPill icon={<PeopleOutlineIcon />} label="Total Students" value={pagination.total} color={P.indigo} bg={P.indigoLight} />
        <StatPill icon={<ManIcon />} label="Male" value={maleCount} color={P.blue} bg={P.blueLight} />
        <StatPill icon={<WomanIcon />} label="Female" value={femaleCount} color="#A21CAF" bg="#FDF4FF" />
        <StatPill icon={<SchoolIcon />} label="Classes" value={studentClass.length} color={P.amber} bg={P.amberLight} />
      </Stack>

      {/* ── Search & Filter bar ── */}
      <Paper elevation={0} sx={{ mb: 2.5, px: 2, py: 1.75, borderRadius: 2.5, border: `1px solid ${P.border}`, bgcolor: "#fff" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          {/* Search */}
          <TextField
            size="small" placeholder="Search by name, email or roll no…"
            onChange={(e) => setParam("search", e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} /></InputAdornment>,
              sx: { borderRadius: 2, bgcolor: P.slateLight },
            }}
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Filters toggle (mobile) */}
          <Button size="small" variant="outlined" startIcon={<TuneIcon fontSize="small" />}
            onClick={() => setFilterOpen((p) => !p)}
            sx={{ display: { xs: "flex", sm: "none" }, textTransform: "none", borderRadius: 2, fontWeight: 600, borderColor: P.border, color: P.slate }}>
            Filters
          </Button>

          {/* Desktop filters */}
          <Stack direction="row" spacing={1.5} sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Class</InputLabel>
              <Select label="Class" defaultValue="" onChange={(e) => setParam("student_class", e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All Classes</MenuItem>
                {studentClass.map((c) => <MenuItem key={c._id} value={c._id}>{c.class_text}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Gender</InputLabel>
              <Select label="Gender" defaultValue="" onChange={(e) => setParam("gender", e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            {/* View toggle */}
            <Box sx={{ border: `1px solid ${P.border}`, borderRadius: 2, overflow: "hidden", display: "flex" }}>
              {[{ v: "grid", Icon: GridViewIcon, title: "Grid" }, { v: "list", Icon: TableRowsIcon, title: "List" }, { v: "table", Icon: ViewListIcon, title: "Table" }].map(({ v, Icon, title }) => (
                <Tooltip key={v} title={title}>
                  <IconButton size="small" onClick={() => setViewMode(v)}
                    sx={{ borderRadius: 0, px: 1.2, py: 0.8, background: viewMode === v ? P.indigoLight : "transparent", color: viewMode === v ? P.indigo : "#94A3B8", transition: "all .15s" }}>
                    <Icon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Stack>
        </Stack>

        {/* Mobile filter collapse */}
        <Collapse in={filterOpen}>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Class</InputLabel>
              <Select label="Class" defaultValue="" onChange={(e) => setParam("student_class", e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All Classes</MenuItem>
                {studentClass.map((c) => <MenuItem key={c._id} value={c._id}>{c.class_text}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select label="Gender" defaultValue="" onChange={(e) => setParam("gender", e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              {[{ v: "grid", label: "Grid", Icon: GridViewIcon }, { v: "list", label: "List", Icon: TableRowsIcon }, { v: "table", label: "Table", Icon: ViewListIcon }].map(({ v, label, Icon }) => (
                <Button key={v} size="small" variant={viewMode === v ? "contained" : "outlined"} startIcon={<Icon fontSize="small" />}
                  onClick={() => setViewMode(v)}
                  sx={{ flex: 1, textTransform: "none", borderRadius: 2, fontWeight: 600, ...(viewMode === v ? { background: `linear-gradient(135deg,${P.indigo},${P.violet})`, boxShadow: "none" } : { borderColor: P.border, color: P.slate }) }}>
                  {label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Collapse>
      </Paper>

      {/* ── Loading ── */}
      {loading && <LinearProgress sx={{ borderRadius: 4, mb: 2 }} />}

      {/* ── Content ── */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: pagination.limit }).map((_, i) => (
            <Grid item xs={12} sm={viewMode === "table" ? 12 : 6} md={viewMode === "table" ? 12 : 4} lg={viewMode === "table" ? 12 : 3} key={i}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${P.border}` }}>
                <Stack alignItems="center" spacing={1}>
                  <Skeleton variant="circular" width={68} height={68} />
                  <Skeleton width="55%" height={18} />
                  <Skeleton width="38%" height={14} />
                  <Skeleton variant="rounded" width="100%" height={30} sx={{ borderRadius: 2 }} />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : students.length === 0 ? (
        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, border: `1.5px dashed ${P.border}`, textAlign: "center", bgcolor: "#fff" }}>
          <PeopleOutlineIcon sx={{ fontSize: 56, color: "#CBD5E1", mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, color: "#94A3B8", mb: 0.5 }}>No students found</Typography>
          <Typography variant="caption" color="text.disabled">Try adjusting filters or add a new student</Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" size="small" startIcon={<PersonAddAltIcon />}
              onClick={() => { setEdit(false); Formik.resetForm(); handleClearFile(); setFormOpen(true); }}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: `linear-gradient(135deg,${P.indigo},${P.violet})`, boxShadow: "none" }}>
              Add First Student
            </Button>
          </Box>
        </Paper>

      ) : viewMode === "table" ? (
        /* ── Table view ── */
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${P.border}`, overflow: "hidden", bgcolor: "#fff" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: P.slateLight }}>
                  {["Student", "Roll No", "Address", "Aadhar", "Class", "Gender", "Age", "Guardian", ""].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.71rem", color: P.textMuted, textTransform: "uppercase", letterSpacing: 0.5, py: 1.5, whiteSpace: "nowrap" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <StudentRow key={s._id} student={s} onEdit={handleEdit} onDelete={handleDeleteClick} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      ) : (
        /* ── Grid / List view ── */
        <Grid container spacing={2}>
          {students.map((student, i) => (
            <Grid
              item key={student._id || i}
              xs={12}
              sm={viewMode === "list" ? 12 : 6}
              md={viewMode === "list" ? 12 : 4}
              lg={viewMode === "list" ? 12 : 3}
            >
              <StudentCardAdmin
                student={student}
                handleEdit={handleEdit}
                handleDelete={(id) => handleDeleteClick(id, student.name)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Pagination ── */}
      {!loading && students.length > 0 && (
        <Paper elevation={0} sx={{ mt: 2.5, px: 2, py: 1.75, borderRadius: 2.5, border: `1px solid ${P.border}`, bgcolor: "#fff" }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" gap={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Showing <strong>{students.length}</strong> of <strong>{pagination.total}</strong> students
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 105 }}>
                <InputLabel sx={{ fontSize: 13 }}>Per page</InputLabel>
                <Select label="Per page" value={pagination.limit}
                  onChange={(e) => setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                  sx={{ borderRadius: 2, fontSize: 13 }}>
                  {[4, 8, 12, 20, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
              </FormControl>
              <Pagination
                color="primary" page={pagination.page} count={pagination.totalPages}
                size={isMobile ? "small" : "medium"}
                onChange={(_, v) => setPagination((p) => ({ ...p, page: v }))}
                sx={{ "& .MuiPaginationItem-root": { borderRadius: 2, fontWeight: 600 } }}
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={formOpen} onClose={cancelEdit} maxWidth="sm" fullWidth fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, bgcolor: "#fff" } }}
        TransitionComponent={Fade} transitionDuration={200}>
        <DialogTitle sx={{ py: 2, fontWeight: 800, color: P.text, borderBottom: `1px solid ${P.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 30, height: 30, borderRadius: 1.5, background: `linear-gradient(135deg,${P.indigo},${P.violet})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isEdit ? <EditIcon sx={{ color: "#fff", fontSize: 16 }} /> : <PersonAddAltIcon sx={{ color: "#fff", fontSize: 16 }} />}
              </Box>
              <span>{isEdit ? "Edit Student" : "Add New Student"}</span>
            </Stack>
            <IconButton size="small" onClick={cancelEdit} sx={{ color: "#94A3B8", "&:hover": { bgcolor: P.slateLight } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 2 }}>{FormBody}</DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: "" })}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: P.rose, py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningAmberIcon sx={{ fontSize: 22 }} />
            <span>Delete Student?</span>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: 14, color: P.text }}>
            Are you sure you want to delete <strong>{deleteDialog.name}</strong>?
            This action <strong>cannot be undone</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: "" })} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} startIcon={<DeleteOutlineIcon />}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.sev} variant="filled"
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2.5, fontWeight: 600, boxShadow: 4 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}