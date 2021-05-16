import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import {
    ELearning, SubjectiveQuestion, ObjectiveQuestion, SubjectiveSolution, ObjectiveSolution, Selectable
} from '../../_models';
import { AlertService, ELearningService, NotificationService, DownloadService, UtilService } from '../../_services';

@Component({
  selector: 'app-view-learning',
  templateUrl: './view-learning.component.html'
})
export class ViewLearningComponent implements OnInit {
    public noteId: string;
    public item: ELearning;
    public solutions: Array<any> = [];

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected utilService: UtilService,
                protected eLearningService: ELearningService,
                protected downloadService: DownloadService) { }

    ngOnInit() {
        this.route.params.subscribe(paramMap => {
            const { noteId, reportId } = paramMap;
            if (noteId && reportId) {
                this.showProgress();
                this.eLearningService.getLearning(reportId).subscribe(data => {
                    this.hideProgress();
                    this.item = data;
                    this.solutions = data.learningData.questions.map(a => {
                        let solution;
                        if (a.type === 'subjective') {
                            solution = new SubjectiveSolution();
                        } else {
                            solution = new ObjectiveSolution();
                            solution.type = a.type;
                            solution.options = a.options.map(b => {
                                const selectable = new Selectable();
                                selectable.value = b;
                                return selectable;
                            });
                        }
                        solution.ques = a.ques;
                        return solution;
                    });
                    this.noteId = noteId;
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

    downloadDoc() {
        this.showProgress();
        this.downloadService.download(this.item.fileId).subscribe(data => {
            this.hideProgress();
            this.utilService.download(data);
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    updateRadioOption(i: number, j: number, isSelected: boolean) {
        this.solutions[i].options.forEach(a => a.isSelected = false);
        this.solutions[i].options[j].isSelected = isSelected;
    }

    submit() {
        this.showProgress();
        this.eLearningService.submitLearning({
            _id: this.item._id,
            notificationId: this.noteId,
            learningData: { solutions: this.solutions }
        }).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                setTimeout(() => {
                    this.alertService.warning('Logging you out');
                    this.router.navigate(['/login']);
                }, 1000);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
