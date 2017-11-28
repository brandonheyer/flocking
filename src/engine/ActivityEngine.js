import _ from 'lodash';
import * as d3 from 'd3';

import Engine from './Engine';
import ActivityBoid from '../entities/ActivityBoid';
import SectionBoid from '../entities/SectionBoid';

var groups = {
  'l1': 1,
  'l2': 2,
  'l3': 3,
  'l4': 4
};

class ActivityEngine extends Engine {
  constructor(svgClass, pixelX, pixelY, worldX, worldY, options) {
    super(svgClass, pixelX, pixelY, worldX, worldY, options);

    MP.api.setCredentials(localStorage['flocking-mp']);

    this.sectionBoids = [];
    this.sectionBoidGroupLookup = {};
    this.entityLookup = {};
    this.lastUpdate = -1;

    _.each(groups, _.bind(function(group, name) {
      var sectionBoid;

      sectionBoid = new SectionBoid({
        radius: 100,
        xScale: this.xScale,
        yScale: this.yScale,
        group: group
      });

      this.addEntity(sectionBoid, name);
      this.sectionBoids.push(sectionBoid);
      this.sectionBoidGroupLookup[group] = sectionBoid;
    }, this));
  }

  randomColor() {
    return ((Math.floor(Math.random() * 16) * 16)).toString(16);
  }

  addEntity(entity, id) {
    if (this.entityLookup[id]) {
      return;
    }

    this.entityLookup[id] = entity;

    super.addEntity(entity);
  }

  getJqlQuery() {
    return function main() {
      var date = new Date();
      var TIMEFRAME_TIMEZONE_SHIFT = 3600 * 8000;
      var TIMEFRAME_RECENT_ACTIVITY = TIMEFRAME_TIMEZONE_SHIFT + 30000;

      return join(
        Events({
          from_date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
          to_date:  date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        }),
        People()
      )
      .filter(
        function(tuple) {
          return tuple.event && tuple.event.time > +(new Date()) - TIMEFRAME_RECENT_ACTIVITY;
        }
      )
      .groupBy(['event.time', 'event.distinct_id', 'event.properties.sectionId', 'event.name'],
          mixpanel.reducer.count()
      )
      .sortDesc('key.0');
    }
  }

  processJql(results) {
    var BoidClass = ActivityBoid;
    var key;

    this.alreadyUpdated = {};

    _.each(results, (res) => {
      var options = {};
      var route;
      var mod;
      var clients;

      options.xScale = this.xScale;
      options.yScale = this.yScale;
      options.engine = this;

      options.timestamp = res.key[0];
      options.originalMpId = res.key[1];
      options.mpId = res.key[1];
      options.section = res.key[2];
      options.event = res.key[3];

      options.sectionBoids = this.sectionBoids;
      options.sectionBoid = this.sectionBoidGroupLookup[
        options.section
      ];

      options.group = groups[options.section] || 10;
      options.fill = '#' + this.randomColor() + this.randomColor() + this.randomColor();

      for (var i = 0; i < 8; i++) {
        options.mpRoot = options.originalMpId;
        options.mpId = options.originalMpId + '-' + i;

        if (this.entityLookup[options.mpId]) {
          if (!this.alreadyUpdated[options.mpId]) {
            this.entityLookup[options.mpId].group = options.group;
            this.entityLookup[options.mpId].sectionBoid = options.sectionBoid;

            this.alreadyUpdated[options.mpId] = true;
            this.entityLookup[options.mpId].keepAlive();
          }
        } else {
          this.addEntity(
            new BoidClass(options),
            options.mpId
          );
        }
      }

      // if (!this.entityLookup[res.key[4] + '-' + res.key[0] + '-orbiter'] && this.sectionBoidGroupLookup[groups[mod]]) {
      //   this.addEntity(
      //     new Orbiter({
      //       parent: this.sectionBoidGroupLookup[groups[mod]],
      //       fill: res.key[3] ? '#00aeef' : this.colorScale(res.key[2]),
      //       xScale: this.xScale,
      //       yScale: this.yScale
      //     }),
      //     res.key[4]  + '-' +  res.key[0] + '-orbiter'
      //   )
      // }
      //
      // if (
      //   !this.entityLookup[res.key[4] + '-' + res.key[0] + '-asset-orbiter'] &&
      //   this.sectionBoidGroupLookup[groups[mod]] &&
      //   (res.key[7].indexOf('Saved') !== -1 || res.key[7] === 'Segmenting: Save' || res.key[7] === 'Export: New' || res.key[7] === 'Import: Upload')
      // ) {
      //   this.addEntity(
      //     new Orbiter({
      //       parent: this.sectionBoidGroupLookup[groups[mod]],
      //       radius: 10,
      //       range: 47,
      //       speed: .05,
      //       fill: res.key[3] ? '#00aeef' : this.colorScale(res.key[2]),
      //       xScale: this.xScale,
      //       yScale: this.yScale
      //     }),
      //     res.key[4]  + '-' +  res.key[0] + '-asset-orbiter'
      //   )
      // }
    });
  }

  removeEntity(entity) {
    super.removeEntity(entity);

    delete this.entityLookup[entity.mpId];
  }

  preProcessEntity(d3Element, entity, index) {
    if (entity.dead) {
      this.removeEntity(entity);
      return;
    }

    super.preProcessEntity(d3Element, entity, index);
  }

  process(delta) {
    if (this.lastUpdate > 2500 || this.lastUpdate === -1) {
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
