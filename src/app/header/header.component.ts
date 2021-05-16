import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

import {
    NotificationService, ItemService, AuthenticationService, EventService, DownloadService,
    ImageService, AlertService, UserService
} from '../_services';
import { Notification, User } from '../_models';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    @ViewChild('imageSelect') input: ElementRef;

    public user: User = this.authService.getUser();
    public userImage: any = 'assets/img/ic_user_circle.png';
    public list: Array<Notification> = [];

    constructor(private router: Router,
                private progress: NgxSpinnerService,
                private itemService: ItemService,
                private eventService: EventService,
                private authService: AuthenticationService,
                private downloadService: DownloadService,
                private userService: UserService,
                private imageService: ImageService,
                private alertService: AlertService,
                private notificationService: NotificationService) { }

    ngOnInit() {
        this.refresh();
        let requestId = setTimeout(() => this.refresh(), 15 * 60 * 1000);
        this.eventService.headerRefresh.subscribe(value => {
            clearTimeout(requestId);
            this.refresh();
            requestId = setTimeout(() => this.refresh(), 15 * 60 * 1000);
        });

        this.userService.getById(this.user._id).subscribe(data => {
            this.user = data;
            if (data.fileId) this.downloadUserImage();
        }, data => this.alertService.error(data));
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    private downloadUserImage() {
        this.downloadService.download(this.user.fileId)
            .subscribe(data => this.userImage = this.imageService.parse(data), data => console.log(data));
    }

    refresh() {
        this.notificationService.getNotifications().subscribe(data => {
            this.list = [...data.learnings, ...data.notifications];
        });
    }

    image(type: string) {
        return `assets/img/${this.itemService.image(type)}.png`;
    }

    triggerImageSelect() {
        this.input.nativeElement.click();
    }

    uploadImage(image: Blob) {
        if (!image) return;

        const emp = this.user;

        const formData = new FormData();
        formData.append('_id', emp._id);
        formData.append('userName', emp.userName);
        formData.append('firstName', emp.firstName);
        formData.append('lastName', emp.lastName);
        formData.append('role', emp.role);
        formData.append('designation', emp.designation);
        formData.append('staffId', String(emp.staffId));
        if (emp.phone) formData.append('phone', emp.phone);
        formData.append('profileImage', image);
        if (emp.address) formData.append('address', emp.address);
        if (emp.dateOfBirth) formData.append('dateOfBirth', emp.dateOfBirth);
        if (emp.dateOfJoining) formData.append('dateOfJoining', emp.dateOfJoining);
        if (emp.dateOfConfirmation) formData.append('dateOfConfirmation', emp.dateOfConfirmation);
        if (emp.pwmGrade) formData.append('pwmGrade', emp.pwmGrade);
        if (emp.deploymentGrade) formData.append('deploymentGrade', emp.deploymentGrade);
        formData.append('courses', JSON.stringify(emp.courses.map(a => a.trim()).filter(a => a)));
        if (emp.gender) formData.append('gender', emp.gender);
        if (emp.wpIssuedDate) formData.append('wpIssuedDate', emp.wpIssuedDate);
        if (emp.wpExpiryDate) formData.append('wpExpiryDate', emp.wpExpiryDate);
        if (emp.notificationAddDate) formData.append('notificationAddDate', emp.notificationAddDate);
        if (emp.notificationCancelDate) formData.append('notificationCancelDate', emp.notificationCancelDate);
        if (emp.maritalStatus) formData.append('maritalStatus', emp.maritalStatus);
        if (emp.bankAccount) formData.append('bankAccount', emp.bankAccount);
        if (emp.nationality) formData.append('nationality', emp.nationality);
        if (emp.nok) formData.append('nok', emp.nok);
        if (emp.resignationDate) formData.append('resignationDate', emp.resignationDate);
        if (emp.terminationDate) formData.append('terminationdate', emp.terminationDate);
        if (emp.uniformIssueStatus) formData.append('uniformIssueStatus', emp.uniformIssueStatus);

        this.showProgress();
        this.userService.update(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.alertService.success(data.description);
                this.userImage = this.imageService.parse(image);
            } else {
                this.alertService.error(data.description);
            }
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });
    }

    notificiationSelect(notification: Notification) {
        this.router.navigate([this.itemService.urlEndpoint(notification)]);
    }
}
