import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                'source-system': 'WebApp',
                'channel': 'LssApp',
                'timeZone': String(new Date().getTimezoneOffset())
            }
        });

        if (this.authService.isLoggedIn()) {
            request = request.clone({
                setHeaders: {
                    'Authorization': `Bearer ${this.authService.getToken()}`
                }
            });
        }

        return next.handle(request);
    }
}
