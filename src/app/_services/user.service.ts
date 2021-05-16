import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { User, Designation } from '../_models';

class UserResponse {
    data: Array<User>;
}

class DesignationResponse {
    data: Array<Designation>;
}

class SubmitResponse {
    success: boolean;
    message: string;
    description: string;
}

const cacheBuster = new Subject<void>();

@Injectable()
export class UserService {
    constructor(private http: HttpClient) { }

    @Cacheable({maxAge: 20 * 60 * 1000, cacheBusterObserver: cacheBuster})
    public getAll() {
        return this.http.get<UserResponse>(`${environment.apiUrl}/users`)
            .pipe(map(response => {
                return response.data.reduce((acc, user) => {
                    acc.set(user._id, user);
                    return acc;
                }, new Map<string, User>());
            }));
    }
    public getActive() {
        return this.getAll().pipe(map(data => new Map<string, User>(Array.from(data).filter(([, {status}]) => status.toLowerCase() === 'active'))));
    }

    public getById(id: string) {
        return this.getAll().pipe(map(map => map.get(id)));
    }

    public getHr() {
        return this.http.get<UserResponse>(`${environment.apiUrl}/hrProfile`)
            .pipe(map(response => response.data));
    }

    @Cacheable({maxAge: 2 * 60 * 60 * 1000})
    public designations() {
        return this.http.get<DesignationResponse>(`${environment.apiUrl}/designation/lookup`)
            .pipe(map(response => response.data));
    }

    @CacheBuster({cacheBusterNotifier: cacheBuster})
    public register(user: any) {
        return this.http.post<SubmitResponse>(`${environment.apiUrl}/user/add`, user);
    }

    @CacheBuster({cacheBusterNotifier: cacheBuster})
    public update(user: any) {
        return this.http.post<SubmitResponse>(environment.apiUrl + '/user/update', user);
    }

    @CacheBuster({cacheBusterNotifier: cacheBuster})
    public delete(id: string) {
        return this.http.delete<SubmitResponse>(environment.apiUrl + '/user/delete/' + id);
    }
}
