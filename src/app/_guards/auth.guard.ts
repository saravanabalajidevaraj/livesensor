import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService, TransferService } from '../_services';

const COMMON_URLS = [
    'error', 'view-learning', 'view-training', 'status', 'dashboard-employee', 'dashboard-site',
    'vacation', 'notifications', 'learning-result'
];

const EMPLOYEE_URLS = ['add-employee', 'attendance-report', 'approve-vacation', 'overtime'];
const SITE_URLS = ['add-site', 'dashboard-site', 'occurrence-book', 'clocking-report', 'client-satisfaction', 'backfill'];
const DEPLOYMENT_URLS = ['add-deployment', 'dashboard-deployment'];

const REPORT_URLS = [
    'after-action-review', 'daily-checklist', 'fire-incident', 'incident-report',
    'job-appraisal', 'lost-and-found', 'officer-feedback', 'on-job-training',
    'operation-visit', 'performance-evaluation', 'refresher-training',
    'shift-supervisor-checklist', 'site-visit', 'client-satisfactory'
];

const HR_BAY_URLS = [
    'complete-training', 'create-learning', 'create-training', 'learning-report',
    'learning-response', 'management', 'mapping-gradeToJD', 'overtime-report',
    'salary', 'salary-report', 'vacation-balance', 'vacation-report', 'training-report',
    'holidays'
];

const PRIMARY_OUTLET_PERMISSIONS: any = {
    SO: new Set(COMMON_URLS),
    OE: new Set([
        ...COMMON_URLS,
        ...EMPLOYEE_URLS, ...SITE_URLS, ...DEPLOYMENT_URLS, ...REPORT_URLS
    ]),
    HR: new Set([
        ...COMMON_URLS,
        ...EMPLOYEE_URLS, ...SITE_URLS, ...DEPLOYMENT_URLS, ...REPORT_URLS,
        ...HR_BAY_URLS
    ]),
    ADMIN: new Set([
        ...COMMON_URLS,
        ...EMPLOYEE_URLS, ...SITE_URLS, ...DEPLOYMENT_URLS, ...REPORT_URLS,
        ...HR_BAY_URLS
    ]),
};

const VACATION_COMMON_URLS = ['summary', 'vacation', 'overtime'];
const VACATION_SPECIAL_URLS = ['add-vacation', 'add-overtime'];

const VACATION_FULL_ACCESS = [...VACATION_COMMON_URLS, ...VACATION_SPECIAL_URLS];

const VACATION_OUTLET_PERMISSIONS: any = {
    SO: new Set(VACATION_COMMON_URLS),
    OE: new Set(VACATION_FULL_ACCESS),
    HR: new Set(VACATION_FULL_ACCESS),
    ADMIN: new Set(VACATION_FULL_ACCESS),
};

@Injectable()
export class AuthGuard implements CanActivate {
    private authChain: Array<Function> = [
        (role: string, route: ActivatedRouteSnapshot) => {
            const permissions = PRIMARY_OUTLET_PERMISSIONS[role];
            return permissions.has(route.url[0].path)
        },
        (role: string, route: ActivatedRouteSnapshot) => {
            if (route.url[0].path !== 'vacation') return true;

            const permissions = VACATION_OUTLET_PERMISSIONS[role];
            return permissions.has(route.children[0].url[0].path)
        }
    ];

    constructor(private router: Router,
                private transferService: TransferService,
                private authService: AuthenticationService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = this.authService.getUser();
        if (!user) {
            // not logged in so return false
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }

        try {
            if (!this.authChain.every(a => a(user.role, route))) {
                this.transferService.send('You do not have access to this resource. Please contact your admin.');
                this.router.navigate(['/error'], { queryParams: { returnUrl: state.url }});
                return false;
            }
        } catch (error) {
            this.router.navigate(['/status/404']);
            return false;
        }
        return true;
    }
}
