import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addStudent,
  clearCurrentStudent,
  clearMessages,
  fetchDropdownOptions,
  fetchStudentById,
  updateStudent,
} from '../../../state/studentAdmissionSlice';

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
  status: 'Active',
};

const toInputDate = (date) => (date ? new Date(date).toISOString().slice(0, 10) : '');

const StudentAdmissionForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, mode } = useParams();

  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const { dropdownOptions, currentStudent, submitLoading, loading, error, successMsg } = useSelector(
    (state) => state.studentAdmission
  );

  const [formData, setFormData] = useState(defaultForm);

  const title = useMemo(() => {
    if (isView) return 'View Student Admission';
    if (isEdit) return 'Edit Student Admission';
    return 'Add Student Admission';
  }, [isEdit, isView]);

  useEffect(() => {
    dispatch(fetchDropdownOptions());
    if (id) dispatch(fetchStudentById(id));
    return () => {
      dispatch(clearCurrentStudent());
      dispatch(clearMessages());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentStudent && id) {
      setFormData({
        ...defaultForm,
        ...currentStudent,
        class: currentStudent.class?._id || currentStudent.class || '',
        dateOfBirth: toInputDate(currentStudent.dateOfBirth),
        admissionDate: toInputDate(currentStudent.admissionDate),
      });
    }
  }, [currentStudent, id]);

  useEffect(() => {
    if (successMsg) {
      navigate('/school/students/admission');
    }
  }, [successMsg, navigate]);

  const onChange = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (isEdit) {
      dispatch(updateStudent({ id, data: payload }));
      return;
    }
    dispatch(addStudent(payload));
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(180deg, #f7f1ff 0%, #ffffff 40%)' }}>
      <Card sx={{ borderRadius: 3, border: '1px solid #ead9ff', boxShadow: '0 10px 30px rgba(109,40,217,0.08)' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ color: '#5b21b6', fontWeight: 700 }}>{title}</Typography>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/school/students/admission')}>Back</Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={onSubmit}>
            {/* Personal Information Section */}
            <Typography variant="h6" sx={{ color: '#5b21b6', fontWeight: 600, mb: 2, mt: 2 }}>
              📋 Personal Information
            </Typography>
            <Grid container spacing={2}>
              {[
                ['admissionNo', 'Admission No*'],
                ['rollNumber', 'Roll Number'],
                ['firstName', 'First Name*'],
                ['lastName', 'Last Name'],
              ].map(([key, label]) => (
                <Grid item xs={12} md={6} key={key}>
                  <TextField fullWidth label={label} value={formData[key] || ''} onChange={(e) => onChange(key, e.target.value)} disabled={isView} />
                </Grid>
              ))}

              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Class*" value={formData.class} onChange={(e) => onChange('class', e.target.value)} disabled={isView}>
                  {dropdownOptions.classes?.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Section" value={formData.section || ''} onChange={(e) => onChange('section', e.target.value)} disabled={isView}>
                  {['A', 'B', 'C', 'D', 'E'].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Gender" value={formData.gender} onChange={(e) => onChange('gender', e.target.value)} disabled={isView}>
                  {['Male', 'Female', 'Other'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField type="date" fullWidth label="Date of Birth" value={formData.dateOfBirth} onChange={(e) => onChange('dateOfBirth', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} disabled={isView} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField type="date" fullWidth label="Admission Date" value={formData.admissionDate} onChange={(e) => onChange('admissionDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} disabled={isView} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Blood Group" value={formData.bloodGroup} onChange={(e) => onChange('bloodGroup', e.target.value)} disabled={isView}>
                  {(dropdownOptions.bloodGroups || []).map((group) => <MenuItem key={group} value={group}>{group}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>

            {/* Category & Religion Section */}
            <Typography variant="h6" sx={{ color: '#5b21b6', fontWeight: 600, mb: 2, mt: 3 }}>
              🏛️ Category & Religion
            </Typography>
            <Grid container spacing={2}>
              {[
                ['category', 'Category'],
                ['religion', 'Religion'],
                ['caste', 'Caste'],
                ['house', 'House'],
              ].map(([key, label]) => (
                <Grid item xs={12} md={6} key={key}>
                  <TextField fullWidth label={label} value={formData[key] || ''} onChange={(e) => onChange(key, e.target.value)} disabled={isView} />
                </Grid>
              ))}
            </Grid>

            {/* Contact Information Section */}
            <Typography variant="h6" sx={{ color: '#5b21b6', fontWeight: 600, mb: 2, mt: 3 }}>
              📞 Contact Information
            </Typography>
            <Grid container spacing={2}>
              {[
                ['mobileNumber', 'Mobile Number'],
                ['email', 'Email'],
              ].map(([key, label]) => (
                <Grid item xs={12} md={6} key={key}>
                  <TextField fullWidth label={label} value={formData[key] || ''} onChange={(e) => onChange(key, e.target.value)} disabled={isView} />
                </Grid>
              ))}
            </Grid>

            {/* Parent/Guardian Information Section */}
            <Typography variant="h6" sx={{ color: '#5b21b6', fontWeight: 600, mb: 2, mt: 3 }}>
              👨‍👩‍👧 Parent/Guardian Information
            </Typography>
            <Grid container spacing={2}>
              {[
                ['fatherName', 'Father Name'],
                ['motherName', 'Mother Name'],
                ['guardianName', 'Guardian Name'],
              ].map(([key, label]) => (
                <Grid item xs={12} md={6} key={key}>
                  <TextField fullWidth label={label} value={formData[key] || ''} onChange={(e) => onChange(key, e.target.value)} disabled={isView} />
                </Grid>
              ))}
            </Grid>

            {/* Address Information Section */}
            <Typography variant="h6" sx={{ color: '#5b21b6', fontWeight: 600, mb: 2, mt: 3 }}>
              🏠 Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Address" value={formData.address} onChange={(e) => onChange('address', e.target.value)} disabled={isView} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="City" value={formData.city || ''} onChange={(e) => onChange('city', e.target.value)} disabled={isView} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="State" value={formData.state || ''} onChange={(e) => onChange('state', e.target.value)} disabled={isView}>
                  <MenuItem value="">Select State</MenuItem>
                  {(dropdownOptions.states || [
                    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
                    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
                    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
                    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
                  ]).map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Pincode" value={formData.pincode || ''} onChange={(e) => onChange('pincode', e.target.value)} disabled={isView} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Status" value={formData.status} onChange={(e) => onChange('status', e.target.value)} disabled={isView}>
                  {['Active', 'Inactive'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>

            {!isView && (
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={submitLoading || loading} sx={{ backgroundColor: '#6d28d9' }}>
                  {isEdit ? 'Update Admission' : 'Save Admission'}
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentAdmissionForm;