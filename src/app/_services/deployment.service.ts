import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { Deployment, OfficerDetail } from '../_models';

class DeploymentResponse {
    data: Array<Deployment>;
}

class UserResponse {
    data: Array<OfficerDetail>;
}

class ServiceResponse {
    success: boolean;
    description: string;
    message: string;
}

@Injectable()
export class DeploymentService {
    constructor(private http: HttpClient) { }

    public search(payload: any) {
        return this.http.post<DeploymentResponse>(`${environment.apiUrl}/deployment/report`, payload)
            .pipe(map(response => response.data[0]));
    }

    public deployedUsers(date: string) {
        return this.http.post<UserResponse>(`${environment.apiUrl}/deployment/users`, {deploymentDate: date})
            .pipe(map(response => new Set(response.data.map(a => a.id))));
    }

    public register(payload: any) {
        return this.http.post<ServiceResponse>(`${environment.apiUrl}/deployment/add`, payload);
    }

    public update(deployment: Deployment) {
        return this.http.post<ServiceResponse>(`${environment.apiUrl}/deployment/update`, deployment);
    }

    public delete(id: string) {
        return this.http.delete<ServiceResponse>(`${environment.apiUrl}/deployment/delete/${id}`);
    }
}
