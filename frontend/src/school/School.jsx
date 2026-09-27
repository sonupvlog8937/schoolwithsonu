import * as React from 'react';
import { styled, useTheme, alpha, keyframes } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';

import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GradingIcon from '@mui/icons-material/Grading';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ComputerIcon from '@mui/icons-material/Computer';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CampaignIcon from '@mui/icons-material/Campaign';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import InventoryIcon from '@mui/icons-material/Inventory';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import HotelIcon from '@mui/icons-material/Hotel';
import WebIcon from '@mui/icons-material/Web';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

import { APP_NAME, LOGO_URL } from '../branding';
import { AuthContext } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

// ─── Design tokens ────────────────────────────────────────────────────────────
const DRAWER_WIDTH = 260;
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const EASE = 'cubic-bezier(.22,1,.36,1)';

const SB_BG      = 'linear-gradient(180deg, #151829 0%, #1a1e36 55%, #171a30 100%)';
const SB_HOVER   = '#252a45';
const SB_BORDER  = '#2a2f4c';
const SB_ICON    = '#8790b8';
const SB_TEXT    = '#c3c8e4';
const SB_ACCENT  = '#7c8ffc';

const RAINBOW = 'linear-gradient(90deg,#7c8ffc,#38bdf8,#34d399,#fbbf24,#fb923c,#f472b6,#a78bfa,#7c8ffc)';
const CONIC   = 'conic-gradient(from 90deg,#7c8ffc,#38bdf8,#34d399,#fbbf24,#f472b6,#a78bfa,#7c8ffc)';

// Each sidebar module gets its own colour (keyed by label, so NAV_ITEMS stays untouched)
const MODULE_COLORS = {
    'Master Configuration': '#818cf8',
    'Dashboards':           '#38bdf8',
    'Academics':            '#a78bfa',
    'Communicate':          '#f472b6',
    'Campus Feed':          '#22d3ee',
    'Student Profile':      '#fb923c',
    'School Activity':      '#facc15',
    'Student Info':         '#34d399',
    'Student Fee':          '#f87171',
    'Exam':                 '#c084fc',
    'Student Bank':         '#2dd4bf',
    'Accounts':             '#4ade80',
    'Store Room':           '#f59e0b',
    'Human Resource':       '#60a5fa',
    'Leave':                '#fb7185',
    'Inventory':            '#a3e635',
    'Curriculum Planning':  '#e879f9',
    'Report':               '#7dd3fc',
    'Timetable':            '#fdba74',
    'Transport':            '#fcd34d',
    'Hostel':               '#c4b5fd',
    'Library':              '#6ee7b7',
    'Online Classes':       '#67e8f9',
    'Academic Content':     '#f9a8d4',
    'Import Export':        '#86efac',
    'Access Control':       '#94a3b8',
    'Parent Accounts':      '#fca5a5',
    'Website Configuration':'#5eead4',
    'Behaviour':            '#d8b4fe',
    'Log Out':              '#ff6b81',
};
const FALLBACK_PALETTE = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#fb923c', '#f472b6', '#a78bfa'];
const getColor = (label = '') => {
    if (MODULE_COLORS[label]) return MODULE_COLORS[label];
    let h = 0;
    for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
    return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
};

const SCHOOL_DOC_TITLE_MAP = {
    '/school': 'Dashboard',
    '/school/class': 'Classes',
    '/school/subject': 'Subjects',
    '/school/students': 'Students',
    '/school/teachers': 'Teachers',
    '/school/periods': 'Schedule',
    '/school/attendance': 'Attendance',
    '/school/examinations': 'Examinations',
    '/school/notice': 'Notices',
};

// ─── Animations ───────────────────────────────────────────────────────────────
const slideIn = keyframes`
    from { opacity: 0; transform: translateX(-14px); }
    to   { opacity: 1; transform: none; }
`;
const flow = keyframes`
    from { background-position: 0% 50%; }
    to   { background-position: 200% 50%; }
`;
const pop = keyframes`
    from { opacity: 0; transform: scale(.94) translateY(10px); }
    to   { opacity: 1; transform: none; }
`;

// `backwards` fill so hover transforms still work after the entrance finishes.
const motion = (name, duration = '0.4s', delay = '0s') => ({
    animation: `${name} ${duration} ${EASE} ${delay} backwards`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

// ─── Styled Components ────────────────────────────────────────────────────────
const openedMixin = (theme) => ({
    width: DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: alpha('#ffffff', 0.86),
    backdropFilter: 'blur(14px) saturate(160%)',
    color: '#1a1a2e',
    boxShadow: '0 4px 24px rgba(99,102,241,0.07)',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                [theme.breakpoints.up('md')]: {
                    marginLeft: DRAWER_WIDTH,
                    width: `calc(100% - ${DRAWER_WIDTH}px)`,
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
            },
        },
    ],
}));

const DesktopDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    // Master Configuration Module
    {
        label: 'Master Configuration', icon: SettingsIcon,
        children: [
            { link: '/school/master/session', label: 'Session' },
            { link: '/school/master/school-info', label: 'School Info' },
            { link: '/school/master/rooms-assign', label: 'Rooms Assign' },
            { link: '/school/master/app-version', label: 'App Version' },
            { link: '/school/master/house-name', label: 'House Name' },
            { link: '/school/master/hobby-group', label: 'Hobby Group' },
            { link: '/school/master/religion', label: 'Religion' },
            { link: '/school/master/disabilities', label: 'Disabilities' },
            { link: '/school/master/designation', label: 'Designation' },
            { link: '/school/master/department', label: 'Department' },
            { link: '/school/master/library-setting', label: 'Library Setting' },
            { link: '/school/master/general-settings', label: 'General Settings' },
            { link: '/school/master/online-payment', label: 'Online Payment' },
            { link: '/school/master/payment-method', label: 'Payment Method' },
            { link: '/school/master/sms-settings', label: 'SMS Settings' },
            { link: '/school/master/sms-template', label: 'SMS Template' },
            { link: '/school/master/biometric-device', label: 'Biometric Device' },
            { link: '/school/master/school-shifts', label: 'School Shifts' },
            { link: '/school/master/working-days-template', label: 'Working Days Template' },
            { link: '/school/master/school-config', label: 'School Config' },
            { link: '/school/master/boards', label: 'Boards' },
            { link: '/school/master/enquiry-statuses', label: 'Enquiry Statuses' },
            { link: '/school/master/enquiry-sources', label: 'Enquiry Sources' },
        ],
    },

    // Dashboards Module
    {
        label: 'Dashboards', icon: DashboardIcon,
        children: [
            { link: '/school', label: 'Dashboard' },
            { link: '/school/dashboard/staff', label: 'Staff Dashboard' },
            { link: '/school/dashboard/accounts', label: 'Accounts Dashboard' },
            { link: '/school/dashboard/fee-assignment', label: 'Fee Assignment Dashboard' },
            { link: '/school/dashboard/inventory', label: 'Inventory Dashboard' },
            { link: '/school/dashboard/library', label: 'Library Dashboard' },
            { link: '/school/dashboard/follow-up', label: 'Follow-up Dashboard' },
            { link: '/school/dashboard/complaint', label: 'Complaint Dashboard' },
            { link: '/school/dashboard/visitor', label: 'Visitor Dashboard' },
            { link: '/school/dashboard/chat', label: 'Chat Dashboard' },
            { link: '/school/dashboard/user-activity', label: 'User Activity' },
        ],
    },

    // Academics Module
    {
        label: 'Academics', icon: SchoolIcon,
        children: [
            { link: '/school/academics/sections', label: 'Sections' },
            { link: '/school/academics/classes', label: 'Classes' },
            { link: '/school/academics/subject', label: 'Subject' },
            { link: '/school/academics/assign-class-teacher', label: 'Assign Class Teacher' },
            { link: '/school/academics/timing-configuration', label: 'Timing Configuration' },
            { link: '/school/academics/student-timetable', label: 'Student Time Table' },
            { link: '/school/academics/teachers-timetable', label: 'Teachers TimeTable' },
            { link: '/school/academics/change-time-arrangement', label: 'Change Time Arrangement' },
            { link: '/school/academics/mark-absent-user-status', label: 'Mark Absent User Status' },
        ],
    },

    // Communicate Module
    {
        label: 'Communicate', icon: CampaignIcon,
        children: [
            { link: '/school/communicate/group-message', label: 'Group Message' },
            { link: '/school/communicate/particular-student', label: 'Particular Student Message' },
            { link: '/school/communicate/particular-staff', label: 'Particular Staff Message' },
            { link: '/school/communicate/particular-number-sms', label: 'Particular Number SMS' },
            { link: '/school/communicate/particular-email', label: 'Particular Email Address' },
            { link: '/school/communicate/homework', label: 'Homework' },
            { link: '/school/communicate/holidays', label: 'Holidays' },
            { link: '/school/communicate/events', label: 'Events' },
            { link: '/school/communicate/academic-calendar', label: 'Academic Calendar' },
            { link: '/school/communicate/birthday', label: 'Birthday' },
            { link: '/school/communicate/gallery', label: 'Gallery' },
            { link: '/school/communicate/hobby-group-members', label: 'Hobby Group Members' },
            { link: '/school/communicate/circular', label: 'Circular' },
            { link: '/school/communicate/popups', label: 'Popups' },
            { link: '/school/communicate/home-content', label: 'Home Content' },
            { link: '/school/communicate/sms-student-username', label: 'SMS Student User Name' },
            { link: '/school/communicate/sms-staff-username', label: 'SMS Staff User Name' },
        ],
    },

    // Campus Feed Module
    {
        label: 'Campus Feed', icon: WebIcon,
        children: [
            { link: '/school/campus-feed', label: 'Campus Feed' },
        ],
    },

    // Student Profile Module
    {
        label: 'Student Profile', icon: GroupAddIcon,
        children: [
            { link: '/school/student-profile/hub', label: 'Profile Hub' },
            { link: '/school/student-profile/pillars', label: 'Pillars' },
            { link: '/school/student-profile/event-types', label: 'Event Types' },
            { link: '/school/student-profile/event-master', label: 'Event Master' },
            { link: '/school/student-profile/all-entries', label: 'All Entries' },
            { link: '/school/student-profile/verification', label: 'Verification' },
            { link: '/school/student-profile/sports-profile', label: 'Sports Profile' },
            { link: '/school/student-profile/sports-setup', label: 'Sports Profile Setup' },
        ],
    },

    // School Activity Module
    {
        label: 'School Activity', icon: AssignmentIcon,
        children: [
            { link: '/school/activity/complaint-type', label: 'Complaint Type' },
            { link: '/school/activity/complaint-books', label: 'Complaint Books' },
            { link: '/school/activity/postal', label: 'Postal' },
            { link: '/school/activity/vistor-purposes', label: 'Vistor Purposes' },
            { link: '/school/activity/visitors-books', label: 'Visitors Books' },
            { link: '/school/activity/visitor-qr-code', label: 'Visitor QR Code' },
            { link: '/school/activity/gate-pass', label: 'Gate Pass' },
            { link: '/school/activity/admission-query', label: 'Admission Query' },
            { link: '/school/activity/seat-matrix', label: 'Seat Matrix' },
            { link: '/school/activity/enquiry-qr-code', label: 'Enquiry QR Code' },
            { link: '/school/activity/student-registration', label: 'Student Registration' },
            { link: '/school/activity/student-id-card', label: 'Student Id Card' },
            { link: '/school/activity/achievements', label: 'Achievements' },
        ],
    },

    // Student Info Module
    {
        label: 'Student Info', icon: PeopleAltIcon,
        children: [
            { link: '/school/students/admission', label: 'Admission' },
            { link: '/school/students/current', label: 'Manage Current Student' },
            { link: '/school/students/all-details', label: 'Manage Student All Details' },
            { link: '/school/students/passout', label: 'Manage Passout Student' },
            { link: '/school/students/leaving-certificate', label: 'Leaving Certificate Report' },
            { link: '/school/students/dropout', label: 'Manage Dropout Student' },
            { link: '/school/students/dropout-passout', label: 'Dropout/Passout Student' },
            { link: '/school/students/promote', label: 'Promote Student' },
            { link: '/school/attendance', label: 'Student Attendance' },
            { link: '/school/students/attendance-message', label: 'Student Attendance Message' },
            { link: '/school/leave/apply', label: 'Apply Student Leave' },
            { link: '/school/leave/records', label: 'Student Leave Records' },
            { link: '/school/leave/quota', label: 'Student Leave Quota' },
            { link: '/school/students/remarks', label: 'Student Remarks' },
            { link: '/school/students/performance', label: 'Student Performance' },
        ],
    },

    // Student Fee Module
    {
        label: 'Student Fee', icon: PaymentIcon,
        children: [
            { link: '/school/fees/schedule-class-wise', label: 'Fee Schedule (Class-wise)' },
            { link: '/school/fees/term', label: 'Fee Term' },
            { link: '/school/fees/type', label: 'Fee Type' },
            { link: '/school/fees/rebate-rules', label: 'Fee Rebate Rules' },
            { link: '/school/fees/group', label: 'Fee Group' },
            { link: '/school/fees/multi-group-assign', label: 'Multi Group Assign' },
            { link: '/school/fees/back-dues', label: 'Student Back Dues' },
            { link: '/school/fee-collection', label: 'Fee Payment' },
            { link: '/school/fees/adjustment-approvals', label: 'Fee Adjustment Approvals' },
            { link: '/school/fees/reminder', label: 'Fee Reminder' },
            { link: '/school/fees/demand-notice', label: 'Fee Demand Notice' },
            { link: '/school/fees/demand-notice-termwise', label: 'Fee Demand Notice Termwise' },
            { link: '/school/fees/promote-structure', label: 'Promote Fee Structure' },
            { link: '/school/fees/promote-back-dues', label: 'Promote Back Dues' },
        ],
    },

    // Exam Module
    {
        label: 'Exam', icon: GradingIcon,
        children: [
            { link: '/school/exam/terms', label: 'Exam Terms' },
            { link: '/school/exam/common-type', label: 'Exam Common Type' },
            { link: '/school/exam/type', label: 'Exam Type' },
            { link: '/school/exam/grading-system', label: 'Grading System' },
            { link: '/school/exam/system', label: 'Exam System' },
            { link: '/school/exam/co-scholastic-grade', label: 'Co-Scholastic Grade System' },
            { link: '/school/exam/co-scholastic-area', label: 'Co-Scholastic Area' },
            { link: '/school/exam/schedule', label: 'Exam Schedule' },
            { link: '/school/exam/online-exam', label: 'Online Exam' },
            { link: '/school/exam/hall-ticket', label: 'Hall Ticket' },
            { link: '/school/exam/marks-multi-subject', label: 'Exam Marks Multi Subject' },
            { link: '/school/exam/subject-remarks-all', label: 'Subject Remarks (All Subjects)' },
            { link: '/school/exam/subject-remarks', label: 'Subject Remarks' },
            { link: '/school/exam/marks', label: 'Exam Marks' },
            { link: '/school/exam/co-scholastic-marks', label: 'Co-Scholastic Marks' },
            { link: '/school/exam/marks-report', label: 'Exam Marks Report' },
            { link: '/school/exam/report-card', label: 'Report Card' },
            { link: '/school/exam/promote-structure', label: 'Promote Exam Structure' },
            { link: '/school/exam/test-assignment', label: 'Test Assignment' },
            { link: '/school/exam/bulk-attendance-update', label: 'Bulk Attendance Update' },
            { link: '/school/exam/system-config', label: 'Exam System Config' },
        ],
    },

    // Student Bank Module
    {
        label: 'Student Bank', icon: CreditCardIcon,
        children: [
            { link: '/school/student-bank/wallets', label: 'Wallets' },
            { link: '/school/student-bank/transactions', label: 'Transaction Report' },
        ],
    },

    // Accounts Module
    {
        label: 'Accounts', icon: AttachMoneyIcon,
        children: [
            { link: '/school/accounts/payment-requests', label: 'Payment Requests' },
            { link: '/school/accounts/event-collections', label: 'Event Collections' },
            { link: '/school/income/category', label: 'Income Category' },
            { link: '/school/expenses/category', label: 'Expense Category' },
            { link: '/school/accounts/account-head', label: 'Account Head' },
            { link: '/school/income/add', label: 'Income' },
            { link: '/school/expenses/add', label: 'Expenses' },
            { link: '/school/accounts/income-report', label: 'Income Report' },
            { link: '/school/accounts/expense-report', label: 'Expense Report' },
            { link: '/school/accounts/daily-monthly-report', label: 'Daily/Monthly Accounts Report' },
            { link: '/school/accounts/overall-summary', label: 'Overall Accounts Summary' },
            { link: '/school/accounts/group-wise-overall', label: 'Group Wise Overall' },
        ],
    },

    // Store Room Module
    {
        label: 'Store Room', icon: InventoryIcon,
        children: [
            { link: '/school/store/dashboard', label: 'Dashboard' },
            { link: '/school/store/rooms', label: 'Rooms' },
            { link: '/school/store/items', label: 'Items' },
            { link: '/school/store/current-stock', label: 'Current Stock' },
            { link: '/school/store/transactions', label: 'Transactions' },
        ],
    },

    // Human Resource Module
    {
        label: 'Human Resource', icon: PeopleAltIcon,
        children: [
            { link: '/school/hr/add-staff', label: 'Add Staff' },
            { link: '/school/teachers', label: 'Manage Staff' },
            { link: '/school/hr/payroll', label: 'Payroll' },
            { link: '/school/hr/staff-attendance', label: 'Staff Attendance' },
        ],
    },

    // Leave Module
    {
        label: 'Leave', icon: AssignmentIcon,
        children: [
            { link: '/school/leave/type', label: 'Leave Type' },
            { link: '/school/leave/define-policy', label: 'Define Leave Policy' },
            { link: '/school/leave/apply-staff', label: 'Apply Staff Leave' },
            { link: '/school/leave/staff-requests', label: 'Staff Leave Requests' },
            { link: '/school/leave/staff-balance', label: 'Staff Leave Balance' },
        ],
    },

    // Inventory Module
    {
        label: 'Inventory', icon: InventoryIcon,
        children: [
            { link: '/school/inventory/item-category', label: 'Item Category' },
            { link: '/school/inventory/add-item', label: 'Add Item' },
            { link: '/school/inventory/item-bundle', label: 'Item Bundle' },
            { link: '/school/inventory/supplier-list', label: 'Suplier List' },
            { link: '/school/inventory/purchase', label: 'Purchase' },
            { link: '/school/inventory/sell', label: 'Sell' },
            { link: '/school/inventory/sell-collection', label: 'Sell Collection Report' },
            { link: '/school/inventory/cancelled-invoice', label: 'Cancelled Invoice' },
            { link: '/school/inventory/return-invoice', label: 'Return Invoice Report' },
            { link: '/school/inventory/item-receive-sell', label: 'Item Receive Sell Report' },
        ],
    },

    // Curriculum Planning Module
    {
        label: 'Curriculum Planning', icon: AutoStoriesIcon,
        children: [
            { link: '/school/curriculum/frameworks', label: 'Frameworks' },
            { link: '/school/curriculum/curriculum-maps', label: 'Curriculum Maps' },
            { link: '/school/curriculum/resource-library', label: 'Resource Library' },
            { link: '/school/curriculum/review-dashboard', label: 'Review Dashboard' },
        ],
    },

    // Report Module
    {
        label: 'Report', icon: BarChartIcon,
        children: [
            { link: '/school/reports/downloads', label: 'Report Downloads' },
            { link: '/school/reports/campus-feed-engagement', label: 'Campus Feed Engagement' },
            { link: '/school/reports/student-leave', label: 'Student Leave Report' },
            { link: '/school/reports/receipt-wise-fee', label: 'Receipt wise Fee collection' },
            { link: '/school/reports/fee-collected', label: 'Fee Collected Report' },
            { link: '/school/reports/fee-discount', label: 'Fee Discount Report' },
            { link: '/school/reports/fee-type-term-wise', label: 'Fee Type/Term Wise Report' },
            { link: '/school/reports/datewise-fee-collected', label: 'Datewise Fee Collected Report' },
            { link: '/school/reports/termwise-fee-collected', label: 'Termwise Fee Collected Report' },
            { link: '/school/reports/fee-balance', label: 'Fee Balance Report' },
            { link: '/school/reports/termwise-balance', label: 'Termwise Balance Report' },
            { link: '/school/reports/fee-type-termwise-balance', label: 'Fee Type/Termwise Balance Report' },
            { link: '/school/reports/fee-adjustment', label: 'Fee Adjustment Report' },
            { link: '/school/reports/classwise-balance-summary', label: 'Classwise Balance Summary' },
            { link: '/school/reports/term-wise-fee', label: 'Term Wise Fee Report' },
            { link: '/school/reports/student-more-balance', label: 'Student with More Balance' },
            { link: '/school/reports/fee-due-date', label: 'Fee Due Date Report' },
            { link: '/school/reports/fee-rebate', label: 'Fee Rebate Report' },
            { link: '/school/reports/deleted-fee-receipt', label: 'Deleted Fee Receipt Report' },
            { link: '/school/reports/sell-summary', label: 'Sell Summary Report' },
            { link: '/school/reports/purchase-summary', label: 'Purchase Summary Report' },
            { link: '/school/reports/inventory-stock', label: 'Inventory Stock Report' },
            { link: '/school/reports/route-student', label: 'Route Student Report' },
            { link: '/school/reports/transport-stoppage-fee', label: 'Transport Stoppage Fee Report' },
        ],
    },

    // Timetable Module
    {
        label: 'Timetable', icon: AssignmentIcon,
        children: [
            { link: '/school/timetable/configurations', label: 'Configurations' },
            { link: '/school/timetable/subject-requirements', label: 'Subject Requirements' },
            { link: '/school/timetable/teacher-workload', label: 'Teacher Workload' },
            { link: '/school/timetable/generate', label: 'Generate Timetable' },
            { link: '/school/timetable/view-active-timetable', label: 'View Active Timetable' },
        ],
    },

    // Transport Module
    {
        label: 'Transport', icon: DirectionsBusIcon,
        children: [
            { link: '/school/transport/routes', label: 'Route' },
            { link: '/school/transport/stoppage', label: 'Stoppage' },
            { link: '/school/transport/assign-student', label: 'Assign Student' },
            { link: '/school/transport/vehicles', label: 'Vehicles' },
            { link: '/school/transport/route-student-sms', label: 'Route Student SMS' },
        ],
    },

    // Hostel Module
    {
        label: 'Hostel', icon: HotelIcon,
        children: [
            { link: '/school/hostel/room-type', label: 'Room Type' },
            { link: '/school/hostel/hostels', label: 'Hostels' },
            { link: '/school/hostel/rooms', label: 'Hostel Rooms' },
            { link: '/school/hostel/assign-fee', label: 'Assign Hostel Fee' },
        ],
    },

    // Library Module
    {
        label: 'Library', icon: LocalLibraryIcon,
        children: [
            { link: '/school/library/book-list', label: 'Book List' },
            { link: '/school/library/issue-logs', label: 'Issue logs' },
        ],
    },

    // Online Classes Module
    {
        label: 'Online Classes', icon: ComputerIcon,
        children: [
            { link: '/school/online-classes/course', label: 'Course' },
            { link: '/school/online-classes/lesson-report', label: 'Lesson Report' },
            { link: '/school/online-classes/live-class', label: 'Live Class' },
            { link: '/school/online-classes/live-dashboard', label: 'Live Class Dashboard' },
            { link: '/school/online-classes/my-classrooms', label: 'My Classrooms' },
        ],
    },

    // Academic Content Module
    {
        label: 'Academic Content', icon: AutoStoriesIcon,
        children: [
            { link: '/school/content/content-types', label: 'Content Types' },
            { link: '/school/study-material/upload', label: 'Upload Content' },
        ],
    },

    // Import Export Module
    {
        label: 'Import Export', icon: DownloadIcon,
        children: [
            { link: '/school/import/student-data', label: 'Upload Student Data' },
            { link: '/school/import/student-biometric', label: 'Upload Student Biometric' },
        ],
    },

    // Access Control Module
    {
        label: 'Access Control', icon: SettingsIcon,
        children: [
            { link: '/school/access/control', label: 'Access Control' },
        ],
    },

    // Parent Accounts Module
    {
        label: 'Parent Accounts', icon: GroupsIcon,
        children: [
            { link: '/school/parent-accounts', label: 'Parent Accounts' },
        ],
    },

    // Website Configuration Module
    {
        label: 'Website Configuration', icon: WebIcon,
        children: [
            { link: '/school/website/gallery', label: 'Gallery' },
            { link: '/school/website/bulletin-board', label: 'Bulletin Board' },
            { link: '/school/website/public-disclosure', label: 'Public Disclosure' },
        ],
    },

    // Behaviour Module
    {
        label: 'Behaviour', icon: AssignmentIcon,
        children: [
            { link: '/school/behaviour/quick-log', label: 'Quick Log' },
            { link: '/school/behaviour/escalation-tickets', label: 'Escalation Tickets' },
            { link: '/school/behaviour/reports', label: 'Reports' },
            { link: '/school/behaviour/class-roster', label: 'Class Roster' },
            { link: '/school/behaviour/categories', label: 'Categories' },
            { link: '/school/behaviour/escalation-levels', label: 'Escalation Levels' },
            { link: '/school/behaviour/my-escalations', label: 'My Escalations' },
            { link: '/school/behaviour/staff-student', label: 'Staff ↔ Student' },
            { link: '/school/behaviour/my-students', label: 'My Students' },
        ],
    },

    { link: '/logout', label: 'Log Out', icon: LogoutIcon },
];

