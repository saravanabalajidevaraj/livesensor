import { Image } from './image';

export class AttendanceReport {
    _id: string;
    dateCreated: string;
    employeeId: string;
    userId: string;
    siteId: string;
    status: string;
    startTime: string;
    breakTime: string;
    resumeTime: string;
    endTime: string;
    startImage: Image;
    endImage: Image;
}
