import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Chip, Grow } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { 
  fetchAcademicModule, 
  createAcademicRecord, 
  updateAcademicRecord, 
  deleteAcademicRecord 
} from "../../../state/academicModuleSlice";

const ACCENTS = ["#6366f1", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

const DialogTransition = (props) => <Grow {...props} timeout={280} />;

export default function TimingConfiguration() {
  const dispatch = useDispatch();
  const { modules, loading, error } = useSelector((state) => state.academicModule);
  const timings = modules["timing"] || [];
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    period: "",
    startTime: "",
    endTime: "",
    status: "Active"
  });
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    dispatch(fetchAcademicModule("timing"));
  }, [dispatch]);

  useEffect(() => {
    console.log("Timings from state:", timings);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [timings, loading, error]);

  const handleOpenDialog = () => {
    setFormData({ period: "", startTime: "", endTime: "", status: "Active" });
    setEditing(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleEdit = (record) => {
    setFormData({
      period: record.period || "",
      startTime: record.startTime || "",
      endTime: record.endTime || "",
      status: record.status || "Active"
    });
    setEditing(record);
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this timing?")) {
      dispatch(deleteAcademicRecord({ module: "timing", id }));
    }
  };

  const handleSubmit = () => {
    if (!formData.period || !formData.startTime || !formData.endTime) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      period: formData.period,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: formData.status
    };

    if (editing) {
      dispatch(updateAcademicRecord({ module: "timing", id: editing._id, payload })).then(() => {
        handleCloseDialog();
      });
    } else {
      dispatch(createAcademicRecord({ module: "timing", payload })).then(() => {
        handleCloseDialog();
      });
    }
  };

  const filteredTimings = showInactive 
    ? timings 
    : timings.filter(t => t.status === "Active");

  console.log("Filtered timings:", filteredTimings);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#f5f7ff 0%,#f8fafc 45%,#ecfeff 100%)",
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

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(6,182,212,0.08)",
          border: "1px solid #e5fbff",
          maxWidth: 1280,
          mx: "auto",
          animation: "popIn 0.35s ease",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              sx={{
                background: "linear-gradient(90deg,#06b6d4,#6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
                fontSize: 13.5,
                letterSpacing: 0.3,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 16, color: "#06b6d4" }} />
              Timing list
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button 
                size="small"
                variant="contained" 
                sx={{ 
                  background: showInactive ? "linear-gradient(90deg,#f59e0b,#f97316)" : "#eef0f4",
                  color: showInactive ? "#fff" : "#64748b",
                  textTransform: "none", 
                  fontSize: 12,
                  borderRadius: 2,
                  boxShadow: showInactive ? "0 3px 10px rgba(245,158,11,0.3)" : "none",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "translateY(-1px)", bgcolor: showInactive ? undefined : "#e2e5ec" }
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
                  background: "linear-gradient(90deg,#06b6d4,#6366f1)",
                  color: "#fff",
                  textTransform: "none", 
                  fontSize: 12,
                  borderRadius: 2,
                  boxShadow: "0 3px 10px rgba(6,182,212,0.35)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 5px 16px rgba(6,182,212,0.45)" },
                }}
                onClick={handleOpenDialog}
              >
                Add timing
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={26} sx={{ color: "#06b6d4" }} />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Period</TableCell>
                  <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Start time</TableCell>
                  <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>End time</TableCell>
                  <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: "#f4f5fb", fontSize: 10.5, fontWeight: 700, color: "#4c4f6b" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTimings.length > 0 ? (
                  filteredTimings.map((row, index) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        animation: "fadeSlideUp 0.35s ease both",
                        animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
                        transition: "background-color 0.2s ease",
                        "&:hover": { bgcolor: "#f2fdff" },
                      }}
                    >
                      <TableCell sx={{ fontSize: 12 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENTS[index % ACCENTS.length], flexShrink: 0 }} />
                          {row.period || "-"}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {row.startTime || "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {row.endTime || "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
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
                      <TableCell sx={{ fontSize: 12 }}>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
                        <Typography sx={{ color: "#a0aec0", fontSize: 12.5 }}>No data</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={DialogTransition}
        PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 12px 40px rgba(6,182,212,0.2)" } }}
      >
        <DialogTitle sx={{ color: "#0891b2", fontWeight: 800, fontSize: 14, pb: 1 }}>
          {editing ? "Edit timing" : "Add timing"}
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
              <TextField
                fullWidth
                size="small"
                label="Period *"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                required
                sx={{
                  "& .MuiInputBase-input": { fontSize: 12.5 },
                  "& .MuiInputLabel-root": { fontSize: 12.5 },
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Start time *"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  "& .MuiInputBase-input": { fontSize: 12.5 },
                  "& .MuiInputLabel-root": { fontSize: 12.5 },
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="End time *"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  "& .MuiInputBase-input": { fontSize: 12.5 },
                  "& .MuiInputLabel-root": { fontSize: 12.5 },
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: 12.5 }}>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{ borderRadius: 2, fontSize: 12.5 }}
                >
                  <MenuItem value="Active" sx={{ fontSize: 12.5 }}>Active</MenuItem>
                  <MenuItem value="Inactive" sx={{ fontSize: 12.5 }}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button 
            onClick={handleCloseDialog}
            size="small"
            sx={{ textTransform: "none", color: "#64748b", fontSize: 12.5 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={!formData.period || !formData.startTime || !formData.endTime}
            sx={{ 
              background: "linear-gradient(90deg,#06b6d4,#6366f1)",
              color: "#fff",
              textTransform: "none", 
              fontSize: 12.5,
              borderRadius: 2,
              boxShadow: "0 3px 10px rgba(6,182,212,0.35)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": { transform: "translateY(-1px)", boxShadow: "0 5px 16px rgba(6,182,212,0.45)" },
              "&:disabled": { background: "#e2e5ec", color: "#9e9e9e", boxShadow: "none" }
            }}
          >
            {editing ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}