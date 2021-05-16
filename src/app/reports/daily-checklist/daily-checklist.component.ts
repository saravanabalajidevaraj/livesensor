import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { DailyChecklist } from '../../_models';

@Component({
  selector: 'app-daily-checklist',
  templateUrl: './daily-checklist.component.html'
})
export class DCComponent extends BaseReportComponent<DailyChecklist> {
    ngOnInit() {
        this.url = '/daily-checklist';
        super.ngOnInit();
    }
}
