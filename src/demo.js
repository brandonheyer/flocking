import _ from 'lodash';
import $ from 'jQuery';

import Engine from './engine/Engine';
import BasicBoid from './entities/BasicBoid';
import EducationalBoid from './entities/EducationalBoid';

const defaultParams = params = {
  boids: 200,

  radius1: 25,
  radius2: 25,
  radiusSteps: 1,

  speed1: 25,
  speed2: 25,
  speedSteps: 1,

  range1: 200,
  range2: 200,
  rangeSteps: 1,

  aw: 1,
  cw: 1,
  sw: 1,

  groups: 1,

  gaw: 1,
  gcw: 1,
  gsw: 1
};

var entityOptions;
var engine;

var query = window.location.hash.substring(1);
var params = populateFromParams();

function populateFromParams() {
  params = _.clone(defaultParams);

  query.split('&').forEach(function(p) {
    p = p.split('=');
    params[p[0]] = parseFloat(p[1] || 0, 10);
  });

  return params;
}

function updateEntityOptions() {
  entityOptions = {
    range: params.range1,

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
      // this.weight = 1 / this.speed;
      this.weight = 1;
      this.radius = getRandomRadius();
    },

    render: function() {
      switch(this.group) {
        case 0:
          this.fill = '#c0f9c0';
          break;

        case 1:
          this.fill = '#c0c0f9';
          break;

        case 2:
          this.fill = '#c9c0c0';
          break;

        case 3:
          this.fill = '#ff00ff';
          break;

        case 4:
          this.fill = '#ffff00';
          break;

        case 5:
          this.fill = '#00ffff';
          break;

        case 6:
          this.fill = '#00ff00';
          break;
      }
    }
  };
}

function getRandomGroup() {
  return Math.floor(Math.random() * params.groups);
}

function getRandomSpeed() {
  var randomStep;

  if (params.speed1 !== params.speed2) {
    randomStep = Math.floor(Math.random() * params.speedSteps);

    return (params.speed1 + ((params.speed2 - params.speed1) / params.speedSteps * randomStep)) / 100;
  }

  return params.speed1 / 100;
}

function getRandomRadius() {
  var randomStep;

  if (params.radius1 !== params.radius2) {
    randomStep = Math.pow(Math.sin(Math.random() * Math.PI / 2), 2);
    randomStep = (randomStep < 0.5) ? 2 * randomStep : 2 * (1 - randomStep);
    randomStep = Math.floor(randomStep * params.radiusSteps);

    return (params.radius1 + ((params.radius2 - params.radius1) / params.radiusSteps * randomStep));
  }

  return params.radius1;
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
      entityOptions
    );
  });

  window.location.hash = res.substring(0);
}

var width = $('body').width();
var height = $('body').height();

engine = new Engine(
  '.fk-canvas',
  width, height,
  width * 4, height * 4
);

updateEntityOptions();

for (var i = 0; i < (params.boids); i++) {
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
  .val(params.boids)
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
  .val(params.range1)
  .on('change blur', (e) => {
    params.range1 = entityOptions.range = parseFloat(e.currentTarget.value, 10);

    updateParams();
  });

$('.fk-radius').val(params.radius1)
$('.fk-radius-2').val(params.radius2)
$('.fk-radius-steps').val(params.radiusSteps);

$('.fk-radius, .fk-radius-2, .fk-radius-steps')
  .on('change blur', (e) => {
    params.radius1 = parseFloat($('.fk-radius').val());
    params.radius2 = parseFloat($('.fk-radius-2').val());
    params.radiusSteps = parseFloat($('.fk-radius-steps').val());

    engine.entities.forEach(function(entity) {
      entity.radius = getRandomRadius();
    });

    updateParams();
  });

$('.fk-speed').val(params.speed1)
$('.fk-speed-2').val(params.speed2)
$('.fk-speed-steps').val(params.speedSteps)

$('.fk-speed, .fk-speed-2, .fk-speed-steps')
  .on('change blur', (e) => {
    params.speed1 = parseFloat($('.fk-speed').val());
    params.speed2 = parseFloat($('.fk-speed-2').val());
    params.speedSteps = parseFloat($('.fk-speed-steps').val());

    engine.entities.forEach(function(entity) {
      entity.speed = getRandomSpeed();
    });

    updateParams();
  });

$('.fk-groups')
  .val(params.groups)
  .on('change blur', (e) => {
    params.groups = parseFloat(e.currentTarget.value);

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
