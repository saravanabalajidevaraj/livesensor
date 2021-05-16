import { Component } from '@angular/core';

import { SearchComponent } from '../../base-report/search/search.component';
import { Training } from '../../../_models';

@Component({
    selector: 'app-tr-search',
    templateUrl: './search.component.html'
})
export class TRSearchComponent extends SearchComponent<Training> {

    validate(from: Date, to: Date) {
        this.timeError = '';

        if (from > to) {
            this.timeError = 'From date should either be equals or before To date';
            return false;
        }

        return true;
    }

    fetchReports(from: string, to: string) {
        const fromDate = new Date(from);

        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);

        if (!this.validate(fromDate, toDate)) return;

        this.reports = [];
        this.showProgress();
        this.reportService.getReports<Training>(this.url + '/report', {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString()
        }).subscribe(data => {
            this.hideProgress();
            this.reports = data;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    protected excelReports() {
        return this.reports.map((report, index) => ({
            'S/No': index + 1,
            'Created By': this.userName(report.userId),
            'Title': report.title,
            'Details': report.details,
            'Date': this.pipe.transform(report.fromDate, 'dd/MM/yyyy')
        }));
    }

    protected fileName() {
        return 'training';
    }
}
