import { Injectable } from '@angular/core';

import { Notification } from '../_models';

class ItemDetails {
    type: string;
    img: string;
    url: Function;
}

const defUrl = (prefix, details) => `/${prefix}/${details._id}/${details.id}`;

@Injectable()
export class ItemService {

    private types: Map<string, ItemDetails> = [
        {type: 'After Action Review', img: 'ic_input', url: a => defUrl('after-action-review', a)},
        {type: 'Daily Checklist', img: 'ic_format_list_checks', url: a => defUrl('daily-checklist', a)},
        {type: 'Fire Drill', img: 'ic_alert', url: a => defUrl('fire-incident', a)},
        {type: 'Incident Report', img: 'ic_alert_octagon', url: a => defUrl('incident-report', a)},
        {type: 'Job Appraisal', img: 'ic_wallet_giftcard', url: a => defUrl('job-appraisal', a)},
        {type: 'Lost and Found', img: 'ic_find', url: a => defUrl('lost-and-found', a)},
        {type: 'Officer Feedback', img: 'ic_message_alert', url: a => defUrl('officer-feedback', a)},
        {type: 'On The Job Training', img: 'ic_account_check', url: a => defUrl('on-job-training', a)},
        {type: 'Operation Visit', img: 'ic_note_text', url: a => defUrl('operation-visit', a)},
        {type: 'Performance Eval', img: 'ic_trending_up', url: a => defUrl('performance-evaluation', a)},
        {type: 'Refresher Training', img: 'ic_refresh', url: a => defUrl('refresher-training', a)},
        {type: 'Shift Supervisor Checklist', img: 'ic_format_list_checks', url: a => defUrl('shift-supervisor-checklist', a)},
        {type: 'Site Visit', img: 'ic_note_text', url: a => defUrl('site-visit', a)},
        {type: 'Training', img: 'ic_teach', url: a => defUrl('view-training', a)},
        {type: 'Vacation Request', img: 'ic_restore_clock', url: a => defUrl('approve-vacation', a)},
        {type: 'Management Feedback', img: 'ic_voice', url: a => defUrl('management', a)},
        {type: 'Management Warning', img: 'ic_voice', url: a => defUrl('management', a)},
        {type: 'e-Learning', img: 'ic_file_video', url: a => defUrl('view-learning', a)},
        {type: 'e-Learning Failed', img: 'ic_file_video', url: a => `learning-result/${a.metaData.eLearningId}/${a._id}/${a.id}`},
        {type: 'e-Learning Response', img: 'ic_file_video', url: a => `learning-response/${a.metaData.eLearningId}/${a._id}/${a.id}`},
        {type: 'e-Learning View', img: 'ic_file_video', url: a => defUrl('learning-report', a)},
        {type: 'OverTime', img: 'ic_clock_alert', url: a => defUrl('overtime', a)},
    ].reduce((acc, a) => {
        acc.set(a.type, a);
        return acc;
    }, new Map<string, ItemDetails>());

    private item(type: string) {
        return this.types.get(type);
    }

    public isRecognized(type: string) {
        return !!this.item(type);
    }

    public image(type: string) {
        const {img = ''} = this.item(type) || {};
        return img;
    }

    public urlEndpoint(details: Notification) {
        const item = this.item(details.notificationType);
        return item && item.url(details) || '';
    }
}
