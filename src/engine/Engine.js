import _ from 'lodash';
import * as d3 from 'd3';
import {Vector, Engine as BaseEngine} from '2d-engine';

import ActivityBoid from '../entities/ActivityBoid';

class Engine extends BaseEngine {
  processEntity(entity, index) {
    var that = this;

    if (!entity.initializeVectors) {
      //super.processEntity(entity, index);
      return;
    }

    entity.initializeVectors();

    this.entities.forEach(
      entity.locatecloseEntities.bind(entity)
    );

    entity.closeCount = entity.closeEntities.length;

    entity.process();
  }

  finalizeElement(entity, index) {
    if (!entity.finalize) {
      super.processEntity(entity, index);
      return;
    }

    entity.finalize();
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
