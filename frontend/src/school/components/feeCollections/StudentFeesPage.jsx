import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormControl,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Undo as UndoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Payments as PaymentsIcon,
} from "@mui/icons-material";
import { alpha, styled, keyframes } from "@mui/material/styles";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import {
  getStudentFeesForCollection,
  collectMultipleFees,
  getDiscountGroups,
  revertPayment,
  clearFeeMessages,
} from "../../../state/feeCollectionSlice";
import PrintReceipt from "./PrintReceipt";
import ViewReceiptsDialog from "./ViewReceiptsDialog";
import "./print.css";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  purple900: "#3B0764",
  purple800: "#4C1D95",
  purple700: "#5B21B6",
  purple600: "#7C3AED",
  purple500: "#8B5CF6",
  purple400: "#A78BFA",
  purple300: "#C4B5FD",
  purple100: "#EDE9FE",
  purple50:  "#F5F3FF",
  white:     "#FFFFFF",
  gray900:   "#111827",
  gray700:   "#374151",
  gray500:   "#6B7280",
  gray300:   "#D1D5DB",
  gray100:   "#F3F4F6",
  emerald:   "#059669",
  amber:     "#D97706",
  rose:      "#DC2626",
  sky:       "#0284C7",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const scaleIn = keyframes`from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Root = styled(Box)({
  padding: "clamp(12px,2.5vw,28px)",
  minHeight: "100vh",
  background: `linear-gradient(160deg, ${T.purple50} 0%, ${T.white} 50%, ${T.purple50} 100%)`,
});

const Surface = styled(Paper)({
  background: T.white,
  border: `1px solid ${alpha(T.purple600, 0.12)}`,
  borderRadius: 12,
  boxShadow: `0 1px 3px ${alpha(T.purple800, 0.06)}, 0 4px 16px ${alpha(T.purple800, 0.04)}`,
  animation: `${fadeUp} 0.35s ease`,
});

const PrimaryBtn = styled(Button)({
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.75rem",
  letterSpacing: 0.2,
  padding: "7px 16px",
  background: `linear-gradient(135deg, ${T.purple600} 0%, ${T.purple700} 100%)`,
  color: T.white,
  boxShadow: `0 2px 8px ${alpha(T.purple600, 0.3)}`,
  "&:hover": { background: `linear-gradient(135deg, ${T.purple700} 0%, ${T.purple800} 100%)` },
  "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
});

const OutlineBtn = styled(Button)({
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.75rem",
  padding: "7px 16px",
  border: `1.5px solid`,
  "&:disabled": { opacity: 0.45 },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) => { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }); };

function StatusBadge({ status }) {
  const map = {
    Paid: { color: T.emerald, icon: CheckCircleIcon },
    Partial: { color: T.amber, icon: WarningIcon },
    Unpaid: { color: T.rose, icon: ErrorIcon },
  };
  const { color, icon: Icon } = map[status] || map.Unpaid;
  return (
    <Chip
      icon={<Icon sx={{ fontSize: "11px !important", color: `${color} !important` }} />}
      label={status}
      size="small"
      sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 700, fontSize: "0.62rem", height: 20, border: `1px solid ${alpha(color, 0.25)}` }}
    />
  );
}

// ─── Progress Bar Card ────────────────────────────────────────────────────────
function ProgressSummary({ feeSummary }) {
  const pct = feeSummary?.totalAmount > 0 ? Math.round((feeSummary.totalPaid / feeSummary.totalAmount) * 100) : 0;
  return (
    <Box sx={{ p: 2, borderRadius: 2.5, background: `linear-gradient(135deg, ${T.purple50} 0%, ${alpha(T.purple100, 0.6)} 100%)`, border: `1px solid ${alpha(T.purple600, 0.15)}`, mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: T.purple700, textTransform: "uppercase", letterSpacing: 0.4 }}>
          Fee Payment Progress
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: T.purple600 }}>{pct}%</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 99, bgcolor: alpha(T.purple300, 0.3), "& .MuiLinearProgress-bar": { bgcolor: T.purple600, borderRadius: 99 } }} />
      <Stack direction="row" justifyContent="space-between" mt={1}>
        <Typography sx={{ fontSize: "0.65rem", color: T.emerald, fontWeight: 600 }}>Paid: {fmt(feeSummary?.totalPaid || 0)}</Typography>
        <Typography sx={{ fontSize: "0.65rem", color: T.rose, fontWeight: 600 }}>Due: {fmt(feeSummary?.totalBalance || 0)}</Typography>
      </Stack>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentFeesPage() {
  useDocumentTitle("Student Fees");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentId } = useParams();

  const { studentFeesForCollection: student, feeAssignments, feeSummary, studentFeesLoading, submitLoading, discountGroups, discountGroupsLoading, error, successMsg } =
    useSelector((s) => s.feeCollection);

  const [selectedFees, setSelectedFees] = useState([]);
  const [collectDialog, setCollectDialog] = useState(false);
  const [singleFeeCollect, setSingleFeeCollect] = useState(null);
  const [revertDialog, setRevertDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [printDialog, setPrintDialog] = useState(false);
  const [feesToPrint, setFeesToPrint] = useState([]);
  const [viewReceiptsDialog, setViewReceiptsDialog] = useState(false);
  const [feeForm, setFeeForm] = useState({ date: new Date().toISOString().split("T")[0], paidAmount: "", discountGroup: "", discountAmount: "0", paymentMode: "Cash", note: "" });

  useEffect(() => {
    if (studentId) { dispatch(getStudentFeesForCollection(studentId)); dispatch(getDiscountGroups()); }
  }, [dispatch, studentId]);

  const handleSelectFee = (id) => setSelectedFees((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const handleSelectAll = (e) => setSelectedFees(e.target.checked ? feeAssignments.map((f) => f._id) : []);

  const selectedTotal = feeAssignments.filter((f) => selectedFees.includes(f._id)).reduce((s, f) => s + f.balance, 0);

  const handleCollectSelected = () => {
    if (!selectedFees.length) return;
    setSingleFeeCollect(null);
    setFeeForm({ ...feeForm, paidAmount: selectedTotal.toString() });
    setCollectDialog(true);
  };

  const handleAddFee = (fee) => {
    setSingleFeeCollect(fee);
    setFeeForm({ date: new Date().toISOString().split("T")[0], paidAmount: fee.balance.toString(), discountGroup: "", discountAmount: "0", paymentMode: "Cash", note: "" });
    setCollectDialog(true);
  };

  const handleRevertClick = (fee) => {
    if (!fee.payments?.length) return;
    setSelectedPayment(fee.payments[0]);
    setRevertDialog(true);
  };

  const handleRevertConfirm = async () => {
    if (!selectedPayment) return;
    const result = await dispatch(revertPayment(selectedPayment._id));
    if (revertPayment.fulfilled.match(result)) { setRevertDialog(false); setSelectedPayment(null); dispatch(getStudentFeesForCollection(studentId)); }
  };

  const handlePrintReceipt = (fee) => { setFeesToPrint([fee]); setPrintDialog(true); };
  const handlePrintSelected = () => { if (!selectedFees.length) return; setFeesToPrint(feeAssignments.filter((f) => selectedFees.includes(f._id))); setPrintDialog(true); };
  const handlePrintPaidFees = () => { const paid = feeAssignments.filter((f) => f.status === "Paid"); if (!paid.length) return; setFeesToPrint(paid); setPrintDialog(true); };

  const handleCollectFeeSubmit = async () => {
    if (!feeForm.paidAmount || parseFloat(feeForm.paidAmount) <= 0) return;
    const feesToCollect = singleFeeCollect ? [singleFeeCollect._id] : selectedFees;
    if (!feesToCollect.length) return;
    const result = await dispatch(collectMultipleFees({ studentId, ...feeForm, selectedFees: feesToCollect }));
    if (collectMultipleFees.fulfilled.match(result)) {
      setCollectDialog(false); setSelectedFees([]); setSingleFeeCollect(null);
      setFeeForm({ date: new Date().toISOString().split("T")[0], paidAmount: "", discountGroup: "", discountAmount: "0", paymentMode: "Cash", note: "" });
      dispatch(getStudentFeesForCollection(studentId));
    }
  };

  useEffect(() => {
    if (error || successMsg) { const t = setTimeout(() => dispatch(clearFeeMessages()), 3500); return () => clearTimeout(t); }
  }, [error, successMsg, dispatch]);

  if (studentFeesLoading) {
    return (
      <Root>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={36} sx={{ color: T.purple600 }} />
            <Typography sx={{ fontSize: "0.78rem", color: T.gray500 }}>Loading student fees…</Typography>
          </Stack>
        </Box>
      </Root>
    );
  }

  if (!student) return <Root><Alert severity="error">Student not found</Alert></Root>;

  const allSelected = selectedFees.length === feeAssignments.length && feeAssignments.length > 0;
  const someSelected = selectedFees.length > 0 && selectedFees.length < feeAssignments.length;

  return (
    <Root>
      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, fontSize: "0.75rem" }} onClose={() => dispatch(clearFeeMessages())}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 1.5, borderRadius: 2, fontSize: "0.75rem" }} onClose={() => dispatch(clearFeeMessages())}>{successMsg}</Alert>}

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
        <IconButton onClick={() => navigate("/school/fees/collect")}
          sx={{ bgcolor: T.white, border: `1px solid ${alpha(T.purple600, 0.2)}`, borderRadius: 2, p: 0.75, "&:hover": { bgcolor: alpha(T.purple600, 0.05) } }}>
          <ArrowBackIcon sx={{ fontSize: 20, color: T.purple600 }} />
        </IconButton>
        <Box>
          <Typography sx={{ fontWeight: 800, color: T.purple700, fontSize: "1.05rem", letterSpacing: "-0.3px" }}>Student Fees</Typography>
          <Typography sx={{ fontSize: "0.7rem", color: T.gray500 }}>Manage and collect fees</Typography>
        </Box>
      </Stack>

      {/* Student Card */}
      <Surface elevation={0} sx={{ p: 2, mb: 2 }}>
        <Grid2 container spacing={2} alignItems="center">
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Stack direction="row" spacing={1.75} alignItems="center">
              <Avatar src={student.photo}
                sx={{ width: 64, height: 64, bgcolor: T.purple600, fontSize: "1.5rem", fontWeight: 800, border: `3px solid ${T.purple100}`, boxShadow: `0 3px 12px ${alpha(T.purple800, 0.2)}` }}>
                {student.firstName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, color: T.purple700, fontSize: "0.95rem" }}>
                  {student.firstName} {student.lastName}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" mt={0.4}>
                  <Chip icon={<SchoolIcon sx={{ fontSize: "11px !important" }} />}
                    label={`${student.class?.class_text} · ${student.section}`}
                    size="small" sx={{ bgcolor: T.purple100, color: T.purple700, fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                  <PhoneIcon sx={{ fontSize: 13, color: T.gray500 }} />
                  <Typography sx={{ fontSize: "0.72rem", color: T.gray500 }}>{student.mobileNumber || "—"}</Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Grid2 container spacing={1}>
              {[
                ["Father Name", student.fatherName],
                ["Admission No", student.admissionNo],
                ["Roll No", student.rollNumber],
                ["Category", student.category || "General"],
              ].map(([label, value]) => (
                <Grid2 key={label} size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: T.gray100, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.62rem", color: T.gray500, textTransform: "uppercase", letterSpacing: 0.3, mb: 0.25 }}>{label}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: T.gray900 }}>{value || "—"}</Typography>
                  </Box>
                </Grid2>
              ))}
            </Grid2>
          </Grid2>
        </Grid2>
      </Surface>

      {/* Progress */}
      <ProgressSummary feeSummary={feeSummary} />

      {/* Actions Bar */}
      <Stack direction="row" spacing={1} mb={1.75} flexWrap="wrap" alignItems="center">
        <PrimaryBtn startIcon={<AttachMoneyIcon sx={{ fontSize: 15 }} />} disabled={selectedFees.length === 0} onClick={handleCollectSelected}
          sx={{ background: `linear-gradient(135deg, ${T.amber} 0%, #B45309 100%)`, boxShadow: `0 2px 8px ${alpha(T.amber, 0.35)}` }}>
          Collect Selected {selectedFees.length > 0 && `(${selectedFees.length})`}
        </PrimaryBtn>
        <OutlineBtn startIcon={<PrintIcon sx={{ fontSize: 15 }} />} disabled={selectedFees.length === 0} onClick={handlePrintSelected}
          sx={{ borderColor: T.gray500, color: T.gray700, "&:hover": { bgcolor: alpha(T.gray500, 0.05) } }}>
          Print Selected
        </OutlineBtn>
        <OutlineBtn startIcon={<ReceiptIcon sx={{ fontSize: 15 }} />} onClick={() => setViewReceiptsDialog(true)}
          sx={{ borderColor: T.emerald, color: T.emerald, "&:hover": { bgcolor: alpha(T.emerald, 0.05) } }}>
          View Receipts
        </OutlineBtn>

        <Box flex={1} />

        <Stack direction="row" spacing={1}>
          <Chip label={`Due: ${fmt(feeSummary?.totalBalance || 0)}`} size="small"
            sx={{ bgcolor: alpha(T.rose, 0.08), color: T.rose, fontWeight: 700, fontSize: "0.72rem", height: 28, border: `1px solid ${alpha(T.rose, 0.2)}` }} />
          <Chip label={`Paid: ${fmt(feeSummary?.totalPaid || 0)}`} size="small"
            sx={{ bgcolor: alpha(T.emerald, 0.08), color: T.emerald, fontWeight: 700, fontSize: "0.72rem", height: 28, border: `1px solid ${alpha(T.emerald, 0.2)}` }} />
        </Stack>
      </Stack>

      {/* Fees Table */}
      <Surface elevation={0} sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(T.purple600, 0.04) }}>
                <TableCell padding="checkbox" sx={{ py: 1.25, pl: 1.5 }}>
                  <Checkbox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll}
                    size="small" sx={{ p: 0.25, color: T.purple400, "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: T.purple600 } }} />
                </TableCell>
                {["Fees Group", "Fees Code", "Due Date", "Status", "Amount (₹)", "Pay ID", "Mode", "Date", "Discount", "Fine", "Paid", "Balance", "Actions"].map((h, i) => (
                  <TableCell key={h} align={i >= 4 && i < 12 ? "right" : i === 12 ? "center" : "left"}
                    sx={{ fontWeight: 700, fontSize: "0.62rem", color: T.gray500, py: 1.1, letterSpacing: 0.4, textTransform: "uppercase", whiteSpace: "nowrap",
                      borderBottom: `1px solid ${alpha(T.purple600, 0.1)}` }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {feeAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 5 }}>
                    <PaymentsIcon sx={{ fontSize: 36, color: T.gray300, mb: 1 }} />
                    <Typography sx={{ fontSize: "0.8rem", color: T.gray500 }}>No fee records found</Typography>
                  </TableCell>
                </TableRow>
              ) : feeAssignments.map((fee, i) => (
                <TableRow key={fee._id} hover
                  sx={{ "&:hover": { bgcolor: alpha(T.purple600, 0.025) }, animation: `${fadeUp} 0.2s ease ${i * 0.03}s both`,
                    borderBottom: `1px solid ${alpha(T.gray300, 0.45)}`, bgcolor: selectedFees.includes(fee._id) ? alpha(T.purple600, 0.03) : "transparent" }}>
                  <TableCell padding="checkbox" sx={{ pl: 1.5 }}>
                    <Checkbox checked={selectedFees.includes(fee._id)} onChange={() => handleSelectFee(fee._id)}
                      size="small" sx={{ p: 0.25, color: T.purple400, "&.Mui-checked": { color: T.purple600 } }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.72rem", py: 1, fontWeight: 600, color: T.gray700 }}>{fee.feeMaster?.feesGroup || "—"}</TableCell>
                  <TableCell sx={{ fontSize: "0.72rem", py: 1, color: T.gray700 }}>{fee.feeMaster?.feesCode || "—"}</TableCell>
                  <TableCell sx={{ fontSize: "0.72rem", py: 1, color: T.gray500 }}>{fmtDate(fee.dueDate)}</TableCell>
                  <TableCell sx={{ py: 1 }}><StatusBadge status={fee.status} /></TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.72rem", py: 1, fontWeight: 600 }}>{fmt(fee.amount)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.68rem", py: 1, color: T.gray500, fontFamily: "monospace" }}>{fee.payments?.[0]?.paymentId || "—"}</TableCell>
                  <TableCell sx={{ fontSize: "0.68rem", py: 1, color: T.gray500 }}>{fee.payments?.[0]?.paymentMode || "—"}</TableCell>
                  <TableCell sx={{ fontSize: "0.68rem", py: 1, color: T.gray500 }}>{fee.payments?.[0] ? fmtDate(fee.payments[0].paymentDate) : "—"}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.72rem", py: 1 }}>{fmt(fee.discountAmount)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.72rem", py: 1 }}>{fmt(fee.fineAmount)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.72rem", py: 1, fontWeight: 700, color: T.emerald }}>{fmt(fee.paidAmount)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.72rem", py: 1, fontWeight: 700, color: T.rose }}>{fmt(fee.balance)}</TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Stack direction="row" spacing={0.4} justifyContent="center">
                      {fee.balance > 0 && (
                        <Tooltip title="Add Payment">
                          <IconButton size="small" onClick={() => handleAddFee(fee)}
                            sx={{ bgcolor: alpha(T.emerald, 0.08), color: T.emerald, borderRadius: 1.5, p: 0.5, "&:hover": { bgcolor: alpha(T.emerald, 0.15) } }}>
                            <AddIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {fee.payments?.length > 0 && (
                        <Tooltip title="Revert Payment">
                          <IconButton size="small" onClick={() => handleRevertClick(fee)}
                            sx={{ bgcolor: alpha(T.amber, 0.08), color: T.amber, borderRadius: 1.5, p: 0.5, "&:hover": { bgcolor: alpha(T.amber, 0.15) } }}>
                            <UndoIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Print Receipt">
                        <IconButton size="small" onClick={() => handlePrintReceipt(fee)}
                          sx={{ bgcolor: alpha(T.gray500, 0.08), color: T.gray500, borderRadius: 1.5, p: 0.5, "&:hover": { bgcolor: alpha(T.gray500, 0.15) } }}>
                          <PrintIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Grand Total Row */}
        {feeAssignments.length > 0 && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(T.purple50, 0.8), borderTop: `2px solid ${alpha(T.purple600, 0.1)}` }}>
            <Stack direction="row" justifyContent="flex-end" spacing={3} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: T.gray700, mr: "auto" }}>GRAND TOTAL</Typography>
              {[
                ["Total", feeSummary?.totalAmount, T.purple600],
                ["Discount", feeSummary?.totalDiscount, T.amber],
                ["Fine", feeSummary?.totalFine, T.rose],
                ["Paid", feeSummary?.totalPaid, T.emerald],
                ["Balance", feeSummary?.totalBalance, T.rose],
              ].map(([label, val, color]) => (
                <Box key={label} textAlign="right">
                  <Typography sx={{ fontSize: "0.6rem", color: T.gray500, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color }}>{fmt(val || 0)}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Surface>

      {/* ── Collect Fee Dialog ── */}
      <Dialog open={collectDialog} onClose={() => { setCollectDialog(false); setSingleFeeCollect(null); }}
        maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${T.purple600} 0%, ${T.purple800} 100%)`, color: T.white, py: 1.75 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(T.white, 0.2) }}><PaymentsIcon sx={{ fontSize: 18 }} /></Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{singleFeeCollect ? "Add Payment" : "Collect Fees"}</Typography>
            </Stack>
            <IconButton size="small" onClick={() => { setCollectDialog(false); setSingleFeeCollect(null); }}
              sx={{ color: T.white, p: 0.5, "&:hover": { bgcolor: alpha(T.white, 0.15) } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={1.75}>
            {singleFeeCollect && (
              <Box sx={{ p: 1.5, bgcolor: alpha(T.purple600, 0.05), borderRadius: 2, border: `1px solid ${alpha(T.purple600, 0.18)}` }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: T.purple700, textTransform: "uppercase", letterSpacing: 0.4, mb: 0.75 }}>Fee Details</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: "0.75rem", color: T.gray700, fontWeight: 500 }}>
                    {singleFeeCollect.feeMaster?.feesGroup} — {singleFeeCollect.feeMaster?.feesCode}
                  </Typography>
                  <Chip label={`Balance: ${fmt(singleFeeCollect.balance)}`} size="small"
                    sx={{ bgcolor: alpha(T.rose, 0.1), color: T.rose, fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                </Stack>
              </Box>
            )}

            <TextField size="small" label="Date *" type="date" value={feeForm.date} onChange={(e) => setFeeForm({ ...feeForm, date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }} fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.78rem" }, "& .MuiInputLabel-root": { fontSize: "0.78rem" } }} />

            <TextField size="small" label="Amount (₹) *" type="number" value={feeForm.paidAmount} onChange={(e) => setFeeForm({ ...feeForm, paidAmount: e.target.value })}
              fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.78rem" }, "& .MuiInputLabel-root": { fontSize: "0.78rem" } }} />

            <TextField size="small" label="Discount Group" select value={feeForm.discountGroup}
              onChange={(e) => {
                const d = discountGroups.find((g) => g._id === e.target.value);
                setFeeForm({ ...feeForm, discountGroup: e.target.value, discountAmount: d ? (d.discountType === "percentage" ? ((selectedTotal * d.percentage) / 100).toFixed(2) : Math.min(d.amount, selectedTotal).toFixed(2)) : "0" });
              }}
              fullWidth helperText={discountGroupsLoading ? "Loading…" : ""}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.78rem" }, "& .MuiInputLabel-root": { fontSize: "0.78rem" } }}>
              <MenuItem value="" sx={{ fontSize: "0.75rem" }}>None</MenuItem>
              {discountGroups.map((d) => (
                <MenuItem key={d._id} value={d._id} sx={{ fontSize: "0.75rem" }}>
                  {d.name} ({d.discountCode}) — {d.discountType === "percentage" ? `${d.percentage}%` : `₹${d.amount}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField size="small" label="Discount Amount (₹)" type="number" value={feeForm.discountAmount} onChange={(e) => setFeeForm({ ...feeForm, discountAmount: e.target.value })}
              fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.78rem" }, "& .MuiInputLabel-root": { fontSize: "0.78rem" } }} />

            <Box>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: T.gray700, mb: 1, textTransform: "uppercase", letterSpacing: 0.3 }}>Payment Mode *</Typography>
              <RadioGroup row value={feeForm.paymentMode} onChange={(e) => setFeeForm({ ...feeForm, paymentMode: e.target.value })}>
                {["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"].map((m) => (
                  <FormControlLabel key={m} value={m} control={<Radio size="small" sx={{ color: T.purple600, "&.Mui-checked": { color: T.purple600 }, p: 0.4 }} />}
                    label={<Typography sx={{ fontSize: "0.72rem" }}>{m}</Typography>} sx={{ mr: 1.5 }} />
                ))}
              </RadioGroup>
            </Box>

            <TextField size="small" label="Note" multiline rows={2} value={feeForm.note} onChange={(e) => setFeeForm({ ...feeForm, note: e.target.value })}
              fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.78rem" }, "& .MuiInputLabel-root": { fontSize: "0.78rem" } }} />

            {!singleFeeCollect && selectedFees.length > 0 && (
              <Box sx={{ p: 1.25, bgcolor: alpha(T.emerald, 0.07), borderRadius: 2, border: `1px solid ${alpha(T.emerald, 0.2)}` }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "0.72rem", color: T.emerald, fontWeight: 600 }}>{selectedFees.length} fee(s) selected</Typography>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: T.emerald }}>{fmt(selectedTotal)}</Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5, borderTop: `1px solid ${alpha(T.gray300, 0.5)}` }}>
          <Button onClick={() => setCollectDialog(false)} sx={{ textTransform: "none", fontSize: "0.75rem", color: T.gray700 }}>Cancel</Button>
          <PrimaryBtn onClick={handleCollectFeeSubmit} disabled={submitLoading || !feeForm.paidAmount || parseFloat(feeForm.paidAmount) <= 0} sx={{ minWidth: 90 }}>
            {submitLoading ? <CircularProgress size={16} color="inherit" /> : "Save"}
          </PrimaryBtn>
        </DialogActions>
      </Dialog>

      {/* ── Revert Dialog ── */}
      <Dialog open={revertDialog} onClose={() => setRevertDialog(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha(T.amber, 0.2)}`, py: 1.75 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: T.amber }}>Revert Payment</Typography>
            <IconButton size="small" onClick={() => setRevertDialog(false)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedPayment && (
            <Stack spacing={1.5}>
              <Alert severity="warning" sx={{ fontSize: "0.72rem", py: 0.75 }}>
                This action cannot be undone. The payment will be fully reversed.
              </Alert>
              <Box sx={{ p: 1.5, bgcolor: T.gray100, borderRadius: 2 }}>
                {[["Payment ID", selectedPayment.paymentId], ["Amount", fmt(selectedPayment.amount)], ["Date", fmtDate(selectedPayment.paymentDate)], ["Mode", selectedPayment.paymentMode]].map(([label, val]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5, borderBottom: `1px solid ${alpha(T.gray300, 0.5)}`, "&:last-child": { borderBottom: "none" } }}>
                    <Typography sx={{ fontSize: "0.72rem", color: T.gray500 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: T.gray900 }}>{val}</Typography>
                  </Stack>
                ))}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setRevertDialog(false)} sx={{ textTransform: "none", fontSize: "0.75rem" }}>Cancel</Button>
          <Button variant="contained" onClick={handleRevertConfirm} disabled={submitLoading}
            sx={{ textTransform: "none", fontSize: "0.75rem", bgcolor: T.amber, "&:hover": { bgcolor: "#B45309" }, borderRadius: 2, minWidth: 80 }}>
            {submitLoading ? <CircularProgress size={16} color="inherit" /> : "Revert"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Print Dialog ── */}
      <Dialog open={printDialog} onClose={() => setPrintDialog(false)} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha(T.gray300, 0.5)}`, py: 1.75 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: T.purple700 }}>Fee Receipt</Typography>
            <Stack direction="row" spacing={1}>
              <PrimaryBtn onClick={() => window.print()} startIcon={<PrintIcon sx={{ fontSize: 15 }} />}>Print</PrimaryBtn>
              <IconButton size="small" onClick={() => setPrintDialog(false)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <PrintReceipt student={student} feeAssignments={feesToPrint} schoolInfo={{ name: "School Name", address: "School Address", logo: null }} />
        </DialogContent>
      </Dialog>

      {/* ── View Receipts Dialog ── */}
      <ViewReceiptsDialog open={viewReceiptsDialog} onClose={() => setViewReceiptsDialog(false)} student={student} feeAssignments={feeAssignments}
        onPrintReceipt={(fee) => { setViewReceiptsDialog(false); handlePrintReceipt(fee); }}
        onPrintPaidFees={() => { setViewReceiptsDialog(false); handlePrintPaidFees(); }} />
    </Root>
  );
}