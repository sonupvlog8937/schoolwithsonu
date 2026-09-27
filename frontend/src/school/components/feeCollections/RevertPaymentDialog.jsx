import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { revertPayment } from "../../../state/feeCollectionSlice";

const BRAND = {
  primary: "#7C3AED",
  error: "#EF4444",
};

export default function RevertPaymentDialog({ open, onClose, paymentId, paymentInfo, onSuccess }) {
  const dispatch = useDispatch();
  const { submitLoading } = useSelector((s) => s.feeCollection);

  const handleRevert = async () => {
    const result = await dispatch(revertPayment(paymentId));
    
    if (revertPayment.fulfilled.match(result)) {
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${alpha(BRAND.error, 0.1)}`, pb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: BRAND.error }}>
          Confirmation
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: "0.9rem", color: "text.primary" }}>
            Are You Sure Want To Delete? <strong>{paymentInfo}</strong> Payment ID, This Action Is Irreversible.
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
            Do You Want To Proceed?
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.error, 0.1)}` }}>
        <Button
          onClick={onClose}
          disabled={submitLoading}
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
          onClick={handleRevert}
          disabled={submitLoading}
          sx={{
            textTransform: "none",
            fontSize: "0.85rem",
            bgcolor: BRAND.error,
            "&:hover": { bgcolor: "#DC2626" },
            minWidth: 100,
          }}
        >
          {submitLoading ? <CircularProgress size={20} color="inherit" /> : "Revert"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
