import {BaseEntity, Point, Vector} from '2d-engine';

var tempVector = new Vector(0, 0);
var id = 0;

class BaseBoid extends BaseEntity {
  constructor(options) {
    super(options);

    this.id = ++id;

    this.initializeProperties(options);

    this.heading = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.heading.normalize();

    this.weight = 1;

    this.baseSpeed = this.speed;
    this.oldRadius = this.radius;
    this.oldGroup = this.group;

    this.alignmentVector = new Vector(0, 0);
    this.cohesionVector = new Vector(0, 0);
    this.separationVector = new Vector(0, 0);

    this.groupAlignmentVector = new Vector(0, 0);
    this.groupCohesionVector = new Vector(0, 0);
    this.groupSeparationVector = new Vector(0, 0);
  }

  startingPosition() {
    return new Point(
      Math.floor(Math.random() * this.xScale.domain()[1]),
      Math.floor(Math.random() * this.yScale.domain()[1])
    );
  }

  initializeProperties(options) {
    options = options || {};

    this.range = options.range || this.xScale.domain()[1];
    this.radius = options.radius;
    this.fill = options.fill;
    this.speed = options.speed || 0;
    this.group = options.group || 0;
    this.renderMethod = options.render;

    this.alignmentWeight = options.alignmentWeight || 0;
    this.groupAlignmentWeight = options.groupAlignmentWeight || 0;

    this.cohesionWeight = options.cohesionWeight || 0;
    this.groupCohesionWeight = options.groupCohesionWeight || 0;

    this.separationWeight = options.separationWeight || 0;
    this.groupSeparationWeight = options.groupSeparationWeight || 0;

    this.xMax = this.xScale.domain()[1];
    this.yMax = this.yScale.domain()[1];
    this.rangeSq = this.range * this.range;

    if (options.initialize) {
      options.initialize.bind(this)();
    }
  }

  initializeVectors(length) {
    this.closeEntities = [];
    this.closeEntities.length = length;

    this.alignmentVector.set(0, 0);
    this.groupAlignmentVector.set(0, 0);
    this.cohesionVector.set(0, 0);
    this.groupCohesionVector.set(0, 0);
    this.separationVector.set(0, 0);
    this.groupSeparationVector.set(0, 0);

    this.closeGroup = 0;
    this.nonGroup = 0;
  }

  closeCheck(other) {
    return other.id !== this.id && tempVector.magnitudeSq() <= this.rangeSq;
  }

  setTempVector(other) {
    tempVector.x = other.pos.x - this.pos.x;
    tempVector.y = other.pos.y - this.pos.y;
  }

