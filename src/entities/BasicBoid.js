import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

class BasicBoid extends BaseBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.heading = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
  }
}

export default BasicBoid;
