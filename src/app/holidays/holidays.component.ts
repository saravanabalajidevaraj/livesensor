import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { Holiday } from '../_models';
import { AlertService, EventService, HolidayService, UtilService } from '../_services';

@Component({
    selector: 'holidays',
    templateUrl: './holidays.component.html'
})
export class HolidaysComponent implements OnInit {

    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);

    public holidays: Array<Holiday> = [];
    public edit: Array<boolean> = [];
    public delete: Array<boolean> = [];

    public name: string = '';
    public date: string = this.today;

    constructor(protected alertService: AlertService,
                protected progress: NgxSpinnerService,
                protected utilService: UtilService,
                protected holidayService: HolidayService,
                protected eventService: EventService) { }

    ngOnInit() {
        this.showProgress();
        this.holidayService.getHolidaysForYear(new Date().getFullYear()).subscribe(data => {
          this.hideProgress();
          this.holidays = data;
          this.edit = new Array(data.length).fill(false);
          this.delete = new Array(data.length).fill(false);
        }, data => {
          this.hideProgress();
          this.failure(data);
        });
    }

    showProgress() {
        this.progress.show();
    }

    hideProgress() {
        this.progress.hide();
    }

    success(message: string) {
        this.alertService.success(message);
    }

    failure(message: string) {
        this.alertService.error(message);
    }

    isEditable(holiday: Holiday) {
        return new Date(holiday.holidayDate).getTime() > new Date(this.today).getTime();
    }

    updateDate(index: number, value: string) {
        this.holidays[index].holidayDate = value + 'T00:00:00.000Z';
    }

    generatePdf(index: number) {
        this.eventService.triggerAttendancePfd({
            date: this.holidays[index].holidayDate.slice(0, 10),
            holiday: this.holidays[index].holidayName,
        });
    }

    private refresh() {
        this.holidays.length = 0;
        this.edit.length = 0;
        this.delete.length = 0;
        this.ngOnInit();
    }

    addHoliday() {
        this.showProgress();
        this.holidayService.newHoliday(this.name, this.date).subscribe(data => {
            this.hideProgress();
            this.success(data.description);

            this.refresh();
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    editHoliday(holiday: Holiday) {
        this.showProgress();
        this.holidayService.editHoliday(holiday).subscribe(data => {
            this.hideProgress();
            this.success(data.description);
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    deleteHoliday(id: string) {
        this.showProgress();
        this.holidayService.deleteHoliday(id).subscribe(data => {
            this.hideProgress();
            this.success(data.description);

            this.refresh();
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
