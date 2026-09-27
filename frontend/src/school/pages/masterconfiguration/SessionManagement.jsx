import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { keyframes } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StarIcon from "@mui/icons-material/Star";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { useNavigate } from "react-router-dom";
import {
  fetchMasterConfig,
  createMasterConfig,
  updateMasterConfig,
  deleteMasterConfig,
} from "../../../state/masterConfigurationSlice";

/* ---------- Animations ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
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
const dialogIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const NO_MOTION = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };
const enter = (ms = 0) => ({ animation: `${fadeUp} .55s ${EASE} ${ms}ms backwards`, ...NO_MOTION });

const AVATAR_GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#ec4899", "#f43f5e"],
  ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#14b8a6"],
  ["#f59e0b", "#f97316"],
  ["#8b5cf6", "#d946ef"],
];
const hashOf = (s = "") => [...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // DD-MM-YYYY format
};

const switchSx = (color1, color2) => ({
  "& .MuiSwitch-switchBase.Mui-checked": { color: "#fff" },
  "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb": {
    boxShadow: `0 2px 6px ${color1}70`,
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    background: `linear-gradient(90deg, ${color1}, ${color2})`,
    opacity: 1,
  },
  "& .MuiSwitch-track": { transition: `background .3s ${EASE}` },
  "& .MuiSwitch-thumb": { transition: `box-shadow .3s ${EASE}` },
});

export default function SessionManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sessions = [], loading } = useSelector((state) => state.masterConfiguration);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
    isCurrentSession: false,
    active: true,
  });

  useEffect(() => {
    dispatch(fetchMasterConfig("session"));
  }, [dispatch]);

  const isInitialLoading = loading && sessions.length === 0;
  const currentSessionName = useMemo(
    () => sessions.find((s) => s.data?.isCurrentSession)?.name,
    [sessions]
  );
  const activeCount = sessions.filter((s) => s.active !== false).length;

  const handleOpenDialog = (session = null) => {
    setFormError("");
    if (session) {
      setEditingSession(session);
      setFormData({
        name: session.name || "",
        startDate: session.data?.startDate ? dayjs(session.data.startDate) : null,
        endDate: session.data?.endDate ? dayjs(session.data.endDate) : null,
        isCurrentSession: session.data?.isCurrentSession || false,
        active: session.active !== false,
      });
    } else {
      setEditingSession(null);
      setFormData({
        name: "",
        startDate: null,
        endDate: null,
        isCurrentSession: false,
        active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSession(null);
    setFormError("");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      setFormError("Please fill all required fields");
      return;
    }

    const payload = {
      name: formData.name,
      data: {
        startDate: formData.startDate?.toDate ? formData.startDate.toDate() : formData.startDate,
        endDate: formData.endDate?.toDate ? formData.endDate.toDate() : formData.endDate,
        isCurrentSession: formData.isCurrentSession,
      },
      active: formData.active,
    };

    try {
      if (editingSession) {
        await dispatch(updateMasterConfig({ module: "session", id: editingSession._id, data: payload })).unwrap();
      } else {
        await dispatch(createMasterConfig({ module: "session", data: payload })).unwrap();
      }
      handleCloseDialog();
      dispatch(fetchMasterConfig("session"));
    } catch (error) {
      console.error("Error saving session:", error);
      setFormError("Failed to save session");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this session?")) return;

    try {
      await dispatch(deleteMasterConfig({ module: "session", id })).unwrap();
      dispatch(fetchMasterConfig("session"));
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session");
    }
  };

  const handleToggleActive = async (session) => {
    try {
      await dispatch(
        updateMasterConfig({
          module: "session",
          id: session._id,
          data: { ...session, active: !session.active },
        })
      ).unwrap();
      dispatch(fetchMasterConfig("session"));
    } catch (error) {
      console.error("Error toggling session status:", error);
    }
  };

  const handleToggleCurrentSession = async (session) => {
    try {
      await dispatch(
        updateMasterConfig({
          module: "session",
          id: session._id,
          data: {
            ...session,
            data: { ...session.data, isCurrentSession: !session.data?.isCurrentSession },
          },
        })
      ).unwrap();
      dispatch(fetchMasterConfig("session"));
    } catch (error) {
      console.error("Error toggling current session:", error);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        minHeight: "100vh",
        fontSize: 12,
        background:
          "radial-gradient(900px 500px at 0% 0%, #ffe4e6 0%, transparent 60%), radial-gradient(800px 500px at 100% 10%, #fff7ed 0%, transparent 55%), radial-gradient(900px 600px at 50% 100%, #ede9fe 0%, transparent 60%), #f8fafc",
      }}
    >
      {/* ---------- Header ---------- */}
      <Card
        sx={{
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          borderRadius: "18px",
          border: "none",
          background: "linear-gradient(120deg, #f97316 0%, #ef4444 35%, #db2777 70%, #7c3aed 100%)",
          backgroundSize: "220% 220%",
          animation: `${gradientShift} 14s ease-in-out infinite, ${fadeUp} .55s ${EASE} backwards`,
          boxShadow: "0 16px 36px rgba(244,81,44,.28)",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            top: -90,
            right: -40,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,.32), transparent 70%)",
            animation: `${floatA} 9s ease-in-out infinite`,
            pointerEvents: "none",
            ...NO_MOTION,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            bottom: -90,
            left: "35%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(250,204,21,.35), transparent 70%)",
            animation: `${floatB} 11s ease-in-out infinite`,
            pointerEvents: "none",
            ...NO_MOTION,
          }}
        />
        <CardContent sx={{ position: "relative", p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 14, transition: `transform .3s ${EASE}` }} />}
                onClick={() => navigate("/school")}
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
                    width: 38,
                    height: 38,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,.2)",
                    border: "1px solid rgba(255,255,255,.3)",
                    animation: `${popIn} .6s ${EASE} 150ms backwards`,
                    ...NO_MOTION,
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 17, md: 20 }, lineHeight: 1.2 }}>Session management</Typography>
                  <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "rgba(255,255,255,.85)" }}>Manage academic sessions and years</Typography>
                </Box>
              </Stack>
            </Box>

            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
              {!isInitialLoading && (
                <Stack direction="row" gap={0.75}>
                  <Box sx={{ px: 1.1, py: 0.4, borderRadius: "20px", fontSize: 10.5, fontWeight: 700, bgcolor: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)" }}>
                    {sessions.length} total
                  </Box>
                  <Box sx={{ px: 1.1, py: 0.4, borderRadius: "20px", fontSize: 10.5, fontWeight: 700, bgcolor: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)" }}>
                    {activeCount} active
                  </Box>
                  {currentSessionName && (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 1.1, py: 0.4, borderRadius: "20px", fontSize: 10.5, fontWeight: 700, bgcolor: "rgba(255,255,255,.9)", color: "#c2410c" }}>
                      <StarIcon sx={{ fontSize: 12 }} />
                      {currentSessionName}
                    </Box>
                  )}
                </Stack>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: "#fff",
                  color: "#ea580c",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: "10px",
                  px: 1.75,
                  py: 0.6,
                  boxShadow: "0 6px 16px rgba(15,23,42,.18)",
                  transition: `all .3s ${EASE}`,
                  "&:hover": { bgcolor: "#fff7ed", transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(15,23,42,.24)" },
                  "&:active": { transform: "scale(.97)" },
                }}
              >
                Add session
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ---------- Sessions list ---------- */}
      <Card
        sx={{
          ...enter(120),
          overflow: "hidden",
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,.18)",
          boxShadow: "0 10px 30px rgba(244,81,44,.08)",
          bgcolor: "rgba(255,255,255,.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box sx={{ p: 1.75, borderBottom: "1px solid #f1f5f9" }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  background: "linear-gradient(135deg, #f97316, #db2777)",
                  boxShadow: "0 4px 10px rgba(249,115,22,.35)",
                }}
              >
                <EventAvailableIcon sx={{ fontSize: 15 }} />
              </Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#17233b" }}>Session list</Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-thumb": { background: "linear-gradient(135deg,#fdba74,#f9a8d4)", borderRadius: 8 },
              "&::-webkit-scrollbar-track": { background: "#f8fafc" },
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      background: "linear-gradient(180deg, #fff7ed, #fff1f2)",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#c2410c",
                      borderBottom: "2px solid #fed7aa",
                      whiteSpace: "nowrap",
                      py: 1,
                    },
                  }}
                >
                  <TableCell>Session name</TableCell>
                  <TableCell>Start date</TableCell>
                  <TableCell>End date</TableCell>
                  <TableCell>Current session</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isInitialLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell colSpan={6} sx={{ py: 1 }}>
                        <Skeleton variant="rounded" height={24} animation="wave" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!isInitialLoading && sessions.length > 0
                  ? sessions.map((session, index) => {
                      const [g1, g2] = AVATAR_GRADIENTS[hashOf(session.name) % AVATAR_GRADIENTS.length];
                      const isCurrent = Boolean(session.data?.isCurrentSession);
                      const isActive = session.active !== false;
                      return (
                        <TableRow
                          key={session._id}
                          sx={{
                            animation: `${rowIn} .45s ${EASE} ${Math.min(index * 40, 450)}ms backwards`,
                            ...NO_MOTION,
                            transition: "background .25s ease",
                            "& td": { fontSize: 12, color: "#475569", borderBottom: "1px solid #f1f5f9", py: 1 },
                            "&:hover": { background: "linear-gradient(90deg, #fff7ed, #fdf4ff 60%, #fff)" },
                            "& td:first-of-type": { boxShadow: "inset 3px 0 0 transparent", transition: "box-shadow .25s ease" },
                            "&:hover td:first-of-type": { boxShadow: "inset 3px 0 0 #f97316" },
                            "&:last-child td": { borderBottom: 0 },
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 26,
                                  height: 26,
                                  flexShrink: 0,
                                  borderRadius: "9px",
                                  display: "grid",
                                  placeItems: "center",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#fff",
                                  background: `linear-gradient(135deg, ${g1}, ${g2})`,
                                  boxShadow: `0 3px 8px ${g1}55`,
                                }}
                              >
                                <CalendarMonthIcon sx={{ fontSize: 14 }} />
                              </Box>
                              <Box component="span" sx={{ fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                                {session.name || "-"}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(session.data?.startDate)}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(session.data?.endDate)}</TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={0.75}>
                              <Switch size="small" checked={isCurrent} onChange={() => handleToggleCurrentSession(session)} sx={switchSx("#f97316", "#db2777")} />
                              {isCurrent && (
                                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, px: 0.8, py: 0.2, borderRadius: "20px", fontSize: 10, fontWeight: 700, color: "#c2410c", bgcolor: "#fff7ed" }}>
                                  <StarIcon sx={{ fontSize: 11 }} />
                                  Current
                                </Box>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={0.75}>
                              <Switch size="small" checked={isActive} onChange={() => handleToggleActive(session)} sx={switchSx("#10b981", "#059669")} />
                              <Box
                                component="span"
                                sx={{
                                  px: 0.8,
                                  py: 0.2,
                                  borderRadius: "20px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: isActive ? "#059669" : "#94a3b8",
                                  bgcolor: isActive ? "#ecfdf5" : "#f1f5f9",
                                }}
                              >
                                {isActive ? "Active" : "Inactive"}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <Button
                                size="small"
                                startIcon={<EditIcon sx={{ fontSize: 13 }} />}
                                onClick={() => handleOpenDialog(session)}
                                sx={{
                                  minWidth: 0,
                                  px: 1.1,
                                  py: 0.3,
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  textTransform: "none",
                                  color: "#fff",
                                  borderRadius: "8px",
                                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                  boxShadow: "0 4px 10px rgba(99,102,241,.3)",
                                  transition: `all .3s ${EASE}`,
                                  "& .MuiButton-startIcon": { mr: 0.4, ml: 0 },
                                  "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", transform: "translateY(-1px)", boxShadow: "0 8px 16px rgba(99,102,241,.4)" },
                                  "&:active": { transform: "scale(.96)" },
                                }}
                              >
                                Edit
                              </Button>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(session._id)}
                                sx={{
                                  color: "#fff",
                                  width: 26,
                                  height: 26,
                                  borderRadius: "8px",
                                  background: "linear-gradient(135deg, #f43f5e, #ef4444)",
                                  boxShadow: "0 4px 10px rgba(244,63,94,.3)",
                                  transition: `all .3s ${EASE}`,
                                  "&:hover": { background: "linear-gradient(135deg, #e11d48, #dc2626)", transform: "translateY(-1px) rotate(-6deg)" },
                                  "&:active": { transform: "scale(.92)" },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : !isInitialLoading && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 7, borderBottom: 0 }}>
                          <Box sx={{ animation: `${popIn} .5s ${EASE}`, ...NO_MOTION }}>
                            <Box
                              sx={{
                                mx: "auto",
                                mb: 1.5,
                                width: 56,
                                height: 56,
                                borderRadius: "18px",
                                display: "grid",
                                placeItems: "center",
                                color: "#f97316",
                                background: "linear-gradient(135deg, #fff7ed, #fdf2f8)",
                              }}
                            >
                              <InboxOutlinedIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>No sessions found</Typography>
                            <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "#94a3b8" }}>Click "Add session" to create one.</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* ---------- Add / Edit dialog ---------- */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
            overflow: "hidden",
            animation: `${dialogIn} .35s ${EASE}`,
            ...NO_MOTION,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            color: "#fff",
            px: 3,
            py: 2,
            background: "linear-gradient(120deg, #f97316, #db2777 65%, #7c3aed)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 140,
              height: 140,
              top: -60,
              right: -30,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,.3), transparent 70%)",
            }}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: "relative" }}>
            <DialogTitle sx={{ p: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>
              {editingSession ? "Edit session" : "Add session"}
            </DialogTitle>
            <IconButton onClick={handleCloseDialog} size="small" sx={{ color: "#fff", bgcolor: "rgba(255,255,255,.18)", "&:hover": { bgcolor: "rgba(255,255,255,.3)" } }}>
              <CloseIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Box sx={{ mb: 2, px: 1.5, py: 1, borderRadius: "10px", bgcolor: "#fff1f2", color: "#be123c", fontSize: 11.5, fontWeight: 600, animation: `${fadeUp} .3s ${EASE}`, ...NO_MOTION }}>
              {formError}
            </Box>
          )}
          <Stack spacing={2.25}>
            <TextField
              label="Session name"
              placeholder="e.g., 2026-2027"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              size="small"
              sx={{
                "& .MuiInputBase-input": { fontSize: 12.5 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  transition: "box-shadow .3s ease",
                  "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(249,115,22,.15)" },
                  "&.Mui-focused fieldset": { borderColor: "#f97316" },
                },
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DatePicker
                  label="Start date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      required: true,
                      sx: {
                        "& .MuiInputBase-input": { fontSize: 12.5 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(249,115,22,.15)" },
                          "&.Mui-focused fieldset": { borderColor: "#f97316" },
                        },
                      },
                    },
                  }}
                />
                <DatePicker
                  label="End date"
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      required: true,
                      sx: {
                        "& .MuiInputBase-input": { fontSize: 12.5 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(249,115,22,.15)" },
                          "&.Mui-focused fieldset": { borderColor: "#f97316" },
                        },
                      },
                    },
                  }}
                />
              </Stack>
            </LocalizationProvider>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1, borderRadius: "10px", bgcolor: "#fff7ed" }}>
              <Stack direction="row" alignItems="center" gap={0.75}>
                <StarIcon sx={{ fontSize: 15, color: "#ea580c" }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#9a3412" }}>Set as current session</Typography>
              </Stack>
              <Switch
                size="small"
                checked={formData.isCurrentSession}
                onChange={(e) => setFormData({ ...formData, isCurrentSession: e.target.checked })}
                sx={switchSx("#f97316", "#db2777")}
              />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1, borderRadius: "10px", bgcolor: "#ecfdf5" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>Active</Typography>
              <Switch size="small" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} sx={switchSx("#10b981", "#059669")} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none", color: "#64748b", fontSize: 12, fontWeight: 600, borderRadius: "10px", px: 1.5 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: "10px",
              px: 2,
              background: "linear-gradient(135deg, #f97316, #db2777)",
              boxShadow: "0 6px 16px rgba(249,115,22,.35)",
              transition: `all .3s ${EASE}`,
              "&:hover": { background: "linear-gradient(135deg, #ea580c, #be185d)", transform: "translateY(-1px)", boxShadow: "0 10px 22px rgba(219,39,119,.4)" },
              "&:active": { transform: "scale(.97)" },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}