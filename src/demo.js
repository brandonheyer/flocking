import $ from 'jQuery';

import ActivityEngine from './engine/ActivityEngine';
import BasicBoid from './entities/BasicBoid';

const STARTING_BOIDS = 500;
const STARTING_RADIUS = 10;
const STARTING_RANGE = 500;
const STARTING_GROUPS = 3;
const STARTING_SPEED = 5;

var entityOptions;
var query = window.location.hash.substring(1);
var params = {};
var groupCount;
var speed1;
var speed2;
var speedSteps;
var radius1;
var radius2;
var radiusSteps;

query.split('&').forEach(function(p) {
  p = p.split('=');
  params[p[0]] = p[1];
});

speed1 = parseInt(params.speed || 10, 10);
speed2 = params.speed2 || speed1;
speedSteps = params.speedSteps || 1;

radius1 = parseInt(params.radius || 10, 10);
radius2 = params.radius2 || radius1;
radiusSteps = params.radiusSteps || 1;

groupCount = params.groups || STARTING_GROUPS;

entityOptions = {
  range: params.range || STARTING_RANGE,
  radius: params.radius || STARTING_RADIUS,
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
}

var engine = new ActivityEngine(
  '.fk-canvas',
  1400, 787,
  5000, 2812,
  {
    alignmentWeight: params.aw,
    cohesionWeight: params.cw,
    separationWeight: params.sw,
    groupAlignmentWeight: params.gaw,
    groupCohesionWeight: params.gcw,
    groupSeparationWeight: params.gsw
  }
);

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
  options.xScale = engine.xScale;
  options.yScale = engine.yScale;

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

  res = res.substring(0);

  window.location.hash = res;
}

// for (var i = 0; i < (params.boids || STARTING_BOIDS); i++) {
//   addEntity(entityOptions);
// }

engine.start();

$('.fk-stop').on('click', engine.stop.bind(engine));
$('.fk-start').on('click', engine.start.bind(engine));

$('.fk-toggle-range').on('click', function() {
  engine.rangeVisible = !engine.rangeVisible;
  entityOptions.rangeVisible = engine.rangeVisible;
});

$('.fk-toggle-heading').on('click', function() {
  engine.headingVisible = !engine.headingVisible;
  entityOptions.headingVisible = engine.headingVisible;
});

$('.fk-boids')
  .val(params.boids || STARTING_BOIDS)
  .on('change blur', function() {
    var diff = $(this).val() - engine.entities.length;
    var i;

    params.boids = $(this).val();

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
  .on('change blur', function() {
    params.range = entityOptions.range = $(this).val();

    engine.entities.forEach(function(entity) {
      entity.range = entityOptions.range;
    });

    updateParams();
  });

$('.fk-radius')
  .val(params.radius || STARTING_RADIUS)
  .on('change blur', function() {
    radius1 = params.radius = parseInt($(this).val(), 10);

    engine.entities.forEach(function(entity) {
      entity.radius = getRandomRadius();
      entity.weight = entity.radius / radiusSteps;
    });

    updateParams();
  });

$('.fk-radius-2')
  .val(params.radius2 || STARTING_SPEED)
  .on('change blur', function() {
    radius2 = params.radius2 = parseInt($(this).val(), 10);

    engine.entities.forEach(function(entity) {
      entity.radius = getRandomRadius();
    });

    updateParams();
  });

$('.fk-radius-steps')
  .val(params.radiusSteps || 1)
  .on('change blur', function() {
    radiusSteps = params.radiusSteps = parseInt($(this).val(), 10);

    engine.entities.forEach(function(entity) {
      entity.radius = getRandomRadius();
    });

    updateParams();
  });

$('.fk-speed')
  .val(params.speed || STARTING_SPEED)
  .on('change blur', function() {
    speed1 = params.speed = parseInt($(this).val(), 10);

    engine.entities.forEach(function(entity) {
      entity.speed = getRandomSpeed();
    });

    updateParams();
  });

$('.fk-speed-2')
  .val(params.speed2 || STARTING_SPEED)
  .on('change blur', function() {
    speed2 = params.speed2 = parseInt($(this).val(), 10);

    engine.entities.forEach(function(entity) {
      entity.speed = getRandomSpeed();
    });

    updateParams();
  });

$('.fk-speed-steps')
  .val(params.speedSteps || 1)
  .on('change blur', function() {
    speedSteps = params.speedSteps = parseInt($(this).val(), 10);

    engine.entities.forEach(function(entity) {
      entity.speed = getRandomSpeed();
    });

    updateParams();
  });

$('.fk-weight-alignment')
  .val(engine.alignmentWeight)
  .on('change blur', function() {
    params.aw = engine.alignmentWeight = $(this).val();

    updateParams();
  });

$('.fk-weight-cohesion')
  .val(engine.cohesionWeight)
  .on('change blur', function() {
    params.cw = engine.cohesionWeight = $(this).val();

    updateParams();
  });

$('.fk-weight-separation')
  .val(engine.separationWeight)
  .on('change blur', function() {
    params.sw = engine.separationWeight = $(this).val();

    updateParams();
  });

$('.fk-groups')
  .val(params.groups || STARTING_GROUPS)
  .on('change blur', function() {
    params.groups = groupCount = $(this).val();

    engine.entities.forEach(function(entity) {
      entity.group = getRandomGroup();
    });

    updateParams();
  });

$('.fk-group-weight-alignment')
  .val(engine.groupAlignmentWeight)
  .on('change blur', function() {
    params.gaw = engine.groupAlignmentWeight = $(this).val();

    updateParams();
  });

$('.fk-group-weight-cohesion')
  .val(engine.groupCohesionWeight)
  .on('change blur', function() {
    params.gcw = engine.groupCohesionWeight = $(this).val();

    updateParams();
  });

$('.fk-group-weight-separation')
  .val(engine.groupSeparationWeight)
  .on('change blur', function() {
    params.gsw = engine.groupSeparationWeight = $(this).val();

    updateParams();
  });
