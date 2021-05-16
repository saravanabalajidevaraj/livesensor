import { Image } from './image';

export class SiteVisit {
    _id: string;
    dateCreated: string;
    siteId: string;
    visitedUserId: string;
    timeIn: string;
    timeOut: string;
    images: Array<Image>;
}
