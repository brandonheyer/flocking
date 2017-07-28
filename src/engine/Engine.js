import _ from 'lodash';
import * as d3 from 'd3';
import {Vector, Engine as BaseEngine} from '2d-engine';

import BasicBoid from '../entities/BasicBoid';

var tempVector = new Vector(0, 0);

class Engine extends BaseEngine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY);

    options = options || {};

    this.rangeVisible = true;
    this.headingVisible =  options.headingVisible || false;
  }

  addEntity(entity) {
    super.addEntity(entity);
  }

  removeEntityById(id) {
    if (this.entityLookup[id]) {
      this.removeEntityAt(this.entities.indexOf(this.entityLookup[id]));
    }
  }

  removeEntityAt(index) {
    super.removeEntityAt(index);
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
      } else {
        this.nonGroup++;
      }
    }
  }

  calculateAlignment(vector, entity, other) {
    tempVector.x = other.heading.x * other.speed;
    tempVector.y = other.heading.y * other.speed;

    if (entity.group === other.group) {
      this.groupAlignmentVector.plusEquals(tempVector);
    } else {
      vector.plusEquals(tempVector);
    }
  }

  finalizeAlignment(entity, vector, closeEntities) {
    if (closeEntities) {
      vector.divideEquals(closeEntities);
    } else {
    //vector.x = entity.heading.x;
    //vector.y = entity.heading.y;
    }
  }

  calculateCohesion(vector, entity, other) {
    tempVector.x = other.pos.x;
    tempVector.y = other.pos.y;

    if (entity.group === other.group) {
      this.groupCohesionVector.plusEquals(tempVector);
    } else {
      vector.plusEquals(tempVector);
    }
  }

  finalizeCohesion(entity, vector, closeEntities) {
    if (closeEntities) {
      vector.divideEquals(closeEntities);
      vector.minusEquals(entity.pos);
    } else {

    }
  }

  calculateSeparation(vector, entity, other) {
    tempVector.x = (other.pos.x - entity.pos.x);
    tempVector.y = (other.pos.y - entity.pos.y);

    if (entity.group === other.group) {
      this.groupSeparationVector.plusEquals(tempVector);
    } else {
      vector.plusEquals(tempVector);
    }
  }

  finalizeSeparation(entity, vector, closeEntities) {
    if (closeEntities) {
      vector.divideEquals(-1 * closeEntities);
    } else {
      //vector.x = entity.heading.x;
      //vector.y = entity.heading.y;
    }
  }

  calculate(other) {
    this.calculateAlignment(this.alignmentVector, this.entity, other);
    this.calculateCohesion(this.cohesionVector, this.entity, other);
    this.calculateSeparation(this.separationVector, this.entity, other);
  }

  processEntity(entity, index) {
    var alignmentVector = entity.alignmentVector;
    var cohesionVector = entity.cohesionVector;
    var separationVector = entity.separationVector;
    var groupAlignmentVector = entity.groupAlignmentVector;
    var groupCohesionVector = entity.groupCohesionVector;
    var groupSeparationVector = entity.groupSeparationVector;

    var closeEntities = [];
    var that = this;

    this.alignmentVector = alignmentVector;
    this.cohesionVector = cohesionVector;
    this.separationVector = separationVector;
    this.groupAlignmentVector = groupAlignmentVector;
    this.groupCohesionVector = groupCohesionVector;
    this.groupSeparationVector = groupSeparationVector;

    this.initializeVectors();

    entity.range = this.globalRange || entity.range;
    entity.rangeVisible = this.rangeVisible;
    entity.headingVisible = this.headingVisible;

    entity.rangeSq = entity.range * entity.range;

    this.closeGroup = 0;
    this.nonGroup = 0;

    this.entity = entity;
    this.closeEntities = closeEntities;

    this.entities.forEach(this.locatecloseEntities.bind(this));

    entity.closeCount = closeEntities.length;

    this.closeEntities.forEach(this.calculate.bind(this));

    if (this.closeGroup.length !== 0) {
      this.finalizeAlignment(entity, groupAlignmentVector, this.closeGroup, entity.groupAlignmentWeight);
      this.finalizeCohesion(entity, groupCohesionVector, this.closeGroup, entity.groupCohesionWeight);
      this.finalizeSeparation(entity, groupSeparationVector, this.closeGroup, entity.groupSeparationWeight);
    }

    if (this.nonGroup.length !== 0) {
      this.finalizeAlignment(entity, alignmentVector, this.nonGroup, entity.alignmentWeight);
      this.finalizeCohesion(entity, cohesionVector, this.nonGroup, entity.cohesionWeight);
      this.finalizeSeparation(entity, separationVector, this.nonGroup, entity.separationWeight);
    }
  }

  initializeVectors() {
    this.alignmentVector.set(0, 0);
    this.groupAlignmentVector.set(0, 0);
    this.cohesionVector.set(0, 0);
    this.groupCohesionVector.set(0, 0);
    this.separationVector.set(0, 0);
    this.groupSeparationVector.set(0, 0);
  }

  finalizeElement(entity, index) {
    var alignmentVector = entity.alignmentVector;
    var cohesionVector = entity.cohesionVector;
    var separationVector = entity.separationVector;
    var groupAlignmentVector = entity.groupAlignmentVector;
    var groupCohesionVector = entity.groupCohesionVector;
    var groupSeparationVector = entity.groupSeparationVector;

    alignmentVector.normalize();
    cohesionVector.normalize();
    separationVector.normalize();

    groupAlignmentVector.normalize();
    groupCohesionVector.normalize();
    groupSeparationVector.normalize();

    entity.heading.scalePlusEquals(entity.alignmentWeight, alignmentVector);
    entity.heading.scalePlusEquals(entity.cohesionWeight, cohesionVector);
    entity.heading.scalePlusEquals(entity.separationWeight, separationVector);

    entity.heading.scalePlusEquals(entity.groupAlignmentWeight, groupAlignmentVector);
    entity.heading.scalePlusEquals(entity.groupCohesionWeight, groupCohesionVector);
    entity.heading.scalePlusEquals(entity.groupSeparationWeight, groupSeparationVector);

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
    super.process(delta);

    this.entities.forEach(this.finalizeElement.bind(this));
  }
}

export default Engine;
