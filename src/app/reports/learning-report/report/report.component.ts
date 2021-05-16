import { Component, ViewChild, ElementRef } from '@angular/core';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { NgxSpinnerService } from 'ngx-spinner';

import { HeaderComponent } from '../../../header';
import { ReportComponent } from '../../base-report/report/report.component';
import { ELearning, SubjectiveQuestion, ObjectiveQuestion, User } from '../../../_models';
import {
    AlertService, SiteService, UserService, ReportService, ImageService, ELearningService,
    UtilService, DownloadService
} from '../../../_services';

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

@Component({
    selector: 'app-el-report',
    templateUrl: './report.component.html'
})
export class ELReportComponent extends ReportComponent<ELearning> {
    @ViewChild('userTree') userTree: TreeViewComponent;
    @ViewChild('fileUpload') fileUpload: ElementRef;

    public users: Map<string, User>;
    public userChoice: string = 'all';
    public usersAsTree: any;

    public notifyUsers: boolean = false;
    public doc: any;

    constructor(protected progress: NgxSpinnerService,
                protected alertService: AlertService,
                protected siteService: SiteService,
                protected downloadService: DownloadService,
                protected userService: UserService,
                protected reportService: ReportService,
                protected imageService: ImageService,
                protected utilService: UtilService,
                protected eLearningService: ELearningService) {
        super(progress, alertService, siteService, downloadService, userService, reportService, imageService, utilService);
    }

    ngOnInit() {
        this.userService.getAll().subscribe(data => {
            this.users = data;
            const nodeMap = Array.from(data)
                .map(a => {
                    const node = new Node();
                    node.id = a[0];
                    node.text = `${a[1].firstName} ${a[1].lastName} - ${a[1].userName}`;
                    node.detail = a[1].role;
                    node.children = [];

                    return node;
                })
                .reduce(groupByRole, new Map<string, Node>());
                this.usersAsTree = {
                    dataSource: Array.from(nodeMap).map(a => a[1]),
                    id: 'id',
                    text: 'text',
                    child: 'children'
                };
            }, data => this.failure(data));
    }

    downloadDoc() {
        this.showProgress();
        this.downloadService.download(this.report.fileId).subscribe(data => {
            this.hideProgress();
            this.utilService.download(data);
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }

    updateUserChoice(userChoice: string) {
        this.userChoice = userChoice;
    }

    updateDocument(doc: any) {
        this.doc = doc;
    }

    subjective() {
        this.report.learningData.questions.push(new SubjectiveQuestion());
    }

    singleChoice() {
        const question = new ObjectiveQuestion();
        question.type = 'single';
        this.report.learningData.questions.push(question);
    }

    multipleChoice() {
        const question = new ObjectiveQuestion();
        question.type = 'multiple';
        this.report.learningData.questions.push(question);
    }

    submit() {
        const { _id, title, details, learningData } = this.report;

        const formData = new FormData();
        formData.append('_id', _id);
        formData.append('title', title);
        formData.append('details', details);
        formData.append('learningData', JSON.stringify(learningData));
        formData.append('notifySwitch', String(this.notifyUsers));
        if (this.doc) formData.append('document', this.doc);

        if (this.notifyUsers) {
            if (this.userChoice === 'all') {
                formData.append('empSelection', 'All Employees');
            } else {
                formData.append('empSelection', 'Select Employees');
                const selectedUsers = this.userTree.getAllCheckedNodes().filter(id => this.users.has(id));
                formData.append('selectedEmployees', JSON.stringify(selectedUsers));
            }
        }

        this.showProgress();
        this.eLearningService.updateLearning(formData).subscribe(data => {
            this.hideProgress();
            if (data.success) {
                this.success(data.description);
                this.back();
                this.triggerRefresh.emit();
            } else {
                this.failure(data.description);
            }
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
