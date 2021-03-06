/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

Modification Copyright (C) 2018 IBM.
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

import {inject, TestBed} from '@angular/core/testing';
import {UtilityService} from './utility.service';
import {NotificationsService} from 'angular2-notifications';

describe('UtilityService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UtilityService, NotificationsService]
        });
    });

    it('should create a service...', inject([UtilityService], (service: UtilityService) => {
        expect(service).toBeTruthy();
    }));

    it('should generate random id', inject([UtilityService],(service: UtilityService) => {
        let ret = service.randomId();

        expect(ret).not.toBeNull();
    }));

    it('should apply slashes for a string...', inject([UtilityService], (service: UtilityService) => {
        let text = {'vnf-host-ip-address': 'testidaddress'};

        expect(service.appendSlashes(JSON.stringify(text))).toEqual('{\\"vnf-host-ip-address\\":\\"testidaddress\\"}');
    }));


    it('should check for status 401', inject([UtilityService], (service: UtilityService) => {
        let data = {output: {status: {code: 401}}};

        expect(service.checkResult(data)).toBeFalsy();
    }));


    it('should check for status 400', inject([UtilityService], (service: UtilityService) => {
        let data = {output: {status: {code: 400}}};

        expect(service.checkResult(data)).toBeTruthy();
    }));

    it('should retrive failure message on status 401', inject([UtilityService], (service: UtilityService) => {
        let result = { output: {status: {code: '401'}}};
        service.processApiSubscribe(result, 'getArtifact', '');
    }));

    it('should set success message on status 400', inject([UtilityService], (service: UtilityService) => {
        let result = { output: {status: {code: '400'}}};
        service.processApiSubscribe(result, 'getArtifact', '');
    }));

    it('should set warning message on status 401 and artifact upload', inject([UtilityService], (service: UtilityService) => {
        let result = { output: {status: {code: '401'}}};
        service.processApiSubscribe(result, 'uploadArtifact', '');
    }));

    it('should set suceess message on status 400 and artifact upload', inject([UtilityService], (service: UtilityService) => {
        let result = { output: {status: {code: '400'}}};
        service.processApiSubscribe(result, 'uploadArtifact', '');
    }));

    it('should test checkNotNull function to return false on undefined object', inject([UtilityService], (service: UtilityService) => {
        let obj;
        expect(service.checkNotNull(obj)).toBe(false);
    }));

    it('should test checkNotNull function to return true on defined objects', inject([UtilityService], (service: UtilityService) => {
        let obj = [{data : 'data'}];
        expect(service.checkNotNull(obj)).toBe(true);
    }));

    it('should test setTracelvl function with proper trace value', inject([UtilityService], (service: UtilityService) => {
        service.setTracelvl(1);
        let traceValue = localStorage.getItem("Tracelvl");
        expect(traceValue).toBe("1")
    }));

    it('should test setTracelvl function with no tracevalue', inject([UtilityService], (service: UtilityService) => {
        service.setTracelvl(null);
        let traceValue = localStorage.getItem("Tracelvl");
        expect(traceValue).toBe("0")
    }));

    it('should test processApiError function', inject([UtilityService], (service: UtilityService) => {
        let spy = spyOn(NotificationsService.prototype, 'error');
        service.processApiError();
        expect(spy).toHaveBeenCalled();

    }));

    it('should test createPayLoadForSave function', inject([UtilityService], (service: UtilityService) => {
        let artifactContent = {data: 'data'};
        let artifactType = 'reference_data';
        let vnfType = 'vnf-type';
        let action = 'config';
        let fileName = 'referencedata.json';
        let versionNo = 180;
        localStorage.setItem('apiToken', 'dshagsa'); 
        localStorage.setItem('userId', 'abc');         
        let newPayload='{"userID": "' + 'abc' + '","vnf-type" : "' + vnfType + '","action" : "AllAction","artifact-name" : "' + fileName.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '","artifact-type" : "APPC-CONFIG","artifact-version" : "0.1","artifact-contents" :" ' + artifactContent + '"}';
        let data =
        {
          "input": {
            "design-request": {
              "request-id": 'dshagsa',
              "action": "uploadArtifact",
              "payload": newPayload

            }
          }
        }
        let payload = service.createPayLoadForSave(artifactType, vnfType, action, fileName, versionNo, artifactContent);
    }));
});