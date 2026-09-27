/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  IconButton,
  Container,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Tooltip,
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { classSchema } from "../../../yupSchema/classSchema";
import PageHeader from "../../ui/PageHeader";
import SectionCard from "../../ui/SectionCard";
import EmptyState from "../../ui/EmptyState";
import LoadingBlock from "../../ui/LoadingBlock";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Class() {
  const [studentClass, setStudentClass] = useState([]);
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
      .delete(`${baseUrl}/class/delete/${id}`)
      .then((resp) => {
        setMessage(resp.data.message);
        setType("success");
      })
      .catch((e) => {
        setMessage(e.response?.data?.message || "Failed to delete class.");
        setType("error");
        console.log("Error, deleting", e);
      })
      .finally(() => setConfirmDeleteId(null));
  };
  const handleEdit = (id) => {
    console.log("Handle  Edit is called", id);
    setEdit(true);
    axios
      .get(`${baseUrl}/class/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("class_num", resp.data.data.class_num);
        Formik.setFieldValue("class_text", resp.data.data.class_text);
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
    class_num: "",
    class_text:""
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: classSchema,
    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);
        axios
          .patch(`${baseUrl}/class/update/${editId}`, {
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
            .post(`${baseUrl}/class/create`,{...values})
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
  const fetchStudentClass = () => {
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

  const fetchstudentsClass = () => {
    setLoading(true);
    setLoadError("");
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setStudentClass(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching class data", e);
        setLoadError("Unable to load classes right now.");
        setStudentClass([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchstudentsClass();
    fetchStudentClass();
  }, [message]);
  const filtered = (studentClass || []).filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${c.class_text || ""} ${c.class_num || ""}`.toLowerCase().includes(q);
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
          title="Classes"
          subtitle="Create and manage classes for your school."
          breadcrumbs={[{ label: "School", to: "/school" }, { label: "Classes" }]}
          actions={
            <Button
              variant="contained"
              onClick={() => {
                cancelEdit();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900, boxShadow: "none" }}
            >
              Add class
            </Button>
          }
        />

        <SectionCard sx={{ mb: 2.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {isEdit ? "Edit class" : "Add new class"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Provide class label and class number.
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                label="Class name"
                variant="outlined"
                name="class_text"
                value={Formik.values.class_text}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Boolean(Formik.touched.class_text && Formik.errors.class_text)}
                helperText={Formik.touched.class_text && Formik.errors.class_text ? Formik.errors.class_text : "e.g. Class 1"}
              />

              <TextField
                fullWidth
                label="Class number"
                variant="outlined"
                name="class_num"
                value={Formik.values.class_num}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Boolean(Formik.touched.class_num && Formik.errors.class_num)}
                helperText={Formik.touched.class_num && Formik.errors.class_num ? Formik.errors.class_num : "e.g. 1"}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 900, boxShadow: "none" }}>
                  {isEdit ? "Save changes" : "Create class"}
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
                All classes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? "Loading..." : `${filtered.length} class${filtered.length === 1 ? "" : "es"}`}
              </Typography>
            </Box>
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              placeholder="Search classes..."
              sx={{ width: { xs: "100%", sm: 280 } }}
            />
          </Stack>

          {loadError ? <Alert severity="warning" sx={{ mt: 2 }}>{loadError}</Alert> : null}
          <Divider sx={{ my: 2 }} />

          {loading ? (
            <LoadingBlock rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No classes yet" subtitle="Create your first class to start managing students and schedules." actionLabel="Clear search" onAction={() => setQuery("")} />
          ) : (
            <Stack spacing={1}>
              {filtered.map((value) => (
                <Paper
                  key={value._id}
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 900 }}>
                      {value.class_text} <Typography component="span" color="text.secondary" sx={{ fontWeight: 800 }}>[{value.class_num}]</Typography>
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
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
                </Paper>
              ))}
            </Stack>
          )}
        </SectionCard>
      </Container>

      <Dialog open={Boolean(confirmDeleteId)} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Delete class?</DialogTitle>
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
