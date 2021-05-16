import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { AttendanceReport } from '../_models';

class AttendanceListResponse {
    data: Array<AttendanceReport>
}

class AttendanceResponse {
    data: AttendanceReport
}

class UpdateResponse {
    success: boolean;
    description: string;
    message: string;
}

@Injectable()
export class AttendanceService {
    constructor(private http: HttpClient) { }

    public getReports(payload: any) {
        return this.http.post<AttendanceListResponse>(`${environment.apiUrl}/attendanceReport`, payload)
            .pipe(map(response => response.data));
    }

    public getAttendance(payload: any) {
        return this.http.post<AttendanceListResponse>(`${environment.apiUrl}/attendanceHistory`, payload)
            .pipe(map(response => response.data));
    }

    public getReport(id: string) {
        return this.http.get<AttendanceResponse>(`${environment.apiUrl}/attendance/${id}`)
            .pipe(map(response => response.data));
    }

    public deleteReport(id: string) {
        return this.http.delete<UpdateResponse>(`${environment.apiUrl}/attendance/delete/${id}`);
    }

    public update(payload: any) {
        return this.http.post<UpdateResponse>(`${environment.apiUrl}/workLog/update`, payload);
    }
}
