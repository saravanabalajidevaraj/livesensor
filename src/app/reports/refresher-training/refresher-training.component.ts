import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { RefresherTraining } from '../../_models';

@Component({
  selector: 'app-refresher-training',
  templateUrl: './refresher-training.component.html'
})
export class RTComponent extends BaseReportComponent<RefresherTraining> {
    ngOnInit() {
        this.url = '/refresherTraining';
        super.ngOnInit();
    }
}
