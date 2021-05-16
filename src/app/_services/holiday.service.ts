import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { Holiday } from '../_models';
import { UtilService } from './util.service';

class HolidayResponse {
    data: Array<Holiday>;
}

class UpdateResponse {
    success: boolean;
    time: string;
    message: string;
    description: string;
}

@Injectable()
export class HolidayService {
    constructor(private http: HttpClient,
                private utilService: UtilService) { }

    public newHoliday(holidayName: string, holidayDate: string) {
        return this.http.post<UpdateResponse>(environment.apiUrl + '/holiday/add', {holidayName, holidayDate});
    }

    public getHolidays(payload: any) {
      return this.http.post<HolidayResponse>(environment.apiUrl + '/holidays', payload)
          .pipe(map(response => response.data));
    }

    public getHolidaysForYear(year: number) {
        const date: Date = new Date();
        const toString = date => this.utilService.dateStringIgnoreTimezone(date);

        return this.getHolidays({
            fromDate: toString(new Date(date.getFullYear(), 0, 1, 0, 0, 0)),
            toDate: toString(new Date(date.getFullYear(), 11, 31, 0, 0, 0))
        });
    }

    public editHoliday(payload: Holiday) {
      return this.http.post<UpdateResponse>(environment.apiUrl + '/holiday/update', payload);
    }

    public deleteHoliday(id: string) {
      return this.http.delete<UpdateResponse>(environment.apiUrl + '/holiday/delete/' + id);
    }
}
