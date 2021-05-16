import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';

import { AlertService, UserService, NotificationService, ReportService, ELearningService } from '../../_services';
import { User, ELearning, ELearningResponse } from '../../_models';

@Component({
    selector: 'app-result-learning',
    templateUrl: 'result-learning.component.html'
})
export class ResultLearningComponent implements OnInit {
    public users: Map<string, User> = new Map<string, User>();

    public noteId: string;
    public eLearning: ELearning;
    public item: ELearningResponse;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private userService: UserService,
                private alertService: AlertService,
                private progress: NgxSpinnerService,
                private notificationService: NotificationService,
                private eLearningService: ELearningService,
                private reportService: ReportService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => this.users = data, data => this.failure(data));

        this.route.params.subscribe(paramMap => {
            const { eLearningId, noteId, reportId } = paramMap;
            if (reportId) {
                this.showProgress();
                Observable.forkJoin([
                    this.eLearningService.getLearning(eLearningId),
                    this.reportService.getReport<ELearningResponse>('/eLearningResponse/' + reportId)
                ]).subscribe(data => {
                    this.hideProgress();
                    this.eLearning = data[0];
                    this.item = data[1];
                    if (noteId) {
                        this.noteId = noteId
                    }
                }, data => {
                    this.failure(data);
                    this.hideProgress();
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

    approve() {
        this.showProgress();
        this.notificationService.approve(this.noteId).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.router.navigate(['/notifications']);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
