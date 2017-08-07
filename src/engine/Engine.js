import _ from 'lodash';
import * as d3 from 'd3';
import {Vector, Engine as BaseEngine} from '2d-engine';

import BasicBoid from '../entities/BasicBoid';
import ActivityBoid from '../entities/ActivityBoid';

class Engine extends BaseEngine {
  removeEntityById(id) {
    if (this.entityLookup[id]) {
      this.removeEntityAt(this.entities.indexOf(this.entityLookup[id]));
    }
  }

  processEntity(entity, index) {
    var that = this;

    entity.initializeVectors();

    this.entities.forEach(
      entity.locatecloseEntities.bind(entity)
    );

    entity.closeCount = entity.closeEntities.length;

    entity.closeEntities.forEach(
      entity.calculate.bind(entity)
    );

    if (entity.closeGroup !== 0) {
      entity.finalizeAlignment(entity.groupAlignmentVector, entity.closeGroup, entity.groupAlignmentWeight);
      entity.finalizeCohesion(entity.groupCohesionVector, entity.closeGroup, entity.groupCohesionWeight);
      entity.finalizeSeparation(entity.groupSeparationVector, entity.closeGroup, entity.groupSeparationWeight);
    }

    if (entity.nonGroup !== 0) {
      entity.finalizeAlignment(entity.alignmentVector, entity.nonGroup, entity.alignmentWeight);
      entity.finalizeCohesion(entity.cohesionVector, entity.nonGroup, entity.cohesionWeight);
      entity.finalizeSeparation(entity.separationVector, entity.nonGroup, entity.separationWeight);
    }
  }



  finalizeElement(entity, index) {
    entity.alignmentVector.normalize();
    entity.cohesionVector.normalize();
    entity.separationVector.normalize();

    entity.groupAlignmentVector.normalize();
    entity.groupCohesionVector.normalize();
    entity.groupSeparationVector.normalize();

    entity.heading.scalePlusEquals(entity.alignmentWeight, entity.alignmentVector);
    entity.heading.scalePlusEquals(entity.cohesionWeight, entity.cohesionVector);
    entity.heading.scalePlusEquals(entity.separationWeight, entity.separationVector);

    entity.heading.scalePlusEquals(entity.groupAlignmentWeight, entity.groupAlignmentVector);
    entity.heading.scalePlusEquals(entity.groupCohesionWeight, entity.groupCohesionVector);
    entity.heading.scalePlusEquals(entity.groupSeparationWeight, entity.groupSeparationVector);

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
