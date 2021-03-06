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

import { TestBed } from '@angular/core/testing';
import { DropdownNotClosableZone } from './dropdownnotclosablezone';
import { ElementRef } from '@angular/core';

class MockElementRef implements ElementRef {
    nativeElement = {};
  }

describe('DropdownNotClosableZone', () => {
    let directive;
    beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [DropdownNotClosableZone],
          providers: [{ provide: ElementRef, useClass: new MockElementRef() }]
        });
    });

    beforeEach(() => {
        directive = new DropdownNotClosableZone(new ElementRef('<dropdown-not-closable-zone></dropdown-not-closable-zone>'));
    });

    it('should create an instance', () => {
 
        expect(directive).toBeTruthy();
    });

     it('should test contain method', () => {
         let el: HTMLElement;
         let dropdownNotClosabledZone = false;

         
     });

     it('should test contains method to return false', ()=>{
        directive.dropdownNotClosabledZone = false;
        let el: HTMLElement;
        expect(directive.contains(el)).toBe(false);
     });

});