  locatecloseEntities(other) {
    this.setTempVector(other);

    if (this.closeCheck(other)) {
      this.closeEntities[this.closeGroup + this.nonGroup] = other;

      if (this.group === other.group) {
        this.closeGroup = this.closeGroup + 1;
      } else {
        this.nonGroup = this.nonGroup + 1;
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
    vector.divideEquals(closeEntities);
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
    vector.x = (vector.x / closeEntities) - this.pos.x;
    vector.y = (vector.y / closeEntities) - this.pos.y;
  }

  calculateSeparation(other) {
    var tempMagnitude;

    tempVector.x = other.pos.x - this.pos.x;
    tempVector.y = other.pos.y - this.pos.y;

    tempMagnitude = tempVector.magnitude();

    if (tempMagnitude === 0) {
      return;
    }

    tempVector.x *= -1 / tempMagnitude;
    tempVector.y *= -1 / tempMagnitude;

    if (this.group === other.group) {
      // this.groupSeparationVector.plusEquals(tempVector);
      this.groupSeparationVector.plusEquals(tempVector);
    } else {
      // this.separationVector.plusEquals(tempVector);
      this.separationVector.plusEquals(tempVector);
    }
  }

  finalizeSeparation(vector, closeEntities) {

  }

  process() {
    this.closeEntities.forEach(
      this.calculate.bind(this)
    );

    if (this.closeGroup !== 0) {
      this.finalizeAlignment(this.groupAlignmentVector, this.closeGroup);
      this.finalizeCohesion(this.groupCohesionVector, this.closeGroup);
      this.finalizeSeparation(this.groupSeparationVector, this.closeGroup);
    }

    if (this.nonGroup !== 0) {
      this.finalizeAlignment(this.alignmentVector, this.nonGroup);
      this.finalizeCohesion(this.cohesionVector, this.nonGroup);
      this.finalizeSeparation(this.separationVector, this.nonGroup);
    }
  }

  finalize() {
    if (this.nonGroup !== 0) {
      this.alignmentVector.normalize();
      this.cohesionVector.normalize();
      this.separationVector.normalize();

      this.heading.scalePlusEquals(this.alignmentWeight, this.alignmentVector);
      this.heading.scalePlusEquals(this.cohesionWeight, this.cohesionVector);
      this.heading.scalePlusEquals(this.separationWeight, this.separationVector);
    }

    if (this.closeGroup !== 0) {
      this.groupAlignmentVector.normalize();
      this.groupCohesionVector.normalize();
      this.groupSeparationVector.normalize();

      this.heading.scalePlusEquals(this.groupAlignmentWeight, this.groupAlignmentVector);
      this.heading.scalePlusEquals(this.groupCohesionWeight, this.groupCohesionVector);
      this.heading.scalePlusEquals(this.groupSeparationWeight, this.groupSeparationVector);
    }

    this.heading.normalize();
  }

  update(delta) {
    var transformVal;

    // super.update(delta);

    this.pos.scalePlusEquals(this.speed * delta, this.heading);
    this.pos.x = (this.pos.x + this.xMax) % this.xMax
    this.pos.y = (this.pos.y + this.yMax) % this.yMax;

    transformVal = 'translate(' + this.xScale(this.pos.x) + ',' + this.yScale(this.pos.y) + ')';

    if (this.range !== this.oldRange && this.rangeElement) {
      this.rangeElement
        .attr('r', this.xScale(this.range));

      this.oldRange = this.range;
    }

    if (this.radius !== this.oldRadius) {
      this.updateStyles();
      this.oldRadius = this.radius;
    }

    if (this.group !== this.oldGroup) {
      this.updateStyles();
      this.oldGroup = this.group;
    }

    if (this.rangeVisible !== this.oldRangeVisible) {
      if (this.rangeVisible) {
        this.renderRange();
      } else if (this.rangeElement) {
        this.rangeElement.remove();
        this.rangeElement = undefined;
      }

      this.oldRangeVisible = this.rangeVisible;
    }

    this.element
      .attr('transform', transformVal);
  }

  updateElements() {
    this.boidElement = this.element.select('.boid');
    this.rangeElement = this.element.select('.boid-range');
  }

  renderRange() {
    this.rangeElement = this.element.append('circle')
      .attr('r', this.xScale(this.range))
      .attr('fill', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke', 'rgba(255, 255, 255, 0.5)')
      .attr('class', 'boid-range');

    this.oldRange = this.range;
    this.oldRangeVisible = this.rangeVisible = true;
  }

  updateStyles() {
    if (this.renderMethod) {
      this.renderMethod();
    }

    this.boidElement
      .attr('r', this.xScale(this.radius))
      .attr('fill', this.fill || '#000000')
      .attr('class', 'boid');
  }

  destroy() {
    this.element.remove();
    this.element = undefined;
    this.boidElement = undefined;
    this.rangeElement = undefined;
  }

  render(canvas) {
    if (!this.element) {
      this.element = canvas.append('g');
      this.boidElement = this.element.append('circle');

      this.updateStyles();
    }

    if (this.rangeVisible) {
      this.renderRange();
    }
  }
}

export default BaseBoid;
