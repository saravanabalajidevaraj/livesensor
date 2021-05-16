import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { NgxSpinnerService } from 'ngx-spinner';

import { User, Training } from '../../_models';
import { AlertService, UserService, UtilService, TrainingService } from '../../_services';

class Node {
    id: string;
    text: string;
    detail: string;
    children: Array<Node> = [];
}

function groupNode(nodeText: string) {
    const node = new Node();
    node.id = nodeText;
    node.text = nodeText;
    node.detail = 'N/A';
    node.children = [];

    return node;
}

function groupBy(map: Map<string, Node>, node: Node, mapper: Function) {
    const key = mapper(node);
    if (!map.has(key)) map.set(key, groupNode(key));

    map.get(key).children.push(node);
    return map;
}

function groupByRole(map: Map<string, Node>, node: Node) {
    return groupBy(map, node, item => item.detail);
}

function groupByName(map: Map<string, Node>, node: Node) {
    return groupBy(map, node, item => node.text[0].toUpperCase());
}

@Component({
    selector: 'app-create-training',
    templateUrl: './create-training.component.html'
})
export class CreateTrainingComponent implements OnInit {
    @ViewChild('userTree') userTree: TreeViewComponent;

    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);

    public users: Map<string, User>;
    public userChoice: string = 'all';
    public usersAsTree: any;

    public title: string = '';
    public details: string = '';
    public location: string = '';
    public date: string = this.today;
    public from: string = '';
    public to: string = '';

    public titleError: string = '';
    public locationError: string = '';
    public dateError: string = '';
    public timeError: string = '';
    public empError: string = '';

    constructor(protected alertService: AlertService,
                protected userService: UserService,
                protected progress: NgxSpinnerService,
                protected utilService: UtilService,
                protected trainingService: TrainingService) { }

    ngOnInit() {
        this.userService.getActive().subscribe(data => {
            this.users = data;
            const nodeMap = Array.from(data).map(a => {
                const node = new Node();
                node.id = a[0];
                node.text = `${a[1].firstName} ${a[1].lastName} - ${a[1].userName}`;
                node.detail = a[1].role;
                node.children = [];

                return node;
            }).reduce(groupByRole, new Map<string, Node>());
            this.usersAsTree = {
                dataSource: Array.from(nodeMap).map(a => a[1]),
                id: 'id',
                text: 'text',
                child: 'children'
            };
        }, data => this.failure(data));
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

    updateUserChoice(userChoice: string) {
        this.userChoice = userChoice;
    }

    validate() {
        const FIELD_REQUIRED = 'This field is required';

        this.titleError = '';
        this.locationError = '';
        this.dateError = '';
        this.timeError = '';
        this.empError = '';

        let isValid = true;

        if (!this.title.trim()) {
            this.titleError = FIELD_REQUIRED;
            isValid = false;
        }

        if (!this.location.trim()) {
            this.locationError = FIELD_REQUIRED;
            isValid = false;
        }

        if (new Date(this.today) >= new Date(this.date)) {
            this.dateError = 'Can only create training in future';
            isValid = false;
        }

        if (!this.from.trim() || !this.to.trim()) {
            this.timeError = 'Both fields are required';
            isValid = false;
        }

        const users = this.userTree.getAllCheckedNodes().filter(id => this.users.has(id));
        if (this.userChoice !== 'all' && !users.length) {
            this.empError = 'Select users for the training';
            isValid = false;
        }

        return isValid;
    }

    protected considerTimezone(dateTime: string) {
        const date = new Date(dateTime);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toISOString();
    }

    submit() {
        if (!this.validate()) return;

        const payload: any = {
            title: this.title,
            details: this.details,
            location: this.location,
            fromDate: this.considerTimezone(`${this.date}T${this.from}:00.000Z`),
            toDate: this.considerTimezone(`${this.date}T${this.to}:00.000Z`),
            empSelection: 'All Employees'
        };

        if (this.userChoice === 'selected') {
            payload.empSelection = 'Select Employees';
            payload.selectedEmployees = this.userTree.getAllCheckedNodes().filter(id => this.users.has(id));
        }

        this.showProgress();
        this.trainingService.addTraining(payload).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
