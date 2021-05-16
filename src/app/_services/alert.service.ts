import { Injectable } from '@angular/core';
import { ToastyService, ToastyConfig } from 'ng2-toasty';

import { UtilService } from './util.service';

@Injectable()
export class AlertService {

    constructor(private toastyService: ToastyService,
                private toastyConfig: ToastyConfig,
                private utilService: UtilService) {
        this.toastyConfig.showClose = true;
        this.toastyConfig.timeout = 10000;
        this.toastyConfig.theme = 'bootstrap';
    }

    msg(message: string) {
        return this.utilService.statusMsg(message) || message;
    }

    info(message: string) {
        this.toastyService.info({
            title: 'Info',
            msg: this.msg(message),
        });
    }

    success(message: string) {
        this.toastyService.success({
            title: 'Success',
            msg: this.msg(message),
        });
    }

    wait(message: string) {
        this.toastyService.wait({
            title: 'Wait',
            msg: this.msg(message),
        });
    }

    error(message: string) {
        this.toastyService.error({
            title: 'Error',
            msg: this.msg(message),
        });
    }

    warning(message: string) {
        this.toastyService.warning({
            title: 'Warning',
            msg: this.msg(message),
        });
    }
}
