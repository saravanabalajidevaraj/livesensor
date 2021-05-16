import { Routes, RouterModule } from '@angular/router';


import { AuthGuard } from './_guards';
import { LoginComponent } from './login';
import { HeaderComponent } from './header';
import { AsideComponent } from './aside';
import { ReadMeComponent } from './readme/readme.component';
import { AchievementsComponent } from './organizations/achievements/achievements.component';
import { AppreciationLettersComponent } from './organizations/appreciation-letters/appreciation-letters.component';
import { GradingStatusComponent } from './organizations/grading-status/grading-status.component';
import { OrganizationChartComponent } from './organizations/organization-chart/organization-chart.component';
import { OverviewComponent } from './organizations/overview/overview.component';
import { ErrorComponent } from './error/error.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { EmployeeCreateComponent } from './employees/employee-create/employee-create.component';
import { EmployeeDashboardComponent } from './employees/employee-dashboard/employee-dashboard.component';
import { EmployeeSalaryComponent } from './employees/employee-salary/employee-salary.component';
import { SalaryCalculationComponent } from './employees/employee-salary/calculate/salary-calculation.component';
import { SalaryGenerationComponent } from './employees/employee-salary/generate/salary-generation.component';
import { SalaryPayslipComponent } from './employees/employee-salary/payslip/salary-payslip.component';
import { EmployeeVacationComponent } from './employees/employee-vacation/employee-vacation.component';
import { VacationSummaryComponent } from './employees/employee-vacation/summary/vacation-summary.component';
import { VacationRequestComponent } from './employees/employee-vacation/request/vacation/vacation-request.component';
import { OvertimeRequestComponent } from './employees/employee-vacation/request/overtime/overtime-request.component';
import { VacationBalanceComponent } from './employees/employee-vacation/balance/vacation-balance.component';
import { ApproveVacationComponent } from './employees/employee-vacation/approve/approve-vacation.component';
import { AddVacationComponent } from './employees/employee-vacation/add-vacation/add-vacation.component';
import { AddOvertimeComponent } from './employees/employee-vacation/add-overtime/add-overtime.component';
import { SiteCreateComponent } from './sites/site-create/site-create.component';
import { SiteDashboardComponent } from './sites/site-dashboard/site-dashboard.component';
import { DeploymentCreateComponent } from './deployments/deployment-create/deployment-create.component';
import { DeploymentDashboardComponent } from './deployments/deployment-dashboard/deployment-dashboard.component';
import { GradeToJdComponent } from './mappings/grade-to-jd/grade-to-jd.component';
import { ClockingComponent } from './reports/clocking/clocking.component';
import { AARComponent } from './reports/after-action-review/after-action-review.component';
import { DCComponent } from './reports/daily-checklist/daily-checklist.component';
import { FIComponent } from './reports/fire-incident/fire-incident.component';
import { IRComponent } from './reports/incident-report/incident-report.component';
import { JAComponent } from './reports/job-appraisal/job-appraisal.component';
import { LAFComponent } from './reports/lost-and-found/lost-and-found.component';
import { OFComponent } from './reports/officer-feedback/officer-feedback.component';
import { OJTComponent } from './reports/on-job-training/on-job-training.component';
import { OVComponent } from './reports/operation-visit/operation-visit.component';
import { PEComponent } from './reports/performance-evaluation/performance-evaluation.component';
import { RTComponent } from './reports/refresher-training/refresher-training.component';
import { SSCComponent } from './reports/shift-supervisor-checklist/shift-supervisor-checklist.component';
import { SVComponent } from './reports/site-visit/site-visit.component';
import { ELComponent } from './reports/learning-report/learning-report.component';
import { ELRComponent } from './reports/learning-response/learning-response.component';
import { OBComponent } from './reports/occurrence-book/occurrence-book.component';
import { ARComponent } from './reports/attendance-report/attendance-report.component';
import { VRComponent } from './reports/vacation-report/vacation-report.component';
import { SRComponent } from './reports/salary-report/salary-report.component';
import { TRComponent } from './reports/training/training-report.component';
import { OTComponent } from './reports/overtime/overtime.component';
import { ClientSatisfactionComponent } from './reports/client-satisfaction/client-satisfaction.component';
import { ClientSatisfactoryComponent } from './sites/client-satisfactory/client-satisfactory.component';
import { CreateLearningComponent } from './learning/create/create-learning.component';
import { ResultLearningComponent } from './learning/result/result-learning.component';
import { ViewLearningComponent } from './learning/view/view-learning.component';
import { CreateTrainingComponent } from './training/create/create-training.component';
import { ViewTrainingComponent } from './training/view/view-training.component';
import { CompleteTrainingComponent } from './training/complete/complete-training.component';
import { BackfillComponent } from './backfill/backfill.component';
import { ManagementComponent } from './management/management.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { OvertimeComponent } from './overtime/overtime.component';


