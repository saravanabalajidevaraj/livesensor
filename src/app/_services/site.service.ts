import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { Site } from '../_models';

class SiteResponse {
    data: Array<Site>;
}

class ServiceResponse {
    message: string;
    description: string;
    success: boolean;
}

const cacheBuster = new Subject<void>();

@Injectable()
export class SiteService {
    constructor(private http: HttpClient) { }

    @Cacheable({
        maxAge: 2 * 60 * 60 * 1000, // 2 hrs
        cacheBusterObserver: cacheBuster
    })
    public getNames() {
        return this.http.get<SiteResponse>(`${environment.apiUrl}/siteNames`)
            .pipe(map(response => {
                return response.data.reduce((acc, site) => {
                    acc.set(site._id, site);
                    return acc;
                }, new Map<string, Site>())
            }));
    }

    @Cacheable({
        maxAge: 2 * 60 * 60 * 1000, // 2 hrs
        cacheBusterObserver: cacheBuster
    })
    public getAll() {
        return this.http.get<SiteResponse>(`${environment.apiUrl}/sites`)
            .pipe(map(response => response.data));
    }

    public getById(id: string) {
        return this.getAll().pipe(map(arr => arr.find(site => site._id === id)));
    }

    @CacheBuster({cacheBusterNotifier: cacheBuster})
    public register(payload: any) {
        return this.http.post<ServiceResponse>(`${environment.apiUrl}/site/add`, payload);
    }

    @CacheBuster({cacheBusterNotifier: cacheBuster})
    public update(payload: FormData) {
        return this.http.post<ServiceResponse>(`${environment.apiUrl}/site/update`, payload);
    }

    @CacheBuster({cacheBusterNotifier: cacheBuster})
    public delete(id: string) {
        return this.http.delete<ServiceResponse>(`${environment.apiUrl}/site/delete/${id}`);
    }
}
