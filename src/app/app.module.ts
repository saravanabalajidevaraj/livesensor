import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }    from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastyModule } from 'ng2-toasty';

import { AppComponent }  from './app.component';
import { routing } from './app.routing';

import { AuthGuard } from './_guards';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import {
    AlertService, AttendanceService, AuthenticationService, BackfillService,
    ClientSatisfactoryService, ClockingService, DeploymentService, DownloadService,
    ELearningService, EventService, FeedbackService, HolidayService, ImageService,
    ItemService, MappingService, NotificationService, ReportService, SalaryService,
    SiteService, TransferService, TrainingService, UserService, UtilService, VacationService,
} from './_services';
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
import { EmployeeCreateComponent } from './employees/employee-create/employee-create.component';
import { EmployeeDashboardComponent } from './employees/employee-dashboard/employee-dashboard.component';
import { EmployeeSalaryComponent } from './employees/employee-salary/employee-salary.component';
import { SalaryHeaderComponent } from './employees/employee-salary/header/salary-header.component';
import { SalaryCalculationComponent } from './employees/employee-salary/calculate/salary-calculation.component';
import { SalaryGenerationComponent } from './employees/employee-salary/generate/salary-generation.component';
import { SalaryPayslipComponent } from './employees/employee-salary/payslip/salary-payslip.component';
import { EmployeeVacationComponent } from './employees/employee-vacation/employee-vacation.component';
import { VacationHeaderComponent } from './employees/employee-vacation/header/vacation-header.component';
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
import { NotificationsComponent } from './notifications/notifications.component';
import { BaseReportComponent } from './reports/base-report/base-report.component';
import { SearchComponent } from './reports/base-report/search/search.component';
import { ReportComponent } from './reports/base-report/report/report.component';
import { ClockingComponent } from './reports/clocking/clocking.component';
import { CLSearchComponent } from './reports/clocking/search/search.component';
import { CLReportComponent } from './reports/clocking/report/report.component';
import { AARComponent } from './reports/after-action-review/after-action-review.component';
import { AARReportComponent } from './reports/after-action-review/report/report.component';
import { AARSearchComponent } from './reports/after-action-review/search/search.component';
import { DCComponent } from './reports/daily-checklist/daily-checklist.component';
import { DCReportComponent } from './reports/daily-checklist/report/report.component';
import { DCSearchComponent } from './reports/daily-checklist/search/search.component';
import { FIComponent } from './reports/fire-incident/fire-incident.component';
import { FIReportComponent } from './reports/fire-incident/report/report.component';
import { FISearchComponent } from './reports/fire-incident/search/search.component';
import { IRComponent } from './reports/incident-report/incident-report.component';
import { IRReportComponent } from './reports/incident-report/report/report.component';
import { IRSearchComponent } from './reports/incident-report/search/search.component';
import { JAComponent } from './reports/job-appraisal/job-appraisal.component';
import { JAReportComponent } from './reports/job-appraisal/report/report.component';
import { JASearchComponent } from './reports/job-appraisal/search/search.component';
import { LAFComponent } from './reports/lost-and-found/lost-and-found.component';
import { LAFReportComponent } from './reports/lost-and-found/report/report.component';
import { LAFSearchComponent } from './reports/lost-and-found/search/search.component';
import { OFComponent } from './reports/officer-feedback/officer-feedback.component';
import { OFReportComponent } from './reports/officer-feedback/report/report.component';
import { OFSearchComponent } from './reports/officer-feedback/search/search.component';
import { OJTComponent } from './reports/on-job-training/on-job-training.component';
import { OJTReportComponent } from './reports/on-job-training/report/report.component';
import { OJTSearchComponent } from './reports/on-job-training/search/search.component';
import { OVComponent } from './reports/operation-visit/operation-visit.component';
import { OVReportComponent } from './reports/operation-visit/report/report.component';
import { OVSearchComponent } from './reports/operation-visit/search/search.component';
import { PEComponent } from './reports/performance-evaluation/performance-evaluation.component';
import { PEReportComponent } from './reports/performance-evaluation/report/report.component';
import { PESearchComponent } from './reports/performance-evaluation/search/search.component';
import { RTComponent } from './reports/refresher-training/refresher-training.component';
import { RTReportComponent } from './reports/refresher-training/report/report.component';
import { RTSearchComponent } from './reports/refresher-training/search/search.component';
import { SSCComponent } from './reports/shift-supervisor-checklist/shift-supervisor-checklist.component';
import { SSCReportComponent } from './reports/shift-supervisor-checklist/report/report.component';
import { SSCSearchComponent } from './reports/shift-supervisor-checklist/search/search.component';
import { SVComponent } from './reports/site-visit/site-visit.component';
import { SVReportComponent } from './reports/site-visit/report/report.component';
import { SVSearchComponent } from './reports/site-visit/search/search.component';
import { OBComponent } from './reports/occurrence-book/occurrence-book.component';
import { OBReportComponent } from './reports/occurrence-book/report/report.component';
import { OBSearchComponent } from './reports/occurrence-book/search/search.component';
import { AReportComponent } from './reports/attendance-report/report/report.component';
import { ASearchComponent } from './reports/attendance-report/search/search.component';
import { ARComponent } from './reports/attendance-report/attendance-report.component';
import { VReportComponent } from './reports/vacation-report/report/report.component';
import { VSearchComponent } from './reports/vacation-report/search/search.component';
import { VRComponent } from './reports/vacation-report/vacation-report.component';
import { SRComponent } from './reports/salary-report/salary-report.component';
import { ELReportComponent } from './reports/learning-report/report/report.component';
import { ELSearchComponent } from './reports/learning-report/search/search.component';
import { ELComponent } from './reports/learning-report/learning-report.component';
import { OTSearchComponent } from './reports/overtime/search/search.component';
import { OTComponent } from './reports/overtime/overtime.component';
import { ELRReportComponent } from './reports/learning-response/report/report.component';
import { ELRSearchComponent } from './reports/learning-response/search/search.component';
import { ELRComponent } from './reports/learning-response/learning-response.component';
import { TRReportComponent } from './reports/training/report/report.component';
import { TRSearchComponent } from './reports/training/search/search.component';
import { TRComponent } from './reports/training/training-report.component';
import { CSReportComponent } from './reports/client-satisfaction/report/report.component';
import { CSSearchComponent } from './reports/client-satisfaction/search/search.component';
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

