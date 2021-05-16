import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // array in local storage for registered users
        let users: any[] = JSON.parse(localStorage.getItem('users')) || [];
        // array in local storage for registered sites
        let sites: any[] = JSON.parse(localStorage.getItem('sites')) || [];
        // array in local storage for registered deployments
        let deployments: any[] = JSON.parse(localStorage.getItem('deployments')) || [];
        // array in local storage for app role mapping
        let appRoleMapping: any[] = JSON.parse(localStorage.getItem('appRoleMapping')) || [];
        // array in local storage for subordinates mapping
        let subordinatesMapping: any[] = JSON.parse(localStorage.getItem('subordinatesMapping')) || [];
        // array in local storage for grade to JD mapping
        let gradeToJDMapping: any[] = JSON.parse(localStorage.getItem('gradeToJDMapping')) || [];

        // wrap in delayed observable to simulate server api call
        return of(null).pipe(mergeMap(() => {

            // authenticate
            if (request.url.endsWith('/users/authenticate') && request.method === 'POST') {
                // find if any user matches login credentials
                let filteredUsers = users.filter(user => {
                    return user.username === request.body.username && user.password === request.body.password;
                });

                if (filteredUsers.length) {
                    // if login details are valid return 200 OK with user details and fake jwt token
                    let user = filteredUsers[0];
                    let body = {
                        id: user.id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        token: 'fake-jwt-token'
                    };

                    return of(new HttpResponse({ status: 200, body: body }));
                } else {
                    // else return 400 bad request
                    return throwError({ error: { message: 'Username or password is incorrect' } });
                }
            }

            // get users
            if (request.url.endsWith('/users') && request.method === 'GET') {
                // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    return of(new HttpResponse({ status: 200, body: users }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get user by id
            if (request.url.match(/\/users\/\d+$/) && request.method === 'GET') {
                // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    // find user by id in users array
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    let matchedUsers = users.filter(user => { return user.id === id; });
                    let user = matchedUsers.length ? matchedUsers[0] : null;

                    return of(new HttpResponse({ status: 200, body: user }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // register user
            if (request.url.endsWith('/employee/register') && request.method === 'POST') {
                // get new user object from post body
                console.log("inside backend service for register user");
                let newUser = request.body;

                // validation
                let duplicateUser = users.filter(user => { return user.icNumber === newUser.icNumber; }).length;
                if (duplicateUser) {
                    return throwError({ error: { message: ' IC Number "' + newUser.icNumber + '" is already taken' } });
                }

                // save new user
                newUser.id = users.length + 1;
                newUser.password = "test123";
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                // respond 200 OK
                return of(new HttpResponse({ status: 200 }));
            }

            // delete user
            if (request.url.match(/\/users\/\d+$/) && request.method === 'DELETE') {
                // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    // find user by id in users array
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    for (let i = 0; i < users.length; i++) {
                        let user = users[i];
                        if (user.id === id) {
                            // delete user
                            users.splice(i, 1);
                            localStorage.setItem('users', JSON.stringify(users));
                            break;
                        }
                    }

                    // respond 200 OK
                    return of(new HttpResponse({ status: 200 }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get sites
            if (request.url.endsWith('/sites') && request.method === 'GET') {
                // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    return of(new HttpResponse({ status: 200, body: sites }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get site by id
            if (request.url.match(/\/sites\/\d+$/) && request.method === 'GET') {
                // check for fake auth token in header and return site if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    // find site by id in sites array
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    let matchedSites = sites.filter(site => { return site.id === id; });
                    let site = sites.length ? sites[0] : null;

                    return of(new HttpResponse({ status: 200, body: site }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // register site
            if (request.url.endsWith('/sites/register') && request.method === 'POST') {
                // get new site object from post body
                console.log("inside backend service for register site");
                let newSite = request.body;

                // validation
                let duplicateSite = sites.filter(site => { return site.siteName === newSite.siteName; }).length;
                if (duplicateSite) {
                    return throwError({ error: { message: ' Site Name "' + newSite.siteName + '" already exists' } });
                }

                // save new site
                newSite.id = sites.length + 1;
                sites.push(newSite);
                localStorage.setItem('sites', JSON.stringify(sites));

                // respond 200 OK
                return of(new HttpResponse({ status: 200 }));
            }

            // delete site
            if (request.url.match(/\/sites\/\d+$/) && request.method === 'DELETE') {
                // check for fake auth token in header and return site if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    // find site by id in sites array
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    for (let i = 0; i < sites.length; i++) {
                        let site = sites[i];
                        if (site.id === id) {
                            // delete site
                            sites.splice(i, 1);
                            localStorage.setItem('sites', JSON.stringify(sites));
                            break;
                        }
                    }

                    // respond 200 OK
                    return of(new HttpResponse({ status: 200 }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get deployments
            if (request.url.endsWith('/deployments') && request.method === 'GET') {
                // check for fake auth token in header and return sites if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    return of(new HttpResponse({ status: 200, body: deployments }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get deployment by id
            if (request.url.match(/\/deployments\/\d+$/) && request.method === 'GET') {
                // check for fake auth token in header and return deployment if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    // find site by id in sites array
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    let matchedDeployments = deployments.filter(deployment => { return deployment.id === id; });
                    let deployment = deployments.length ? deployments[0] : null;

                    return of(new HttpResponse({ status: 200, body: deployment }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // register deployment
            if (request.url.endsWith('/deployments/register') && request.method === 'POST') {
                // get new deployment object from post body
                console.log("inside backend service for register deployment");
                let newDeployment = request.body;

                // validation
                let duplicateDeployment = deployments.filter(deployment => { return deployment.siteName === newDeployment.siteName; }).length;
                if (duplicateDeployment) {
                    return throwError({ error: { message: ' Deployment Name For given site for given date"' + newDeployment.siteName + '" already exists' } });
                }

                // save new deployment
                newDeployment.id = deployments.length + 1;
                deployments.push(newDeployment);
                localStorage.setItem('deployments', JSON.stringify(deployments));

                // respond 200 OK
                return of(new HttpResponse({ status: 200 }));
            }

            // delete deployment
            if (request.url.match(/\/deployments\/\d+$/) && request.method === 'DELETE') {
                // check for fake auth token in header and return deployment if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    // find deployment by id in deployments array
                    let urlParts = request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    for (let i = 0; i < deployments.length; i++) {
                        let deployment = deployments[i];
                        if (deployment.id === id) {
                            // delete deployment
                            deployments.splice(i, 1);
                            localStorage.setItem('deployments', JSON.stringify(deployments));
                            break;
                        }
                    }

                    // respond 200 OK
                    return of(new HttpResponse({ status: 200 }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get App Role Mapping
            if (request.url.endsWith('/appRoleMapping') && request.method === 'GET') {
                // check for fake auth token in header and return sites if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    return of(new HttpResponse({ status: 200, body: appRoleMapping }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get app role mapping by user name

            // register App Role Mapping
            if (request.url.endsWith('/appRoleMapping/register') && request.method === 'POST') {
                // get new AppRoleMapping object from post body
                console.log("inside backend service for register appRoleMapping");
                let newAppRoleMapping = request.body;

                // validation

                // save new deployment
                //newAppRoleMapping.id = newAppRoleMapping.length + 1;
                appRoleMapping.push(newAppRoleMapping);
                localStorage.setItem('appRoleMapping', JSON.stringify(appRoleMapping));

                // respond 200 OK
                return of(new HttpResponse({ status: 200 }));
            }

            // delete appRoleMapping

            // get Subordinates Mapping
            if (request.url.endsWith('/subordinatesMapping') && request.method === 'GET') {
                // check for fake auth token in header and return sites if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    return of(new HttpResponse({ status: 200, body: subordinatesMapping }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get Subordinates mapping by user name

            // register Subordinates Mapping
            if (request.url.endsWith('/subordinatesMapping/register') && request.method === 'POST') {
                // get new subordinatesMapping object from post body
                console.log("inside backend service for register subordinatesMapping");
                let newSubordinatesMapping = request.body;

                // validation

                // save new subordinatesMapping
                //newAppRoleMapping.id = newAppRoleMapping.length + 1;
                subordinatesMapping.push(newSubordinatesMapping);
                localStorage.setItem('subordinatesMapping', JSON.stringify(subordinatesMapping));

                // respond 200 OK
                return of(new HttpResponse({ status: 200 }));
            }

            // delete Subordinates Mapping

            // get Grade To JD Mapping
            if (request.url.endsWith('/gradeToJDMapping') && request.method === 'GET') {
                // check for fake auth token in header and return sites if valid, this security is implemented server side in a real application
                if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    return of(new HttpResponse({ status: 200, body: gradeToJDMapping }));
                } else {
                    // return 401 not authorised if token is null or invalid
                    return throwError({ status: 401, error: { message: 'Unauthorised' } });
                }
            }

            // get Grade To JD mapping by user name

            // register Grade To Jd Mapping
            if (request.url.endsWith('/gradeToJDMapping/register') && request.method === 'POST') {
                // get new gradeToJDMapping object from post body
                console.log("inside backend service for register gradeToJDMapping");
                let newGradeToJDMapping = request.body;

                // validation

                // save new gradeToJDMapping
                //newAppRoleMapping.id = newAppRoleMapping.length + 1;
                gradeToJDMapping.push(newGradeToJDMapping);
                localStorage.setItem('gradeToJDMapping', JSON.stringify(gradeToJDMapping));

                // respond 200 OK
                return of(new HttpResponse({ status: 200 }));
            }

            // delete Grade To JD Mapping

            // pass through any requests not handled above
            return next.handle(request);
            
        }))

        // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
        .pipe(materialize())
        .pipe(delay(500))
        .pipe(dematerialize());
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};