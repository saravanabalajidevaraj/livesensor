export class OfficerDetail {
    id: string;
    description: string;
    onStandBy: boolean;
}

class Period {
    from: string;
    to: string;
}

class ShiftDetails {
    breakTime: Period;
    remarks: string;
    officers: Array<OfficerDetail>;
}

export class Deployment {
    _id: string;
    siteId: string;
    deploymentDate: string;
    amShiftDeployment: ShiftDetails;
    pmShiftDeployment: ShiftDetails;
}
