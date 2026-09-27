import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Fade,
  Grow,
  Chip,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import axios from "axios";
import { baseUrl } from "../../../environment";
import {
  fetchMasterConfig,
  createMasterConfig,
  updateMasterConfig,
  deleteMasterConfig,
} from "../../../state/masterConfigurationSlice";

// A small rotating palette so each row/card doesn't look identical —
// gives the list a lively, colour-coded feel without being random.
const ROW_ACCENTS = [
  { bg: "#eef2ff", text: "#4f46e5", chip: "#c7d2fe" }, // indigo
  { bg: "#ecfeff", text: "#0891b2", chip: "#a5f3fc" }, // cyan
  { bg: "#fdf4ff", text: "#a21caf", chip: "#f0abfc" }, // fuchsia
  { bg: "#fff7ed", text: "#c2410c", chip: "#fed7aa" }, // orange
  { bg: "#f0fdf4", text: "#15803d", chip: "#bbf7d0" }, // green
  { bg: "#fef2f2", text: "#b91c1c", chip: "#fecaca" }, // red
];

export default function RoomAssignment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { modules } = useSelector((state) => state.masterConfiguration);
  const roomsState = modules["rooms-assign"] || { records: [], loading: false };

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    classId: "",
    sectionId: "",
    roomNo: "",
  });
  const [editingId, setEditingId] = useState(null);

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

      const [classesRes, sectionsRes] = await Promise.all([
        axios.get(`${baseUrl}/class/fetch-all`, config),
        axios.get(`${baseUrl}/sections`, config),
      ]);

      setClasses(classesRes.data.data || []);
      setSections(sectionsRes.data.data || []);

      dispatch(fetchMasterConfig("rooms-assign"));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.classId || !formData.sectionId || !formData.roomNo) {
      alert("Please fill all fields");
      return;
    }

    const selectedClass = classes.find((c) => c._id === formData.classId);
    const selectedSection = sections.find((s) => s._id === formData.sectionId);

    const payload = {
      name: `${selectedClass?.class_text} - ${selectedSection?.name} - Room ${formData.roomNo}`,
      data: {
        className: selectedClass?.class_text || "",
        classId: formData.classId,
        sectionName: selectedSection?.name || "",
        sectionId: formData.sectionId,
        roomNo: formData.roomNo,
      },
      active: true,
    };

    try {
      if (editingId) {
        await dispatch(
          updateMasterConfig({ module: "rooms-assign", id: editingId, data: payload })
        ).unwrap();
        setEditingId(null);
      } else {
        await dispatch(
          createMasterConfig({ module: "rooms-assign", data: payload })
        ).unwrap();
      }

      setFormData({ classId: "", sectionId: "", roomNo: "" });
      dispatch(fetchMasterConfig("rooms-assign"));
    } catch (error) {
      console.error("Error saving room assignment:", error);
      alert("Failed to save room assignment");
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setFormData({
      classId: record.data?.classId || "",
      sectionId: record.data?.sectionId || "",
      roomNo: record.data?.roomNo || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this room assignment?")) return;

    try {
      await dispatch(deleteMasterConfig({ module: "rooms-assign", id })).unwrap();
      dispatch(fetchMasterConfig("rooms-assign"));
    } catch (error) {
      console.error("Error deleting room assignment:", error);
      alert("Failed to delete room assignment");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ classId: "", sectionId: "", roomNo: "" });
  };

  if (loadingOptions) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress sx={{ color: "#7c3aed" }} />
        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Loading room data…</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf9ff 0%, #f4f7fb 100%)",
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
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          borderRadius: "16px",
          border: "1px solid #ede9fe",
          boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
          background: "linear-gradient(135deg, #ffffff 0%, #fbfaff 100%)",
          animation: "fadeSlideIn 0.4s ease",
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate("/school/master/school-info")}
                sx={{
                  mb: 1,
                  textTransform: "none",
                  color: "#7c3aed",
                  fontSize: 11.5,
                  fontWeight: 600,
                  px: 1,
                  borderRadius: "8px",
                  transition: "background-color 0.2s ease",
                  "&:hover": { bgcolor: "#f3e8ff" },
                }}
              >
                Back
              </Button>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                    boxShadow: "0 4px 10px rgba(124,58,237,0.3)",
                  }}
                >
                  <MeetingRoomRoundedIcon sx={{ color: "#fff", fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontSize: 19, fontWeight: 800, color: "#1e293b" }}>
                  Room Assignment
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5, ml: 0.2 }}>
                Assign rooms to class sections
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "300px 1fr" }, gap: 3 }}>
        {/* Left Panel - Form */}
        <Grow in timeout={400}>
          <Card
            sx={{
              borderRadius: "16px",
              border: "1px solid #ede9fe",
              boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
              height: "fit-content",
              transition: "box-shadow 0.25s ease",
              "&:hover": { boxShadow: "0 8px 28px rgba(124,58,237,0.14)" },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={0.8} sx={{ mb: 2 }}>
                <Box sx={{ width: 6, height: 16, borderRadius: "4px", background: "linear-gradient(180deg, #7c3aed, #06b6d4)" }} />
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#7c3aed", letterSpacing: 0.2 }}>
                  Class Room
                </Typography>
              </Stack>

              <Box component="form" onSubmit={handleSubmit}>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontSize: 13,
                      transition: "border-color 0.2s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed" },
                    },
                  }}
                >
                  <InputLabel sx={{ fontSize: 12.5 }}>* Class Name</InputLabel>
                  <Select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    label="* Class Name"
                    required
                    sx={{ fontSize: 13 }}
                  >
                    <MenuItem value="" sx={{ fontSize: 13 }}>Select Class</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id} sx={{ fontSize: 13 }}>
                        {cls.class_text}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  fullWidth
                  size="small"
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontSize: 13,
                      transition: "border-color 0.2s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#22d3ee" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#06b6d4" },
                    },
                  }}
                >
                  <InputLabel sx={{ fontSize: 12.5 }}>* Section Name</InputLabel>
                  <Select
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    label="* Section Name"
                    required
                    sx={{ fontSize: 13 }}
                  >
                    <MenuItem value="" sx={{ fontSize: 13 }}>Select Section</MenuItem>
                    {sections.map((section) => (
                      <MenuItem key={section._id} value={section._id} sx={{ fontSize: 13 }}>
                        {section.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="* Room No."
                  placeholder="Room No."
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  required
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontSize: 13,
                      transition: "border-color 0.2s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#f472b6" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ec4899" },
                    },
                    "& .MuiInputLabel-root": { fontSize: 12.5 },
                  }}
                />

                <Stack direction="row" spacing={1}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      borderRadius: "10px",
                      py: 0.9,
                      boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      "&:hover": {
                        background: "linear-gradient(135deg, #6d28d9, #0891b2)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 16px rgba(124,58,237,0.4)",
                      },
                      "&:active": { transform: "translateY(0)" },
                    }}
                  >
                    {editingId ? "Update" : "Submit"}
                  </Button>
                  {editingId && (
                    <Button
                      onClick={handleCancel}
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        fontSize: 13,
                        borderRadius: "10px",
                        borderColor: "#e2e8f0",
                        color: "#64748b",
                        transition: "all 0.2s ease",
                        "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        {/* Right Panel - List */}
        <Grow in timeout={550}>
          <Card
            sx={{
              borderRadius: "16px",
              border: "1px solid #ede9fe",
              boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  p: 2.2,
                  borderBottom: "1px solid #ede9fe",
                  background: "linear-gradient(135deg, #faf5ff 0%, #ecfeff 100%)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" gap={0.8}>
                    <Box sx={{ width: 6, height: 16, borderRadius: "4px", background: "linear-gradient(180deg, #7c3aed, #06b6d4)" }} />
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#7c3aed", letterSpacing: 0.2 }}>
                      Class Room List
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    sx={{
                      textTransform: "none",
                      color: "#ec4899",
                      fontSize: 11.5,
                      fontWeight: 600,
                      borderRadius: "8px",
                      transition: "background-color 0.2s ease",
                      "&:hover": { bgcolor: "#fce7f3" },
                    }}
                  >
                    Inactive
                  </Button>
                </Stack>
              </Box>

              {roomsState.loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress size={22} sx={{ color: "#7c3aed" }} />
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>
                          Class Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>
                          Section
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>
                          Room No.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "#475569", py: 1.2 }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomsState.records.length > 0 ? (
                        roomsState.records.map((record, idx) => {
                          const accent = ROW_ACCENTS[idx % ROW_ACCENTS.length];
                          return (
                            <TableRow
                              key={record._id}
                              hover
                              sx={{
                                animation: "popIn 0.3s ease",
                                animationFillMode: "backwards",
                                animationDelay: `${Math.min(idx * 40, 300)}ms`,
                                transition: "background-color 0.2s ease",
                                "&:hover": { bgcolor: accent.bg },
                              }}
                            >
                              <TableCell sx={{ fontSize: 12.5, color: "#1e293b", fontWeight: 600, py: 1.1 }}>
                                {record.data?.className || "-"}
                              </TableCell>
                              <TableCell sx={{ py: 1.1 }}>
                                <Chip
                                  label={record.data?.sectionName || "-"}
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
                              <TableCell sx={{ fontSize: 12.5, color: "#334155", fontWeight: 600, py: 1.1 }}>
                                {record.data?.roomNo || "-"}
                              </TableCell>
                              <TableCell sx={{ py: 1.1 }}>
                                <Box
                                  sx={{
                                    display: "inline-block",
                                    px: 1.3,
                                    py: 0.35,
                                    borderRadius: "10px",
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    bgcolor: record.active ? "#dcfce7" : "#fee2e2",
                                    color: record.active ? "#16a34a" : "#dc2626",
                                  }}
                                >
                                  {record.active ? "Active" : "Inactive"}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.1 }}>
                                <Stack direction="row" spacing={0.5}>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEdit(record)}
                                      sx={{
                                        color: "#3b82f6",
                                        transition: "background-color 0.2s ease, transform 0.15s ease",
                                        "&:hover": { bgcolor: "#dbeafe", transform: "scale(1.08)" },
                                      }}
                                    >
                                      <EditIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDelete(record._id)}
                                      sx={{
                                        color: "#ef4444",
                                        transition: "background-color 0.2s ease, transform 0.15s ease",
                                        "&:hover": { bgcolor: "#fee2e2", transform: "scale(1.08)" },
                                      }}
                                    >
                                      <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 8, color: "#94a3b8" }}>
                            <Fade in timeout={500}>
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                <Box sx={{ fontSize: 42, opacity: 0.35 }}>📚</Box>
                                <Typography sx={{ fontSize: 12.5 }}>No Data</Typography>
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
      </Box>
    </Box>
  );
}