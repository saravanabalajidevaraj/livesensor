import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { ClientSatisfaction, SatisfactionCriteria } from '../../_models';

@Component({
  selector: 'app-client-satisfaction',
  templateUrl: './client-satisfaction.component.html'
})
export class ClientSatisfactionComponent extends BaseReportComponent<ClientSatisfaction> {

    ngOnInit() {
        this.url = '/clientSatisfaction';
        super.ngOnInit();
    }
}
