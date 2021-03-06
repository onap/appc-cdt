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

============LICENSE_END============================================
*/


import {Injectable} from '@angular/core';
import {NotificationsService} from 'angular2-notifications';
import { HttpUtilService } from './httpUtil/http-util.service';
import { environment } from '../../../environments/environment';


@Injectable()
export class APIService {

    constructor(private notificationService: NotificationsService, private httpUtils: HttpUtilService) {
    }

    public callGetArtifactsApi(payloadData){
        console.log("APIService: PAYLOAD====>"+JSON.stringify(payloadData));
       return this.httpUtils.post({
            url: environment.getDesigns,
            data: payloadData
            })/*.subscribe(response => {
                if (this.checkResult(response, action, artifactType)) {
                    //Call the respective response handler.
                }
            },
            error => this.notificationService.error('Error', this.connectionErrorMessage))*/
    }

    

}
