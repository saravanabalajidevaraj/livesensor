import { Component } from '@angular/core';

import { BaseReportComponent } from '../base-report/base-report.component';
import { ClockingReport, ClockingResult, ClockingPoint } from '../../_models';

@Component({
    selector: 'app-clocking',
    templateUrl: './clocking.component.html'
})
export class ClockingComponent extends BaseReportComponent<ClockingReport> {
    points: Map<string, ClockingPoint>;

    ngOnInit() {
        super.ngOnInit();
        this.url = '/clocking';
    }

    parseReport() {
        if (!this.report) return;
        return this.report.logs.map(a => a.clockingData).reduce((acc, a) => [...acc, ...a], [])
            .reduce((acc, a) => {
                if (!acc.has(a.qrId))
                    acc.set(a.qrId, a);
                return acc
            }, new Map<string, ClockingResult>());
    }

    updatePoints(points: Map<string, ClockingPoint>) {
        this.points = points;
    }
}
