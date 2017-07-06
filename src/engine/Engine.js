import * as d3 from 'd3';
import {Vector, Engine as BaseEngine} from '2d-engine';

var tempVector = new Vector(0, 0);

class Engine extends BaseEngine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY);

    options = options || {};

    this.rangeVisible = options.rangeVisible || false;
    this.headingVisible =  options.headingVisible || false;

    this.alignmentWeight = (options.alignmentWeight !== undefined) ? options.alignmentWeight : 1;
    this.cohesionWeight = (options.cohesionWeight !== undefined) ? options.cohesionWeight : 1;
    this.separationWeight = (options.separationWeight !== undefined) ? options.separationWeight : 1;

    this.groupAlignmentWeight = (options.groupAlignmentWeight !== undefined) ? options.groupAlignmentWeight : 1;
    this.groupCohesionWeight = (options.groupCohesionWeight !== undefined) ? options.groupCohesionWeight : 1;
    this.groupSeparationWeight = (options.groupSeparationWeight !== undefined) ? options.groupSeparationWeight : 1;
  }

  locatecloseEntities(other) {
    if (this.entity.id === other.id) {
      return;
    }

    tempVector.x = other.pos.x - this.entity.pos.x;
    tempVector.y = other.pos.y - this.entity.pos.y;

    if (tempVector.magnitudeSq() <= this.entity.rangeSq) {
      this.closeEntities.push(other);

      if (this.entity.group === other.group) {
        this.closeGroup++;
      }
    }
  }

  calculateAlignment(vector, entity, other) {
    var scale = other.weight / entity.weight;

    if (entity.group === other.group) {
      scale *= this.groupAlignmentWeight;
    }

    scale *= other.speed;

    tempVector.x = other.heading.x * scale;
    tempVector.y = other.heading.y * scale;

    vector.plusEquals(tempVector);
  }

  finalizeAlignment(vector, closeEntities) {
    var closeWeightedCount = this.closeGroup * this.groupAlignmentWeight;
    var otherCount = closeEntities.length - this.closeGroup;

    if (closeWeightedCount !== 0 || otherCount !== 0) {
      vector.divideEquals(closeWeightedCount + otherCount);
      vector.normalize();
    } else {
      vector.x = 0;
      vector.y = 0;
    }
  }

  calculateCohesion(vector, entity, other) {
    var scale = other.weight / entity.weight;

    if (entity.group === other.group) {
      scale *= this.groupCohesionWeight;
    }

    tempVector.x = other.pos.x * scale;
    tempVector.y = other.pos.y * scale;

    vector.plusEquals(tempVector);
  }

  finalizeCohesion(vector, entity, closeEntities) {
    var closeWeightedCount = this.closeGroup * this.groupCohesionWeight;
    var otherCount = closeEntities.length - this.closeGroup;

    if (closeWeightedCount !== 0 || otherCount !== 0) {
      vector.divideEquals(closeWeightedCount + otherCount);
      vector.minusEquals(entity.pos);
      vector.normalize();
    } else {
      vector.x = 0;
      vector.y = 0;
    }
  }

  calculateSeparation(vector, entity, other) {
    var scale = other.weight / entity.weight;

    if (entity.group === other.group) {
      scale *= this.groupSeparationWeight;
    }

    tempVector.x = (other.pos.x - entity.pos.x) * scale;
    tempVector.y = (other.pos.y - entity.pos.y) * scale;

    vector.plusEquals(tempVector);
  }

  finalizeSeparation(vector, closeEntities) {
    var closeWeightedCount = this.closeGroup * this.groupSeparationWeight;
    var otherCount = closeEntities.length - this.closeGroup;

    if (closeWeightedCount !== 0 || otherCount !== 0) {
      vector.divideEquals(closeWeightedCount + otherCount);
      vector.negate();
      vector.normalize();
    } else {
      vector.x = 0;
      vector.y = 0;
    }
  }

  calculate(other) {
    this.calculateAlignment(this.alignmentVector, this.entity, other);
    this.calculateCohesion(this.cohesionVector, this.entity, other);
    this.calculateSeparation(this.separationVector, this.entity, other);
  }

  processEntity(entity, index) {
    var alignmentVector = this.alignmentVectors[index];
    var cohesionVector = this.cohesionVectors[index];
    var separationVector = this.separationVectors[index];
    var closeEntities = [];
    var that = this;

    this.alignmentVector = alignmentVector;
    this.cohesionVector = cohesionVector;
    this.separationVector = separationVector;

    this.initializeVectors(alignmentVector, cohesionVector, separationVector);

    entity.range = this.globalRange || entity.range;
    entity.rangeVisible = this.rangeVisible;
    entity.headingVisible = this.headingVisible;

    entity.rangeSq = entity.range * entity.range;

    this.closeGroup = 0;
    this.entity = entity;
    this.closeEntities = closeEntities;

    this.entities.forEach(this.locatecloseEntities.bind(this));

    this.closeEntities.forEach(this.calculate.bind(this));

    if (closeEntities.length !== 0) {
      this.finalizeAlignment(alignmentVector, closeEntities);
      this.finalizeCohesion(cohesionVector, entity, closeEntities);
      this.finalizeSeparation(separationVector, closeEntities);
    }

    entity.closeCount = closeEntities.length;
  }

  finalizeElement(entity, index) {
    var alignmentVector = this.alignmentVectors[index];
    var cohesionVector = this.cohesionVectors[index];
    var separationVector = this.separationVectors[index];

    entity.heading.scalePlusEquals(this.alignmentWeight, alignmentVector);
    entity.heading.scalePlusEquals(this.cohesionWeight, cohesionVector);
    entity.heading.scalePlusEquals(this.separationWeight, separationVector);

    entity.heading.normalize();

    super.processEntity(entity, index);
  }

  process(delta) {
    var context = this;

    super.process(delta);

    this.entities.forEach(this.finalizeElement.bind(this));
  }
}

export default Engine;
