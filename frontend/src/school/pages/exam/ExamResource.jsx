import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Refresh } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { clearExamNotice, createExam, deleteExam, fetchExam } from "../../../state/examSlice";

const titles = {
  terms: "Exam Terms",
  "common-type": "Exam Common Type",
  type: "Exam Type",
  "grading-system": "Grading System",
  system: "Exam System",
  "co-scholastic-grade": "Co-Scholastic Grade System",
  "co-scholastic-area": "Co-Scholastic Area",
  schedule: "Exam Schedule",
  "online-exam": "Online Exam",
  "hall-ticket": "Hall Ticket",
  "marks-multi-subject": "Exam Marks Multi Subject",
  "subject-remarks-all": "Subject Remarks (All Subjects)",
  "subject-remarks": "Subject Remarks",
  marks: "Exam Marks",
  "co-scholastic-marks": "Co-Scholastic Marks",
  "marks-report": "Exam Marks Report",
  "report-card": "Report Card",
  "promote-structure": "Promote Exam Structure",
  "test-assignment": "Test Assignment",
  "bulk-attendance-update": "Bulk Attendance Update",
  "system-config": "Exam System Config",
};

const fields = {
  terms: ["name", "code", "session", "status"],
  "common-type": ["name", "description", "status"],
  type: ["name", "shortName", "status"],
  "grading-system": ["grade", "minMarks", "maxMarks", "description"],
  system: ["name", "description", "status"],
  "co-scholastic-grade": ["grade", "range", "description"],
  "co-scholastic-area": ["name", "description", "weightage"],
  schedule: ["examName", "className", "section", "date", "time", "status"],
  "online-exam": ["title", "subject", "date", "duration", "status"],
  "hall-ticket": ["studentName", "className", "admissionNo", "examName", "status"],
  "marks-multi-subject": ["studentName", "className", "subject", "marks", "status"],
  "subject-remarks-all": ["studentName", "className", "remark", "status"],
  "subject-remarks": ["studentName", "subject", "remark", "status"],
  marks: ["studentName", "className", "subject", "marks", "grade"],
  "co-scholastic-marks": ["studentName", "className", "area", "marks", "grade"],
  "marks-report": ["studentName", "className", "examName", "totalMarks", "percentage"],
  "report-card": ["studentName", "className", "session", "gradePoint", "status"],
  "promote-structure": ["fromClass", "toClass", "examType", "status"],
  "test-assignment": ["title", "subject", "assignedTo", "status"],
  "bulk-attendance-update": ["examName", "date", "attendanceStatus", "status"],
  "system-config": ["name", "value", "status"],
};

const pretty = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

export default function ExamResource({ fixedResource }) {
  const params = useParams();
  const resource = fixedResource || params.resource || "terms";
  const dispatch = useDispatch();
  const { records, loading, saving, error, success } = useSelector((state) => state.exam);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const list = fields[resource] || fields.terms;

  useEffect(() => {
    dispatch(fetchExam(resource));
  }, [dispatch, resource]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = () => {
    dispatch(createExam({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f3f5f9", minHeight: "calc(100vh - 64px)" }}>
      <Card sx={{ maxWidth: 1260, mx: "auto" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
            <Typography variant="h6" color="error.main" fontWeight={700}>{titles[resource] || "Exam"}</Typography>
            <Stack direction="row" gap={1}>
              <Button startIcon={<Refresh />} onClick={() => dispatch(fetchExam(resource))}>Refresh</Button>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add</Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  {list.map((field) => (
                    <TableCell key={field}>{pretty(field)}</TableCell>
                  ))}
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length ? (
                  records.map((record, index) => (
                    <TableRow key={record._id || `${resource}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      {list.map((field) => (
                        <TableCell key={`${field}-${record._id || index}`}>
                          {String(record.data?.[field] ?? record[field] ?? "-")}
                        </TableCell>
                      ))}
                      <TableCell>
                        <IconButton color="error" onClick={() => dispatch(deleteExam({ resource, id: record._id }))}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={list.length + 2} align="center" sx={{ py: 8, color: "text.secondary" }}>
                      No {titles[resource] || "exam"} records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {titles[resource] || "Exam"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {list.map((field) => (
              <TextField
                key={field}
                label={pretty(field)}
                value={form[field] || ""}
                onChange={(event) => handleChange(field, event.target.value)}
                fullWidth
                size="small"
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => dispatch(clearExamNotice())}>
        <Alert severity="error" onClose={() => dispatch(clearExamNotice())}>{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => dispatch(clearExamNotice())}>
        <Alert severity="success" onClose={() => dispatch(clearExamNotice())}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}

ExamResource.propTypes = {
  fixedResource: PropTypes.string,
};
