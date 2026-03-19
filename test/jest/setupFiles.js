// See https://github.com/facebook/jest/issues/335#issuecomment-703691592
import './__mock__';

import 'regenerator-runtime/runtime';
global.IS_REACT_ACT_ENVIRONMENT = true; // React 18: enable act() support