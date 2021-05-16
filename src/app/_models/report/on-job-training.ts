import { Image } from './image';

class Competency {
    competency: string;
    progress: string;
}

class CompetencyList {
    data: Array<Competency>;
}

class ConcernList {
    data: Array<string>;
}

export class OnJobTraining {
    _id: string;
    dateCreated: string;
    siteId: string;
    mentorId: string;
    traineeId: string;
    trainingPeriod: string;
    overallRating: string;
    location: string;
    trainingDate: string;
    images: Array<Image>;
    trainingProgress: CompetencyList;
    areasOfConcern: ConcernList;
}
