import { Component, OnInit } from '@angular/core';

import { DownloadService, AlertService } from '../../_services';

@Component({
    selector: 'app-appreciation-letters',
    templateUrl: './appreciation-letters.component.html',
    styleUrls: ['./appreciation-letters.component.css']
})
export class AppreciationLettersComponent implements OnInit {
    public pdfs: Array<string> = ['BOUNA VISTA GARDEN', 'COSL', 'JOOLONGTRANSPORT', 'KNIGHT FRANK', 'LUMOS', 'SAS', 'TANGLIN'];
    public pdfParsed: Array<string> = [];

    public slideIndex: number = 0;

    constructor(protected alertService: AlertService,
                protected downloadService: DownloadService) { }

    ngOnInit() {
        this.pdfs.forEach((pdf, i) => {
            this.downloadService.local(`../../../assets/pdf/ClientAppreciationLetters/${pdf}.pdf`)
                .subscribe(data => this.pdfParsed[i] = URL.createObjectURL(data), data => this.failure(data));
        });
    }

    failure(message) {
        this.alertService.error(message);
    }
}
