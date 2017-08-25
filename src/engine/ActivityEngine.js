import _ from 'lodash';
import * as d3 from 'd3';

import Engine from './Engine';
import ClientBoid from '../entities/ClientBoid';
import CrowdskoutBoid from '../entities/CrowdskoutBoid';
import ModuleBoid from '../entities/ModuleBoid';
import Orbiter from '../entities/Orbiter';

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

    this.moduleBoids = [];
    this.moduleBoidGroupLookup = {};
    this.frames = 0;
    this.currFrames = 0;
    this.frameTimes = [];
    this.frameTimes.length = 100;
    this.frameTimes.fill(0);

    this.colorScale = d3.scaleOrdinal(d3.schemeCategory20b);
    range = this.colorScale.range();
    range.shift();

    this.colorScale.range(range)
    this.lastUpdate = -1;
    this.entityLookup = {};
    this.clients = {
      'null': '#0a0a0a',
      'Crowdskout': '#00aeef'
    };

    _.each(_.omit(groups, ['unsubscribe']), _.bind(function(group, name) {
      var moduleBoid;

      if (createdGroups.indexOf(group) !== -1) {
        return;
      }

      createdGroups.push(group);

      moduleBoid = new ModuleBoid({
        xScale: this.xScale,
        yScale: this.yScale,
        group: group,
        moduleBoids: this.moduleBoids
      });

      this.addEntity(moduleBoid, name);
      this.moduleBoids.push(moduleBoid);
      this.moduleBoidGroupLookup[group] = moduleBoid;
    }, this));
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
      var TIMEFRAME_TIMEZONE_SHIFT = 3600 * 4000;
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
      .groupBy(['event.time', 'event.distinct_id', 'event.properties.csClient', 'event.properties.isCS', 'user.properties.$email', 'event.properties.csModule', 'event.properties.csRoute', 'event.name'],
          mixpanel.reducer.count()
      )
      .sortDesc('key.0');
    }
  }

  processJql(results) {
    var BoidClass = ClientBoid;
    var key;

    d3.select('.mp-response').text(
      JSON.stringify(results, null, 3)
    );

    this.alreadyUpdated = {};
    this.clients = {
      'null': '#0a0a0a',
      'Crowdskout': '#00aeef'
    };

    _.each(results, (res) => {
      var options = {};
      var route;
      var mod;

      options.xScale = this.xScale;
      options.yScale = this.yScale;
      options.colorScale = this.colorScale;
      options.group = 1;
      options.engine = this;

      options.timestamp = res.key[0];
      options.mpId = res.key[1];
      options.client = res.key[2];
      options.isCs = res.key[3];
      options.module = res.key[5];
      options.moduleBoids = this.moduleBoids;
      options.moduleBoid = _.find(this.moduleBoids, { name: options.module });

      if ( !this.clients[options.client]) {
        this.clients[options.client] = options.colorScale(options.client);
      }

      if (options.isCs) {
        BoidClass = CrowdskoutBoid;
      }

      mod = res.key[5];

      if (res.key[5] === 'tools') {
        route = res.key[6].split('.');
        route.shift();
        route.shift();
        mod = route[0];
      }

      options.group = groups[mod];

      for (var i = 0; i < 4; i++) {
        options.mpId = options.mpId + '-' + i;

        if (this.entityLookup[options.mpId]) {
          if (!this.alreadyUpdated[options.mpId]) {
            this.entityLookup[options.mpId].group = groups[mod] || 1;
            this.alreadyUpdated[options.mpId] = true;
            this.entityLookup[options.mpId].keepAlive(res.key[0], res);
          }
        } else {
          this.addEntity(
            new BoidClass(options),
            options.mpId
          );
        }
      }

      if (!this.entityLookup[res.key[4] + '-' + res.key[0] + '-orbiter'] && this.moduleBoidGroupLookup[groups[mod]]) {
        this.addEntity(
          new Orbiter({
            parent: this.moduleBoidGroupLookup[groups[mod]],
            fill: res.key[3] ? '#00aeef' : this.colorScale(res.key[2]),
            xScale: this.xScale,
            yScale: this.yScale
          }),
          res.key[4]  + '-' +  res.key[0] + '-orbiter'
        )
      }

      if (
        !this.entityLookup[res.key[4] + '-' + res.key[0] + '-asset-orbiter'] &&
        this.moduleBoidGroupLookup[groups[mod]] &&
        (res.key[7].indexOf('Saved') !== -1 || res.key[7] === 'Segmenting: Save' || res.key[7] === 'Export: New' || res.key[7] === 'Import: Upload')
      ) {
        this.addEntity(
          new Orbiter({
            parent: this.moduleBoidGroupLookup[groups[mod]],
            radius: 10,
            range: 20,
            speed: .05,
            fill: res.key[3] ? '#00aeef' : this.colorScale(res.key[2]),
            xScale: this.xScale,
            yScale: this.yScale
          }),
          res.key[4]  + '-' +  res.key[0] + '-asset-orbiter'
        )
      }
    });

    key = d3.select('.fk-key')
      .selectAll('div.fk-key-item')
      .data(_.toPairs(this.clients));

    var div = key.enter()
      .append('div')
        .attr('class', 'fk-key-item')
        .append('div')
          .attr('class', 'fk-key-text');

    key.exit()
      .remove();

    d3.selectAll('div.fk-key-item')
      .style('background', function(client) { return client[1]; })
      .select('.fk-key-text')
        .text(function(client) { return client[0]; });
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
    if (this.lastUpdate > 10000 || this.lastUpdate === -1) {
      MP.api.jql(this.getJqlQuery()).done(
        (results) => this.processJql(results)
      );

      this.lastUpdate = 0;
    }

    this.lastUpdate += delta;

    this.frameTimes[this.frames % 100] = delta;
    this.frames++;
    this.average = Math.round(1 / (_.mean(this.frameTimes) / 1000), 2);

    this.fps.text(this.average);

    super.process(delta);
  }

  tick() {
    var newLast = +(new Date());
    var delta = this.delta = newLast - this.last;

    this.last = newLast;

    this.elements = this.svg.selectAll('g.entity')
      .data(this.entities);

    this.enterElements();
    this.exitElements();

    this.elements = this.svg.selectAll('g.entity');

    this.process(delta);

    this.timeout = setTimeout(this.tick.bind(this), (32 - (1000 / this.average) || 0));
  }
}

export default ActivityEngine;
