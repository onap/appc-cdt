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

import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';


import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {MappingEditorService} from '../../shared/services/mapping-editor.service';

@Injectable()
export class LoginGuardService implements CanActivate {

    constructor(private ngbModal: NgbModal, private mapService: MappingEditorService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        let userId = localStorage['userId'];
        if (userId != null && userId != undefined && userId != '') {
            this.router.navigate(['/vnfs/list']);
            return false;
        } else {
            return true;
        }

    }
}