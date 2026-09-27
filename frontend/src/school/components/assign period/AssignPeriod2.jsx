/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Container, Button, Select, MenuItem, InputLabel, FormControl, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { baseUrl } from '../../../environment';
import { buildLocalPeriodIso, getSlotIdFromDate } from '../../../utils/scheduleSlots';

const periods = [
  { id: 1, label: 'Period 1 (10:00 AM - 11:00 AM)', startTime: '10:00', endTime: '11:00' },
  { id: 2, label: 'Period 2 (11:00 AM - 12:00 PM)', startTime: '11:00', endTime: '12:00' },
  { id: 3, label: 'Period 3 (12:00 PM - 1:00 PM)', startTime: '12:00', endTime: '13:00' },
  { id: 4, label: 'Period 4 (1:00 PM - 2:00 PM)', startTime: '13:00', endTime: '14:00' },
  { id: 5, label: 'Period 5 (2:00 PM - 3:00 PM)', startTime: '14:00', endTime: '15:00' },
  { id: 6, label: 'Period 6 (3:00 PM - 4:00 PM)', startTime: '15:00', endTime: '16:00' },
];

const AssignPeriod2 = ({classId,isEdit, periodId, close}) => {
  const [teachers, setTeachers] = useState([]);
//   const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacher, setTeacher] = useState('');
  const [subject, setSubject] = useState('');
//   const [classId, setClassId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [date, setDate] = useState(new Date());
  
  const [message, setMessage] = useState("");
  

  useEffect(() => {
    // Fetch teachers, classes, and subjects
    const fetchData = async () => {
      const teacherResponse = await axios.get(`${baseUrl}/teacher/fetch-with-query`, { params: {} });
      const subjectResponse = await axios.get(`${baseUrl}/subject/fetch-all`, { params: {} });
      setSubjects(subjectResponse.data.data);
      setTeachers(teacherResponse.data.data);
    //   setClasses(classResponse.data.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriod) {
      alert('Please select a period');
      return;
    }

    try {
      const startIso = buildLocalPeriodIso(date, selectedPeriod.startTime);
      const endIso = buildLocalPeriodIso(date, selectedPeriod.endTime);
      if (!startIso || !endIso) {
        alert('Invalid date or time for this period.');
        return;
      }
      await axios.post(`${baseUrl}/period/create`, {
        teacher,
        subject,
        classId,
        startTime: startIso,
        endTime: endIso,
      });
      alert('Period assigned successfully');
      setMessage("Perid assigned Successfully.");
      close()
    } catch (error) {
      console.error('Error assigning period:', error);
      setMessage("Error in Assigning.")
    }
  };

  const handleUpdateEvent = async () => {
    try {
      const startIso = buildLocalPeriodIso(date, selectedPeriod.startTime);
      const endIso = buildLocalPeriodIso(date, selectedPeriod.endTime);
      if (!startIso || !endIso) {
        alert('Invalid date or time for this period.');
        return;
      }
      await axios.put(`${baseUrl}/period/update/${periodId}`, {
        teacher,
        subject,
        classId,
        startTime: startIso,
        endTime: endIso,
      });
      alert('Period updated successfully');
      setMessage('Period updated successfully');
      close()
    } catch (error) {
      console.error('Error updating period:', error);
      setMessage("Period update Error.")
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await axios.delete(`${baseUrl}/period/delete/${periodId}`);
      alert('Period deleted successfully');
      setMessage("Period deleted successfully.")
      close()
    } catch (error) {
      console.error('Error deleting period:', error);
      setMessage("Error in period delete.")
    }
  };

  // Fetch the period details if editing
  const fetchPeriodsWithId = async (periodIdParam) => {
    try {
      const response = await axios.get(`${baseUrl}/period/${periodIdParam}`);
      const periodData = response.data.period;
      const slotId = getSlotIdFromDate(periodData.startTime);
      setTeacher(periodData.teacher._id);
      setSubject(periodData.subject._id);
      setSelectedPeriod(slotId ? periods.find((p) => p.id === slotId) : null);
      const raw = periodData.startTime;
      setDate(typeof raw === 'string' ? raw.substring(0, 10) : new Date(raw).toISOString().slice(0, 10));
    } catch (error) {
      console.error('Error fetching period details:', error);
    }
  };

  useEffect(() => {
    if (isEdit && periodId) {
      fetchPeriodsWithId(periodId);
    }
  }, [isEdit, periodId]);



  return (
    <Container>
      <h2>Assign Period to Teacher</h2>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Teacher</InputLabel>
          <Select label={"Teacher"} value={teacher} onChange={(e) => setTeacher(e.target.value)} required>
            {teachers.map((teacher) => (
              <MenuItem key={teacher._id} value={teacher._id}>{teacher.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Subject</InputLabel>
          <Select label={"Subject"} value={subject} onChange={(e) => setSubject(e.target.value)} required>
            {subjects.map((sbj) => (
              <MenuItem key={sbj._id} value={sbj._id}>{sbj.subject_name}</MenuItem>
            ))}
          </Select>
        </FormControl>


        {/* Select predefined periods */}
     
          <FormControl fullWidth margin="normal">
          <InputLabel>Select Period</InputLabel>
          <Select value={selectedPeriod?selectedPeriod.id:""}
          label="Select Period"
           onChange={(e) => setSelectedPeriod(periods.find(p => p.id === e.target.value))}
           disabled={isEdit?true:false}
            required>
            {periods.map((period) => (
              <MenuItem key={period.id} value={period.id}>
                {period.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
      

        <TextField
          label="Date"
          type="date"
          fullWidth
          // InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isEdit?true:false}
          required
        />

       
        {isEdit?<>
            <Button onClick={handleDeleteEvent} color="secondary">
            Delete
          </Button>
          <Button onClick={handleUpdateEvent} color="primary">
            Update
          </Button>
          </>:
           <Button type="submit" variant="contained" color="primary">
           Assign Period
         </Button>
         }
      </form>
    </Container>
  );
};

export default AssignPeriod2;
