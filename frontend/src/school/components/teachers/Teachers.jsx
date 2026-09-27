/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Avatar, Box, Button, Chip, CircularProgress, Collapse, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, FormControl,
  Grid, IconButton, InputAdornment, InputLabel, Link, LinearProgress,
  MenuItem, Pagination, Paper, Select, Skeleton, Snackbar, Alert,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography, useMediaQuery, useTheme, Fade,
} from "@mui/material";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { teacherSchema } from "../../../yupSchema/teacherSchemal";
import TeacherCardAdmin from "../../utility components/teacher card/TeacherCard";

import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewListIcon from "@mui/icons-material/ViewList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SchoolIcon from "@mui/icons-material/School";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import TuneIcon from "@mui/icons-material/Tune";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

// ── Design tokens (consistent with Students page) ─────────────────────────────
const P = {
  teal: "#0D9488",
  tealLight: "#F0FDFA",
  tealBorder: "#99F6E4",
  tealGrad: "linear-gradient(135deg,#0D9488,#0891B2)",
  blue: "#1D4ED8",
  blueLight: "#EFF6FF",
  violet: "#7C3AED",
  rose: "#E11D48",
  roseLight: "#FFF1F2",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  emerald: "#059669",
  emeraldLight: "#ECFDF5",
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
  "#0D9488","#0891B2","#4F46E5","#D97706","#DC2626",
  "#7C3AED","#DB2777","#059669","#EA580C","#1D4ED8",
];
const getAvatarColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

const getImageSrc = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `/images/uploaded/teacher/${p}`;
};

const GENDER_STYLE = {
  male:   { color: P.blue,   bg: P.blueLight,    border: "#93C5FD" },
  female: { color: "#A21CAF", bg: "#FDF4FF",      border: "#E879F9" },
  other:  { color: P.slate,  bg: P.slateLight,   border: "#CBD5E1" },
};
const gStyle = (g) => GENDER_STYLE[g?.toLowerCase()] || GENDER_STYLE.other;

// ── Sub-components ────────────────────────────────────────────────────────────

const StatPill = ({ icon, label, value, color, bg }) => (
  <Paper elevation={0} sx={{
    flex: "1 1 80px", px: { xs: 1.5, md: 2 }, py: { xs: 1.2, md: 1.5 },
    borderRadius: 2.5, border: `1px solid ${P.border}`, background: bg,
    display: "flex", alignItems: "center", gap: 1.2,
    transition: "box-shadow .2s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.07)" },
  }}>
    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {React.cloneElement(icon, { sx: { color, fontSize: 17 } })}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 800, color, fontSize: { xs: 17, md: 20 }, lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: 9, md: 11 }, letterSpacing: 0.3 }}>{label}</Typography>
    </Box>
  </Paper>
);

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

