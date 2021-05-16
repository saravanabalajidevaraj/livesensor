import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { Designation } from '../../_models';
import { AlertService, UserService, UtilService } from '../../_services';

@Component({
    selector: 'app-employee-create',
    templateUrl: './employee-create.component.html',
    styleUrls: ['./employee-create.component.css']
})
export class EmployeeCreateComponent implements OnInit {
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);
    private inProgress: boolean = false;

    public genders: Array<string> = ['Male', 'Female'];
    public maritalStatuses: Array<string> = ['Single', 'Married'];
    public nations: Array<string> = ['Malaysia', 'Singapore'];
    public designations: Array<Designation> = [];
    public roles: Array<string> = ['SO', 'OE', 'HR', 'ADMIN'];

    public firstName: string = '';
    public lastName: string = '';
    public gender: string = '';
    public dob: string = this.today;
    public phone: string = '';
    public address: string = '';
    public maritalStatus: string = '';
    public nationality: string = '';

    public staffId: string = '';
    public designation: string = '';
    public pwmGrade: string = '';
    public deploymentGrade: string = '';
    public joinDate: string = this.today;
    public confirmDate: string;
    public wpIssuedDate: string;
    public wpExpiryDate: string;
    public account: string = '';
    public courses: Array<string> = [''];

    public userName: string = '';
    public password: string = '';
    public role: string = '';
    public profileImage: Blob;
    public empContract: Blob;
    public uniformIssueStatus: string = '';
    public nok: string = '';
    public notificationAddDate: string = this.today;
    public notificationCancelDate: string = '';
    public resignationDate: string;
    public terminationDate: string;

    public firstNameError: string = '';
    public lastNameError: string = '';
    public dobError: string = '';
    public staffError: string = '';
    public designationError: string = '';
    public deploymentGradeError: string = '';
    public userNameError: string = '';
    public passwordError: string = '';
    public roleError: string = '';
    public confirmError: string = '';

    constructor(private progress: NgxSpinnerService,
                private utilService: UtilService,
                private userService: UserService,
                private alertService: AlertService) { }

    ngOnInit() {
        this.userService.designations().subscribe(data => this.designations = data, data => this.alertService.error(data));
        scroll(0, 0);
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    private reset() {
        this.userName = '';
        this.password = '';
        this.firstName = '';
        this.lastName = '';
        this.role = '';
        this.designation = '';
        this.staffId = '';
        this.phone = '';
        this.profileImage = undefined;
        this.address = '';
        this.dob = this.today;;
        this.joinDate = this.today;
        this.confirmDate = '';
        this.pwmGrade = '';
        this.deploymentGrade = '';
        this.courses = [];
        this.gender = '';
        this.wpIssuedDate = '';
        this.wpExpiryDate = '';
        this.notificationAddDate = '';
        this.notificationCancelDate = '';
        this.maritalStatus = '';
        this.account = '';
        this.nationality = '';
        this.nok = '';
        this.resignationDate = '';
        this.terminationDate = '';
        this.empContract = undefined;
        this.uniformIssueStatus = '';
    }

    validate() {
        const FIELD_REQUIRED = 'This field is required';
        this.firstNameError = '';
        this.lastNameError = '';
        this.dobError = '';
        this.staffError = '';
        this.userNameError = '';
        this.passwordError = '';
        this.roleError = '';
        this.designationError = '';
        this.deploymentGradeError = '';
        this.confirmError = '';

        let isValid = true;

        if (!this.firstName.trim()) {
            this.firstNameError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.lastName.trim()) {
            this.lastNameError = FIELD_REQUIRED;
            isValid = false;
        }

        const date = new Date();
        date.setFullYear(date.getFullYear() - 21);
        if (new Date(this.dob) > date) {
            this.dobError = 'Minimum age for the employee must be 21 years';
            isValid = false;
        }

        if (!this.userName.trim()) {
            this.userNameError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.staffId.trim()) {
            this.staffError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.designation.trim()) {
            this.designationError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.password.trim()) {
            this.passwordError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.role.trim()) {
            this.roleError = FIELD_REQUIRED;
            isValid = false;
        }

        if (this.role === 'SO' && !this.deploymentGrade.trim()) {
            this.deploymentGradeError = FIELD_REQUIRED + ' for users with SO role';
            isValid = false;
        }

        if (!this.confirmDate.trim()) {
            this.confirmError = FIELD_REQUIRED;
            isValid = false;
        }

        return isValid;
    }

    submit() {
        if (this.inProgress || !this.validate()) return;
        this.inProgress = true;

        const formData = new FormData();
        formData.append('userName', this.userName);
        formData.append('password', this.password);
        formData.append('firstName', this.firstName);
        formData.append('lastName', this.lastName);
        formData.append('role', this.role);
        formData.append('designation', this.designation);
        formData.append('staffId', this.staffId);
        if (this.phone) formData.append('phone', this.phone);
        if (this.profileImage) formData.append('profileImage', this.profileImage);
        if (this.address) formData.append('address', this.address);
        formData.append('dateOfBirth', this.dob);
        formData.append('dateOfJoining', this.joinDate);
        if (this.confirmDate) formData.append('dateOfConfirmation', this.confirmDate);
        if (this.pwmGrade) formData.append('pwmGrade', this.pwmGrade);
        if (this.deploymentGrade) formData.append('deploymentGrade', this.deploymentGrade);
        formData.append('courses', JSON.stringify(this.courses.map(a => a.trim()).filter(a => a)));
        if (this.gender) formData.append('gender', this.gender);
        if (this.wpIssuedDate) formData.append('wpIssuedDate', this.wpIssuedDate);
        if (this.wpExpiryDate) formData.append('wpExpiryDate', this.wpExpiryDate);
        if (this.notificationAddDate) formData.append('notificationAddDate', this.notificationAddDate);
        if (this.notificationCancelDate) formData.append('notificationCancelDate', this.notificationCancelDate);
        if (this.maritalStatus) formData.append('maritalStatus', this.maritalStatus);
        if (this.account) formData.append('bankAccount', this.account);
        if (this.nationality) formData.append('nationality', this.nationality);
        if (this.nok) formData.append('nok', this.nok);
        if (this.resignationDate) formData.append('resignationDate', this.resignationDate);
        if (this.terminationDate) formData.append('terminationDate', this.terminationDate);
        if (this.empContract) formData.append('contractOfEmployment', this.empContract);
        if (this.uniformIssueStatus) formData.append('uniformIssueStatus', this.uniformIssueStatus);

        this.showProgress();
        this.userService.register(formData).subscribe(data => {
            this.hideProgress();
            this.inProgress = false;
            if (data.success) {
                this.alertService.success(data.description);
                this.reset();
            } else {
                this.alertService.error(data.description);
            }
        }, data => {
            this.hideProgress();
            this.inProgress = false;
            this.alertService.error(data);
        });
    }
}
