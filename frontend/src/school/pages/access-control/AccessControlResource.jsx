import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Snackbar, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Add, Delete, Refresh } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { clearAccessControlNotice, createAccessControl, deleteAccessControl, fetchAccessControl } from "../../../state/accessControlSlice";

const titles = { control: "Access Control" };
const fields = { control: ["name", "role", "status"] };
const pretty = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

export default function AccessControlResource({ fixedResource }) {
  const params = useParams();
  const resource = fixedResource || params.resource || "control";
  const dispatch = useDispatch();
  const { records, loading, saving, error, success } = useSelector((state) => state.accessControl);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const list = fields[resource] || fields.control;

  useEffect(() => { dispatch(fetchAccessControl(resource)); }, [dispatch, resource]);

  const save = () => {
    dispatch(createAccessControl({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f3f5f9", minHeight: "calc(100vh - 64px)" }}>
      <Card sx={{ maxWidth: 1260, mx: "auto" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
            <Typography variant="h6" color="primary.main" fontWeight={700}>{titles[resource] || "Access Control"}</Typography>
            <Stack direction="row" gap={1}><Button startIcon={<Refresh />} onClick={() => dispatch(fetchAccessControl(resource))}>Refresh</Button><Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add</Button></Stack>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {loading ? <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}><CircularProgress /></Box> : (
            <Table size="small">
              <TableHead><TableRow><TableCell>S.No</TableCell>{list.map((field) => <TableCell key={field}>{pretty(field)}</TableCell>)}<TableCell>Action</TableCell></TableRow></TableHead>
              <TableBody>
                {records.length ? records.map((record, index) => (
                  <TableRow key={record._id || `${resource}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    {list.map((field) => <TableCell key={`${field}-${record._id || index}`}>{String(record.data?.[field] ?? record[field] ?? "-")}</TableCell>)}
                    <TableCell><IconButton color="error" onClick={() => dispatch(deleteAccessControl({ resource, id: record._id }))}><Delete /></IconButton></TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={list.length + 2} align="center" sx={{ py: 8, color: "text.secondary" }}>No {titles[resource] || "access control"} records found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {titles[resource] || "Access Control"}</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ mt: 1 }}>{list.map((field) => <TextField key={field} label={pretty(field)} value={form[field] || ""} onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))} fullWidth size="small" />)}</Stack></DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => dispatch(clearAccessControlNotice())}><Alert severity="error" onClose={() => dispatch(clearAccessControlNotice())}>{error}</Alert></Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => dispatch(clearAccessControlNotice())}><Alert severity="success" onClose={() => dispatch(clearAccessControlNotice())}>{success}</Alert></Snackbar>
    </Box>
  );
}
