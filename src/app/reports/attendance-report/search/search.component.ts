import { Component, Output, EventEmitter } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';
import { WorkSheet } from 'xlsx';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import {
    AlertService, ReportService, SiteService, UserService, UtilService, AttendanceService,
    DeploymentService, DownloadService, EventService, HolidayService
} from '../../../_services';
import { AttendanceReport, Site, User, Deployment, Holiday } from '../../../_models';

@Component({
    selector: 'app-ar-search',
    templateUrl: './search.component.html'
})
export class ASearchComponent extends SearchComponent<AttendanceReport> {
    @Output() deps = new EventEmitter<Array<Deployment>>();
    @Output() holi = new EventEmitter<string>();

    public deployments: Array<Deployment>;
    public holiday: Holiday;
    public holidayName: string;

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected reportService: ReportService,
                protected downloadService: DownloadService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService,
                protected attendanceService: AttendanceService,
                protected deploymentService: DeploymentService,
                private eventService: EventService,
                protected holidayService: HolidayService) {
        super(alertService, progress, reportService, downloadService, siteService, userService, utilService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.checkHoliday(this.today);
        this.eventService.attendancePdf.subscribe(payload => {
            const fromDate = new Date(payload.date);

            const toDate = new Date(payload.date);
            toDate.setDate(toDate.getDate() + 1);
            toDate.setMilliseconds(toDate.getMilliseconds() - 1);
            const services = Array.from(this.sites).map(a => a[0]).map(siteId => ({
                siteId,
                fromDate: fromDate.toISOString(),
                toDate: toDate.toISOString()
            })).map(a => this.attendanceService.getReports(a));

            this.showProgress();
            Observable.forkJoin(services).subscribe(data => {
                this.hideProgress();
                this.deployments = [];
                this.reports = data.reduce((acc, a) => [...acc, ...a], []);
                this.holidayName = payload.holiday;
                this.exportAsPdf();
            });
        });
    }

    checkHoliday(value: string) {
        const date = new Date(value);
        const toString = date => this.utilService.dateStringIgnoreTimezone(date);

        this.holidayService.getHolidays({
            fromDate: toString(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)),
            toDate: toString(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59))
        }).subscribe(data => this.holiday = data[0], data => this.failure(data));
    }

    protected rightHeadingLabel() {
        return this.reports.length > 0 && this.isValidHoliday(this.reports[0]) ? this.holidayName : '';
    }

    private isValidHoliday(report: AttendanceReport) {
        return this.holiday && this.holiday.holidayDate.slice(0, 10) === report.dateCreated.slice(0, 10);
    }

    openReport(report: AttendanceReport, isEdit: boolean) {
        super.openReport(report, isEdit);
        this.deps.emit(this.deployments);
        this.holi.emit(this.holidayName);
    }

    protected parseReport(report: AttendanceReport, index: number) {
        return {
            'S/No': index + 1,
            'Site': this.siteName(report.siteId),
            'User': this.userName(report.userId),
            'Role': this.userRole(report.userId),
            'Duty': this.userDuty(report.siteId, report.userId),
            'Start Work': report.startTime && this.parseDateTime(report.startTime) || 'N/A',
            'Start Break': report.breakTime && this.parseDateTime(report.breakTime) || 'N/A',
            'Resume Work': report.resumeTime && this.parseDateTime(report.resumeTime) || 'N/A',
            'End Work': report.endTime && this.parseDateTime(report.endTime) || 'N/A'
        };
    }

    exportAsExcel() {
        return this.exportAsExcelOld();
    }

    exportAsPdf() {
        return this.exportAsPdfOld();
    }

    private parseDateTime(dateTime: string) {
        return this.pipe.transform(dateTime, 'dd/MM/yyyy') +
            ' ' + this.pipe.transform(dateTime, 'HH:mm')
    }

    protected fileName() {
        return 'attendance-report';
    }

    fetchReports(date: string, siteId: string) {
        const fromDate = new Date(date);

        const toDate = new Date(date);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        let sites = [siteId];
        if (!siteId) sites = Array.from(this.sites).map(a => a[0]);

        const payloads = sites.map(siteId => {
            const from = new Date(fromDate);
            const to = new Date(toDate);

            return {
                siteId,
                fromDate: from.toISOString(),
                toDate: to.toISOString()
            };
        });

        this.reports = [];
        this.showProgress();
        Observable.forkJoin([
            ...payloads.map(a => this.attendanceService.getReports(a)),
            ...sites.map(a => this.deploymentService.search({siteId: a, deploymentDate: fromDate.toISOString()}))
        ]).subscribe((data: Array<any>) => {
            this.hideProgress();
            this.reports = data.slice(0, sites.length).reduce((acc, a) => [...acc, ...a], []);
            this.delete = new Array(this.reports.length).fill(false);
            this.deployments = data.slice(sites.length, sites.length * 2).filter(a => a);
            this.holidayName = this.holiday && this.holiday.holidayName || '';
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    deleteReport(id: string) {
        this.showProgress();
        this.attendanceService.deleteReport(id).subscribe(data => {
            this.success(data.description);
            this.hideProgress();
            this.triggerFetch();
        }, data => {
            this.failure(data);
            this.hideProgress();
        });
    }

    userRole(userId: string) {
        const user: User = this.users.get(userId);
        return user && user.role || 'N/A';
    }

    userDuty(siteId: string, userId: string) {
        const deployment = this.deployments.find(a => a.siteId === siteId);
        if (!deployment) return 'N/A';
        const detail = [
            ...deployment.amShiftDeployment.officers,
            ...deployment.pmShiftDeployment.officers
        ].find(officer => officer.id === userId);
        return detail && detail.description || 'N/A';
    }
}
