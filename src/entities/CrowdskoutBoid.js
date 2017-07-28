import {Vector} from '2d-engine';

import ActivityBoid from './ActivityBoid';

class CrowdskoutBoid extends ActivityBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.fill = '#00aeef';
  }
}

export default CrowdskoutBoid;
