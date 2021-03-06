/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

Copyright (C) 2018 IBM.
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
import {OrderBy} from './order-by.pipe';

describe('OrderByPipe', () => {
    it('create an instance', () => {
        const pipe = new OrderBy();
        expect(pipe).toBeTruthy();
    });

     it('ascending sorting', () => {
        const pipe = new OrderBy();

        let data =[
            {'vnf-type':'vnf1','vnfc-type':'vnfc1','artifact-name':'artf1'},
            {'vnf-type':'vnf2','vnfc-type':'vnfc2','artifact-name':'artf2'}
          
        ]
        expect(pipe.transform(data,"vnf-type",true)[0]['vnf-type']).toBe('vnf1');
        
    });
     it('descending sorting', () => {
        const pipe = new OrderBy();

        let data =[
            {'vnf-type':'vnf1','vnfc-type':'vnfc1','artifact-name':'artf1'},
            {'vnf-type':'vnf2','vnfc-type':'vnfc2','artifact-name':'artf2'}
          
        ]
        expect(pipe.transform(data,"vnf-type",false)[0]['vnf-type']).toBe('vnf2');
    });
     it('descending sorting', () => {
        const pipe = new OrderBy();

        let data =[
            {'vnf-type':undefined,'vnfc-type':'vnfc1','artifact-name':'artf1'},
            {'vnf-type':'vnf2','vnfc-type':'vnfc2','artifact-name':'artf2'}
          
        ]
        expect(pipe.transform(data,"vnf-type",false)[0]['vnf-type']).toBe('vnf2');
    });

    it('should return whole array when orderby paramater is not set', () => {
        const pipe = new OrderBy();

        let data =[
            {'vnf-type':undefined,'vnfc-type':'vnfc1','artifact-name':'artf1'},
            {'vnf-type':'vnf2','vnfc-type':'vnfc2','artifact-name':'artf2'}
          
        ]
        expect(pipe.transform(data,undefined,false).length).toBe(2);
    });

    it('should test orderByComparator when orderby parmeter is number ', () => {
        const pipe = new OrderBy();

        let data =[
            {'vnf-type': '311','vnfc-type':'vnfc1','artifact-name':'artf1'},
            {'vnf-type':'316','vnfc-type':'vnfc2','artifact-name':'artf2'}
        ]
        pipe.transform(data,"vnf-type",false);
    });
});
