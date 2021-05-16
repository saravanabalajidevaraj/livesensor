import { Component } from '@angular/core';
import * as jsPDF from 'jspdf'

import { SearchComponent } from '../../base-report/search/search.component';
import { OccurrenceBook } from '../../../_models';

@Component({
    selector: 'app-ob-search',
    templateUrl: './search.component.html'
})
export class OBSearchComponent extends SearchComponent<OccurrenceBook> {

    fetchReports(from: string, to: string, payload: any) {
        const fromDate: Date = new Date(from);

        const toDate: Date = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        if (!this.validate(fromDate, toDate, payload)) return;

        payload.fromDate = fromDate.toISOString();
        payload.toDate = toDate.toISOString();

        this.reports = [];
        this.showProgress();
        this.reportService.getReports<OccurrenceBook>(this.url + '/list', payload).subscribe(data => {
            this.hideProgress();
            this.reports = data;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    protected parseReport(report, index) {
        return {
            'S/No': index + 1,
            'Site': this.siteName(report.siteId),
            'User': this.userName(report.userId),
            'Date': this.pipe.transform(report.dateTime, 'dd/MM/yyyy'),
            'Time': this.pipe.transform(report.dateTime, 'HH:mm'),
            'Subject': report.subject,
            'Occurrence': report.occurrence
        };
    }

    exportAsExcel() {
        return this.exportAsExcelOld();
    }

    exportAsPdf() {
        return this.exportAsPdfOld();
    }

    protected fileName() {
        return 'occurrence-book';
    }
}
