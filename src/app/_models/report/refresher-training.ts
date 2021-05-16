import { Image } from './image';

export class RefresherTraining {
    _id: string;
    dateCreated: string;
    siteId: string;
    conductedBy: string;
    trainingTopic: string;
    trainingDate: string;
    trainingDuration: string;
    images: Array<Image>;
    attendees: Array<string>;
}
