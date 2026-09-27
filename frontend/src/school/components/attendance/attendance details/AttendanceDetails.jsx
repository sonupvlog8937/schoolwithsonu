import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {Chart, ArcElement} from 'chart.js'

import axios from 'axios';
import { useParams } from 'react-router-dom';
import { baseUrl } from '../../../../environment';

const AttendanceDetails = () => {
    Chart.register(ArcElement);

  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({
    presentCount: 0,
    absentCount: 0,
    totalRecords: 0,
    attendancePercentage: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const studentId= useParams().studentId;

const dateConvert = (date)=>{
    const dateData  = new Date(date);
    return dateData.getDate()+"-"+ (+dateData.getMonth()+1) + "-" + dateData.getFullYear();
}


  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/attendance/${studentId}`, {
          params: {
            page: pagination.page,
            limit: pagination.limit,
          },
        });
        setAttendanceData(response.data.data || []);
        setSummary(
          response.data.summary || {
            presentCount: 0,
            absentCount: 0,
            totalRecords: 0,
            attendancePercentage: 0,
          }
        );
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
          }));
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };
  

    fetchAttendanceData();
  }, [studentId, pagination.page, pagination.limit]);

  // Data for the chart
  const data = {
    datasets: [
      {
        data:[summary.presentCount, summary.absentCount],
        backgroundColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
        hoverOffset:20
      },
    ],
    labels: ['Present', 'Absent'],
  };


  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Student Attendance</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Total Records</Typography>
          <Typography variant="h6">{summary.totalRecords}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Present</Typography>
          <Typography variant="h6" color="success.main">{summary.presentCount}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Absent</Typography>
          <Typography variant="h6" color="error.main">{summary.absentCount}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Overall Attendance</Typography>
          <Typography variant="h6">{summary.attendancePercentage}%</Typography>
        </Paper>
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
        {/* Attendance Chart */}
        <Box >
          <Typography variant="h6">Attendance Summary</Typography>
          <Pie style={{padding:"20px"}}  data={data} />
        </Box>

        {/* Attendance List */}
        <Box flex={1}>
          <Typography variant="h6">Attendance Records</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.length > 0 ? (
                attendanceData.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{dateConvert(record.date)}</TableCell>
                    <TableCell>{record.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">No attendance records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box
            sx={{
              marginTop: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <FormControl size="small" sx={{ minWidth: "120px" }}>
              <InputLabel id="attendance-details-limit-label">Per Page</InputLabel>
              <Select
                labelId="attendance-details-limit-label"
                label="Per Page"
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    page: 1,
                  }))
                }
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>

            <Pagination
              color="primary"
              page={pagination.page}
              count={pagination.totalPages || 1}
              onChange={(_, value) =>
                setPagination((prev) => ({ ...prev, page: value }))
              }
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AttendanceDetails;
