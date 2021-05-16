class Criteria {
    criteria: string;
    selection: string;
}

class CriteriaList {
    data: Array<Criteria>;
}

export class PerformanceEvaluation {
    _id: string;
    employeeId: string;
    evaluatorId: string;
    dateCreated: string;
    reviewPeriod: string;
    objectives: string;
    accomplishments: string;
    performanceSummary: string;
    developmentPlan: string;
    nextYearTarget: string;
    overallPerformance: string;
    performanceCriteria: CriteriaList;
}
