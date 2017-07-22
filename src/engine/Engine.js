import * as d3 from 'd3';
import {Vector, Engine as BaseEngine} from '2d-engine';

var tempVector = new Vector(0, 0);

class Engine extends BaseEngine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY);

    options = options || {};

    this.alignmentVectors = [];
    this.cohesionVectors = [];
    this.separationVectors = [];

    this.alignmentWeight = 1;
    this.cohesionWeight = 1;
    this.separationWeight = 1;

    this.groupAlignmentWeight = 1;
    this.groupCohesionWeight = 1;
    this.groupSeparationWeight = 1;

    this.rangeVisible = options.rangeVisible || false;
    this.headingVisible =  options.headingVisible || false;

    this.alignmentWeight = (options.alignmentWeight !== undefined) ? options.alignmentWeight : 1;
    this.cohesionWeight = (options.cohesionWeight !== undefined) ? options.cohesionWeight : 1;
    this.separationWeight = (options.separationWeight !== undefined) ? options.separationWeight : 1;

    this.groupAlignmentWeight = (options.groupAlignmentWeight !== undefined) ? options.groupAlignmentWeight : 1;
    this.groupCohesionWeight = (options.groupCohesionWeight !== undefined) ? options.groupCohesionWeight : 1;
    this.groupSeparationWeight = (options.groupSeparationWeight !== undefined) ? options.groupSeparationWeight : 1;
  }

  addEntity(entity) {
    super.addEntity(entity);

    this.alignmentVectors.push(new Vector(0, 0));
    this.cohesionVectors.push(new Vector(0, 0));
    this.separationVectors.push(new Vector(0, 0));
  }

  removeEntitAt(index) {
    super.removeEntitAt(index);

    this.alignmentVectors.splice(index, 1);
    this.cohesionVectors.splice(index, 1);
    this.separationVectors.splice(index, 1);
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

  calculateAlignment(vector, entity, other, scale) {
    if (entity.group === other.group) {
      scale *= this.groupAlignmentWeight;
    }

    scale *= other.speed;

    tempVector.x = other.heading.x * scale;
    tempVector.y = other.heading.y * scale;

    vector.plusEquals(tempVector);
  }

  finalizeAlignment(vector, closeEntities) {
    vector.divideEquals(this.entityDiff + (this.closeGroup * this.groupAlignmentWeight) || 1);
  }

  calculateCohesion(vector, entity, other, scale) {
    if (entity.group === other.group) {
      scale *= this.groupCohesionWeight;
    }

    tempVector.x = other.pos.x * scale;
    tempVector.y = other.pos.y * scale;

    vector.plusEquals(tempVector);
  }

  finalizeCohesion(vector, entity, closeEntities) {
    vector.divideEquals(this.entityDiff + (this.closeGroup * this.groupCohesionWeight) || 1);
    vector.minusEquals(entity.pos);
  }

  calculateSeparation(vector, entity, other, scale) {
    if (entity.group === other.group) {
      scale *= this.groupSeparationWeight;
    }

    tempVector.x = (other.pos.x - entity.pos.x) * scale;
    tempVector.y = (other.pos.y - entity.pos.y) * scale;

    vector.plusEquals(tempVector);
  }

  finalizeSeparation(vector, closeEntities) {
    vector.divideEquals(-1 * (this.entityDiff + (this.closeGroup * this.groupSeparationWeight) || 1));
  }

  calculate(other) {
    var scale = this.entity.weight / other.weight;

    this.calculateAlignment(this.alignmentVector, this.entity, other, scale);
    this.calculateCohesion(this.cohesionVector, this.entity, other, scale);
    this.calculateSeparation(this.separationVector, this.entity, other, scale);
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

    entity.closeCount = closeEntities.length;

    this.closeEntities.forEach(this.calculate.bind(this));

    if (closeEntities.length !== 0) {
      this.entityDiff = (closeEntities.length - this.closeGroup);

      this.finalizeAlignment(alignmentVector, closeEntities);
      this.finalizeCohesion(cohesionVector, entity, closeEntities);
      this.finalizeSeparation(separationVector, closeEntities);
    }
  }

  initializeVectors(a, c, s) {
    a.set(0, 0);
    c.set(0, 0);
    s.set(0, 0);
  }

  finalizeElement(entity, index) {
    var alignmentVector = this.alignmentVectors[index];
    var cohesionVector = this.cohesionVectors[index];
    var separationVector = this.separationVectors[index];

    alignmentVector.normalize();
    cohesionVector.normalize();
    separationVector.normalize();

    entity.heading.scalePlusEquals(this.alignmentWeight, alignmentVector);
    entity.heading.scalePlusEquals(this.cohesionWeight, cohesionVector);
    entity.heading.scalePlusEquals(this.separationWeight, separationVector);

    entity.heading.normalize();

    super.processEntity(entity, index);
  }

  preProcessEntity(d3Element, entity, index) {
    if (!entity.element || entity.element._groups[0][0] !== d3Element) {
      entity.element = d3.select(d3Element);
      entity.updateElements();
    }

    this.processEntity(entity, index);
  }

  process(delta) {
    var context = this;

    super.process(delta);

    this.entities.forEach(this.finalizeElement.bind(this));
  }
}

export default Engine;
