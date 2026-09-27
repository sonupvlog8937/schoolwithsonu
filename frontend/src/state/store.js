import { configureStore } from "@reduxjs/toolkit";
import loginReducer            from "./loginSlice";
import visitorBookReducer      from "./visitorBookSlice";
import admissionEnquiryReducer from "./admissionEnquirySlice";
import phoneCallLogReducer     from "./phoneCallLogSlice";
import postalRecordReducer     from "./postalRecordSlice";
import complaintReducer        from "./complaintSlice";
import setupFrontOfficeReducer from "./setupFrontOfficeSlice";
import studentAdmissionReducer from "./studentAdmissionSlice";
import studentSettingsReducer  from "./studentSettingsSlice";
import studentManagementReducer from "./studentManagementSlice";
import publicSchoolReducer     from "./publicSchoolSlice";
import feeCollectionReducer    from "./feeCollectionSlice";
import feeDiscountReducer      from "./feeDiscountSlice";
import feeCarryForwardReducer  from "./feeCarryForwardSlice";
import feeAssignmentReducer    from "./feeAssignmentSlice";
import inventoryDashboardReducer from "./inventoryDashboardSlice";
import schoolReducer           from "./schoolSlice";
import staffDashboardReducer   from "./staffDashboardSlice";
import accountsDashboardReducer from "./accountsDashboardSlice";
import libraryDashboardReducer from "./libraryDashboardSlice";
import schoolDashboardsReducer from "./schoolDashboardsSlice";
import masterConfigurationReducer from "./masterConfigurationSlice";
import academicModuleReducer from "./academicModuleSlice";
import sectionsReducer from "./sectionSlice";
import communicationReducer from "./communicationSlice";
import campusFeedReducer from "./campusFeedSlice";
import studentProfileReducer from "./studentProfileSlice";
import studentActivityReducer from "./studentActivitySlice";
import studentInfoReducer from "./studentInfoSlice";
import studentFeeReducer from "./studentFeeSlice";
import studentBankReducer from "./studentBankSlice";
import accountReducer from "./accountSlice";
import storeRoomReducer from "./storeRoomSlice";
import inventoryReducer from "./inventorySlice";
import humanResourceReducer from "./humanResourceSlice";
import leaveReducer from "./leaveSlice";
import timetableReducer from "./timetableSlice";
import reportReducer from "./reportSlice";
import transportReducer from "./transportSlice";
import hostelReducer from "./hostelSlice";
import libraryResourceReducer from "./libraryResourceSlice";
import onlineClassReducer from "./onlineClassSlice";
import academicContentReducer from "./academicContentSlice";
import importExportReducer from "./importExportSlice";
import accessControlReducer from "./accessControlSlice";
import parentAccountReducer from "./parentAccountSlice";
import websiteConfigurationReducer from "./websiteConfigurationSlice";
import behaviourReducer from "./behaviourSlice";
import curriculumPlanningReducer from "./curriculumPlanningSlice";
import examReducer from "./examSlice";

export default configureStore({
    reducer: {
        login:            loginReducer,
        visitorBook:      visitorBookReducer,
        admissionEnquiry: admissionEnquiryReducer,
        phoneCallLog:     phoneCallLogReducer,
        postalRecord:     postalRecordReducer,
        complaint:        complaintReducer,
        setupFrontOffice: setupFrontOfficeReducer,
        studentAdmission: studentAdmissionReducer,
        studentSettings:  studentSettingsReducer,
        studentManagement: studentManagementReducer,
        publicSchool:     publicSchoolReducer,
        feeCollection:    feeCollectionReducer,
        feeDiscount:      feeDiscountReducer,
        feeCarryForward:  feeCarryForwardReducer,
        feeAssignment:    feeAssignmentReducer,
        inventoryDashboard: inventoryDashboardReducer,
        school:           schoolReducer,
        staffDashboard:   staffDashboardReducer,
        accountsDashboard: accountsDashboardReducer,
        libraryDashboard: libraryDashboardReducer,
        schoolDashboards: schoolDashboardsReducer,
        masterConfiguration: masterConfigurationReducer,
        academicModule: academicModuleReducer,
        sections: sectionsReducer,
        communication: communicationReducer,
        campusFeed: campusFeedReducer,
        studentProfile: studentProfileReducer,
        studentActivity: studentActivityReducer,
        studentInfo: studentInfoReducer,
        studentFee: studentFeeReducer,
        studentBank: studentBankReducer,
        account: accountReducer,
        storeRoom: storeRoomReducer,
        inventory: inventoryReducer,
        humanResource: humanResourceReducer,
        leave: leaveReducer,
        timetable: timetableReducer,
        report: reportReducer,
        transport: transportReducer,
        hostel: hostelReducer,
        libraryResource: libraryResourceReducer,
        onlineClass: onlineClassReducer,
        academicContent: academicContentReducer,
        importExport: importExportReducer,
        accessControl: accessControlReducer,
        parentAccount: parentAccountReducer,
        websiteConfiguration: websiteConfigurationReducer,
        behaviour: behaviourReducer,
        curriculumPlanning: curriculumPlanningReducer,
        exam: examReducer,
    }
});