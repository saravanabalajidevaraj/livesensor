import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { OperationVisit } from '../../_models';

@Component({
    selector: 'app-operation-visit',
    templateUrl: './operation-visit.component.html'
})
export class OVComponent extends BaseReportComponent<OperationVisit> {
    ngOnInit() {
        this.url = '/operationVisit';
        super.ngOnInit();
    }
}
