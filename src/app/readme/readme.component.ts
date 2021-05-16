import { Component, OnInit } from '@angular/core';

import { AlertService, DownloadService } from '../_services';

@Component({
    selector: 'app-readme',
    templateUrl: './readme.component.html'
})
export class ReadMeComponent implements OnInit {
    public pdfParsed: string;

    constructor(protected alertService: AlertService,
                protected downloadService: DownloadService) { }

    ngOnInit() {
        this.downloadService.local('../../../assets/pdf/LIVE SENSOR SECURITY(Automated System).pdf')
            .subscribe(data => this.pdfParsed = URL.createObjectURL(data), data => this.failure(data));
    }

    failure(message) {
        this.alertService.error(message);
    }
}
