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
  Grid,
} from "@mui/material";
import { Add, Edit, Delete, Download, CloudUpload } from "@mui/icons-material";
import axios from "axios";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const StudyMaterialList = () => {
  useDocumentTitle("Study Material");
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    title: "",
    description: "",
    content_type: "PDF",
    file_url: "",
  });

  useEffect(() => {
    fetchMaterials();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/study-material/all");
      setMaterials(response.data.data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setSnackbar({ open: true, message: "Error fetching materials", severity: "error" });
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

  const handleOpenDialog = (material = null) => {
    if (material) {
      setSelectedMaterial(material);
      setFormData({
        classId: material.class?._id || "",
        subjectId: material.subject?._id || "",
        title: material.title || "",
        description: material.description || "",
        content_type: material.content_type || "PDF",
        file_url: material.file_url || "",
      });
    } else {
      setSelectedMaterial(null);
      setFormData({
        classId: "",
        subjectId: "",
        title: "",
        description: "",
        content_type: "PDF",
        file_url: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMaterial(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        class: formData.classId,
        subject: formData.subjectId,
        title: formData.title,
        description: formData.description,
        content_type: formData.content_type,
        file_url: formData.file_url,
      };

      if (selectedMaterial) {
        await axios.put(`/api/study-material/${selectedMaterial._id}`, payload);
        setSnackbar({ open: true, message: "Material updated successfully", severity: "success" });
      } else {
        await axios.post("/api/study-material/upload", payload);
        setSnackbar({ open: true, message: "Material uploaded successfully", severity: "success" });
      }
      handleCloseDialog();
      fetchMaterials();
    } catch (error) {
      console.error("Error saving material:", error);
      setSnackbar({ open: true, message: "Error saving material", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await axios.delete(`/api/study-material/${id}`);
        setSnackbar({ open: true, message: "Material deleted successfully", severity: "success" });
        fetchMaterials();
      } catch (error) {
        console.error("Error deleting material:", error);
        setSnackbar({ open: true, message: "Error deleting material", severity: "error" });
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      await axios.post(`/api/study-material/${id}/download`);
      setSnackbar({ open: true, message: "Download recorded", severity: "success" });
      fetchMaterials();
    } catch (error) {
      console.error("Error recording download:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Study Material</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Upload Material
        </Button>
      </Box>

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
                <TableCell>Type</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Downloads</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No study materials found
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material._id}>
                    <TableCell>{material.title}</TableCell>
                    <TableCell>{material.class?.class_text}</TableCell>
                    <TableCell>{material.subject?.subject_name}</TableCell>
                    <TableCell>
                      <Chip label={material.content_type} size="small" />
                    </TableCell>
                    <TableCell>{material.teacher?.name}</TableCell>
                    <TableCell>{new Date(material.upload_date).toLocaleDateString()}</TableCell>
                    <TableCell>{material.downloads}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleDownload(material._id)}>
                        <Download />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(material)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(material._id)}>
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
        <DialogTitle>{selectedMaterial ? "Edit Material" : "Upload Material"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Content Type"
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                required
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="Video">Video</MenuItem>
                <MenuItem value="Document">Document</MenuItem>
                <MenuItem value="Link">Link</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="File URL"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedMaterial ? "Update" : "Upload"}
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

export default StudyMaterialList;
