import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchDataFromApi } from '@/utils/api';

interface AttendanceData {
  percentage: number;
  present: number;
  absent: number;
  leave: number;
  total: number;
}

interface Event {
  _id: string;
  title: string;
  date: string;
  description?: string;
}

interface Holiday {
  _id: string;
  title: string;
  date: string;
  description?: string;
}

interface Notice {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface StaffUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  designation?: string;
  school_name?: string;
  image_url?: string;
}

interface StaffDashboardContextType {
  user: StaffUser | null;
  attendance: AttendanceData;
  events: Event[];
  holidays: Holiday[];
  notices: Notice[];
  loading: boolean;
  attendanceLoading: boolean;
  eventsLoading: boolean;
  holidaysLoading: boolean;
  noticesLoading: boolean;
  error: string | null;
  fetchStaffDashboard: () => Promise<void>;
  fetchStaffAttendance: () => Promise<void>;
  fetchUpcomingEvents: () => Promise<void>;
  fetchUpcomingHolidays: () => Promise<void>;
  fetchRecentNotices: (limit?: number) => Promise<void>;
  fetchAllDashboardData: () => Promise<void>;
  clearData: () => void;
}

const StaffDashboardContext = createContext<StaffDashboardContextType | null>(null);

export const useStaffDashboard = (): StaffDashboardContextType => {
  const ctx = useContext(StaffDashboardContext);
  if (!ctx) throw new Error('useStaffDashboard must be used inside StaffDashboardProvider');
  return ctx;
};

export const StaffDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [attendance, setAttendance] = useState<AttendanceData>({
    percentage: 0,
    present: 0,
    absent: 0,
    leave: 0,
    total: 0,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [loading, setLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Staff profile details
  const fetchStaffDashboard = useCallback(async () => {
    try {
      const response = await fetchDataFromApi('/dashboard/staff-dashboard');
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err: any) {
      console.error('Error fetching staff profile:', err);
      setError(err.message || 'Failed to fetch staff details');
    }
  }, []);

  // Fetch Staff Attendance
  const fetchStaffAttendance = useCallback(async () => {
    try {
      setAttendanceLoading(true);
      setError(null);
      const response = await fetchDataFromApi('/dashboard/staff-attendance');
      if (response.success && response.data) {
        setAttendance(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching staff attendance:', err);
      setError(err.message || 'Failed to fetch attendance');
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  // Fetch Upcoming Events
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      setError(null);
      const response = await fetchDataFromApi('/dashboard/upcoming-events');
      if (response.success && response.data) {
        setEvents(response.data.events || []);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Fetch Upcoming Holidays
  const fetchUpcomingHolidays = useCallback(async () => {
    try {
      setHolidaysLoading(true);
      setError(null);
      const response = await fetchDataFromApi('/dashboard/upcoming-holidays');
      if (response.success && response.data) {
        setHolidays(response.data.holidays || []);
      }
    } catch (err: any) {
      console.error('Error fetching holidays:', err);
      setError(err.message || 'Failed to fetch holidays');
    } finally {
      setHolidaysLoading(false);
    }
  }, []);

  // Fetch Recent Notices
  const fetchRecentNotices = useCallback(async (limit = 5) => {
    try {
      setNoticesLoading(true);
      setError(null);
      const response = await fetchDataFromApi(`/dashboard/recent-notices?limit=${limit}`);
      if (response.success && response.data) {
        setNotices(response.data.notices || []);
      }
    } catch (err: any) {
      console.error('Error fetching notices:', err);
      setError(err.message || 'Failed to fetch notices');
    } finally {
      setNoticesLoading(false);
    }
  }, []);

  // Fetch all dashboard data at once
  const fetchAllDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStaffDashboard(),
        fetchStaffAttendance(),
        fetchUpcomingEvents(),
        fetchUpcomingHolidays(),
        fetchRecentNotices(5),
      ]);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchStaffDashboard, fetchStaffAttendance, fetchUpcomingEvents, fetchUpcomingHolidays, fetchRecentNotices]);

  // Clear all data
  const clearData = useCallback(() => {
    setUser(null);
    setAttendance({
      percentage: 0,
      present: 0,
      absent: 0,
      leave: 0,
      total: 0,
    });
    setEvents([]);
    setHolidays([]);
    setNotices([]);
    setError(null);
  }, []);

  const value: StaffDashboardContextType = {
    user,
    attendance,
    events,
    holidays,
    notices,
    loading,
    attendanceLoading,
    eventsLoading,
    holidaysLoading,
    noticesLoading,
    error,
    fetchStaffDashboard,
    fetchStaffAttendance,
    fetchUpcomingEvents,
    fetchUpcomingHolidays,
    fetchRecentNotices,
    fetchAllDashboardData,
    clearData,
  };

  return (
    <StaffDashboardContext.Provider value={value}>
      {children}
    </StaffDashboardContext.Provider>
  );
};
