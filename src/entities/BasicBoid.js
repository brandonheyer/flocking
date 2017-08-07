import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

var tempVector = new Vector(0, 0);

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

  locatecloseEntities(other) {
    if (this.id === other.id) {
      return;
    }

    tempVector.x = other.pos.x - this.pos.x;
    tempVector.y = other.pos.y - this.pos.y;

    if (tempVector.magnitudeSq() <= this.rangeSq) {
      this.closeEntities.push(other);

      if (this.group === other.group) {
        this.closeGroup++;
      } else {
        this.nonGroup++;
      }
    }
  }

  calculate(other) {
    this.calculateAlignment(other);
    this.calculateCohesion(other);
    this.calculateSeparation(other);
  }

  calculateAlignment(other) {
    tempVector.x = other.heading.x * other.speed;
    tempVector.y = other.heading.y * other.speed;

    if (this.group === other.group) {
      this.groupAlignmentVector.plusEquals(tempVector);
    } else {
      this.alignmentVector.plusEquals(tempVector);
    }
  }

  finalizeAlignment(vector, closeEntities) {
    if (closeEntities) {
      vector.divideEquals(closeEntities);
    } else {
    //vector.x = entity.heading.x;
    //vector.y = entity.heading.y;
    }
  }

  calculateCohesion(other) {
    tempVector.x = other.pos.x;
    tempVector.y = other.pos.y;

    if (this.group === other.group) {
      this.groupCohesionVector.plusEquals(tempVector);
    } else {
      this.cohesionVector.plusEquals(tempVector);
    }
  }

  finalizeCohesion(vector, closeEntities) {
    if (closeEntities) {
      vector.divideEquals(closeEntities);
      vector.minusEquals(this.pos);
    } else {

    }
  }

  calculateSeparation(other) {
    var tempMagnitude;

    tempVector.x = (other.pos.x - this.pos.x);
    tempVector.y = (other.pos.y - this.pos.y);

    tempMagnitude = tempVector.magnitudeSq();

    if (this.group === other.group) {
      this.groupSeparationVector.scalePlusEquals(1 / tempMagnitude, tempVector);
    } else {
      this.separationVector.scalePlusEquals(1 / tempMagnitude, tempVector);
    }
  }

  finalizeSeparation(vector, closeEntities) {
    if (closeEntities) {
      vector.divideEquals(-1 * closeEntities);
    } else {

    }
  }

  initializeVectors() {
    this.closeEntities = [];
    
    this.alignmentVector.set(0, 0);
    this.groupAlignmentVector.set(0, 0);
    this.cohesionVector.set(0, 0);
    this.groupCohesionVector.set(0, 0);
    this.separationVector.set(0, 0);
    this.groupSeparationVector.set(0, 0);

    this.closeGroup = 0;
    this.nonGroup = 0;
  }
}

export default BasicBoid;
