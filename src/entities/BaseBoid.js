import {BaseEntity, Point, Vector} from '2d-engine';
import Orbiter from './Orbiter';

var tempVector = new Vector(0, 0);
var id = 0;

class BaseBoid extends BaseEntity {
  constructor(options) {
    super(options);

    this.id = ++id;

    this.initializeProperties(options);

    this.baseSpeed = this.speed;
    this.heading.normalize();
    this.rangeSq = this.range * this.range;

    this.renderMethod = options.render;

    this.alignmentVector = new Vector(0, 0);
    this.cohesionVector = new Vector(0, 0);
    this.separationVector = new Vector(0, 0);

    this.groupAlignmentVector = new Vector(0, 0);
    this.groupCohesionVector = new Vector(0, 0);
    this.groupSeparationVector = new Vector(0, 0);
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

  initializeProperties(options) {
    options = options || {};

    this.weight = options.weight || 1;
    this.group = options.group || 1;
    this.speed = options.speed || 1;
    this.radius = options.radius || 100;
    this.radiusSq = this.radius * this.radius;
    this.heading = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.range = options.range || this.xScale.domain()[1];

    this.alignmentWeight = .00001;
    this.groupAlignmentWeight = .001;

    this.cohesionWeight = .00001;
    this.groupCohesionWeight = .09;

    this.separationWeight = .00001;
    this.groupSeparationWeight = .04;

    if (options.initialize) {
      options.initialize.bind(this)();
    }
  }

  startingPosition() {
    return new Point(
      Math.floor(Math.random() * this.xScale.domain()[1]),
      Math.floor(Math.random() * this.yScale.domain()[1])
    );
  }

  locatecloseEntities(other) {
    if (this.id === other.id || other instanceof Orbiter) {
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

  update(delta) {
    super.update(delta);

    this.element
      .attr('transform', 'translate(' + this.xScale(this.pos.x) + ',' + this.yScale(this.pos.y) + ')');
  }

  updateElements() {
    this.boidElement = this.element.select('.boid');
    this.rangElement = this.element.select('.boid-range');
    this.headingElement = this.element.select('line');
  }

  updateStyles() {
    if (this.renderMethod) {
      this.renderMethod();
    }

    this.boidElement
      .attr('r', this.xScale(this.radius))
      .attr('fill', this.fill)
      .attr('class', 'boid');

    if (this.stroke) {
      this.boidElement.attr('stroke', this.stroke).attr('stroke-weight', 3).attr('fill', 'none');
    }
  }

  process() {
    this.closeEntities.forEach(
      this.calculate.bind(this)
    );

    if (this.closeGroup !== 0) {
      this.finalizeAlignment(this.groupAlignmentVector, this.closeGroup, this.groupAlignmentWeight);
      this.finalizeCohesion(this.groupCohesionVector, this.closeGroup, this.groupCohesionWeight);
      this.finalizeSeparation(this.groupSeparationVector, this.closeGroup, this.groupSeparationWeight);
    }

    if (this.nonGroup !== 0) {
      this.finalizeAlignment(this.alignmentVector, this.nonGroup, this.alignmentWeight);
      this.finalizeCohesion(this.cohesionVector, this.nonGroup, this.cohesionWeight);
      this.finalizeSeparation(this.separationVector, this.nonGroup, this.separationWeight);
    }
  }

  finalize() {
    this.alignmentVector.normalize();
    this.cohesionVector.normalize();
    this.separationVector.normalize();

    this.groupAlignmentVector.normalize();
    this.groupCohesionVector.normalize();
    this.groupSeparationVector.normalize();

    this.heading.scalePlusEquals(this.alignmentWeight, this.alignmentVector);
    this.heading.scalePlusEquals(this.cohesionWeight, this.cohesionVector);
    this.heading.scalePlusEquals(this.separationWeight, this.separationVector);

    this.heading.scalePlusEquals(this.groupAlignmentWeight, this.groupAlignmentVector);
    this.heading.scalePlusEquals(this.groupCohesionWeight, this.groupCohesionVector);
    this.heading.scalePlusEquals(this.groupSeparationWeight, this.groupSeparationVector);

    this.heading.normalize();
  }

  destroy() {
    this.element.remove();
    this.element = undefined;
    this.boidElement = undefined;
    this.headingElement = undefined;
    this.rangeElement = undefined;
  }

  render(canvas) {
    var el = this.element = canvas.append('g');

    this.boidElement = el.append('circle');

    this.updateStyles();
  }
}

export default BaseBoid;
