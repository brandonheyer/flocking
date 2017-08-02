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

var w = $(document).width();
var h = $(document).height();
var engine = new ActivityEngine(
  '.fk-canvas',
  w, h,
  5000, (5000 * h) / w,
  {
    alignmentWeight: .0005,
    cohesionWeight: .01,
    separationWeight: .01,
    groupAlignmentWeight: params.gaw,
    groupCohesionWeight: params.gcw,
    groupSeparationWeight: params.gsw
  }
);

$('.logo').css({
  left: (w - 356) / 2,
  top: (h - 84) / 2
});

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
