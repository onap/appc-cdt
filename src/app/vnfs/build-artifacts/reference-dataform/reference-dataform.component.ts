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

import * as XLSX from 'xlsx';
import * as _ from 'underscore';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BuildDesignComponent } from '../build-artifacts.component';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';
import { Location } from '@angular/common';
import { MappingEditorService } from '../../..//shared/services/mapping-editor.service';
import { NgProgress } from 'ngx-progressbar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationsService } from 'angular2-notifications';
import { ParamShareService } from '../../..//shared/services/paramShare.service';
import { environment } from '../../../../environments/environment';
import { saveAs } from 'file-saver';
import { Jsonp } from '@angular/http';
import { ReferenceDataFormUtil } from './reference-dataform.util';
import { UtilityService } from '../../../shared/services/utilityService/utility.service';
import { APIService } from "../../../shared/services/cdt.apicall";

// Common Confirm Modal
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from "../../../shared/confirmModal/confirm.component";


declare var $: any;
type AOA = Array<Array<any>>;

@Component({
    selector: 'reference-dataform',
    templateUrl: './reference-dataform.component.html',
    styleUrls: ['./reference-dataform.component.css'],
    providers: [ReferenceDataFormUtil]
})
export class ReferenceDataformComponent implements OnInit {
    public classNm= "ReferenceDataformComp";
    public showUploadStatus: boolean = false;
    public fileUploaded: boolean = false;
    public uploadedData: any;
    public statusMsg: string;
    public uploadStatus: boolean = false;
    public isCollapsedContent: boolean = true;
    public vnfcCollLength: number = 0;
    public vfncCollection = [];
    public userForm: any;
    public actionType: any;
    numberTest: RegExp = /^[^.a-z]+$/;
    public numberOfVmTest: boolean = true;
    public tempAllData = [];
    disableGrpNotationValue: boolean;
    public noRefData = false;
    public disableRetrieve = false;
    public getRefStatus = false;
    public uploadStatusError: boolean;
    public showUploadErrorStatus: boolean;
    public noData: string;
    selectedActions = [];
    public appData = { reference: {}, template: { templateData: {}, nameValueData: {} }, pd: {} };
    public downloadData = {
        reference: {},
        template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
        pd: { pdData: '', pdFileName: '' }
    };
    errorMessage = '';
    invalid = true;
    fileName: any;
    vnfcIdentifier;
    oldVnfcIdentifier: any
    public uploadFileName: any;
    public addVmClickedFlag: boolean = false;
    public getExcelUploadStatus: boolean = false;
    public uploadedDataArray: any;
    public actionFlag = false;
    currentAction: any;
    oldAction: any;
    nonConfigureAction: any;
    templateId;
    newVnfcType;
    templateIdentifier;
    public actionLevels = [
        'vnfc', 'vnf'
    ];
    oldtemplateIdentifier: any
    identifierDrp: any;
    identifierDrpValues: any = [];
    //settings for the notifications.
    options = {
        timeOut: 4500,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    };
    //initializing this object to contain all the parameters to be captured later
    public referenceDataObject = {
        action: '',
        'action-level': 'vnf',
        scope: { 'vnf-type': '', 'vnfc-type-list': [] },
        'template': 'Y',
        vm: [],
        'device-protocol': '',
        'user-name': '',
        'port-number': '',
        'artifact-list': []
    };
    public refernceScopeObj = { sourceType: '', from: '', to: '' };
    public actions = ['', // using comma as prefix hereafter for easy reordering
        , 'ConfigBackup'
        , 'ConfigModify'
        , 'ConfigRestore'
        , 'ConfigScaleOut'
        , 'ConfigScaleIn'
        , 'Configure'
        , 'DistributeTraffic'
        , 'DistributeTrafficCheck'
        , 'GetConfig'
        , 'GetRunningConfig'
        , 'HealthCheck'
        , 'LicenseManagement'
        , 'PostConfigure'
        , 'PostEvacuate'
        , 'PostMigrate'
        , 'PostRebuild'
        , 'PreConfigCheck'
        , 'PreConfigure'
        , 'PreEvacuate'
        , 'PreMigrate'
        , 'PreRebuild'
        , 'ProvisionConfig'
        , 'ProvisionData'
        , 'Provisioning'
        , 'QuiesceTraffic'
        , 'ResumeTraffic'
        , 'StartApplication'
        , 'StartTraffic'
        , 'StatusTraffic'
        , 'StopApplication'
        , 'StopTraffic'
        , 'UpgradeBackout'
        , 'UpgradeBackup'
        , 'UpgradePostCheck'
        , 'UpgradePreCheck'
        , 'UpgradeSoftware'
        , 'DownloadNESw'
        , 'ActivateNESw'
        , 'OpenStack Actions'
        ]; //.. manual ordering
    public groupAnotationValue = ['', 'Pair'];
    public groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value'];
    public deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'NETCONF-XML', 'REST', 'CLI', 'RESTCONF'];
    public deviceTemplates = ['', 'Y', 'N'];
    public sourceTypeColl = ['', 'vnfType', 'vnfcType'];
    public ipAddressBoolean = ['', 'Y', 'N'];
    public Sample: any = {
        'vnfc-instance': '1',
        'vnfc-function-code': '',
        'ipaddress-v4-oam-vip': '',
        'group-notation-type': '',
        'group-notation-value': ''
    };
    hideModal: boolean = false;
    public self: any;
    public uploadTypes = [{
        value: 'Reference Data',
        display: 'Sample Json Param File'
    },
    {
        value: 'Mapping Data',
        display: 'Sample Json Param File'
    }
    ];
    public selectedUploadType: string = this.uploadTypes[0].value;
    public vnfcTypeData: string = '';
    public title: string;
    public allowAction: boolean = true;
    public actionExist: boolean = false;
    public disableVnftype: boolean = false;
    public otherActions: boolean = false;
    public actionHealthCheck: boolean = false;
    public actionChanged: boolean = false;
    public initialAction: string = '';
    public noCacheData: boolean;
    public updateParams: any;
    public vnfParams: any;
    public firstArrayElement = [];
    public remUploadedDataArray = [];
    isConfigScaleOut = false
    isConfigScaleIn = false
    isConfigOrConfigModify = false
    displayVnfc = 'false';
    isVnfcType: boolean;
    isVnfcTypeList: boolean = true;
    public referencDataTab = [
        {

            name: 'Reference Data',
            url: 'references',
        }];
    public allTabs = [
        {
            name: 'Reference Data',
            url: 'references',
        }, {
            name: 'Template',
            url: 'templates/myTemplates',
        }, {
            name: 'Parameter Definition',
            url: 'parameterDefinitions/create'
        }/*, {
                    name: "Test",
                    url: 'test',
                }*/
    ];
    public actionList = require('../../../../cdt.application.properties.json').Actions;
    
    public versionNoForApiCall = require('../../../../cdt.application.properties.json').versionNoForApiCall;
    private displayVMBlock: boolean = true;

    constructor(
      private buildDesignComponent: BuildDesignComponent, private apiService: APIService, private utilityService: UtilityService, private httpUtils: HttpUtilService, private referenceDataFormUtil: ReferenceDataFormUtil, private route: Router, private location: Location, private activeRoutes: ActivatedRoute, private notificationService: NotificationService,
        private paramShareService: ParamShareService, private mappingEditorService: MappingEditorService, private modalService: NgbModal, private nService: NotificationsService, private ngProgress: NgProgress,
        private dialogService: DialogService)
    {
      console.log(this.classNm+
        ": new: start: tracelvl="+this.utilityService.getTracelvl() );
    }

    ngOnInit() {
      let methName= "ngOnInit";
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": start ");
        // this.handleVMBlockDisplay();
      if( this.utilityService.getTracelvl() > 0 ) {
        console.log( this.classNm+": "+methName+
          ": actions: count="+this.actions.length );
        for( var i0=0; i0 < this.actions.length; i0++ ) {
          console.log( this.classNm+": "+methName+
            ": action #"+i0+" ["+this.actions[i0]+"]");
        };
      };
      this.self = this;
        let path = this.location.path;
        this.title = 'Reference Data';
      this.displayVnfc = sessionStorage.getItem("vnfcSelectionFlag");
      this.vnfcIdentifier= ' ';
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+
          ": from storage: displayVnfc:["+this.displayVnfc+"]");
      //.. setting the structure for the reference data object 
        this.referenceDataObject = {
            action: '',
            'action-level': 'vnf',
            scope: { 'vnf-type': '', 'vnfc-type-list': [] },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };
        //getting the data from session data, calling get Artifact if the data is undefined
        this.updateParams = sessionStorage.getItem('updateParams');
        //getting the data from the referencenameobjects if the nav is changed and assiging it to the cace data
        let cacheData = this.mappingEditorService.referenceNameObjects;

        if (this.utilityService.checkNotNull(cacheData)) {
            //if cache data exists then assiging the data to the latest temp all data object.
          if( this.utilityService.getTracelvl() > 0 )
            console.log( this.classNm+": ngOnInit: have cacheData.");
            this.tempAllData = cacheData;
            //calling the highligted method to highlight the selected actions in the action dropdown
            this.highlightSelectedActions(this.tempAllData)
            // getting the latest action that the user has selected and assiging it to the reference data object once the user toggles between tabs from reference
            if (this.mappingEditorService.latestAction != undefined) {
                //adding the latest action to the screen
                this.referenceDataObject = this.mappingEditorService.latestAction;
                this.toggleIdentifier(this.referenceDataObject.action);
                //this.referenceDataObject['template-id-list'] = this.mappingEditorService.identifier
                //use these commented objects to be used in template and pd pages
                //this.templateIdentifier = this.mappingEditorService.identifier
                //adding the scope from referencedata obj to referencescopeobject
                this.refernceScopeObj.sourceType = this.referenceDataObject['scopeType'];
                //assigning the latest action fetched to the old action from reference data object
                this.oldAction = this.referenceDataObject.action;
                //this method is called with the action reterived and subsequent values are assigned to refdataobj for displaying
                this.populateExistinAction(this.referenceDataObject.action);
                this.displayHideVnfc();
            }
        } else if (this.updateParams != 'undefined') {
            //calls the get artifact() to reterive the values if cache data is not present
            this.getArtifact();
        }
        //getting the appdata & downloadDataObject from mapping editor service and assiging it.
        var appData = this.mappingEditorService.appDataObject;
        if (appData != null || appData != undefined) this.appData = appData;
        var downloadData = this.mappingEditorService.downloadDataObject;
        if (downloadData != null || downloadData != undefined) this.downloadData = downloadData;

        if (sessionStorage.getItem('vnfParams')) {
            this.vnfParams = JSON.parse(sessionStorage.getItem('vnfParams'));
        }
        if (this.vnfParams && this.vnfParams.vnfType) {
          if( this.utilityService.getTracelvl() > 0 )
            console.log( this.classNm+": "+methName+": vnfParams.vnfType:["+
              this.vnfParams.vnfType+"]");
            this.referenceDataObject['scope']['vnf-type'] = this.vnfParams.vnfType;
        }
        if (this.vnfParams && this.vnfParams.vnfcType) {
          if( this.utilityService.getTracelvl() > 0 )
            console.log( this.classNm+": "+methName+": vnfParams.vnfcType:["+
              this.vnfParams.vnfcType+"]");
            this.referenceDataObject['scope']['vnfc-type'] = this.vnfParams.vnfcType;
        }
        this.uploadedDataArray = [];
        this.remUploadedDataArray = [];
        this.firstArrayElement = [];
        this.uploadFileName = '';
        this.templateIdentifier = this.mappingEditorService.identifier
        // if (this.mappingEditorService.newObject) {
        //     this.vnfcIdentifier = this.mappingEditorService.newObject.vnfc;
        // }
        // else {
        //     this.vnfcIdentifier = '';
        //     this.referenceDataObject['vnfcIdentifier'] = '';
        // }
        this.oldVnfcIdentifier = this.vnfcIdentifier;
        if( this.utilityService.getTracelvl() > 1 )
          console.log( this.classNm+": "+methName+": displayVnfc:["+
            this.displayVnfc+"]");
        if( this.utilityService.getTracelvl() > 1 )
          console.log( this.classNm+": "+methName+": templateIdentifier:["+
            this.templateIdentifier+"]");
        // Enable or Block Template and PD Tabs
        this.buildDesignComponent.getRefData(
          { ...this.referenceDataObject, displayVnfc: this.displayVnfc },
          { reqField: this.templateIdentifier });
        //.. configure some drop-downs
        this.configDrp(this.referenceDataObject.action);
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.classNm+": "+methName+": tempAllData:["+
            JSON.stringify(this.tempAllData)+"]");
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.classNm+": "+methName+": finish.");
    }

    //setting the value to display or hide the template identifier dropdown in the screen
    toggleIdentifier(data) {
        if (data == 'ConfigScaleOut') {
            this.isConfigScaleOut = true

        } else {
            this.isConfigScaleOut = false
        }

        if (data == 'ConfigScaleIn') {
            this.isConfigScaleIn = true;
        } else {
            this.isConfigScaleIn = false;
        }
    }

    //to retrive the data from appc and assign it to the vaiables, if no data display the message reterived from the API
    getArtifact() {
        if( this.utilityService.getTracelvl() > 0 )
          console.log(this.classNm+": getArtifact: start...");
        try {
            // setting the isVnfcTypeList & isVnfcType to false initially
            this.isVnfcTypeList = false;
            this.isVnfcType = false
            let data = this.utilityService.createPayloadForRetrieve(true, '', '', '');
            this.ngProgress.start();
            let serviceCall = this.apiService.callGetArtifactsApi(data);
            serviceCall.subscribe(resp => {
                //getting the response and assigining it to the variables used and end the progress bar aftr the data is fetched.
                if (resp.output.data.block != undefined) {
                    this.nService.success('Status', 'data fetched ');
                    let artifactInfo = JSON.parse(resp.output.data.block).artifactInfo[0];
                    let referenceDataAll = JSON.parse(artifactInfo['artifact-content'])['reference_data'];
                    let reference_data = JSON.parse(artifactInfo['artifact-content'])['reference_data'][0];
                    this.referenceDataObject = reference_data;
                    this.toggleIdentifier(this.referenceDataObject.action);
                    if (this.referenceDataObject.action == 'ConfigScaleOut') {
                        this.groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value', 'existing-group-name'];
                    }
                    if (this.referenceDataObject.action == 'ConfigScaleIn') {
                        this.groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value', 'existing-group-name'];
                    }
                    this.highlightSelectedActions(referenceDataAll)
                    
                    //chck vnfc or vnfcTypeList
                    this.displayHideVnfc();
                    
                    // Enable or Block Template and PD Tabs
                    this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc });

                    this.refernceScopeObj.sourceType = this.referenceDataObject['scopeType'];
                    this.mappingEditorService.getReferenceList().push(JSON.parse(artifactInfo['artifact-content']));
                    this.tempAllData = JSON.parse(artifactInfo['artifact-content'])['reference_data'];
                    this.oldAction = this.referenceDataObject.action;
                    this.oldVnfcIdentifier = this.vnfcIdentifier;

                    this.processReferenceDataAfterRetrieval();
                    this.getArtifactsOpenStack();
                } else {
                    this.nService.success('Status', 'Sorry !!! I dont have any artifact Named : ' + (JSON.parse(sessionStorage.getItem('updateParams')))['artifact-name']);
                }
                this.ngProgress.done();
            });
        }
        catch (e) {
            this.nService.warn('status', 'error while reteriving artifact');
        }
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }

    displayHideVnfc() {
        if( this.utilityService.getTracelvl() > 0 )
          console.log(this.classNm+": displayHideVnfc: start...");
        if( this.utilityService.getTracelvl() > 1 ) {
          if( this.referenceDataObject.scope['vnfc-type-list'] ) {
            console.log( this.classNm+
              ": displayHideVnfc: refDataObj.scope.vnfc-type-list.length="+
              this.referenceDataObject.scope['vnfc-type-list'].length );
          } else {
            console.log( this.classNm+
              ": displayHideVnfc: refDataObj.scope.vnfc-type-list not defined");
          };
          console.log( this.classNm+": displayHideVnfc: scope.vnfc-type:["+
            this.referenceDataObject.scope['vnfc-type']+"]");
        };
        if (this.referenceDataObject.scope['vnfc-type-list'] == undefined && (this.referenceDataObject.scope['vnfc-type'] != undefined || this.referenceDataObject.scope['vnfc-type'] != "")) {
            this.isVnfcType = true
            this.displayVnfc = 'true'
            this.isVnfcTypeList = false
        }
        if (this.referenceDataObject.scope['vnfc-type-list'] != undefined && this.referenceDataObject.scope['vnfc-type-list'].length != 0 && (this.referenceDataObject.scope['vnfc-type'] == undefined || this.referenceDataObject.scope['vnfc-type'] == "")) {
            this.isVnfcType = false
            this.displayVnfc = 'true'
            this.isVnfcTypeList = true
            if(!this.mappingEditorService.newObject || !this.mappingEditorService.newObject.vnfc) {
                this.vnfcIdentifier = this.referenceDataObject.scope['vnfc-type-list'][0];
                // this.mappingEditorService.newObject.vnfc = this.vnfcIdentifier;
            } else {
                this.vnfcIdentifier = this.mappingEditorService.newObject.vnfc;
            }
            this.referenceDataObject['vnfcIdentifier'] = this.vnfcIdentifier;
            //this.vnfcChanged(this.vnfcIdentifier, FormData);
            if( this.utilityService.getTracelvl() > 0 )
              console.log(this.classNm+": displayHideVnfc: vnfcIdentifier:["+
                this.vnfcIdentifier+"]");
        }
        if (this.referenceDataObject.scope['vnfc-type-list'] != undefined && this.referenceDataObject.scope['vnfc-type-list'].length == 0 && this.referenceDataObject.scope['vnfc-type'] != undefined && this.referenceDataObject.scope['vnfc-type'].length == 0) {
            if(this.displayVnfc == 'true') {
                this.isVnfcType = false
                this.displayVnfc = 'true'
                this.isVnfcTypeList = true
            } else {
                this.isVnfcType = false
                this.displayVnfc = 'false'
                this.isVnfcTypeList = false
            }
        }
        if (this.referenceDataObject.scope['vnfc-type-list'] == undefined && this.referenceDataObject.scope['vnfc-type'] == '') {
            this.isVnfcType = false
            this.displayVnfc = 'false'
            this.isVnfcTypeList = false
        }
      if( this.utilityService.getTracelvl() > 0 )
        console.log(this.classNm+": displayHideVnfc: finish. isVnfcType:["+
          this.isVnfcType+" displayVnfc:["+this.displayVnfc+"] isVnfcTypeList:["+
          this.isVnfcTypeList+"]");
    }

    //reinitializing the required values. when changing to template or pd sending the values to mapping service
    ngOnDestroy() {
        let referenceObject = this.prepareReferenceObject();
        this.mappingEditorService.changeNavAppData(this.appData);
        this.mappingEditorService.changeNavDownloadData(this.downloadData);
        this.uploadedDataArray = [];
        this.remUploadedDataArray = [];
        this.firstArrayElement = [];
        this.uploadFileName = '';
    }
    // vaidating the number
    numberValidation(event: any) {
        if (this.numberTest.test(event) && event != 0) {
            this.numberOfVmTest = true;
        }
        else {
            this.numberOfVmTest = false;
        }
    }
    // update my vnf pop up session values
    updateSessionValues(event: any, type: string) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log(this.classNm+": updateSessionValues: type:["+type+"]");
        if (type === 'action') {
            sessionStorage.setItem('action', event);
        }
        if (type === 'vnfType') {
            sessionStorage.setItem('vnfType', event);
        }
    }
    // adding vnfc data for each vm
    addVnfcData(vmNumber: number) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log(this.classNm+": addVnfcData: start: vmNumber="+ vmNumber);
        var newObj = {
            'vnfc-instance': this.referenceDataObject.vm[vmNumber].vnfc.length + 1,
            'vnfc-type': this.vnfcTypeData,
            'vnfc-function-code': '',
            'ipaddress-v4-oam-vip': '',
            'group-notation-type': '',
            'group-notation-value': ''
        };
        this.referenceDataObject.vm[vmNumber].vnfc.push(newObj);
    }
    //validating the vnf and vnfc data in the pop up
    validateVnfcName(name) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": validateVnfcName: start: name:["+name+"]");
        if (!name.trim() || name.length < 1) {
            this.errorMessage = '';
            this.invalid = true;
        } else if (name.startsWith(' ') || name.endsWith(' ')) {
            this.errorMessage = 'Leading and trailing spaces are not allowed';
            this.invalid = true;
        } else if (name.includes('  ')) {
            this.errorMessage = 'More than one space is not allowed in VNFC Type';
            this.invalid = true;
        } else if (name.length > 50) {
            this.errorMessage = 'VNFC Type should be of minimum one character and maximum 50 character';
            this.invalid = true;
        } else {
            this.invalid = false;
            this.errorMessage = '';
        }
    }


    //to remove the VM's created by the user
    removeFeature(vmNumber: any, index: any, templateId) {
        if (this.referenceDataObject.action == "Configure") {
            this.referenceDataObject.vm.splice(vmNumber, 1);
            this.referenceDataObject.vm.forEach((obj, arrIndex) => {
                if (arrIndex >= vmNumber) {
                    obj["vm-instance"] = obj["vm-instance"] - 1
                }
                // obj["vm-instance"] = arrIndex+1

            })
        } else {
            let data = this.referenceDataObject.vm.filter(obj => {
                return obj['template-id'] == templateId;
            })

            let vmIndex = this.findVmindex(data, vmNumber, templateId)
            this.referenceDataObject.vm.splice(vmIndex, 1);
            let index = 0
            this.referenceDataObject.vm.forEach((obj, arrIndex) => {
                if (obj['template-id'] == templateId) {

                    obj["vm-instance"] = index + 1
                    index++
                }

            })
        }

    }
    //utility function while adding VM to check index
    findVmindex(data, vmNumber, templateId) {
        return this.referenceDataObject.vm.findIndex(obj => {
            let x = obj['vm-instance'] == (vmNumber + 1) && templateId == obj['template-id']//true
            return x
        })

    }

    //add new VM's to the configure and configmodify. 
    addVms() {
        let arr = [];

        let mberOFVm = Number(this.refernceScopeObj.from);
        let key
        if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify' || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {
            key = "vnfcType-id"
        } else if (this.referenceDataObject.action == 'ConfigScaleOut' || this.referenceDataObject.action == 'ConfigScaleIn') {
            key = "template-id"
        }
        if (this.referenceDataObject.action == 'ConfigScaleOut' || this.referenceDataObject.action == 'ConfigScaleIn' || this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify' || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {
            let existingVmsLength = this.referenceDataObject.vm.map(obj => {
                if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify' || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {
                    return obj["vnfcType-id"] == this.templateIdentifier
                } else if (this.referenceDataObject.action == 'ConfigScaleOut' || this.referenceDataObject.action == 'ConfigScaleIn') {
                    return obj["template-id"] == this.templateIdentifier
                }
            }).length;
            //mberOFVm = existingVmsLength + mberOFVm;
            let index = 0;
            let identifierValue
            if (this.referenceDataObject.action == 'ConfigScaleOut' || this.referenceDataObject.action == 'ConfigScaleIn') {
                identifierValue = this.templateIdentifier
            } else if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify'  || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {
                identifierValue = this.vnfcIdentifier
            }

            for (var i = 0; i < mberOFVm; i++) {
                if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify' || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {

                    if (identifierValue && identifierValue != "") {
                        this.referenceDataObject.vm.push({ 'vnfcType-id': identifierValue, 'vm-instance': (existingVmsLength + index + 1), vnfc: [Object.assign({}, this.Sample)] });
                    } else {
                        this.referenceDataObject.vm.push({ 'vm-instance': (existingVmsLength + index + 1), vnfc: [Object.assign({}, this.Sample)] });
                    }

                } else if (this.referenceDataObject.action == 'ConfigScaleOut' || this.referenceDataObject.action == 'ConfigScaleIn') {
                    if (identifierValue && identifierValue != "") {
                        this.referenceDataObject.vm.push({ 'template-id': identifierValue, 'vm-instance': (existingVmsLength + index + 1), vnfc: [Object.assign({}, this.Sample)] });
                    }

                }

                index++;
            }

        } else {
            let arrlength = this.referenceDataObject.vm.length;
            mberOFVm = arrlength + mberOFVm;
            for (var i = (arrlength); i < mberOFVm; i++) {
                if (this.referenceDataObject.action == 'ConfigScaleOut' || this.referenceDataObject.action == 'ConfigScaleIn') {
                    this.referenceDataObject.vm.push({ 'template-id': this.templateIdentifier, 'vm-instance': (i + 1), vnfc: [Object.assign({}, this.Sample)] });
                } else {
                    this.referenceDataObject.vm.push({ 'vm-instance': (i + 1), vnfc: [Object.assign({}, this.Sample)] });
                }
            }
        }
    }

    //preparing reference obj with required business use cases
    prepareReferenceObject(isSaving?: any) {
      let methName= "prepareReferenceObject";
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": start: isSaving:["+
          isSaving+"]");
        let scopeName = this.resetParamsOnVnfcType();
        let extension = this.referenceDataFormUtil.decideExtension(this.referenceDataObject);
        this.prepareArtifactList(scopeName, extension);

        if (this.referenceDataObject.action === 'OpenStack Actions') {
            this.referenceDataObject['template'] = 'N';
            this.referenceDataObject['artifact-list'] = [];
            this.referenceDataObject['firstRowVmSpreadSheet'] = this.firstArrayElement;
        }
        else{
            this.referenceDataObject['firstRowVmSpreadSheet']=undefined;
        }
        //ditaching the object from the form and processing pfurther
        let newObj = $.extend(true, {}, this.referenceDataObject);
        let action = this.referenceDataObject.action;
        // if (action=="ConfigScaleOut"){
        //     this.referenceDataObject.action="true";
        // }
        //preparing Obj for save/download
        newObj = this.deleteVmsforNonActions(newObj, action)

        if (newObj['device-protocol'] != 'REST') {
            delete newObj['url']
        }
        this.pushOrReplaceTempData(newObj, action);
        this.addAllActionObj(newObj, scopeName);
        this.resetTempData()


        //rmove context url
        //if()
        //saving data to service
        this.mappingEditorService.getReferenceList().push(JSON.parse(JSON.stringify(this.referenceDataObject)));
        this.buildDesignComponent.updateAccessUpdatePages(this.referenceDataObject.action, this.mappingEditorService.getReferenceList());
        this.mappingEditorService.changeNav(this.tempAllData);
        //on action change or template identifier change reset the form by restting values of Reference data object
        this.resetVmsForScaleout(this.currentAction)
        return { totlaRefDtaa: this.tempAllData, scopeName: scopeName };
    }

    // utility function to check element existence
    public checkIfelementExistsInArray(element, array) {
        var result: boolean = false;

        array.forEach(function (item) {
            if (element === item) {
                result = true;
            }
        }
        );
        return result;
    }
    // when uploading the file 
    upload(evt: any) {
        /* wire up file reader */
        const target: DataTransfer = <DataTransfer>(evt.target);
        this.uploadFileName = evt.target.files[0].name;
        var fileExtension = this.uploadFileName.substr(this.uploadFileName.lastIndexOf('.') + 1);
        if (target.files.length != 1) {
            throw new Error('Cannot upload multiple files on the entry');
        }
        if (fileExtension.toUpperCase() === 'XLS' || fileExtension.toUpperCase() === 'XLSX') {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                /* read workbook */
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                /* grab first sheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                /* save data */
                this.firstArrayElement = []
                let arrData = (<AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 })));
                this.uploadedDataArray = arrData;
                for (var i = 0; i < arrData[0].length; i++) {
                    this.firstArrayElement.push(arrData[0][i].replace(/[\n\r]+/g, ''))
                }
                var remUploadedDataArray = arrData;
                remUploadedDataArray.shift();
                this.remUploadedDataArray = remUploadedDataArray;
                if (arrData != null) {
                    this.getExcelUploadStatus = true;
                    this.nService.success('Success', 'Vm capabilities data uploaded successfully');

                }
                else {
                    this.nService.success('Error', 'Empty Vm capabilities file uploaded');
                }
            };
            reader.readAsBinaryString(target.files[0]);
        }
        else {
            this.nService.error('Error', 'Incorrect VM capabilities file uploaded');
        }

    }

    addVmCapabilitiesData() {
        for (var i = 0; i < this.uploadedDataArray.length; i++) {
            var vnfcFuncCodeArray = [];
            var data = this.uploadedDataArray[i];
            for (var j = 1; j < data.length; j++) {
                if (data[j] != undefined) {
                    if (data[j].toUpperCase() === 'Y') {
                        vnfcFuncCodeArray.push(this.firstArrayElement[j]);
                        //vnfcFuncCodeArray.push({name:this.firstArrayElement[j]});
                    }
                }
            }
            var action = this.uploadedDataArray[i][0];
            if (action && action != undefined) {
                var json = {
                    'action': action,
                    'action-level': 'vm',
                    'scope': {
                        'vnf-type': this.referenceDataObject['scope']['vnf-type'], //need to confirm what should be this value
                        'vnfc-type-list': null
                    },
                    'vnfc-function-code-list': vnfcFuncCodeArray,
                    'template': 'N',
                    'device-protocol': 'OS'
                };

                this.tempAllData.push(json);
            }

        }
    }

    //download the templae pd and reference file with all the actions added.
    save(form: any, isValid: boolean) {
        // will show error message
        this.showValidationErrors(this.referenceDataObject);

        if (isValid) {
            let referenceObject = this.prepareReferenceObject();
            let removedKeysArray = []
            this.tempAllData.forEach((data, index) => {
                if (data.action) {
                    removedKeysArray.push(JSON.parse(JSON.stringify(this.deleteUnwantedKeys(data))))
                }
            });
            this.tempAllData = removedKeysArray;
           /* var tempAllData = this.tempAllData;
            tempAllData=this.removeParamFileNameBeforeSave(tempAllData)*/
            
            //tempAllData["artifact_list"]=newArtifactList;
            let theJSON = JSON.stringify({ 'reference_data': this.tempAllData }, null, '\t');
            let uri = 'data:application/json;charset=UTF-8,' + encodeURIComponent(theJSON);
            this.downloadData.reference = theJSON;
            let referenceFileName = 'reference_AllAction_' + this.referenceDataObject.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V.json';
            this.utilityService.downloadArtifactToPc(theJSON, 'json', referenceFileName, 100);
            this.validateTempAllData();
            var templateData = JSON.stringify(this.downloadData.template.templateData);
            var templateFileName = this.downloadData.template.templateFileName;
            if (templateFileName != null || templateFileName != '') {
                var fileExtensionArr = templateFileName.split('.');
            }
            var nameValueFileName = this.downloadData.template.nameValueFileName;
            let pdFileName = this.downloadData.pd.pdFileName;
            var nameValueData = JSON.stringify(this.downloadData.template.nameValueData);
            var pdData = this.downloadData.pd.pdData;
            if (templateData != '{}' && templateData != null && templateData != undefined) this.utilityService.downloadArtifactToPc(this.downloadData.template.templateData, fileExtensionArr[1], templateFileName, 130);
            if (nameValueData != '{}' && nameValueData != null && nameValueData != undefined) this.utilityService.downloadArtifactToPc(this.downloadData.template.nameValueData, 'json', nameValueFileName, 160);
            if (pdData != '' && pdData != null && pdData != undefined) this.utilityService.downloadArtifactToPc(pdData, 'yaml', pdFileName, 180);
        }
    }

  /*  removeParamFileNameBeforeSave(tempAllData)
    {
        var newArtifactList = [];
            var element={};
            for (var i = 0; i < tempAllData.length; i++) {
                if (this.checkIfelementExistsInArray(tempAllData[i].action,this.actions)) {
                    var artifactList = tempAllData[i]["artifact-list"]
                    
                    for (var j = 0; j < artifactList.length; j++) {
                        if (artifactList[j]["artifact-type"] != "param_values") {
                            element = artifactList[j];
                            newArtifactList.push(element);
                        }
                    }
                    tempAllData[i]["artifact-list"] = newArtifactList
                    newArtifactList = [];
                    element={};
                }
            }
            return tempAllData;
    }*/
    // save the values to the cache, on action change without download
    validateDataAndSaveToAppc( valid, form, event) {
      let methName= "validateDataAndSaveToAppc";
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": start: valid:["+valid+"]");
        // will show error message
        this.showValidationErrors(this.referenceDataObject);
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": tempAllData:["+
          JSON.stringify(this.tempAllData)+"]");
        try {
            form._submitted = true;
            if (valid) {
                let referenceObject = this.prepareReferenceObject(true);
                let removedKeysArray = []
                this.tempAllData.forEach((data, index) => {
                    if (data.action) {
                        removedKeysArray.push(JSON.parse(JSON.stringify(this.deleteUnwantedKeys(data))))
                    }
                });
                this.tempAllData = removedKeysArray;

                this.validateTempAllData();
                this.saveToAppc();
                if (this.actionChanged) {
                    this.clearVnfcData()
                    if (this.currentAction) {
                        this.referenceDataObject.action = this.currentAction;
                    }

                    this.populateExistinAction(this.referenceDataObject.action);
                    this.actionChanged = false;
                }
            }
        }
        catch (e) {
            this.nService.warn('status', 'unable to save the artifact');
        }
    }
    //this method saves reference, template, param and PD data to APPC
    saveToAppc() {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": saveToAppc: start: vnf-type:["+
          this.referenceDataObject.scope['vnf-type']+"]");
        let theJSON = JSON.stringify( this.tempAllData );
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": saveToAppc: tempAllData:["+theJSON+"]");
        let fileName = 'reference_AllAction_' + this.referenceDataObject.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V.json';
        /*var tempAllData=this.removeParamFileNameBeforeSave(this.tempAllData);
        this.tempAllData=tempAllData;*/
        this.saveReferenceDataToAppc(JSON.stringify({ reference_data: this.tempAllData }), this.tempAllData[this.tempAllData.length - 1], fileName);

        var templateData = JSON.stringify(this.appData.template.templateData);
        var nameValueData = JSON.stringify(this.appData.template.nameValueData);
        var pdData = JSON.stringify(this.appData.pd);
        if (templateData != '{}' && templateData != null && templateData != undefined) this.referenceDataFormUtil.handleApiData(this.appData.template.templateData, 'template data');
        if (nameValueData != '{}' && nameValueData != null && nameValueData != undefined) this.referenceDataFormUtil.handleApiData(this.appData.template.nameValueData, 'name value pairs');
        if (pdData != '{}' && pdData != null && pdData != undefined) this.referenceDataFormUtil.handleApiData(this.appData.pd, 'PD file');
    }

    // valaidation of template data
    validateTempAllData() {
        if (this.tempAllData) {
            var updatedData = [];
            this.tempAllData.forEach(data => {
                if (data.action) {
                    updatedData.push(data);
                }
            });
            this.tempAllData = updatedData;
        }
    }

    //preparig and send the data to the API.
    saveReferenceDataToAppc(artifactData, dataJson, fileName) {
        let data = [];
        let slashedPayload = this.referenceDataFormUtil.appendSlashes(artifactData);

        let payload = this.utilityService.createPayLoadForSave("reference_data", dataJson['scope']['vnf-type'], "AllAction", fileName, this.versionNoForApiCall, slashedPayload);
        this.ngProgress.start();
        this.httpUtils.post({
            url: environment.getDesigns,
            data: payload
        }).subscribe((resp) => {
            if (resp != null && resp.output.status.code == '400') {
                window.scrollTo(0, 0);
                this.nService.success('Status', 'successfully uploaded the Reference Data');
            } else {
                this.nService.warn('Status', 'Error while saving Reference Data');
            }
            this.uploadStatusError = false;
            this.getRefStatus = false;
            this.ngProgress.done();
        }, (err) => {
            this.nService.error('Status', 'Error Connecting to the APPC Network');
            window.scrollTo(0, 0);
        });
        this.appData.reference = payload;
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }
    // if no data present in the session, fetching data from API
    retriveFromAppc() {
        if (sessionStorage.getItem('updateParams') != 'undefined') {
            this.getArtifact();
            this.noCacheData = false;
        } else {
            this.noCacheData = true;
        }
    }

    public showUpload() {
        this.selectedUploadType = this.uploadTypes[0].value;
    };
    // used when user uploads a file using upload file
    public fileChange(input) {
        this.fileName = input.target.files[0].name.replace(/C:\\fakepath\\/i, '');
        this.fileUploaded = true;
        this.disableRetrieve = true;
        if (input.target.files && input.target.files[0]) {
            // Create the file reader
            let reader = new FileReader();
            this.readFile(input.target.files[0], reader, (result) => {
                // After the callback fires do:
                if ('Reference Data' === this.selectedUploadType) {
                    try {
                        let obj: any;
                        let jsonObject = (JSON.parse(result))['reference_data'];
                        this.uploadedData = JSON.parse(JSON.stringify(jsonObject));
                        //check for legacy artifact and do not allow it
                        for (let i = 0; i < this.uploadedData.length; i++) {
                            obj = this.uploadedData[i];
                            if (obj.scope['vnfc-type'] != undefined && obj.scope['vnfc-type'] != '') {
                                this.nService.error('Error', 'The legacy reference artifact not supported');
                                return;
                            }
                        }

                        this.displayVnfc = 'false';
                        this.isVnfcType = false;
                        this.isVnfcTypeList = false;
                        for (let i = 0; i < this.uploadedData.length; i++) {
                            obj = this.uploadedData[i];
                            if (obj.scope['vnfc-type-list'] && obj.scope['vnfc-type-list'].length > 0) {
                                this.displayVnfc = 'true';
                                this.isVnfcTypeList = true;
                                this.vnfcIdentifier = obj.scope['vnfc-type-list'][0];
                                
                            }
                        }
                        this.oldAction=obj.action;
                        this.tempAllData = JSON.parse(JSON.stringify(jsonObject));
                        //check vnfc tyoe list for old files
                        // if (this.referenceDataObject.scope['vnfc-type-list'] == undefined) {
                        //     this.tempAllData = []
                        //     this.referenceDataObject = {
                        //         action: '',
                        //         'action-level': 'vnf',
                        //         scope: { 'vnf-type': '', 'vnfc-type-list': [] },
                        //         'template': 'Y',
                        //         vm: [],
                        //         'device-protocol': '',
                        //         'user-name': '',
                        //         'port-number': '',
                        //         'artifact-list': []
                        //     }
                        //     this.nService.error('Error', 'Incorrect file format');
                        //     return
                        // }
                        this.notificationService.notifySuccessMessage('Reference Data file successfully uploaded..');
                        this.highlightSelectedActions(jsonObject)
                        this.toggleIdentifier(this.referenceDataObject.action)
                        this.populateExistinAction(this.referenceDataObject.action)
                        this.configDrp(this.referenceDataObject.action)


                        this.processReferenceDataAfterRetrieval();

                        this.getArtifactsOpenStack();
                        if (this.referenceDataObject.template == null) {
                            this.referenceDataObject.template = 'Y';
                        }
                        if (this.referenceDataObject['action-level'] == null) {
                            this.referenceDataObject['action-level'] = 'VNF';
                        }

                        
                        // Enable or Block Template and PD Tabs
                        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc });
                    } catch (e) {
                        this.nService.error('Error', 'Incorrect file format');
                    }
                }
                this.hideModal = true;
            });
        } else {
            this.notificationService.notifyErrorMessage('Failed to read file..');
        }

    }

    // Highlights selected action on new file upload and on existing VNF 
    public highlightSelectedActions(jsonObject) {
        if (jsonObject instanceof Array) {
            this.referenceDataObject = jsonObject[0];
            jsonObject.forEach(obj => {
                this.selectedActions.push(obj.action);
            });
        } else {
            this.referenceDataObject = jsonObject;

            this.selectedActions.push(jsonObject.action);
        }
    }

    public readFile(file, reader, callback) {
        // Set a callback funtion to fire after the file is fully loaded
        reader.onload = () => {
            // callback with the results
            callback(reader.result);
        };
        this.notificationService.notifySuccessMessage('Uploading File ' + file.name + ':' + file.type + ':' + file.size);
        // Read the file
        reader.readAsText(file, 'UTF-8');
    }

    fileChangeEvent(fileInput: any) {
        let obj: any = fileInput.target.files;
    }
    //resetting the values
    clearVnfcData() {
        this.Sample = {
            'vnfc-instance': '1',
            'vnfc-function-code': '',
            'ipaddress-v4-oam-vip': '',
            'group-notation-type': '',
            'group-notation-value': ''
        };
    }

    setVmInstance(index) {
        this.referenceDataObject.vm[index]['vm-instance'] = index + 1;
    }

    // setVnfcType(str: String) {
    //     this.Sample['vnfc-type'] = str;
    // }

    // getChange(value: String) {
    //     if (value === 'vnfType') {
    //         this.referenceDataObject.scope['vnfc-type'] = '';
    //     }
    // }
    // resetting the form
    resetForm() {
        console.log( this.classNm+": resetForm: start.");
        this.referenceDataObject['action-level'] = 'vnf';
        this.referenceDataObject.template = 'Y';
        this.referenceDataObject['device-protocol'] = '';
        this.referenceDataObject['user-name'] = '';
        this.referenceDataObject['port-number'] = '';
        this.refernceScopeObj.sourceType = '';
        this.Sample['vnfc-type'] = '';
    }

    //.. this method gets called with the action as parameter and
    // the respective action details are fetched and assigned to the current page
    populateExistinAction( action) {
      let methName= "populateExistinAction";
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": start: action:["+action+"]");
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": tempAllData:["+
          JSON.stringify(this.tempAllData)+"]");
      let existAction = this.tempAllData.findIndex(obj => {
        return obj.action == action;
      });
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": existAction="+existAction );
      if( existAction > -1) {
        let obj = $.extend(true, {}, this.tempAllData[existAction]);
        this.referenceDataObject = obj;
        this.referenceDataObject.scope['vnf-type'] = obj['scope']['vnf-type'];
        this.referenceDataObject.scope['vnfc-type-list'] = obj['scope']['vnfc-type-list'];
        this.referenceDataObject['device-protocol'] = obj['device-protocol'];
        this.refernceScopeObj['sourceType'] = obj['scopeType'];
        if( obj['scope']['vnfc-type-list'] != undefined &&
            obj['scope']['vnfc-type-list'].length >0)
        {
          this.referenceDataObject['vnfcIdentifier']=
            obj['scope']['vnfc-type-list'][0];
        };
      }
      else {
        console.log( this.classNm+": populateExistinAction: action not found");
        this.resetForm();
        this.referenceDataObject.action = action;
      }
      //# iof healthCeck change deviceprotocol drp vaues
      switch( action) {
        case 'HealthCheck':
          this.deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'REST'];
          this.actionHealthCheck = true;
          break;
        case 'UpgradeBackout':
        case 'ResumeTraffic':
        case 'DistributeTraffic':
        case 'DistributeTrafficCheck':
        case 'QuiesceTraffic':
        case 'UpgradeBackup':
        case 'UpgradePostCheck':
        case 'UpgradePreCheck':
        case 'UpgradeSoftware':
        case 'DownloadNESw':
        case 'ActivateNESw':
        case 'ConfigRestore':
        case 'StartApplication':
        case 'StopApplication':
        case 'ConfigBackup':
          this.deviceProtocols = ['', 'CHEF', 'ANSIBLE'];
          break;
        case 'GetConfig':
        case 'LicenseManagement':
        case 'PostConfigure':
        case 'PostEvacuate':
        case 'PostMigrate':
        case 'PostRebuild':
        case 'PreConfigCheck':
        case 'PreConfigure':
        case 'PreEvacuate':
        case 'PreMigrate':
        case 'PreRebuild':
        case 'ProvisionConfig':
        case 'ProvisionData':
        case 'Provisioning':
        case 'StartTraffic':
        case 'StatusTraffic':
        case 'StopTraffic':
          this.deviceProtocols = ['', 'ANSIBLE'];
          break;
        case 'OpenStack Actions':
          this.deviceProtocols = ['', 'OpenStack'];
          break;
        case 'ConfigScaleOut':
          this.deviceProtocols = ['', 'CHEF', 'ANSIBLE', 'NETCONF-XML', 'RESTCONF'];
          break;
        case 'ConfigScaleIn':
            this.deviceProtocols = ['', 'CHEF', 'ANSIBLE', 'NETCONF-XML', 'RESTCONF'];
            break;
        case 'GetRunningConfig':
          this.deviceProtocols = ['', 'CHEF', 'ANSIBLE', 'NETCONF-XML', 'RESTCONF', 'CLI', 'REST'];
          break;
        default:
          this.deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'NETCONF-XML', 'RESTCONF', 'CLI'];
          this.actionHealthCheck = false;
      };
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+
          ": deviceProtocols count="+this.deviceProtocols.length+" finish.");
    }

    //Modal pop up for action change with values entered. 
    actionChange( data, userForm) {
      let methName= "actionChange";
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": start: data:["+data+"]"+
          " userForm.valid:["+userForm.valid+"]");
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": tempAllData:["+
          JSON.stringify(this.tempAllData)+"]");
        this.disableGrpNotationValue = false
        if (data == null) {
            console.log( this.classNm+": "+methName+": data == null");
            return;
        }
        if((userForm.valid) && this.oldAction != '' && this.oldAction != undefined) {
            this.actionChanged = true;
          if( this.utilityService.getTracelvl() > 0 )
            console.log( this.classNm+": "+methName+
              ": userForm valid and oldAction defined");
            // Calling common Confirmation Modal
            let disposable = this.dialogService.addDialog(ConfirmComponent)
                .subscribe((isConfirmed)=>{
                    //We get dialog result
                    if(isConfirmed) {
                        // User clicked on Yes
                        this.currentAction = this.referenceDataObject.action;
                        this.referenceDataObject.action = this.oldAction;
                        $('#saveToAppc').click();//make sure the save all is done before the tempall obj is saved form the API
                        this.toggleIdentifier(data)
                        this.oldAction = this.currentAction;// this.referenceDataObject.action + '';
                        this.referenceDataObject.action = this.currentAction

                        this.populateExistinAction(data);
                        if (this.oldAction === 'OpenStack Actions') {

                            this.uploadedDataArray = [];
                            this.remUploadedDataArray = [];
                            this.firstArrayElement = [];
                            this.uploadFileName = '';
                            //this.tempAllData = [];
                        }
                        this.clearCache();
                        this.refernceScopeObj.from = '';
                        this.getArtifactsOpenStack();

                        // Clears VNFC Information data on action change
                        this.clearVnfcData()
                        this.resetVmsForScaleout(data);
                    }
                    else {
                        // User clicked on No
                        this.toggleIdentifier(data)
                        this.currentAction = this.referenceDataObject.action;
                        this.populateExistinAction(data);
                        this.resetVmsForScaleout(data);
                        this.oldAction = this.referenceDataObject.action + '';
                        this.clearCache();
                        this.clearVnfcData()
                        this.refernceScopeObj.from = '';
                    }

                    if (this.referenceDataObject.action === 'Configure' || this.referenceDataObject.action === 'ConfigModify' || this.referenceDataObject.action === 'DistributeTraffic' || this.referenceDataObject.action === 'DistributeTrafficCheck') {
                        this.isConfigOrConfigModify = true;
                    } else {
                        this.isConfigOrConfigModify = false;
                        delete this.mappingEditorService.newObject['vnfc'];
                    }
    
                    // Enable or Block Template and PD Tabs
                    if ((this.currentAction == 'ConfigScaleOut' || this.currentAction == 'ConfigScaleIn') && this.templateIdentifier && this.templateIdentifier != '') {
                        // let referenceDataObjectTemp = this.referenceDataObject;
                        // referenceDataObjectTemp['template-id'] = this.templateIdentifier;
                        // this.buildDesignComponent.getRefData(referenceDataObjectTemp);
                        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc }, { reqField: this.templateIdentifier });
    
                    } else {
                        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc });
                    }    
                });
        } else {
            console.log( this.classNm+": "+methName+
              ": userForm Not valid or oldAction not defined");
            this.actionChanged = true;
            this.currentAction = this.referenceDataObject.action;
            this.oldAction = this.referenceDataObject.action + '';
            this.populateExistinAction(data);
            this.resetVmsForScaleout(data);
            this.toggleIdentifier(data);

            // Enable or Block Template and PD Tabs
            if((this.currentAction == 'ConfigScaleOut' || this.currentAction == 'ConfigScaleOut') && this.templateIdentifier) {
                // let referenceDataObjectTemp = this.referenceDataObject;
                // referenceDataObjectTemp['template-id'] = this.templateIdentifier;
                // this.buildDesignComponent.getRefData(referenceDataObjectTemp);
                this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc }, { reqField: this.templateIdentifier });
            } else {
                this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc });
            }
        }
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.classNm+": "+methName+": tempAllData:["+
            JSON.stringify(this.tempAllData)+"]");
        this.configDrp(data)
    }

    configDrp(data) {
        console.log( this.classNm+": configDrp: start: data:["+data+"]");
        if (data == 'ConfigScaleOut' || data == 'ConfigScaleIn') {
            this.groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value', 'existing-group-name'];
        } else {
            this.groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value'];
        }
        if (data == 'OpenStack Actions') {
            this.buildDesignComponent.tabs = this.referencDataTab;
        }
        else {
            this.buildDesignComponent.tabs = this.allTabs;
        }
        if (data == 'Configure' || data == 'ConfigModify' || data == 'DistributeTraffic' || data == 'DistributeTrafficCheck') {
            this.nonConfigureAction = false;
        } else {
            this.nonConfigureAction = true;
        }
    }
    // removing and adding the url key based on the protocol selected
    deviceProtocolChange() {
      let methName= "deviceProtocolChange";
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": start.");
        if (this.referenceDataObject['device-protocol'] == 'REST') {

        } else {
            delete this.referenceDataObject['context-url']
        }
        // Enable or Block Template and PD Tabs
        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc }, {reqField: this.templateIdentifier})
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.classNm+": "+methName+": tempAllData:["+
            JSON.stringify(this.tempAllData)+"]");
    }

    // used to call or trigger save object on template Identifier changes
    idChange(data, userForm) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": idChange: start: data:["+data+"]");
        if (data == null) {
            return;
        }

        // Enable or Block Template and PD Tabs
        // let referenceDataObjectTemp = this.referenceDataObject;
        // referenceDataObjectTemp['template-id'] = data;
        // this.buildDesignComponent.getRefData(referenceDataObjectTemp);
        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc }, { reqField: data });

        if ((userForm.valid)) {
            this.currentAction = "ConfigScaleOut"
            this.oldtemplateIdentifier = this.templateIdentifier
            let referenceObject = this.prepareReferenceObject();
            this.actionChanged = true;
            if (this.templateIdentifier) {
                 // Calling common Confirmation Modal
                 let disposable = this.dialogService.addDialog(ConfirmComponent)
                 .subscribe((isConfirmed)=>{
                     //We get dialog result
                     if(isConfirmed) {
                         // User clicked on Yes
                         this.validateTempAllData();
                         this.saveToAppc();
                         this.clearCache();
                         this.clearVnfcData();
                         this.refernceScopeObj.from = '';
                     }
                     else {
                         // User clicked on No
                         this.clearCache();
                         this.refernceScopeObj.from = '';
                     }
                 });
            }
        } else {
            this.oldtemplateIdentifier = this.templateIdentifier
        }

        // if (this.referenceDataObject.action == 'ConfigScaleOut' && data ) {
        //     let referenceDataObjectTemp = this.referenceDataObject;
        //     referenceDataObjectTemp['selectedTemplateId'] = data;
        //     this.buildDesignComponent.getRefData(referenceDataObjectTemp);
        // } else {
        //     this.buildDesignComponent.getRefData(this.referenceDataObject);
        // }
    }

    // used to call or trigger save object on multiple VNFC's changes
    vnfcChanged( data, userForm) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": vnfcChanged: new vnfcIdentifier:["+data+"]");
      if( this.utilityService.getTracelvl() > 1 )
        console.log( this.classNm+": vnfcChanged: oldVnfcIdentifier:["+
          this.oldVnfcIdentifier+"]");
      if( this.utilityService.getTracelvl() > 0 )
        console.log(this.classNm+": vnfcChanged:  scope.vnfc-type:["+
          this.referenceDataObject.scope['vnfc-type']+"]");
        this.vnfcIdentifier = data;
        //this.clearCache();
        if (data == null) {
            return;
        }
      
        // Enable or Block Template and PD Tabs
        let referenceDataObjectTemp = this.referenceDataObject;
        referenceDataObjectTemp['vnfcIdentifier'] = data;
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+
          ": vnfcChanged: displayVnfc:["+this.displayVnfc+"]");
        //this.buildDesignComponent.getRefData(referenceDataObjectTemp);
        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc }, { reqField: data });

      
        console.log( this.classNm+
          ": vnfcChanged: userForm.valid:["+userForm.valid+"]");
        if ((userForm.valid) && this.oldVnfcIdentifier != '' && this.oldVnfcIdentifier != undefined) {
            this.currentAction = this.referenceDataObject.action
            this.oldVnfcIdentifier = this.vnfcIdentifier
            let referenceObject = this.prepareReferenceObject();
            this.actionChanged = true;
            if (this.vnfcIdentifier) {
                 // Calling common Confirmation Modal
                 let disposable = this.dialogService.addDialog(ConfirmComponent)
                 .subscribe((isConfirmed)=>{
                     //We get dialog result
                     if(isConfirmed) {
                         // User clicked on Yes
                         this.validateTempAllData();
                         this.saveToAppc();
                         this.clearCache();
                         this.clearVnfcData()
                         this.refernceScopeObj.from = '';
                         //.. populate VNFC Type in Sample field
                         this.setVnfcTypeInSample( this.vnfcIdentifier );
                     }
                     else {
                         // User clicked on No
                         this.clearCache();
                         this.clearVnfcData()
                         this.refernceScopeObj.from = '';
                         //.. populate VNFC Type in Sample field
                         this.setVnfcTypeInSample( this.vnfcIdentifier );
                     }
                 });
            }
        } else {
            if (data != null) {
                this.oldVnfcIdentifier = this.vnfcIdentifier
            }
        }
    }

    clearCache()
    //needed for the the clearing template cache.
    {
        // get the value and save the userid and persist it.
        this.clearTemplateCache();
        this.clearPdCache();
        this.appData = { reference: {}, template: { templateData: {}, nameValueData: {} }, pd: {} };
        this.downloadData = {
            reference: {},
            template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
            pd: { pdData: '', pdFileName: '' }
        };
    }

    clearTemplateCache() {
        this.mappingEditorService.setTemplateMappingDataFromStore(undefined);
        localStorage['paramsContent'] = '{}';
    }
    clearPdCache() {
        this.mappingEditorService.setParamContent(undefined);
        this.paramShareService.setSessionParamData(undefined);
    }

    browseOption() {
        $('#inputFile').trigger('click');
    }

    excelBrowseOption() {
        $('#excelInputFile').trigger('click');
    }

    /* showIdentifier() {
         $('#identifierModal').modal();
     }
 
     showVnfcPopup() {
         $('#vnfcModal').modal();
     }*/

    addToIdentDrp() {
        if (!(this.referenceDataObject['template-id-list'])) {
            this.referenceDataObject['template-id-list'] = [];
        }
        if (!(this.referenceDataObject['template-id-list'].indexOf(this.templateId.trim()) > -1)) {
            this.referenceDataObject['template-id-list'].push(this.templateId.trim());
        }

        // Changing newVnfcType value to blank otherwise it will show previous value in text box of popup
        this.templateId = ''
    }
    // adds the vnfc to the vnfc dropdown list
    addVnfc() {
      var newVnfcTypeV= this.newVnfcType.trim();
      if( this.utilityService.getTracelvl() > 0 )
        console.log(this.classNm+
          ": addVnfc: start: newVnfcTypeV:["+newVnfcTypeV+"]");
        if (!(this.referenceDataObject.scope['vnfc-type-list'])) {
            this.referenceDataObject.scope['vnfc-type-list'] = [];
            this.vnfcIdentifier = newVnfcTypeV;
        } else {
            this.vnfcIdentifier = newVnfcTypeV;
        }
        //this.referenceDataObject['vnfcIdentifier'] = this.vnfcIdentifier;
        if (!(this.referenceDataObject.scope['vnfc-type-list'].indexOf(newVnfcTypeV) > -1)) {
            this.referenceDataObject.scope['vnfc-type-list'].push(newVnfcTypeV);
        }
        this.tempAllData.forEach(obj => {
            if (obj.action == "Configure" || obj.action == "ConfigModify" || obj.action == "DistributeTraffic" || obj.action == "DistributeTrafficCheck") {
                obj.scope['vnfc-type-list'] = this.referenceDataObject.scope['vnfc-type-list']
            }
            this.resetArtifactList(obj);
        });
        //this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc });
      this.setVnfcTypeInSample( newVnfcTypeV );
      let userForm = {valid: true};
      this.vnfcChanged(this.newVnfcType, userForm)
        // Changing newVnfcType value to blank otherwise it will show previous value in text box of popup
        this.newVnfcType = ''
    }

    resetVms() {
        this.referenceDataObject.vm = [];
    }

    dataModified() {
        //  this.referenceDataObject.vm = this.referenceDataObject.vm;
    }
    // used to show and hide the group notation value in VNFC information
    resetGroupNotation() {
        if (this.Sample['group-notation-type'] == "existing-group-name") {
            this.Sample['group-notation-value'] = ""
            this.disableGrpNotationValue = true
        } else {
            this.disableGrpNotationValue = false
        }
    }

    resetVmsForScaleout(action) {
        //reset currentform vms based on action
        if (action == "ConfigScaleOut" || action == "Configure") {
            let ConfigScaleOutIndex = this.tempAllData.findIndex(obj => {
                return obj['action'] == action
            });
            if (ConfigScaleOutIndex > -1) {
                this.referenceDataObject.vm = this.tempAllData[ConfigScaleOutIndex].vm
            } else {
                if (this.actionChanged) {
                    this.referenceDataObject.vm = []
                }
            }
        }
    }

    resetVmsForScaleIn(action) {
        //reset currentform vms based on action
        if (action == "ConfigScaleIn" || action == "Configure") {
            let ConfigScaleInIndex = this.tempAllData.findIndex(obj => {
                return obj['action'] == action
            });
            if (ConfigScaleInIndex > -1) {
                this.referenceDataObject.vm = this.tempAllData[ConfigScaleInIndex].vm
            } else {
                if (this.actionChanged) {
                    this.referenceDataObject.vm = []
                }
            }
        }
    }

    resetParamsOnVnfcType() {
        let scopeName: any;
        let vnfcTypeList = this.referenceDataObject.scope['vnfc-type-list']
        let vnfcType = this.referenceDataObject.scope['vnfc-type']
        let vnfType = this.referenceDataObject.scope['vnf-type'];
        //called only if only vnf is there
        if ((this.referenceDataFormUtil.nullCheckForVnfcTypeList(vnfcTypeList)) && (this.referenceDataFormUtil.nullCheckForVnfcType(vnfcType))
        ) {
            scopeName = vnfType;
            this.referenceDataObject.scope['vnfc-type'] = '';
            this.referenceDataObject['action-level'] = 'vnf';
            this.referenceDataObject['scopeType'] = 'vnf-type';
            scopeName = scopeName.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');
        }
        //if VNFC is entered set action level & Scope type to VNFC for configure and configure modify, and default the values to vnf and vnf type for all other actions  
        else {
            if (this.referenceDataFormUtil.nullCheckForVnfcTypeList(vnfcTypeList)) {
                scopeName = vnfcType ? vnfcType : "";
            } else {
                //    scopeName = this.referenceDataObject.scope['vnfc-type-list'];
            }

            if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify' || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {
                this.referenceDataObject['action-level'] = 'vnf';
                this.referenceDataObject['scopeType'] = 'vnfc-type';
            } else {
                this.referenceDataObject['action-level'] = 'vnf';
                this.referenceDataObject['scopeType'] = 'vnf-type';
            }
        }
        this.referenceDataObject.scope['vnfc-type'] = this.referenceDataObject.scope['vnfc-type'] ? this.referenceDataObject.scope['vnfc-type'] : "";
        return scopeName
    }

    //used to form the structure of the reference file
    prepareArtifactList(scopeName, extension) {
        this.referenceDataObject['artifact-list'] = [];
        let configTemplate
        let pdTemplate
        let paramValue
        let vnf = this.referenceDataObject.scope['vnf-type']
        if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify' || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {
            let vnfcTypeList = this.referenceDataObject.scope['vnfc-type-list'];
            let pd_fileName
            let config_template_fileName

            let param_fileName
            if (vnfcTypeList && vnfcTypeList.length > 0) {


                for (var x = 0; x < vnfcTypeList.length; x++) {
                    //for replacing spaces and "/" with "_"
                    let type = vnfcTypeList[x].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');
                    pd_fileName = this.referenceDataFormUtil.createArtifactName(this.referenceDataObject.action, vnf, type, '.yaml')
                    config_template_fileName = this.referenceDataFormUtil.createArtifactName(this.referenceDataObject.action, vnf, type, extension)
                    param_fileName = this.referenceDataFormUtil.createArtifactName(this.referenceDataObject.action, vnf, type, '.json')
                    configTemplate = this.referenceDataFormUtil.createConfigTemplate(config_template_fileName);
                    pdTemplate = this.referenceDataFormUtil.createPdTemplate(pd_fileName);
                    paramValue = this.referenceDataFormUtil.createParamValue(param_fileName);

                    this.referenceDataObject['artifact-list'].push(configTemplate,
                        pdTemplate, paramValue
                    );
                }
            } else if (scopeName) {
                pd_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V.yaml';
                config_template_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V' + extension;
                param_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V.json';
                configTemplate = this.referenceDataFormUtil.createConfigTemplate(config_template_fileName);
                pdTemplate = this.referenceDataFormUtil.createPdTemplate(pd_fileName);
                paramValue = this.referenceDataFormUtil.createParamValue(param_fileName);
                this.referenceDataObject['artifact-list'].push(configTemplate,
                    pdTemplate, paramValue
                );
            }

        } else {

            //preparing the artifact list array file names along with extension
            let config_template_fileName = this.referenceDataFormUtil.createArtifactName(this.referenceDataObject.action, vnf, '', extension);
            let pd_fileName = this.referenceDataFormUtil.createArtifactName(this.referenceDataObject.action, vnf, '', '.yaml');
            let reference_fileName = this.referenceDataFormUtil.createArtifactName(this.referenceDataObject.action, vnf, '', '.json');
            let param_fileName = this.referenceDataFormUtil.createArtifactName(this.referenceDataObject.action, vnf, '', '.json');
            configTemplate = this.referenceDataFormUtil.createConfigTemplate(config_template_fileName);
            pdTemplate = this.referenceDataFormUtil.createPdTemplate(pd_fileName);
            paramValue = this.referenceDataFormUtil.createParamValue(param_fileName);
            if (this.referenceDataObject.action != 'ConfigScaleOut' && this.referenceDataObject.action != 'ConfigScaleIn') {

                this.referenceDataObject['artifact-list'].push(configTemplate,
                    pdTemplate, paramValue
                );

            } else {

                let identifiers = this.referenceDataObject['template-id-list'];
                if (identifiers) {
                    for (var x = 0; x < identifiers.length; x++) {
                        //for replacing spaces and "/" with "_"
                        let type = identifiers[x].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');
                        pd_fileName = this.referenceDataFormUtil.createArtifactNameForIdentifiers(this.referenceDataObject.action, this.referenceDataObject.scope["vnf-type"], type, '.yaml');
                        config_template_fileName = this.referenceDataFormUtil.createArtifactNameForIdentifiers(this.referenceDataObject.action, this.referenceDataObject.scope["vnf-type"], type, extension);
                        param_fileName = this.referenceDataFormUtil.createArtifactNameForIdentifiers(this.referenceDataObject.action, this.referenceDataObject.scope["vnf-type"], type, '.json');
                        configTemplate = this.referenceDataFormUtil.createConfigTemplate(config_template_fileName);
                        pdTemplate = this.referenceDataFormUtil.createPdTemplate(pd_fileName);
                        paramValue = this.referenceDataFormUtil.createParamValue(param_fileName);

                        this.referenceDataObject['artifact-list'].push(configTemplate,
                            pdTemplate, paramValue
                        );
                    }
                }

            }
        }
    }
    // used to remove the added vms for actions other than configure & scaleout
    deleteVmsforNonActions(newObj, action) {
        let configureObject = (action == 'Configure');
        let ConfigScale = (action == 'ConfigScaleOut') || (action == 'ConfigScaleIn');
        //delete VM's if selected action is not configure.
        if (!ConfigScale && !configureObject && this.tempAllData.length != 0) {
            if (ConfigScale) {
            } else {
                newObj.vm = [];
            }
        } else {
            if (ConfigScale) {
            } else {
                delete newObj['template-id-list'];
            }
        }
        return newObj
    }
    
    // used to replace the data in tempall obj and form the artifact names
    pushOrReplaceTempData(newObj, action) {
        let configTemplate
        let pdTemplate
        let paramValue
        if (newObj.action == "Configure" || newObj.action == "ConfigModify" || newObj.action == "DistributeTraffic" || newObj.action == "DistributeTrafficCheck") {
            let extension = this.referenceDataFormUtil.decideExtension(this.referenceDataObject);
            let pd_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + (newObj['vnfcIdentifier'] ? (newObj['vnfcIdentifier'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_') : "") + '0.0.1V.yaml';
            let config_template_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + (newObj['vnfcIdentifier'] ? (newObj['vnfcIdentifier'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_') : "") + '0.0.1V' + extension;
            let param_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + (newObj['vnfcIdentifier'] ? (newObj['vnfcIdentifier'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_') : "") + '0.0.1V.json';
            configTemplate = this.referenceDataFormUtil.createConfigTemplateForPushReplaceData(config_template_fileName);
            pdTemplate = this.referenceDataFormUtil.createPdTemplateForPushReplaceData(pd_fileName);
            paramValue = this.referenceDataFormUtil.createParamValueForPushReplaceData(param_fileName);
            let idValue = ""
            if (newObj.scope['vnfc-type']) {
                idValue = newObj.scope['vnfc-type']
            } else if (this.vnfcIdentifier) {
                idValue = this.vnfcIdentifier
            }

            let arr = [configTemplate, pdTemplate, paramValue]
            this.mappingEditorService.selectedObj({
                action: newObj.action,
                vnf: newObj.scope['vnf-type'] ? newObj.scope['vnf-type'] : "",
                vnfc: idValue,
                protocol: newObj['device-protocol'] ? newObj['device-protocol'] : "",
                param_artifact: paramValue['param_artifact'],
                pd_artifact: pdTemplate['pd_artifact'],
                template_artifact: configTemplate['template_artifact']
            });
        } else if (newObj.action == "ConfigScaleOut" || newObj.action == "ConfigScaleIn") {
            let extension = this.referenceDataFormUtil.decideExtension(newObj);
            let pd_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_0.0.1V' + '_' + (this.templateIdentifier ? (this.templateIdentifier.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '')) : "") + ".yaml";
            let config_template_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V_' + (this.templateIdentifier ? (this.templateIdentifier.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '') : "") + extension;
            let param_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V_' + (this.templateIdentifier ? (this.templateIdentifier.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '') : "") + '.json';
            configTemplate = this.referenceDataFormUtil.createConfigTemplateForPushReplaceData(config_template_fileName);
            pdTemplate = this.referenceDataFormUtil.createPdTemplateForPushReplaceData(pd_fileName);
            paramValue = this.referenceDataFormUtil.createParamValueForPushReplaceData(param_fileName);
            let arr = [configTemplate, pdTemplate, paramValue]
            this.mappingEditorService.selectedObj({
                action: newObj.action,
                vnf: newObj.scope['vnf-type'] ? newObj.scope['vnf-type'] : "",
                //vnfc: newObj['vnfcIdentifier'] ? newObj['vnfcIdentifier'] : "",
                protocol: newObj['device-protocol'] ? newObj['device-protocol'] : "",
                templateId: this.templateIdentifier,
                param_artifact: paramValue['param_artifact'],
                pd_artifact: pdTemplate['pd_artifact'],
                template_artifact: configTemplate['template_artifact']
            });
        }
        else {
            let extension = this.referenceDataFormUtil.decideExtension(newObj);
            let pd_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V.yaml';
            let config_template_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V' + extension;
            let param_fileName = this.referenceDataObject.action + '_' + newObj.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V.json';
            configTemplate = this.referenceDataFormUtil.createConfigTemplateForPushReplaceData(config_template_fileName);
            pdTemplate = this.referenceDataFormUtil.createPdTemplateForPushReplaceData(pd_fileName);
            paramValue = this.referenceDataFormUtil.createParamValueForPushReplaceData(param_fileName);
            let arr = [configTemplate, pdTemplate, paramValue]
            this.mappingEditorService.selectedObj({
                action: newObj.action,
                vnf: newObj.scope['vnf-type'] ? newObj.scope['vnf-type'] : "",
                protocol: newObj['device-protocol'] ? newObj['device-protocol'] : "",
                param_artifact: paramValue['param_artifact'],
                pd_artifact: pdTemplate['pd_artifact'],
                template_artifact: configTemplate['template_artifact']
            });
        }

        let actionObjIndex = this.tempAllData.findIndex(obj => {
            return obj['action'] == action;
        });
        if (actionObjIndex > -1) {
            this.tempAllData[actionObjIndex] = newObj;
            this.mappingEditorService.saveLatestAction(this.tempAllData[actionObjIndex]);
            if (newObj.action == "ConfigScaleOut" || newObj.action == "ConfigScaleIn") {
                this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier);
            }
            else {
                this.templateIdentifier = ('')
                this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier)
            }
        } else {
            if (newObj.action != '') {

                this.tempAllData.push(newObj);
                this.mappingEditorService.saveLatestAction(newObj);

                if (newObj.action == "ConfigScaleOut" || newObj.action == "ConfigScaleIn") {
                    this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier);
                }
                else {
                    this.templateIdentifier = ('')
                    this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier)
                }
            }
        }
    }
    // removes the unwanted keys added in the artifact for vnfc level actions
    deleteUnwantedKeys(newObj) {
        newObj = JSON.parse(JSON.stringify(newObj))
        delete newObj['template-id']
        delete newObj['vnfcIdentifier']
        if (newObj.action != "ConfigScaleOut" && newObj.action != "ConfigScaleIn") {
            delete newObj['template-id-list']
        }
        if (newObj.action != 'HealthCheck') {
            delete newObj['url'];
        }
        if (newObj.action != "Configure" && newObj.action != "ConfigModify" && newObj.action != "DistributeTraffic" && newObj.action != "DistributeTrafficCheck") {
            newObj.scope['vnfc-type-list'] = [];
        }
        return newObj
    }

    addAllActionObj(newObj, scopeName) {

        //Creating all action block to allow mulitple actions at once
        let allAction = {
            action: 'AllAction',
            'action-level': 'vnf',
            scope: newObj.scope,
            'artifact-list': []
        };
        let vnfType = this.referenceDataObject.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');

        allAction['artifact-list'].push({
            'artifact-name': 'reference_AllAction' + '_' + vnfType + '_' + '0.0.1V.json',
            'artifact-type': 'reference_template'
        })

        let allActionIndex = this.tempAllData.findIndex(obj => {
            return obj['action'] == 'AllAction';
        });
        if (allActionIndex > -1) {
            this.tempAllData[allActionIndex] = allAction;
        } else {
            this.tempAllData.push(allAction);
        }
    }

    resetTempData() {
      let methName= "resetTempData";
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": start.");
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": "+methName+": tempAllData:["+
          JSON.stringify(this.tempAllData)+"]");
        if (this.utilityService.checkNotNull(this.uploadedDataArray)) {

            if (this.utilityService.checkNotNull(this.tempAllData)) {
                for (var i = 0; i < this.tempAllData.length; i++) {
                    var result = false;

                    if (this.tempAllData[i].action === 'AllAction') {
                        result = true;
                    }
                    else {
                        result = this.checkIfelementExistsInArray(this.tempAllData[i].action, this.actions);
                    }
                    if (!result) {
                        this.tempAllData.splice(i, 1);
                        i = i - 1;
                    }

                }
            }
            this.addVmCapabilitiesData();
        }
    }

    trackByFn(index, item) {
        return index; // or item.id
    }
    getArtifactsOpenStack() {
        var array = []
        var vnfcFunctionCodeArrayList = [];
        var vnfcSetArray = [];
        //  var vnfcSet = new Set();
        for (var i = 0; i < this.tempAllData.length; i++) {
            if (!this.checkIfelementExistsInArray(this.tempAllData[i].action, this.actions) && (this.tempAllData[i].action != 'AllAction')) {
                var vnfcFunctionCodeArray = this.tempAllData[i]["vnfc-function-code-list"]
                // vnfcSet.add("Actions")
                /*  for (var j = 0; j < vnfcFunctionCodeArray.length; j++) {
                      vnfcSet.add(vnfcFunctionCodeArray[j])
                  }*/
                vnfcFunctionCodeArrayList.push([this.tempAllData[i].action].concat(this.tempAllData[i]["vnfc-function-code-list"]))
            }
            if (this.tempAllData[i].action === 'OpenStack Actions') {
                vnfcSetArray = this.tempAllData[i]['firstRowVmSpreadSheet']
            }
        }

        if (vnfcSetArray) {
            let vnfcSetArrayLen = vnfcSetArray.length;

            for (let i = 0; i < vnfcFunctionCodeArrayList.length; i++) {
                let element = vnfcFunctionCodeArrayList[i];
                for (let j = 1; j < element.length; j++) {
                    for (let k = j; k < vnfcSetArrayLen; k++) {
                        if (element[j] === vnfcSetArray[k]) {
                            element[j] = 'Y';
                        }
                        else {
                            element.splice(j, 0, '');
                        }
                        break;
                    }
                }
            }
            this.firstArrayElement = vnfcSetArray;
            this.remUploadedDataArray = vnfcFunctionCodeArrayList;
        }
    }

    // Common method to show validation errors
    private showValidationErrors(referenceDataObject) {
        if (this.referenceDataObject.action === '') {
            this.nService.error('Error', 'Select a valid Action');
            return;
        }
        if (this.referenceDataObject['device-protocol'] === '') {
            this.nService.error('Error', 'Select a valid Device protocol');
            return;
        }

        if ((referenceDataObject.action === 'ConfigScaleOut' 
        || referenceDataObject.action === 'ConfigScaleIn') 
        && !this.templateIdentifier) {
            this.nService.error('Error', 'Select a valid Template Identifier');
        }

        // if ((referenceDataObject.action === 'Configure' || referenceDataObject.action === 'ConfigModify') && !this.vnfcIdentifier && this.displayVnfc != 'false') {
        //     this.nService.error('Error', 'Select a valid Vnfc Type');
        //     return;
        // }
    }

    resetArtifactList(obj) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": resetArtifactList: start...");
        let vnfcTypeList = obj.scope['vnfc-type-list'];
        let vnf = this.referenceDataObject.scope['vnf-type']
        let pd_fileName
        let config_template_fileName
        let configTemplate
        let pdTemplate
        let paramValue
        let param_fileName
        obj['artifact-list'] = [];
        for (var x = 0; x < vnfcTypeList.length; x++) {
            let extension = this.referenceDataFormUtil.decideExtension(obj)
            //for replacing spaces and "/" with "_"
            let type = vnfcTypeList[x].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');
            pd_fileName = this.referenceDataObject.action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + type + '_' + '0.0.1V.yaml';
            config_template_fileName = this.referenceDataObject.action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + type + '_' + '0.0.1V' + extension;
            param_fileName = this.referenceDataObject.action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + type + '_' + '0.0.1V.json';
            configTemplate = {
                'artifact-name': 'template_' + config_template_fileName,
                'artifact-type': 'config_template'
            };
            pdTemplate = {
                'artifact-name': 'pd_' + pd_fileName,
                'artifact-type': 'parameter_definitions'
            };
            paramValue = {
                'artifact-name': 'param_' + param_fileName,
                'artifact-type': 'param_values'
            };

            this.referenceDataObject['artifact-list'].push(configTemplate,
                pdTemplate, paramValue
            );
            obj['artifact-list'].push(configTemplate,
                pdTemplate, paramValue
            );
        }
    }

    /**
     * Handles the display of VM block based on the action change
     */
    handleVMBlockDisplay() {
        switch (this.referenceDataObject.action) {
            case this.actionList.ConfigScaleOut:
            case this.actionList.ConfigScaleIn:
            case this.actionList.Configure:
            case undefined:
            case '':
                this.displayVMBlock = true;
                break;
            default:
                this.displayVMBlock = false;
        }
    }

  //.. check VNFC Type equality in Upper Selection vs entered in Sample field
  checkVnfcTypeEqual( vnfctp: string ) {
    var methName= "checkVnfcTypeEqual";
    if( this.utilityService.getTracelvl() > 0 )
      console.log(this.classNm+": "+methName+": vnfctp:["+vnfctp+"]");
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.classNm+": "+methName+": vnfcIdentifier:["+
        this.vnfcIdentifier+"]");
    if( this.utilityService.getTracelvl() > 1 )
      console.log( this.classNm+": "+methName+":  Sample[vnfc-type]:["+
        this.Sample['vnfc-type']+"]");
    if( vnfctp != null && vnfctp.length > 0 ) {
      if( this.vnfcIdentifier != null && this.vnfcIdentifier.length > 0 ) {
        console.log(
          this.classNm+": "+methName+": compare non empty VNFC Types...");
        if( vnfctp != this.vnfcIdentifier ) {
          if( this.utilityService.getTracelvl() > 0 )
            console.log( this.classNm+": "+methName+": Non-match WARNING !");
          //.. display in pop-up
          this.nService.warn( 'WARNING',
            "The specified VNFC Types don't match."+
            " Can cause discrepancy in the artifacts.", this.options );
        } else {
          if( this.utilityService.getTracelvl() > 0 )
            console.log(this.classNm+": checkVnfcTypeEqual: VNFC Types're equal.");
        };
      };
    };
  };

  //.. populating VNFC Type in Sample fields
  setVnfcTypeInSample( vnfctp: string ) {
    //clear vnfc information samples
      this.clearVnfcData();

    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.classNm+": setVnfcTypeInSample: vnfctp:["+vnfctp+"]");
    this.Sample['vnfc-type']= vnfctp;
  };

    /**
     * Procesess reference data after retrieval from appc or after a reference file has been uploaded from PC.
    */
    processReferenceDataAfterRetrieval() {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+": processReferenceDataAfterRetr: start...");
        if (this.referenceDataObject.action === 'OpenStack Actions') {
            this.deviceProtocols = ['', 'OpenStack'];
            this.buildDesignComponent.tabs = this.referencDataTab;
        } else {
            this.buildDesignComponent.tabs = this.allTabs;
        }
      if( this.utilityService.getTracelvl() > 1 )
        console.log( this.classNm+": processReferenceDataAfterRetr: done.");
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+":  vnfcIdentifier:["+this.vnfcIdentifier+"]");
      if( this.utilityService.getTracelvl() > 1 )
        console.log( this.classNm+":  oldVnfcIdentifier:["+
          this.oldVnfcIdentifier+"]");
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.classNm+":  refDataObj.scope.vnfc-type:["+
          this.referenceDataObject.scope['vnfc-type']+"]");
      this.setVnfcTypeInSample( this.vnfcIdentifier );
    }

}
