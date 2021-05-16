import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { Training } from '../../_models';

@Component({
  selector: 'app-training-report',
  templateUrl: './training-report.component.html'
})
export class TRComponent extends BaseReportComponent<Training> {
    ngOnInit() {
        this.url = '/training';
        super.ngOnInit();
    }
}
