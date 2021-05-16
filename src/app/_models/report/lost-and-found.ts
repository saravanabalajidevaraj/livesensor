import { Image } from './image';

class Item {
    name: string;
    count: number;
}

class ItemList {
    data: Array<Item>;
}

export class LostAndFound {
    _id: string;
    dateCreated: string;
    userId: string;
    siteId: string;
    dateTime: string;
    location: string;
    informant: string;
    contactNo: string;
    items: ItemList;
    images: Array<Image>;
}
