class CompletionLog {
    employeeId: string;
    dateCompleted: string;
}

export class Training {
    _id: string;
    userId: string;
    title: string;
    details: string;
    location: string;
    fromDate: string;
    toDate: string;
    empSelection: string;
    selectedEmployees: Array<string>;
    trainedUsers: Array<CompletionLog>;
}
