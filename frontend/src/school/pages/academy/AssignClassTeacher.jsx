import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Grow,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import {
  fetchAcademicModule,
  createAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
  fetchClassesForDropdown,
  fetchTeachersForDropdown,
  fetchSectionsForDropdown,
} from "../../../state/academicModuleSlice";

const ACCENTS = ["#6366f1", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899", "#10b981"];

const DialogTransition = (props) => <Grow {...props} timeout={280} />;
const SlideUpTransition = (props) => <Slide direction="up" {...props} />;

export default function AssignClassTeacher() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { modules, loading, error, dropdownData } = useSelector((state) => state.academicModule);
  const classTeachers = modules["class-teacher"] || [];
  const classes = dropdownData.classes || [];
  const teachers = dropdownData.teachers || [];
  const sections = dropdownData.sections || [];

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    class: "",
    sections: [],
    teacher: "",
    status: "Active",
  });
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    dispatch(fetchAcademicModule("class-teacher"));
    dispatch(fetchClassesForDropdown());
    dispatch(fetchTeachersForDropdown());
    dispatch(fetchSectionsForDropdown());
  }, [dispatch]);

  const handleOpenDialog = () => {
    setFormData({ class: "", sections: [], teacher: "", status: "Active" });
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
      teacher: record.teacher?._id || "",
      status: record.status || "Active",
    });
    setEditing(record);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      dispatch(deleteAcademicRecord({ module: "class-teacher", id }));
    }
  };

  const handleSubmit = () => {
    if (!formData.class || !formData.teacher) {
      alert("Please select class and teacher");
      return;
    }

    const payload = {
      class: formData.class,
      sections: formData.sections,
      teacher: formData.teacher,
      status: formData.status,
    };

    if (editing) {
      dispatch(updateAcademicRecord({ module: "class-teacher", id: editing._id, payload })).then(() => {
        handleCloseDialog();
      });
    } else {
      dispatch(createAcademicRecord({ module: "class-teacher", payload })).then(() => {
        handleCloseDialog();
      });
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFormData({ ...formData, class: classId, sections: [] });
    dispatch(fetchSectionsForDropdown());
  };

  const handleSectionChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, sections: typeof value === "string" ? value.split(",") : value });
  };

  const filteredClassTeachers = showInactive
    ? classTeachers
    : classTeachers.filter((ct) => ct.status === "Active");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#f5f7ff 0%,#f8fafc 45%,#fdf2f8 100%)",
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(244,63,94,0.08)",
          border: "1px solid #fdeef2",
          maxWidth: 1280,
          mx: "auto",
          animation: "popIn 0.35s ease",
        }}
      >
        <CardContent sx={{ p: { xs: 1.75, sm: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.25,
              mb: 2,
            }}
          >
            <Typography
              sx={{
                background: "linear-gradient(90deg,#6366f1,#f43f5e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
                fontSize: { xs: 13, sm: 13.5 },
                letterSpacing: 0.3,
              }}
            >
              Assign class teacher
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                sx={{
                  flex: { xs: 1, sm: "initial" },
                  background: showInactive ? "linear-gradient(90deg,#f59e0b,#f97316)" : "#eef0f4",
                  color: showInactive ? "#fff" : "#64748b",
                  textTransform: "none",
                  fontSize: 11.5,
                  borderRadius: 2,
                  boxShadow: showInactive ? "0 3px 10px rgba(245,158,11,0.3)" : "none",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "translateY(-1px)", bgcolor: showInactive ? undefined : "#e2e5ec" },
                }}
                onClick={() => setShowInactive(!showInactive)}
              >
                Inactive
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  flex: { xs: 1, sm: "initial" },
                  background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                  color: "#fff",
                  textTransform: "none",
                  fontSize: 11.5,
                  borderRadius: 2,
                  boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 5px 16px rgba(99,102,241,0.45)" },
                }}
                onClick={handleOpenDialog}
              >
                Add class teacher
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={26} sx={{ color: "#8b5cf6" }} />
            </Box>
          ) : filteredClassTeachers.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 8 }}>
              <CloseIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
              <Typography sx={{ color: "#a0aec0", fontSize: 12.5 }}>No data</Typography>
            </Box>
          ) : isMobile ? (
            /* ---------- Mobile: colorful stacked cards ---------- */
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {filteredClassTeachers.map((row, index) => {
                const accent = ACCENTS[index % ACCENTS.length];
                return (
                  <Box
                    key={row._id}
                    sx={{
                      borderRadius: 2.5,
                      border: "1px solid #eef0f4",
                      borderLeft: `4px solid ${accent}`,
                      p: 1.5,
                      bgcolor: "#fff",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                      animation: "fadeSlideUp 0.35s ease both",
                      animationDelay: `${Math.min(index * 0.05, 0.4)}s`,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>
                        {row.class?.class_text || "-"}
                      </Typography>
                      <Chip
                        size="small"
                        label={row.status || "Active"}
                        sx={{
                          height: 19,
                          fontSize: 9.5,
                          fontWeight: 700,
                          bgcolor: row.status === "Active" ? "#e6faf3" : "#fdeeee",
                          color: row.status === "Active" ? "#0d9488" : "#e11d48",
                        }}
                      />
                    </Box>

                    <Typography sx={{ fontSize: 11.5, color: "#64748b", mb: 0.5 }}>
                      Teacher: <b style={{ color: "#334155" }}>{row.teacher?.name || "-"}</b>
                    </Typography>

                    {row.sections?.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                        {row.sections.map((s, i) => (
                          <Chip
                            key={s._id || i}
                            label={s.name}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 9.5,
                              fontWeight: 700,
                              bgcolor: `${ACCENTS[(i + 1) % ACCENTS.length]}1a`,
                              color: ACCENTS[(i + 1) % ACCENTS.length],
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
                      <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: "#4f46e5", bgcolor: "#eef0fd" }}>
                        <EditIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row._id)} sx={{ color: "#e11d48", bgcolor: "#fdeeee" }}>
                        <DeleteIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            /* ---------- Desktop / tablet: table ---------- */
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Assign class</TableCell>
                    <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Assign sections</TableCell>
                    <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Assign teacher</TableCell>
                    <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClassTeachers.map((row, index) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        animation: "fadeSlideUp 0.35s ease both",
                        animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
                        transition: "background-color 0.2s ease",
                        "&:hover": { bgcolor: "#faf8ff" },
                      }}
                    >
                      <TableCell sx={{ fontSize: 11.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENTS[index % ACCENTS.length], flexShrink: 0 }} />
                          {row.class?.class_text || "-"}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: 11.5 }}>
                        {row.sections?.length > 0
                          ? row.sections.map((s, i) => (
                              <Chip
                                key={s._id || i}
                                label={s.name}
                                size="small"
                                sx={{
                                  height: 19,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  mr: 0.5,
                                  mb: 0.5,
                                  bgcolor: `${ACCENTS[(i + 1) % ACCENTS.length]}1a`,
                                  color: ACCENTS[(i + 1) % ACCENTS.length],
                                }}
                              />
                            ))
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 11.5 }}>{row.teacher?.name || "-"}</TableCell>
                      <TableCell sx={{ fontSize: 11.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Switch
                            checked={row.status === "Active"}
                            size="small"
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#14b8a6" },
                            }}
                          />
                          <Chip
                            size="small"
                            label={row.status || "Active"}
                            sx={{
                              height: 19,
                              fontSize: 10,
                              fontWeight: 700,
                              ml: 0.5,
                              bgcolor: row.status === "Active" ? "#e6faf3" : "#fdeeee",
                              color: row.status === "Active" ? "#0d9488" : "#e11d48",
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: 11.5 }}>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Button
                            size="small"
                            onClick={() => handleEdit(row)}
                            sx={{
                              color: "#4f46e5",
                              textTransform: "none",
                              minWidth: 0,
                              fontSize: 11,
                              borderRadius: 1.5,
                              transition: "background-color 0.15s ease",
                              "&:hover": { bgcolor: "#eef0fd" },
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            startIcon={<CloseIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleDelete(row._id)}
                            sx={{
                              color: "#e11d48",
                              textTransform: "none",
                              minWidth: 0,
                              fontSize: 11,
                              borderRadius: 1.5,
                              transition: "background-color 0.15s ease",
                              "&:hover": { bgcolor: "#fdeeee" },
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={isMobile ? SlideUpTransition : DialogTransition}
        PaperProps={{
          sx: isMobile
            ? { borderTopLeftRadius: 20, borderTopRightRadius: 20 }
            : { borderRadius: 3, boxShadow: "0 12px 40px rgba(99,102,241,0.2)" },
        }}
      >
        <DialogTitle sx={{ color: "#4f46e5", fontWeight: 800, fontSize: 13.5, pb: 1 }}>
          {editing ? "Edit class teacher" : "Add class teacher"}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: "absolute", right: 8, top: 8, color: "#94a3b8" }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: 12 }}>Assign classes *</InputLabel>
                <Select
                  value={formData.class}
                  label="Assign Classes *"
                  onChange={handleClassChange}
                  required
                  sx={{ borderRadius: 2, fontSize: 12 }}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id} sx={{ fontSize: 12 }}>
                      {cls.class_text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: 12 }}>Assign sections</InputLabel>
                <Select
                  multiple
                  value={formData.sections}
                  label="Assign Sections"
                  onChange={handleSectionChange}
                  sx={{ borderRadius: 2 }}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id, i) => {
                        const sec = sections.find((s) => s._id === id);
                        return (
                          <Chip
                            key={id}
                            size="small"
                            label={sec?.name || id}
                            sx={{
                              height: 19,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: `${ACCENTS[i % ACCENTS.length]}1a`,
                              color: ACCENTS[i % ACCENTS.length],
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {sections.map((section) => (
                    <MenuItem key={section._id} value={section._id} sx={{ fontSize: 12 }}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: 12 }}>Teacher *</InputLabel>
                <Select
                  value={formData.teacher}
                  label="Teacher *"
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  required
                  sx={{ borderRadius: 2, fontSize: 12 }}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher._id} sx={{ fontSize: 12 }}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: 12 }}>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{ borderRadius: 2, fontSize: 12 }}
                >
                  <MenuItem value="Active" sx={{ fontSize: 12 }}>Active</MenuItem>
                  <MenuItem value="Inactive" sx={{ fontSize: 12 }}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseDialog}
            size="small"
            sx={{ textTransform: "none", color: "#64748b", fontSize: 12 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={!formData.class || !formData.teacher}
            sx={{
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
              color: "#fff",
              textTransform: "none",
              fontSize: 12,
              borderRadius: 2,
              boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": { transform: "translateY(-1px)", boxShadow: "0 5px 16px rgba(99,102,241,0.45)" },
              "&:disabled": { background: "#e2e5ec", color: "#9e9e9e", boxShadow: "none" },
            }}
          >
            {editing ? "Update" : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}