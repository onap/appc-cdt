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

============LICENSE_END============================================ */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'vmFiltering', pure: false })
export class VmFilteringPipe implements PipeTransform {

    transform(value: any, action: any, templateId, newVnfc): any {
        let filterValue
        if(action == 'ConfigScaleOut' || action == 'ConfigScaleIn'){
            filterValue= templateId
        } else if(action == 'Configure' || action == 'ConfigModify' || action == 'DistributeTraffic' || action == 'DistributeTrafficCheck'){
            filterValue= newVnfc
        }
        if (action == 'ConfigScaleOut' || action == 'ConfigScaleIn' ) {
            let x = value.filter(obj => {
                //return value
                return obj['template-id'] == filterValue;
            });


            return x;
        } else if( action == 'Configure' || action == 'ConfigModify' || action == 'DistributeTraffic' || action == 'DistributeTrafficCheck'){
            let x = value.filter(obj => {
                //return value
                return ( obj['vnfcType-id'] == filterValue || obj['vnfcType-id'] == undefined);
            });


            return x;
        } else {
            return value;

        }
    }

}
