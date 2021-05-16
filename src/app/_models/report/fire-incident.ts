import { Image } from './image';

class Response {
    question: string;
    response: boolean;
}

class ResponseList {
    data: Array<Response>;
}

export class FireIncident {
    _id: string;
    dateCreated: string;
    siteId: string;
    userId: string;
    incidentType: string;
    incidentDateTime: string;
    blockFloorZone: string;
    location: string;
    cause: string;
    remarks: string;
    fullDescription: string;
    drillEndTime: string;
    securityStaff: string;
    managementStaff: string;
    images: Array<Image>;
    involvedSOCount: number;
    response: ResponseList;
}
