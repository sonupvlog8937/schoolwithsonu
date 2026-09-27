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
import { clearInventoryNotice, createInventory, deleteInventory, fetchInventory } from "../../../state/inventorySlice";

const titles = {
  "item-category": "Item Category",
  "add-item": "Add Item",
  "item-bundle": "Item Bundle",
  "supplier-list": "Supplier List",
  purchase: "Purchase",
  sell: "Sell",
  "sell-collection": "Sell Collection Report",
  "cancelled-invoice": "Cancelled Invoice",
  "return-invoice": "Return Invoice Report",
  "item-receive-sell": "Item Receive Sell Report",
};

const fields = {
  "item-category": ["name", "description", "status"],
  "add-item": ["name", "category", "quantity", "price", "status"],
  "item-bundle": ["name", "items", "quantity", "status"],
  "supplier-list": ["name", "contact", "email", "status"],
  purchase: ["supplierName", "itemName", "quantity", "amount", "status"],
  sell: ["customerName", "itemName", "quantity", "amount", "status"],
  "sell-collection": ["invoiceNo", "customerName", "amount", "status"],
  "cancelled-invoice": ["invoiceNo", "reason", "amount", "status"],
  "return-invoice": ["invoiceNo", "itemName", "quantity", "amount", "status"],
  "item-receive-sell": ["itemName", "quantity", "received", "status"],
};

const pretty = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

export default function InventoryResource({ fixedResource }) {
  const params = useParams();
  const resource = fixedResource || params.resource || "item-category";
  const dispatch = useDispatch();
  const { records, summary, loading, saving, error, success } = useSelector((state) => state.inventory);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const list = fields[resource] || fields["item-category"];

  useEffect(() => {
    dispatch(fetchInventory(resource));
  }, [dispatch, resource]);

  const save = () => {
    dispatch(createInventory({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f3f5f9", minHeight: "calc(100vh - 64px)" }}>
      <Card sx={{ maxWidth: 1260, mx: "auto" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
            <Typography variant="h6" color="warning.main" fontWeight={700}>{titles[resource] || "Inventory"}</Typography>
            <Stack direction="row" gap={1}>
              <Button startIcon={<Refresh />} onClick={() => dispatch(fetchInventory(resource))}>Refresh</Button>
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
                        <IconButton color="error" onClick={() => dispatch(deleteInventory({ resource, id: record._id }))}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={list.length + 2} align="center" sx={{ py: 8, color: "text.secondary" }}>
                      No {titles[resource] || "Inventory"} records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {titles[resource] || "Inventory"}</DialogTitle>
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

      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => dispatch(clearInventoryNotice())}>
        <Alert severity="error" onClose={() => dispatch(clearInventoryNotice())}>{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => dispatch(clearInventoryNotice())}>
        <Alert severity="success" onClose={() => dispatch(clearInventoryNotice())}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}

InventoryResource.propTypes = {
  fixedResource: PropTypes.string,
};
