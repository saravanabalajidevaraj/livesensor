import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { ClockingPoint, ClockingLog, ClockingReport, PlanTime } from '../_models';

class ClockingLogResponse {
    data: Array<ClockingLog>;
}

class SiteClockingResponse {
    data: SiteClockingDetails;
}

class SiteClockingDetails {
    clockingPoints: Array<ClockingPoint>;
    planTime: Array<PlanTime>;
}

@Injectable()
export class ClockingService {
    constructor(private http: HttpClient) { }

    public getReports(payload: any) {
        return this.http.post<ClockingLogResponse>(`${environment.apiUrl}/clocking/report`, payload)
            .pipe(map(response => {
                const groupedLogs = response.data.reduce((acc, item) => {
                    const date = item.dateCreated.slice(0, 10);
                    if (!acc.has(date)) acc.set(date, new Map<string, Array<ClockingLog>>());

                    const dateMap = acc.get(date);
                    if (!dateMap.has(item.planTime)) dateMap.set(item.planTime, []);

                    dateMap.get(item.planTime).push(item);

                    return acc;
                }, new Map<string, Map<string, Array<ClockingLog>>>());

                return Array.from(groupedLogs).map(a => Array.from(a[1]).map(b => b[1]))
                    .map(a => a.map(b => {
                        const report = new ClockingReport();
                        report.siteId = b[0].siteId;
                        report.planTime = b[0].planTime;

                        const date = new Date(b[0].dateCreated);
                        date.setHours(date.getHours() + 8);
                        report.date = date.toISOString().slice(0, 10);
                        
                        report.points = b.reduce((sum, item) => sum + item.clockingData.length, 0);
                        report.logs = b;

                        return report;
                    }))
                    .reduce((acc, a) => [...acc, ...a], []);
            }));
    }

    @Cacheable({
        maxAge: 60 * 60 * 1000 // 1 Hr
    })
    public getPointsBySite(id: string) {
        return this.http.get<SiteClockingResponse>(`${environment.apiUrl}/clockingPoints/${id}`)
            .pipe(map(response => response.data.clockingPoints.reduce((acc, point) => {
                acc.set(point._id, point);
                return acc;
            }, new Map<string, ClockingPoint>())));
    }
}
