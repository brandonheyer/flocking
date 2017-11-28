import {Point} from '2d-engine';

import BaseBoid from './BaseBoid';

class SectionBoid extends BaseBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.isSection = true;

    this.radius = 75;
    this.fill = '#888888';
    this.pos.x = this.xMax / 4 + (this.xMax / 4 * 2 * ((this.group - 1) % 2));
    this.pos.y = this.yMax / 4 + (this.yMax / 4 * 2 * Math.floor((this.group - 1) / 2));
  }
}

export default SectionBoid;
