import { VacationBalance } from '../vacation';

export class SalaryReport {
    _id: string;
    advance: number;
    attendance: number;
    basicSalary: number;
    creditDate: string;
    dateCreated: string;
    daysWorked: number;
    employeeId: string;
    grooming: number;
    holidays: number;
    loan: number;
    others: number;
    payslipDate: string;
    ph: number;
    userId: string;
    vacationBalance: VacationBalance;
    note: string;
    workingDays: number;
    absentDays: number;
}
