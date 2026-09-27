import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Grow,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchAcademicModule } from "../../../state/academicModuleSlice";

// One accent colour per weekday column so the grid reads as a calendar,
// not a flat grey table.
const DAY_ACCENTS = [
  { bg: "linear-gradient(135deg, #7c3aed, #a78bfa)" }, // Monday - violet
  { bg: "linear-gradient(135deg, #0891b2, #22d3ee)" }, // Tuesday - cyan
  { bg: "linear-gradient(135deg, #db2777, #f472b6)" }, // Wednesday - pink
  { bg: "linear-gradient(135deg, #16a34a, #4ade80)" }, // Thursday - green
  { bg: "linear-gradient(135deg, #ea580c, #fb923c)" }, // Friday - orange
  { bg: "linear-gradient(135deg, #4f46e5, #818cf8)" }, // Saturday - indigo
];

export default function StudentTimetableView() {
  console.log("=== StudentTimetableView component rendering ===");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { classId } = useParams();
  console.log("classId from useParams:", classId);
  const { modules, loading } = useSelector((state) => state.academicModule);
  console.log("Redux state:", { modules, loading });
  const periods = modules["timing"] || [];
  console.log("Periods:", periods);

  const [classData, setClassData] = useState(null);

  useEffect(() => {
    console.log("=== StudentTimetableView useEffect ===");
    console.log("classId:", classId);
    if (classId) {
      console.log("Fetching timing data...");
      dispatch(fetchAcademicModule("timing"));
      const stateClassData = window.history?.state?.state?.classData;
      console.log("Class data from state:", stateClassData);
      if (stateClassData) {
        setClassData(stateClassData);
      } else {
        setClassData({ class_text: `CLASS-ID: ${classId}` });
      }
    } else {
      console.log("No classId provided");
    }
  }, [dispatch, classId]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/school/academics/student-timetable");
  };

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #faf9ff 0%, #f4f7fb 100%)",
          p: { xs: 2, md: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#7c3aed" }} />
        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Loading timetable…</Typography>
      </Box>
    );
  }

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
      <Grow in timeout={400}>
        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid #ede9fe",
            boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
            animation: "fadeSlideIn 0.4s ease",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
              <Box>
                <Button
                  startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
                  onClick={handleBack}
                  sx={{
                    color: "#7c3aed",
                    textTransform: "none",
                    fontSize: 11.5,
                    fontWeight: 600,
                    mb: 1,
                    px: 1,
                    borderRadius: "8px",
                    transition: "background-color 0.2s ease",
                    "&:hover": { bgcolor: "#f3e8ff" },
                  }}
                >
                  Back
                </Button>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                  Time Table{" "}
                  <Box component="span" sx={{ color: "#7c3aed" }}>
                    ({classData?.class_text || "SELECTED CLASS"})
                  </Box>
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                sx={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  color: "#fff",
                  textTransform: "none",
                  fontSize: 12.5,
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
                onClick={handlePrint}
              >
                Print
              </Button>
            </Stack>

            {periods.length > 0 ? (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          background: "linear-gradient(135deg, #1e293b, #334155)",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: "8px 0 0 0",
                        }}
                      >
                        PERIOD
                      </TableCell>
                      {days.map((day, idx) => (
                        <TableCell
                          key={day}
                          sx={{
                            background: DAY_ACCENTS[idx % DAY_ACCENTS.length].bg,
                            color: "#fff",
                            fontSize: 10.5,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                          }}
                        >
                          {day}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {periods.map((period, index) => (
                      <TableRow
                        key={period._id}
                        hover
                        sx={{
                          animation: "popIn 0.3s ease",
                          animationFillMode: "backwards",
                          animationDelay: `${Math.min(index * 40, 300)}ms`,
                          transition: "background-color 0.2s ease",
                          "&:hover": { bgcolor: "#faf5ff" },
                        }}
                      >
                        <TableCell sx={{ bgcolor: "#f8fafc", fontSize: 12, fontWeight: 700, color: "#334155" }}>
                          {period.period || `Period ${index + 1}`}
                        </TableCell>
                        {days.map((day) => (
                          <TableCell key={day} sx={{ fontSize: 12, color: "#94a3b8" }}>
                            -
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Fade in timeout={500}>
                <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
                  <Box sx={{ fontSize: 42, opacity: 0.35, mb: 1 }}>🗓️</Box>
                  <Typography sx={{ fontSize: 12.5 }}>No timetable data available</Typography>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}