const appRoutes: Routes = [
    { path: 'login'                      , component: LoginComponent },
    { path: 'readme'                     , component: ReadMeComponent },
    { path: 'error'                      , component: ErrorComponent, canActivate: [AuthGuard] },
    { path: 'status/:statusId'           , component: ErrorComponent, canActivate: [AuthGuard] },
    { path: 'backfill'                   , component: BackfillComponent, canActivate: [AuthGuard] },
    { path: 'add-employee'               , component: EmployeeCreateComponent, canActivate: [AuthGuard] },
    { path: 'dashboard-employee'         , component: EmployeeDashboardComponent, canActivate: [AuthGuard] },
    { path: 'vacation'                   , component: EmployeeVacationComponent, canActivate: [AuthGuard], children: [
        { path: ''                , redirectTo: '/vacation/(vacation:summary)', pathMatch: 'full' },
        { path: 'summary'         , component: VacationSummaryComponent, outlet: 'vacation' },
        { path: 'vacation'        , component: VacationRequestComponent, outlet: 'vacation' },
        { path: 'overtime'        , component: OvertimeRequestComponent, outlet: 'vacation' },
        { path: 'add-vacation'    , component: AddVacationComponent, outlet: 'vacation' },
        { path: 'add-overtime'    , component: AddOvertimeComponent, outlet: 'vacation' },
    ] },
    { path: 'salary'                     , component: EmployeeSalaryComponent, canActivate: [AuthGuard], children: [
        { path: ''                , redirectTo: '/salary/(salary:calculate)', pathMatch: 'full' },
        { path: 'calculate'       , component: SalaryCalculationComponent, outlet: 'salary' },
        { path: 'generate'        , component: SalaryGenerationComponent, outlet: 'salary' },
        { path: 'payslip'         , component: SalaryPayslipComponent, outlet: 'salary' },
    ] },
    { path: 'holidays'                   , component: HolidaysComponent, canActivate: [AuthGuard] },
    { path: 'add-site'                   , component: SiteCreateComponent, canActivate: [AuthGuard] },
    { path: 'dashboard-site'             , component: SiteDashboardComponent, canActivate: [AuthGuard] },
    { path: 'add-deployment'             , component: DeploymentCreateComponent, canActivate: [AuthGuard] },
    { path: 'dashboard-deployment'       , component: DeploymentDashboardComponent, canActivate: [AuthGuard] },
    { path: 'mapping-gradeToJD'          , component: GradeToJdComponent, canActivate: [AuthGuard] },
    { path: 'notifications'              , component: NotificationsComponent, canActivate: [AuthGuard] },
    { path: 'create-learning'            , component: CreateLearningComponent, canActivate: [AuthGuard] },
    { path: 'create-training'            , component: CreateTrainingComponent, canActivate: [AuthGuard] },
    { path: 'client-satisfaction'        , component: ClientSatisfactionComponent, canActivate: [AuthGuard] },
    { path: 'vacation-balance'           , component: VacationBalanceComponent, canActivate: [AuthGuard] },

    // employee dashboard url
    { path: 'dashboard-employee/:employeeId', component: EmployeeDashboardComponent, canActivate: [AuthGuard] },

    // elearning user submission url
    { path: 'learning-response/:eLearningId', component: ELRComponent, canActivate: [AuthGuard] },

    // elearning user submission url
    { path: 'complete-training/:trainingId', component: CompleteTrainingComponent, canActivate: [AuthGuard] },

    // elearning user submission view url
    { path: 'learning-response/:eLearningId/:noteId/:reportId', component: ELRComponent, canActivate: [AuthGuard] },

    // elearning submission status url
    { path: 'learning-result/:eLearningId/:noteId/:reportId', component: ResultLearningComponent, canActivate: [AuthGuard] },

    // vacation approve/reject url
    { path: 'approve-vacation/:noteId/:reportId', component: ApproveVacationComponent, canActivate: [AuthGuard] },

    // management url
    { path: 'management/:noteId/:feedbackId', component: ManagementComponent, canActivate: [AuthGuard] },

    // overtime url
    { path: 'overtime/:noteId/:attendanceId', component: OvertimeComponent, canActivate: [AuthGuard] },

    // report search urls
    { path: 'after-action-review'        , component: AARComponent, canActivate: [AuthGuard] },
    { path: 'attendance-report'          , component: ARComponent, canActivate: [AuthGuard] },
    { path: 'client-satisfaction'        , component: ClientSatisfactionComponent, canActivate: [AuthGuard] },
    { path: 'clocking-report'            , component: ClockingComponent, canActivate: [AuthGuard] },
    { path: 'daily-checklist'            , component: DCComponent, canActivate: [AuthGuard] },
    { path: 'fire-incident'              , component: FIComponent, canActivate: [AuthGuard] },
    { path: 'incident-report'            , component: IRComponent, canActivate: [AuthGuard] },
    { path: 'job-appraisal'              , component: JAComponent, canActivate: [AuthGuard] },
    { path: 'learning-report'            , component: ELComponent, canActivate: [AuthGuard] },
    { path: 'lost-and-found'             , component: LAFComponent, canActivate: [AuthGuard] },
    { path: 'occurrence-book'            , component: OBComponent, canActivate: [AuthGuard] },
    { path: 'officer-feedback'           , component: OFComponent, canActivate: [AuthGuard] },
    { path: 'on-job-training'            , component: OJTComponent, canActivate: [AuthGuard] },
    { path: 'operation-visit'            , component: OVComponent, canActivate: [AuthGuard] },
    { path: 'performance-evaluation'     , component: PEComponent, canActivate: [AuthGuard] },
    { path: 'refresher-training'         , component: RTComponent, canActivate: [AuthGuard] },
    { path: 'salary-report'              , component: SRComponent, canActivate: [AuthGuard] },
    { path: 'shift-supervisor-checklist' , component: SSCComponent, canActivate: [AuthGuard] },
    { path: 'site-visit'                 , component: SVComponent, canActivate: [AuthGuard] },
    { path: 'training-report'            , component: TRComponent, canActivate: [AuthGuard] },
    { path: 'vacation-report'            , component: VRComponent, canActivate: [AuthGuard] },
    { path: 'overtime-report'            , component: OTComponent, canActivate: [AuthGuard] },

    // report view urls
    { path: 'after-action-review/:reportId'        , component: AARComponent, canActivate: [AuthGuard] },
    { path: 'daily-checklist/:reportId'            , component: DCComponent, canActivate: [AuthGuard] },
    { path: 'fire-incident/:reportId'              , component: FIComponent, canActivate: [AuthGuard] },
    { path: 'incident-report/:reportId'            , component: IRComponent, canActivate: [AuthGuard] },
    { path: 'job-appraisal/:reportId'              , component: JAComponent, canActivate: [AuthGuard] },
    { path: 'learning-report/:reportId'            , component: ELComponent, canActivate: [AuthGuard] },
    { path: 'lost-and-found/:reportId'             , component: LAFComponent, canActivate: [AuthGuard] },
    { path: 'officer-feedback/:reportId'           , component: OFComponent, canActivate: [AuthGuard] },
    { path: 'on-job-training/:reportId'            , component: OJTComponent, canActivate: [AuthGuard] },
    { path: 'operation-visit/:reportId'            , component: OVComponent, canActivate: [AuthGuard] },
    { path: 'performance-evaluation/:reportId'     , component: PEComponent, canActivate: [AuthGuard] },
    { path: 'refresher-training/:reportId'         , component: RTComponent, canActivate: [AuthGuard] },
    { path: 'shift-supervisor-checklist/:reportId' , component: SSCComponent, canActivate: [AuthGuard] },
    { path: 'site-visit/:reportId'                 , component: SVComponent, canActivate: [AuthGuard] },
    { path: 'view-learning/:reportId'              , component: ViewLearningComponent, canActivate: [AuthGuard] },
    { path: 'view-training/:reportId'              , component: ViewTrainingComponent, canActivate: [AuthGuard] },

    // notification action urls
    { path: 'after-action-review/:noteId/:reportId'        , component: AARComponent, canActivate: [AuthGuard] },
    { path: 'daily-checklist/:noteId/:reportId'            , component: DCComponent, canActivate: [AuthGuard] },
    { path: 'fire-incident/:noteId/:reportId'              , component: FIComponent, canActivate: [AuthGuard] },
    { path: 'incident-report/:noteId/:reportId'            , component: IRComponent, canActivate: [AuthGuard] },
    { path: 'job-appraisal/:noteId/:reportId'              , component: JAComponent, canActivate: [AuthGuard] },
    { path: 'learning-report/:noteId/:reportId'            , component: ELComponent, canActivate: [AuthGuard] },
    { path: 'lost-and-found/:noteId/:reportId'             , component: LAFComponent, canActivate: [AuthGuard] },
    { path: 'officer-feedback/:noteId/:reportId'           , component: OFComponent, canActivate: [AuthGuard] },
    { path: 'on-job-training/:noteId/:reportId'            , component: OJTComponent, canActivate: [AuthGuard] },
    { path: 'operation-visit/:noteId/:reportId'            , component: OVComponent, canActivate: [AuthGuard] },
    { path: 'performance-evaluation/:noteId/:reportId'     , component: PEComponent, canActivate: [AuthGuard] },
    { path: 'refresher-training/:noteId/:reportId'         , component: RTComponent, canActivate: [AuthGuard] },
    { path: 'shift-supervisor-checklist/:noteId/:reportId' , component: SSCComponent, canActivate: [AuthGuard] },
    { path: 'site-visit/:noteId/:reportId'                 , component: SVComponent, canActivate: [AuthGuard] },
    { path: 'view-learning/:noteId/:reportId'              , component: ViewLearningComponent, canActivate: [AuthGuard] },
    { path: 'view-training/:noteId/:reportId'              , component: ViewTrainingComponent, canActivate: [AuthGuard] },

    // client action urls
    { path: 'client-satisfaction/:reportId'                , component: ClientSatisfactoryComponent },

    // Organization section urls
    { path: 'achievements'                                 , component: AchievementsComponent },
    { path: 'appreciation-letters'                         , component: AppreciationLettersComponent },
    { path: 'grading-status'                               , component: GradingStatusComponent },
    { path: 'organization-chart'                           , component: OrganizationChartComponent },
    { path: 'overview'                                     , component: OverviewComponent },

    // default redirect to employee dashboard
    { path: ''                                             , redirectTo: 'dashboard-employee', pathMatch: 'full' },

    // otherwise redirect to status/404
    { path: '**'                                           , redirectTo: 'status/404' }
];

export const routing = RouterModule.forRoot(appRoutes);
