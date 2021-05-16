class Metadata {
    eLearningId: string;
    siteId: string;
}

export class Notification {
    _id: string;
    id: string;
    userId: string;
    notifyUserId: string;
    dateCreated: string;
    metaData : Metadata;
    notificationType: string;
    acknowledgement: boolean;
    title: string;
    description: string;
}
