export class StationaryDetail {
    name: string;
    quantity: number;
}

export class EquipmentDetail extends StationaryDetail {
    status: string;
    remark: string;
}

class Report<E> {
    name: string;
    details: Array<E>;
}

export class StationaryReport extends Report<StationaryDetail> {
}

export class EquipmentReport extends Report<EquipmentDetail> {
}

export class Shift {
    start: string = '';
    end: string = '';
}

export class PlanTime {
    from: string;
    to: string;
}

export class ClockingDetails {
    noOfRounds: number;
    planTime: Array<PlanTime>;
}

export class Contract {
    siteNotificationDate: string;
    managementContact: string;
    fccContact: Array<string>;
}

export class Site {
    _id: string;
    siteName: string;
    address: string;
    jobScope: Array<string>;
    jobScopeDocId: string;
    shiftDetails: Array<Shift>;
    equipmentDetails: Array<EquipmentDetail>;
    stationaryDetails: Array<StationaryDetail>;
    clockingDetails: ClockingDetails;
    contract: Contract
}
