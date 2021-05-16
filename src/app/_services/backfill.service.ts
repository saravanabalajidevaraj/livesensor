import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment.prod';

class SubmitResponse {
    success: boolean;
    description: string;
    message: string;
}

@Injectable()
export class BackfillService {
    constructor(private http: HttpClient) { }

    importData(payload: FormData) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/import/data`, payload);
    }
}
