import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { Training } from '../_models';

class SubmitResponse {
    success: boolean;
    message: string;
    description: string;
}

class FetchResponse {
    data: Training;
}

@Injectable()
export class TrainingService {
    constructor(private http: HttpClient) { }

    public addTraining(payload: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/training/add`, payload);
    }

    public updateTraining(payload: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/training/update`, payload);
    }

    public getTraining(id: string) {
        return this.http.get<FetchResponse>(`${environment.apiUrl}/training/${id}`).pipe(map(response => response.data));
    }

    public completeTraining(payload: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/training/complete`, payload);
    }
}
