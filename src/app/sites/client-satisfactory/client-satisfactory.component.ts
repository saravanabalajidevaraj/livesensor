import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ClientSatisfaction } from '../../_models';
import { AlertService, SiteService, ClientSatisfactoryService } from '../../_services';

class Criteria {
    item: string;
    selection: string;
    note: string;
}

@Component({
    selector: 'app-client-satisfactory',
    templateUrl: './client-satisfactory.component.html'
})
export class ClientSatisfactoryComponent implements OnInit {
    public loading: boolean = true;
    public isValid: boolean = true;
    public submitted: boolean = true;

    public metadata: any;
    public reportId: string;
    public items: Array<Criteria>;
    public choices: Array<string> = ['Excellent', 'Good', 'Average'];
    public comments: Array<string> = [''];

    constructor(private route: ActivatedRoute,
                private siteService: SiteService,
                private alertService: AlertService,
                private progress: NgxSpinnerService,
                private clientSatisfactoryService: ClientSatisfactoryService) { }

    public ngOnInit() {
        this.items = [
            'Able to Carry out Instructions',
            'Work Completion (Patrolling, Static Duty, Response, Reception)',
            'Observance of Standard Operating Procedures / Health and Safety Standards at Workplace',
            'Attendance, Turnout and Bearing (Grooming)',
            'Office support',
            'Incident Handling'
        ].map(item => {
            const criteria = new Criteria();
            criteria.item = item;
            criteria.selection = this.choices[0];
            criteria.note = '';

            return criteria;
        });

        this.route.params.subscribe(paramMap => {
            const { reportId } = paramMap;
            if (reportId) {
                this.showProgress();
                this.clientSatisfactoryService.getReport(reportId).subscribe(data => {
                    this.hideProgress();
                    this.reportId = reportId;
                    this.metadata = data[1];

                    const report = data[0];

                    this.isValid = !!report;
                    this.submitted = report && report.dateUpdated || false;
                    this.loading = false;
                }, data => {
                    this.hideProgress();
                    this.failure(data);
                    this.loading = true;
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

    submit() {
        this.items.forEach(a => a.note = a.note.trim());

        this.showProgress();
        this.clientSatisfactoryService.submitReport({
            _id: this.reportId,
            itemData: this.items,
            comments: this.comments.map(a => a.trim()).filter(a => a)
        }).subscribe(data => {
            this.hideProgress();
            this.success(data.description);
            this.submitted = true;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
