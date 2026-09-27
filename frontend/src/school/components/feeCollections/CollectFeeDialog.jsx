import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormControl,
  Stack,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { collectSingleFee, collectMultipleFees, getDiscountGroups } from "../../../state/feeCollectionSlice";

const BRAND = {
  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  success: "#10B981",
  info: "#3B82F6",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export default function CollectFeeDialog({ 
  open, 
  onClose, 
  studentId,
  selectedFee, // Single fee object
  selectedFees, // Array of fee IDs for multiple
  onSuccess 
}) {
  const dispatch = useDispatch();
  const { discountGroups, discountGroupsLoading, submitLoading } = useSelector((s) => s.feeCollection);

  const [feeForm, setFeeForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    discountGroup: "",
    discountAmount: "0",
    fineAmount: "0",
    paymentMode: "Cash",
    note: "",
  });

  const [printAfterCollect, setPrintAfterCollect] = useState(false);

  // Load discount groups
  useEffect(() => {
    if (open) {
      dispatch(getDiscountGroups());
    }
  }, [open, dispatch]);

  // Set initial amount when dialog opens
  useEffect(() => {
    if (open && selectedFee) {
      setFeeForm((prev) => ({
        ...prev,
        amount: selectedFee.balance.toString(),
        fineAmount: selectedFee.fineAmount?.toString() || "0",
      }));
    } else if (open && selectedFees && selectedFees.length > 0) {
      // Calculate total for multiple fees
      const total = selectedFees.reduce((sum, fee) => sum + (fee.balance || 0), 0);
      setFeeForm((prev) => ({
        ...prev,
        amount: total.toString(),
      }));
    }
  }, [open, selectedFee, selectedFees]);

  const handleSubmit = async (withPrint = false) => {
    if (!feeForm.amount || parseFloat(feeForm.amount) <= 0) {
      return;
    }

    setPrintAfterCollect(withPrint);

    let result;
    if (selectedFee) {
      // Single fee collection
      result = await dispatch(
        collectSingleFee({
          feeAssignmentId: selectedFee._id,
          ...feeForm,
        })
      );
    } else if (selectedFees && selectedFees.length > 0) {
      // Multiple fees collection
      result = await dispatch(
        collectMultipleFees({
          studentId,
          selectedFees: selectedFees.map(f => f._id),
          paidAmount: feeForm.amount,
          ...feeForm,
        })
      );
    }

    if (collectSingleFee.fulfilled.match(result) || collectMultipleFees.fulfilled.match(result)) {
      if (withPrint) {
        // Trigger print
        window.print();
      }
      handleClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleClose = () => {
    setFeeForm({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      discountGroup: "",
      discountAmount: "0",
      fineAmount: "0",
      paymentMode: "Cash",
      note: "",
    });
    setPrintAfterCollect(false);
    onClose();
  };

  const totalPay = parseFloat(feeForm.amount || 0) + parseFloat(feeForm.fineAmount || 0) - parseFloat(feeForm.discountAmount || 0);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}`, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.primary }}>
            {selectedFee 
              ? `${selectedFee.feeMaster?.feesGroup || 'Collect Fee'}: ${selectedFee.feeMaster?.feesCode || ''}`
              : 'Collect Fees'
            }
          </Typography>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: alpha(BRAND.primary, 0.1) },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          {/* Date Field */}
          <TextField
            size="small"
            label="Date *"
            type="date"
            value={feeForm.date}
            onChange={(e) => setFeeForm({ ...feeForm, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Amount Field */}
          <TextField
            size="small"
            label="Amount (₹) *"
            type="number"
            value={feeForm.amount}
            onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Discount Group */}
          <TextField
            size="small"
            label="Discount Group"
            select
            value={feeForm.discountGroup}
            onChange={(e) => setFeeForm({ ...feeForm, discountGroup: e.target.value })}
            fullWidth
            disabled={discountGroupsLoading}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          >
            <MenuItem value="">Select</MenuItem>
            {discountGroups.map((group) => (
              <MenuItem key={group._id} value={group.name}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Discount Amount */}
          <TextField
            size="small"
            label="Discount (₹) *"
            type="number"
            value={feeForm.discountAmount}
            onChange={(e) => setFeeForm({ ...feeForm, discountAmount: e.target.value })}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Fine Amount */}
          <TextField
            size="small"
            label="Fine (₹) *"
            type="number"
            value={feeForm.fineAmount}
            onChange={(e) => setFeeForm({ ...feeForm, fineAmount: e.target.value })}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {/* Payment Mode */}
          <FormControl component="fieldset">
            <FormLabel
              sx={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
              }}
            >
              Payment Mode *
            </FormLabel>
            <RadioGroup
              row
              value={feeForm.paymentMode}
              onChange={(e) => setFeeForm({ ...feeForm, paymentMode: e.target.value })}
            >
              {["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card"].map((mode) => (
                <FormControlLabel
                  key={mode}
                  value={mode}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: BRAND.primary,
                        "&.Mui-checked": { color: BRAND.primary },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.8rem" }}>{mode}</Typography>}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Note */}
          <TextField
            size="small"
            label="Note"
            multiline
            rows={3}
            value={feeForm.note}
            onChange={(e) => setFeeForm({ ...feeForm, note: e.target.value })}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <Divider />

          {/* Fee Details Summary */}
          {selectedFee && (
            <Box sx={{ p: 2, bgcolor: alpha(BRAND.info, 0.05), borderRadius: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "0.9rem", color: BRAND.primary, fontWeight: 600 }}>
                    {selectedFee.feeMaster?.feesGroup}
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    {formatCurrency(selectedFee.amount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "0.8rem" }}>
                    {selectedFee.feeMaster?.feesCode}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: "0.8rem", color: "error.main" }}>
                    Fine
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "error.main", fontWeight: 600 }}>
                    {formatCurrency(parseFloat(feeForm.fineAmount || 0))}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Multiple Fees Summary */}
          {selectedFees && selectedFees.length > 0 && (
            <Box sx={{ p: 2, bgcolor: alpha(BRAND.success, 0.05), borderRadius: 2 }}>
              <Typography sx={{ fontSize: "0.85rem", color: BRAND.success, fontWeight: 600, mb: 1 }}>
                {selectedFees.length} Fee(s) Selected
              </Typography>
              {selectedFees.map((fee) => (
                <Stack key={fee._id} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: "0.8rem" }}>
                    {fee.feeMaster?.feesGroup}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    {formatCurrency(fee.balance)}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}

          {/* Total Pay */}
          <Box sx={{ p: 2, bgcolor: alpha(BRAND.primary, 0.1), borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                Total Pay
              </Typography>
              <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, color: BRAND.primary }}>
                {formatCurrency(totalPay)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.primary, 0.1)}`, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubmit(false)}
          disabled={submitLoading || !feeForm.amount || parseFloat(feeForm.amount) <= 0}
          startIcon={submitLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            bgcolor: BRAND.success,
            "&:hover": { bgcolor: "#059669" },
            minWidth: 120,
          }}
        >
          ₹ Collect Fees
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubmit(true)}
          disabled={submitLoading || !feeForm.amount || parseFloat(feeForm.amount) <= 0}
          startIcon={submitLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            bgcolor: BRAND.primary,
            "&:hover": { bgcolor: BRAND.primaryDark },
            minWidth: 150,
          }}
        >
          ₹ Collect & Print
        </Button>
      </DialogActions>

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", textAlign: "center" }}>
          Collect & Print will send whatsapp with attachment (if enable)
        </Typography>
      </Box>
    </Dialog>
  );
}
