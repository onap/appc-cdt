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

ECOMP is a trademark and service mark of AT&T Intellectual Property.
============LICENSE_END============================================ */
import { VmFilteringPipe } from './vm-filtering.pipe';

describe('VmFilteringPipe', () => {
    it('create an instance', () => {
        const pipe = new VmFilteringPipe();
        expect(pipe).toBeTruthy();
    });

    it('should return empty list', () => {
        const pipe = new VmFilteringPipe();
        expect(pipe.transform([{ 'template-id': '321' }], 'ConfigScaleOut', '234', {})).toEqual([]);
    });

    it('should return original list', () => {
        const pipe = new VmFilteringPipe();
        expect(pipe.transform([{ 'template-id': '321' }], 'Config', '234', {})).toEqual([{ 'template-id': '321' }]);
    });
});
