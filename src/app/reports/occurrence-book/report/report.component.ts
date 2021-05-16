import { Component } from '@angular/core';

import { ReportComponent } from '../../base-report/report/report.component';
import { OccurrenceBook } from '../../../_models';

@Component({
    selector: 'app-ob-report',
    templateUrl: './report.component.html'
})
export class OBReportComponent extends ReportComponent<OccurrenceBook> {

    updateDate(value: string) {
        this.report.dateTime = this.considerTimezone(`${value}T${this.clientTime(this.report.dateTime)}:00.000Z`);
    }

    updateTime(value: string) {
        this.report.dateTime = this.considerTimezone(`${this.clientDate(this.report.dateTime)}T${value}:00.000Z`);
    }

    submit() {
        const {
            _id, siteId, dateTime, subject, occurrence
        } = this.report;

        this.updateReport({
            _id, siteId, dateTime, subject, occurrence
        });
    }
}
