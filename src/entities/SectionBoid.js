import {Point} from '2d-engine';

import BaseBoid from './BaseBoid';

class SectionBoid extends BaseBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.isSection = true;

    this.radius = 75;
    this.pos.x = this.xMax / 4 + (this.xMax / 4 * 2 * ((this.group - 1) % 2));
    this.pos.y = this.yMax / 4 + (this.yMax / 4 * 2 * Math.floor((this.group - 1) / 2));

    switch (options.group) {
      case 1:
        this.fill = '#73BECC';
        break;

      case 2:
        this.fill = '#B26486';
        break;

      case 3:
        this.fill = '#FFF9C2';
        break;

      case 4:
        this.fill = '#B88CFF';
        break;
    }
  }
}

export default SectionBoid;
