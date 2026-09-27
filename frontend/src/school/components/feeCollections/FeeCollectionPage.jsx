import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Stack, Typography, Avatar, Chip,
  IconButton, Paper, Alert, Snackbar, CircularProgress, Radio,
  RadioGroup, FormControlLabel, FormControl, FormLabel, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha, styled } from "@mui/material/styles";
import {
  ArrowBack, Print, Visibility, Close, CheckCircle,
} from "@mui/icons-material";
import {
  getStudentFeeDetails, collectFee, getStudentReceipts, clearFeeMessages,
} from "../../../state/feeCollectionSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  purple: "#7C3AED", purpleDark: "#6D28D9", white: "#FFFFFF",
  orange: "#F97316", green: "#059669", red: "#dc2626", gray: "#6B7280",
  lightPurple: "#F3E8FF", purple50: "#FAF5FF",
};

// ─── Styled ───────────────────────────────────────────────────────────────────
const Page = styled(Box)({ padding: "16px", minHeight: "100vh", background: `linear-gradient(135deg, ${C.purple50} 0%, ${C.white} 100%)` });
const Card = styled(Paper)({ background: C.white, border: `1px solid ${alpha(C.purple, 0.15)}`, borderRadius: 12 });
const Btn = styled(Button)({ borderRadius: 8, textTransform: "none", fontWeight: 600, fontSize: "0.8rem", padding: "6px 16px" });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FeeCollectionPage() {
  useDocumentTitle("Student Fees");
  const { studentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentFeeDetails, studentFeeLoading, receipts, submitLoading, error, successMsg } = useSelector((s) => s.feeCollection);

  const [selected, setSelected] = useState([]);
  const [collectDlg, setCollectDlg] = useState(false);
  const [receiptsDlg, setReceiptsDlg] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], paidAmount: "", discountAmount: "0", fineAmount: "0", paymentMode: "Cash", note: "" });

  useEffect(() => {
    if (studentId) {
      dispatch(getStudentFeeDetails(studentId));
      dispatch(getStudentReceipts(studentId));
    }
  }, [dispatch, studentId]);

  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => dispatch(clearFeeMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error, dispatch]);

  const student = studentFeeDetails?.student;
  const payments = studentFeeDetails?.payments || [];
  const summary = studentFeeDetails?.summary || {};

  const handleSelectAll = (e) => setSelected(e.target.checked ? payments.map((p) => p._id) : []);
  const handleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectedPayments = payments.filter((p) => selected.includes(p._id));
  const selectedTotal = selectedPayments.reduce((sum, p) => sum + p.totalAmount, 0);

  const handleCollect = async () => {
    if (!form.paidAmount || parseFloat(form.paidAmount) <= 0) return;
    const result = await dispatch(collectFee({ ...form, studentId }));
    if (collectFee.fulfilled.match(result)) {
      setCollectDlg(false);
      setSelected([]);
      setForm({ date: new Date().toISOString().split("T")[0], paidAmount: "", discountAmount: "0", fineAmount: "0", paymentMode: "Cash", note: "" });
      dispatch(getStudentFeeDetails(studentId));
      dispatch(getStudentReceipts(studentId));
    }
  };

  if (studentFeeLoading) return <Page><Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><CircularProgress sx={{ color: C.purple }} /></Box></Page>;
  if (!student) return <Page><Card sx={{ p: 4, textAlign: "center" }}><Typography>Student not found</Typography><Button onClick={() => navigate("/school/fee-collection")} sx={{ mt: 2 }}>Go Back</Button></Card></Page>;

  // Handle different student name formats
  const fullName = student.firstName 
    ? `${student.firstName} ${student.lastName || ""}`.trim()
    : student.studentName || "Unknown Student";

  return (
    <Page>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton onClick={() => navigate("/school/fee-collection")} sx={{ bgcolor: alpha(C.purple, 0.1), color: C.purple }}><ArrowBack /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", color: C.purple }}>Student Fees</Typography>
        <Chip label="Back" size="small" onClick={() => navigate("/school/fee-collection")} sx={{ ml: "auto", bgcolor: alpha(C.gray, 0.1), cursor: "pointer" }} />
      </Stack>

      {/* Student Info */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={{ xs: 12, sm: 2 }}>
            <Avatar 
              src={student.photo || student.profileImage} 
              sx={{ width: 80, height: 80, bgcolor: C.purple, fontSize: "2rem" }}
            >
              {fullName[0]?.toUpperCase()}
            </Avatar>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 10 }}>
            <Grid2 container spacing={1}>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Name</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{fullName}</Typography></Grid2>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Class (Section)</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{student.class?.className || "N/A"} ({student.section || "N/A"})</Typography></Grid2>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Father Name</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{student.fatherName || "N/A"}</Typography></Grid2>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Admission No</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{student.admissionNo || student.admissionNumber || "N/A"}</Typography></Grid2>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Mobile Number</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{student.mobileNumber || "N/A"}</Typography></Grid2>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Roll Number</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{student.rollNumber || "N/A"}</Typography></Grid2>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>Category</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{student.category || "N/A"}</Typography></Grid2>
              <Grid2 size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>RTE</Typography><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: student.rte ? C.green : C.red }}>{student.rte ? "Yes" : "No"}</Typography></Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Card>

      {/* Action Buttons */}
      <Card sx={{ p: 1.5, mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <Btn variant="outlined" startIcon={<Print />} disabled={selected.length === 0} sx={{ borderColor: C.gray, color: C.gray }}>Print Selected</Btn>
          <Btn variant="contained" startIcon={<CheckCircle />} disabled={selected.length === 0} onClick={() => setCollectDlg(true)} sx={{ bgcolor: C.orange, "&:hover": { bgcolor: "#ea580c" } }}>Collect Selected</Btn>
          <Btn variant="contained" startIcon={<Visibility />} onClick={() => setReceiptsDlg(true)} sx={{ bgcolor: C.green, "&:hover": { bgcolor: "#047857" } }}>View Receipts</Btn>
          <Chip label={`Total Due Amount ${fmt(0)}`} sx={{ bgcolor: alpha(C.red, 0.1), color: C.red, fontWeight: 700, fontSize: "0.75rem" }} />
          <Chip label={`Total Paid Amount ${fmt(summary.totalPaid || 0)}`} sx={{ bgcolor: alpha(C.green, 0.1), color: C.green, fontWeight: 700, fontSize: "0.75rem" }} />
          <Typography variant="caption" sx={{ ml: "auto", fontSize: "0.75rem", color: C.gray }}>Date: {fmtDate(new Date())}</Typography>
        </Stack>
      </Card>

      {/* Fee Table */}
      <Card sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(C.purple, 0.05) }}>
                <TableCell padding="checkbox"><Checkbox size="small" checked={selected.length === payments.length && payments.length > 0} onChange={handleSelectAll} sx={{ color: C.purple, "&.Mui-checked": { color: C.purple } }} /></TableCell>
                {["Fees Group", "Fees Code", "Due Date", "Status", "Amount (₹)", "Payment ID", "Mode", "Date", "Discount (₹)", "Fine (₹)", "Paid (₹)", "Balance (₹)", "Action"].map((h) => <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.7rem", color: C.gray, whiteSpace: "nowrap" }}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow><TableCell colSpan={14} align="center" sx={{ py: 4 }}><Typography sx={{ fontSize: "0.8rem", color: C.gray }}>No fees found</Typography></TableCell></TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell padding="checkbox"><Checkbox size="small" checked={selected.includes(p._id)} onChange={() => handleSelect(p._id)} sx={{ color: C.purple, "&.Mui-checked": { color: C.purple } }} /></TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>Balance Master</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>Previous Session Balance</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{fmtDate(p.date)}</TableCell>
                    <TableCell><Chip label={p.status} size="small" color={p.status === "Paid" ? "success" : "warning"} sx={{ fontSize: "0.65rem", height: 20 }} /></TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{fmt(p.totalAmount)}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{p.paymentId || "—"}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{p.paymentMode}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{fmtDate(p.date)}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{fmt(p.discountAmount)}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{fmt(p.fineAmount)}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600, color: C.green }}>{fmt(p.paidAmount)}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{fmt(p.totalAmount - p.paidAmount)}</TableCell>
                    <TableCell><IconButton size="small" sx={{ color: C.purple }}><Visibility sx={{ fontSize: 16 }} /></IconButton></TableCell>
                  </TableRow>
                ))
              )}
              {payments.length > 0 && (
                <TableRow sx={{ bgcolor: alpha(C.purple, 0.08) }}>
                  <TableCell colSpan={4} sx={{ fontWeight: 700, fontSize: "0.8rem" }}>Grand Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: C.red }}>{fmt(payments.reduce((s, p) => s + p.totalAmount, 0))}</TableCell>
                  <TableCell colSpan={3} />
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{fmt(payments.reduce((s, p) => s + p.discountAmount, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{fmt(payments.reduce((s, p) => s + p.fineAmount, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: C.green }}>{fmt(payments.reduce((s, p) => s + p.paidAmount, 0))}</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: C.red }}>{fmt(payments.reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0))}</TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Collect Dialog */}
      <Dialog open={collectDlg} onClose={() => setCollectDlg(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ bgcolor: alpha(C.purple, 0.05), borderBottom: `1px solid ${alpha(C.purple, 0.1)}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: C.purple }}>Collect Fees</Typography>
            <IconButton size="small" onClick={() => setCollectDlg(false)}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField size="small" label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField size="small" label="Paid Amount (₹) *" type="number" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} fullWidth />
            <TextField size="small" label="Discount Amount (₹)" type="number" value={form.discountAmount} onChange={(e) => setForm({ ...form, discountAmount: e.target.value })} fullWidth />
            <TextField size="small" label="Fine Amount (₹)" type="number" value={form.fineAmount} onChange={(e) => setForm({ ...form, fineAmount: e.target.value })} fullWidth />
            <FormControl component="fieldset">
              <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: C.purple }}>Payment Mode *</FormLabel>
              <RadioGroup row value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                {["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"].map((m) => <FormControlLabel key={m} value={m} control={<Radio size="small" sx={{ color: C.purple, "&.Mui-checked": { color: C.purple } }} />} label={<Typography sx={{ fontSize: "0.75rem" }}>{m}</Typography>} />)}
              </RadioGroup>
            </FormControl>
            <TextField size="small" label="Note" multiline rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} fullWidth />
            {selected.length > 0 && <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(C.purple, 0.05), border: `1px solid ${alpha(C.purple, 0.2)}` }}><Typography sx={{ fontSize: "0.75rem", color: C.gray }}>Selected Fees: {selected.length}</Typography><Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: C.purple }}>Total: {fmt(selectedTotal)}</Typography></Box>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(C.purple, 0.1)}` }}>
          <Button onClick={() => setCollectDlg(false)} sx={{ textTransform: "none", fontSize: "0.8rem" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCollect} disabled={submitLoading || !form.paidAmount} sx={{ textTransform: "none", fontSize: "0.8rem", bgcolor: C.purple, "&:hover": { bgcolor: C.purpleDark } }}>{submitLoading ? <CircularProgress size={20} color="inherit" /> : "Collect Fee"}</Button>
        </DialogActions>
      </Dialog>

      {/* Receipts Dialog */}
      <Dialog open={receiptsDlg} onClose={() => setReceiptsDlg(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ bgcolor: alpha(C.purple, 0.05), borderBottom: `1px solid ${alpha(C.purple, 0.1)}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: C.purple }}>View Receipts</Typography>
            <IconButton size="small" onClick={() => setReceiptsDlg(false)}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(C.purple, 0.03) }}>
                  {["SR", "Date", "Amount", "Action"].map((h) => <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem", color: C.gray }}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography sx={{ fontSize: "0.8rem", color: C.gray }}>No receipts found</Typography></TableCell></TableRow>
                ) : (
                  receipts.map((r, i) => (
                    <TableRow key={r._id} hover>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{i + 1}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem" }}>{fmtDate(r.date)}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{fmt(r.amount)}</TableCell>
                      <TableCell><IconButton size="small" sx={{ color: C.purple }}><Print sx={{ fontSize: 16 }} /></IconButton></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => dispatch(clearFeeMessages())} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} sx={{ zIndex: 9999 }}><Alert severity="success" onClose={() => dispatch(clearFeeMessages())} sx={{ borderRadius: 2, fontWeight: 600 }}>{successMsg}</Alert></Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => dispatch(clearFeeMessages())} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} sx={{ zIndex: 9999 }}><Alert severity="error" onClose={() => dispatch(clearFeeMessages())} sx={{ borderRadius: 2, fontWeight: 600 }}>{error}</Alert></Snackbar>
    </Page>
  );
}
