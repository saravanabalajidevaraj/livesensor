import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as jsPDF from 'jspdf'

import { environment } from '../../environments/environment.prod';
import { User, Salary } from '../_models';

class SalaryDetails {
    data: Salary;
}

class PayslipDetails {
    data: any
}

class PostResponse {
    success: boolean;
    description: string;
    message: string;
}

@Injectable()
export class SalaryService {
    constructor(private http: HttpClient) { }

    public getSalary(userId: string) {
        return this.http.get<SalaryDetails>(`${environment.apiUrl}/salaryStructure/${userId}`)
            .pipe(map(response => response.data));
    }

    public addSalary(payload: any) {
        return this.http.post<PostResponse>(`${environment.apiUrl}/salaryStructure/add`, payload);
    }

    public updateSalary(payload: Salary) {
        return this.http.post<PostResponse>(`${environment.apiUrl}/salaryStructure/update`, payload);
    }

    public triggerPayslip(payload: any) {
        return this.http.post<PostResponse>(`${environment.apiUrl}/payslip/generate`, payload);
    }

    public fetchPayslip(payload: any) {
        return this.http.post<PayslipDetails>(`${environment.apiUrl}/payslip/fetch`, payload)
            .pipe(map(response => response.data));
    }

    private generateDateRange(payslipDate: string) {
        const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthSpan = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const dateSplit = payslipDate.split('-');

        const month = Number(dateSplit[0]) - 1;
        const year = Number(dateSplit[1]);

        let span = monthSpan[month];
        if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
            span += 1;
        }
        const suffix = span % 10 === 1 ? 'st' : 'th';

