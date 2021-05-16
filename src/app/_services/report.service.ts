import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';

class FetchArrayResponse<E> {
    data: Array<E>;
}

class FetchSingleResponse<E> {
    data: E;
}

class UpdateResponse {
    success: boolean;
    time: string;
    message: string;
    description: string;
}

@Injectable()
export class ReportService {
    constructor(private http: HttpClient) { }

    public getReports<E>(url: string, payload: any) {
        return this.http.post<FetchArrayResponse<E>>(environment.apiUrl + url, payload)
            .pipe(map(response => response.data));
    }

    public getReport<E>(url: string) {
        return this.http.get<FetchSingleResponse<E>>(environment.apiUrl + url)
            .pipe(map(response => response.data));
    }

    public updateReport(url: string, payload: any) {
        return this.http.post<UpdateResponse>(environment.apiUrl + url, payload);
    }

    public deleteReport(url: string, id: string) {
        return this.http.delete<UpdateResponse>(`${environment.apiUrl}${url}/${id}`);
    }
}
