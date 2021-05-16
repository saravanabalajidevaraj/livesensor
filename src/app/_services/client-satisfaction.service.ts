import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { ClientSatisfaction } from '../_models';

class FetchResponse {
    data: ClientSatisfaction;
    metadata: any;
}

class UpdateResponse {
    success: boolean;
    time: string;
    message: string;
    description: string;
}

@Injectable()
export class ClientSatisfactoryService {
    constructor(private http: HttpClient) { }

    public getReport(reportId: string) {
        return this.http.get<FetchResponse>(`${environment.apiUrl}/clientSatisfaction/${reportId}`)
            .pipe(map(response => [response.data, response.metadata]));
    }

    public submitReport(payload: any) {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/clientSatisfaction/submit', payload);
    }

    public uploadReport(payload: any) {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/clientSatisfaction/update', payload);
    }
}
