import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService, AlertService } from '../_services';

@Component({templateUrl: 'login.component.html'})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    submitted: boolean = false;
    returnUrl: string;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private formBuilder: FormBuilder,
                private alertService: AlertService,
                private authenticationService: AuthenticationService) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            userName: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.authenticationService.logout();

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;
        if (this.loginForm.invalid) return;

        const tokenPayload = {
            userName: this.loginForm.value.userName,
            password: this.loginForm.value.password
        };
        this.authenticationService.login(tokenPayload).subscribe(response => {
            if (response.success) {
                this.router.navigate([this.returnUrl || 'dashboard-employee']);
            } else {
                this.alertService.error(response.description);
            }
        }, data => this.alertService.error(data.message));
    }
}
