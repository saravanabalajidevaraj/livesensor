import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    showHead: boolean = false;

    constructor(private router: Router) { }

    ngOnInit() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.showHead = !event['url'].startsWith('/login') &&
                    !event['url'].startsWith('/client-satisfaction/');
            }
        });
    }
}
