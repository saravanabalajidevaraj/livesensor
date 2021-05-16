import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';

import { User, Salary } from '../../../_models';
import { AlertService, UserService, AuthenticationService, AttendanceService, UtilService, SalaryService } from '../../../_services';

@Component({
    selector: 'app-salary-calculation',
    templateUrl: './salary-calculation.component.html'
})
export class SalaryCalculationComponent implements OnInit {
    public user: User;
    public users: Map<string, User> = new Map<string, User>();

    public attendance: number = 0;
    public salary: Salary = this.emptySalary();
    public update: any;

    constructor(protected salaryService: SalaryService,
                protected attendanceService: AttendanceService,
                protected authService: AuthenticationService,
                protected userService: UserService,
                protected alertService: AlertService,
                protected utilService: UtilService,
                protected progress: NgxSpinnerService) { }

    ngOnInit() {
        this.userService.getActive().subscribe(data => this.users = data, data => this.failure(data));
        this.refresh();
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    success(message: string) {
        this.alertService.success(message);
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    refresh() {
        if (!this.user) return;

        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        from.setMonth(from.getMonth() - 1)

        const to = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        to.setMilliseconds(to.getMilliseconds() - 1);

        this.showProgress();
        Observable.forkJoin([
            this.salaryService.getSalary(this.user._id),
            this.attendanceService.getAttendance({employeeId: this.user._id})
        ]).subscribe(([salary, attendanceReports]) => {
            this.hideProgress();
            this.salary = salary ? this.fillDefault(salary) : this.emptySalary();
            this.update = salary ? () => {
                const {
                    _id, employeeId, basicSalary, overTime, grooming, attendance,
                    medicalReimbursement, others, advance, loan, ph, phDays,
                    restDaySalary, restDaysWorked, employeeCpf, employerCpf,
                    note, daysWorked
                } = this.salary;

                return this.salaryService.updateSalary(this.fillDefault({
                    _id, employeeId, basicSalary, overTime, grooming, attendance,
                    medicalReimbursement, others, advance, loan, ph, phDays,
                    restDaySalary, restDaysWorked, employeeCpf, employerCpf,
                    note, daysWorked
                }));
            } : () => {
                const {
                    employeeId, basicSalary, overTime, grooming, attendance,
                    medicalReimbursement, others, advance, loan, ph, phDays,
                    restDaySalary, restDaysWorked, employeeCpf, employerCpf,
                    note, daysWorked
                } = this.salary;

                return this.salaryService.addSalary(this.fillDefault({
                    employeeId, basicSalary, overTime, grooming, attendance,
                    medicalReimbursement, others, advance, loan, ph, phDays,
                    restDaySalary, restDaysWorked, employeeCpf, employerCpf,
                    note, daysWorked
                }));
            };

            this.salary.daysWorked = attendanceReports.length;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    private fillDefault(salary: any) {
        salary.basicSalary = salary.basicSalary || 0;
        salary.overTime = salary.overTime || 0;
        salary.grooming = salary.grooming || 0;
        salary.attendance = salary.attendance || 0;
        salary.medicalReimbursement = salary.medicalReimbursement || 0;
        salary.others = salary.others || 0;
        salary.advance = salary.advance || 0;
        salary.loan = salary.loan || 0;
        salary.ph = salary.ph || 0;
        salary.phDays = salary.phDays || 0;
        salary.restDaySalary = salary.restDaySalary || 0;
        salary.restDaysWorked = salary.restDaysWorked || 0;
        salary.employeeCpf = salary.employeeCpf || 0;
        salary.employerCpf = salary.employerCpf || 0;
        salary.note = (salary.note || '').trim();
        salary.daysWorked = salary.daysWorked || 0;

        return salary;
    }

    private emptySalary() {
        return {
            _id: undefined,
            employeeId: this.user && this.user._id,
            basicSalary: 0,
            overTime: 0,
            grooming: 0,
            attendance: 0,
            medicalReimbursement: 0,
            others: 0,
            advance: 0,
            loan: 0,
            ph: 0,
            phDays: 0,
            restDaySalary: 0,
            restDaysWorked: 0,
            employeeCpf: 0,
            employerCpf: 0,
            note: '',
            daysWorked: 0
        };
    }

    changeUser(user: User) {
        this.user = user;
        this.refresh();
    }

    userName(user: User) {
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    private calculateOvertime() {
        return Number((Number(this.salary.basicSalary) * 1.5 * 12 / (52 * 44)).toFixed(2));
    }

    updateBasic(value: number) {
        this.salary.basicSalary = value;
        this.salary.overTime = this.calculateOvertime();
    }

    submit() {
        if (!this.user || !this.salary) return;

        this.showProgress();
        this.update().subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.refresh();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
