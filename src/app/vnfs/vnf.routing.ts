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

import { GoldenConfigurationHolderComponent, } from './build-artifacts/template-holder/template-holder.component';
import { MyvnfsComponent } from './myvnfs/myvnfs.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferenceDataformComponent } from './build-artifacts/reference-dataform/reference-dataform.component';
import { GoldenConfigurationComponent } from './build-artifacts/template-holder/template-configuration/template-configuration.component';
import { GoldenConfigurationMappingComponent } from './build-artifacts/template-holder/param-name-value/param-name-value.component';
import { ParameterComponent } from './build-artifacts/parameter-definitions/parameter.component';
import { ParameterHolderComponent } from './build-artifacts/parameter-holder/parameter-holder.component';
import { VnfsComponent } from './vnfs/vnfs.component';
import { BuildDesignComponent } from './build-artifacts/build-artifacts.component';
import { userloginFormComponent } from './userlogin-form/userlogin-form.component';
import { LoginGuardService } from './LoginGuardService/Login-guard-service';
import { ReferenceDataHolderComponent } from './build-artifacts/reference-data-holder/reference-data-holder.component';


const routes: Routes = [
    {
        path: '',
        component: VnfsComponent,
        children: [
            {
                path: '',
                component: userloginFormComponent,
                canActivate: [LoginGuardService],

            }, {
                path: 'list',
                component: MyvnfsComponent

            },

            {
                path: 'design',
                component: BuildDesignComponent,
                children: [
                    {
                        path: 'references',
                        component: ReferenceDataHolderComponent,
                        children: [
                            {
                                path: '',
                                component: ReferenceDataformComponent
                            }
                        ]
                    }, {
                        path: 'templates',
                        component: GoldenConfigurationHolderComponent,
                        //   canActivate:[GCAuthGuardService],
                        children: [
                            {
                                path: 'configureTemplate',
                                component: GoldenConfigurationComponent
                            },
                            {
                                path: 'myTemplates',
                                component: GoldenConfigurationMappingComponent
                            }
                            , {
                                path: '',
                                redirectTo: 'myTemplates',
                                pathMatch: 'full'
                            }
                        ]
                    }, {
                        path: 'parameterDefinitions',
                        component: ParameterHolderComponent,
                        children: [
                            {
                                path: 'create',
                                component: ParameterComponent
                            },
                            {
                                path: 'update',
                                component: ParameterComponent
                            },
                            {
                                path: 'session',
                                component: ParameterComponent
                            },
                            {
                                path: 'key',
                                component: ParameterComponent
                            },
                            {
                                path: 'clearparams',
                                component: ParameterComponent
                            },
                            {
                                path: '',
                                redirectTo: 'create',
                                pathMatch: 'full'
                            }


                        ]
                    },
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VnfRoutingModule {
}