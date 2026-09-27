import { configureStore } from '@reduxjs/toolkit';
import libraryDashboardReducer from './libraryDashboardSlice';
import schoolDashboardsReducer from './schoolDashboardsSlice';
import masterConfigurationReducer from './masterConfigurationSlice';
import academicModuleReducer from './academicModuleSlice';
import sectionsReducer from './sectionSlice';
import communicationReducer from './communicationSlice';
import campusFeedReducer from './campusFeedSlice';
import studentProfileReducer from './studentProfileSlice';
import studentActivityReducer from './studentActivitySlice';
import studentInfoReducer from './studentInfoSlice';
import studentFeeReducer from './studentFeeSlice';
import studentBankReducer from './studentBankSlice';
import accountReducer from './accountSlice';
import storeRoomReducer from './storeRoomSlice';
import inventoryReducer from './inventorySlice';
import humanResourceReducer from './humanResourceSlice';
import leaveReducer from './leaveSlice';
import timetableReducer from './timetableSlice';
import reportReducer from './reportSlice';
import curriculumPlanningReducer from './curriculumPlanningSlice';
import examReducer from './examSlice';
import transportReducer from './transportSlice';
import hostelReducer from './hostelSlice';
import libraryResourceReducer from './libraryResourceSlice';
import onlineClassReducer from './onlineClassSlice';
import academicContentReducer from './academicContentSlice';
import importExportReducer from './importExportSlice';
import accessControlReducer from './accessControlSlice';
import parentAccountReducer from './parentAccountSlice';
import websiteConfigurationReducer from './websiteConfigurationSlice';
import behaviourReducer from './behaviourSlice';

export const store = configureStore({
  reducer: {
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
    curriculumPlanning: curriculumPlanningReducer,
    exam: examReducer,
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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
