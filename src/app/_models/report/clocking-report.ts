import { Image } from './image';

export class ClockingResult {
    scanned: boolean;
    qrId: string;
    dateTime: string;
    imageIndex: number;
    reason: string;
    remarks: string;
}

export class ClockingLog {
    _id: string;
    userId: string;
    siteId: string;
    planTime: string;
    dateCreated: string;
    clockingData: Array<ClockingResult>;
    images: Array<Image>;
}

export class ClockingReport {
    siteId: string;
    date: string;
    planTime: string;
    points: number;
    logs: Array<ClockingLog>;
}