@NgModule({
    imports: [
        NgxSpinnerModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        TreeViewModule,
        PdfViewerModule,
        ToastyModule.forRoot(),
        routing
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        BackfillComponent,
        HeaderComponent,
        AsideComponent,
        ErrorComponent,
        ReadMeComponent,
        EmployeeCreateComponent,
        EmployeeDashboardComponent,
        EmployeeSalaryComponent,
        SalaryHeaderComponent,
        SalaryCalculationComponent,
        SalaryGenerationComponent,
        SalaryPayslipComponent,
        EmployeeVacationComponent,
        VacationHeaderComponent,
        VacationSummaryComponent,
        VacationRequestComponent,
        OvertimeRequestComponent,
        VacationBalanceComponent,
        ApproveVacationComponent,
        AddVacationComponent,
        AddOvertimeComponent,
        SiteCreateComponent,
        SiteDashboardComponent,
        DeploymentCreateComponent,
        DeploymentDashboardComponent,
        GradeToJdComponent,
        NotificationsComponent,
        BaseReportComponent,
        SearchComponent,
        ReportComponent,
        ClockingComponent,
        CLSearchComponent,
        CLReportComponent,
        AARComponent,
        AARReportComponent,
        AARSearchComponent,
        DCComponent,
        DCReportComponent,
        DCSearchComponent,
        FIComponent,
        FIReportComponent,
        FISearchComponent,
        IRComponent,
        IRReportComponent,
        IRSearchComponent,
        JAComponent,
        JAReportComponent,
        JASearchComponent,
        LAFComponent,
        LAFReportComponent,
        LAFSearchComponent,
        OFComponent,
        OFReportComponent,
        OFSearchComponent,
        OJTComponent,
        OJTReportComponent,
        OJTSearchComponent,
        OVComponent,
        OVReportComponent,
        OVSearchComponent,
        PEComponent,
        PEReportComponent,
        PESearchComponent,
        RTComponent,
        RTReportComponent,
        RTSearchComponent,
        SSCComponent,
        SSCReportComponent,
        SSCSearchComponent,
        SVComponent,
        SVReportComponent,
        SVSearchComponent,
        ELComponent,
        ELReportComponent,
        ELSearchComponent,
        ELRComponent,
        ELRReportComponent,
        ELRSearchComponent,
        OTComponent,
        OTSearchComponent,
        CSReportComponent,
        CSSearchComponent,
        ClientSatisfactionComponent,
        ClientSatisfactoryComponent,
        OBReportComponent,
        OBSearchComponent,
        OBComponent,
        AReportComponent,
        ASearchComponent,
        ARComponent,
        VReportComponent,
        VSearchComponent,
        VRComponent,
        SRComponent,
        TRReportComponent,
        TRSearchComponent,
        TRComponent,
        CreateLearningComponent,
        ResultLearningComponent,
        ViewLearningComponent,
        CreateTrainingComponent,
        ViewTrainingComponent,
        CompleteTrainingComponent,
        ManagementComponent,
        AchievementsComponent,
        AppreciationLettersComponent,
        GradingStatusComponent,
        OrganizationChartComponent,
        OverviewComponent,
        HolidaysComponent,
        OvertimeComponent,
    ],
    providers: [
        AuthGuard,

        // Application Services
        AlertService,
        AttendanceService,
        AuthenticationService,
        BackfillService,
        ClientSatisfactoryService,
        ClockingService,
        DeploymentService,
        DownloadService,
        ELearningService,
        EventService,
        FeedbackService,
        HolidayService,
        ImageService,
        ItemService,
        MappingService,
        NotificationService,
        SalaryService,
        SiteService,
        ReportService,
        TrainingService,
        TransferService,
        UserService,
        UtilService,
        VacationService,

        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
