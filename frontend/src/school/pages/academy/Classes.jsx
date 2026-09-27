import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
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
  Typography,
  Chip,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { fetchAcademicModule, createAcademicRecord, updateAcademicRecord, deleteAcademicRecord } from "../../../state/academicModuleSlice";

const ACCENTS = ["#6366f1", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

export default function Classes() {
  const dispatch = useDispatch();
  const classes = useSelector((state) => state.academicModule.modules.classes || []);
  const loading = useSelector((state) => state.academicModule.loading);

  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    sectionId: "",
    className: "",
    position: 0,
    subjects: [],
    additionalSubjects: [],
  });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [dispatch]);

  const loadInitialData = async () => {
    try {
      setLoadingOptions(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` },
      };

      const [sectionsRes, subjectsRes] = await Promise.all([
        axios.get(`${baseUrl}/sections`, config),
        axios.get(`${baseUrl}/subject/fetch-all`, config),
      ]);

      setSections(sectionsRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
      dispatch(fetchAcademicModule("classes"));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      class_text: formData.className,
      class_num: Number(formData.position) || 0,
      section: formData.sectionId,
      asignSubTeach: formData.subjects.map(subId => ({ subject: subId, teacher: null })),
      additionalSubjects: formData.additionalSubjects,
    };

    try {
      if (editing) {
        await dispatch(updateAcademicRecord({ module: "classes", id: editing, payload })).unwrap();
        setEditing(null);
      } else {
        await dispatch(createAcademicRecord({ module: "classes", payload })).unwrap();
      }

      setFormData({
        sectionId: "",
        className: "",
        position: 0,
        subjects: [],
        additionalSubjects: [],
      });
      dispatch(fetchAcademicModule("classes"));
    } catch (error) {
      console.error("Error saving class:", error);
      alert("Failed to save class");
    }
  };

  const handleEdit = (record) => {
    setEditing(record._id);
    setFormData({
      sectionId: record.section?._id || "",
      className: record.class_text || "",
      position: record.class_num || 0,
      subjects: record.asignSubTeach?.map(item => item.subject?._id || item.subject) || [],
      additionalSubjects: record.additionalSubjects || [],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this class?")) return;

    try {
      await dispatch(deleteAcademicRecord({ module: "classes", id })).unwrap();
      dispatch(fetchAcademicModule("classes"));
    } catch (error) {
      console.error("Error deleting class:", error);
      alert("Failed to delete class");
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      sectionId: "",
      className: "",
      position: 0,
      subjects: [],
      additionalSubjects: [],
    });
  };

  const filteredClasses = showInactive ? classes : classes.filter(c => c.active !== false);

  if (loadingOptions) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#f5f7ff 0%,#f8fafc 45%,#fff7ed 100%)",
        p: { xs: 2, md: 3 },
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

      <Grid container spacing={2.5} sx={{ maxWidth: 1280, mx: "auto" }}>
        {/* Left Panel - Form */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(99,102,241,0.08)",
              border: "1px solid #eef0fb",
              animation: "popIn 0.35s ease",
              transition: "box-shadow 0.25s ease",
              "&:hover": { boxShadow: "0 8px 28px rgba(99,102,241,0.14)" },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: 0.3,
                  mb: 2.5,
                }}
              >
                Class
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <FormControl fullWidth size="small" sx={{ mb: 2.5 }} required>
                  <InputLabel sx={{ fontSize: 12.5 }}>* Section</InputLabel>
                  <Select
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    label="* Section"
                    sx={{ borderRadius: 2, fontSize: 12.5 }}
                  >
                    <MenuItem value="" sx={{ fontSize: 12.5 }}>Select section</MenuItem>
                    {sections.map((section) => (
                      <MenuItem key={section._id} value={section._id} sx={{ fontSize: 12.5 }}>
                        {section.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="* Class name"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  required
                  sx={{
                    mb: 2.5,
                    "& .MuiInputBase-input": { fontSize: 12.5 },
                    "& .MuiInputLabel-root": { fontSize: 12.5 },
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Position (sort order)"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  sx={{
                    mb: 2.5,
                    "& .MuiInputBase-input": { fontSize: 12.5 },
                    "& .MuiInputLabel-root": { fontSize: 12.5 },
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />

                <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                  <InputLabel sx={{ fontSize: 12.5 }}>Subjects</InputLabel>
                  <Select
                    multiple
                    value={formData.subjects}
                    onChange={(e) => {
                      const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      setFormData({ ...formData, subjects: value.filter(v => v !== '') });
                    }}
                    label="Subjects"
                    sx={{ borderRadius: 2 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length > 0 ? (
                          selected.map((value, i) => {
                            const subject = subjects.find(s => s._id === value);
                            return (
                              <Chip
                                key={value}
                                label={subject?.subject_name || value}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: 10.5,
                                  bgcolor: `${ACCENTS[i % ACCENTS.length]}1a`,
                                  color: ACCENTS[i % ACCENTS.length],
                                  fontWeight: 700,
                                }}
                              />
                            );
                          })
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: 12.5 }} color="text.secondary">Select core subjects</Typography>
                        )}
                      </Box>
                    )}
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id} sx={{ fontSize: 12.5 }}>
                        {subject.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel sx={{ fontSize: 12.5 }}>Additional subjects</InputLabel>
                  <Select
                    multiple
                    value={formData.additionalSubjects}
                    onChange={(e) => {
                      const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      setFormData({ ...formData, additionalSubjects: value.filter(v => v !== '') });
                    }}
                    label="Additional Subjects"
                    sx={{ borderRadius: 2 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length > 0 ? (
                          selected.map((value, i) => {
                            const subject = subjects.find(s => s._id === value);
                            return (
                              <Chip
                                key={value}
                                label={subject?.subject_name || value}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: 10.5,
                                  bgcolor: `${ACCENTS[(i + 2) % ACCENTS.length]}1a`,
                                  color: ACCENTS[(i + 2) % ACCENTS.length],
                                  fontWeight: 700,
                                }}
                              />
                            );
                          })
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: 12.5 }} color="text.secondary">Select optional / additional subjects</Typography>
                        )}
                      </Box>
                    )}
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id} sx={{ fontSize: 12.5 }}>
                        {subject.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ borderTop: "1px solid #eef0f4", pt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    sx={{
                      background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      textTransform: "none",
                      fontSize: 12.5,
                      borderRadius: 2,
                      boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      "&:hover": { transform: "translateY(-1px)", boxShadow: "0 5px 16px rgba(99,102,241,0.45)" },
                    }}
                  >
                    {editing ? "Update" : "Submit"}
                  </Button>
                  {editing && (
                    <Button
                      size="small"
                      onClick={handleCancel}
                      sx={{ textTransform: "none", fontSize: 12.5, color: "#64748b" }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - List */}
        <Grid item xs={12} md={9}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(245,158,11,0.08)",
              border: "1px solid #fdf1e0",
              animation: "popIn 0.4s ease",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f3f9" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    sx={{
                      background: "linear-gradient(90deg,#f59e0b,#f43f5e)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: 0.3,
                    }}
                  >
                    Class list
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                      variant="contained"
                      sx={{
                        background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                        textTransform: "none",
                        fontSize: 12,
                        borderRadius: 2,
                        boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
                        transition: "transform 0.15s ease",
                        "&:hover": { transform: "translateY(-1px)" },
                      }}
                    >
                      Save positions
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setShowInactive(!showInactive)}
                      startIcon={
                        showInactive ? (
                          <VisibilityOffIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        )
                      }
                      sx={{
                        background: showInactive
                          ? "linear-gradient(90deg,#10b981,#14b8a6)"
                          : "linear-gradient(90deg,#f59e0b,#f97316)",
                        textTransform: "none",
                        fontSize: 12,
                        borderRadius: 2,
                        boxShadow: showInactive
                          ? "0 3px 10px rgba(16,185,129,0.3)"
                          : "0 3px 10px rgba(245,158,11,0.3)",
                        transition: "all 0.2s ease",
                        "&:hover": { transform: "translateY(-1px)" },
                      }}
                    >
                      {showInactive ? "Hide inactive" : "Inactive"}
                    </Button>
                  </Box>
                </Stack>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress size={24} sx={{ color: "#8b5cf6" }} />
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f4f5fb" }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Class name</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Position</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Subjects</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Additional subjects</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredClasses.length > 0 ? (
                        filteredClasses.map((record, index) => (
                          <TableRow
                            key={record._id}
                            hover
                            sx={{
                              animation: "fadeSlideUp 0.35s ease both",
                              animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
                            }}
                          >
                            <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: ACCENTS[index % ACCENTS.length],
                                    flexShrink: 0,
                                  }}
                                />
                                {record.class_text || "-"}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={record.class_num || 0}
                                onChange={(e) =>
                                  dispatch(updateAcademicRecord({
                                    module: "classes",
                                    id: record._id,
                                    payload: { class_num: Number(e.target.value) }
                                  }))
                                }
                                sx={{ width: 60, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                                inputProps={{ style: { padding: "4px 8px", fontSize: 11.5 } }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Chip
                                size="small"
                                label={record.asignSubTeach?.length || 0}
                                sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: "#eef2ff", color: "#4f46e5" }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Chip
                                size="small"
                                label={record.additionalSubjects?.length || 0}
                                sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: "#fff7ed", color: "#c2410c" }}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                size="small"
                                checked={record.active !== false}
                                onChange={(e) =>
                                  dispatch(updateAcademicRecord({
                                    module: "classes",
                                    id: record._id,
                                    payload: { active: e.target.checked }
                                  }))
                                }
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#14b8a6" },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(record)}
                                  sx={{
                                    color: "#4f46e5",
                                    transition: "background-color 0.15s ease",
                                    "&:hover": { bgcolor: "#eef0fd" },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(record._id)}
                                  sx={{
                                    color: "#e11d48",
                                    transition: "background-color 0.15s ease",
                                    "&:hover": { bgcolor: "#fdeeee" },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8, color: "#94a3b8" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                              <Box sx={{ fontSize: 40, opacity: 0.35 }}>📚</Box>
                              <Typography sx={{ fontSize: 12.5 }}>No data</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}