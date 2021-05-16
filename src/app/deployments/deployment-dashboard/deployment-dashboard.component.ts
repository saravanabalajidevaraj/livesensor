import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { UserService, SiteService, UtilService, DeploymentService, AlertService, DownloadService } from '../../_services';
import { Site, User, Deployment } from '../../_models';

@Component({
    selector: 'app-deployment-dashboard',
    templateUrl: './deployment-dashboard.component.html',
    styleUrls: ['./deployment-dashboard.component.css']
})
export class DeploymentDashboardComponent implements OnInit {
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);
    private minOptions: Array<string> = ['00', '30'];
    public timeOptions: Array<string> = new Array(24).fill(0).map((a, b) => this.minOptions.map(c => `${b}:${c}`)).reduce((a, b) => [...a, ...b], []);
    public deleteConfirm: boolean = false;

    public sites: Array<Site> = [];
    public users: Map<string, User> = new Map<string, User>();
    public soUsers: Array<string> = [];

    public deployment: Deployment;
    public site: Site;

    public amPending: boolean = false;
    public pmPending: boolean = false;
    public isEdit: boolean = false;

    public deploymentMsg: string = '';

    public amBreakError: string = '';
    public pmBreakError: string = '';

    constructor(private progress: NgxSpinnerService,
                private userService: UserService,
                private siteService: SiteService,
                private utilService: UtilService,
                private alertService: AlertService,
                private downloadService: DownloadService,
                private deploymentService: DeploymentService) { }

    ngOnInit() {
        this.siteService.getAll().subscribe(data => this.sites = data, data => this.failure(data));
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));
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

    fetchDeployment(deploymentDate: string, siteId: string) {
        if (!siteId) return;

        this.isEdit = false;
        this.deployment = undefined;
        this.site = this.sites.find(a => a._id === siteId);
        this.deploymentMsg = 'Fetching deployment for date and site';

        this.deploymentService.deployedUsers(deploymentDate).subscribe(data => {
            const usersSorted = Array.from(this.users).map(a => a[1])
                .filter(a => a.status.toLowerCase() === 'active' && a.role === 'SO' && !data.has(a._id)).map(a => a._id);
            usersSorted.sort((a, b) => {
                const userA = this.userName(a), userB = this.userName(b);
                return userA < userB ? -1 : userA > userB ? 1 : 0;
            });
            this.soUsers = usersSorted;
        }, data => this.failure(data));

        this.showProgress();
        this.deploymentService.search({
            siteId,
            deploymentDate: new Date(deploymentDate).toISOString()
        }).subscribe(data => {
            this.hideProgress();
            this.deploymentMsg = '';
            if (!data)  {
                this.deploymentMsg = 'No deployment exists for date and site';
                return;
            }

            this.deployment = data;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
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

    userSelect(array, userId) {
        this.amPending = false;
        this.pmPending = false;
        this.soUsers = this.soUsers.filter(a => a !== userId);

        array.push({id: userId, description: '', onStandBy: false});
    }

    userRemove(array: Array<{id: string, description: string, onStandBy: boolean}>, index: number) {
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

    delete() {
        this.showProgress();
        this.deploymentService.delete(this.deployment._id).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
            } else {
                this.failure(data.description);
            }
            this.deployment = undefined;
            this.deploymentMsg = 'No deployment exists for date and site';
        }, data => {
            this.hideProgress();
            this.failure(data);
        })
    }

    validate() {
        const START_NOT_EQUAL_END = 'Start time should not match end time';

        this.amBreakError = '';
        this.pmBreakError = '';
        let isValid = true;

        const amBreakStart = this.deployment.amShiftDeployment.breakTime.from;
        const amBreakEnd = this.deployment.amShiftDeployment.breakTime.to;

        if (amBreakStart === amBreakEnd) {
            this.amBreakError = START_NOT_EQUAL_END;
            isValid = false;
        }

        const pmBreakStart = this.deployment.pmShiftDeployment.breakTime.from;
        const pmBreakEnd = this.deployment.pmShiftDeployment.breakTime.to;

        if (pmBreakStart === pmBreakEnd) {
            this.pmBreakError = START_NOT_EQUAL_END;
            isValid = false;
        }

        return isValid;
    }

    submit() {
        if (!this.validate()) return;

        const {
            _id, siteId, deploymentDate, amShiftDeployment, pmShiftDeployment
        } = this.deployment;

        this.showProgress();
        this.deploymentService.update({
            _id, siteId, deploymentDate, amShiftDeployment, pmShiftDeployment
        }).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        })
    }
}
