import { Image } from './image';

class Response {
    question: string;
    remarks: string;
    isSelected: boolean;
}

class ResponseList {
    data: Array<Response>;
}

export class ShiftSupervisorChecklist {
    _id: string;
    dateCreated: string;
    siteId: string;
    dateTime: string;
    address: string;
    securitySupervisorId: string;
    otherRemarks: string;
    turnoutBearings: ResponseList;
    occurrenceBook: ResponseList;
    equipment: ResponseList;
    documents: ResponseList;
    images: Array<Image>;
}
