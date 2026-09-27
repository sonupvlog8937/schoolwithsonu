import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  FormControl,
  Grid,
  Grow,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  fetchAcademicModule,
  createAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
  fetchClassesForDropdown,
  fetchTeachersForDropdown,
  fetchSectionsForDropdown,
} from "../../../state/academicModuleSlice";

// Rotating accent palette so rows in the arrangement list are easy to
// tell apart at a glance.
const ROW_ACCENTS = [
  { bg: "#eef2ff", text: "#4f46e5", chip: "#c7d2fe" },
  { bg: "#ecfeff", text: "#0891b2", chip: "#a5f3fc" },
  { bg: "#fdf4ff", text: "#a21caf", chip: "#f0abfc" },
  { bg: "#fff7ed", text: "#c2410c", chip: "#fed7aa" },
  { bg: "#f0fdf4", text: "#15803d", chip: "#bbf7d0" },
  { bg: "#fef2f2", text: "#b91c1c", chip: "#fecaca" },
];

const selectSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 13,
    transition: "border-color 0.2s ease",
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed" },
  },
  "& .MuiInputLabel-root": { fontSize: 12.5 },
};

export default function ChangeTimeArrangement() {
  const dispatch = useDispatch();
  const { modules, loading, dropdownData } = useSelector((state) => state.academicModule);
  const changeArrangements = modules["change-arrangement"] || [];
  const classes = dropdownData.classes || [];
  const teachers = dropdownData.teachers || [];
  const sections = dropdownData.sections || [];

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    class: "",
    sections: [],
    absentTeacher: "",
    assignTeacher: "",
    date: "",
    status: "Active",
  });
  const [showInactive, setShowInactive] = useState(false);
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    dispatch(fetchAcademicModule("change-arrangement"));
    dispatch(fetchClassesForDropdown());
    dispatch(fetchTeachersForDropdown());
    dispatch(fetchSectionsForDropdown());
  }, [dispatch]);

  // Debug: Check what data we're getting
  useEffect(() => {
    console.log("Change Arrangements Data:", changeArrangements);
    if (changeArrangements.length > 0) {
      console.log("First record:", changeArrangements[0]);
      console.log("Sections in first record:", changeArrangements[0]?.sections);
    }
  }, [changeArrangements]);

  const handleOpenDialog = () => {
    setFormData({ class: "", sections: [], absentTeacher: "", assignTeacher: "", date: "", status: "Active" });
    setEditing(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleEdit = (record) => {
    setFormData({
      class: record.class?._id || "",
      sections: record.sections?.map((s) => s._id) || [],
      absentTeacher: record.absentTeacher?._id || "",
      assignTeacher: record.assignTeacher?._id || "",
      date: record.date || "",
      status: record.status || "Active",
    });
    setEditing(record);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this arrangement?")) {
      dispatch(deleteAcademicRecord({ module: "change-arrangement", id }));
    }
  };

  const handleSubmit = () => {
    if (!formData.class || !formData.absentTeacher || !formData.assignTeacher || !formData.date) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      class: formData.class,
      sections: formData.sections,
      absentTeacher: formData.absentTeacher,
      assignTeacher: formData.assignTeacher,
      date: formData.date,
      status: formData.status,
    };

    if (editing) {
      dispatch(updateAcademicRecord({ module: "change-arrangement", id: editing._id, payload })).then((result) => {
        if (result.type.includes("fulfilled")) {
          setFormData({ class: "", sections: [], absentTeacher: "", assignTeacher: "", date: "", status: "Active" });
          setEditing(null);
          dispatch(fetchAcademicModule("change-arrangement"));
        }
      });
    } else {
      dispatch(createAcademicRecord({ module: "change-arrangement", payload })).then((result) => {
        if (result.type.includes("fulfilled")) {
          setFormData({ class: "", sections: [], absentTeacher: "", assignTeacher: "", date: "", status: "Active" });
          dispatch(fetchAcademicModule("change-arrangement"));
        }
      });
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFormData({ ...formData, class: classId, sections: [] });
    if (classId) {
      dispatch(fetchSectionsForDropdown(classId));
    }
  };

  const handleSectionChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, sections: typeof value === "string" ? value.split(",") : value });
  };

  const filteredArrangements = showInactive
    ? changeArrangements
    : changeArrangements.filter((ca) => ca.status === "Active");

  const filteredByClass = filterClass
    ? filteredArrangements.filter((ca) => ca.class?._id === filterClass)
    : filteredArrangements;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf9ff 0%, #f4f7fb 100%)",
        p: { xs: 2, md: 3 },
        "@keyframes fadeSlideIn": {
          from: { opacity: 0, transform: "translateY(-6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes popIn": {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      }}
    >
      <Grid container spacing={2.5}>
        {/* Left Side - Form */}
        <Grid item xs={12} md={4}>
          <Grow in timeout={400}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #ede9fe",
                boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
                animation: "fadeSlideIn 0.4s ease",
                transition: "box-shadow 0.25s ease",
                "&:hover": { boxShadow: "0 8px 28px rgba(124,58,237,0.14)" },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={0.8} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "9px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                      boxShadow: "0 4px 10px rgba(124,58,237,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <SwapHorizRoundedIcon sx={{ color: "#fff", fontSize: 16 }} />
                  </Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#7c3aed", letterSpacing: 0.2 }}>
                    Assign Teacher
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={selectSx}>
                      <InputLabel>Class *</InputLabel>
                      <Select value={formData.class} label="Class *" onChange={handleClassChange} required sx={{ fontSize: 13 }}>
                        {classes.map((cls) => (
                          <MenuItem key={cls._id} value={cls._id} sx={{ fontSize: 13 }}>
                            {cls.class_text}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={selectSx}>
                      <InputLabel>Section</InputLabel>
                      <Select multiple value={formData.sections} label="Section" onChange={handleSectionChange} sx={{ fontSize: 13 }}>
                        {sections.map((section) => (
                          <MenuItem key={section._id} value={section._id} sx={{ fontSize: 13 }}>
                            {section.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={selectSx}>
                      <InputLabel>Absent Teacher *</InputLabel>
                      <Select
                        value={formData.absentTeacher}
                        label="Absent Teacher *"
                        onChange={(e) => setFormData({ ...formData, absentTeacher: e.target.value })}
                        required
                        sx={{ fontSize: 13 }}
                      >
                        {teachers.map((teacher) => (
                          <MenuItem key={teacher._id} value={teacher._id} sx={{ fontSize: 13 }}>
                            {teacher.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={selectSx}>
                      <InputLabel>Assign Teacher *</InputLabel>
                      <Select
                        value={formData.assignTeacher}
                        label="Assign Teacher *"
                        onChange={(e) => setFormData({ ...formData, assignTeacher: e.target.value })}
                        required
                        sx={{ fontSize: 13 }}
                      >
                        {teachers.map((teacher) => (
                          <MenuItem key={teacher._id} value={teacher._id} sx={{ fontSize: 13 }}>
                            {teacher.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Date *"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={selectSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={selectSx}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="Active" sx={{ fontSize: 13 }}>Active</MenuItem>
                        <MenuItem value="Inactive" sx={{ fontSize: 13 }}>Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={!formData.class || !formData.absentTeacher || !formData.assignTeacher || !formData.date}
                      sx={{
                        background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: "10px",
                        py: 0.9,
                        boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        "&:hover": {
                          background: "linear-gradient(135deg, #6d28d9, #0891b2)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 16px rgba(124,58,237,0.4)",
                        },
                        "&:disabled": { background: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
                      }}
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Right Side - Table */}
        <Grid item xs={12} md={8}>
          <Grow in timeout={550}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #ede9fe",
                boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" gap={0.8}>
                    <Box sx={{ width: 6, height: 16, borderRadius: "4px", background: "linear-gradient(180deg, #7c3aed, #06b6d4)" }} />
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#7c3aed", letterSpacing: 0.2 }}>
                      Changed Timetable List
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={() => setShowInactive(!showInactive)}
                    sx={{
                      background: showInactive ? "linear-gradient(135deg, #ec4899, #f472b6)" : "#e2e8f0",
                      color: showInactive ? "#fff" : "#64748b",
                      textTransform: "none",
                      fontSize: 11.5,
                      fontWeight: 600,
                      borderRadius: "8px",
                      boxShadow: showInactive ? "0 3px 8px rgba(236,72,153,0.3)" : "none",
                      transition: "transform 0.15s ease",
                      "&:hover": {
                        background: showInactive ? "linear-gradient(135deg, #db2777, #ec4899)" : "#cbd5e1",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Inactive
                  </Button>
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small" sx={selectSx}>
                    <InputLabel>Filter by Class</InputLabel>
                    <Select
                      value={filterClass}
                      label="Filter by Class"
                      onChange={(e) => setFilterClass(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="" sx={{ fontSize: 13 }}>All Classes</MenuItem>
                      {classes.map((cls) => (
                        <MenuItem key={cls._id} value={cls._id} sx={{ fontSize: 13 }}>
                          {cls.class_text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={22} sx={{ color: "#7c3aed" }} />
                  </Box>
                ) : (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>Class</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>Section</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>Absent Teacher</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>Assign Teacher</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredByClass.length > 0 ? (
                          filteredByClass.map((row, idx) => {
                            const accent = ROW_ACCENTS[idx % ROW_ACCENTS.length];
                            return (
                              <TableRow
                                key={row._id}
                                hover
                                sx={{
                                  animation: "popIn 0.3s ease",
                                  animationFillMode: "backwards",
                                  animationDelay: `${Math.min(idx * 40, 300)}ms`,
                                  transition: "background-color 0.2s ease",
                                  "&:hover": { bgcolor: accent.bg },
                                }}
                              >
                                <TableCell sx={{ py: 1.1 }}>
                                  <Chip
                                    label={row.class?.class_text || row.class?.class_num || "-"}
                                    size="small"
                                    sx={{
                                      fontSize: 11,
                                      fontWeight: 600,
                                      height: 22,
                                      bgcolor: accent.chip,
                                      color: accent.text,
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontSize: 12, color: "#334155", py: 1.1 }}>
                                  {Array.isArray(row.sections) && row.sections.length > 0
                                    ? row.sections.map((s) => s?.name || s).filter(Boolean).join(", ")
                                    : "All Sections"}
                                </TableCell>
                                <TableCell sx={{ fontSize: 12, color: "#334155", py: 1.1 }}>
                                  {row.absentTeacher?.name || "-"}
                                </TableCell>
                                <TableCell sx={{ fontSize: 12, color: "#334155", py: 1.1 }}>
                                  {row.assignTeacher?.name || "-"}
                                </TableCell>
                                <TableCell sx={{ fontSize: 12, color: "#334155", py: 1.1 }}>
                                  {row.date || "-"}
                                </TableCell>
                                <TableCell sx={{ py: 1.1 }}>
                                  <Stack direction="row" alignItems="center" spacing={0.8}>
                                    <Switch
                                      checked={row.status === "Active"}
                                      size="small"
                                      sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#16a34a" },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#86efac" },
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        display: "inline-block",
                                        px: 1.1,
                                        py: 0.3,
                                        borderRadius: "10px",
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        bgcolor: row.status === "Active" ? "#dcfce7" : "#fee2e2",
                                        color: row.status === "Active" ? "#16a34a" : "#dc2626",
                                      }}
                                    >
                                      {row.status || "Active"}
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell sx={{ py: 1.1 }}>
                                  <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="Edit">
                                      <Button
                                        size="small"
                                        onClick={() => handleEdit(row)}
                                        sx={{
                                          color: "#3b82f6",
                                          textTransform: "none",
                                          minWidth: 0,
                                          px: 1,
                                          fontSize: 11.5,
                                          borderRadius: "8px",
                                          transition: "background-color 0.2s ease",
                                          "&:hover": { bgcolor: "#dbeafe" },
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Remove">
                                      <Button
                                        size="small"
                                        startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => handleDelete(row._id)}
                                        sx={{
                                          color: "#ef4444",
                                          textTransform: "none",
                                          minWidth: 0,
                                          px: 1,
                                          fontSize: 11.5,
                                          borderRadius: "8px",
                                          transition: "background-color 0.2s ease",
                                          "&:hover": { bgcolor: "#fee2e2" },
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </Tooltip>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                              <Fade in timeout={500}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                  <CloseIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
                                  <Typography sx={{ fontSize: 12.5, color: "#94a3b8" }}>No Data</Typography>
                                </Box>
                              </Fade>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
}