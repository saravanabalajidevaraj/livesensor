export class VacationType {
    _id: string;
    code: string;
    description: string;
}

class Values {
    assignedBalance: number;
    usedBalance: number;
}

export class VacationBalance {
    CC: Values;
    CO: Values;
    HO: Values;
    MIA: Values;
    ML: Values;
    MPL: Values;
    OFF: Values;
}

export class VacationDetail {
    _id: string;
    employeeId: string;
    userId: string;
    overTimeBalance: number;
    vacationBalance: VacationBalance;
}
