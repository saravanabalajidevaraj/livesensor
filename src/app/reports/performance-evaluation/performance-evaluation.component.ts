import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { PerformanceEvaluation } from '../../_models';

@Component({
  selector: 'app-performance-evaluation',
  templateUrl: './performance-evaluation.component.html'
})
export class PEComponent extends BaseReportComponent<PerformanceEvaluation> {
    ngOnInit() {
        this.url = '/performanceEvaluation';
        super.ngOnInit();
    }
}
