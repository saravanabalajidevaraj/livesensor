import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { SiteVisit } from '../../_models';

@Component({
  selector: 'app-site-visit',
  templateUrl: './site-visit.component.html'
})
export class SVComponent extends BaseReportComponent<SiteVisit> {
    ngOnInit() {
        this.url = '/siteVisit';
        super.ngOnInit();
    }
}
