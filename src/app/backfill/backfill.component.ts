import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { Site } from '../_models';
import { AlertService, BackfillService, SiteService } from '../_services';

@Component({
    selector: 'app.backfill',
    templateUrl: './backfill.component.html'
})
export class BackfillComponent implements OnInit {
    public types: Array<string> = ['Attendance', 'Clocking', 'Occurrence'];

    public sites: Map<string, Site> = new Map<string, Site>();

    public site: string = '';
    public importType: string = '';
    public doc: Blob;

    public typeError: string = '';
    public fileError: string = '';

    constructor(private alertService: AlertService,
                private progress: NgxSpinnerService,
                private siteService: SiteService,
                private backfillService: BackfillService) { }

    ngOnInit() {
        this.siteService.getNames().subscribe(data => this.sites = data, data => this.failure(data));
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

    private validate() {
        const FIELD_REQUIRED = 'Value for the field is required';
        this.typeError = '';
        this.fileError = '';
        let isValid = true;

        if (this.importType === '') {
            this.typeError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.doc) {
            this.fileError = FIELD_REQUIRED;
            isValid = false;
        }

        return isValid;
    }

    submit() {
        if (!this.validate()) return;

        const formData = new FormData();
        if (this.site) formData.append('siteId', this.site);
        formData.append('importType', this.importType);
        formData.append('importFile', this.doc);
        formData.append('timeZone', String(new Date().getTimezoneOffset()));

        this.showProgress();
        this.backfillService.importData(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
