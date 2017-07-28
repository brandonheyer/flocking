import {Vector} from '2d-engine';

import ActivityBoid from './ActivityBoid';

class ClientBoid extends ActivityBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.colorScale = options.colorScale;

    this.fill = this.colorScale(this.client);
  }
}

export default ClientBoid;
