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
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { baseUrl } from "../../../environment";
import { fetchAcademicModule, createAcademicRecord, updateAcademicRecord, deleteAcademicRecord } from "../../../state/academicModuleSlice";

const ACCENTS = ["#6366f1", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

export default function Subjects() {
  const dispatch = useDispatch();
  const subjects = useSelector((state) => state.academicModule.modules.subjects || []);
  const loading = useSelector((state) => state.academicModule.loading);

  const [boards, setBoards] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    subjectType: "theory",
    boards: [],
    optional: false,
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

      // Fetch boards from master configuration
      try {
        const boardsRes = await axios.get(`${baseUrl}/master-config/boards`, config);
        console.log("Boards API Response:", boardsRes.data);
        setBoards(boardsRes.data.data || []);
      } catch (boardError) {
        console.error("Boards API Error:", boardError);
        // If boards endpoint fails, use empty array
        setBoards([]);
      }
      
      dispatch(fetchAcademicModule("subjects"));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data before submit:", formData);

    const payload = {
      subject_name: formData.subjectName,
      subject_codename: formData.subjectCode,
      subject_type: formData.subjectType,
      boards: formData.boards,
      optional: formData.optional,
    };

    console.log("Payload to send:", payload);

    try {
      if (editing) {
        await dispatch(updateAcademicRecord({ module: "subjects", id: editing, payload })).unwrap();
        setEditing(null);
      } else {
        await dispatch(createAcademicRecord({ module: "subjects", payload })).unwrap();
      }

      setFormData({
        subjectName: "",
        subjectCode: "",
        subjectType: "theory",
        boards: [],
        optional: false,
      });
      dispatch(fetchAcademicModule("subjects"));
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Failed to save subject");
    }
  };

  const handleEdit = (record) => {
    setEditing(record._id);
    setFormData({
      subjectName: record.subject_name || "",
      subjectCode: record.subject_codename || "",
      subjectType: record.subject_type || "theory",
      boards: record.boards || [],
      optional: record.optional || false,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subject?")) return;

    try {
      await dispatch(deleteAcademicRecord({ module: "subjects", id })).unwrap();
      dispatch(fetchAcademicModule("subjects"));
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject");
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      subjectName: "",
      subjectCode: "",
      subjectType: "theory",
      boards: [],
      optional: false,
    });
  };

  const filteredSubjects = showInactive ? subjects : subjects.filter(s => s.active !== false);

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
        background: "linear-gradient(160deg,#f5f7ff 0%,#f8fafc 45%,#f0fdfa 100%)",
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
                  mb: 1,
                }}
              >
                Add subject
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", mb: 2 }}>
                Main parameters
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  size="small"
                  label="* Subject"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  required
                  sx={{
                    mb: 2.5,
                    "& .MuiInputBase-input": { fontSize: 12.5 },
                    "& .MuiInputLabel-root": { fontSize: 12.5 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "box-shadow 0.2s ease",
                      "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(99,102,241,0.15)" },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Subject code"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  sx={{
                    mb: 2.5,
                    "& .MuiInputBase-input": { fontSize: 12.5 },
                    "& .MuiInputLabel-root": { fontSize: 12.5 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "box-shadow 0.2s ease",
                      "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" },
                    },
                  }}
                />

                <FormControl fullWidth size="small" sx={{ mb: 2.5 }} required>
                  <InputLabel sx={{ fontSize: 12.5 }}>* Subject type</InputLabel>
                  <Select
                    value={formData.subjectType}
                    onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                    label="* Subject Type"
                    sx={{ borderRadius: 2, fontSize: 12.5 }}
                  >
                    <MenuItem value="theory" sx={{ fontSize: 12.5 }}>Theory</MenuItem>
                    <MenuItem value="practical" sx={{ fontSize: 12.5 }}>Practical</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                  <InputLabel sx={{ fontSize: 12.5 }}>Boards</InputLabel>
                  <Select
                    multiple
                    value={formData.boards}
                    onChange={(e) => {
                      const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      const filteredValue = value.filter(v => v !== '');
                      console.log("Boards selected:", filteredValue);
                      setFormData({ ...formData, boards: filteredValue });
                    }}
                    label="Boards"
                    sx={{ borderRadius: 2 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.length > 0 ? (
                          selected.map((value, i) => {
                            const board = boards.find(b => b._id === value);
                            const boardName = board?.data?.shortName || board?.name || value;
                            return (
                              <Chip
                                key={value}
                                label={boardName}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  bgcolor: `${ACCENTS[i % ACCENTS.length]}1a`,
                                  color: ACCENTS[i % ACCENTS.length],
                                }}
                              />
                            );
                          })
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5 }}>Select board(s) - optional</Typography>
                        )}
                      </Box>
                    )}
                  >
                    {boards.map((board) => (
                      <MenuItem key={board._id} value={board._id} sx={{ fontSize: 12.5 }}>
                        {board.data?.shortName || board.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                    p: 1,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: formData.optional ? "#fff7ed" : "#f8fafc",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: formData.optional ? "#c2410c" : "#475569" }}>
                    Optional subject
                  </Typography>
                  <Switch
                    size="small"
                    checked={formData.optional}
                    onChange={(e) => setFormData({ ...formData, optional: e.target.checked })}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#f59e0b" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#f59e0b" },
                    }}
                  />
                </Box>

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
              boxShadow: "0 4px 20px rgba(20,184,166,0.08)",
              border: "1px solid #eafaf6",
              animation: "popIn 0.4s ease",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f3f9" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    sx={{
                      background: "linear-gradient(90deg,#14b8a6,#06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: 0.3,
                    }}
                  >
                    Subject list
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
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
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                        textTransform: "none",
                        fontSize: 12,
                        borderRadius: 2,
                        boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        "&:hover": { transform: "translateY(-1px)", boxShadow: "0 5px 16px rgba(99,102,241,0.45)" },
                      }}
                    >
                      Add subject
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
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Subject code</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Subject type</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Boards</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Optional</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 10.5, color: "#4c4f6b" }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((record, index) => (
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
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: ACCENTS[index % ACCENTS.length] }}>
                                  {record.subject_name || "-"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {record.subject_codename || "-"}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Chip
                                size="small"
                                label={record.subject_type || "theory"}
                                sx={{
                                  height: 20,
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                  bgcolor: record.subject_type === "practical" ? "#eef2ff" : "#ecfeff",
                                  color: record.subject_type === "practical" ? "#4f46e5" : "#0e7490",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {record.boards?.length > 0 ? (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {record.boards.map((boardId, i) => {
                                    const board = boards.find(b => b._id === boardId);
                                    const boardName = board?.data?.shortName || board?.name || boardId;
                                    return (
                                      <Chip
                                        key={boardId}
                                        label={boardName}
                                        size="small"
                                        sx={{
                                          fontSize: 10,
                                          height: 19,
                                          fontWeight: 700,
                                          bgcolor: `${ACCENTS[(i + 3) % ACCENTS.length]}1a`,
                                          color: ACCENTS[(i + 3) % ACCENTS.length],
                                        }}
                                      />
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={record.optional ? "Optional" : "Core"}
                                size="small"
                                sx={{
                                  fontSize: 10,
                                  height: 19,
                                  fontWeight: 700,
                                  bgcolor: record.optional ? '#fff7ed' : '#f1f5f9',
                                  color: record.optional ? '#c2410c' : '#475569'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                size="small"
                                checked={record.active !== false}
                                onChange={(e) =>
                                  dispatch(updateAcademicRecord({
                                    module: "subjects",
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
                                <Button
                                  size="small"
                                  onClick={() => handleEdit(record)}
                                  sx={{
                                    color: "#4f46e5",
                                    textTransform: "none",
                                    fontSize: 11,
                                    minWidth: 0,
                                    px: 1,
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
                                  onClick={() => handleDelete(record._id)}
                                  sx={{
                                    color: "#e11d48",
                                    textTransform: "none",
                                    fontSize: 11,
                                    minWidth: 0,
                                    px: 1,
                                    borderRadius: 1.5,
                                    transition: "background-color 0.15s ease",
                                    "&:hover": { bgcolor: "#fdeeee" },
                                  }}
                                >
                                  Remove
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 8, color: "#94a3b8" }}>
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