import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

class BasicBoid extends BaseBoid {
  constructor(options) {
    super(options);

    this.alignmentVector = new Vector(0, 0);
    this.cohesionVector = new Vector(0, 0);
    this.separationVector = new Vector(0, 0);

    this.groupAlignmentVector = new Vector(0, 0);
    this.groupCohesionVector = new Vector(0, 0);
    this.groupSeparationVector = new Vector(0, 0);
  }

  initializeProperties(options) {
    super.initializeProperties(options);

    this.alignmentWeight = .00001;
    this.groupAlignmentWeight = .001;

    this.cohesionWeight = .00001;
    this.groupCohesionWeight = .09;

    this.separationWeight = .00001;
    this.groupSeparationWeight = .05;

    this.heading = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
  }

  render(canvas) {
    super.render(canvas);

    this.oldRange = this.range;
    this.oldRangeVisible = this.rangeVisible = true;
  }
}

export default BasicBoid;
