import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { OccurrenceBook } from '../../_models';

@Component({
    selector: 'app-occurrence-book',
    templateUrl: './occurrence-book.component.html'
})
export class OBComponent extends BaseReportComponent<OccurrenceBook> {
    ngOnInit() {
        this.url = '/occurrenceBook';
        super.ngOnInit();
    }
}
