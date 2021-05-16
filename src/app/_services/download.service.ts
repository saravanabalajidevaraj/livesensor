import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { WorkSheet, WorkBook, utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { map } from 'rxjs/operators';
import * as jsPDF from 'jspdf'
import 'jspdf-autotable';

import { environment } from '../../environments/environment.prod';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const PDF_EXTENSION = '.pdf';

@Injectable()
export class DownloadService {
    constructor(private http: HttpClient,
                private sanitizer: DomSanitizer) { }

    public download(fileId: string) {
        return this.http.get(`${environment.apiUrl}/download/${fileId}`, {responseType: 'blob'});
    }

    public local(filePath: string) {
        return this.http.get(filePath, {responseType: 'blob'});
    }

    public exportAsExcel(fileName: string, formatter: Function) {
        const worksheet: WorkSheet = utils.json_to_sheet([]);
        formatter(worksheet);

        const workbook: WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = write(workbook, { bookType: 'xlsx', type: 'array' });

        const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
        saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }

    public exportAsPdf(fileName: string, formatter: Function, orientation = 'p') {
        const doc = new jsPDF(orientation);
        formatter(doc);
        doc.save(fileName + '_export_' + new Date().getTime() + PDF_EXTENSION);
    }
}
