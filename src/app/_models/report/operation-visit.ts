import { Image } from './image';

class Selection {
    criteria: string;
    response: boolean;
}

class SelectionList {
    data: Array<Selection>;
}

class Rating {
    criteria: string;
    point: number;
}

class RatingList {
    data: Array<Rating>;
}

export class OperationVisit {
    _id: string;
    dateCreated: string;
    siteId: string;
    conductedBy: string;
    visitDate: string;
    overallPerformance: string;
    feedbackFromSiteOfficer: string;
    commentsRecommendations: string;
    clientName: string;
    clientDesignation: string;
    images: Array<Image>;
    securityOfficers: Array<string>;
    officerRatings: RatingList;
    officerDuties: SelectionList;
}
