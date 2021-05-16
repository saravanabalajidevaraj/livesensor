import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { IncidentReport } from '../../_models';

@Component({
  selector: 'app-incident-report',
  templateUrl: './incident-report.component.html'
})
export class IRComponent extends BaseReportComponent<IncidentReport> {
    ngOnInit() {
        this.url = '/incidentReport';
        super.ngOnInit();
    }
}
