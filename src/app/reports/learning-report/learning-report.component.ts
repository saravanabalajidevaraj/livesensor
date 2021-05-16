import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { ELearning } from '../../_models';

@Component({
    selector: 'app-learning-report',
    templateUrl: './learning-report.component.html'
})
export class ELComponent extends BaseReportComponent<ELearning> {
    ngOnInit() {
        this.url = '/eLearning';
        super.ngOnInit();
    }
}
