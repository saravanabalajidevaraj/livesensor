import { Image } from './image';

class VictimParticulars {
    name: string;
    sex: string;
    victimNo: string;
    address: string;
}

export class IncidentReport {
    _id: string;
    dateCreated: string;
    siteId: string;
    userId: string;
    reportNo: string;
    location: string;
    incidentDate: string;
    subject: string;
    victimParticulars: VictimParticulars;
    incidentDescription: string;
    followUpActionTaken: string;
    images: Array<Image>;
}
