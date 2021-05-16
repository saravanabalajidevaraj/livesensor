import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';

import {
    User, Site, EquipmentDetail, StationaryDetail, PlanTime, OperationVisit, FireIncident,
    OccurrenceBook, AfterActionReview, ClockingDetails, Contract, Shift
} from '../../_models';
import {
    AlertService, SiteService, UserService, ClockingService, UtilService, DownloadService,
    ReportService, AuthenticationService
} from '../../_services';

@Component({
    selector: 'app-site-dashboard',
    templateUrl: './site-dashboard.component.html',
    styleUrls: ['./site-dashboard.component.css']
})
export class SiteDashboardComponent implements OnInit {
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);
    private minOptions: Array<string> = ['00', '30'];
    public planOptions: Array<string> = new Array(24).fill(0).map((a, b) => this.minOptions.map(c => `${b}:${c}`)).reduce((a, b) => [...a, ...b], []);
    public statusOptions: Array<string> = ['Working', 'Damaged', 'Replaced'];
    public shiftAMOptions: Array<string> = new Array(13).fill(0).map((a, b) => this.minOptions.map(c => `${b}:${c}`)).reduce((a, b) => [...a, ...b], []).slice(0, 12 * this.minOptions.length + 1);
    public shiftPMOptions: Array<string> = new Array(13).fill(0).map((a, b) => this.minOptions.map(c => `${(b + 12) % 24}:${c}`)).reduce((a, b) => [...a, ...b], []).slice(0, 12 * this.minOptions.length + 1);
    public deleteConfirm: boolean = false;

    public sites: Array<Site> = new Array<Site>();
    public users: Map<string, User> = new Map<string, User>();
    private user: User = this.authService.getUser();
    public isSO: boolean = this.user.role === 'SO';

    public oeVisits: Array<OperationVisit> = [];
    public occurrences: Array<OccurrenceBook> = [];
    public drills: Array<FireIncident> = [];
    public aars: Array<AfterActionReview> = [];

    public scopeDoc: Blob;

    public siteNameError: string = '';
    public planTimeErrors: Array<string> = [];

    public selectedSite: Site;
    public isEdit: boolean;

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected utilService: UtilService,
                protected reportService: ReportService,
                protected authService: AuthenticationService,
                protected downloadService: DownloadService) { }

    ngOnInit() {
        this.showProgress();
        Observable.forkJoin([this.siteService.getAll(), this.userService.getAll()]).subscribe(data => {
            this.hideProgress();
            this.sites = data[0];
            this.users = data[1];
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });
    }

    refresh() {
        this.sites = [];
        this.showProgress();
        this.siteService.getAll().subscribe(data => {
            this.hideProgress();
            this.sites = data;
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });

        scroll(0, 0);
    }

    equipmentDetail() {
        const detail = new EquipmentDetail();
        detail.name = '';
        detail.quantity = 0;
        detail.status = '';
        detail.remark = '';

        return detail;
    }

    stationaryDetail() {
        const detail = new StationaryDetail();
        detail.name = '';
        detail.quantity = 0;

        return detail;
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    success(message: string) {
        this.alertService.success(message);
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    userName(userId: string) {
        const user: User = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    addPlanTime() {
        const planTime = new PlanTime();
        planTime.from = '';
        planTime.to = '';

        this.selectedSite.clockingDetails.planTime.push(planTime);
        this.planTimeErrors.push('');
    }

    removePlanTime(index: number) {
        this.selectedSite.clockingDetails.planTime.splice(index, 1);
        this.planTimeErrors.splice(index, 1);
    }

    downloadDoc() {
        this.showProgress();
        this.downloadService.download(this.selectedSite.jobScopeDocId).subscribe(data => {
            this.hideProgress();
            this.utilService.download(data);
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });
    }

    notificationDate() {
        return this.selectedSite.contract.siteNotificationDate.slice(0, 10);
    }

    updateNotificationDate(value: string) {
        this.selectedSite.contract.siteNotificationDate = new Date(value).toISOString();
    }

    selectSite(siteId: string) {
        this.selectedSite = JSON.parse(JSON.stringify(this.sites.find(a => a._id === siteId)));

        this.selectedSite.jobScope = this.selectedSite.jobScope || [];
        this.selectedSite.shiftDetails = this.selectedSite.shiftDetails || [];
        this.selectedSite.shiftDetails[0] = this.selectedSite.shiftDetails[0] || new Shift();
        this.selectedSite.shiftDetails[1] = this.selectedSite.shiftDetails[1] || new Shift();
        this.selectedSite.equipmentDetails = this.selectedSite.equipmentDetails || [];
        this.selectedSite.stationaryDetails = this.selectedSite.stationaryDetails || [];
        this.selectedSite.clockingDetails = this.selectedSite.clockingDetails || new ClockingDetails();
        this.selectedSite.clockingDetails.planTime = this.selectedSite.clockingDetails.planTime || [];
        this.selectedSite.clockingDetails.noOfRounds = this.selectedSite.clockingDetails.planTime.length;
        this.selectedSite.contract = this.selectedSite.contract || new Contract();
        this.selectedSite.contract.siteNotificationDate = this.selectedSite.contract.siteNotificationDate || '';
        this.selectedSite.contract.managementContact = this.selectedSite.contract.managementContact || '';
        this.selectedSite.contract.fccContact = this.selectedSite.contract.fccContact || [];

        this.planTimeErrors = new Array(this.selectedSite.clockingDetails.planTime.length).fill('');
        this.isEdit = false;

        this.fetchOEVisits(this.today);
        this.fetchDrills(this.today);
        this.fetchOccurrences(this.today);
        this.fetchAARs(this.today);
    }

    fetchOEVisits(date: string) {
        this.oeVisits = [];
        const post = data => this.oeVisits = data;
        this.fetchReports<OperationVisit>(date, '/operationVisit/report', post);
    }

    fetchDrills(date: string) {
        this.drills = [];
        const post = data => this.drills = data;
        this.fetchReports<FireIncident>(date, '/fireIncident/report', post);
    }

    fetchOccurrences(date: string) {
        this.occurrences = [];
        const post = data => this.occurrences = data;
        this.fetchReports<OccurrenceBook>(date, '/occurrenceBook/list', post);
    }

    fetchAARs(date: string) {
        this.aars = [];
        const post = data => this.aars = data;
        this.fetchReports<AfterActionReview>(date, '/actionReview/report', post);
    }

    private fetchReports<E>(date: string, url: string, post: Function) {
        this.showProgress();
        this.reportService.getReports<E>(url, this.reportSearchPayload(date))
            .subscribe(data => {
                this.hideProgress();
                post(data);
            }, data => {
                this.hideProgress();
                this.failure(data);
            })
    }

    private reportSearchPayload(date: string) {
        const fromDate = new Date(date);

        const toDate: Date = new Date(date);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        return {
            siteId: this.selectedSite._id,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString()
        };
    }

    delete() {
        this.showProgress();
        this.siteService.delete(this.selectedSite._id).subscribe(data => {
            this.hideProgress();
            this.alertService.success(data.description);
            this.refresh();
            this.selectedSite = undefined;
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });
    }

    validate() {
        this.siteNameError = '';
        this.planTimeErrors.fill('');
        let isValid = true;

        if (!this.selectedSite.siteName.trim()) {
            this.siteNameError = 'This field is required';
            isValid = false;
        }

        this.selectedSite.clockingDetails.planTime.forEach((planTime, index) => {
            if (!planTime.from || !planTime.to) {
                this.planTimeErrors[index] = 'Empty values are not supported';
                isValid = false;
            } else if (planTime.from === planTime.to) {
                this.planTimeErrors[index] = 'Start value should not match end value';
                isValid = false;
            }
        });

        return isValid;
    }

    submit() {
        if (!this.validate()) return;

        const site = this.selectedSite;

        const formData = new FormData();
        formData.append('siteId', site._id);
        formData.append('siteName', site.siteName);
        formData.append('jobScope', JSON.stringify(site.jobScope.map(a => a.trim()).filter(a => a)));
        if (this.scopeDoc) formData.append('jobScopeDocument', this.scopeDoc);
        formData.append('shiftDetails', JSON.stringify(site.shiftDetails));
        formData.append('address', site.address);
        formData.append('clockingDetails', JSON.stringify({
            noOfRounds: site.clockingDetails.planTime.length,
            planTime: site.clockingDetails.planTime
        }));
        formData.append('equipmentDetails', JSON.stringify(site.equipmentDetails.filter(a => a.name && a.quantity)));
        formData.append('stationaryDetails', JSON.stringify(site.stationaryDetails.filter(a => a.name && a.quantity)));
        formData.append('contract', JSON.stringify({
            siteNotificationDate: new Date(site.contract.siteNotificationDate),
            managementContact: site.contract.managementContact,
            fccContact: site.contract.fccContact.map(a => a.trim()).filter(a => a)
        }));

        this.showProgress();
        this.siteService.update(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.alertService.success(data.description);
                this.refresh();
            } else {
                this.alertService.error(data.description);
            }
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        })
    }
}
