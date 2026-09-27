import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Add, Delete, Refresh } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createCommunication, deleteCommunication, fetchCommunication, sendCommunication, clearCommunicationNotice } from "../../../state/communicationSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

const labels = {
  "group-message": "Group Message", "particular-student": "Particular Student", "particular-staff": "Particular Staff",
  "particular-number-sms": "Send SMS to Numbers", "particular-email": "Send Email to Addresses", homework: "Homework",
  holidays: "Holidays", events: "Events", "academic-calendar": "Academic Calendar", birthday: "Student Birthday",
  gallery: "Photo Gallery", "hobby-group-members": "Student Hobby Group", circular: "Circular", popups: "App Popups",
  "home-content": "Home Content", "sms-student-username": "SMS Student Username", "sms-staff-username": "SMS Staff Username",
};
const messageResources = new Set(["group-message", "particular-student", "particular-staff", "particular-number-sms", "particular-email"]);
const isEmail = (resource) => resource === "particular-email";

const CommunicationPage = ({ resource: resourceProp }) => {
  const params = useParams();
  const resource = resourceProp || params.resource || "group-message";
  const dispatch = useDispatch();
  const { records, loading, saving, error, success } = useSelector((state) => state.communication);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", recipients: "", subject: "", fromDate: "", toDate: "", className: "", section: "" });
  const title = labels[resource] || "Communication";
  useDocumentTitle(title);

  useEffect(() => { dispatch(fetchCommunication(resource)); }, [dispatch, resource]);
  useEffect(() => () => dispatch(clearCommunicationNotice()), [dispatch, resource]);

  const columns = useMemo(() => {
    if (messageResources.has(resource)) return ["channel", "recipients", "subject", "message", "sentAt"];
    if (resource === "academic-calendar") return ["title", "fromDate", "toDate", "type", "status"];
    if (["holidays", "events", "circular", "popups"].includes(resource)) return ["title", "message", "fromDate", "toDate", "status"];
    return ["title", "message", "className", "section", "status"];
  }, [resource]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const save = () => {
    if (messageResources.has(resource)) {
      const recipients = form.recipients.split(",").map((value) => value.trim()).filter(Boolean);
      dispatch(sendCommunication({ channel: isEmail(resource) ? "email" : "sms", recipients, message: form.message, subject: form.subject }));
    } else {
      dispatch(createCommunication({ resource, data: { ...form, status: "Active" } }));
    }
    setOpen(false);
    setForm({ title: "", message: "", recipients: "", subject: "", fromDate: "", toDate: "", className: "", section: "" });
  };

  return <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: "#f3f5f9", minHeight: "calc(100vh - 64px)" }}>
    <Card sx={{ borderRadius: 2, boxShadow: "0 8px 24px rgba(25, 35, 55, .06)" }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2}>
          <Box><Typography variant="h6" color="error.main" fontWeight={700}>{title}</Typography><Typography variant="body2" color="text.secondary">Manage school communication records</Typography></Box>
          <Stack direction="row" gap={1}><Button startIcon={<Refresh />} onClick={() => dispatch(fetchCommunication(resource))}>Refresh</Button><Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add</Button></Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {loading ? <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}><CircularProgress /></Box> : <TableContainer><Table size="small"><TableHead><TableRow>{columns.map((column) => <TableCell key={column}>{column.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</TableCell>)}<TableCell>Action</TableCell></TableRow></TableHead><TableBody>{records.length ? records.map((record) => <TableRow key={record._id}>{columns.map((column) => <TableCell key={column} sx={{ maxWidth: 260 }}>{String(record.data?.[column] ?? record[column] ?? "-")}</TableCell>)}<TableCell><IconButton color="error" onClick={() => dispatch(deleteCommunication({ resource, id: record._id }))}><Delete /></IconButton></TableCell></TableRow>) : <TableRow><TableCell colSpan={columns.length + 1} align="center" sx={{ py: 8, color: "text.secondary" }}>No data</TableCell></TableRow>}</TableBody></Table></TableContainer>}
      </CardContent>
    </Card>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{title}</DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}>{messageResources.has(resource) ? <><Grid item xs={12}><TextField label={isEmail(resource) ? "Email addresses" : "Phone numbers"} placeholder="comma separated" value={form.recipients} onChange={update("recipients")} fullWidth required /></Grid>{isEmail(resource) && <Grid item xs={12}><TextField label="Subject" value={form.subject} onChange={update("subject")} fullWidth /></Grid>}<Grid item xs={12}><TextField label="Message" value={form.message} onChange={update("message")} fullWidth multiline minRows={5} required /></Grid></> : <><Grid item xs={12}><TextField label="Title" value={form.title} onChange={update("title")} fullWidth /></Grid><Grid item xs={12}><TextField label="Message / description" value={form.message} onChange={update("message")} fullWidth multiline minRows={4} /></Grid><Grid item xs={6}><TextField label="From date" type="date" value={form.fromDate} onChange={update("fromDate")} fullWidth InputLabelProps={{ shrink: true }} /></Grid><Grid item xs={6}><TextField label="To date" type="date" value={form.toDate} onChange={update("toDate")} fullWidth InputLabelProps={{ shrink: true }} /></Grid></>}</Grid></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" disabled={saving} onClick={save}>{saving ? "Saving..." : messageResources.has(resource) ? "Send" : "Save"}</Button></DialogActions></Dialog>
    <Snackbar open={Boolean(error || success)} autoHideDuration={4000} onClose={() => dispatch(clearCommunicationNotice())}><Alert severity={error ? "error" : "success"}>{error || success}</Alert></Snackbar>
  </Box>;
};

CommunicationPage.propTypes = { resource: PropTypes.string };

export default CommunicationPage;