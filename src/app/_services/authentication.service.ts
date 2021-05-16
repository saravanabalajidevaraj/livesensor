import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { User } from '../_models';

class ServiceResponse {
    success: boolean;
    data: User;
    message: string;
    description: string;
}

class TokenPayload {
    userName: string;
    password: string;
}

@Injectable()
export class AuthenticationService {
    private user: User;

    constructor(private http: HttpClient, private router: Router) {}

    private saveUser(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
        this.user = user;
    }

    public getToken(): string {
        const user = this.getUser();
        return user && user.token;
    }

    public isLoggedIn() {
        return !!localStorage.getItem('user');
    }

    public getUser(): User {
        if (!this.user) {
            this.user = JSON.parse(localStorage.getItem('user'));
        }
        return this.user;
    }

    public login(payload: TokenPayload): Observable<ServiceResponse> {
        return this.http.post<ServiceResponse>(`${environment.apiUrl}/authenticateUser`, payload)
            .pipe(map(response => {
                if (response.data) this.saveUser(response.data);
                return response;
            }));
    }

    public logout(): void {
        this.user = null;
        localStorage.removeItem('user');
        this.router.navigateByUrl('/login');
    }
  }
