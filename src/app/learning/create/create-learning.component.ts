import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { NgxSpinnerService } from 'ngx-spinner';

import { ELearning, SubjectiveQuestion, ObjectiveQuestion, User } from '../../_models';
import { AlertService, UserService, ELearningService } from '../../_services';

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
    selector: 'app-create-learning',
    templateUrl: './create-learning.component.html'
})
export class CreateLearningComponent implements OnInit {
    @ViewChild('userTree') userTree: TreeViewComponent;
    @ViewChild('fileUpload') fileUpload: ElementRef;

    public users: Map<string, User>;
    public userChoice: string = "all";
    public usersAsTree: any;

    public doc: any;
    public title: string = '';
    public details: string = '';
    public notifyUsers: boolean = false;
    public questions: Array<any> = [];

    public titleError: string = '';
    public questionError: string = '';
    public questionErrors: Array<string> = [];

    constructor(protected alertService: AlertService,
                protected userService: UserService,
                protected progress: NgxSpinnerService,
                protected eLearningService: ELearningService) { }

    ngOnInit() {
        this.userService.getActive().subscribe(data => {
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

    updateDocument(doc: any) {
        this.doc = doc;
    }

    subjective() {
        this.questions.push(new SubjectiveQuestion());
        this.questionErrors.push('');
    }

    singleChoice() {
        const question = new ObjectiveQuestion();
        question.type = 'single';
        this.questions.push(question);
        this.questionErrors.push('');
    }

    multipleChoice() {
        const question = new ObjectiveQuestion();
        question.type = 'multiple';
        this.questions.push(question);
        this.questionErrors.push('');
    }

    removeQuestion(index: number) {
        this.questions.splice(index, 1);
        this.questionErrors.splice(index, 1);
    }

    validate() {
        this.titleError = '';
        this.questionError = '';
        this.questionErrors.fill('');

        let isValid = true;

        if (!this.title) {
            this.titleError = 'Provide title';
            isValid = false;
        }

        if (!this.questions.length) {
            this.questionError = 'Provide questions';
            isValid = false;
        }

        this.questions.forEach((a, i) => {
            if (!a.ques) {
                this.questionErrors[i] = 'Provide question statement';
                isValid = false;
            } else if (a.type !== 'subjective' && a.options.length < 2) {
                this.questionErrors[i] = 'Provide at least 2 options';
                isValid = false;
            } else if (a.type !== 'subjective' && a.options.some(b => !b)) {
                this.questionErrors[i] = 'Provide value for empty option(s)';
                isValid = false;
            }
        });

        return isValid;
    }

    submit() {
        if (!this.validate()) return;

        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('details', this.details);
        formData.append('learningData', JSON.stringify({questions: this.questions}));
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
        this.eLearningService.addLearning(formData).subscribe(data => {
            this.hideProgress();
            this.success(data.description);
        }, data => {
            this.hideProgress();
            this.failure(data);
        });
    }
}
