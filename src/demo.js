import _ from 'lodash';
import $ from 'jQuery';

import Engine from './engine/Engine';
import BasicBoid from './entities/BasicBoid';

const STARTING_BOIDS = 500;
const STARTING_RADIUS = 10;
const STARTING_RANGE = 500;
const STARTING_GROUPS = 3;
const STARTING_SPEED = 5;

var entityOptions;
var engine;

var query = window.location.hash.substring(1);
var params = populateFromParams();

var speed1 = params.speed || STARTING_SPEED;
var speed2 = params.speed2 || speed1;
var speedSteps = params.speedSteps || 1;

var radius1 = params.radius || STARTING_RADIUS;
var radius2 = params.radius2 || radius1;
var radiusSteps = params.radiusSteps || 1;

var groupCount = params.groupCount || STARTING_GROUPS;

function populateFromParams() {
  params = {};

  query.split('&').forEach(function(p) {
    p = p.split('=');
    params[p[0]] = parseFloat(p[1] || 0, 10);
  });

  return params;
}

function updateEntityOptions() {
  entityOptions = {
    range: params.range || STARTING_RANGE,

    alignmentWeight: params.aw,
    cohesionWeight: params.cw,
    separationWeight: params.sw,

    groupAlignmentWeight: params.gaw,
    groupCohesionWeight: params.gcw,
    groupSeparationWeight: params.gsw,

    xScale: engine.xScale,
    yScale: engine.yScale,

    rangeVisible: params.rangeVisible || false,
    headingVisible: params.headingVisible || false,

    initialize: function() {
      this.group = getRandomGroup();
      this.speed = getRandomSpeed();
      this.radius = getRandomRadius();
    },

    render: function() {
      switch(this.group) {
        case 0:
          this.fill = '#00aa00';
          break;

        case 1:
          this.fill = '#0000ff';
          break;

        case 2:
          this.fill = '#ff00ff';
          break;

        case 3:
          this.fill = '#00ffff';
          break;

        case 4:
          this.fill = '#ffff00';
          break;
      }
    }
  };
}

function getRandomGroup() {
  return Math.floor(Math.random() * groupCount);
}

function getRandomSpeed() {
  var randomStep;

  if (speed1 !== speed2) {
    randomStep = Math.floor(Math.random() * speedSteps);

    return (speed1 + ((speed2 - speed1) / speedSteps * randomStep)) / 100;
  }

  return speed1 / 100;
}

function getRandomRadius() {
  var randomStep;

  if (radius1 !== radius2) {
    randomStep = Math.pow(Math.sin(Math.random() * Math.PI / 2), 2);
    randomStep = (randomStep < 0.5) ? 2 * randomStep : 2 * (1 - randomStep);
    randomStep = Math.floor(randomStep * radiusSteps);

    return (radius1 + ((radius2 - radius1) / radiusSteps * randomStep));
  }

  return radius1;
}

function addEntity(options) {
  options = options || {};

  engine.addEntity(
    new BasicBoid(options)
  );
}

function updateParams() {
  var res = '';

  for (var prop in params) {
    if (params.hasOwnProperty(prop)) {
      res += '&' + prop + '=' + params[prop];
    }
  }

  updateEntityOptions();

  engine.entities.forEach(function(entity) {
    entity.initializeProperties(
      _.omit(entityOptions, ['initialize'])
    );
  });

  window.location.hash = res.substring(0);
}

speed1 = parseFloat(params.speed || 10, 10);
speed2 = params.speed2 || speed1;
speedSteps = params.speedSteps || 1;

radius1 = parseFloat(params.radius || 10, 10);
radius2 = params.radius2 || radius1;
radiusSteps = params.radiusSteps || 1;

groupCount = params.groups || STARTING_GROUPS;

engine = new Engine(
  '.fk-canvas',
  1400, 787,
  5000, 2812
);

updateEntityOptions();

for (var i = 0; i < (params.boids || STARTING_BOIDS); i++) {
  addEntity(entityOptions);
}

engine.start();

$('.fk-stop').on('click', engine.stop.bind(engine));
$('.fk-start').on('click', engine.start.bind(engine));

$('.fk-toggle-range').on('click', function() {
  params.rangeVisible = !entityOptions.rangeVisible;

  engine.entities.forEach(function(entity) {
    entity.rangeVisible = params.rangeVisible;
  });

  updateParams();
});

