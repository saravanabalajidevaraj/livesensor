import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { ELearning } from '../_models';

class SubmitResponse {
    success: boolean;
    message: string;
    description: string;
}

class FetchResponse {
    data: ELearning;
}

@Injectable()
export class ELearningService {
    constructor(private http: HttpClient) { }

    public addLearning(payload: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/eLearning`, payload);
    }

    public updateLearning(payload: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/eLearning/update`, payload);
    }

    public getLearning(id: string) {
        return this.http.get<FetchResponse>(`${environment.apiUrl}/eLearning/${id}`)
            .pipe(map(response => response.data));
    }

    public submitLearning(payload: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/eLearning/submit`, payload);
    }

    public evaluateLearning(reportId: string, results: string, isFailed: boolean) {
        return this.http.post<SubmitResponse>(environment.apiUrl + '/eLearning/results', {_id: reportId, results, isFailed});
    }
}