        return `1st-${span}${suffix} ${monthName[month]} ${year}`;
    }

    private overtimeValue(details: any) {
        const {overTime = 0, daysWorked} = details;

        return 3 * overTime * daysWorked;
    }

    private phValue(details:any) {
        const {ph, phDays = 0} = details;

        return ph * phDays;
    }

    private restDayValue(details: any) {
        const {restDaySalary = 0, restDaysWorked = 0} = details;

        return restDaySalary * restDaysWorked;
    }

    private grossValue(details: any) {
        const {
            basicSalary, grooming, attendance, others, medicalReimbursement = 0
        } = details;

        return basicSalary + grooming + attendance + others + this.overtimeValue(details)
            + this.restDayValue(details) + this.phValue(details) + medicalReimbursement;
    }

    private lopValue(details: any) {
        const {basicSalary, absentDays} = details;

        return basicSalary * absentDays * 8 * 12 / (52 * 44);
    }

    private userAge(user) {
        if (!user) return 0;

        const now = new Date();
        const dob = new Date(user.dateOfBirth);

        let age = now.getFullYear() - dob.getFullYear();

        if (now.getMonth() < dob.getMonth() || now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate()) {
            age -= 1;
        }

        return age;
    }

    private cpfValue(values, details: any, user: User) {
        const age = this.userAge(user);

        let index = -1;
        if (age > 20) index++;
        if (age > 54) index++;
        if (age > 61) index++;
        if (age > 65) index++;

        return this.grossValue(details) * values[index] / 100;
    }

    private employeeCpfValue(details: any, user: User) {
        return this.cpfValue([20, 13, 7.5, 5], details, user);
    }

    private employerCpfValue(details: any, user: User) {
        return this.cpfValue([17, 13, 9, 7.5], details, user);
    }

    private fixedLocaleString(value, decimal = 2) {
        return Number(value.toFixed(decimal)).toLocaleString();
    }

    private printLabel(jspdf: jsPDF, marginLeft: number, marginTop: number, text: string, suffix: string = '') {
        jspdf.setFontType('bold');
        jspdf.text(marginLeft, marginTop, `${text}  ${suffix}`);

        const textWidth = jspdf.getStringUnitWidth(text) * 3.5;
        jspdf.line(marginLeft, marginTop + 0.5, marginLeft + textWidth, marginTop + 0.5);
        jspdf.setFontType('normal');
    }

    public generatePayslip(jspdf: jsPDF, user: User, details: any) {
        this.header(jspdf, user, details);

        this.salary(jspdf, user, details);
        this.overtime(jspdf, user, details);
        this.reimbursements(jspdf, user, details);
        this.grossPay(jspdf, user, details);
        this.notes(jspdf, user, details);

        this.leaves(jspdf, user, details);
        this.leaveBalance(jspdf, user, details);
        this.deductions(jspdf, user, details);
        this.contributions(jspdf, user, details);
        this.netSalary(jspdf, user, details);
    }

    private header(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = 20, marginTop = 10;

        const height = 20;
        const width = jspdf.internal.pageSize.width - marginLeft * 2;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {daysWorked, payslipDate} = details;

        jspdf.setFillColor(221, 217, 196);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        const header = 'Live Sensor Security Pte Ltd';
        jspdf.text(marginLeft + (width - jspdf.getStringUnitWidth(header) * fontUnit) / 2, marginTop + 5, header);

        jspdf.text(marginLeft + 1, marginTop + 12.5, `Employee  ${user.firstName} ${user.lastName}`);
        jspdf.text(marginLeft + 1, marginTop + 17.5, `IC/FIN  ${user.userName}`);

        const worked = `${daysWorked}  Days worked`;
        jspdf.text(marginLeft + (width - jspdf.getStringUnitWidth(worked) * fontUnit) / 2, marginTop + 17.5, worked);

        const period = this.generateDateRange(payslipDate);
        jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(period) * fontUnit - 1, marginTop + 17.5, period);
    }

    private salary(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = 20, marginTop = 30;

        const height = 30;
        const width = jspdf.internal.pageSize.width / 2 - marginLeft;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {basicSalary, grooming, attendance, others} = details;

        jspdf.setFillColor(220, 230, 241);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        this.printLabel(jspdf, marginLeft + 10, marginTop + 5, 'Basic Salary', '(A)');

        const salary = `$${basicSalary}`;
        jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(salary) * fontUnit - 1, marginTop + 5, salary);

        this.printLabel(jspdf, marginLeft + 10, marginTop + 12, 'Allowances', '(B)');

        [
            ['Grooming', `$${this.fixedLocaleString(grooming)}`],
            ['Performance', `$${this.fixedLocaleString(attendance)}`],
            ['Others', `$${this.fixedLocaleString(others)}`],
        ].forEach((a, i) => {
            jspdf.text(marginLeft + 1, marginTop + i * 5 + 17.5, a[0]);
            jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(a[1]) * fontUnit - 41, marginTop + i * 5 + 17.5, a[1]);
        });

        const allowance = `$${this.fixedLocaleString(grooming + attendance + others)}`;
        jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(allowance) * fontUnit - 1, marginTop + height - 2.5, allowance);
    }

    private overtime(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = 20, marginTop = 60;

        const height = 30;
        const width = jspdf.internal.pageSize.width / 2 - marginLeft;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {daysWorked, phDays, restDaysWorked = 0} = details;

        jspdf.setFillColor(242, 220, 219);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        this.printLabel(jspdf, marginLeft + 10, marginTop + 5, 'Overtime Details', '(C)');

        [
            ['Public Holiday', `${phDays || phDays === 0 ? phDays : ''} Day(s)`, '$' + this.fixedLocaleString(this.phValue(details))],
            ['3 Hour OT * 1.5', '', ''],
            ['Rest Days', `${restDaysWorked} Day(s)`, '$' + this.fixedLocaleString(this.restDayValue(details))],
            ['x No. of Days Worked', `${daysWorked} Day(s)`, `$${this.fixedLocaleString(this.overtimeValue(details))}`]
        ].forEach((a, i) => {
            jspdf.text(marginLeft + 1, marginTop + i * 5 + 12.5, a[0]);
            jspdf.text(marginLeft + (width - jspdf.getStringUnitWidth(a[1]) * fontUnit) / 2 + 5, marginTop + i * 5 + 12.5, a[1]);
            jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(a[2]) * fontUnit - 1, marginTop + i * 5 + 12.5, a[2]);
        });
    }

    private reimbursements(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = 20, marginTop = 90;

        const height = 15;
        const width = jspdf.internal.pageSize.width / 2 - marginLeft;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {medicalReimbursement = 0} = details;

        jspdf.setFillColor(118, 147, 60);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        this.printLabel(jspdf, marginLeft + 10, marginTop + 5, 'Other Additional Payments', '(D)');

        jspdf.text(marginLeft + 1, marginTop + 12.5, '(Medical Reimbursements)');

        const medical = `$${this.fixedLocaleString(medicalReimbursement)}`;
        jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(medical) * fontUnit - 1, marginTop + 12.5, medical);
    }

    private grossPay(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = 20, marginTop = 105;

        const height = 20;
        const width = jspdf.internal.pageSize.width / 2 - marginLeft;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {creditDate} = details;

        jspdf.setFillColor(250, 191, 143);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        this.printLabel(jspdf, marginLeft + 10, marginTop + 5, 'Gross Pay', '(A+B+C+D)');

        const payValue = `$${this.fixedLocaleString(this.grossValue(details))}`;
        jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(payValue) * fontUnit - 1, marginTop + 5, payValue);

        const creditedOn = new Date(creditDate).getDate();
        const dateSuffix = creditedOn % 10 === 1 && creditedOn !== 11 ? 'st' : creditedOn % 10 === 2 && creditedOn !== 12 ? 'nd' : 'th';
        [
            ['Salary credited to', '', String(user.bankAccount || '')],
            ['Date of Payment', `${creditedOn}${dateSuffix}`, 'POSB Savings'],
        ].forEach((a, i) => {
            jspdf.text(marginLeft + 1, marginTop + i * 5 + 12.5, a[0]);
            jspdf.text(marginLeft + (width - jspdf.getStringUnitWidth(a[1]) * fontUnit) / 2, marginTop + i * 5 + 12.5, a[1]);
            jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(a[2]) * fontUnit - 1, marginTop + i * 5 + 12.5, a[2]);
        });
    }

    private notes(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = 20, marginTop = 125;

        const height = 15;
        const width = jspdf.internal.pageSize.width / 2 - marginLeft;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {note = ''} = details;

        jspdf.setFillColor(166, 166, 166);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        jspdf.setFontType('bold');
        jspdf.text(marginLeft + 1, marginTop + 5, 'Note');

        const textWidth = jspdf.getStringUnitWidth('Note') * fontUnit;
        jspdf.line(marginLeft + 1, marginTop + 5, marginLeft + textWidth + 1, marginTop + 5);
        jspdf.setFontType('normal');

        const noteLines = jspdf.splitTextToSize(note.split(/\s+/).filter(a => a).join(' '), width - 10);
        jspdf.text(marginLeft + textWidth + 2.5, marginTop + 5, noteLines);
    }

    private leaves(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = jspdf.internal.pageSize.width / 2, marginTop = 30;

        const height = 30;
        const width = jspdf.internal.pageSize.width / 2 - 20;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {
            vacationBalance: {
                AL: {assignedBalance: ala, usedBalance: alu},
                ML: {assignedBalance: mla, usedBalance: mlu},
                HO: {assignedBalance: hoa, usedBalance: hou},
            }
        } = details;

        jspdf.setFillColor(216, 228, 188);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        this.printLabel(jspdf, marginLeft + 10, marginTop + 7, 'Leave and MC Balance');

        [
            ['AL Taken', alu.toLocaleString(), (ala - alu).toLocaleString()],
            ['MC', mlu.toLocaleString(), (mla - mlu).toLocaleString()],
            ['HOSP', hou.toLocaleString(), (hoa - hou).toLocaleString()],
        ].forEach((a, i) => {
            jspdf.text(marginLeft + 1, marginTop + i * 5 + 15, a[0]);
            jspdf.text(marginLeft + width / 2 - 5, marginTop + i * 5 + 15, a[1]);
            jspdf.text(marginLeft + width / 2 + 5, marginTop + i * 5 + 15, 'Balance');
            jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(a[2]) * fontUnit - 1, marginTop + i * 5 + 15, a[2]);
        });
    }

    private leaveBalance(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = jspdf.internal.pageSize.width / 2, marginTop = 60;

        const height = 15;
        const width = jspdf.internal.pageSize.width / 2 - 20;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {
            vacationBalance: {
                AL: {assignedBalance: ala, usedBalance: alu},
                ML: {assignedBalance: mla, usedBalance: mlu},
            }
        } = details;

        jspdf.setFillColor(196, 189, 151);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        [
            ['AL', (ala - alu).toLocaleString()],
            ['MC', (mla - mlu).toLocaleString()],
        ].forEach((a, i) => {
            jspdf.text(marginLeft + 21, marginTop + i * 5 + 7.5, `Balance ${a[0]}`);

            const days = `${a[1]} Day(s)`;
            jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(days) * fontUnit - 21, marginTop + i * 5 + 7.5, days);
        });
    }

    private deductions(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = jspdf.internal.pageSize.width / 2, marginTop = 75;

        const height = 30;
        const width = jspdf.internal.pageSize.width / 2 - 20;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {advance, loan = 0} = details;
        const employeeCpf = this.employeeCpfValue(details, user);

        jspdf.setFillColor(204, 192, 218);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        this.printLabel(jspdf, marginLeft + 10, marginTop + 7, 'Total Deductions', '(E)');

        const isUserSingaporean = user.nationality === 'Singapore';

        const values =  [
            ['Advance Salary', this.fixedLocaleString(advance)],
            ['Office Loan', this.fixedLocaleString(loan)],
        ]

        if (isUserSingaporean) {
            values.push(['Employee CPF', this.fixedLocaleString(employeeCpf)]);
        }

        values.forEach((a, i) => {
            jspdf.text(marginLeft + 1, marginTop + i * 5 + 15, a[0]);
            jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(a[1]) * fontUnit - 31, marginTop + i * 5 + 15, `$${a[1]}`);
        });

        const total = `$${this.fixedLocaleString(advance + loan + (isUserSingaporean ? employeeCpf : 0))}`;
        jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(total) * fontUnit - 1, marginTop + height - 5, total);
    }

    private contributions(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = jspdf.internal.pageSize.width / 2, marginTop = 105;

        const height = 20;
        const width = jspdf.internal.pageSize.width / 2 - 20;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        jspdf.setFillColor(253, 233, 217);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        if (user.nationality === 'Singapore') {
            this.printLabel(jspdf, marginLeft + 10, marginTop + 7, 'Contribution from Employer', '(F)');

            jspdf.text(marginLeft + 1, marginTop + 15, 'Employer CPF');

            const pay = `$${this.fixedLocaleString(this.employerCpfValue(details, user))}`;
            jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(pay) * fontUnit - 1, marginTop + 15, pay);
        }
    }

    private netSalary(jspdf: jsPDF, user: User, details: any) {
        const marginLeft = jspdf.internal.pageSize.width / 2, marginTop = 125;

        const height = 15;
        const width = jspdf.internal.pageSize.width / 2 - 20;

        const fontUnit = 3.5;
        jspdf.setFontSize(10);

        const {advance, loan = 0} = details;

        jspdf.setFillColor(221, 217, 196);
        jspdf.rect(marginLeft, marginTop, width, height, 'FD');

        this.printLabel(jspdf, marginLeft + 10, marginTop + 9, 'Net Salary', '(A+B+C+D-E)');

        const gross = this.grossValue(details);

        const isUserSingaporean = user.nationality === 'Singapore';
        const deductions = advance + loan + (isUserSingaporean ? this.employeeCpfValue(details, user) : 0) + this.lopValue(details);

        const net = `$${this.fixedLocaleString(gross - deductions)}`;

        jspdf.text(marginLeft + width - jspdf.getStringUnitWidth(net) * fontUnit - 1, marginTop + 9, net);
    }
}
