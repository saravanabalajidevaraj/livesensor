import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.prod';
import { ItemService } from './item.service';
import { Notification } from '../_models';

class NotificationList {
    notifications: Array<Notification>;
}

class FetchResponse {
    data: NotificationList;
}

class UpdateResponse {
    success: boolean;
    time: string;
    message: string;
    description: string;
}

const isELearning = a => a && a.includes('e-Learning');

@Injectable()
export class NotificationService {
    constructor(private http: HttpClient,
                private itemService: ItemService) { }

    public getNotifications() {
        return this.http.get<FetchResponse>(environment.apiUrl + '/user/notifications')
            .pipe(
                map(response => {
                    const notifications = response.data.notifications
                        .filter(({notificationType}) => this.itemService.isRecognized(notificationType));
                    notifications.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
                    return notifications;
                }),
                map(array => ({
                    notifications: array.filter(a => !isELearning(a.notificationType)),
                    learnings: array.filter(a => isELearning(a.notificationType)),
                })
            ));
    }

    public approve(noteId: string) {
        const payload = { notificationIds: [noteId], acknowledgement: true };
        return this.http.post<UpdateResponse>(environment.apiUrl + '/notification/update', payload);
    }
}
