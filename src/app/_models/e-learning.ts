class Question {
    ques: string = '';
    type: string;
}

export class SubjectiveQuestion extends Question {
    type: string = 'subjective';
}

export class ObjectiveQuestion extends Question {
    type: string;
    options: Array<string> = ['', ''];
}

export class Selectable {
    value: string = '';
    isSelected: boolean = false;
}

class Solution {
    ques: string;
    type: string;
}

export class SubjectiveSolution extends Solution {
    type: string = 'subjective';
    answer: string = '';
}

export class ObjectiveSolution extends Solution {
    options: Array<Selectable>;
}

class LearningData {
    questions: Array<any>
}

export class ELearning {
    _id: string;
    dateUpdated: string;
    dateCreated: string;
    title: string;
    details: string;
    learningData: LearningData;
    empSelection: string;
    selectedEmployees: Array<string>;
    fileId: string;
}

export class ELearningResponse {
    _id: string;
    dateUpdated: string;
    dateCreated: string;
    learningData: LearningData;
    empSelection: string;
    results: string = '';
    isFailed: boolean;
}
