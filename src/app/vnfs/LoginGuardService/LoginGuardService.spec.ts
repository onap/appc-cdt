/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 IBM Intellectual Property. All rights reserved.
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

import { async, TestBed, inject } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {CommonModule} from '@angular/common';
import 'rxjs/Rx';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { LoginGuardService } from './Login-guard-service';
import {MappingEditorService} from '../../shared/services/mapping-editor.service';

describe('LogginGuard', () => {
    let routerMock = {
        navigate: jasmine.createSpy('navigate')
    };
    let loggedInGuard: LoginGuardService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, CommonModule, HttpModule],
            providers: [LoginGuardService, NgbModal, MappingEditorService, {provide: Router, useValue: routerMock}]
        });
        TestBed.compileComponents();
    });

    beforeEach(() => {
        loggedInGuard = TestBed.get(LoginGuardService);
    });

    it('be able to hit route when user is logged in', inject([LoginGuardService], (service: LoginGuardService) => {
        localStorage['userId'] = 'abc@xyz.com';
        let route : ActivatedRouteSnapshot;
        let state: RouterStateSnapshot;
        expect(service.canActivate(route, state)).toBe(true);
    }));
});
