import { Image } from './image';

class Check {
    question: string;
    quantity: number;
    remarks: string;
    isSelected: boolean;
}

class Checklist {
    data: Array<Check>;
}

export class DailyChecklist {
    _id: string;
    siteId: string;
    userId: string;
    dateCreated: string;
    handOverTo: string;
    images: Array<Image>;
    dailyCheckList: Checklist;
}
