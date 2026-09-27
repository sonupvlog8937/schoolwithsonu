import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./guards/ProtectedRoute";
import PageLoader from "./components/system/PageLoader";
import NotFound from "./components/system/NotFound";

const Client = lazy(() => import("./client/Client"));
const Home = lazy(() => import("./client/components/home/Home"));
const Contact = lazy(() => import("./client/components/contact/Contact"));
const Login = lazy(() => import("./client/components/login/Login"));
const Register = lazy(() => import("./client/components/register/Register"));
const Logout = lazy(() => import("./client/components/logout/Logout"));
const ForgotPassword = lazy(() => import("./client/components/forgot-password/ForgotPassword"));
const AllSchoolsPage = lazy(() => import("./client/components/schools/AllSchoolsPage"));
const SchoolDetailsPage = lazy(() => import("./client/components/schools/SchoolDetailsPage"));
const ApplyAdmissionPage = lazy(() => import("./client/components/schools/ApplyAdmissionPage"));
const ApplicationSuccessPage = lazy(() => import("./client/components/schools/ApplicationSuccessPage"));

const School = lazy(() => import("./school/School"));
const SchoolDashboard = lazy(() => import("./school/pages/dashboard"));
const StaffDashboard = lazy(() => import("./school/pages/dashboard/StaffDashboard"));
const AccountsDashboard = lazy(() => import("./school/pages/dashboard/AccountsDashboard"));
const FeeAssignmentDashboard = lazy(() => import("./school/pages/dashboard/FeeAssignmentDashboard"));
const InventoryDashboard = lazy(() => import("./school/pages/dashboard/InventoryDashboard"));
const LibraryDashboard = lazy(() => import("./school/pages/dashboard/LibraryDashboard"));
const FollowUpDashboard = lazy(() => import("./school/pages/dashboard/FollowUpDashboard"));
const ComplaintDashboard = lazy(() => import("./school/pages/dashboard/ComplaintDashboard"));
const VisitorDashboard = lazy(() => import("./school/pages/dashboard/VisitorDashboard"));
const ChatDashboard = lazy(() => import("./school/pages/dashboard/ChatDashboard"));
const SchoolOperationsDashboard = lazy(() => import("./school/pages/dashboard/SchoolOperationsDashboard"));
const UserActivityDashboard = lazy(() => import("./school/pages/dashboard/UserActivityDashboard"));
const SchoolInfo = lazy(() => import("./school/pages/masterconfiguration/SchoolInfo"));
const SessionManagement = lazy(() => import("./school/pages/masterconfiguration/SessionManagement"));
const RoomAssignment = lazy(() => import("./school/pages/masterconfiguration/RoomAssignment"));
const AppVersion = lazy(() => import("./school/pages/masterconfiguration/AppVersion"));
const HouseName = lazy(() => import("./school/pages/masterconfiguration/HouseName"));
const HobbyGroup = lazy(() => import("./school/pages/masterconfiguration/HobbyGroup"));
const Religion = lazy(() => import("./school/pages/masterconfiguration/Religion"));
const Disabilities = lazy(() => import("./school/pages/masterconfiguration/Disabilities"));
const Designation = lazy(() => import("./school/pages/masterconfiguration/Designation"));
const Department = lazy(() => import("./school/pages/masterconfiguration/Department"));
const LibrarySetting = lazy(() => import("./school/pages/masterconfiguration/LibrarySetting"));
const GeneralSettings = lazy(() => import("./school/pages/masterconfiguration/GeneralSettings"));
const OnlinePayment = lazy(() => import("./school/pages/masterconfiguration/OnlinePayment"));
const PaymentMethod = lazy(() => import("./school/pages/masterconfiguration/PaymentMethod"));
const SmsSettings = lazy(() => import("./school/pages/masterconfiguration/SmsSettings"));
const SmsTemplate = lazy(() => import("./school/pages/masterconfiguration/SmsTemplate"));
const BiometricDevice = lazy(() => import("./school/pages/masterconfiguration/BiometricDevice"));
const SchoolShifts = lazy(() => import("./school/pages/masterconfiguration/SchoolShifts"));
const WorkingDaysTemplate = lazy(() => import("./school/pages/masterconfiguration/WorkingDaysTemplate"));
const SchoolConfig = lazy(() => import("./school/pages/masterconfiguration/SchoolConfig"));
const Boards = lazy(() => import("./school/pages/masterconfiguration/Boards"));
const EnquiryStatuses = lazy(() => import("./school/pages/masterconfiguration/EnquiryStatuses"));
const EnquirySources = lazy(() => import("./school/pages/masterconfiguration/EnquirySources"));
const Sections = lazy(() => import("./school/pages/academy/Sections"));
const AcademicClasses = lazy(() => import("./school/pages/academy/Classes"));
const AcademicSubjects = lazy(() => import("./school/pages/academy/Subjects"));
const AssignClassTeacher = lazy(() => import("./school/pages/academy/AssignClassTeacher"));
const TimingConfiguration = lazy(() => import("./school/pages/academy/TimingConfiguration"));
const StudentTimetable = lazy(() => import("./school/pages/academy/StudentTimetable"));
const StudentTimetableView = lazy(() => import("./school/pages/academy/StudentTimetableView.jsx"));
const TeacherTimetable = lazy(() => import("./school/pages/academy/TeacherTimetable"));
const TeacherTimetableView = lazy(() => import("./school/pages/academy/TeacherTimetableView.jsx"));
const ChangeTimeArrangement = lazy(() => import("./school/pages/academy/ChangeTimeArrangement"));
const MarkAbsentUserStatus = lazy(() => import("./school/pages/academy/MarkAbsentUserStatus"));
const TeacherDashboard = lazy(() => import("./school/components/dashboard/TeacherDashboard"));
const AccountantDashboard = lazy(() => import("./school/components/dashboard/AccountantDashboard"));
const Class = lazy(() => import("./school/components/class/Class"));
const Students = lazy(() => import("./school/components/students/Students"));
const Teachers = lazy(() => import("./school/components/teachers/Teachers"));
const Subject = lazy(() => import("./school/components/subjects/Subjects"));
const ClassDetails = lazy(() => import("./school/components/class details/ClassDetails"));
const AssignPeriod2 = lazy(() => import("./school/components/assign period/AssignPeriod2"));
const AttendanceDetails = lazy(() => import("./school/components/attendance/attendance details/AttendanceDetails"));
const StudentAttendanceList = lazy(() => import("./school/components/attendance/StudentAttendanceList"));
const Schedule = lazy(() => import("./school/components/periods/Schedule"));
const Examinations = lazy(() => import("./school/components/examinations/Examinations"));
const NoticeSchool = lazy(() => import("./school/components/notice/NoticeSchool"));
const AdmissionEnquiry = lazy(() => import("./school/components/front-office/AdmissionEnquiry"));
const VisitorBook = lazy(() => import("./school/components/front-office/VisitorBook"));
const PhoneCallLog = lazy(() => import("./school/components/front-office/PhoneCallLog"));
const PostalRecord = lazy(() => import("./school/components/front-office/PostalRecord"));
const Complaint    = lazy(() => import("./school/components/front-office/Complaint"));
const SetupFrontOffice = lazy(() => import("./school/components/front-office/SetupFrontOffice"));
const HomeworkList = lazy(() => import("./school/components/homework/HomeworkList"));
const LibraryBooks = lazy(() => import("./school/components/library/LibraryBooks"));
const FeeCollection = lazy(() => import("./school/components/feeCollections/FeeCollection"));
const StudentFeesPage = lazy(() => import("./school/components/feeCollections/StudentFeesPage"));
const EnhancedDemandBillPrint = lazy(() => import("./school/components/feeCollections/EnhancedDemandBillPrint"));
const SearchDueFees = lazy(() => import("./school/components/feeCollections/SearchDueFees"));
const StudentDemandBillPrint = lazy(() => import("./school/components/feeCollections/StudentDemandBillPrint"));
const FeesMaster = lazy(() => import("./school/components/feeCollections/FeesMaster"));
const FeesGroup = lazy(() => import("./school/components/feeCollections/FeesGroup"));
const FeesType = lazy(() => import("./school/components/feeCollections/FeesType"));
const FeesDiscount = lazy(() => import("./school/components/feeCollections/FeesDiscount"));
const FeesCarryForward = lazy(() => import("./school/components/feeCollections/FeesCarryForward"));
const OfflineBankPayment = lazy(() => import("./school/components/feeCollections/OfflineBankPayment"));
const SearchFeesPayment = lazy(() => import("./school/components/feeCollections/SearchFeesPayment"));
const StudentSearchPage = lazy(() => import("./school/components/feeCollections/StudentSearchPage"));
const FeeCollectionPage = lazy(() => import("./school/components/feeCollections/FeeCollectionPage"));
const StudentFeeSchedule = lazy(() => import("./school/pages/student-fee/FeeSchedule"));
const StudentFeeTerm = lazy(() => import("./school/pages/student-fee/FeeTerm"));
const StudentFeeType = lazy(() => import("./school/pages/student-fee/FeeType"));
const StudentFeeRebate = lazy(() => import("./school/pages/student-fee/RebateRules"));
const StudentFeeGroup = lazy(() => import("./school/pages/student-fee/FeeGroup"));
const StudentFeeMultiGroup = lazy(() => import("./school/pages/student-fee/MultiGroupAssign"));
const StudentFeeBackDues = lazy(() => import("./school/pages/student-fee/BackDues"));
const StudentFeeAdjustments = lazy(() => import("./school/pages/student-fee/AdjustmentApprovals"));
const StudentFeeReminder = lazy(() => import("./school/pages/student-fee/Reminder"));
const StudentFeeDemand = lazy(() => import("./school/pages/student-fee/DemandNotice"));
const StudentFeeDemandTermwise = lazy(() => import("./school/pages/student-fee/DemandNoticeTermwise"));
const StudentFeePromote = lazy(() => import("./school/pages/student-fee/PromoteStructure"));
const StudentFeePromoteBack = lazy(() => import("./school/pages/student-fee/PromoteBackDues"));
const StudentFeePayment = lazy(() => import("./school/pages/student-fee/FeePayment"));
const StudentBankWallets = lazy(() => import("./school/pages/student-bank/Wallets"));
const StudentBankTransactions = lazy(() => import("./school/pages/student-bank/Transactions"));
const TransportRoutes = lazy(() => import("./school/components/transport/TransportRoutes"));
const StudyMaterialList = lazy(() => import("./school/components/studyMaterial/StudyMaterialList"));
const LeaveManagement = lazy(() => import("./school/components/leave/LeaveManagement"));
const StudentAdmissionList = lazy(() => import("./school/components/studentInformation/StudentAdmissionList"));
const StudentAdmissionForm = lazy(() => import("./school/components/studentInformation/StudentAdmissionForm"));
const StudentDetailView = lazy(() => import("./school/components/studentInformation/StudentDetailView"));
const StudentCategories = lazy(() => import("./school/components/studentInformation/StudentCategories"));
const StudentHouse = lazy(() => import("./school/components/studentInformation/StudentHouse"));
const DisableReason = lazy(() => import("./school/components/studentInformation/DisableReason"));
const StudentBulkDelete = lazy(() => import("./school/components/studentInformation/StudentBulkDelete"));
const MultiClassStudent = lazy(() => import("./school/components/studentInformation/MultiClassStudent"));
const OnlineAdmission = lazy(() => import("./school/components/studentInformation/OnlineAdmission"));
const ViewOnlineApplication = lazy(() => import("./school/components/studentInformation/ViewOnlineApplication"));
const DisabledStudents = lazy(() => import("./school/components/studentInformation/DisabledStudents"));
const CommunicationPage = lazy(() => import("./school/pages/communicate/CommunicationPage"));
const GroupMessage = lazy(() => import("./school/pages/communicate/GroupMessage"));
const ParticularStudent = lazy(() => import("./school/pages/communicate/ParticularStudent"));
const ParticularStaff = lazy(() => import("./school/pages/communicate/ParticularStaff"));
const ParticularNumberSms = lazy(() => import("./school/pages/communicate/ParticularNumberSms"));
const ParticularEmail = lazy(() => import("./school/pages/communicate/ParticularEmail"));
const CommunicationHomework = lazy(() => import("./school/pages/communicate/Homework"));
const CommunicationHolidays = lazy(() => import("./school/pages/communicate/Holidays"));
const CommunicationEvents = lazy(() => import("./school/pages/communicate/Events"));
const AcademicCalendar = lazy(() => import("./school/pages/communicate/AcademicCalendar"));
const CommunicationBirthday = lazy(() => import("./school/pages/communicate/Birthday"));
const CommunicationGallery = lazy(() => import("./school/pages/communicate/Gallery"));
const HobbyGroupMembers = lazy(() => import("./school/pages/communicate/HobbyGroupMembers"));
const CommunicationCircular = lazy(() => import("./school/pages/communicate/Circular"));
const CommunicationPopups = lazy(() => import("./school/pages/communicate/Popups"));
const HomeContent = lazy(() => import("./school/pages/communicate/HomeContent"));
const SmsStudentUsername = lazy(() => import("./school/pages/communicate/SmsStudentUsername"));
const SmsStaffUsername = lazy(() => import("./school/pages/communicate/SmsStaffUsername"));
const CampusFeed = lazy(() => import("./school/pages/campus-feed/CampusFeed"));
const StudentProfileHub = lazy(() => import("./school/pages/student-profile/StudentProfileHub"));
const StudentProfilePillars = lazy(() => import("./school/pages/student-profile/Pillars"));
const StudentProfileEventTypes = lazy(() => import("./school/pages/student-profile/EventTypes"));
const StudentProfileEventMaster = lazy(() => import("./school/pages/student-profile/EventMaster"));
const StudentProfileAllEntries = lazy(() => import("./school/pages/student-profile/AllEntries"));
const StudentProfileVerification = lazy(() => import("./school/pages/student-profile/Verification"));
const StudentProfileSports = lazy(() => import("./school/pages/student-profile/SportsProfile"));
const StudentProfileSportsSetup = lazy(() => import("./school/pages/student-profile/SportsSetup"));
const StudentProfileAnnual = lazy(() => import("./school/pages/student-profile/AnnualProfile"));
const ActivityComplaintType = lazy(() => import("./school/pages/student-activity/ComplaintType"));
const ActivityComplaintBooks = lazy(() => import("./school/pages/student-activity/ComplaintBooks"));
const ActivityPostal = lazy(() => import("./school/pages/student-activity/Postal"));
const ActivityVisitorPurposes = lazy(() => import("./school/pages/student-activity/VisitorPurposes"));
const ActivityVisitorsBooks = lazy(() => import("./school/pages/student-activity/VisitorsBooks"));
const ActivityVisitorQr = lazy(() => import("./school/pages/student-activity/VisitorQrCode"));
const ActivityGatePass = lazy(() => import("./school/pages/student-activity/GatePass"));
const ActivityAdmissionQuery = lazy(() => import("./school/pages/student-activity/AdmissionQuery"));
const ActivitySeatMatrix = lazy(() => import("./school/pages/student-activity/SeatMatrix"));
const ActivityEnquiryQr = lazy(() => import("./school/pages/student-activity/EnquiryQrCode"));
const ActivityRegistration = lazy(() => import("./school/pages/student-activity/StudentRegistration"));
const ActivityIdCard = lazy(() => import("./school/pages/student-activity/StudentIdCard"));
const ActivityAchievements = lazy(() => import("./school/pages/student-activity/Achievements"));
const StudentInfoPassout = lazy(() => import("./school/pages/student-info/Passout"));
const StudentInfoLeaving = lazy(() => import("./school/pages/student-info/LeavingCertificate"));
const StudentInfoDropout = lazy(() => import("./school/pages/student-info/Dropout"));
const StudentInfoDropoutPassout = lazy(() => import("./school/pages/student-info/DropoutPassout"));
const StudentInfoPromote = lazy(() => import("./school/pages/student-info/Promote"));
const StudentInfoAttendanceMessage = lazy(() => import("./school/pages/student-info/AttendanceMessage"));
const StudentInfoRemarks = lazy(() => import("./school/pages/student-info/Remarks"));
const StudentInfoPerformance = lazy(() => import("./school/pages/student-info/Performance"));
const AccountPaymentRequests = lazy(() => import("./school/pages/account/PaymentRequests"));
const AccountEventCollections = lazy(() => import("./school/pages/account/EventCollections"));
const AccountIncomeCategory = lazy(() => import("./school/pages/account/IncomeCategory"));
const AccountExpenseCategory = lazy(() => import("./school/pages/account/ExpenseCategory"));
const AccountHead = lazy(() => import("./school/pages/account/AccountHead"));
const AccountIncome = lazy(() => import("./school/pages/account/Income"));
const AccountExpenses = lazy(() => import("./school/pages/account/Expenses"));
const AccountIncomeReport = lazy(() => import("./school/pages/account/IncomeReport"));
const AccountExpenseReport = lazy(() => import("./school/pages/account/ExpenseReport"));
const AccountDailyMonthlyReport = lazy(() => import("./school/pages/account/DailyMonthlyReport"));
const AccountOverallSummary = lazy(() => import("./school/pages/account/OverallSummary"));
const AccountGroupWiseOverall = lazy(() => import("./school/pages/account/GroupWiseOverall"));
const StoreRoomDashboard = lazy(() => import("./school/pages/store-room/Dashboard"));
const StoreRoomRooms = lazy(() => import("./school/pages/store-room/Rooms"));
const StoreRoomItems = lazy(() => import("./school/pages/store-room/Items"));
const StoreRoomCurrentStock = lazy(() => import("./school/pages/store-room/CurrentStock"));
const StoreRoomTransactions = lazy(() => import("./school/pages/store-room/Transactions"));
const InventoryItemCategory = lazy(() => import("./school/pages/inventory/ItemCategory"));
const InventoryAddItem = lazy(() => import("./school/pages/inventory/AddItem"));
const InventoryItemBundle = lazy(() => import("./school/pages/inventory/ItemBundle"));
const InventorySupplierList = lazy(() => import("./school/pages/inventory/SupplierList"));
const InventoryPurchase = lazy(() => import("./school/pages/inventory/Purchase"));
const InventorySell = lazy(() => import("./school/pages/inventory/Sell"));
const InventorySellCollection = lazy(() => import("./school/pages/inventory/SellCollection"));
const InventoryCancelledInvoice = lazy(() => import("./school/pages/inventory/CancelledInvoice"));
const InventoryReturnInvoice = lazy(() => import("./school/pages/inventory/ReturnInvoice"));
const InventoryItemReceiveSell = lazy(() => import("./school/pages/inventory/ItemReceiveSell"));
const LeaveTypePage = lazy(() => import("./school/pages/leave/LeaveType"));
const DefineLeavePolicyPage = lazy(() => import("./school/pages/leave/DefineLeavePolicy"));
const ApplyStaffLeavePage = lazy(() => import("./school/pages/leave/ApplyStaffLeave"));
const StaffLeaveRequestsPage = lazy(() => import("./school/pages/leave/StaffLeaveRequests"));
const StaffLeaveBalancePage = lazy(() => import("./school/pages/leave/StaffLeaveBalance"));
const TimetableConfigurationsPage = lazy(() => import("./school/pages/timetable/Configurations"));
const TimetableSubjectRequirementsPage = lazy(() => import("./school/pages/timetable/SubjectRequirements"));
const TimetableTeacherWorkloadPage = lazy(() => import("./school/pages/timetable/TeacherWorkload"));
const TimetableGeneratePage = lazy(() => import("./school/pages/timetable/Generate"));
const ViewActiveTimetablePage = lazy(() => import("./school/pages/timetable/ViewActiveTimetable"));
const CurriculumFrameworksPage = lazy(() => import("./school/pages/curriculum/Frameworks"));
const CurriculumMapsPage = lazy(() => import("./school/pages/curriculum/CurriculumMaps"));
const CurriculumResourceLibraryPage = lazy(() => import("./school/pages/curriculum/ResourceLibrary"));
const CurriculumReviewDashboardPage = lazy(() => import("./school/pages/curriculum/ReviewDashboard"));
const ReportResourcePage = lazy(() => import("./school/pages/report/ReportResource"));
const TransportRoutesPage = lazy(() => import("./school/pages/transport/Routes"));
const TransportStoppagePage = lazy(() => import("./school/pages/transport/Stoppage"));
const TransportAssignStudentPage = lazy(() => import("./school/pages/transport/AssignStudent"));
const TransportVehiclesPage = lazy(() => import("./school/pages/transport/Vehicles"));
const TransportRouteStudentSmsPage = lazy(() => import("./school/pages/transport/RouteStudentSms"));
const HostelRoomTypePage = lazy(() => import("./school/pages/hostel/RoomType"));
const HostelHostelsPage = lazy(() => import("./school/pages/hostel/Hostels"));
const HostelRoomsPage = lazy(() => import("./school/pages/hostel/Rooms"));
const HostelAssignFeePage = lazy(() => import("./school/pages/hostel/AssignFee"));
const LibraryBookListPage = lazy(() => import("./school/pages/library/BookList"));
const LibraryIssueLogsPage = lazy(() => import("./school/pages/library/IssueLogs"));
const OnlineClassesCoursePage = lazy(() => import("./school/pages/online-classes/Course"));
const OnlineClassesLessonReportPage = lazy(() => import("./school/pages/online-classes/LessonReport"));
const OnlineClassesLiveClassPage = lazy(() => import("./school/pages/online-classes/LiveClass"));
const OnlineClassesLiveDashboardPage = lazy(() => import("./school/pages/online-classes/LiveDashboard"));
const OnlineClassesMyClassroomsPage = lazy(() => import("./school/pages/online-classes/MyClassrooms"));
const AcademicContentTypesPage = lazy(() => import("./school/pages/academic-content/ContentTypes"));
const AcademicContentUploadPage = lazy(() => import("./school/pages/academic-content/UploadContent"));
const ImportExportStudentDataPage = lazy(() => import("./school/pages/import-export/StudentData"));
const ImportExportStudentBiometricPage = lazy(() => import("./school/pages/import-export/StudentBiometric"));
const AccessControlPage = lazy(() => import("./school/pages/access-control/Control"));
const ParentAccountsPage = lazy(() => import("./school/pages/parent-account/ParentAccounts"));
const WebsiteGalleryPage = lazy(() => import("./school/pages/website-configuration/Gallery"));
const WebsiteBulletinBoardPage = lazy(() => import("./school/pages/website-configuration/BulletinBoard"));
const WebsitePublicDisclosurePage = lazy(() => import("./school/pages/website-configuration/PublicDisclosure"));
const BehaviourQuickLogPage = lazy(() => import("./school/pages/behaviour/QuickLog"));
const BehaviourEscalationTicketsPage = lazy(() => import("./school/pages/behaviour/EscalationTickets"));
const BehaviourReportsPage = lazy(() => import("./school/pages/behaviour/Reports"));
const BehaviourClassRosterPage = lazy(() => import("./school/pages/behaviour/ClassRoster"));
const BehaviourCategoriesPage = lazy(() => import("./school/pages/behaviour/Categories"));
const BehaviourEscalationLevelsPage = lazy(() => import("./school/pages/behaviour/EscalationLevels"));
const BehaviourMyEscalationsPage = lazy(() => import("./school/pages/behaviour/MyEscalations"));
const BehaviourStaffStudentPage = lazy(() => import("./school/pages/behaviour/StaffStudent"));
const BehaviourMyStudentsPage = lazy(() => import("./school/pages/behaviour/MyStudents"));
const HumanResourceAddStaff = lazy(() => import("./school/pages/human-resource/AddStaff"));
const HumanResourceManageStaff = lazy(() => import("./school/pages/human-resource/ManageStaff"));
const HumanResourcePayroll = lazy(() => import("./school/pages/human-resource/Payroll"));
const HumanResourceStaffAttendance = lazy(() => import("./school/pages/human-resource/StaffAttendance"));
const ExamTerms = lazy(() => import("./school/pages/exam/Terms"));
const ExamCommonType = lazy(() => import("./school/pages/exam/CommonType"));
const ExamTypePage = lazy(() => import("./school/pages/exam/ExamType"));
const GradingSystemPage = lazy(() => import("./school/pages/exam/GradingSystem"));
const ExamSystemPage = lazy(() => import("./school/pages/exam/ExamSystem"));
const CoScholasticGradePage = lazy(() => import("./school/pages/exam/CoScholasticGrade"));
const CoScholasticAreaPage = lazy(() => import("./school/pages/exam/CoScholasticArea"));
const ExamSchedulePage = lazy(() => import("./school/pages/exam/Schedule"));
const OnlineExamPage = lazy(() => import("./school/pages/exam/OnlineExam"));
const HallTicketPage = lazy(() => import("./school/pages/exam/HallTicket"));
const MarksMultiSubjectPage = lazy(() => import("./school/pages/exam/MarksMultiSubject"));
const SubjectRemarksAllPage = lazy(() => import("./school/pages/exam/SubjectRemarksAll"));
const SubjectRemarksPage = lazy(() => import("./school/pages/exam/SubjectRemarks"));
const ExamMarksPage = lazy(() => import("./school/pages/exam/ExamMarks"));
const CoScholasticMarksPage = lazy(() => import("./school/pages/exam/CoScholasticMarks"));
const MarksReportPage = lazy(() => import("./school/pages/exam/MarksReport"));
const ReportCardPage = lazy(() => import("./school/pages/exam/ReportCard"));
const PromoteStructurePage = lazy(() => import("./school/pages/exam/PromoteStructure"));
const TestAssignmentPage = lazy(() => import("./school/pages/exam/TestAssignment"));
const BulkAttendanceUpdatePage = lazy(() => import("./school/pages/exam/BulkAttendanceUpdate"));
const ExamSystemConfigPage = lazy(() => import("./school/pages/exam/SystemConfig"));
const StudentAdmissionPage = lazy(() => import("./school/pages/student-info/Admission"));
const CurrentStudentsPage = lazy(() => import("./school/pages/student-info/CurrentStudents"));
const AllStudentDetailsPage = lazy(() => import("./school/pages/student-info/AllStudentDetails"));

