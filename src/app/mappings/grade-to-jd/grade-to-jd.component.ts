import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { AlertService, MappingService } from '../../_services';
import { GradeToJDMapping } from '../../_models';

@Component({
    selector: 'app-grade-to-jd',
    templateUrl: './grade-to-jd.component.html'
})
export class GradeToJdComponent implements OnInit {
    public mappings: Array<GradeToJDMapping> = [];
    public errors: Array<string> = [];

    constructor(private mappingService: MappingService,
                private alertService: AlertService,
                protected progress: NgxSpinnerService) { }

    ngOnInit() {
        this.showProgress();
        this.mappingService.getGradeToJDMappings().subscribe(data => {
            this.hideProgress();
            this.mappings = data;
            this.errors = new Array(data.length).fill('');
        }, data => {
            this.hideProgress();
            this.failure(data);
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

    addMapping() {
        this.mappings.push({_id: undefined, grade: '', jobDescription: ''});
        this.errors.push('');
    }

    removeMapping(index: number) {
        this.mappings.splice(index, 1);
        this.errors.splice(index, 1);
    }

    validate() {
        const FIELD_REQUIRED = 'Entry is required in both fields';
        let isValid = true;

        this.errors.fill('');
        this.mappings.forEach((a, i) => {
            if (!a.grade || !a.jobDescription) {
                this.errors[i] = FIELD_REQUIRED;
                isValid = false;
            }
        });

        return isValid;
    }

    submit() {
        if (!this.validate()) return;

        this.showProgress();
        this.mappingService.registerGradeToJDMappings(this.mappings).subscribe(data => {
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
