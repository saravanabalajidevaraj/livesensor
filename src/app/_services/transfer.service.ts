import { Injectable } from '@angular/core';

@Injectable()
export class TransferService {
    private transferObject: any;

    constructor() { }

    public send(object: any) {
        this.transferObject = object;
    }

    public receive() {
        const transferObject = this.transferObject;
        this.transferObject = undefined;
        return transferObject;
    }
}
