import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Rx';

import { User, Training } from '../../_models';
import { AlertService, UserService, UtilService, TrainingService } from '../../_services';

class Node {
    id: string;
    text: string;
    detail: string;
    isChecked: boolean;
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
    selector: 'app-complete-training',
    templateUrl: './complete-training.component.html'
})
export class CompleteTrainingComponent implements AfterViewChecked {
    @ViewChild('userTree') userTree: TreeViewComponent;

    public today: string = this.utilService.nowStringIgnoreTimezone().slice(0, 10);

    public users: Map<string, User>;
    public usersAsTree: any;

    public item: Training;
    private trainedUsers: Set<string> = new Set();

    public userError: string = '';

    constructor(protected route: ActivatedRoute,
                protected alertService: AlertService,
                protected userService: UserService,
                protected progress: NgxSpinnerService,
                protected utilService: UtilService,
                protected trainingService: TrainingService) { }

    ngOnInit() {
        this.route.params.subscribe(paramMap => {
            const { trainingId } = paramMap;
            if (trainingId) {
                this.showProgress();
                Observable.forkJoin([
                    this.trainingService.getTraining(trainingId),
                    this.userService.getActive()
                ]).subscribe(data => {
                    this.hideProgress();
                    this.item = data[0];
                    this.trainedUsers = new Set(this.item.trainedUsers.map(a => a.employeeId));

                    this.users = data[1];
                    const nodeMap = Array.from(this.users).map(a => {
                        const node = new Node();
                        node.id = a[0];
                        node.text = `${a[1].firstName} ${a[1].lastName} - ${a[1].userName}`;
                        node.detail = a[1].role;
                        node.children = [];
                        node.isChecked = this.trainedUsers.has(a[0]);

                        return node;
                    }).reduce(groupByRole, new Map<string, Node>());

                    this.usersAsTree = {
                        dataSource: Array.from(nodeMap).map(a => a[1]),
                        id: 'id',
                        text: 'text',
                        child: 'children',
                        isChecked: 'isChecked'
                    };
                }, data => {
                    this.hideProgress();
                    this.failure(data);
                });
            }
        });
    }

    ngAfterViewChecked() {
        if (this.userTree) this.userTree.disableNodes(Array.from(this.trainedUsers));
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

    validate() {
        this.userError = '';
        const users = this.userTree.getAllCheckedNodes().filter(id => this.users.has(id) && !this.trainedUsers.has(id));

        if (!users.length) {
            this.userError = 'Please select trained employees';
            return false;
        }
        return true;
    }

    submit() {
        if (!this.validate()) return;

        const payload: any = {
            _id: this.item._id,
            dateCompleted: new Date().toISOString().slice(0, 10),
            employees: this.userTree.getAllCheckedNodes().filter(id => this.users.has(id) && !this.trainedUsers.has(id))
        };

        this.showProgress();
        this.trainingService.completeTraining(payload).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.userTree.disableNodes(payload.employees);
                payload.employees.forEach(a => this.trainedUsers.add(a));
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
