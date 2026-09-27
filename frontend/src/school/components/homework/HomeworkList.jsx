import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";
import axios from "axios";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const HomeworkList = () => {
  useDocumentTitle("Homework List");
  const [homeworks, setHomeworks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    title: "",
    description: "",
    homework_date: "",
    submission_date: "",
  });

  useEffect(() => {
    fetchHomeworks();
    fetchClasses();
    fetchSubjects();
  }, [filterClass, filterSubject]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.classId = filterClass;
      if (filterSubject) params.subjectId = filterSubject;

      const response = await axios.get("/api/homework/all", { params });
      setHomeworks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      setSnackbar({ open: true, message: "Error fetching homeworks", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get("/api/class/all");
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("/api/subject/all");
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleOpenDialog = (homework = null) => {
    if (homework) {
      setSelectedHomework(homework);
      setFormData({
        classId: homework.class?._id || "",
        subjectId: homework.subject?._id || "",
        title: homework.title || "",
        description: homework.description || "",
        homework_date: homework.homework_date?.split("T")[0] || "",
        submission_date: homework.submission_date?.split("T")[0] || "",
      });
    } else {
      setSelectedHomework(null);
      setFormData({
        classId: "",
        subjectId: "",
        title: "",
        description: "",
        homework_date: "",
        submission_date: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHomework(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedHomework) {
        await axios.put(`/api/homework/${selectedHomework._id}`, formData);
        setSnackbar({ open: true, message: "Homework updated successfully", severity: "success" });
      } else {
        await axios.post("/api/homework/create", formData);
        setSnackbar({ open: true, message: "Homework created successfully", severity: "success" });
      }
      handleCloseDialog();
      fetchHomeworks();
    } catch (error) {
      console.error("Error saving homework:", error);
      setSnackbar({ open: true, message: "Error saving homework", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      try {
        await axios.delete(`/api/homework/${id}`);
        setSnackbar({ open: true, message: "Homework deleted successfully", severity: "success" });
        fetchHomeworks();
      } catch (error) {
        console.error("Error deleting homework:", error);
        setSnackbar({ open: true, message: "Error deleting homework", severity: "error" });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Completed":
        return "info";
      case "Expired":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Homework Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Homework
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            label="Filter by Class"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.class_text}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Filter by Subject"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Subjects</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject._id} value={subject._id}>
                {subject.subject_name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Homework Date</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {homeworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No homework found
                  </TableCell>
                </TableRow>
              ) : (
                homeworks.map((homework) => (
                  <TableRow key={homework._id}>
                    <TableCell>{homework.title}</TableCell>
                    <TableCell>{homework.class?.class_text}</TableCell>
                    <TableCell>{homework.subject?.subject_name}</TableCell>
                    <TableCell>{homework.teacher?.name}</TableCell>
                    <TableCell>{new Date(homework.homework_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(homework.submission_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={homework.status} color={getStatusColor(homework.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(homework)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(homework._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedHomework ? "Edit Homework" : "Add Homework"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              label="Class"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              required
            >
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.class_text}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Subject"
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              required
            >
              {subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.subject_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              required
            />

            <TextField
              label="Homework Date"
              type="date"
              value={formData.homework_date}
              onChange={(e) => setFormData({ ...formData, homework_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Submission Date"
              type="date"
              value={formData.submission_date}
              onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedHomework ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomizedSnackbars
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default HomeworkList;
