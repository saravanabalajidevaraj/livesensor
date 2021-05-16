import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { Notification } from '../../_models';

@Component({
    selector: 'app-ot',
    templateUrl: './overtime.component.html'
})
export class OTComponent extends BaseReportComponent<Notification> {
    ngOnInit() {
        this.url = '/user/overtime/notification';
        super.ngOnInit();
    }
}
