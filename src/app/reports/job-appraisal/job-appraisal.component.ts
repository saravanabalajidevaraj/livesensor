import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { JobAppraisal } from '../../_models';

@Component({
  selector: 'app-job-appraisal',
  templateUrl: './job-appraisal.component.html'
})
export class JAComponent extends BaseReportComponent<JobAppraisal> {
    ngOnInit() {
        this.url = '/jobAppraisal';
        super.ngOnInit();
    }
}
