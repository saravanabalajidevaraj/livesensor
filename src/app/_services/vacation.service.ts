import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { VacationDetail, VacationReport, VacationType } from '../_models';

class UpdateResponse {
    success: boolean;
    time: string;
    message: string;
    description: string;
}

class FetchVacation {
    data: VacationReport;
}

class FetchDetail {
    data: Array<VacationDetail>;
}

class FetchTypes {
    data: Array<VacationType>;
}

@Injectable()
export class VacationService {
    constructor(private http: HttpClient) { }

    public getVacationDetails(vacationId: string) {
        return this.http.get<FetchVacation>(`${environment.apiUrl}/vacation/${vacationId}`)
            .pipe(map(response => response.data));
    }

    public userVacationBalance(userId: string) {
        return this.http.get<FetchDetail>(`${environment.apiUrl}/vacationBalance/${userId}`)
            .pipe(map(response => response.data[0]));
    }

    public vacationBalance() {
        return this.http.get<FetchDetail>(environment.apiUrl + '/vacationBalances')
            .pipe(map(response => {
                return response.data.reduce((map, item) => {
                    map.set(item.employeeId, item);
                    return map;
                }, new Map<string, VacationDetail>());
            }));
    }

    public updateVacationBalance(payload: any) {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/vacationBalance/update', payload);
    }

    public resetVacationBalance() {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/vacationBalance/reset', {
            employeeSelection: 'All', employeeIds: []
        });
    }

    public vacationTypes() {
        return this.http.get<FetchTypes>(environment.apiUrl + '/leaveType/lookup').pipe(map(response => response.data));
    }

    public addVacation(payload: any) {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/vacation', payload);
    }

    public addOvertime(payload: any) {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/overTime', payload);
    }

    public updateRequest(payload: any) {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/vacation/approveReject', payload);
    }
}
