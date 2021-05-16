import { Output, Injectable } from '@angular/core';
import { Subject } from "rxjs"

@Injectable()
export class EventService {
    @Output() headerRefresh: Subject<boolean> = new Subject<boolean>();
    @Output() attendancePdf: Subject<any> = new Subject<any>();

    constructor() { }

    public triggerHeaderRefresh() {
        this.headerRefresh.next(true);
    }

    public triggerAttendancePfd(payload: any) {
        this.attendancePdf.next(payload);
    }
}
