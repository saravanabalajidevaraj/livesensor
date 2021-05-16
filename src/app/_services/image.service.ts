import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { Image } from '../_models';

class ImageResponse {
    data: Image;
}

@Injectable()
export class ImageService {
    constructor(private http: HttpClient,
                private sanitizer: DomSanitizer) { }

    public imageById(imageId: string) {
        return this.http.get<ImageResponse>(`${environment.apiUrl}/image/${imageId}`)
            .pipe(
                map(response => response.data.content),
                map(content => this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + content)));
    }

    public imageString(imageId: string) {
        return this.http.get<ImageResponse>(`${environment.apiUrl}/image/${imageId}`)
            .pipe(map(response => response.data.content));
    }

    public parse(blob: Blob) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
    }
}
