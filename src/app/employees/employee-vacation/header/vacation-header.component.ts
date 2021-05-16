import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { User } from '../../../_models';
import { AlertService, UserService, AuthenticationService } from '../../../_services';

@Component({
  selector: 'app-vacation-header',
  templateUrl: './vacation-header.component.html'
})
export class VacationHeaderComponent implements OnInit {
    @Output() selectUser = new EventEmitter<User>();

    public user: User = this.authService.getUser();
    public isSO: boolean = this.user.role === 'SO';
    public isOE: boolean = this.user.role === 'OE';
    public isAdmin: boolean = this.user.role === 'ADMIN' || this.user.role === 'HR';

    public users: Map<string, User> = new Map<string, User>();
    public userIds: Array<string> = [];

    constructor(protected authService: AuthenticationService,
                protected progress: NgxSpinnerService,
                protected userService: UserService,
                protected alertService: AlertService) { }

    ngOnInit() {
        this.userService.getAll().subscribe(data => {
            this.users = data;

            const usersSorted = Array.from(data).map(a => a[0]);
            usersSorted.sort((a, b) => {
                const userA = this.userName(a), userB = this.userName(b);
                return userA < userB ? -1 : userA > userB ? 1 : 0;
            });
            this.userIds = usersSorted;

            this.changeUser(this.user);
        }, data => this.failure(data));
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    userFor(userId: string) {
        return this.users.get(userId);
    }

    changeUser(user: User) {
        this.user = user;
        this.selectUser.emit(user);
    }

    userName(userId: string) {
        const user: User = this.userFor(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || userId;
    }
}
