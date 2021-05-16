import { Image } from './image';

export class VacationReport {
    _id: string;
    approverId: string;
    comments: string;
    fileId: string;
    images: Array<Image>;
    status: string;
    dateCreated: string;
    leaveTypeCode: string;
    duration: number;
    employeeId: string;
    fromDate: string;
    toDate: string;
}
