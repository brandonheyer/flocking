import _ from 'lodash';
import * as d3 from 'd3';

import Engine from './Engine';
import BasicBoid from '../entities/BasicBoid';


class ActivityEngine extends Engine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY);

    this.lastUpdate = -1;
    this.entityLookup = {};
  }

  addEntity(entity, id) {
    if (this.entityLookup[id]) {
      return;
      //_.extend(this.entityLookup[id], entity);
    } else {
      this.entityLookup[id] = entity;
    }

    super.addEntity(entity);
  }

  removeEntityById(id) {
    if (this.entityLookup[id]) {
      this.removeEntityAt(this.entities.indexOf(this.entityLookup[id]));
    }
  }

  getJqlQuery() {
    return function main() {
      var date = new Date();
      return join(
        Events({
          from_date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
          to_date:  date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        }),
        People()
      )
      .filter(
        function(tuple) {
          return tuple.event && tuple.user && tuple.event.time > +(new Date()) - ((60 * 60 * 1000 * 4) + (60 * 60 * 1000))
        }
      )
      .groupBy(['event.time', 'user.distinct_id', 'event.properties.csClient', 'user.properties.$email', 'event.properties.csModule'],
          mixpanel.reducer.count()
      )
      .sortDesc('key.0');
    }
  }

  processJql(results) {
    d3.select('.mp-response').text(
      JSON.stringify(results, null, 3)
    );

    _.each(results, (res) => {
      var options = {};

      options.xScale = this.xScale;
      options.yScale = this.yScale;

      if (!this.entityLookup[res.key[1]]) {
        this.addEntity(new BasicBoid(options), res.key[1])
      }
    });
  }

  process(delta) {
    if (this.lastUpdate > 5000 || this.lastUpdate === -1) {
      MP.api.jql(this.getJqlQuery()).done(
        (results) => this.processJql(results)
      );

      this.lastUpdate = 0;
    }

    this.lastUpdate += delta;

    super.process(delta);
  }
}

export default ActivityEngine;
