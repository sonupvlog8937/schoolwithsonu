import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  Grid,
  Grow,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  createMasterConfig,
  deleteMasterConfig,
  fetchMasterConfig,
  updateMasterConfig,
} from "../../../state/masterConfigurationSlice";

// ---------- palette (white base, multi-tone orange accents) ----------
const palette = {
  primary: "#ff5a1f", // panel / form accent — bright orange
  primaryDark: "#e0470f",
  teal: "#ff8a3d", // list header accent — lighter orange
  amber: "#ffb020", // edit action — amber-orange
  rose: "#ef4444", // delete / inactive — kept red so destructive stays legible
  green: "#16a34a", // active state — kept green so status stays legible
  slateBg: "#fffaf6", // warm white background
  cardBorder: "#ffe1cc",
  headCellBg: "#fff1e6",
  textMuted: "#a68a7a",
};

const field = (key, label, options = {}) => ({ key, label, ...options });
const simple = (title, label = title) => ({
  title,
  fields: [field("name", label, { required: true }), field("description", "Description", { multiline: true })],
  columns: [field("name", label), field("description", "Description")],
});

const configs = {
  "app-version": {
    title: "APP VERSION",
    fields: [
      field("platform", "Platform", { required: true }),
      field("minSupported", "Min Supported", { required: true }),
      field("latest", "Latest", { required: true }),
      field("title", "Title"),
    ],
    columns: [field("platform", "Platform"), field("minSupported", "Min Supported"), field("latest", "Latest"), field("title", "Title")],
  },
  "house-name": simple("HOUSE NAME", "House Name"),
  "hobby-group": simple("SCHOOL GROUP", "Group Name"),
  religion: simple("RELIGION NAME", "Religion Name"),
  disabilities: simple("DISABILITIES", "Disability"),
  designation: simple("DESIGNATION"),
  department: simple("DEPARTMENT"),
  "payment-method": simple("PAYMENT METHOD"),
  "library-setting": {
    title: "LIBRARY SETTING",
    fields: [
      field("returnWithDays", "Return With Days", { required: true }),
      field("noOfDays", "No. of Days", { required: true }),
      field("amountCharged", "Amount Charged", { required: true }),
      field("description", "Description", { multiline: true }),
    ],
    columns: [field("returnWithDays", "Return With Days"), field("noOfDays", "No. of Days"), field("amountCharged", "Amount Charged")],
  },
  "general-settings": {
    title: "GENERAL SETTINGS",
    fields: [
      field("printReceipt", "Print Receipt", { boolean: true }),
      field("showBalance", "Show Balance", { boolean: true }),
      field("applyFine", "Apply Fine", { boolean: true }),
      field("showDiscount", "Show Discount", { boolean: true }),
      field("noOfDays", "No. of Days"),
      field("amountCharged", "Amount Charged"),
      field("description", "Description", { multiline: true }),
    ],
    columns: [field("printReceipt", "Print Receipt"), field("applyFine", "Apply Fine"), field("showDiscount", "Show Discount")],
  },
  "online-payment": {
    title: "ONLINE PAYMENT",
    fields: [
      field("upiId", "UPI Id", { required: true }),
      field("upiHolderName", "UPI Holder Name", { required: true }),
      field("accountNo", "Account No.", { required: true }),
      field("bankName", "Bank Name"),
      field("ifscCode", "IFSC Code"),
      field("accountHolderName", "Account Holder Name"),
      field("razorpayKeyId", "Razorpay Key Id"),
      field("razorpaySecretKey", "Razorpay Secret Key"),
    ],
    columns: [field("upiId", "UPI Id"), field("upiHolderName", "UPI Holder Name"), field("bankName", "Bank Name")],
  },
  "sms-settings": {
    title: "SMS SETTINGS",
    fields: [
      field("feeSms", "Fee SMS", { boolean: true }),
      field("admissionSms", "Admission SMS", { boolean: true }),
      field("visitorSms", "Visitor SMS", { boolean: true }),
      field("birthdaySms", "Birthday SMS", { boolean: true }),
      field("biometricCheckinStudents", "Biometric Check-in SMS to Students", { boolean: true }),
      field("biometricCheckoutStudents", "Biometric Check-out SMS to Students", { boolean: true }),
      field("administrationNumbers", "Administration Numbers", { multiline: true }),
    ],
    columns: [field("feeSms", "Fee SMS"), field("admissionSms", "Admission SMS"), field("visitorSms", "Visitor SMS")],
  },
  "sms-template": {
    title: "SMS TEMPLATE",
    fields: [field("smsName", "SMS Name", { required: true }), field("smsContent", "SMS Content", { multiline: true, required: true })],
    columns: [field("smsName", "SMS Name"), field("smsContent", "SMS Content")],
  },
  "biometric-device": {
    title: "BIOMETRIC DEVICE",
    fields: [field("sn", "SN", { required: true }), field("ip", "IP", { required: true }), field("description", "Description", { multiline: true })],
    columns: [field("sn", "SN"), field("ip", "IP"), field("description", "Description")],
  },
  "school-shifts": {
    title: "SCHOOL SHIFT",
    fields: [
      field("shiftName", "Shift Name", { required: true }),
      field("checkinStart", "Checkin Start", { required: true }),
      field("checkinEnd", "Checkin End", { required: true }),
      field("checkinTime", "Checkin Time", { required: true }),
      field("checkoutStart", "Checkout Start", { required: true }),
      field("checkoutEnd", "Checkout End", { required: true }),
      field("checkoutTime", "Checkout Time", { required: true }),
      field("timeDuration", "Time Duration", { required: true }),
    ],
    columns: [field("shiftName", "Shift Name"), field("checkinStart", "Checkin Start"), field("checkoutStart", "Checkout Start")],
  },
  "working-days-template": {
    title: "WORKING DAYS TEMPLATE",
    fields: [field("name", "Name", { required: true }), field("className", "Select Class", { required: true })],
    columns: [field("name", "Name"), field("className", "Class")],
  },
  "school-config": {
    title: "SCHOOL CONFIGURATIONS",
    fields: [field("key", "Key", { required: true }), field("value", "Value", { required: true }), field("defaultValue", "Default?")],
    columns: [field("key", "Key"), field("value", "Value"), field("defaultValue", "Default?")],
  },
  boards: {
    title: "BOARDS",
    fields: [
      field("shortCode", "Short Code", { required: true }),
      field("name", "Name", { required: true }),
      field("description", "Description", { multiline: true }),
      field("active", "Active", { boolean: true }),
    ],
    columns: [field("shortCode", "Short Code"), field("name", "Name"), field("description", "Description")],
  },
  "enquiry-statuses": {
    title: "ADMISSION QUERY STATUSES",
    fields: [
      field("name", "Name", { required: true }),
      field("order", "Order"),
      field("colour", "Colour"),
      field("isDefault", "Default", { boolean: true }),
      field("active", "Active", { boolean: true }),
    ],
    columns: [field("order", "Order"), field("name", "Name"), field("colour", "Colour")],
  },
  "enquiry-sources": {
    title: "ENQUIRY SOURCES",
    fields: [field("name", "Name", { required: true }), field("order", "Order"), field("isDefault", "Default", { boolean: true }), field("active", "Active", { boolean: true })],
    columns: [field("order", "Order"), field("name", "Source")],
  },
};