const Student = lazy(() => import("./student/Student"));
const StudentDetails = lazy(() => import("./student/components/student details/StudentDetails"));
const StudentExaminations = lazy(() => import("./student/components/examination/StudentExaminations"));
const ScheduleStudent = lazy(() => import("./student/components/schedule/ScheduleStudent"));
const AttendanceStudent = lazy(() => import("./student/components/attendance/AttendanceStudent"));
const NoticeStudent = lazy(() => import("./student/components/notice/NoticeStudent"));

const Teacher = lazy(() => import("./teacher/Teacher"));
const TeacherDetails = lazy(() => import("./teacher/components/teacher details/TeacherDetails"));
const TeacherExaminations = lazy(() => import("./teacher/components/teacher examinations/TeacherExaminations"));
const TeacherSchedule = lazy(() => import("./teacher/components/periods/TeacherSchedule"));
const AttendanceTeacher = lazy(() => import("./teacher/components/attendance/AttendanceTeacher"));
const NoticeTeacher = lazy(() => import("./teacher/components/notice/Notice"));

// ── Accountant ────────────────────────────────────────────────────────────────
const Accountant = lazy(() => import("./accountant/Accountant"));
const AccountantDetails = lazy(() => import("./accountant/components/AccountantDetails"));

// ── Librarian ─────────────────────────────────────────────────────────────────
const Librarian = lazy(() => import("./librarian/Librarian"));
const LibrarianDetails = lazy(() => import("./librarian/components/LibrarianDetails"));

