import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { VacationReport } from '../../_models';

@Component({
  selector: 'app-vacation',
  templateUrl: './vacation-report.component.html'
})
export class VRComponent extends BaseReportComponent<VacationReport> {

    ngOnInit() {
        this.url = '/vacation';
        super.ngOnInit();
    }
}
