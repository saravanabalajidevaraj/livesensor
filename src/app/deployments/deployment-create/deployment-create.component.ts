import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';

import { Site, User, Deployment, OfficerDetail, GradeToJDMapping } from '../../_models';
import { AlertService, DeploymentService, SiteService, UserService, DownloadService, UtilService, MappingService } from '../../_services';

@Component({
    selector: 'app-deployment-create',
    templateUrl: './deployment-create.component.html',
    styleUrls: ['./deployment-create.component.css']
})
export class DeploymentCreateComponent implements OnInit {
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);
    public sites: Array<Site> = [];
    public users: Map<string, User> = new Map<string, User>();
    public mappings: Map<string, string> = new Map<string, string>();

    private minOptions: Array<string> = ['00', '30'];
    public timeOptions: Array<string> = new Array(24).fill(0).map((a, b) => this.minOptions.map(c => `${b}:${c}`)).reduce((a, b) => [...a, ...b], []);

    public date: string = this.today;
    public site: Site;
    public soUsers: Array<string> = [];

    public amBreakStart: string = '';
    public amBreakEnd: string = '';
    public amRemarks: string = ''
    public amDeployments: Array<OfficerDetail> = [];
    public amPending: boolean = false;

    public pmBreakStart: string = '';
    public pmBreakEnd: string = '';
    public pmRemarks: string = ''
    public pmDeployments: Array<{id: string, description: string, onStandBy: boolean}> = [];
    public pmPending: boolean = false;

    public deploymentError: string = '';
    public siteError: string = '';
    public amBreakError: string = '';
    public pmBreakError: string = '';

    public submitEnabled: boolean = true;

    constructor(protected progress: NgxSpinnerService,
                protected deploymentService: DeploymentService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected userService: UserService,
                protected downloadService: DownloadService,
                protected utilService: UtilService,
                protected mappingService: MappingService) { }

    ngOnInit() {
        this.siteService.getAll().subscribe(data => this.sites = data, data => this.failure(data));
        this.mappingService.getGradeToJDMappings().subscribe(data => {
            this.mappings = data.reduce((acc, a) => {
                acc.set(a.grade, a.jobDescription);
                return acc;
            }, new Map<string, string>());
        }, data => this.failure(data));

        Observable.forkJoin([
            this.userService.getActive(),
            this.deploymentService.deployedUsers(this.today)
        ]).subscribe(data => {
            this.users = data[0];
            const usersSorted = Array.from(data[0]).map(a => a[1]).filter(a => a.role === 'SO' && !data[1].has(a._id)).map(a => a._id);
            usersSorted.sort((a, b) => {
                const userA = this.userName(a), userB = this.userName(b);
                return userA < userB ? -1 : userA > userB ? 1 : 0;
            });
            this.soUsers = usersSorted;
        }, data => this.failure(data));
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

    changeDate(value: string) {
        this.submitEnabled = true;
        this.date = value;
        this.deploymentService.deployedUsers(value).subscribe(data => {
            const usersSorted = Array.from(this.users).map(a => a[1]).filter(a => a.role === 'SO' && !data.has(a._id)).map(a => a._id);
            usersSorted.sort((a, b) => {
                const userA = this.userName(a), userB = this.userName(b);
                return userA < userB ? -1 : userA > userB ? 1 : 0;
            });
            this.soUsers = usersSorted;
        }, data => this.failure(data));
        this.checkDeployment();
    }

    changeSite(siteId: string) {
        this.submitEnabled = true;
        this.site = this.sites.find(a => a._id === siteId);
        this.checkDeployment();
    }

    private checkDeployment() {
        if (!this.site) return;

        this.deploymentError = '';
        this.deploymentService.search({
            siteId: this.site._id,
            deploymentDate: new Date(this.date).toISOString()
        }).subscribe(data => {
            if (data) this.deploymentError = 'Deployment for the site already exists for the date';
        }, data => this.failure(data));
    }

    userName(userId: string) {
        const user = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    displayName(userId: string) {
        const user = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName}` || 'N/A';
    }

    userGrade(userId: string) {
        const user = this.users.get(userId);
        return user && user.deploymentGrade || 'N/A';
    }

    userTraining(userId: string) {
        const user = this.users.get(userId);
        return user && user.ojtStatus || 'N/A';
    }

    userSelect(array: Array<OfficerDetail>, userId: string) {
        this.amPending = false;
        this.pmPending = false;
        this.soUsers = this.soUsers.filter(a => a !== userId);

        const user = this.users.get(userId);
        array.push({id: userId, description: this.mappings.get(user.deploymentGrade) || '', onStandBy: false});
    }

    userRemove(array: Array<OfficerDetail>, index: number) {
        const user = this.users.get(array.splice(index, 1)[0].id);
        const usersSorted = [...this.soUsers, user._id];
        usersSorted.sort((a, b) => {
            const userA = this.userName(a), userB = this.userName(b);
            return userA < userB ? -1 : userA > userB ? 1 : 0;
        });
        this.soUsers = usersSorted;
    }

    downloadDoc() {
        this.showProgress();
        this.downloadService.download(this.site.jobScopeDocId).subscribe(data => {
            this.hideProgress();
            this.utilService.download(data);
        }, data => this.failure(data));
    }

    validate() {
        const FIELD_REQUIRED = 'Value for the field is required';
        const START_NOT_EQUAL_END = 'Start time should not match end time';

        this.siteError = '';
        this.amBreakError = '';
        this.pmBreakError = '';
        let isValid = true;

        if (this.deploymentError) isValid = false;

        if (!this.site) {
            this.siteError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.amBreakStart || !this.amBreakEnd) {
            this.amBreakError = FIELD_REQUIRED;
            isValid = false;
        } else if (this.amBreakStart === this.amBreakEnd) {
            this.amBreakError = START_NOT_EQUAL_END;
            isValid = false;
        }

        if (!this.pmBreakStart || !this.pmBreakEnd) {
            this.pmBreakError = FIELD_REQUIRED;
            isValid = false;
        } else if (this.pmBreakStart === this.pmBreakEnd) {
            this.pmBreakError = START_NOT_EQUAL_END;
            isValid = false;
        }

        return isValid;
    }

    submit() {
        if (!this.validate()) return;

        const deployment = {
            siteId: this.site._id,
            deploymentDate: new Date(this.date).toISOString(),
            amShiftDeployment: {
                breakTime: {from: this.amBreakStart, to: this.amBreakEnd},
                remarks: this.amRemarks,
                officers: this.amDeployments
            },
            pmShiftDeployment: {
                breakTime: {from: this.pmBreakStart, to: this.pmBreakEnd},
                remarks: this.pmRemarks,
                officers: this.pmDeployments
            }
        };

        this.showProgress();
        this.deploymentService.register(deployment).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.submitEnabled = false;
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        })
    }
}
