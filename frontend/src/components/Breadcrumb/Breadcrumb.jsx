import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import './Breadcrumb.css';

// Route labels mapping for better readability
const routeLabels = {
  // Common
  home: 'Home',
  dashboard: 'Dashboards',
  dashboards: 'Dashboards',
  'staff-dashboard': 'Staff Dashboard',

  // School routes
  school: 'School',
  class: 'Classes',
  'class-details': 'Class Details',
  subject: 'Subjects',
  students: 'Students',
  teachers: 'Teachers',
  'assign-period': 'Assign Period',
  periods: 'Schedule',
  attendance: 'Attendance',
  'attendance-student': 'Student Attendance',
  examinations: 'Examinations',
  notice: 'Notices',
  'front-office': 'Front Office',
  'admission-enquiry': 'Admission Enquiry',
  'visitor-book': 'Visitor Book',
  'phone-call-log': 'Phone Call Log',
  'postal-receive': 'Postal Receive',
  'postal-dispatch': 'Postal Dispatch',
  complain: 'Complaints',
  setup: 'Setup',
  homework: 'Homework',
  list: 'List',
  library: 'Library',
  books: 'Books',
  fees: 'Fees',
  collect: 'Collect Fees',
  student: 'Student',
  'demand-bill': 'Demand Bill',
  'search-due': 'Search Due',
  master: 'Fees Master',
  group: 'Fees Group',
  type: 'Fees Type',
  discount: 'Fees Discount',
  'carry-forward': 'Carry Forward',
  'fee-collection': 'Fee Collection',
  'offline-bank-payment': 'Offline Bank Payment',
  'search-payment': 'Search Payment',
  transport: 'Transport',
  routes: 'Routes',
  'study-material': 'Study Material',
  upload: 'Upload',
  leave: 'Leave',
  approve: 'Approve Leave',
  admission: 'Admission',
  add: 'Add Student',
  view: 'View',
  'online-admission': 'Online Admission',
  'multi-class': 'Multi Class',
  disabled: 'Disabled Students',
  'bulk-delete': 'Bulk Delete',
  category: 'Category',
  house: 'House',
  disable: 'Disable Reason',

  // Student routes
  'student-details': 'Student Details',

  // Teacher routes
  teacher: 'Teacher',
  details: 'Details',

  // Accountant routes
  accountant: 'Accountant',

  // Librarian routes
  librarian: 'Librarian',

  // Receptionist routes
  receptionist: 'Receptionist',

  // Parent routes
  parent: 'Parent',
  children: 'Children',

  // Super Admin routes
  'super-admin': 'Super Admin',
  'pending-schools': 'Pending Schools',

  // Vice Admin routes
  'vice-admin': 'Vice Admin',
  profile: 'Profile',

  // Client routes
  contact: 'Contact',
  login: 'Login',
  register: 'Register',
  schools: 'Schools',
  'forgot-password': 'Forgot Password',
  apply: 'Apply Admission',
  'application-success': 'Application Success',
};

// Get label for a route segment
const getLabel = (segment) => {
  return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
};

// Check if segment is an ID (UUID or MongoDB ObjectId pattern)
const isId = (segment) => {
  const objectIdPattern = /^[a-f\d]{24}$/i;
  const uuidPattern = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
  const numericPattern = /^\d+$/;

  return objectIdPattern.test(segment) || uuidPattern.test(segment) || numericPattern.test(segment);
};

export default function Breadcrumb() {
  const location = useLocation();

  // Split pathname and filter out empty strings
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumb on home page or root
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'home')) {
    return null;
  }

  // Build breadcrumb items (Home is always the first, fixed item)
  const breadcrumbItems = [];
  let currentPath = '';

  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip IDs in breadcrumb display but keep them in path
    if (isId(segment)) {
      return;
    }

    const isLast = index === pathnames.length - 1;
    const label = getLabel(segment);

    breadcrumbItems.push({
      path: currentPath,
      label: label,
      isLast: isLast,
    });
  });

  // If no valid breadcrumb items (all were IDs), don't show breadcrumb
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Box className="breadcrumb-container">
      <Breadcrumbs
        separator="/"
        aria-label="breadcrumb"
        className="breadcrumb"
      >
        {/* Home as plain text link, matching screenshot style */}
        <Link to="/" className="breadcrumb-link">
          Home
        </Link>

        {breadcrumbItems.map((item) => {
          if (item.isLast) {
            return (
              <Typography key={item.path} className="breadcrumb-current">
                {item.label}
              </Typography>
            );
          }

          return (
            <Link key={item.path} to={item.path} className="breadcrumb-link">
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}