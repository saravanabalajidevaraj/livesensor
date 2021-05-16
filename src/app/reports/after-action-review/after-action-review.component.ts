import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { AfterActionReview } from '../../_models';

@Component({
  selector: 'app-after-action-review',
  templateUrl: './after-action-review.component.html'
})
export class AARComponent extends BaseReportComponent<AfterActionReview> {
    ngOnInit() {
        this.url = '/actionReview';
        super.ngOnInit();
    }
}
