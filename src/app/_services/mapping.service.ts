import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { GradeToJDMapping } from '../_models';

class GradeToJDMappingResponse {
    data: Array<GradeToJDMapping>;
}

class UpdateResponse {
    success: boolean;
    description: string;
    message: string;
}

@Injectable()
export class MappingService {
    constructor(private http: HttpClient) { }

    getGradeToJDMappings() {
        return this.http.get<GradeToJDMappingResponse>(`${environment.apiUrl}/grade/lookup`)
            .pipe(map(response => response.data));
    }

    registerGradeToJDMappings(values: Array<GradeToJDMapping>) {
        return this.http.post<UpdateResponse>(`${environment.apiUrl}/grade/add`, {gradeData: values});
    }
}
