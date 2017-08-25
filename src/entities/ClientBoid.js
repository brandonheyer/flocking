import {Vector} from '2d-engine';

import ActivityBoid from './ActivityBoid';

class ClientBoid extends ActivityBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.colorScale = options.colorScale;

    this.fill = this.colorScale(this.client);

    if (this.module === 'unsubscribe') {
      this.fill = '#a0a0a0';
    }

    if (!this.client) {
      this.fill = '#a0a0a0';
    }
  }
}

export default ClientBoid;
