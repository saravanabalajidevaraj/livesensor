import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { OfficerFeedback } from '../../_models';

@Component({
  selector: 'app-officer-feedback',
  templateUrl: './officer-feedback.component.html'
})
export class OFComponent extends BaseReportComponent<OfficerFeedback> {
    ngOnInit() {
        this.url = '/officerFeedback';
        super.ngOnInit();
    }
}