const TeacherRow = ({ teacher, onEdit, onDelete }) => {
  const color = getAvatarColor(teacher.name);
  const gs = gStyle(teacher.gender);
  return (
    <TableRow hover sx={{ "&:last-child td": { border: 0 }, transition: "background .15s" }}>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={getImageSrc(teacher.teacher_image)} sx={{ width: 36, height: 36, fontSize: "0.8rem", fontWeight: 700, bgcolor: color }}>
            {getInitials(teacher.name)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: P.text }}>{teacher.name}</Typography>
            <Link href={`mailto:${teacher.email}`} variant="caption" underline="hover" sx={{ color: P.textMuted, display: "flex", alignItems: "center", gap: 0.3 }}>
              <EmailIcon sx={{ fontSize: 11 }} />{teacher.email}
            </Link>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip size="small" label={teacher.qualification || "—"} icon={<WorkspacePremiumIcon style={{ fontSize: 12 }} />}
          sx={{ fontWeight: 700, bgcolor: P.tealLight, color: P.teal, border: `1px solid ${P.tealBorder}`, "& .MuiChip-icon": { color: P.teal } }} />
      </TableCell>
      <TableCell>
        {teacher.gender ? (
          <Chip size="small" label={teacher.gender}
            sx={{ fontWeight: 700, bgcolor: gs.bg, color: gs.color, border: `1px solid ${gs.border}`, fontSize: "0.72rem" }} />
        ) : "—"}
      </TableCell>
      <TableCell><Typography variant="body2">{teacher.age || "—"}</Typography></TableCell>
      <TableCell>
        <Link href={`mailto:${teacher.email}`} variant="body2" underline="hover" sx={{ color: P.teal }}>{teacher.email || "—"}</Link>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(teacher._id)}
              sx={{ bgcolor: P.tealLight, color: P.teal, "&:hover": { bgcolor: P.tealBorder } }}>
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(teacher._id, teacher.name)}
              sx={{ bgcolor: P.roseLight, color: P.rose, "&:hover": { bgcolor: "#FECDD3" } }}>
              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Teachers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: "" });
  const [viewMode, setViewMode] = useState("grid");
  const [showPassword, setShowPassword] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imgDragOver, setImgDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [params, setParams] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  // image handlers
  const handleImageFile = (f) => { if (!f) return; setFile(f); setImageUrl(URL.createObjectURL(f)); };
  const addImage = (e) => handleImageFile(e.target.files[0]);
  const handleClearFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFile(null); setImageUrl(null);
  };
  const onDrop = (e) => {
    e.preventDefault(); setImgDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleImageFile(f);
  };

  // formik
  const Formik = useFormik({
    initialValues: { email: "", name: "", qualification: "", gender: "", age: "", password: "" },
    validationSchema: teacherSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const fd = new FormData();
        Object.keys(values).forEach((k) => fd.append(k, values[k]));
        if (file) fd.append("image", file, file.name);

        if (isEdit) {
          const r = await axios.patch(`${baseUrl}/teacher/update/${editId}`, fd);
          setSnack({ open: true, msg: r.data.message, sev: "success" });
          cancelEdit(); fetchTeachers();
        } else {
          if (!file) { setSnack({ open: true, msg: "Please provide a teacher photo.", sev: "error" }); return; }
          const r = await axios.post(`${baseUrl}/teacher/register`, fd);
          setSnack({ open: true, msg: r.data.message, sev: "success" });
          Formik.resetForm(); handleClearFile(); setFormOpen(false); fetchTeachers();
        }
      } catch (e) {
        setSnack({ open: true, msg: e?.response?.data?.message || "Something went wrong.", sev: "error" });
      } finally { setSubmitting(false); }
    },
  });

  const cancelEdit = () => { setEdit(false); setEditId(null); Formik.resetForm(); handleClearFile(); setFormOpen(false); };

  const handleEdit = (id) => {
    setEdit(true); setFormOpen(true);
    axios.get(`${baseUrl}/teacher/fetch-single/${id}`)
      .then((r) => {
        const d = r.data.data;
        Formik.setValues({ email: d.email || "", name: d.name || "", qualification: d.qualification || "", gender: d.gender || "", age: d.age || "", password: d.password || "" });
        setImageUrl(getImageSrc(d.teacher_image));
        setEditId(d._id);
      })
      .catch(() => setSnack({ open: true, msg: "Failed to fetch teacher data.", sev: "error" }));
  };

  const handleDeleteClick = (id, name) => setDeleteDialog({ open: true, id, name });
  const confirmDelete = () => {
    axios.delete(`${baseUrl}/teacher/delete/${deleteDialog.id}`)
      .then((r) => { setSnack({ open: true, msg: r.data.message, sev: "success" }); fetchTeachers(); })
      .catch((e) => setSnack({ open: true, msg: e?.response?.data?.message || "Delete failed.", sev: "error" }))
      .finally(() => setDeleteDialog({ open: false, id: null, name: "" }));
  };

  const fetchTeachers = useCallback(() => {
    setLoading(true);
    axios.get(`${baseUrl}/teacher/fetch-with-query`, {
      params: { ...params, page: pagination.page, limit: pagination.limit },
    })
      .then((r) => {
        setTeachers(r.data.data || []);
        if (r.data.pagination) setPagination((p) => ({ ...p, total: r.data.pagination.total, totalPages: r.data.pagination.totalPages }));
        else setPagination((p) => ({ ...p, total: r.data.data?.length || 0 }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params, pagination.page, pagination.limit]);

  useEffect(() => { fetchTeachers(); }, []);
  useEffect(() => { fetchTeachers(); }, [params, pagination.page, pagination.limit]);

  // export CSV
  const exportCSV = () => {
    const rows = [["Name", "Email", "Qualification", "Gender", "Age"]];
    teachers.forEach((t) => rows.push([t.name, t.email, t.qualification || "", t.gender, t.age]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "teachers.csv" }).click();
    setSnack({ open: true, msg: "Exported successfully!", sev: "success" });
  };

  const setParam = (key, val) => {
    setParams((p) => ({ ...p, [key]: val || undefined }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  // derived stats
  const maleCount   = useMemo(() => teachers.filter((t) => t.gender?.toLowerCase() === "male").length,   [teachers]);
  const femaleCount = useMemo(() => teachers.filter((t) => t.gender?.toLowerCase() === "female").length, [teachers]);

  // ── Form body ───────────────────────────────────────────────────────────────
  const FormBody = (
    <Box component="form" noValidate onSubmit={Formik.handleSubmit}>
      {/* Photo upload */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setImgDragOver(true); }}
        onDragLeave={() => setImgDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          mb: 2.5, border: `2px dashed ${imgDragOver ? P.teal : P.tealBorder}`,
          borderRadius: 3, p: 2.5, cursor: "pointer", textAlign: "center",
          background: imgDragOver ? P.tealLight : "#FAFFFE",
          transition: "all 0.2s",
          "&:hover": { borderColor: P.teal, background: P.tealLight },
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={addImage} style={{ display: "none" }} />
        {imageUrl ? (
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <Box component="img" src={imageUrl}
              sx={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: `3px solid ${P.teal}` }} />
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
              sx={{ position: "absolute", top: -6, right: -6, bgcolor: "#FEE2E2", color: P.rose, p: 0.4, "&:hover": { bgcolor: "#FECACA" } }}>
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 34, color: P.teal, mb: 0.5 }} />
            <Typography variant="caption" sx={{ display: "block", color: P.textMuted, fontWeight: 600 }}>
              Click or drag & drop teacher photo
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: 10 }}>PNG, JPG up to 5 MB</Typography>
          </>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="name" label="Full Name" /></Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="email" label="Email Address" type="email" /></Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="qualification" label="Qualification" /></Grid>
        <Grid item xs={12} sm={6}><Field formik={Formik} name="age" label="Age" type="number" /></Grid>
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
        {!isEdit && (
          <Grid item xs={12} sm={6}>
            <Field formik={Formik} name="password" label="Password" type={showPassword ? "text" : "password"}
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
        )}
      </Grid>

      <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" fullWidth disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : (isEdit ? <EditIcon /> : <PersonAddAltIcon />)}
          sx={{
            textTransform: "none", borderRadius: 2.5, fontWeight: 700, py: 1.3,
            background: P.tealGrad, boxShadow: "none",
            "&:hover": { background: "linear-gradient(135deg,#0F766E,#0369A1)", boxShadow: `0 4px 14px ${P.teal}40` },
          }}>
          {submitting ? "Saving…" : isEdit ? "Update Teacher" : "Register Teacher"}
        </Button>
        {isEdit && (
          <Button variant="outlined" fullWidth onClick={cancelEdit}
            sx={{ textTransform: "none", borderRadius: 2.5, fontWeight: 600, py: 1.3, borderColor: P.tealBorder, color: P.teal }}>
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
          <Box sx={{
            width: 40, height: 40, borderRadius: 2, background: P.tealGrad,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: `0 4px 12px ${P.teal}30`,
          }}>
            <BadgeIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 20, md: 24 }, color: P.text, lineHeight: 1.1, letterSpacing: "-0.4px" }}>
              Teachers
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Manage all teaching staff
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchTeachers}
              sx={{ border: `1px solid ${P.border}`, borderRadius: 2, bgcolor: "#fff" }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button size="small" variant="outlined" startIcon={<FileDownloadIcon fontSize="small" />} onClick={exportCSV}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, borderColor: P.tealBorder, color: P.teal, bgcolor: "#fff", fontSize: 13 }}>
            Export CSV
          </Button>
          <Button size="small" variant="contained" startIcon={<PersonAddAltIcon fontSize="small" />}
            onClick={() => { setEdit(false); Formik.resetForm(); handleClearFile(); setFormOpen(true); }}
            sx={{
              textTransform: "none", borderRadius: 2, fontWeight: 700, boxShadow: "none", fontSize: 13,
              background: P.tealGrad,
              "&:hover": { background: "linear-gradient(135deg,#0F766E,#0369A1)", boxShadow: `0 4px 12px ${P.teal}40` },
            }}>
            Add Teacher
          </Button>
        </Stack>
      </Stack>

      {/* ── Stats ── */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
        <StatPill icon={<PeopleOutlineIcon />} label="Total Teachers" value={pagination.total || teachers.length} color={P.teal} bg={P.tealLight} />
        <StatPill icon={<ManIcon />} label="Male" value={maleCount} color={P.blue} bg={P.blueLight} />
        <StatPill icon={<WomanIcon />} label="Female" value={femaleCount} color="#A21CAF" bg="#FDF4FF" />
        <StatPill icon={<WorkspacePremiumIcon />} label="On Current Page" value={teachers.length} color={P.amber} bg={P.amberLight} />
      </Stack>

      {/* ── Search & Filter bar ── */}
      <Paper elevation={0} sx={{ mb: 2.5, px: 2, py: 1.75, borderRadius: 2.5, border: `1px solid ${P.border}`, bgcolor: "#fff" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            size="small" placeholder="Search by name or email…"
            onChange={(e) => setParam("search", e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#94A3B8" }} /></InputAdornment>,
              sx: { borderRadius: 2, bgcolor: P.slateLight },
            }}
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Mobile filter toggle */}
          <Button size="small" variant="outlined" startIcon={<TuneIcon fontSize="small" />}
            onClick={() => setFilterOpen((p) => !p)}
            sx={{ display: { xs: "flex", sm: "none" }, textTransform: "none", borderRadius: 2, fontWeight: 600, borderColor: P.border, color: P.slate }}>
            Filters
          </Button>

          {/* Desktop filters */}
          <Stack direction="row" spacing={1.5} sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
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
              {[
                { v: "grid",  Icon: GridViewIcon,   title: "Grid"  },
                { v: "list",  Icon: TableRowsIcon,  title: "List"  },
                { v: "table", Icon: ViewListIcon,   title: "Table" },
              ].map(({ v, Icon, title }) => (
                <Tooltip key={v} title={title}>
                  <IconButton size="small" onClick={() => setViewMode(v)}
                    sx={{ borderRadius: 0, px: 1.2, py: 0.8, transition: "all .15s",
                      background: viewMode === v ? P.tealLight : "transparent",
                      color: viewMode === v ? P.teal : "#94A3B8" }}>
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
              <InputLabel>Gender</InputLabel>
              <Select label="Gender" defaultValue="" onChange={(e) => setParam("gender", e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              {[
                { v: "grid",  label: "Grid",  Icon: GridViewIcon  },
                { v: "list",  label: "List",  Icon: TableRowsIcon },
                { v: "table", label: "Table", Icon: ViewListIcon  },
              ].map(({ v, label, Icon }) => (
                <Button key={v} size="small" variant={viewMode === v ? "contained" : "outlined"}
                  startIcon={<Icon fontSize="small" />} onClick={() => setViewMode(v)}
                  sx={{
                    flex: 1, textTransform: "none", borderRadius: 2, fontWeight: 600,
                    ...(viewMode === v
                      ? { background: P.tealGrad, boxShadow: "none" }
                      : { borderColor: P.border, color: P.slate }),
                  }}>
                  {label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Collapse>
      </Paper>

      {/* ── Loading bar ── */}
      {loading && <LinearProgress sx={{ borderRadius: 4, mb: 2, "& .MuiLinearProgress-bar": { bgcolor: P.teal } }} />}

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

      ) : teachers.length === 0 ? (
        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, border: `1.5px dashed ${P.border}`, textAlign: "center", bgcolor: "#fff" }}>
          <BadgeIcon sx={{ fontSize: 56, color: "#CBD5E1", mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, color: "#94A3B8", mb: 0.5 }}>No teachers found</Typography>
          <Typography variant="caption" color="text.disabled">Try adjusting filters or add a new teacher</Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" size="small" startIcon={<PersonAddAltIcon />}
              onClick={() => { setEdit(false); Formik.resetForm(); handleClearFile(); setFormOpen(true); }}
              sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, background: P.tealGrad, boxShadow: "none" }}>
              Add First Teacher
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
                  {["Teacher", "Qualification", "Gender", "Age", "Email", ""].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.71rem", color: P.textMuted, textTransform: "uppercase", letterSpacing: 0.5, py: 1.5, whiteSpace: "nowrap" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((t) => (
                  <TeacherRow key={t._id} teacher={t} onEdit={handleEdit} onDelete={handleDeleteClick} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      ) : (
        /* ── Grid / List view ── */
        <Grid container spacing={2}>
          {teachers.map((teacher, i) => (
            <Grid item key={teacher._id || i}
              xs={12}
              sm={viewMode === "list" ? 12 : 6}
              md={viewMode === "list" ? 12 : 4}
              lg={viewMode === "list" ? 12 : 3}>
              <TeacherCardAdmin
                teacher={teacher}
                handleEdit={handleEdit}
                handleDelete={(id) => handleDeleteClick(id, teacher.name)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Pagination ── */}
      {!loading && teachers.length > 0 && (
        <Paper elevation={0} sx={{ mt: 2.5, px: 2, py: 1.75, borderRadius: 2.5, border: `1px solid ${P.border}`, bgcolor: "#fff" }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" gap={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Showing <strong>{teachers.length}</strong> of <strong>{pagination.total || teachers.length}</strong> teachers
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
                color="primary" page={pagination.page} count={pagination.totalPages || 1}
                size={isMobile ? "small" : "medium"}
                onChange={(_, v) => setPagination((p) => ({ ...p, page: v }))}
                sx={{
                  "& .MuiPaginationItem-root": { borderRadius: 2, fontWeight: 600 },
                  "& .Mui-selected": { bgcolor: `${P.teal} !important` },
                }}
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={formOpen} onClose={cancelEdit} maxWidth="sm" fullWidth
        fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={200}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, bgcolor: "#fff" } }}>
        <DialogTitle sx={{ py: 2, fontWeight: 800, color: P.text, borderBottom: `1px solid ${P.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 30, height: 30, borderRadius: 1.5, background: P.tealGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isEdit ? <EditIcon sx={{ color: "#fff", fontSize: 16 }} /> : <PersonAddAltIcon sx={{ color: "#fff", fontSize: 16 }} />}
              </Box>
              <span>{isEdit ? "Edit Teacher" : "Add New Teacher"}</span>
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
            <span>Delete Teacher?</span>
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
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: "" })}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}>
            Cancel
          </Button>
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