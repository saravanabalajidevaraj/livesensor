import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { Training } from '../../_models';
import { AlertService, TrainingService, NotificationService, UtilService } from '../../_services';

@Component({
    selector: 'app-view-training',
    templateUrl: './view-training.component.html'
})
export class ViewTrainingComponent implements OnInit {
    public noteId: string;
    public item: Training;

    public isApprove: boolean = false;

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected notificationService: NotificationService,
                protected trainingService: TrainingService,
                protected utilService: UtilService) { }

    ngOnInit() {
        this.route.params.subscribe(paramMap => {
            const { noteId, reportId } = paramMap;
            if (noteId && reportId) {
                this.showProgress();
                this.trainingService.getTraining(reportId).subscribe(data => {
                    this.hideProgress();
                    this.item = data;
                    this.noteId = noteId;
                    this.isApprove = true;
                }, data => {
                    this.hideProgress();
                    this.failure(data);
                    this.router.navigate(['/notifications']);
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

    back() {
    }

    approve() {
        this.showProgress();
        this.notificationService.approve(this.noteId).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.router.navigate(['notifications']);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