// ---------- reusable styled bits ----------
const smoothTransition = "all .2s cubic-bezier(.4,0,.2,1)";

const actionBtnSx = (color) => ({
  fontSize: 10.5,
  textTransform: "none",
  borderRadius: 6,
  minWidth: 0,
  px: 1,
  color,
  transition: smoothTransition,
  "&:hover": { bgcolor: `${color}14`, transform: "translateY(-1px)" },
});

export default function MasterConfiguration({ fixedModule }) {
  const { module = "session" } = useParams();
  const activeModule = fixedModule || module;
  const config = configs[activeModule] || simple(activeModule.toUpperCase());
  const dispatch = useDispatch();
  const state = useSelector((root) => root.masterConfiguration.modules[activeModule]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMasterConfig(activeModule));
    setForm({});
    setEditingId(null);
  }, [dispatch, activeModule]);

  const records = state?.records || [];
  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const first = config.fields.find((item) => !item.boolean);
    const name = form.name || form.platform || form.shortCode || (first && form[first.key]) || "Configuration";
    const data = { name: String(name), data: form, active: form.active !== false };
    if (editingId) await dispatch(updateMasterConfig({ module: activeModule, id: editingId, data }));
    else await dispatch(createMasterConfig({ module: activeModule, data }));
    setForm({});
    setEditingId(null);
    dispatch(fetchMasterConfig(activeModule));
  };

  const edit = (record) => {
    setEditingId(record._id);
    setForm({ ...(record.data || {}), name: record.name || record.data?.name });
  };

  const cellValue = (record, item) => record.data?.[item.key] ?? record[item.key] ?? (item.key === "name" ? record.name : "-");

  return (
    <Fade in timeout={450}>
      <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 3 }, bgcolor: palette.slateBg }}>
        <Grid container spacing={2.5}>
          {/* ---------------- form panel ---------------- */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${palette.cardBorder}`,
                boxShadow: "0 4px 18px rgba(255,90,31,0.10)",
                overflow: "hidden",
                transition: smoothTransition,
                "&:hover": { boxShadow: "0 8px 26px rgba(255,90,31,0.18)" },
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`,
                  px: 2.5,
                  py: 1.6,
                }}
              >
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 12.5, letterSpacing: 0.3 }}>
                  {editingId ? `Edit ${config.title.toLowerCase()}` : config.title}
                </Typography>
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <Box component="form" onSubmit={submit}>
                  {config.fields.map((item) =>
                    item.boolean ? (
                      <Box
                        key={item.key}
                        sx={{
                          mb: 1.4,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          px: 1,
                          py: 0.6,
                          borderRadius: 2,
                          transition: smoothTransition,
                          "&:hover": { bgcolor: palette.headCellBg },
                        }}
                      >
                        <Typography sx={{ fontSize: 11.5 }}>
                          {item.required && (
                            <Box component="span" sx={{ color: palette.rose }}>
                              *{" "}
                            </Box>
                          )}
                          {item.label}
                        </Typography>
                        <Switch
                          size="small"
                          checked={Boolean(form[item.key])}
                          onChange={(event) => setValue(item.key, event.target.checked)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: palette.teal },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: palette.teal },
                          }}
                        />
                      </Box>
                    ) : (
                      <TextField
                        key={item.key}
                        fullWidth
                        required={item.required}
                        size="small"
                        label={item.label}
                        type={item.type || "text"}
                        multiline={item.multiline}
                        rows={item.multiline ? 3 : undefined}
                        value={form[item.key] || ""}
                        onChange={(event) => setValue(item.key, event.target.value)}
                        sx={{
                          mb: 1.6,
                          "& .MuiInputBase-input": { fontSize: 12.5 },
                          "& .MuiInputLabel-root": { fontSize: 12.5 },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            transition: smoothTransition,
                            "&:hover fieldset": { borderColor: palette.primary },
                            "&.Mui-focused fieldset": { borderColor: palette.primary, borderWidth: 1.5 },
                          },
                        }}
                      />
                    )
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: palette.primary,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: 2,
                        py: 0.9,
                        boxShadow: "0 4px 12px rgba(255,90,31,0.35)",
                        transition: smoothTransition,
                        "&:hover": {
                          bgcolor: palette.primaryDark,
                          boxShadow: "0 6px 16px rgba(255,90,31,0.45)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {editingId ? "Update" : "Submit"}
                    </Button>
                    {editingId && (
                      <Button
                        onClick={() => {
                          setForm({});
                          setEditingId(null);
                        }}
                        sx={{
                          fontSize: 12,
                          textTransform: "none",
                          borderRadius: 2,
                          color: palette.textMuted,
                          transition: smoothTransition,
                          "&:hover": { bgcolor: "#f1f1f6" },
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ---------------- list panel ---------------- */}
          <Grid item xs={12} md={9}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${palette.cardBorder}`,
                boxShadow: "0 4px 18px rgba(255,138,61,0.10)",
                transition: smoothTransition,
                "&:hover": { boxShadow: "0 8px 26px rgba(255,138,61,0.18)" },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography sx={{ color: palette.teal, fontWeight: 700, fontSize: 12.5, letterSpacing: 0.3 }}>
                    {config.title} list
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: 10.5,
                      textTransform: "none",
                      borderRadius: 6,
                      borderColor: palette.teal,
                      color: palette.teal,
                      px: 1.6,
                      transition: smoothTransition,
                      "&:hover": { bgcolor: palette.teal, color: "#fff", borderColor: palette.teal },
                    }}
                  >
                    Inactive
                  </Button>
                </Box>

                {state?.loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress size={22} sx={{ color: palette.primary }} />
                  </Box>
                ) : (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {config.columns.map((item) => (
                            <TableCell key={item.key} sx={{ bgcolor: palette.headCellBg, fontSize: 10.5, fontWeight: 700, color: "#4a4a6a" }}>
                              {item.label}
                            </TableCell>
                          ))}
                          <TableCell sx={{ bgcolor: palette.headCellBg, fontSize: 10.5, fontWeight: 700, color: "#4a4a6a" }}>Status</TableCell>
                          <TableCell sx={{ bgcolor: palette.headCellBg, fontSize: 10.5, fontWeight: 700, color: "#4a4a6a" }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {records.length ? (
                          records.map((record, index) => (
                            <Grow in key={record._id} timeout={250 + Math.min(index, 8) * 40}>
                              <TableRow
                                sx={{
                                  transition: smoothTransition,
                                  "&:hover": { bgcolor: "#faf9ff" },
                                }}
                              >
                                {config.columns.map((item) => (
                                  <TableCell key={item.key} sx={{ fontSize: 11 }}>
                                    {String(cellValue(record, item))}
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <Chip
                                    label={record.active !== false ? "Active" : "Inactive"}
                                    size="small"
                                    onClick={() =>
                                      dispatch(
                                        updateMasterConfig({
                                          module,
                                          id: record._id,
                                          data: { ...record, active: record.active === false },
                                        })
                                      )
                                    }
                                    sx={{
                                      fontSize: 10,
                                      fontWeight: 600,
                                      height: 22,
                                      cursor: "pointer",
                                      color: record.active !== false ? palette.green : palette.rose,
                                      bgcolor: record.active !== false ? "#e8f8ee" : "#fdebec",
                                      transition: smoothTransition,
                                      "&:hover": { opacity: 0.8, transform: "scale(1.04)" },
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button size="small" onClick={() => edit(record)} startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />} sx={actionBtnSx(palette.amber)}>
                                    Edit
                                  </Button>
                                  <Button
                                    size="small"
                                    onClick={() => dispatch(deleteMasterConfig({ module, id: record._id }))}
                                    startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                                    sx={actionBtnSx(palette.rose)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </Grow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={config.columns.length + 2} align="center" sx={{ py: 8, color: palette.textMuted, fontSize: 11.5 }}>
                              No data yet — add one using the form on the left.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

MasterConfiguration.propTypes = {
  fixedModule: PropTypes.string,
};