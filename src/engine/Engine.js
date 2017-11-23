import _ from 'lodash';
import * as d3 from 'd3';
import {Vector, Engine as BaseEngine} from '2d-engine';

class Engine extends BaseEngine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY, options || {
      trackFPS: function() {}
    });

    options = options || {};
  }

  processEntity(entity, index) {
    var that = this;

    if (!entity.initializeVectors) {
      return;
    }

    entity.initializeVectors(this.entities.length);

    this.entities.forEach(
      entity.locatecloseEntities.bind(entity)
    );

    entity.closeCount = entity.closeEntities.length;

    entity.process();
  }

  finalizeElement(entity, index) {
    if (entity.finalize) {
      entity.finalize();
    }

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
