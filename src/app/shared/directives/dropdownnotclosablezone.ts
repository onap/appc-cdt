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


import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
    selector: '[dropdown-not-closable-zone]'
})
export class DropdownNotClosableZone {

    @Input('dropdown-not-closable-zone')
    dropdownNotClosabledZone: boolean;

    constructor(private elementRef: ElementRef) {
    }

    contains(element: HTMLElement) {
        if (this.dropdownNotClosabledZone === false)
            return false;

        const thisElement: HTMLElement = this.elementRef.nativeElement;
        return thisElement.contains(element);
    }
}