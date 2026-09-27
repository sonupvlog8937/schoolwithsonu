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
import { clearReportNotice, createReport, deleteReport, fetchReport } from "../../../state/reportSlice";

const titles = {
  downloads: "Report Downloads",
  "campus-feed-engagement": "Campus Feed Engagement",
  "student-leave": "Student Leave Report",
  "receipt-wise-fee": "Receipt Wise Fee Collection",
  "fee-collected": "Fee Collected Report",
  "fee-discount": "Fee Discount Report",
  "fee-type-term-wise": "Fee Type/Term Wise Report",
  "datewise-fee-collected": "Datewise Fee Collected Report",
  "termwise-fee-collected": "Termwise Fee Collected Report",
  "fee-balance": "Fee Balance Report",
  "termwise-balance": "Termwise Balance Report",
  "fee-type-termwise-balance": "Fee Type/Termwise Balance Report",
  "fee-adjustment": "Fee Adjustment Report",
  "classwise-balance-summary": "Classwise Balance Summary",
  "term-wise-fee": "Term Wise Fee Report",
  "student-more-balance": "Student With More Balance",
  "fee-due-date": "Fee Due Date Report",
  "fee-rebate": "Fee Rebate Report",
  "deleted-fee-receipt": "Deleted Fee Receipt Report",
  "sell-summary": "Sell Summary Report",
  "purchase-summary": "Purchase Summary Report",
  "inventory-stock": "Inventory Stock Report",
  "route-student": "Route Student Report",
  "transport-stoppage-fee": "Transport Stoppage Fee Report",
};

const fields = {
  downloads: ["title", "type", "date", "status"],
  "campus-feed-engagement": ["title", "engagement", "date", "status"],
  "student-leave": ["studentName", "days", "reason", "status"],
  "receipt-wise-fee": ["receiptNo", "studentName", "amount", "status"],
  "fee-collected": ["studentName", "amount", "collectionDate", "status"],
  "fee-discount": ["studentName", "discount", "date", "status"],
  "fee-type-term-wise": ["feeType", "term", "amount", "status"],
  "datewise-fee-collected": ["date", "amount", "status"],
  "termwise-fee-collected": ["term", "amount", "status"],
  "fee-balance": ["studentName", "balance", "status"],
  "termwise-balance": ["term", "balance", "status"],
  "fee-type-termwise-balance": ["feeType", "term", "balance", "status"],
  "fee-adjustment": ["studentName", "adjustment", "date", "status"],
  "classwise-balance-summary": ["className", "balance", "status"],
  "term-wise-fee": ["term", "amount", "status"],
  "student-more-balance": ["studentName", "balance", "status"],
  "fee-due-date": ["studentName", "dueDate", "status"],
  "fee-rebate": ["studentName", "rebate", "status"],
  "deleted-fee-receipt": ["receiptNo", "deletedAt", "status"],
  "sell-summary": ["itemName", "units", "amount", "status"],
  "purchase-summary": ["itemName", "units", "amount", "status"],
  "inventory-stock": ["itemName", "stock", "status"],
  "route-student": ["routeName", "studentName", "status"],
  "transport-stoppage-fee": ["routeName", "amount", "status"],
};

const pretty = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

export default function ReportResource({ fixedResource }) {
  const params = useParams();
  const resource = fixedResource || params.resource || "downloads";
  const dispatch = useDispatch();
  const { records, summary, loading, saving, error, success } = useSelector((state) => state.report);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const list = fields[resource] || fields.downloads;

  useEffect(() => {
    dispatch(fetchReport(resource));
  }, [dispatch, resource]);

  const save = () => {
    dispatch(createReport({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f3f5f9", minHeight: "calc(100vh - 64px)" }}>
      <Card sx={{ maxWidth: 1260, mx: "auto" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
            <Typography variant="h6" color="primary.main" fontWeight={700}>{titles[resource] || "Reports"}</Typography>
            <Stack direction="row" gap={1}>
              <Button startIcon={<Refresh />} onClick={() => dispatch(fetchReport(resource))}>Refresh</Button>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add</Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ my: 2 }}>
            {Object.entries(summary || {}).map(([key, value]) => (
              <Box key={key} sx={{ flex: 1, p: 1.5, borderRadius: 1, background: "#f7f9fc" }}>
                <Typography fontSize={12} color="text.secondary">{pretty(key)}</Typography>
                <Typography fontWeight={700}>{value}</Typography>
              </Box>
            ))}
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
                        <IconButton color="error" onClick={() => dispatch(deleteReport({ resource, id: record._id }))}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={list.length + 2} align="center" sx={{ py: 8, color: "text.secondary" }}>
                      No {titles[resource] || "report"} records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {titles[resource] || "Reports"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {list.map((field) => (
              <TextField
                key={field}
                label={pretty(field)}
                value={form[field] || ""}
                onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
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

      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => dispatch(clearReportNotice())}>
        <Alert severity="error" onClose={() => dispatch(clearReportNotice())}>{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => dispatch(clearReportNotice())}>
        <Alert severity="success" onClose={() => dispatch(clearReportNotice())}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}

ReportResource.propTypes = {
  fixedResource: PropTypes.string,
};
