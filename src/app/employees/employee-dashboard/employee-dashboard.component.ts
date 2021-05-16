import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';
import * as jsPDF from 'jspdf'

import { User, Site, VacationDetail, Designation, Salary, Feedback } from '../../_models';
import {
    AlertService, UserService, VacationService, DownloadService, UtilService, AuthenticationService, SalaryService,
    SiteService, FeedbackService
} from '../../_services';

class VacationSummary {
    type: string;
    assigned: number;
    used: number;
}

@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html'
})
export class EmployeeDashboardComponent implements OnInit {
    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);
    public genders: Array<string> = ['Male', 'Female'];
    public maritalStatuses: Array<string> = ['Single', 'Married'];
    public nations: Array<string> = ['Malaysia', 'Singapore'];
    public designations: Array<Designation> = [];
    public roles: Array<string> = ['SO', 'OE', 'HR', 'ADMIN'];
    public warnings: Array<string> = ['First Warning', 'Second Warning', 'Third Warning', 'Termination'];
    public feedbacks: Array<string> = ['Site Transfer', 'Unsatisfactory', 'Good', 'Others'];

    public user: User = this.authService.getUser();
    public isAdmin: boolean = this.user.role === 'ADMIN' || this.user.role === 'HR';
    public isOE: boolean = this.user.role === 'OE';
    public isSO: boolean = this.user.role === 'SO';

    public users: Map<string, User> = new Map<string, User>();
    public sites: Map<string, Site> = new Map<string, Site>();
    public userIds: Array<string> = [];
    public vacationTypes: Map<string, string> = new Map<string, string>();
    public selectedId: string;
    public selectedEmployee: User;
    public selectedMonth: number;
    public vacations: Array<VacationSummary>;
    public salaryDetails: Salary = new Salary();
    public months: Array<string> = [];
    public isEdit: boolean = false;

    public profileImage: Blob;
    public empContract: Blob;
    public password: string;

    public feedbackHistory: Array<Feedback> = []
    public isWarning: boolean;
    public warning: string;
    public feedback: string = '';
    public feedbackSite: string = '';
    public feedbackOthers: string = '';
    public confirmDate: string = '';
    public terminateDate: string = this.today;

    public firstNameError: string = '';
    public lastNameError: string = '';
    public dobError: string = '';
    public staffError: string = '';
    public deploymentGradeError: string = '';
    public confirmError: string = '';
    public userNameError: string = '';
    public feedbackConfirmError: string = '';
    public feedbackError: string = '';

    public deleteConfirm: boolean = false;

    constructor(private route: ActivatedRoute,
                private progress: NgxSpinnerService,
                private authService: AuthenticationService,
                private userService: UserService,
                private siteService: SiteService,
                private feedbackService: FeedbackService,
                private alertService: AlertService,
                private utilService: UtilService,
                private downloadService: DownloadService,
                private vacationService: VacationService,
                private salaryService: SalaryService) { }

    ngOnInit() {
        this.siteService.getNames().subscribe(data => this.sites = data, data => this.failure(data));

        let employeeId;
        this.userService.getActive().subscribe(data => {
            this.users = data;

            const usersSorted = Array.from(data).map(a => a[0]);
            usersSorted.sort((a, b) => {
                const userA = this.userName(a), userB = this.userName(b);
                return userA < userB ? -1 : userA > userB ? 1 : 0;
            });
            this.userIds = usersSorted;

            if (employeeId) this.selectEmployee(employeeId);
        }, data => this.failure(data));

        this.userService.designations().subscribe(data => this.designations = data, data => this.failure(data));

        this.vacationService.vacationTypes().subscribe(data => {
            this.vacationTypes = data.reduce((acc, a) => {
                acc.set(a.code, a.description);
                return acc;
            }, new Map<string, string>())
        }, data => this.failure(data));

        if (this.isSO) {
            if (this.users.size) {
                this.selectEmployee(this.user._id);
            } else {
                employeeId = this.user._id;
            }
        }

        if (this.isAdmin || this.isOE) {
            this.route.params.subscribe(paramMap => {
                const employee = paramMap.employeeId || this.user._id;
                if (this.users.size) {
                    this.selectEmployee(employee);
                } else {
                    employeeId = employee;
                }
            });
        }

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();

        let month = now.getMonth();
        let year = now.getFullYear();
        this.months = new Array(8).fill(0).map(a => {
            if (month === 0) {
                month += 12;
                year -= 1;
            }
            return `${monthNames[--month]} ${year}`;
        });

        scroll(0, 0);
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    userName(userId: string) {
        const user: User = this.users.get(userId);
        return user && `${user.firstName} ${user.lastName} - ${user.userName}` || 'N/A';
    }

    refresh() {
        this.users = new Map<string, User>();
        this.showProgress();
        this.userService.getActive().subscribe(data => {
            this.hideProgress();
            this.users = data;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });

        scroll(0, 0);
    }

    selectEmployee(userId: string) {
        this.selectedId = userId;
        this.selectedEmployee = JSON.parse(JSON.stringify(this.users.get(userId)));

        this.isWarning = false;
        this.feedback = '';
        this.feedbackSite = '';
        this.feedbackOthers = '';

        this.firstNameError = '';
        this.lastNameError = '';
        this.dobError = '';
        this.staffError = '';
        this.deploymentGradeError = '';
        this.userNameError = '';
        this.isEdit = false;

        this.vacations = [];
        this.showProgress();
        Observable.forkJoin([
            this.vacationService.userVacationBalance(userId),
            this.salaryService.getSalary(userId),
            this.feedbackService.getUserFeedbacks(userId)
        ]).subscribe(([vacationDetail, salaryDetails, feedbackHistory]) => {
            this.hideProgress();
            this.vacations = Object.keys(vacationDetail.vacationBalance).map(a => {
                const summary = new VacationSummary();
                summary.type = this.vacationTypes.get(a);
                summary.assigned = vacationDetail.vacationBalance[a].assignedBalance;
                summary.used = vacationDetail.vacationBalance[a].usedBalance;

                return summary;
            });

            this.salaryDetails = salaryDetails || new Salary();

            this.feedbackHistory = feedbackHistory;

            let warningCount = feedbackHistory.filter(a => a.isWarning).length;
            if (warningCount > 3) warningCount = 3;
            this.warning = this.warnings[warningCount];
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });
    }

    generate() {
        if (!this.selectedEmployee) return;

        const now = new Date();

        let month = now.getMonth();
        let year = now.getFullYear();
        if (month - this.selectedMonth <= 0) {
            month += 12;
            year -= 1;
        }

        const payslipDate = `${month - this.selectedMonth}-${year}`;

        this.showProgress();
        this.salaryService.fetchPayslip({
            employeeId: this.selectedEmployee._id,
            payslipDate: payslipDate
        }).subscribe(data => {
            this.hideProgress();
            if (!data) {
                this.failure('Payslip does not exist for the employee for the month selected');
            } else {
                this.downloadService.exportAsPdf(`payslip-${payslipDate}`, jspdf => this.salaryService.generatePayslip(jspdf, this.selectedEmployee, data));
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    download(fileId: string) {
        this.downloadService.download(fileId).subscribe(data => this.utilService.download(data), data => this.failure(data));
    }

    delete() {
        this.showProgress();
        this.userService.delete(this.selectedEmployee._id).subscribe(data => {
            this.hideProgress();
            this.alertService.success(data.description);
            this.refresh();
            this.selectedEmployee = undefined;
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    private printBox(jspdf: jsPDF, x1: number, y1: number, x2: number, y2: number) {
        jspdf.line(x1, y1, x2, y1);
        jspdf.line(x1, y1, x1, y2);
        jspdf.line(x2, y1, x2, y2);
        jspdf.line(x1, y2, x2, y2);
    }

    private printFront(jspdf: jsPDF) {

    }

    private printContents(jspdf: jsPDF) {
        jspdf.setFontType('bold');
        jspdf.text(20, 30, 'Table Of Contents');
        jspdf.setFontType('normal');

        let start = 40, pageNumber = 1;
        [
            {level: 0, label: 'Key Employment Terms', page: '3'},
            {level: 1, label: 'Section A (Details of Employment)', page: '3'},
            {level: 2, label: 'Details of Working Hours', page: '3'},
            {level: 1, label: 'Section B (Job Title, Main Duties and Responsibilities)', page: '5'},
            {level: 2, label: 'Patrolling and Gaurding', page: '5'},
            {level: 2, label: 'Egress and Control', page: '5'},
            {level: 2, label: 'Incident Response', page: '5'},
            {level: 2, label: 'Gaurding', page: '6'},
            {level: 2, label: 'Patrolling and Clocking Duties', page: '6'},
            {level: 1, label: 'Job Scope (General)', page: '6'},
            {level: 1, label: 'Concent to Use of Personal Data Collected', page: '8'},
            {level: 1, label: 'Section C (Salary) (As per part IV of Employment Act)', page: '9'},
            {level: 2, label: 'Salary Period', page: '9'},
            {level: 2, label: 'Date of Salary and Overtime Payment', page: '9'},
            {level: 2, label: 'Basic Salary', page: '9'},
            {level: 2, label: 'Overtime Pay', page: '9'},
            {level: 2, label: 'Overtime Rate of Pay (Calculation)', page: '9'},
            {level: 2, label: '3 Hour Overtime Pay (Based on 26/27 Days of Work Completed)', page: '9'},
            {level: 2, label: 'Work on Rest Day', page: '9'},
            {level: 2, label: 'Offer', page: '9'},
            {level: 1, label: 'Fixed Allowance per Salary Period (26 Days of Work)', page: '10'},
            {level: 2, label: 'Item', page: '10'},
            {level: 2, label: 'Grooming', page: '10'},
            {level: 2, label: 'Performance (Work Right Attitude)', page: '10'},
            {level: 2, label: 'Fixed Deductions per Salary Period (26 Days of Work)', page: '11'},
            {level: 2, label: 'Office / Study Loan', page: '11'},
            {level: 1, label: 'Other Salary Related Components', page: '11'},
            {level: 2, label: 'Medical Reimbursements', page: '11'},
            {level: 2, label: 'Advance Salary', page: '11'},
            {level: 1, label: 'Section D Employment Terms', page: '12'},
            {level: 2, label: 'Probationary Period', page: '12'},
            {level: 2, label: 'Warning Letters', page: '12'},
            {level: 1, label: 'Hospitalization', page: '12'},
            {level: 2, label: 'Period Allowed', page: '12'},
            {level: 1, label: 'Termination and Resignation', page: '12'},
            {level: 2, label: 'Resignation', page: '12'},
            {level: 2, label: 'Termination (Section 10(3) of the Employment Act)', page: '13'},
            {level: 1, label: 'Section F (Leaves and Medical Benefits)', page: '15'},
            {level: 2, label: 'Leave Entitlement', page: '15'},
            {level: 2, label: 'Other Types of Leaves', page: '15'},
            {level: 1, label: 'Section G (Training and Development)', page: '17'},
            {level: 1, label: 'Remarks', page: '17'},
            {level: 1, label: 'Rights to Amendments', page: '17'},
            {level: 1, label: 'Acceptance of Employment Terms', page: '18'},
            {level: 1, label: 'Contractual Laws Cited', page: '19'},
        ].forEach(({level, label, page}) => {
            jspdf.text(20 + level * 5, start, label);
            jspdf.text(jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(page) * 5 - 20, start, page);
            start += 9;

            if (start + 30 > jspdf.internal.pageSize.height) {
                jspdf.text(jspdf.internal.pageSize.width - 25, jspdf.internal.pageSize.height - 10, String(pageNumber));
                pageNumber++;
                jspdf.addPage();
                start = 30;
            }
        });
        jspdf.text(jspdf.internal.pageSize.width - 25, jspdf.internal.pageSize.height - 10, String(pageNumber));
    }

    printEmploymentTerms(jspdf: jsPDF) {
      jspdf.setFontType('bold');
      const label = 'Key Employment Terms';
      jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(label) * 5) / 2, 30, label);

      const heading = 'Section A (Details of Employment)';
      this.printBox(jspdf, 20, 32.5, jspdf.internal.pageSize.width - 20, 42.5);
      jspdf.text((jspdf.internal.pageSize.width - jspdf.getStringUnitWidth(heading) * 5) / 2, 40, heading);
      jspdf.setFontType('normal');

      const user = this.selectedEmployee;

      let start = 45, skipAhead = 0;
      const yPosition = (n = 1) => start + (skipAhead + n) * 6.5;
      const printToPdf = (text, x, y, width, pad = 5) => {
          const values = jspdf.splitTextToSize(text, width - pad * 2);
          jspdf.text(x + pad, y, values);
          return values.length - 1;
      };
      [
          {v: ['Employee', `${user.firstName || ''} ${user.lastName || ''}`], t: 0},
          {v: ['NRIC No.', user.userName || ''], t: 0},
          {v: ['Date of Birth', user.dateOfBirth && user.dateOfBirth.slice(0, 10) || ''], t: 0},
          {v: ['Address', user.address || ''], t: 0},
          {v: ['Telephone', user.phone || ''], t: 0},
          {v: ['Bank Account', 'Account Number', user.bankAccount || '', 'Bank', ''], t: 1},
          {v: ['Position Applied for', user.role || ''], t: 0},
          {v: ['Duration of Employment', 'Full Time'], t: 0},
          {v: ['Courses Attended', 'BLU', 'RTT', 'CERT', 'CPR/AED'], t: 2},
          {v: ['Place of work', 'As Deployed'], t: 0},
          {v: ['Start Date', user.dateOfJoining && user.dateOfJoining.slice(0, 10) || ''], t: 0},
      ].forEach(({v: [key, ...values], t}) => {
          let height = 0;

          jspdf.setFontType('bold');
          height = Math.max(height, printToPdf(key, 20, yPosition(), 40));
          jspdf.setFontType('normal');
          switch(t) {
              case 0:
                  height = Math.max(height, printToPdf(values[0], 60, yPosition(), jspdf.internal.pageSize.width - 80));
                  break;
              case 1:
              case 2:
                  const fullWidth = jspdf.internal.pageSize.width - 80;
                  const itemWidth = fullWidth / values.length;
                  const xPosition = (i) => 60 + itemWidth * i;
                  values.forEach((item, i) => {
                      if (t === 1 && i % 2 === 0) jspdf.setFontType('bold');
                      height = Math.max(height, printToPdf(item, xPosition(i), yPosition(), itemWidth));
                      if (t === 1 && i % 2 === 0) jspdf.setFontType('normal');
                  });
                  values.forEach((item, i) => {
                      jspdf.line(xPosition(i), yPosition() - 7.5, xPosition(i), yPosition(height + 1) + 2.5);
                  });
                  break;
          }
          this.printBox(jspdf, 20, yPosition() - 7.5, jspdf.internal.pageSize.width - 20, yPosition(height + 1) + 2.5);
          jspdf.line(60, yPosition() - 7.5, 60, yPosition(height + 1) + 2.5);
          skipAhead += height;
          start += 10;
      });
    }

    generateContract() {
        this.downloadService.exportAsPdf('', (jspdf) => {
            jspdf.setFontSize(12);
            this.printFront(jspdf);
            jspdf.addPage();
            this.printContents(jspdf);
            jspdf.addPage();
            this.printEmploymentTerms(jspdf);
        });
    }

    validateFeedback() {
        const FIELD_REQUIRED = 'This field is required';
        this.feedbackConfirmError = '';
        this.feedbackError = '';

        let isValid = true;

        if (!this.feedback) {
            this.feedbackError = FIELD_REQUIRED;
            isValid = false;
        }

        if (this.isWarning && !this.selectedEmployee.dateOfConfirmation && !this.confirmDate) {
            this.feedbackConfirmError = FIELD_REQUIRED;
            isValid = false;
        }

        if (this.feedback === 'Site Transfer' && this.feedbackSite === '') {
            this.feedbackError = FIELD_REQUIRED + ' in case of SiteTransfer';
            isValid = false;
        }

        if (this.feedback === 'Others' && this.feedbackOthers.trim() === '') {
            this.feedbackError = FIELD_REQUIRED + ' in case of others';
            isValid = false;
        }

        return isValid;
    }

    submitFeedback() {
        if (!this.validateFeedback()) return;

        const feedback = this.feedback === 'Others' ? this.feedbackOthers.trim() :
                        this.feedback === 'Site Transfer' ? `Site Transfer to ${this.feedbackSite}` :
                        this.feedback;

        const payload = {
            isWarning: this.isWarning,
            feedback: feedback,
            employeeId: this.selectedEmployee._id
        };

        this.showProgress();
        this.feedbackService.submit(payload).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.alertService.success(data.description);
                this.feedbackService.getUserFeedbacks(this.selectedEmployee._id).subscribe(data => {
                    this.feedbackHistory = data;

                    let warningCount = data.filter(a => a.isWarning).length;
                    if (warningCount > 3) warningCount = 3;
                    this.warning = this.warnings[warningCount];
                }, data => this.failure(data));

                this.isWarning = false;
                this.feedback = '';
                this.feedbackSite = '';
                this.feedbackOthers = '';

                if (!payload.isWarning) return;

                const emp = this.selectedEmployee;
                if (this.warning === 'Termination') {
                    emp.terminationDate = new Date(this.terminateDate).toISOString().slice(0, 10);
                } else if (this.confirmDate !== '') {
                    emp.dateOfConfirmation = this.confirmDate;
                } else {
                    const confirmDate = new Date(emp.dateOfConfirmation);
                    confirmDate.setDate(confirmDate.getDate() + 30);
                    this.confirmDate = confirmDate.toISOString().slice(0, 10);

                    emp.dateOfConfirmation = this.confirmDate;
                }
                this.submit();
            } else {
                this.alertService.error(data.description);
            }
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });
    }

    validate() {
        const FIELD_REQUIRED = 'This field is required';
        this.firstNameError = '';
        this.lastNameError = '';
        this.dobError = '';
        this.staffError = '';
        this.userNameError = '';
        this.deploymentGradeError = '';
        this.confirmError = '';

        const emp = this.selectedEmployee;
        let isValid = true;

        if (!emp.firstName || !emp.firstName.trim()) {
            this.firstNameError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!emp.lastName || !emp.lastName.trim()) {
            this.lastNameError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!emp.dateOfBirth) {
            this.dobError = FIELD_REQUIRED;
            isValid = false;
        }

        const date = new Date();
        date.setFullYear(date.getFullYear() - 21);
        if (new Date(emp.dateOfBirth) > date) {
            this.dobError = 'Minimum age for the employee must be 21 years';
            isValid = false;
        }

        if (!emp.userName || !emp.userName.trim()) {
            this.userNameError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!emp.staffId || !emp.staffId.trim()) {
            this.staffError = FIELD_REQUIRED;
            isValid = false;
        }

        if (emp.role === 'SO' && (!emp.deploymentGrade || !emp.deploymentGrade.trim())) {
            this.deploymentGradeError = FIELD_REQUIRED + ' for users with SO role';
            isValid = false;
        }

        if (!emp.dateOfConfirmation || !emp.dateOfConfirmation.trim()) {
            this.confirmError = FIELD_REQUIRED;
            isValid = false;
        }

        return isValid;
    }

    submit() {
        if (!this.validate()) return;

        const emp = this.selectedEmployee;

        const formData = new FormData();
        formData.append('_id', emp._id);
        formData.append('userName', emp.userName);
        if (this.password) formData.append('password', this.password);
        formData.append('firstName', emp.firstName);
        formData.append('lastName', emp.lastName);
        formData.append('role', emp.role);
        formData.append('designation', emp.designation);
        formData.append('staffId', String(emp.staffId));
        if (emp.phone) formData.append('phone', emp.phone);
        if (this.profileImage) formData.append('profileImage', this.profileImage);
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
        if (this.empContract) formData.append('contractOfEmployment', this.empContract);
        if (emp.terminationDate) formData.append('terminationDate', emp.terminationDate);
        if (emp.uniformIssueStatus) formData.append('uniformIssueStatus', emp.uniformIssueStatus);

        this.showProgress();
        this.userService.update(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.alertService.success(data.description);
                this.users.set(emp._id, emp);
            } else {
                this.alertService.error(data.description);
            }
        }, data => {
            this.hideProgress();
            this.alertService.error(data);
        });
    }
}
