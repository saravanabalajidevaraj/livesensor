import { Component, OnInit, AfterViewInit } from '@angular/core';

import { AuthenticationService, UserService, AlertService } from '../_services';
import { User, Designation } from '../_models';

import { BlankonApp } from '../../assets/admin/js/apps.js';
import { BlankonDemo } from '../../assets/admin/js/demo.js';
import { BlankonFormLayout } from '../../assets/admin/js/pages/blankon.form.layout.js';
import { BlankonFormWizard } from '../../assets/admin/js/pages/blankon.form.wizard.js';

@Component({
    selector: 'app-sidebar',
    templateUrl: './aside.component.html'
})
export class AsideComponent implements OnInit, AfterViewInit {
    public user: User = this.authService.getUser();
    public designation: string;

    public isAdmin: boolean = this.user.role === 'ADMIN' || this.user.role === 'HR';
    public isOE: boolean = this.user.role === 'OE';
    public isSO: boolean = this.user.role === 'SO';

    constructor(private authService: AuthenticationService,
                private userService: UserService,
                private alertService: AlertService) { }

    ngOnInit() {
        this.userService.designations().subscribe(data => {
            this.designation = data.find(item => item.code === this.user.role).description;
        }, data => this.alertService.error(data));
    }

    ngAfterViewInit() {
        BlankonApp.init();
        BlankonDemo.init();
        BlankonFormLayout.init();
        BlankonFormWizard.init();
    }
}
