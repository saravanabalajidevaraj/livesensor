import { Component, Input } from '@angular/core';

import { SearchComponent } from '../../base-report/search/search.component';
import { ELearning, ELearningResponse } from '../../../_models';

@Component({
    selector: 'app-elr-search',
    templateUrl: './search.component.html'
})
export class ELRSearchComponent extends SearchComponent<ELearningResponse> {
    @Input('eLearning') public eLearning: ELearning;

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
        this.reportService.getReports<ELearningResponse>(this.url + '/report', {
            eLearningId: this.eLearning._id,
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
}
