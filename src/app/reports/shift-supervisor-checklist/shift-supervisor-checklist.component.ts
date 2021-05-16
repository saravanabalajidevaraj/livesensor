import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { ShiftSupervisorChecklist } from '../../_models';

@Component({
  selector: 'app-shift-supervisor-checklist',
  templateUrl: './shift-supervisor-checklist.component.html'
})
export class SSCComponent extends BaseReportComponent<ShiftSupervisorChecklist> {
    ngOnInit() {
        this.url = '/supervisorChecklist';
        super.ngOnInit();
    }
}
