/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.
===================================================================

Unless otherwise specified, all software contained herein is licensed
under the Apache License, Version 2.0 (the License);
you may not use this software except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

ECOMP is a trademark and service mark of AT&T Intellectual Property.
============LICENSE_END============================================
*/

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { Http, HttpModule, ConnectionBackend, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ModalDismissReasons, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/of';

import { AboutUsComponent } from './aboutus.component';

class MockService {
    doStuff() {
        return this;
    }
}

describe('ContacUsComponent', () => {
    let component: AboutUsComponent;
    let fixture: ComponentFixture<AboutUsComponent>;
    // const mockHttpProvider =  { 
    //     provide: Http,
    //     deps: [ MockBackend, BaseRequestOptions ], 
    //     useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => 
    //         { return new Http(backend, defaultOptions); } 
    // }

    beforeEach(async(() => {
        let http = new MockService();

        TestBed.configureTestingModule({
            declarations: [AboutUsComponent],
            imports: [HttpModule, NgbModule.forRoot()],
            providers: [NgbModule, {
                provide: Http, useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
                return new Http(backend, defaultOptions);
                }, deps: [MockBackend, BaseRequestOptions]
            },
            { provide: MockBackend, useClass: MockBackend },
            { provide: BaseRequestOptions, useClass: BaseRequestOptions },
            {provide: Http, useValue: http}]
            // providers: [
            //     MockBackend,
            //     BaseRequestOptions,
            //     mockHttpProvider
            // ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AboutUsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test', inject([Http], (http: Http) => {
        let spy = spyOn(http, 'get').and.returnValue(Observable.of('some value'))

        component.versionLogFile();

        expect(http).toBeTruthy();
        expect(spy).toHaveBeenCalled()

    }));
    // it('test', inject([MockBackend], fakeAsync((mockBackend: MockBackend) => {
    //     let res: Response;
    //     console.log(mockBackend.connections.subscribe());
    //     mockBackend.connections.subscribe(c => {
    //         let contentType = c.request.headers.get('Content-Type');
    //         expect(contentType).not.toBeNull();
    //         expect(contentType).toEqual('application/json');
    //         expect(c.request.url).toContain('versionLog.txt');
    //         console.log('c',c)
    //     });
    // })));
    // it('should get data from ersionLog.txt file', fakeAsync(inject([XHRBackend, Http],(mockBacked: MockBackend, http: Http) => {
    //     //let connection : MockConnection;
    //     let text: string;
    //     mockBacked.connections.subscribe(
    //     (c: MockConnection) => {
    //         console.log('dsadsa');
    //       expect(c.request.method).toBe(RequestMethod.Get);
    //       //expect(connection.request.url).toBe(expectedUrl);

    //       c.mockRespond(new Response(
    //         new ResponseOptions({ body: 'mock response' })
    //       ));
    //     });

    //     // backend.connections.subscribe((c: any) => {
    //     //     console.log(connection)
    //     //     connection  = c;
    //     // });
    //     // http.request('something.txt').toPromise().then((res: any) => text = res.text());
    //     // connection.mockRespond(new Response(new ResponseOptions({body: 'Something'})));
    //     // tick();
    //     // expect(text).toBe('Something');

    //     //let spy = spyOn(component, 'versionLogFile').and.returnValue(Observable.of('some value'))
        
    //     // component.versionLogFile();
        
    //     // expect(spy).toHaveBeenCalled();
    //     // expect(spy().value).not.toBeNull();
    //     //console.log('spy',lastConnection);
    // })));

    it('should open modal', inject([NgbModule],(ngbModule: NgbModule) => {
        //spyOn(ngbModule, 'open')
        let content = 'test';
        //const modalRef = NgbModule.open( 'trst' );

        component.open(content);
    }));

    it('should download log file', () => {
        var blob = new Blob(['test'], {
            type: 'text/plain;charset=utf-8'
        });

        component.downloadLogFile();
    });
});
