import {Point} from '2d-engine';

import BasicBoid from './BasicBoid';

class RepellantBoid extends BasicBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.fill = '#efefef';
    this.radius = 100;
    this.rangeVisible = true;
    this.range = 200;
    this.speed = .15;

    this.separationWeight = .001;
    this.groupSeparationWeight = .05;

    this.cohesionWeight = .05;
    this.groupCohesionWeight = .05;

    this.alignmentWeight = .05;
    this.groupAlignmentWeight = .001;

    this.weight = 1;
  }
}

export default RepellantBoid;
