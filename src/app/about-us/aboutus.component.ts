/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

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
============LICENSE_END============================================
*/


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/observable';
import { NotificationsService } from 'angular2-notifications';
import { saveAs } from 'file-saver';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from '../shared/confirmModal/confirm.component';
import { appConstants } from '../../constants/app-constants';

@Component({
    selector: 'app-help',
    templateUrl: './aboutus.component.html',
    styleUrls: ['./aboutus.component.css']
})
export class AboutUsComponent implements OnInit, OnDestroy {

    public releaseName: any;
    public versionNo: any;
    public contactUsMail: any;
    public data: any;
    closeResult: string;
    versionLogSubscription: Subscription;
    options = {
        timeOut: 1000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    };

    constructor(private http: Http, private modalService: NgbModal, private dialogService: DialogService, private notificationsService: NotificationsService) {
    }

    ngOnInit() {
        this.versionNo = require('./appVersion.json').versionNo;
        this.releaseName = require('./appVersion.json').releaseName;
        this.contactUsMail = require('../cdt.application.properties.json').CONTACT_US;
    }

    ngOnDestroy() {
        if (this.versionLogSubscription) {
            this.versionLogSubscription.unsubscribe();
        }
    }

    versionLogFile(): Observable<any> {
        return this.http.get('app/about-us/versionLog.txt');
    }

    open(content) {
        this.versionLogSubscription = this.versionLogFile()
            .subscribe((res) => {
                this.data = res.text();
                this.dialogService.addDialog(ConfirmComponent, {
                    title: 'VERSION CHANGE LOG',
                    message: this.data,
                    cancelButtonText: 'CLOSE',
                    confirmButtonText: 'DOWNLOAD'
                }).subscribe(isConfirmed => {
                    if (isConfirmed) {
                        this.downloadLogFile()
                    } else {
                        // do nothing
                    }
                });

            },
        (error)=>{
            this.notificationsService.error(appConstants.errors.error, 'unable to fetch change log details');
        });
    }

    downloadLogFile() {
        var blob = new Blob([this.data], {
            type: 'text/plain;charset=utf-8'
        });
        saveAs(blob, 'versionLog.txt');
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

}
