export class SatisfactionCriteria {
    item: string;
    selection: string;
    note: string;
}

export class ClientSatisfaction {
    _id: string;
    siteId: string;
    userId: string;
    clientEmail: string;
    clientName: string;
    clientDesignation: string;
    itemData: Array<SatisfactionCriteria>;
    comments: Array<string>;
    fileId: string;
    dateCreated: string;
    dateUpdated: string;
}
