import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { AttendanceReport, Deployment } from '../../_models';

@Component({
    selector: 'app-after-action-review',
    templateUrl: './attendance-report.component.html'
})
export class ARComponent extends BaseReportComponent<AttendanceReport> {
    deployments: Array<Deployment> = [];
    holiday: string;

    updateDeps(deployments: Array<Deployment>) {
        this.deployments = deployments;
    }

    updateHoliday(holiday: string) {
        this.holiday = holiday;
    }
}
