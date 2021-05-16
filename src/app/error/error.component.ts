import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlertService, TransferService } from '../_services';

@Component({
    selector: 'app-error',
    template: '<div></div>'
})
export class ErrorComponent implements OnInit {

    constructor(protected route: ActivatedRoute,
                protected alertService: AlertService,
                protected transferService: TransferService) { }

    ngOnInit() {
        const message = this.transferService.receive();
        if (message) this.alertService.error(message);

        const status = this.route.snapshot.paramMap.get('statusId');
        if (status) {
            switch (status[0]) {
                case '1':
                    this.alertService.info(status);
                    break;
                case '2':
                    this.alertService.success(status);
                    break;
                case '3':
                    this.alertService.warning(status);
                    break;
                case '4':
                case '5':
                default :
                    this.alertService.error(status);
                    break;
            }

        }
    }
}
