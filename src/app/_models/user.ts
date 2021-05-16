export class Designation {
    _id: string;
    code: string;
    description: string;
}

class TrainingLog {
    trainingId: string;
    title: string;
    dateCompleted: string;
}

﻿export class User {
    _id: string;
    userName: string;
    password: string;
    role: string;
    staffId: string;
    designation: string;
    firstName: string;
    lastName: string;
    phone: string;
    fileId: string;
    token: string;
    address: string;
    dateOfBirth: string;
    dateOfJoining: string;
    dateOfConfirmation: string;
    pwmGrade: string;
    deploymentGrade: string;
    courses: Array<string>;
    gender: string;
    wpIssuedDate: string;
    wpExpiryDate: string;
    notificationAddDate: string;
    notificationCancelDate: string;
    maritalStatus: string;
    age: number;
    bankAccount: string;
    nationality: string;
    nok: string;
    resignationDate: string;
    terminationDate: string;
    contractOfEmployment: string;
    uniformIssueStatus: string;
    ojtStatus: string;
    trainings: Array<TrainingLog>;
    status: string;
}
