import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { Feedback } from '../_models';

class SubmitResponse {
    success: boolean;
    message: string;
    description: string;
}

class FeedbackResponse {
    data: Feedback;
}

class ArrayResponse {
    data: Array<Feedback>;
}

@Injectable()
export class FeedbackService {
    constructor(private http: HttpClient) { }

    public submit(payload: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/feedback/save`, payload);
    }

    public getFeedback(id: string) {
        return this.http.get<FeedbackResponse>(`${environment.apiUrl}/feedback/${id}`)
            .pipe(map(response => response.data));
    }

    public getUserFeedbacks(userId: string) {
        return this.http.get<ArrayResponse>(`${environment.apiUrl}/user/feedback/${userId}`)
            .pipe(map(response => response.data));
    }
}