// ─── Route helpers ────────────────────────────────────────────────────────────
// Exact match or child path only, so '/school/leave/apply' no longer lights up '/school/leave/apply-staff'
const matchLink = (pathname, link) => {
    if (!link || link === '/logout') return false;
    if (link === '/school') return pathname === '/school';
    return pathname === link || pathname.startsWith(`${link}/`);
};
const groupHasActive = (item, pathname) =>
    !!item.children?.some((c) => matchLink(pathname, c.link));

// ─── Shared Sidebar Content ───────────────────────────────────────────────────
function SidebarContent({
    open, query, setQuery, searching, filteredNav, expandedLabel,
    handleToggleExpand, handleNavigation, handleClose, isActive, isGroupActive, theme,
}) {
    return (
        <>
            {/* Header */}
            <DrawerHeader sx={{
                justifyContent: 'space-between',
                px: 1.5,
                minHeight: '58px !important',
                borderBottom: `1px solid ${SB_BORDER}`,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden' }}>
                    <Box sx={{
                        p: '2px', borderRadius: 2.5, background: CONIC, flexShrink: 0,
                        transition: `transform .5s ${EASE}`,
                        '&:hover': { transform: 'rotate(-6deg) scale(1.06)' },
                    }}>
                        <Box
                            component="img"
                            src={LOGO_URL}
                            alt={`${APP_NAME} logo`}
                            sx={{ width: 30, height: 30, borderRadius: 2, display: 'block', bgcolor: '#1a1e36' }}
                        />
                    </Box>
                    {open && (
                        <Box sx={{ overflow: 'hidden', ...motion(slideIn, '0.45s') }}>
                            <Typography sx={{
                                fontWeight: 800, fontSize: '0.84rem',
                                letterSpacing: '-0.02em', lineHeight: 1.2,
                                color: '#ffffff', whiteSpace: 'nowrap',
                            }}>
                                {APP_NAME}
                            </Typography>
                            <Chip
                                size="small"
                                label="School Admin"
                                sx={{
                                    height: 16, mt: 0.4,
                                    fontWeight: 700, fontSize: '0.6rem',
                                    color: '#fff',
                                    background: 'linear-gradient(90deg,#7c8ffc,#f472b6)',
                                    '& .MuiChip-label': { px: 0.9 },
                                }}
                            />
                        </Box>
                    )}
                </Box>
                <IconButton
                    onClick={handleClose}
                    size="small"
                    sx={{
                        border: `1px solid ${SB_BORDER}`,
                        borderRadius: 2, p: 0.5,
                        color: SB_ICON, flexShrink: 0,
                        transition: `all .25s ${EASE}`,
                        '&:hover': { bgcolor: SB_HOVER, color: '#fff', transform: 'scale(1.08)' },
                    }}
                >
                    {theme.direction === 'rtl'
                        ? <ChevronRightIcon sx={{ fontSize: 18 }} />
                        : <ChevronLeftIcon sx={{ fontSize: 18 }} />}
                </IconButton>
            </DrawerHeader>

            {/* Search — only when expanded */}
            {open && (
                <Box sx={{ px: 1.5, py: 1.1, borderBottom: `1px solid ${SB_BORDER}` }}>
                    <TextField
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        size="small"
                        placeholder="Search menu..."
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 15, color: SB_ICON }} />
                                </InputAdornment>
                            ),
                            endAdornment: query ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setQuery('')}
                                        sx={{ p: 0.3, color: SB_ICON, '&:hover': { color: '#fff' } }}
                                    >
                                        <CloseIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2.5,
                                fontSize: '0.76rem',
                                fontFamily: FONT,
                                bgcolor: alpha('#ffffff', 0.05),
                                color: '#fff',
                                transition: `all .3s ${EASE}`,
                                '& fieldset': { borderColor: SB_BORDER, transition: 'all .3s' },
                                '&:hover fieldset': { borderColor: alpha(SB_ACCENT, 0.55) },
                                '&.Mui-focused': {
                                    bgcolor: alpha('#ffffff', 0.08),
                                    boxShadow: `0 0 0 3px ${alpha(SB_ACCENT, 0.18)}`,
                                },
                                '&.Mui-focused fieldset': { borderColor: SB_ACCENT, borderWidth: 1 },
                                '& input': { py: 0.9 },
                                '& input::placeholder': { color: SB_ICON, opacity: 1 },
                            },
                        }}
                    />
                </Box>
            )}

            {/* Nav List */}
            <List sx={{
                flexGrow: 1, overflowY: 'auto', overflowX: 'hidden',
                px: open ? 1 : 0.75, py: 1,
                '&::-webkit-scrollbar': { width: 3 },
                '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: alpha('#fff', 0.12) },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            }}>
                {open && filteredNav.length === 0 && (
                    <Typography sx={{ color: SB_ICON, fontSize: '0.74rem', textAlign: 'center', py: 3, ...motion(slideIn) }}>
                        Koi menu nahi mila
                    </Typography>
                )}

                {filteredNav.map((navItem, index) => {
                    const isLogout    = navItem.link === '/logout';
                    const hasChildren = !!navItem.children?.length;
                    const groupActive = isGroupActive(navItem);
                    const active      = !hasChildren && isActive(navItem.link);
                    const highlighted = active || groupActive;
                    const expanded    = searching || expandedLabel === navItem.label;
                    const Icon        = navItem.icon;
                    const color       = getColor(navItem.label);

                    const parentBtn = (
                        <ListItemButton
                            selected={highlighted}
                            onClick={() =>
                                hasChildren
                                    ? handleToggleExpand(navItem.label)
                                    : handleNavigation(navItem.link)
                            }
                            sx={{
                                position: 'relative',
                                minHeight: 40,
                                px: open ? 1.1 : 0,
                                mb: 0.3,
                                borderRadius: 2,
                                justifyContent: open ? 'initial' : 'center',
                                color: highlighted ? '#ffffff' : SB_TEXT,
                                transition: `background-color .25s, color .25s, transform .3s ${EASE}`,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0, top: '22%', bottom: '22%',
                                    width: 3, borderRadius: '0 4px 4px 0',
                                    bgcolor: color,
                                    boxShadow: `0 0 10px ${alpha(color, 0.8)}`,
                                    transform: highlighted ? 'scaleY(1)' : 'scaleY(0)',
                                    transition: `transform .35s ${EASE}`,
                                },
                                '&.Mui-selected': {
                                    bgcolor: alpha(color, 0.13),
                                    '&:hover': { bgcolor: alpha(color, 0.19) },
                                },
                                '&:hover': {
                                    bgcolor: alpha(color, 0.1),
                                    color: '#ffffff',
                                    '& .nav-tile': { transform: 'scale(1.12) rotate(-5deg)' },
                                },
                                '&:active': { transform: 'scale(0.98)' },
                                ...(open ? motion(slideIn, '0.45s', `${Math.min(index, 14) * 28}ms`) : {}),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.25 : 0, justifyContent: 'center' }}>
                                <Box
                                    className="nav-tile"
                                    sx={{
                                        width: 28, height: 28, borderRadius: '9px',
                                        display: 'grid', placeItems: 'center',
                                        color: highlighted ? '#fff' : color,
                                        background: highlighted
                                            ? `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`
                                            : alpha(color, 0.14),
                                        boxShadow: highlighted ? `0 4px 14px ${alpha(color, 0.45)}` : 'none',
                                        transition: `all .35s ${EASE}`,
                                    }}
                                >
                                    <Icon sx={{ fontSize: 16 }} />
                                </Box>
                            </ListItemIcon>
                            <ListItemText
                                primary={navItem.label}
                                primaryTypographyProps={{
                                    fontSize: '0.76rem',
                                    fontFamily: FONT,
                                    fontWeight: highlighted ? 700 : 500,
                                    letterSpacing: '-0.005em',
                                    color: 'inherit',
                                    noWrap: true,
                                }}
                                sx={{ m: 0, opacity: open ? 1 : 0, transition: 'opacity .25s' }}
                            />
                            {open && hasChildren && (
                                <ExpandMore sx={{
                                    fontSize: 16, color: expanded ? color : SB_ICON,
                                    ml: 0.5, flexShrink: 0,
                                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: `transform .35s ${EASE}, color .25s`,
                                }} />
                            )}
                        </ListItemButton>
                    );

                    return (
                        <React.Fragment key={navItem.label}>
                            {isLogout && <Divider sx={{ my: 1, borderColor: SB_BORDER }} />}
                            <ListItem disablePadding sx={{ display: 'block' }}>
                                {open ? parentBtn : (
                                    <Tooltip
                                        title={navItem.label}
                                        placement="right"
                                        arrow
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: '#12152a',
                                                    color: '#fff',
                                                    fontFamily: FONT,
                                                    fontSize: '0.72rem',
                                                    fontWeight: 600,
                                                    borderRadius: 1.5,
                                                    border: `1px solid ${alpha(color, 0.6)}`,
                                                    boxShadow: `0 6px 20px ${alpha(color, 0.25)}`,
                                                },
                                            },
                                            arrow: { sx: { color: '#12152a' } },
                                        }}
                                    >
                                        {parentBtn}
                                    </Tooltip>
                                )}
                            </ListItem>

                            {hasChildren && open && (
                                <Collapse in={expanded} timeout={320} easing={EASE} unmountOnExit>
                                    <List disablePadding sx={{
                                        ml: 2.25, pl: 0.75, mb: 0.6,
                                        borderLeft: `1px solid ${alpha(color, 0.3)}`,
                                    }}>
                                        {navItem.children.map((child, ci) => {
                                            const childActive = isActive(child.link);
                                            return (
                                                <ListItem key={child.link + ci} disablePadding sx={{ display: 'block' }}>
                                                    <ListItemButton
                                                        selected={childActive}
                                                        onClick={() => handleNavigation(child.link)}
                                                        sx={{
                                                            minHeight: 30,
                                                            pl: 1.1, pr: 1, my: '1px',
                                                            borderRadius: 1.75,
                                                            transition: `all .25s ${EASE}`,
                                                            ...motion(slideIn, '0.35s', `${Math.min(ci, 10) * 22}ms`),
                                                            '&.Mui-selected': {
                                                                bgcolor: alpha(color, 0.16),
                                                                '&:hover': { bgcolor: alpha(color, 0.22) },
                                                            },
                                                            '&:hover': {
                                                                bgcolor: alpha(color, 0.09),
                                                                transform: 'translateX(3px)',
                                                                '& .child-dot': { transform: 'scale(1.5)', bgcolor: color },
                                                            },
                                                        }}
                                                    >
                                                        <Box
                                                            className="child-dot"
                                                            sx={{
                                                                width: 5, height: 5, borderRadius: '50%',
                                                                mr: 1.25, flexShrink: 0,
                                                                bgcolor: childActive ? color : alpha('#fff', 0.25),
                                                                boxShadow: childActive ? `0 0 8px ${color}` : 'none',
                                                                transform: childActive ? 'scale(1.5)' : 'scale(1)',
                                                                transition: `all .3s ${EASE}`,
                                                            }}
                                                        />
                                                        <ListItemText
                                                            primary={child.label}
                                                            primaryTypographyProps={{
                                                                fontSize: '0.72rem',
                                                                fontFamily: FONT,
                                                                fontWeight: childActive ? 700 : 400,
                                                                color: childActive ? '#ffffff' : SB_TEXT,
                                                                letterSpacing: '-0.003em',
                                                                noWrap: true,
                                                            }}
                                                            sx={{ m: 0 }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>
            <Divider sx={{ borderColor: SB_BORDER }} />
        </>
    );
}

// ─── Shared style snippets ────────────────────────────────────────────────────
const barBtnSx = {
    mr: 1.5,
    color: '#475569',
    border: '1px solid #e8eaf3',
    borderRadius: 2.5,
    p: 0.7,
    transition: `all .3s ${EASE}`,
    '&:hover': {
        color: '#fff',
        background: 'linear-gradient(135deg,#7c8ffc,#f472b6)',
        borderColor: 'transparent',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 16px rgba(124,143,252,0.35)',
    },
};

const drawerPaperSx = {
    background: SB_BG,
    borderRight: 'none',
    fontFamily: FONT,
};

const FOOTER_LINKS = [
    { to: '/school/help',    label: 'Help Center',      color: '#3b82f6' },
    { to: '/school/privacy', label: 'Privacy Policy',   color: '#10b981' },
    { to: '/school/terms',   label: 'Terms of Service', color: '#f97316' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function School() {
    const theme = useTheme();
    const { user } = React.useContext(AuthContext);
    useDocumentTitle('School', SCHOOL_DOC_TITLE_MAP);

    // mobileOpen  → controls the temporary mobile drawer (open/close)
    // desktopOpen → controls the permanent desktop drawer (expanded/collapsed)
    const [mobileOpen,  setMobileOpen]  = React.useState(false);
    const [desktopOpen, setDesktopOpen] = React.useState(false);
    const [query,        setQuery]       = React.useState('');
    const [confirmLogout, setConfirmLogout] = React.useState(false);
    const [expandedLabel, setExpandedLabel] = React.useState(null);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const pageRef  = React.useRef(null);
    const schoolDisplayName = user?.school_name || APP_NAME;
    const profileMenuOpen = Boolean(anchorEl);

    // Load the UI font once
    React.useEffect(() => {
        if (document.getElementById('school-ui-font')) return;
        const link = document.createElement('link');
        link.id = 'school-ui-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(link);
    }, []);

    // Smooth fade-up on every route change (no remounting of the page)
    React.useEffect(() => {
        const el = pageRef.current;
        if (!el || !el.animate) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        el.animate(
            [
                { opacity: 0, transform: 'translateY(12px)' },
                { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 420, easing: EASE },
        );
    }, [location.pathname]);

    // Auto-open the group of the current page
    React.useEffect(() => {
        const group = NAV_ITEMS.find((n) => groupHasActive(n, location.pathname));
        if (group) setExpandedLabel(group.label);
        setMobileOpen(false);
    }, [location.pathname]);

    const handleProfileMenuOpen  = (event) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);
    const handleProfileClick = () => { handleProfileMenuClose(); navigate('/school/profile'); };
    const handleLogout       = () => { handleProfileMenuClose(); navigate('/logout'); };

    const handleMobileToggle = () => setMobileOpen((prev) => !prev);
    const handleDesktopOpen  = () => setDesktopOpen(true);
    const handleDesktopClose = () => { setDesktopOpen(false); setExpandedLabel(null); };

    const handleNavigation = (link) => {
        if (!link) return;
        setMobileOpen(false);
        if (link === '/logout') { setConfirmLogout(true); return; }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(link);
    };

    const handleToggleExpand = (label) => {
        if (!desktopOpen && !mobileOpen) { setDesktopOpen(true); setExpandedLabel(label); return; }
        setExpandedLabel((prev) => (prev === label ? null : label));
    };

    const isActive      = (link) => matchLink(location.pathname, link);
    const isGroupActive = (item) => groupHasActive(item, location.pathname);

    // Search: group label match → show all children; otherwise show only matching children
    const searching = query.trim().length > 0;
    const filteredNav = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return NAV_ITEMS;
        return NAV_ITEMS.reduce((acc, n) => {
            if ((n.label || '').toLowerCase().includes(q)) { acc.push(n); return acc; }
            const kids = n.children?.filter((c) => c.label.toLowerCase().includes(q));
            if (kids?.length) acc.push({ ...n, children: kids });
            return acc;
        }, []);
    }, [query]);

    const sharedProps = {
        query, setQuery, searching,
        filteredNav,
        expandedLabel,
        handleToggleExpand,
        handleNavigation,
        isActive,
        isGroupActive,
        theme,
    };

    return (
        <Box sx={{ display: 'flex', fontFamily: FONT }}>
            <CssBaseline />

            {/* ── AppBar ── */}
            <AppBar position="fixed" open={desktopOpen}>
                <Toolbar sx={{ minHeight: '58px !important' }}>
                    {/* Mobile menu icon */}
                    <IconButton
                        aria-label="open mobile drawer"
                        onClick={handleMobileToggle}
                        edge="start"
                        sx={{ ...barBtnSx, display: { xs: 'inline-flex', md: 'none' } }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>

                    {/* Desktop menu icon */}
                    <IconButton
                        aria-label="toggle desktop drawer"
                        onClick={desktopOpen ? handleDesktopClose : handleDesktopOpen}
                        edge="start"
                        sx={{ ...barBtnSx, display: { xs: 'none', md: 'inline-flex' } }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>

                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontFamily: FONT, fontWeight: 800, fontSize: '0.92rem',
                            letterSpacing: '-0.01em', flex: 1,
                            background: 'linear-gradient(90deg,#1a1a2e 0%,#3b3f8f 60%,#a855f7 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {schoolDisplayName}
                    </Typography>

                    {/* Profile */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, fontSize: '0.76rem' }}>
                                {user?.owner_name || user?.school_name || 'School Admin'}
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, color: '#64748b', fontSize: '0.64rem' }}>
                                {user?.school_name ? `${user.school_name}` : 'School Owner'}
                            </Typography>
                        </Box>
                        <Tooltip title="Account">
                            <IconButton
                                onClick={handleProfileMenuOpen}
                                size="small"
                                sx={{
                                    p: '2px',
                                    background: CONIC,
                                    transition: `transform .35s ${EASE}, box-shadow .35s`,
                                    '&:hover': {
                                        transform: 'scale(1.08)',
                                        boxShadow: '0 6px 18px rgba(168,85,247,0.35)',
                                    },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 34, height: 34,
                                        border: '2px solid #fff',
                                        bgcolor: '#1a3c6e',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                    }}
                                    src={user?.image_url}
                                >
                                    {(user?.owner_name?.[0] || user?.school_name?.[0] || 'S').toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Profile Dropdown */}
                    <Menu
                        anchorEl={anchorEl}
                        open={profileMenuOpen}
                        onClose={handleProfileMenuClose}
                        onClick={handleProfileMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                minWidth: 240,
                                mt: 1.5,
                                borderRadius: 3,
                                overflow: 'hidden',
                                fontFamily: FONT,
                                boxShadow: '0 16px 48px rgba(79,70,229,0.18)',
                                border: '1px solid #eef0fb',
                                '& .MuiMenuItem-root': {
                                    px: 1.5, py: 1, borderRadius: 2, mx: 1, my: 0.4,
                                    fontSize: '0.78rem',
                                    transition: `all .25s ${EASE}`,
                                    '&:hover': { transform: 'translateX(3px)' },
                                },
                            },
                        }}
                    >
                        <Box sx={{
                            px: 2, py: 1.5, mb: 0.5,
                            background: 'linear-gradient(135deg, rgba(124,143,252,0.16), rgba(244,114,182,0.14))',
                        }}>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.82rem', fontWeight: 800, color: 'text.primary' }}>
                                {user?.owner_name || 'School Admin'}
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: 'text.secondary' }}>
                                {user?.email || ''}
                            </Typography>
                            <Chip
                                label={user?.school_name || 'School Owner'}
                                size="small"
                                sx={{
                                    mt: 0.8, height: 20,
                                    fontSize: '0.64rem', fontWeight: 800,
                                    color: '#fff',
                                    background: 'linear-gradient(90deg,#4f46e5,#a855f7)',
                                }}
                            />
                        </Box>

                        <MenuItem onClick={handleProfileClick} sx={{ '&:hover': { bgcolor: alpha('#4f46e5', 0.08) } }}>
                            <ListItemIcon sx={{ minWidth: 30, color: '#4f46e5' }}>
                                <PersonIcon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText primary="Edit Profile" primaryTypographyProps={{ fontSize: '0.78rem', fontFamily: FONT, fontWeight: 600 }} />
                        </MenuItem>

                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#ef4444', 0.08) } }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                                <LogoutIcon sx={{ fontSize: 18 }} color="error" />
                            </ListItemIcon>
                            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.78rem', fontFamily: FONT, fontWeight: 600 }} />
                        </MenuItem>
                    </Menu>
                </Toolbar>

                {/* Animated rainbow accent line */}
                <Box sx={{
                    position: 'absolute', left: 0, right: 0, bottom: 0, height: 2,
                    background: RAINBOW, backgroundSize: '200% 100%',
                    animation: `${flow} 9s linear infinite`,
                    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }} />
            </AppBar>

            {/* ── Mobile Drawer (temporary overlay, xs/sm only) ── */}
            {mobileOpen && (
                <MuiDrawer
                    variant="temporary"
                    open
                    onClose={handleMobileToggle}
                    transitionDuration={{ enter: 180, exit: 0 }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiBackdrop-root': { bgcolor: 'rgba(15,18,40,0.45)' },
                        '& .MuiDrawer-paper': {
                            ...drawerPaperSx,
                            width: DRAWER_WIDTH,
                            boxShadow: '8px 0 40px rgba(0,0,0,0.45)',
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    <SidebarContent {...sharedProps} open={true} handleClose={handleMobileToggle} />
                </MuiDrawer>
            )}

            {/* ── Desktop Drawer (permanent collapsible, md+ only) ── */}
            <DesktopDrawer
                variant="permanent"
                open={desktopOpen}
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        ...drawerPaperSx,
                        boxShadow: '4px 0 24px rgba(20,24,60,0.18)',
                    },
                }}
            >
                <SidebarContent {...sharedProps} open={desktopOpen} handleClose={handleDesktopClose} />
            </DesktopDrawer>

            {/* ── Main Content ── */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1, minWidth: 0,
                    display: 'flex', flexDirection: 'column', minHeight: '100vh',
                    fontFamily: FONT,
                    backgroundColor: '#f6f7fc',
                    backgroundImage: `
                        radial-gradient(760px 380px at 100% 0%, ${alpha('#f472b6', 0.10)}, transparent 65%),
                        radial-gradient(700px 380px at 0% 8%, ${alpha('#7c8ffc', 0.12)}, transparent 65%),
                        radial-gradient(600px 360px at 60% 100%, ${alpha('#34d399', 0.08)}, transparent 65%)`,
                    backgroundAttachment: 'fixed',
                }}
            >
                <DrawerHeader />
                <Breadcrumb />
                <Box ref={pageRef} sx={{ flex: 1 }}>
                    <Outlet />
                </Box>

                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        position: 'relative',
                        mt: 'auto', py: 2.25, px: 3,
                        bgcolor: alpha('#ffffff', 0.9),
                        backdropFilter: 'blur(8px)',
                        '&::before': {
                            content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                            background: RAINBOW, opacity: 0.75,
                        },
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: '1400px', mx: 'auto',
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', md: 'center' },
                            gap: 1.5,
                        }}
                    >
                        <Typography sx={{ fontFamily: FONT, color: '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            © {new Date().getFullYear()}
                            <Box component="span" sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(90deg,#1a3c6e,#7c3aed)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                {user?.school_name || APP_NAME}
                            </Box>
                            . All rights reserved.
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, md: 3 }, order: { xs: 3, md: 2 } }}>
                            {FOOTER_LINKS.map((l) => (
                                <Typography
                                    key={l.to}
                                    component={RouterLink}
                                    to={l.to}
                                    sx={{
                                        fontFamily: FONT, color: '#6b7280', fontSize: '0.75rem',
                                        textDecoration: 'none', position: 'relative',
                                        transition: 'color .25s',
                                        '&::after': {
                                            content: '""', position: 'absolute', left: 0, bottom: -2,
                                            height: 2, width: '100%', bgcolor: l.color, borderRadius: 2,
                                            transform: 'scaleX(0)', transformOrigin: 'left',
                                            transition: `transform .3s ${EASE}`,
                                        },
                                        '&:hover': { color: l.color, '&::after': { transform: 'scaleX(1)' } },
                                    }}
                                >
                                    {l.label}
                                </Typography>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, order: { xs: 2, md: 3 } }}>
                            <Chip
                                label={`v${new Date().getFullYear()}.1.0`}
                                size="small"
                                sx={{
                                    height: 20, fontSize: '0.64rem', fontWeight: 700,
                                    color: '#fff',
                                    background: 'linear-gradient(90deg,#10b981,#3b82f6)',
                                }}
                            />
                            <Typography sx={{ color: '#9ca3af', fontSize: '0.68rem', display: { xs: 'none', sm: 'block' } }}>
                                Powered by {APP_NAME}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* ── Logout Confirm Dialog ── */}
            <Dialog
                open={confirmLogout}
                onClose={() => setConfirmLogout(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4, fontFamily: FONT,
                        boxShadow: '0 24px 64px rgba(239,68,68,0.18)',
                        ...motion(pop, '0.35s'),
                    },
                }}
            >
                <DialogTitle sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '0.95rem', pb: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{
                        width: 34, height: 34, borderRadius: '11px', display: 'grid', placeItems: 'center',
                        color: '#ef4444', bgcolor: alpha('#ef4444', 0.12),
                    }}>
                        <LogoutIcon sx={{ fontSize: 18 }} />
                    </Box>
                    Confirm logout
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontFamily: FONT, color: 'text.secondary', fontSize: '0.8rem' }}>
                        You will be signed out from your account. Any unsaved changes may be lost.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmLogout(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
                            fontFamily: FONT, fontSize: '0.78rem', borderColor: '#ddd', color: '#555',
                            transition: `all .25s ${EASE}`,
                            '&:hover': { borderColor: '#7c8ffc', bgcolor: alpha('#7c8ffc', 0.08), color: '#4f46e5' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => { setConfirmLogout(false); navigate('/logout'); }}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2.5, textTransform: 'none', fontWeight: 800,
                            fontFamily: FONT, fontSize: '0.78rem', boxShadow: 'none',
                            background: 'linear-gradient(135deg,#f43f5e,#ef4444)',
                            transition: `all .25s ${EASE}`,
                            '&:hover': { boxShadow: '0 8px 20px rgba(239,68,68,0.4)', transform: 'translateY(-1px)' },
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}