import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { FireIncident } from '../../_models';

@Component({
  selector: 'app-fire-incident',
  templateUrl: './fire-incident.component.html'
})
export class FIComponent extends BaseReportComponent<FireIncident> {
    ngOnInit() {
        this.url = '/fireIncident';
        super.ngOnInit();
    }
}
