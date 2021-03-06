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

ECOMP is a trademark and service mark of AT&T Intellectual Property.
============LICENSE_END============================================
*/


/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { ParameterDefinitionService } from './parameter-definition.service';
import { NotificationsService } from 'angular2-notifications';
import { MappingEditorService } from '../../../shared/services/mapping-editor.service';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';
import { UtilityService } from '../../../shared/services/utilityService/utility.service';
import { ParamShareService } from '../../../shared/services/paramShare.service';


class MockService {
    doStuff() {
        return this;
    }
}

describe('ParameterDefinitionService', () => {
    beforeEach(() => {
        let httpUtilService = new MockService();
        TestBed.configureTestingModule({
            providers: [ParameterDefinitionService, NotificationsService, MappingEditorService, ParamShareService, HttpUtilService, UtilityService,
                { provide: HttpUtilService, useValue: httpUtilService }]
        });
    });

    it('should create a service...', inject([ParameterDefinitionService], (service: ParameterDefinitionService) => {
        expect(service).toBeTruthy();
    }));

    it('should remove unwanted values from PD object...', inject([ParameterDefinitionService], (service: ParameterDefinitionService) => {
        let obj = {
            'vnf-parameter-list': [{
                'ruleTypeValues': 'ruleTypeValues',
                'showFilterFields': 'showFilterFields',
                'enableFilterByValue': 'enableFilterByValue'
            }]
        };

        expect(service.removeUnwantedvalues(obj)).toEqual({ 'vnf-parameter-list': [{}] });
    }));


    it('populateDataUponSource...', inject([ParameterDefinitionService], (service: ParameterDefinitionService) => {
        let obj = [{ 'source': 'A&AI', 'ruleType': 'vm-name-list' }];

        expect(service.populateDataUponSource(obj));
    }));

    it('populateDataUponSource...', inject([ParameterDefinitionService], (service: ParameterDefinitionService) => {
        let obj = [{ 'source': 'Manual', 'ruleType': 'vm-name-list' }];

        expect(service.populateDataUponSource(obj));
    }));

    it('populateDataUponSource...', inject([ParameterDefinitionService], (service: ParameterDefinitionService) => {
        let obj = [{ 'source': 'Something', 'ruleType': 'vm-name-list' }];

        expect(service.populateDataUponSource(obj));
    }));


    it('populateDataUponSource...', inject([ParameterDefinitionService], (service: ParameterDefinitionService) => {
        let obj = [{ 'source': 'Something', 'ruleType': 'vm-name-list' }];

        expect(service.populatePD(obj));
    }));

    it('processPDfile...', inject([ParameterDefinitionService], (service: ParameterDefinitionService) => {
        let yaml = "---\nkind: Property Definition\nversion: V1\nvnf-parameter-list:\n- name: LICENSE_KEY\n  type: null\n  description: null\n  required: null\n  default: null\n  source: Manual\n  rule-type: null\n  request-keys: null\n  response-keys: null";
        let expectedPD = [{
            "name": "LICENSE_KEY", "type": null, "description": null, "required": null, "default": null, "source": "Manual", "rule-type": null,
            "request-keys": [{ "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "response-keys": [{
                "key-name": null
                , "key-value": null
            }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "ruleTypeValues": [null]
        }];

        expect(service.processPDfile("testfile.yaml", yaml)).toEqual(expectedPD);

    }));

    it('processKeyFile...', inject([ParameterDefinitionService, ParamShareService], (service: ParameterDefinitionService, paramShareService: ParamShareService) => {
        let keyFile = "PARAMVALUE|SOURCE|RULETYPE|KEY1|VALUE1|KEY2|VALUE2|KEY3|VALUE3\nvalue1|INSTAR|interface_ip_address|UniqueKeyName1|addressfqdn123|UniqueKeyValue|m001ssc001p1n001v001|FieldKeyName|ipaddress_v4\nvalue2|INSTAR|interface_ip_address|UniqueKeyName2|addressfqdnAsgar1|UniqueKeyValue|m001ssc001p1n001v002|FieldKeyName|ipaddress_v4";
        let expectedPD = [{
            "name": "name1", "type": null, "description": null, "required": null, "default": null, "source": "Manual", "rule-type": null,
            "request-keys": [{ "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "response-keys": [{
                "key-name": null
                , "key-value": null
            }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "ruleTypeValues": [null]
        }];
        localStorage['paramsContent'] = "{ \"name1\":\"value1\",\"name2\":\"value2\"}";
        paramShareService.setSessionParamData(expectedPD)
        expect(service.processKeyFile("testfile.txt", keyFile)).toEqual(expectedPD);

    }));

    it('destroy...', inject([ParameterDefinitionService, ParamShareService, MappingEditorService], (service: ParameterDefinitionService, paramShareService: ParamShareService, mappingEditorService: MappingEditorService) => {
        mappingEditorService.referenceNameObjects = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "ticktack", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_ticktack_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_ticktack_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" };

        let displayParamObjects = [{
            "name": "name1", "type": null, "description": null, "required": null, "default": null, "source": "Manual", "rule-type": null,
            "request-keys": [{ "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "response-keys": [{
                "key-name": null
                , "key-value": null
            }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "ruleTypeValues": [null]
        }];
        localStorage['paramsContent'] = "{ \"name1\":\"value1\",\"name2\":\"value2\"}";

        let expectedPDdata = "---\nkind: \"Property Definition\"\nversion: V1\nvnf-parameter-list:\n- name: name1\n  type: null\n  description: null\n  required: null\n  default: null\n  source: Manual\n  rule-type: null\n  request-keys: null\n  response-keys: null\n";
        let expectedAppData = { "input": { "design-request": { "request-id": "115599612197", "action": "uploadArtifact", "payload": { "userID": "test Usr", "vnf-type": "undefined", "action": "undefined", "artifact-name": "undefined", "artifact-type": "APPC-CONFIG", "artifact-version": "0.0.1", "artifact-contents": "---\nkind: \"Property Definition\"\nversion: V1\nvnf-parameter-list:\n- name: name1\n  type: null\n  description: null\n  required: null\n  default: null\n  source: Manual\n  rule-type: null\n  request-keys: null\n  response-keys: null\n" } } } };
        service.appDataObject = { pd: "" };
        service.downloadDataObject = { pd: { pdData: "", pdFileName: "" } };
        service.destroy(displayParamObjects);
        expect(mappingEditorService.downloadDataObject.pd.pdData).toEqual(expectedPDdata);
        //expect(mappingEditorService.appDataObject.pd).toEqual(expectedAppData);        

    }));

    it('should test setValues method', inject([ParameterDefinitionService, ParamShareService, MappingEditorService], (service: ParameterDefinitionService, paramShareService: ParamShareService, mappingEditorService: MappingEditorService) => {
        service.setValues('vnfType-1', 'vnfcType-1', 'deviceProtocol', 'config', 'artifact-name');
        expect(service.vnfType).toBe('vnfType-1');
        expect(service.vnfcType).toBe('vnfcType-1');
        expect(service.protocol).toBe('deviceProtocol');
        expect(service.action).toBe('config');
        expect(service.artifact_fileName).toBe('artifact-name');
    }));

    it('should test processResponseKeys method', inject([ParameterDefinitionService, ParamShareService, MappingEditorService], (service: ParameterDefinitionService, paramShareService: ParamShareService, mappingEditorService: MappingEditorService) => {
        let saveModel = [{
            'response-keys': [{ 'key-name': 'keyName', 'key-value': 'keyValue' },
            { 'key-name': 'keyName', 'key-value': 'keyValue' },
            { 'key-name': 'keyName', 'key-value': 'keyValue' },
            { 'key-name': 'keyName', 'key-value': 'keyValue' },
            { 'key-name': 'keyName', 'key-value': 'keyValue' }]
        }];
        service.processResponseKeys(saveModel);
    }));

});