// ── Receptionist ──────────────────────────────────────────────────────────────
const Receptionist = lazy(() => import("./receptionist/Receptionist"));
const ReceptionistDetails = lazy(() => import("./receptionist/components/ReceptionistDetails"));

// ── Parent ────────────────────────────────────────────────────────────────────
const Parent = lazy(() => import("./parent/Parent"));
const ParentDetails = lazy(() => import("./parent/components/ParentDetails"));
const ChildrenList = lazy(() => import("./parent/components/ChildrenList"));

// ── Super Admin ───────────────────────────────────────────────────────────────
const SuperAdmin = lazy(() => import("./superAdmin/SuperAdmin"));
const SuperAdminDashboard = lazy(() => import("./superAdmin/components/SuperAdminDashboard"));
const PendingSchools = lazy(() => import("./superAdmin/components/PendingSchools"));

// ── Vice Admin ────────────────────────────────────────────────────────────────
const ViceAdmin = lazy(() => import("./viceAdmin/ViceAdmin"));
const ViceAdminDashboard = lazy(() => import("./viceAdmin/components/ViceAdminDashboard"));
const ViceAdminProfile   = lazy(() => import("./viceAdmin/components/ViceAdminProfile"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader message="Loading application…" />}>
      <Routes>
        <Route path="school" element={<ProtectedRoute allowedRoles={["SCHOOL"]}><School /></ProtectedRoute>}>
          <Route index element={<SchoolDashboard />} />
          <Route path="dashboard" element={<SchoolDashboard />} />
          <Route path="dashboard/staff" element={<StaffDashboard />} />
          <Route path="dashboard/accounts" element={<AccountsDashboard />} />
          <Route path="dashboard/fee-assignment" element={<FeeAssignmentDashboard />} />
          <Route path="dashboard/inventory" element={<InventoryDashboard />} />
          <Route path="dashboard/library" element={<LibraryDashboard />} />
          <Route path="dashboard/follow-up" element={<FollowUpDashboard />} />
          <Route path="dashboard/complaint" element={<ComplaintDashboard />} />
          <Route path="dashboard/visitor" element={<VisitorDashboard />} />
          <Route path="dashboard/chat" element={<ChatDashboard />} />
          <Route path="dashboard/user-activity" element={<UserActivityDashboard />} />
          <Route path="master/session" element={<SessionManagement />} />
          <Route path="master/school-info" element={<SchoolInfo />} />
          <Route path="master/app-version" element={<AppVersion />} />
          <Route path="master/house-name" element={<HouseName />} />
          <Route path="master/hobby-group" element={<HobbyGroup />} />
          <Route path="master/religion" element={<Religion />} />
          <Route path="master/disabilities" element={<Disabilities />} />
          <Route path="master/designation" element={<Designation />} />
          <Route path="master/department" element={<Department />} />
          <Route path="master/library-setting" element={<LibrarySetting />} />
          <Route path="master/general-settings" element={<GeneralSettings />} />
          <Route path="master/online-payment" element={<OnlinePayment />} />
          <Route path="master/payment-method" element={<PaymentMethod />} />
          <Route path="master/sms-settings" element={<SmsSettings />} />
          <Route path="master/sms-template" element={<SmsTemplate />} />
          <Route path="master/biometric-device" element={<BiometricDevice />} />
          <Route path="master/school-shifts" element={<SchoolShifts />} />
          <Route path="master/working-days-template" element={<WorkingDaysTemplate />} />
          <Route path="master/school-config" element={<SchoolConfig />} />
          <Route path="master/boards" element={<Boards />} />
          <Route path="master/enquiry-statuses" element={<EnquiryStatuses />} />
          <Route path="master/enquiry-sources" element={<EnquirySources />} />
          <Route path="master/rooms-assign" element={<RoomAssignment />} />
          <Route path="academics/sections" element={<Sections />} />
          <Route path="academics/classes" element={<AcademicClasses />} />
          <Route path="academics/subject" element={<AcademicSubjects />} />
          <Route path="academics/assign-class-teacher" element={<AssignClassTeacher />} />
          <Route path="academics/timing-configuration" element={<TimingConfiguration />} />
          <Route path="academics/student-timetable" element={<StudentTimetable />} />
          <Route path="academics/student-timetable/:classId" element={<StudentTimetableView />} />
          <Route path="academics/teachers-timetable" element={<TeacherTimetable />} />
          <Route path="academics/teachers-timetable/:teacherId" element={<TeacherTimetableView />} />
          <Route path="academics/change-time-arrangement" element={<ChangeTimeArrangement />} />
          <Route path="academics/mark-absent-user-status" element={<MarkAbsentUserStatus />} />
          <Route path="teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="accountant-dashboard" element={<AccountantDashboard />} />
          <Route path="class" element={<Class />} />
          <Route path="class-details" element={<ClassDetails />} />
          <Route path="subject" element={<Subject />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="assign-period" element={<AssignPeriod2 />} />
          <Route path="periods" element={<Schedule />} />
          <Route path="attendance" element={<StudentAttendanceList />} />
          <Route path="attendance-student/:studentId" element={<AttendanceDetails />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="notice" element={<NoticeSchool />} />
          <Route path="front-office/admission-enquiry" element={<AdmissionEnquiry />} />
          <Route path="front-office/visitor-book" element={<VisitorBook />} />
          <Route path="front-office/phone-call-log"    element={<PhoneCallLog />} />
          <Route path="front-office/postal-receive"    element={<PostalRecord recordType="Receive" />} />
          <Route path="front-office/postal-dispatch"   element={<PostalRecord recordType="Dispatch" />} />
          <Route path="front-office/complain"         element={<Complaint />} />
          <Route path="front-office/setup"            element={<SetupFrontOffice />} />
          <Route path="homework/list" element={<HomeworkList />} />
          <Route path="communicate/group-message" element={<GroupMessage />} />
          <Route path="communicate/particular-student" element={<ParticularStudent />} />
          <Route path="communicate/particular-staff" element={<ParticularStaff />} />
          <Route path="communicate/particular-number-sms" element={<ParticularNumberSms />} />
          <Route path="communicate/particular-email" element={<ParticularEmail />} />
          <Route path="communicate/homework" element={<CommunicationHomework />} />
          <Route path="communicate/holidays" element={<CommunicationHolidays />} />
          <Route path="communicate/events" element={<CommunicationEvents />} />
          <Route path="communicate/academic-calendar" element={<AcademicCalendar />} />
          <Route path="communicate/birthday" element={<CommunicationBirthday />} />
          <Route path="communicate/gallery" element={<CommunicationGallery />} />
          <Route path="communicate/hobby-group-members" element={<HobbyGroupMembers />} />
          <Route path="communicate/circular" element={<CommunicationCircular />} />
          <Route path="communicate/popups" element={<CommunicationPopups />} />
          <Route path="communicate/home-content" element={<HomeContent />} />
          <Route path="communicate/sms-student-username" element={<SmsStudentUsername />} />
          <Route path="communicate/sms-staff-username" element={<SmsStaffUsername />} />
          <Route path="communicate/:resource" element={<CommunicationPage />} />
          <Route path="campus-feed" element={<CampusFeed />} />
          <Route path="student-profile/hub" element={<StudentProfileHub />} />
          <Route path="student-profile/pillars" element={<StudentProfilePillars />} />
          <Route path="student-profile/event-types" element={<StudentProfileEventTypes />} />
          <Route path="student-profile/event-master" element={<StudentProfileEventMaster />} />
          <Route path="student-profile/all-entries" element={<StudentProfileAllEntries />} />
          <Route path="student-profile/verification" element={<StudentProfileVerification />} />
          <Route path="student-profile/sports-profile" element={<StudentProfileSports />} />
          <Route path="student-profile/sports-setup" element={<StudentProfileSportsSetup />} />
          <Route path="student-profile/annual-profile" element={<StudentProfileAnnual />} />
          <Route path="activity/complaint-type" element={<ActivityComplaintType />} />
          <Route path="activity/complaint-books" element={<ActivityComplaintBooks />} />
          <Route path="activity/postal" element={<ActivityPostal />} />
          <Route path="activity/vistor-purposes" element={<ActivityVisitorPurposes />} />
          <Route path="activity/visitors-books" element={<ActivityVisitorsBooks />} />
          <Route path="activity/visitor-qr-code" element={<ActivityVisitorQr />} />
          <Route path="activity/gate-pass" element={<ActivityGatePass />} />
          <Route path="activity/admission-query" element={<ActivityAdmissionQuery />} />
          <Route path="activity/seat-matrix" element={<ActivitySeatMatrix />} />
          <Route path="activity/enquiry-qr-code" element={<ActivityEnquiryQr />} />
          <Route path="activity/student-registration" element={<ActivityRegistration />} />
          <Route path="activity/student-id-card" element={<ActivityIdCard />} />
          <Route path="activity/achievements" element={<ActivityAchievements />} />
          <Route path="students/passout" element={<StudentInfoPassout />} />
          <Route path="students/leaving-certificate" element={<StudentInfoLeaving />} />
          <Route path="students/dropout" element={<StudentInfoDropout />} />
          <Route path="students/dropout-passout" element={<StudentInfoDropoutPassout />} />
          <Route path="students/promote" element={<StudentInfoPromote />} />
          <Route path="students/attendance-message" element={<StudentInfoAttendanceMessage />} />
          <Route path="students/remarks" element={<StudentInfoRemarks />} />
          <Route path="students/performance" element={<StudentInfoPerformance />} />
          <Route path="leave/apply" element={<LeaveManagement />} />
          <Route path="leave/records" element={<LeaveManagement />} />
          <Route path="leave/quota" element={<LeaveManagement />} />
          <Route path="library/books" element={<LibraryBooks />} />
          <Route path="fees/collect" element={<StudentFeePayment />} />
          <Route path="fees/schedule-class-wise" element={<StudentFeeSchedule />} />
          <Route path="fees/term" element={<StudentFeeTerm />} />
          <Route path="fees/type" element={<StudentFeeType />} />
          <Route path="fees/rebate-rules" element={<StudentFeeRebate />} />
          <Route path="fees/group" element={<StudentFeeGroup />} />
          <Route path="fees/multi-group-assign" element={<StudentFeeMultiGroup />} />
          <Route path="fees/back-dues" element={<StudentFeeBackDues />} />
          <Route path="fees/adjustment-approvals" element={<StudentFeeAdjustments />} />
          <Route path="fees/reminder" element={<StudentFeeReminder />} />
          <Route path="fees/demand-notice" element={<StudentFeeDemand />} />
          <Route path="fees/demand-notice-termwise" element={<StudentFeeDemandTermwise />} />
          <Route path="fees/promote-structure" element={<StudentFeePromote />} />
          <Route path="fees/promote-back-dues" element={<StudentFeePromoteBack />} />
          <Route path="student-bank/wallets" element={<StudentBankWallets />} />
          <Route path="student-bank/transactions" element={<StudentBankTransactions />} />
          <Route path="accounts/payment-requests" element={<AccountPaymentRequests />} />
          <Route path="accounts/event-collections" element={<AccountEventCollections />} />
          <Route path="income/category" element={<AccountIncomeCategory />} />
          <Route path="expenses/category" element={<AccountExpenseCategory />} />
          <Route path="accounts/account-head" element={<AccountHead />} />
          <Route path="accounts/income" element={<AccountIncome />} />
          <Route path="accounts/expenses" element={<AccountExpenses />} />
          <Route path="accounts/income-report" element={<AccountIncomeReport />} />
          <Route path="accounts/expense-report" element={<AccountExpenseReport />} />
          <Route path="accounts/daily-monthly-report" element={<AccountDailyMonthlyReport />} />
          <Route path="accounts/overall-summary" element={<AccountOverallSummary />} />
          <Route path="accounts/group-wise-overall" element={<AccountGroupWiseOverall />} />
          <Route path="store/dashboard" element={<StoreRoomDashboard />} />
          <Route path="store/rooms" element={<StoreRoomRooms />} />
          <Route path="store/items" element={<StoreRoomItems />} />
          <Route path="store/current-stock" element={<StoreRoomCurrentStock />} />
          <Route path="store/transactions" element={<StoreRoomTransactions />} />
          <Route path="inventory/item-category" element={<InventoryItemCategory />} />
          <Route path="inventory/add-item" element={<InventoryAddItem />} />
          <Route path="inventory/item-bundle" element={<InventoryItemBundle />} />
          <Route path="inventory/supplier-list" element={<InventorySupplierList />} />
          <Route path="inventory/purchase" element={<InventoryPurchase />} />
          <Route path="inventory/sell" element={<InventorySell />} />
          <Route path="inventory/sell-collection" element={<InventorySellCollection />} />
          <Route path="inventory/cancelled-invoice" element={<InventoryCancelledInvoice />} />
          <Route path="inventory/return-invoice" element={<InventoryReturnInvoice />} />
          <Route path="inventory/item-receive-sell" element={<InventoryItemReceiveSell />} />
          <Route path="leave/type" element={<LeaveTypePage />} />
          <Route path="leave/define-policy" element={<DefineLeavePolicyPage />} />
          <Route path="leave/apply-staff" element={<ApplyStaffLeavePage />} />
          <Route path="leave/staff-requests" element={<StaffLeaveRequestsPage />} />
          <Route path="leave/staff-balance" element={<StaffLeaveBalancePage />} />
          <Route path="timetable/configurations" element={<TimetableConfigurationsPage />} />
          <Route path="timetable/subject-requirements" element={<TimetableSubjectRequirementsPage />} />
          <Route path="timetable/teacher-workload" element={<TimetableTeacherWorkloadPage />} />
          <Route path="timetable/generate" element={<TimetableGeneratePage />} />
          <Route path="timetable/view-active-timetable" element={<ViewActiveTimetablePage />} />
          <Route path="periods" element={<ViewActiveTimetablePage />} />
          <Route path="curriculum/frameworks" element={<CurriculumFrameworksPage />} />
          <Route path="curriculum/curriculum-maps" element={<CurriculumMapsPage />} />
          <Route path="curriculum/resource-library" element={<CurriculumResourceLibraryPage />} />
          <Route path="curriculum/review-dashboard" element={<CurriculumReviewDashboardPage />} />
          <Route path="reports/:resource" element={<ReportResourcePage />} />
          <Route path="reports" element={<ReportResourcePage />} />
          <Route path="hr/add-staff" element={<HumanResourceAddStaff />} />
          <Route path="hr/manage-staff" element={<HumanResourceManageStaff />} />
          <Route path="hr/payroll" element={<HumanResourcePayroll />} />
          <Route path="hr/staff-attendance" element={<HumanResourceStaffAttendance />} />
          <Route path="exam/terms" element={<ExamTerms />} />
          <Route path="exam/common-type" element={<ExamCommonType />} />
          <Route path="exam/type" element={<ExamTypePage />} />
          <Route path="exam/grading-system" element={<GradingSystemPage />} />
          <Route path="exam/system" element={<ExamSystemPage />} />
          <Route path="exam/co-scholastic-grade" element={<CoScholasticGradePage />} />
          <Route path="exam/co-scholastic-area" element={<CoScholasticAreaPage />} />
          <Route path="exam/schedule" element={<ExamSchedulePage />} />
          <Route path="exam/online-exam" element={<OnlineExamPage />} />
          <Route path="exam/hall-ticket" element={<HallTicketPage />} />
          <Route path="examinations" element={<HallTicketPage />} />
          <Route path="exam/marks-multi-subject" element={<MarksMultiSubjectPage />} />
          <Route path="exam/subject-remarks-all" element={<SubjectRemarksAllPage />} />
          <Route path="exam/subject-remarks" element={<SubjectRemarksPage />} />
          <Route path="exam/marks" element={<ExamMarksPage />} />
          <Route path="examinations/marks" element={<ExamMarksPage />} />
          <Route path="exam/co-scholastic-marks" element={<CoScholasticMarksPage />} />
          <Route path="exam/marks-report" element={<MarksReportPage />} />
          <Route path="exam/report-card" element={<ReportCardPage />} />
          <Route path="exam/promote-structure" element={<PromoteStructurePage />} />
          <Route path="exam/test-assignment" element={<TestAssignmentPage />} />
          <Route path="exam/bulk-attendance-update" element={<BulkAttendanceUpdatePage />} />
          <Route path="exam/system-config" element={<ExamSystemConfigPage />} />
          <Route path="fees/student/:studentId" element={<StudentFeesPage />} />
          <Route path="fees/demand-bill" element={<EnhancedDemandBillPrint />} />
          <Route path="fees/search-due" element={<SearchDueFees />} />
          <Route path="fees/master" element={<FeesMaster />} />
          <Route path="fees/group" element={<FeesGroup />} />
          <Route path="fees/type" element={<FeesType />} />
          <Route path="fees/discount" element={<FeesDiscount />} />
          <Route path="fees/carry-forward" element={<FeesCarryForward />} />
          <Route path="fee-collection/demand-bill/:studentId" element={<StudentDemandBillPrint />} />
          <Route path="fees/offline-bank-payment" element={<OfflineBankPayment />} />
          <Route path="fees/search-payment" element={<SearchFeesPayment />} />
          <Route path="fee-collection" element={<StudentSearchPage />} />
          <Route path="fee-collection/collect/:studentId" element={<FeeCollectionPage />} />
          <Route path="transport/routes" element={<TransportRoutesPage />} />
          <Route path="transport/stoppage" element={<TransportStoppagePage />} />
          <Route path="transport/assign-student" element={<TransportAssignStudentPage />} />
          <Route path="transport/vehicles" element={<TransportVehiclesPage />} />
          <Route path="transport/route-student-sms" element={<TransportRouteStudentSmsPage />} />
          <Route path="hostel/room-type" element={<HostelRoomTypePage />} />
          <Route path="hostel/hostels" element={<HostelHostelsPage />} />
          <Route path="hostel/rooms" element={<HostelRoomsPage />} />
          <Route path="hostel/assign-fee" element={<HostelAssignFeePage />} />
          <Route path="library/book-list" element={<LibraryBookListPage />} />
          <Route path="library/issue-logs" element={<LibraryIssueLogsPage />} />
          <Route path="online-classes/course" element={<OnlineClassesCoursePage />} />
          <Route path="online-classes/lesson-report" element={<OnlineClassesLessonReportPage />} />
          <Route path="online-classes/live-class" element={<OnlineClassesLiveClassPage />} />
          <Route path="online-classes/live-dashboard" element={<OnlineClassesLiveDashboardPage />} />
          <Route path="online-classes/my-classrooms" element={<OnlineClassesMyClassroomsPage />} />
          <Route path="content/content-types" element={<AcademicContentTypesPage />} />
          <Route path="study-material/upload" element={<AcademicContentUploadPage />} />
          <Route path="import/student-data" element={<ImportExportStudentDataPage />} />
          <Route path="import/student-biometric" element={<ImportExportStudentBiometricPage />} />
          <Route path="access/control" element={<AccessControlPage />} />
          <Route path="parent-accounts" element={<ParentAccountsPage />} />
          <Route path="website/gallery" element={<WebsiteGalleryPage />} />
          <Route path="website/bulletin-board" element={<WebsiteBulletinBoardPage />} />
          <Route path="website/public-disclosure" element={<WebsitePublicDisclosurePage />} />
          <Route path="behaviour/quick-log" element={<BehaviourQuickLogPage />} />
          <Route path="behaviour/escalation-tickets" element={<BehaviourEscalationTicketsPage />} />
          <Route path="behaviour/reports" element={<BehaviourReportsPage />} />
          <Route path="behaviour/class-roster" element={<BehaviourClassRosterPage />} />
          <Route path="behaviour/categories" element={<BehaviourCategoriesPage />} />
          <Route path="behaviour/escalation-levels" element={<BehaviourEscalationLevelsPage />} />
          <Route path="behaviour/my-escalations" element={<BehaviourMyEscalationsPage />} />
          <Route path="behaviour/staff-student" element={<BehaviourStaffStudentPage />} />
          <Route path="behaviour/my-students" element={<BehaviourMyStudentsPage />} />
          <Route path="study-material/upload" element={<StudyMaterialList />} />
          <Route path="leave/approve" element={<LeaveManagement />} />
          <Route path="students/admission" element={<StudentAdmissionPage />} />
          <Route path="students/current" element={<CurrentStudentsPage />} />
          <Route path="students/all-details" element={<AllStudentDetailsPage />} />
          <Route path="students/admission/add" element={<StudentAdmissionForm />} />
          <Route path="students/admission/view/:id" element={<StudentDetailView />} />
          <Route path="students/admission/:mode/:id" element={<StudentAdmissionForm />} />
          <Route path="students/online-admission" element={<OnlineAdmission />} />
          <Route path="students/online-admission/view/:id" element={<ViewOnlineApplication />} />
          <Route path="students/multi-class" element={<MultiClassStudent />} />
          <Route path="students/disabled" element={<DisabledStudents />} />
          <Route path="students/bulk-delete" element={<StudentBulkDelete />} />
          <Route path="students/category" element={<StudentCategories />} />
          <Route path="students/house" element={<StudentHouse />} />
          <Route path="students/disable" element={<DisableReason />} />
        </Route>

        <Route path="student" element={<ProtectedRoute allowedRoles={["STUDENT"]}><Student /></ProtectedRoute>}>
          <Route index element={<StudentDetails />} />
          <Route path="student-details" element={<StudentDetails />} />
          <Route path="examinations" element={<StudentExaminations />} />
          <Route path="periods" element={<ScheduleStudent />} />
          <Route path="attendance" element={<AttendanceStudent />} />
          <Route path="notice" element={<NoticeStudent />} />
        </Route>

        <Route path="teacher" element={<ProtectedRoute allowedRoles={["TEACHER"]}><Teacher /></ProtectedRoute>}>
          <Route index element={<TeacherDetails />} />
          <Route path="details" element={<TeacherDetails />} />
          <Route path="examinations" element={<TeacherExaminations />} />
          <Route path="periods" element={<TeacherSchedule />} />
          <Route path="attendance" element={<AttendanceTeacher />} />
          <Route path="notice" element={<NoticeTeacher />} />
        </Route>

        {/* ── Accountant ── */}
        <Route path="accountant" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><Accountant /></ProtectedRoute>}>
          <Route index element={<AccountantDetails />} />
          <Route path="details" element={<AccountantDetails />} />
        </Route>

        {/* ── Librarian ── */}
        <Route path="librarian" element={<ProtectedRoute allowedRoles={["LIBRARIAN"]}><Librarian /></ProtectedRoute>}>
          <Route index element={<LibrarianDetails />} />
          <Route path="details" element={<LibrarianDetails />} />
        </Route>

        {/* ── Receptionist ── */}
        <Route path="receptionist" element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]}><Receptionist /></ProtectedRoute>}>
          <Route index element={<ReceptionistDetails />} />
          <Route path="details" element={<ReceptionistDetails />} />
        </Route>

        {/* ── Parent ── */}
        <Route path="parent" element={<ProtectedRoute allowedRoles={["PARENT"]}><Parent /></ProtectedRoute>}>
          <Route index element={<ParentDetails />} />
          <Route path="details" element={<ParentDetails />} />
          <Route path="children" element={<ChildrenList />} />
        </Route>

        {/* ── Super Admin ── */}
        <Route path="super-admin" element={<ProtectedRoute allowedRoles={["SUPERADMIN"]}><SuperAdmin /></ProtectedRoute>}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="pending-schools" element={<PendingSchools />} />
        </Route>

        {/* ── Vice Admin ── */}
        <Route path="vice-admin" element={<ProtectedRoute allowedRoles={["VICEADMIN"]}><ViceAdmin /></ProtectedRoute>}>
          <Route index element={<ViceAdminDashboard />} />
          <Route path="dashboard" element={<ViceAdminDashboard />} />
          <Route path="profile"   element={<ViceAdminProfile />} />
        </Route>

        <Route path="/" element={<Client />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="logout" element={<Logout />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="schools" element={<AllSchoolsPage />} />
          <Route path="school/:id" element={<SchoolDetailsPage />} />
          <Route path="school/:id/apply" element={<ApplyAdmissionPage />} />
          <Route path="application-success" element={<ApplicationSuccessPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
