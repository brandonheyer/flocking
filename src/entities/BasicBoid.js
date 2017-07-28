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

    this.alignmentWeight = .00000001;
    this.groupAlignmentWeight = .001;

    this.cohesionWeight = .00000001;
    this.groupCohesionWeight = .05;

    this.separationWeight = .00000001;
    this.groupSeparationWeight = .01;
  }

  initializeProperties(options) {
    super.initializeProperties(options);

    this.heading = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
  }

  render(canvas) {
    super.render(canvas);

    this.groupElement = this.element.append('text')
      .text(this.group);

    this.oldRange = this.range;
    this.oldRangeVisible = this.rangeVisible = true;
  }

  update(delta) {
    super.update(delta);

    this.groupElement.text(this.group);
  }
}

export default BasicBoid;
