import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { OnJobTraining } from '../../_models';

@Component({
  selector: 'app-on-job-training',
  templateUrl: './on-job-training.component.html'
})
export class OJTComponent extends BaseReportComponent<OnJobTraining> {
    ngOnInit() {
        this.url = '/jobTraining';
        super.ngOnInit();
    }
}
