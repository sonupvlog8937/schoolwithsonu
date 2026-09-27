import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Card, CardContent, CircularProgress, Fade, Grid, Grow, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ClassRoundedIcon from "@mui/icons-material/ClassRounded";
import { fetchAcademicModule, fetchClassesForDropdown } from "../../../state/academicModuleSlice";

// Rotating gradient palette so each class tile stands out on its own.
const TILE_ACCENTS = [
  "linear-gradient(135deg, #7c3aed, #a78bfa)",
  "linear-gradient(135deg, #0891b2, #22d3ee)",
  "linear-gradient(135deg, #db2777, #f472b6)",
  "linear-gradient(135deg, #16a34a, #4ade80)",
  "linear-gradient(135deg, #ea580c, #fb923c)",
  "linear-gradient(135deg, #4f46e5, #818cf8)",
];

export default function StudentTimetable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { modules, loading, dropdownData } = useSelector((state) => state.academicModule);
  const classes = dropdownData.classes || [];

  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    dispatch(fetchClassesForDropdown());
  }, [dispatch]);

  useEffect(() => {
    console.log("Classes data:", classes);
    console.log("Modules data:", modules);
    console.log("Dropdown data:", dropdownData);
  }, [classes, modules, dropdownData]);

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    navigate(`/school/academics/student-timetable/${classItem._id}`, { state: { classData: classItem } });
    console.log("Navigating to:", `/academics/student-timetable/${classItem._id}`);
  };

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
        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Loading classes…</Typography>
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
          "0%": { opacity: 0, transform: "scale(0.9)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      }}
    >
      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid #ede9fe",
          boxShadow: "0 4px 20px rgba(124,58,237,0.08)",
          animation: "fadeSlideIn 0.4s ease",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" gap={0.8} sx={{ mb: 3 }}>
            <Box sx={{ width: 6, height: 16, borderRadius: "4px", background: "linear-gradient(180deg, #7c3aed, #06b6d4)" }} />
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>
              Student Time Table
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {classes.length > 0 ? (
              classes.map((classItem, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={classItem._id}>
                  <Grow in timeout={300 + idx * 60}>
                    <Box
                      onClick={() => handleClassSelect(classItem)}
                      sx={{
                        cursor: "pointer",
                        background: TILE_ACCENTS[idx % TILE_ACCENTS.length],
                        color: "#fff",
                        borderRadius: "14px",
                        py: 2.2,
                        px: 1.5,
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.6,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                        transition: "transform 0.18s ease, box-shadow 0.18s ease",
                        "&:hover": {
                          transform: "translateY(-3px) scale(1.02)",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                        },
                        "&:active": { transform: "translateY(-1px) scale(0.99)" },
                      }}
                    >
                      <ClassRoundedIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                      {classItem.class_text}
                    </Box>
                  </Grow>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Fade in timeout={500}>
                  <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
                    <Box sx={{ fontSize: 42, opacity: 0.35, mb: 1 }}>🏫</Box>
                    <Typography sx={{ fontSize: 12.5 }}>No classes available</Typography>
                  </Box>
                </Fade>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}