$('.fk-toggle-heading').on('click', function() {
  params.headingVisible = !entityOptions.headingVisible;

  engine.entities.forEach(function(entity) {
    entity.headingVisible = params.headingVisible;
  });

  updateParams();
});

$('.fk-boids')
  .val(params.boids || STARTING_BOIDS)
  .on('change blur', (e) => {
    var diff = parseFloat(e.currentTarget.value, 10) - engine.entities.length;
    var i;

    params.boids = parseFloat(e.currentTarget.value, 10);

    if (diff < 0) {
      diff *= -1;

      for (i = 0; i < diff; i++) {
        engine.removeEntityAt(0);
      }
    } else {
      for (i = 0; i < diff; i++) {
        addEntity(entityOptions);
      }
    }

    updateParams();
  });

$('.fk-range')
  .val(params.range || STARTING_RANGE)
  .on('change blur', (e) => {
    params.range = entityOptions.range = parseFloat(e.currentTarget.value, 10);

    updateParams();
  });

$('.fk-radius').val(params.radius || STARTING_RADIUS)
$('.fk-radius-2').val(params.radius2 || params.radius || STARTING_RADIUS)
$('.fk-radius-steps').val(params.radiusSteps || 1);

$('.fk-radius, .fk-radius-2, .fk-radius-steps')
  .on('change blur', (e) => {
    params.radius = radius1 = parseFloat($('.fk-radius').val() || STARTING_RADIUS, 10);
    params.radius2 = radius2 = parseFloat($('.fk-radius-2').val() || STARTING_RADIUS, 10);
    params.radiusSteps = radiusSteps = parseFloat($('.fk-radius-steps').val() || 1, 10);

    engine.entities.forEach(function(entity) {
      entity.radius = getRandomRadius();
    });

    updateParams();
  });

$('.fk-speed').val(params.speed || STARTING_SPEED)
$('.fk-speed-2').val(params.speed2 || params.speed || STARTING_SPEED)
$('.fk-speed-steps').val(params.speedSteps || 1)

$('.fk-speed, .fk-speed-2, .fk-speed-steps')
  .on('change blur', (e) => {
    params.speed = speed1 = parseFloat($('.fk-speed').val() || STARTING_SPEED, 10);
    params.speed2 = speed2 = parseFloat($('.fk-speed-2').val() || STARTING_SPEED, 10);
    params.speedSteps = speedSteps = parseFloat($('.fk-speed-steps').val() || 1, 10);

    engine.entities.forEach(function(entity) {
      entity.speed = getRandomSpeed();
    });

    updateParams();
  });

$('.fk-groups')
  .val(params.groups || STARTING_GROUPS)
  .on('change blur', (e) => {
    params.groups = groupCount = parseFloat(e.currentTarget.value, 10) || 1;

    engine.entities.forEach(function(entity) {
      entity.group = getRandomGroup();
    });

    updateParams();
  });

$('.fk-weight-alignment')
  .val(entityOptions.alignmentWeight)
  .on('change blur', (e) => {
    params.aw = parseFloat(e.currentTarget.value, 10) || 0;

    updateParams();
  });

$('.fk-weight-cohesion')
  .val(entityOptions.cohesionWeight)
  .on('change blur', (e) => {
    params.cw = parseFloat(e.currentTarget.value, 10) || 0;

    updateParams();
  });

$('.fk-weight-separation')
  .val(entityOptions.separationWeight)
  .on('change blur', (e) => {
    params.sw = parseFloat(e.currentTarget.value, 10) || 0;

    updateParams();
  });

$('.fk-group-weight-alignment')
  .val(entityOptions.groupAlignmentWeight)
  .on('change blur', (e) => {
    params.gaw = parseFloat(e.currentTarget.value, 10) || 0;

    updateParams();
  });

$('.fk-group-weight-cohesion')
  .val(entityOptions.groupCohesionWeight)
  .on('change blur', (e) => {
    params.gcw = parseFloat(e.currentTarget.value, 10) || 0;

    updateParams();
  });

$('.fk-group-weight-separation')
  .val(entityOptions.groupSeparationWeight)
  .on('change blur', (e) => {
    params.gsw = parseFloat(e.currentTarget.value, 10) || 0;

    updateParams();
  });
