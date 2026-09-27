/* eslint-disable react-hooks/exhaustive-deps */
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  } from "@mui/material";
  import { useFormik } from "formik";
  import { useEffect, useState } from "react";
  import axios from "axios";
  import { baseUrl } from "../../../environment";
  import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
  import { subjectSchema } from "../../../yupSchema/subjectSchema";
  import PageHeader from "../../ui/PageHeader";
  import SectionCard from "../../ui/SectionCard";
  import EmptyState from "../../ui/EmptyState";
  import LoadingBlock from "../../ui/LoadingBlock";
  import EditIcon from "@mui/icons-material/Edit";
  import DeleteIcon from "@mui/icons-material/Delete";
  
  export default function Subject() {
    const [studentSubject, setStudentSubject] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [query, setQuery] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  
   
  
    
  
    const requestDelete = (id) => setConfirmDeleteId(id);
    const handleDelete = () => {
      const id = confirmDeleteId;
      if (!id) return;
      axios
        .delete(`${baseUrl}/subject/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Failed to delete subject.");
          setType("error");
          console.log("Error, deleting", e);
        })
        .finally(() => setConfirmDeleteId(null));
    };
    const handleEdit = (id) => {
      console.log("Handle  Edit is called", id);
      setEdit(true);
      axios.get(`${baseUrl}/subject/fetch-single/${id}`)
        .then((resp) => {
          Formik.setFieldValue("subject_name", resp.data.data.subject_name);
          Formik.setFieldValue("subject_codename", resp.data.data.subject_codename);
          setEditId(resp.data.data._id);
        })
        .catch((e) => {
          console.log("Error  in fetching edit data.");
        });
    };
  
    const cancelEdit = () => {
      setEdit(false);
    Formik.resetForm()
    };
  
    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");
  
    const resetMessage = () => {
      setMessage("");
    };
  
    const initialValues = {
      subject_name: "",
      subject_codename:""
    };
    const Formik = useFormik({
      initialValues: initialValues,
      validationSchema: subjectSchema,
      onSubmit: (values) => {
        if (isEdit) {
          console.log("edit id", editId);
          axios
            .patch(`${baseUrl}/subject/update/${editId}`, {
              ...values,
            })
            .then((resp) => {
              console.log("Edit submit", resp);
              setMessage(resp.data.message);
              setType("success");
              cancelEdit();
            })
            .catch((e) => {
              setMessage(e.response.data.message);
              setType("error");
              console.log("Error, edit casting submit", e);
            });
        } else {
        
            axios
              .post(`${baseUrl}/subject/create`,{...values})
              .then((resp) => {
                console.log("Response after submitting admin casting", resp);
                setMessage(resp.data.message);
                setType("success");
              })
              .catch((e) => {
                setMessage(e.response.data.message);
                setType("error");
                console.log("Error, response admin casting calls", e);
              });
            Formik.resetForm();
          
        }
      },
    });
  
    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);
    const fetchStudentSubject = () => {
      // axios
      //   .get(`${baseUrl}/casting/get-month-year`)
      //   .then((resp) => {
      //     console.log("Fetching month and year.", resp);
      //     setMonth(resp.data.month);
      //     setYear(resp.data.year);
      //   })
      //   .catch((e) => {
      //     console.log("Error in fetching month and year", e);
      //   });
    };
  
    const fetchstudentssubject = () => {
      setLoading(true);
      setLoadError("");
      axios
        .get(`${baseUrl}/subject/fetch-all`)
        .then((resp) => {
          setStudentSubject(resp.data.data || []);
        })
        .catch((e) => {
          console.log("Error in fetching subjects", e);
          setLoadError("Unable to load subjects right now.");
          setStudentSubject([]);
        })
        .finally(() => setLoading(false));
    };
    useEffect(() => {
      fetchstudentssubject();
      fetchStudentSubject();
    }, [message]);
    const filtered = (studentSubject || []).filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return `${s.subject_name || ""} ${s.subject_codename || ""}`.toLowerCase().includes(q);
    });

    return (
      <>
        {message && (
          <CustomizedSnackbars
            reset={resetMessage}
            type={type}
            message={message}
          />
        )}
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <PageHeader
            title="Subjects"
            subtitle="Create and manage subjects (name + code)."
            breadcrumbs={[{ label: "School", to: "/school" }, { label: "Subjects" }]}
            actions={
              <Button
                variant="contained"
                onClick={() => {
                  cancelEdit();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900, boxShadow: "none" }}
              >
                Add subject
              </Button>
            }
          />

          <SectionCard sx={{ mb: 2.25 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {isEdit ? "Edit subject" : "Add new subject"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Use a short codename like MATH, SCI, ENG.
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Subject name"
                  variant="outlined"
                  name="subject_name"
                  value={Formik.values.subject_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  error={Boolean(Formik.touched.subject_name && Formik.errors.subject_name)}
                  helperText={Formik.touched.subject_name && Formik.errors.subject_name ? Formik.errors.subject_name : "e.g. Mathematics"}
                />

                <TextField
                  fullWidth
                  label="Subject code"
                  variant="outlined"
                  name="subject_codename"
                  value={Formik.values.subject_codename}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  error={Boolean(Formik.touched.subject_codename && Formik.errors.subject_codename)}
                  helperText={
                    Formik.touched.subject_codename && Formik.errors.subject_codename
                      ? Formik.errors.subject_codename
                      : "e.g. MATH"
                  }
                />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900, boxShadow: "none" }}>
                    {isEdit ? "Save changes" : "Create subject"}
                  </Button>
                  {isEdit ? (
                    <Button onClick={cancelEdit} variant="outlined" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}>
                      Cancel
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </Box>
          </SectionCard>

          <SectionCard>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  All subjects
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {loading ? "Loading..." : `${filtered.length} subject${filtered.length === 1 ? "" : "s"}`}
                </Typography>
              </Box>
              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="small"
                placeholder="Search subjects..."
                sx={{ width: { xs: "100%", sm: 280 } }}
              />
            </Stack>

            {loadError ? <Alert severity="warning" sx={{ mt: 2 }}>{loadError}</Alert> : null}
            <Divider sx={{ my: 2 }} />

            {loading ? (
              <LoadingBlock rows={6} />
            ) : filtered.length === 0 ? (
              <EmptyState title="No subjects found" subtitle="Create a subject to start assigning periods and exams." actionLabel="Clear search" onAction={() => setQuery("")} />
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
                <Table sx={{ minWidth: 650 }} aria-label="subjects table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">Code</TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((value) => (
                      <TableRow key={value._id} hover>
                        <TableCell sx={{ fontWeight: 800 }}>{value.subject_name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "text.secondary" }}>
                          {value.subject_codename}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEdit(value._id)} color="primary">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => requestDelete(value._id)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </Container>

        <Dialog open={Boolean(confirmDeleteId)} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>Delete subject?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900, boxShadow: "none" }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
  