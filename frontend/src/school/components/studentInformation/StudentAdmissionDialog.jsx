import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Alert,
  Avatar,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Save as SaveIcon, 
  CloudUpload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  addStudent,
  updateStudent,
  fetchDropdownOptions,
  clearMessages,
} from '../../../state/studentAdmissionSlice';
import { fetchCategories, fetchHouses } from '../../../state/studentSettingsSlice';

const defaultForm = {
  admissionNo: '',
  rollNumber: '',
  firstName: '',
  lastName: '',
  photo: '',
  aadharNumber: '',
  class: '',
  section: '',
  gender: '',
  dateOfBirth: '',
  admissionDate: '',
  category: '',
  religion: '',
  caste: '',
  mobileNumber: '',
  alternateMobileNumber: '',
  email: '',
  bloodGroup: '',
  house: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  transportEnabled: false,
  route: '',
  pickupPoint: '',
  transportFeesMonth: '',
  hostelEnabled: false,
  hostel: '',
  roomNumber: '',
  feesDetails: [],
  status: 'Active',
};

const toInputDate = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '');

const StudentAdmissionDialog = ({ open, onClose, student = null, mode = 'add' }) => {
  const dispatch = useDispatch();
  const { dropdownOptions, submitLoading, error } = useSelector((state) => state.studentAdmission);
  const { categories, houses } = useSelector((state) => state.studentSettings);
  const [formData, setFormData] = useState(defaultForm);

  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  useEffect(() => {
    if (open) {
      dispatch(fetchDropdownOptions());
      dispatch(fetchCategories());
      dispatch(fetchHouses());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (student && (isEdit || isView)) {
      setFormData({
        ...defaultForm,
        ...student,
        class: student.class?._id || student.class || '',
        dateOfBirth: toInputDate(student.dateOfBirth),
        admissionDate: toInputDate(student.admissionDate),
      });
    } else {
      setFormData(defaultForm);
    }
  }, [student, isEdit, isView]);

  const onChange = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // Log payload for debugging
    console.log('Submitting student data:', payload);
    
    if (isEdit) {
      dispatch(updateStudent({ id: student._id, data: payload }));
    } else {
      dispatch(addStudent(payload));
    }
  };

  const handleClose = () => {
    setFormData(defaultForm);
    dispatch(clearMessages());
    onClose();
  };

  const title = isView ? 'View Student' : isEdit ? 'Edit Student' : 'Add New Student';

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#6a1b9a', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: 1.5,
      }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.813rem' }}>{error}</Alert>}

        <Box component="form" id="student-form" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 1, fontSize: '0.875rem' }}>
            📋 Personal Information
          </Typography>
          <Grid container spacing={1.5}>
            {/* Photo Upload */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={formData.photo}
                alt={formData.firstName}
                sx={{ width: 80, height: 80, bgcolor: '#6a1b9a' }}
              >
                {formData.firstName?.charAt(0) || 'S'}
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<UploadIcon />}
                disabled={isView}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.813rem',
                  borderColor: '#6a1b9a',
                  color: '#6a1b9a',
                }}
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </Button>
            </Grid>

            {[
              ['admissionNo', 'Admission No*'],
              ['rollNumber', 'Roll Number'],
              ['firstName', 'First Name*'],
              ['lastName', 'Last Name'],
            ].map(([key, label]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField 
                  fullWidth 
                  size="small"
                  label={label} 
                  value={formData[key] || ''} 
                  onChange={(e) => onChange(key, e.target.value)} 
                  disabled={isView}
                  InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                  inputProps={{ style: { fontSize: '0.813rem' } }}
                />
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                size="small"
                label="Aadhar Number" 
                value={formData.aadharNumber || ''} 
                onChange={(e) => onChange('aadharNumber', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                inputProps={{ style: { fontSize: '0.813rem' }, maxLength: 12 }}
                placeholder="XXXX-XXXX-XXXX"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                select 
                fullWidth 
                size="small"
                label="Class*" 
                value={formData.class} 
                onChange={(e) => onChange('class', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                {dropdownOptions.classes?.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id} sx={{ fontSize: '0.813rem' }}>{cls.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Section"
                value={formData.section || ''}
                onChange={(e) => onChange('section', e.target.value)}
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                {['A', 'B', 'C', 'D', 'E'].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: '0.813rem' }}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                select 
                fullWidth 
                size="small"
                label="Gender" 
                value={formData.gender} 
                onChange={(e) => onChange('gender', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                {['Male', 'Female', 'Other'].map((g) => (
                  <MenuItem key={g} value={g} sx={{ fontSize: '0.813rem' }}>{g}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                type="date" 
                fullWidth 
                size="small"
                label="Date of Birth" 
                value={formData.dateOfBirth} 
                onChange={(e) => onChange('dateOfBirth', e.target.value)} 
                slotProps={{ inputLabel: { shrink: true, style: { fontSize: '0.813rem' } } }}
                inputProps={{ style: { fontSize: '0.813rem' } }}
                disabled={isView} 
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                type="date" 
                fullWidth 
                size="small"
                label="Admission Date" 
                value={formData.admissionDate} 
                onChange={(e) => onChange('admissionDate', e.target.value)} 
                slotProps={{ inputLabel: { shrink: true, style: { fontSize: '0.813rem' } } }}
                inputProps={{ style: { fontSize: '0.813rem' } }}
                disabled={isView} 
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                select 
                fullWidth 
                size="small"
                label="Blood Group" 
                value={formData.bloodGroup} 
                onChange={(e) => onChange('bloodGroup', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                {(dropdownOptions.bloodGroups || ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).map((group) => (
                  <MenuItem key={group} value={group} sx={{ fontSize: '0.813rem' }}>{group}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Category & Religion */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 2, fontSize: '0.875rem' }}>
            🏛️ Category & Religion
          </Typography>
          <Grid container spacing={1.5}>
            {/* Category - Dynamic Dropdown */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={formData.category || ''}
                onChange={(e) => onChange('category', e.target.value)}
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select Category</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.name} sx={{ fontSize: '0.813rem' }}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Religion */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Religion"
                value={formData.religion || ''}
                onChange={(e) => onChange('religion', e.target.value)}
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select Religion</MenuItem>
                {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'].map((r) => (
                  <MenuItem key={r} value={r} sx={{ fontSize: '0.813rem' }}>{r}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Caste */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Caste"
                value={formData.caste || ''}
                onChange={(e) => onChange('caste', e.target.value)}
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                inputProps={{ style: { fontSize: '0.813rem' } }}
              />
            </Grid>

            {/* House - Dynamic Dropdown */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="House"
                value={formData.house || ''}
                onChange={(e) => onChange('house', e.target.value)}
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select House</MenuItem>
                {houses.map((h) => (
                  <MenuItem key={h._id} value={h.name} sx={{ fontSize: '0.813rem' }}>
                    {h.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Contact Information */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 2, fontSize: '0.875rem' }}>
            📞 Contact Information
          </Typography>
          <Grid container spacing={1.5}>
            {[
              ['mobileNumber', 'Mobile Number'],
              ['alternateMobileNumber', 'Alternate Mobile Number'],
              ['email', 'Email'],
            ].map(([key, label]) => (
              <Grid item xs={12} sm={key === 'email' ? 12 : 6} key={key}>
                <TextField 
                  fullWidth 
                  size="small"
                  label={label} 
                  value={formData[key] || ''} 
                  onChange={(e) => onChange(key, e.target.value)} 
                  disabled={isView}
                  InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                  inputProps={{ style: { fontSize: '0.813rem' } }}
                />
              </Grid>
            ))}
          </Grid>

          {/* Parent/Guardian Information */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 2, fontSize: '0.875rem' }}>
            👨‍👩‍👧 Parent/Guardian Information
          </Typography>
          <Grid container spacing={1.5}>
            {[
              ['fatherName', 'Father Name'],
              ['motherName', 'Mother Name'],
              ['guardianName', 'Guardian Name'],
            ].map(([key, label]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField 
                  fullWidth 
                  size="small"
                  label={label} 
                  value={formData[key] || ''} 
                  onChange={(e) => onChange(key, e.target.value)} 
                  disabled={isView}
                  InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                  inputProps={{ style: { fontSize: '0.813rem' } }}
                />
              </Grid>
            ))}
          </Grid>

          {/* Address Information */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 2, fontSize: '0.875rem' }}>
            🏠 Address Information
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                size="small"
                multiline 
                rows={2} 
                label="Address" 
                value={formData.address} 
                onChange={(e) => onChange('address', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                inputProps={{ style: { fontSize: '0.813rem' } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth 
                size="small"
                label="City" 
                value={formData.city || ''} 
                onChange={(e) => onChange('city', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                inputProps={{ style: { fontSize: '0.813rem' } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField 
                select 
                fullWidth 
                size="small"
                label="State" 
                value={formData.state || ''} 
                onChange={(e) => onChange('state', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select State</MenuItem>
                {(dropdownOptions.states || [
                  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
                  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
                  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
                  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
                ]).map((state) => (
                  <MenuItem key={state} value={state} sx={{ fontSize: '0.813rem' }}>{state}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth 
                size="small"
                label="Pincode" 
                value={formData.pincode || ''} 
                onChange={(e) => onChange('pincode', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                inputProps={{ style: { fontSize: '0.813rem' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField 
                select 
                fullWidth 
                size="small"
                label="Status" 
                value={formData.status} 
                onChange={(e) => onChange('status', e.target.value)} 
                disabled={isView}
                InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                SelectProps={{ style: { fontSize: '0.813rem' } }}
              >
                {['Active', 'Inactive'].map((status) => (
                  <MenuItem key={status} value={status} sx={{ fontSize: '0.813rem' }}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Transport Details */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 2, fontSize: '0.875rem' }}>
            🚌 Transport Details
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.transportEnabled}
                    onChange={(e) => onChange('transportEnabled', e.target.checked)}
                    disabled={isView}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: '0.813rem' }}>Enable Transport</Typography>}
              />
            </Grid>

            {formData.transportEnabled && (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    select 
                    fullWidth 
                    size="small"
                    label="Route" 
                    value={formData.route || ''} 
                    onChange={(e) => onChange('route', e.target.value)} 
                    disabled={isView}
                    InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                    SelectProps={{ style: { fontSize: '0.813rem' } }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select Route</MenuItem>
                    {(dropdownOptions?.routes || []).map((route) => (
                      <MenuItem key={route._id} value={route._id} sx={{ fontSize: '0.813rem' }}>
                        {route.name || route.routeName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    size="small"
                    label="Pickup Point" 
                    value={formData.pickupPoint || ''} 
                    onChange={(e) => onChange('pickupPoint', e.target.value)} 
                    disabled={isView}
                    InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                    inputProps={{ style: { fontSize: '0.813rem' } }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    select 
                    fullWidth 
                    size="small"
                    label="Fees Month" 
                    value={formData.transportFeesMonth || ''} 
                    onChange={(e) => onChange('transportFeesMonth', e.target.value)} 
                    disabled={isView}
                    InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                    SelectProps={{ style: { fontSize: '0.813rem' } }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select Month</MenuItem>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                      <MenuItem key={month} value={month} sx={{ fontSize: '0.813rem' }}>{month}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>

          {/* Hostel Details */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 2, fontSize: '0.875rem' }}>
            🏨 Hostel Details
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.hostelEnabled}
                    onChange={(e) => onChange('hostelEnabled', e.target.checked)}
                    disabled={isView}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: '0.813rem' }}>Enable Hostel</Typography>}
              />
            </Grid>

            {formData.hostelEnabled && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    select 
                    fullWidth 
                    size="small"
                    label="Hostel" 
                    value={formData.hostel || ''} 
                    onChange={(e) => onChange('hostel', e.target.value)} 
                    disabled={isView}
                    InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                    SelectProps={{ style: { fontSize: '0.813rem' } }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select Hostel</MenuItem>
                    {(dropdownOptions?.hostels || []).map((hostel) => (
                      <MenuItem key={hostel._id} value={hostel._id} sx={{ fontSize: '0.813rem' }}>
                        {hostel.name || hostel.hostelName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField 
                    select 
                    fullWidth 
                    size="small"
                    label="Room No." 
                    value={formData.roomNumber || ''} 
                    onChange={(e) => onChange('roomNumber', e.target.value)} 
                    disabled={isView}
                    InputLabelProps={{ style: { fontSize: '0.813rem' } }}
                    SelectProps={{ style: { fontSize: '0.813rem' } }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.813rem' }}>Select Room</MenuItem>
                    {(dropdownOptions?.rooms || []).map((room) => (
                      <MenuItem key={room._id || room} value={room.roomNumber || room} sx={{ fontSize: '0.813rem' }}>
                        {room.roomNumber || room}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>

          {/* Fees Details */}
          <Typography variant="subtitle2" sx={{ color: '#6a1b9a', fontWeight: 600, mb: 1.5, mt: 2, fontSize: '0.875rem' }}>
            💰 Fees Details
          </Typography>
          <Box sx={{ mb: 2 }}>
            {(dropdownOptions?.feesStructure && dropdownOptions.feesStructure.length > 0) ? (
              dropdownOptions.feesStructure.map((feeClass, index) => (
                <Accordion 
                  key={index}
                  sx={{ 
                    mb: 1,
                    '&:before': { display: 'none' },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      minHeight: '40px',
                      '& .MuiAccordionSummary-content': { 
                        margin: '8px 0',
                        alignItems: 'center',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          size="small"
                          checked={formData.feesDetails?.some(f => f.className === feeClass.className) || false}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                feesDetails: [...(prev.feesDetails || []), {
                                  className: feeClass.className,
                                  totalAmount: feeClass.totalAmount,
                                  feeItems: feeClass.feeItems || []
                                }]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                feesDetails: (prev.feesDetails || []).filter(f => f.className !== feeClass.className)
                              }));
                            }
                          }}
                          disabled={isView}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Typography sx={{ fontSize: '0.813rem', fontWeight: 500 }}>
                          {feeClass.className}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.813rem', fontWeight: 600, color: '#6a1b9a' }}>
                        ₹{feeClass.totalAmount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: '#fafafa' }}>
                          <TableRow>
                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.5 }}>Fees Type</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.5 }}>Due Date</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.5 }} align="right">Amount (₹)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(feeClass.feeItems || []).map((item, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>{item.feesType}</TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB') : '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }} align="right">
                                {item.amount?.toFixed(2) || '0.00'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography sx={{ fontSize: '0.813rem', color: '#999', textAlign: 'center', py: 2 }}>
                No fees structure available
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      {!isView && (
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined" 
            size="small"
            sx={{ 
              textTransform: 'none',
              fontSize: '0.813rem',
              borderColor: '#6a1b9a',
              color: '#6a1b9a',
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="student-form"
            variant="contained" 
            size="small"
            startIcon={<SaveIcon />}
            disabled={submitLoading}
            sx={{ 
              textTransform: 'none',
              fontSize: '0.813rem',
              backgroundColor: '#6a1b9a',
              '&:hover': { backgroundColor: '#4a148c' },
            }}
          >
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default StudentAdmissionDialog;
