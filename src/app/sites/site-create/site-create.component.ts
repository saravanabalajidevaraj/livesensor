import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { EquipmentDetail, StationaryDetail, PlanTime, Shift } from '../../_models';
import { AlertService, SiteService, UtilService } from '../../_services';

@Component({
  selector: 'app-site-create',
  templateUrl: './site-create.component.html',
  styleUrls: ['./site-create.component.css']
})
export class SiteCreateComponent {
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);
    private minOptions: Array<string> = ['00', '30'];
    public planOptions: Array<string> = new Array(24).fill(0).map((a, b) => this.minOptions.map(c => `${b}:${c}`)).reduce((a, b) => [...a, ...b], []);
    public statusOptions: Array<string> = ['Working', 'Damaged', 'Replaced'];
    public shiftAMOptions: Array<string> = new Array(13).fill(0).map((a, b) => this.minOptions.map(c => `${b}:${c}`)).reduce((a, b) => [...a, ...b], []).slice(0, 12 * this.minOptions.length + 1);
    public shiftPMOptions: Array<string> = new Array(13).fill(0).map((a, b) => this.minOptions.map(c => `${(b + 12) % 24}:${c}`)).reduce((a, b) => [...a, ...b], []).slice(0, 12 * this.minOptions.length + 1);

    public siteName: string = '';
    public address: string = '';
    public scopes: Array<string> = [''];
    public scopeDoc: Blob;
    public shiftDetails: Array<Shift> = [new Shift(), new Shift()];
    public planTimes: Array<PlanTime> = [];

    public equipmentDetails: Array<EquipmentDetail> = [this.equipmentDetail()];
    public stationaryDetails: Array<StationaryDetail> = [this.stationaryDetail()];

    public notificationDate: string = '';
    public managementContact: string = '';
    public fccContacts: Array<string> = [''];

    public siteNameError: string = '';
    public planTimeErrors: Array<string> = [];

    constructor(private progress: NgxSpinnerService,
                private utilService: UtilService,
                private siteService: SiteService,
                private alertService: AlertService) { }

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

    addPlanTime() {
        const planTime = new PlanTime();
        planTime.from = '';
        planTime.to = '';

        this.planTimes.push(planTime);
        this.planTimeErrors.push('');
    }

    removePlanTime(index: number) {
        this.planTimes.splice(index, 1);
        this.planTimeErrors.splice(index, 1);
    }

    validate() {
        this.siteNameError = '';
        this.planTimeErrors.fill('');
        let isValid = true;

        if (!this.siteName.trim()) {
            this.siteNameError = 'This field is required';
            isValid = false;
        }

        this.planTimes.forEach((planTime, index) => {
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

        const formData = new FormData();
        formData.append('siteName', this.siteName);
        formData.append('jobScope', JSON.stringify(this.scopes.map(a => a.trim()).filter(a => a)));
        if (this.scopeDoc) formData.append('jobScopeDocument', this.scopeDoc);
        formData.append('shiftDetails', JSON.stringify(this.shiftDetails));
        formData.append('address', this.address);
        formData.append('clockingDetails', JSON.stringify({
            noOfRounds: this.planTimes.length,
            planTime: this.planTimes
        }));
        formData.append('equipmentDetails', JSON.stringify(this.equipmentDetails.filter(a => a.name && a.quantity)));
        formData.append('stationaryDetails', JSON.stringify(this.stationaryDetails.filter(a => a.name && a.quantity)));
        formData.append('contract', JSON.stringify({
            siteNotificationDate: new Date(this.notificationDate),
            managementContact: this.managementContact,
            fccContact: this.fccContacts.map(a => a.trim()).filter(a => a)
        }));

        this.showProgress();
        this.siteService.register(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.alertService.success(data.description);
            } else {
                this.alertService.error(data.description);
            }
        },
        data => {
              this.hideProgress();
              this.alertService.error(data);
        });
    }
}
