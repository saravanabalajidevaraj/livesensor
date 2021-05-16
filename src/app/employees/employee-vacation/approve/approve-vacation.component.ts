import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { User, VacationReport, VacationType } from '../../../_models';
import {
    AlertService, UserService, AuthenticationService, VacationService, ImageService,
    DownloadService, UtilService, NotificationService
} from '../../../_services';

@Component({
    selector: 'app-approve-vacation',
    templateUrl: './approve-vacation.component.html'
})
export class ApproveVacationComponent implements OnInit {
    public vacationTypes: Array<VacationType> = [];
    public user: User = this.authService.getUser();
    public images: Map<string, Object> = new Map<string, Object>();

    public hr: User;
    public users: Map<string, User> = new Map<string, User>();

    public noteId: string;
    public report: VacationReport;
    public isPending: boolean;

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected authService: AuthenticationService,
                protected userService: UserService,
                protected alertService: AlertService,
                protected vacationService: VacationService,
                protected imageService: ImageService,
                protected downloadService: DownloadService,
                protected utilService: UtilService,
                protected notificationSerice: NotificationService,
                protected progress: NgxSpinnerService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));
        this.userService.getHr().subscribe(data => this.hr = data[0], data => this.failure(data));
        this.vacationService.vacationTypes().subscribe(data => this.vacationTypes = data, data => this.failure(data));

        this.route.params.subscribe(paramMap => {
            const { noteId, reportId } = paramMap;
            if (reportId) {
                this.showProgress();
                this.vacationService.getVacationDetails(reportId).subscribe(data => {
                    this.hideProgress();
                    this.report = data;
                    this.isPending = data.status && data.status.toLowerCase() === 'pending' || true;
                    if (noteId) {
                        this.noteId = noteId
                    }
                }, data => {
                    this.hideProgress();
                    this.failure(data);
                });
            }
        });
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
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || '';
    }

    vacationType(vacationCode: string) {
        return this.vacationTypes.find(a => a.code === vacationCode).description;
    }

    imageFor(imageId: string) {
        return this.images.get(imageId) || 'assets/img/ic_cloud_download.png';
    }

    parseImage(imageId: string) {
        if (this.images.has(imageId)) return;

        this.images.set(imageId, 'assets/img/ic_progress_clock.png');
        this.imageService.imageById(imageId)
            .subscribe(data => this.images.set(imageId, data), data => {
                this.images.delete(imageId);
                this.failure(data);
            });
    }

    download() {
        this.downloadService.download(this.report.fileId)
            .subscribe(data => this.utilService.download(data), data => this.failure(data));
    }

    approve() {
        this.submit('APPROVED');
    }

    reject() {
        this.submit('REJECTED');
    }

    private submit(status: string) {
        const payload = {
            _id: this.report._id,
            status,
            comments: this.report.comments
        };

        this.showProgress();
        Observable.forkJoin([
            this.vacationService.updateRequest(payload),
            this.notificationSerice.approve(this.noteId)
        ]).subscribe(data => {
            this.hideProgress();
            if (data[0].success) {
                this.success(data[0].description);
                this.router.navigate(['notifications']);
            } else {
                this.failure(data[0].description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
