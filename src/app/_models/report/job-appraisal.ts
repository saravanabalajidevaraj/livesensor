class Review {
    item: string;
    selection: string;
}

class ReviewList {
    data: Array<Review>;
}

export class JobAppraisal {
    _id: string;
    dateCreated: string;
    userId: string;
    employeeId: string;
    appraisalPeriod: string;
    appraisalDate: string;
    overallRating: string;
    empStrengths: string;
    empPerformanceAreas: string;
    planOfAction: string;
    performanceReview: ReviewList;
}
