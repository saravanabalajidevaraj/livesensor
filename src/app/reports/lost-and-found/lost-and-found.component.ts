import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { LostAndFound } from '../../_models';

@Component({
  selector: 'app-lost-and-found',
  templateUrl: './lost-and-found.component.html'
})
export class LAFComponent extends BaseReportComponent<LostAndFound> {
    ngOnInit() {
        this.url = '/items/found';
        super.ngOnInit();
    }
}
