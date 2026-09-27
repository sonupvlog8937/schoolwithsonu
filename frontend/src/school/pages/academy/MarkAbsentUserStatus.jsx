import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Grow,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import { fetchAcademicModule } from "../../../state/academicModuleSlice";

export default function MarkAbsentUserStatus() {
  const dispatch = useDispatch();
  const { modules, loading } = useSelector((state) => state.academicModule);
  const absentStatusData = modules["absent-status"] || [];

  const [studentForm, setStudentForm] = useState({
    date: new Date().toISOString().split("T")[0],
    sendMessage: false,
  });

  const [staffForm, setStaffForm] = useState({
    date: new Date().toISOString().split("T")[0],
    sendMessage: false,
  });

  useEffect(() => {
    dispatch(fetchAcademicModule("absent-status"));
  }, [dispatch]);

  const handleStudentSubmit = () => {
    console.log("Student absent status submitted:", studentForm);
    // API call to submit student absent status
  };

  const handleStaffSubmit = () => {
    console.log("Staff absent status submitted:", staffForm);
    // API call to submit staff absent status
  };

  const cardShell = {
    borderRadius: "16px",
    border: "1px solid #ede9fe",
    boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
    height: "100%",
    transition: "box-shadow 0.25s ease",
    "&:hover": { boxShadow: "0 8px 28px rgba(124,58,237,0.14)" },
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontSize: 13,
      transition: "border-color 0.2s ease",
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#7c3aed" },
    },
    "& .MuiInputLabel-root": { fontSize: 12.5 },
  };

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
      }}
    >
      <Grid container spacing={2.5}>
        {/* Student Status Card */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={400}>
            <Card sx={{ ...cardShell, animation: "fadeSlideIn 0.4s ease" }}>
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
                    <PersonOffRoundedIcon sx={{ color: "#fff", fontSize: 16 }} />
                  </Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#7c3aed", letterSpacing: 0.2 }}>
                    Mark Absent Student Status
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Date"
                      type="date"
                      value={studentForm.date}
                      onChange={(e) => setStudentForm({ ...studentForm, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={studentForm.sendMessage}
                          onChange={(e) => setStudentForm({ ...studentForm, sendMessage: e.target.checked })}
                          sx={{ color: "#a78bfa", "&.Mui-checked": { color: "#7c3aed" } }}
                        />
                      }
                      label={<Typography sx={{ fontSize: 13 }}>Send Message</Typography>}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleStudentSubmit}
                      sx={{
                        background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        "&:hover": {
                          background: "linear-gradient(135deg, #6d28d9, #0891b2)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 16px rgba(124,58,237,0.4)",
                        },
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

        {/* Staff Status Card */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={550}>
            <Card sx={{ ...cardShell, animation: "fadeSlideIn 0.5s ease" }}>
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
                      background: "linear-gradient(135deg, #db2777, #f472b6)",
                      boxShadow: "0 4px 10px rgba(219,39,119,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <BadgeRoundedIcon sx={{ color: "#fff", fontSize: 16 }} />
                  </Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#db2777", letterSpacing: 0.2 }}>
                    Mark Absent Staff Status
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Date"
                      type="date"
                      value={staffForm.date}
                      onChange={(e) => setStaffForm({ ...staffForm, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        ...fieldSx,
                        "& .MuiOutlinedInput-root": {
                          ...fieldSx["& .MuiOutlinedInput-root"],
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#f472b6" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#db2777" },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={staffForm.sendMessage}
                          onChange={(e) => setStaffForm({ ...staffForm, sendMessage: e.target.checked })}
                          sx={{ color: "#f9a8d4", "&.Mui-checked": { color: "#db2777" } }}
                        />
                      }
                      label={<Typography sx={{ fontSize: 13 }}>Send Message</Typography>}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleStaffSubmit}
                      sx={{
                        background: "linear-gradient(135deg, #db2777, #f472b6)",
                        color: "#fff",
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(219,39,119,0.3)",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        "&:hover": {
                          background: "linear-gradient(135deg, #be185d, #ec4899)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 16px rgba(219,39,119,0.4)",
                        },
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
      </Grid>
    </Box>
  );
}