import _ from 'lodash';
import * as d3 from 'd3';

import Engine from './Engine';
import ClientBoid from '../entities/ClientBoid';
import CrowdskoutBoid from '../entities/CrowdskoutBoid';
import RepellantBoid from '../entities/RepellantBoid';

var groups = {
  'dashboard': 2,
  'search': 4,
  'v2-audience': 4,
  'profiles': 5,
  'analysis': 6,
  'charting': 6,
  'goals': 6,
  'phone': 7,
  'daytripper': 8,
  'data-entry-forms': 9,
  'web-forms': 9,
  'email': 11,
  'import': 12,
  'export': 13,
  'unsubscribe': 14
};


class ActivityEngine extends Engine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY, options);

    var range;
    var createdGroups = [];

    this.colorScale = d3.scaleOrdinal(d3.schemeCategory20b);
    range = this.colorScale.range();
    range.shift();

    this.colorScale.range(range)
    this.lastUpdate = -1;
    this.entityLookup = {};

    _.each(_.omit(groups, ['unsubscribe']), _.bind(function(group, name) {
      if (createdGroups.indexOf(group) !== -1) {
        return;
      }

      createdGroups.push(group);

      this.addEntity(new RepellantBoid({
        xScale: this.xScale,
        yScale: this.yScale,
        group: group
      }), name);
    }, this));
  }

  addEntity(entity, id) {

      if (this.entityLookup[id]) {
        return;
      }

      this.entityLookup[id] = entity;

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
          return tuple.event && tuple.event.time > +(new Date()) - ((3600 * 4000) + (30000))
        }
      )
      .groupBy(['event.time', 'user.distinct_id', 'event.properties.csClient', 'event.properties.isCS', 'user.properties.$email', 'event.properties.csModule', 'event.properties.csRoute'],
          mixpanel.reducer.count()
      )
      .sortDesc('key.0');
    }
  }

  processJql(results) {
    var BoidClass = ClientBoid;
    var route;

    d3.select('.mp-response').text(
      JSON.stringify(results, null, 3)
    );

    this.alreadyUpdated = {};

    _.each(results, (res) => {
      var options = {};

      options.xScale = this.xScale;
      options.yScale = this.yScale;
      options.colorScale = this.colorScale;
      options.group = 1;

      options.timestamp = res.key[0];
      options.mpId = res.key[1];
      options.client = res.key[2];
      options.isCs = res.key[3];
      options.module = res.key[5];

      if (options.isCs) {
        BoidClass = CrowdskoutBoid;
      }

      for (var i = 0; i < 8; i++) {
        options.mpId = options.mpId + '-' + i;

        if (this.entityLookup[options.mpId]) {
          if (!this.alreadyUpdated[options.mpId]) {
            if (res.key[5] === 'tools') {
              route = res.key[6].split('.');
              route.shift();
              route.shift();

              this.entityLookup[options.mpId].group = groups[route[0]] || 1;
            } else {
              this.entityLookup[options.mpId].group = groups[res.key[5]] || 1;
            }

            this.alreadyUpdated[options.mpId] = true;

            this.entityLookup[options.mpId].keepAlive(res.key[0]);
          }
        } else {
          this.addEntity(
            new BoidClass(options),
            options.mpId
          );
        }
      }
    });
  }

  preProcessEntity(d3Element, entity, index) {
    if (entity.dead) {
      this.removeEntity(entity);
      delete this.entityLookup[entity.mpId];

      return;
    }

    super.preProcessEntity(d3Element, entity, index);
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
