import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class UtilService {
    private statusMsgs = new Map([
        ['100', 'Continue'], ['101', 'Switching Protocols'], ['200', 'OK'],
        ['201', 'Created'], ['202', 'Accepted'], ['203', 'Non-authoritative Information'],
        ['204', 'No Content'], ['205', 'Reset Content'], ['206', 'Partial Content'],
        ['300', 'Multiple Choices'], ['301', 'Moved Permanently'], ['302', 'Found'],
        ['303', 'See Other'], ['304', 'Not Modified'], ['305', 'Use Proxy'], ['306', 'Unused'],
        ['307', 'Temporary Redirect'], ['400', 'Bad Request'], ['401', 'Unauthorized'],
        ['402', 'Payment Required'], ['403', 'Forbidden'], ['404', 'Not Found'],
        ['405', 'Method Not Allowed'], ['406', 'Not Acceptable'], ['407', 'Proxy Authentication Required'],
        ['408', 'Request Timeout'], ['409', 'Conflict'], ['410', 'Gone'], ['411', 'Length Required'],
        ['412', 'Precondition Failed'], ['413', 'Request Entity Too Large'],
        ['414', 'Request-url Too Long'], ['415', 'Unsupported Media Type'],
        ['416', 'Requested Range Not Satisfiable'], ['417', 'Expectation Failed'],
        ['500', 'Internal Server Error'], ['501', 'Not Implemented'], ['502', 'Bad Gateway'],
        ['503', 'Service Unavailable'], ['504', 'Gateway Timeout'], ['505', 'HTTP Version Not Supported']
    ]);

    constructor() { }

    statusMsg(message: string): string {
        return this.statusMsgs.get(message);
    }

    download(blob: Blob) {
        const fileURL = URL.createObjectURL(blob);
        window.open().document.write(`<iframe src="${fileURL}" frameborder="0"
            style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;"
            allowfullscreen></iframe>`);
    }

    nowStringIgnoreTimezone(): string {
        return this.dateStringIgnoreTimezone(new Date());
    }

    dateStringIgnoreTimezone(date: Date): string {
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString();
    }

    daysWithOneDayWeekend(startDate: Date, endDate: Date): number {
        if (startDate > endDate) return 0;

        const startDay = startDate.getDay();
        const endDay = endDate.getDay();

        const oneDay = 24 * 60 * 60 * 1000;
        const daysBetween = (endDate.getTime() - startDate.getTime()) / oneDay + 1;
        const weeks = Math.floor(daysBetween / 7);

        return daysBetween - weeks - (startDay === 0 || endDay === 0 || startDay > endDay ? 1 : 0);
    }
}
