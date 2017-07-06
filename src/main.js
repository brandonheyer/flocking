import d3 from 'd3';
import $ from 'jQuery';
import * as Prism from 'prismjs';
import showdown from 'showdown';

import {Point} from '2d-engine';

import presentation from './presentation';

import Engine from './engine/Engine';
import Boid from './entities/Boid';
import BasicBoid from './entities/BasicBoid';

const STARTING_BOIDS = 100;
const STARTING_RANGE = 1000;

var engine;

// Presentation variables
var current = 0;
var sections = [];
var $child;
var presentationElement = $('.presentation-parent');
var data = presentation();
var cleanup;
var lookup;

function makeEngine(engineOptions, entityOptions) {
  var count = engineOptions.boidCount || 50;
  engine = new Engine('.fk-canvas', 1400, 787, engineOptions.width || 4200, engineOptions.height || 2361, engineOptions);

  for (var i = 0; i < count; i++) {
    addEntity(entityOptions);
  }

  engine.start();

  return function() {
    engine.stop();
    $('.fk-canvas').empty();
  }
}

var sectionProcessLookup = {
  meetBoids: function() {
    return makeEngine({
      rangeVisible: false,
      headingVisible: true,
      alignmentWeight: 0,
      cohesionWeight: 0,
      separationWeight: 0,
      groupAlignmentWeight: 0,
      groupCohesionWeight: 0,
      groupSeparationWeight: 0
    }, {
      speed: .7,
      radius: 75,
      range: 10000
    });
  },

  alignment: function() {
    return makeEngine({
      rangeVisible: false,
      headingVisible: true,
      alignmentWeight: 0.0025,
      cohesionWeight: 0,
      separationWeight: 0,
      groupAlignmentWeight: 1,
      groupCohesionWeight: 0,
      groupSeparationWeight: 0
    }, {
      speed: .7,
      radius: 75,
      range: 10000
    });
  },

  cohesion: function() {
    return makeEngine({
      rangeVisible: false,
      headingVisible: true,
      alignmentWeight: 0,
      cohesionWeight: .025,
      separationWeight: 0,
      groupAlignmentWeight: 0,
      groupCohesionWeight: 1,
      groupSeparationWeight: 0
    }, {
      speed: .7,
      radius: 75,
      range: 10000
    });
  },

  separation: function() {
    return makeEngine({
      boidCount: 250,
      rangeVisible: false,
      headingVisible: true,
      alignmentWeight: 0,
      cohesionWeight: 0,
      separationWeight: .025,
      groupAlignmentWeight: 0,
      groupCohesionWeight: 0,
      groupSeparationWeight: 1
    }, {
      speed: .5,
      radius: 25,
      range: 10000
    });
  },

  groupsA: function() {
    return makeEngine({
      boidCount: 500,
      rangeVisible: false,
      headingVisible: false,
      alignmentWeight: .01,
      cohesionWeight: .01,
      separationWeight: .01,
    }, {
      BoidClass: BasicBoid,
      radius: 5,
      speed: .5,
      range: 500
    });
  },

  groupsB: function() {
    return makeEngine({
      boidCount: 500,
      rangeVisible: false,
      headingVisible: false,
      alignmentWeight: .01,
      cohesionWeight: 1.2,
      separationWeight: 1,
      groupAlignmentWeight: .01,
      groupCohesionWeight: 1.2,
      groupSeparationWeight: 1
    }, {
      BoidClass: BasicBoid,
      radius: 5,
      speed: 1,
      range: 500,
      initialize: function() {
        this.group = Math.floor(Math.random() * 5);
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
    });
  },

  alltogether: function() {
    return makeEngine({
      boidCount: 10,
      globalRange: 1000,
      rangeVisible: false,
      headingVisible: true,
      alignmentWeight: .01,
      cohesionWeight: .01,
      separationWeight: .01,
      groupAlignmentWeight: 1,
      groupCohesionWeight: 2,
      groupSeparationWeight: 1
    }, {
      BoidClass: BasicBoid,
      range: 5000,
      initialize: function() {
        this.weight = Math.floor((Math.random() * 100) + 5);

        if (this.weight < 90) {
          this.weight = 5;
          this.radius = 20;
          this.speed = .5;
        } else if (this.weight < 100) {
          this.weight = 100;
          this.radius = 40;
          this.speed = 1;
        } else {
          this.weight = 250;
          this.radius = 60;
          this.speed = 1.5;
        }
      }
    });
  },

  rangeA: function() {
    return makeEngine({
      boidCount: 100,
      rangeVisible: true,
      headingVisible: true,
      alignmentWeight: 1,
      cohesionWeight: 1,
      separationWeight: 1
    }, {
      speed: .5,
      radius: 20,
      range: 100
    });
  },

  rangeB: function() {
    return makeEngine({
      boidCount: 100,
      rangeVisible: true,
      headingVisible: true,
      alignmentWeight: 1,
      cohesionWeight: 1,
      separationWeight: 1
    }, {
      speed: .5,
      radius: 20,
      range: 250
    });
  }
};

function addEntity(options) {
  options = options || {};
  options.xScale = engine.xScale;
  options.yScale = engine.yScale;
  options.BoidClass = options.BoidClass || BasicBoid;

  engine.addEntity(
    new options.BoidClass(options)
  );
}

if (presentationElement.length) {
  $((new showdown.Converter({
    disableForced4SpacesIndentedSublists: true
  })).makeHtml(data)).each((i, element) => {
    var id;

    switch(element.tagName) {
      case 'H1':
      case undefined:
        return;

      case 'H2':
        console.log(element.innerText);
        id = element.innerText.split('ID:');
        element.innerText = id[0];
        $child = $('<section data-id="' + id[1] + '">');
        sections.push($child);
        break;

      default:

    }

    $child.append(element);

/*
    if (element.tagName === 'H3' && $child[0].tagName !== 'P') {
      $child = $('<p class="content" />').appendTo($child);
    }
*/
  });

  if (window.location.hash) {
    current = parseInt(window.location.hash.replace('#', ''), 10);
  }

  presentationElement.empty().append(sections[current]);
  sections[current].fadeIn();

  function updateCurrent() {
    lookup = sectionProcessLookup[
      sections[current].attr('data-id')
    ];

    if (lookup) {
      cleanup = lookup();
    }

    sections[current].find('code').html(Prism.highlight(sections[current].find('code').text(), Prism.languages.javascript));
  }

  updateCurrent();

  $('body').keyup(function(event) {
    var oldCurrent = current;

    if (event.which === 37) {
      if (current > 0) {
        current--;
      }
    } else if (event.which === 32 || event.which === 13) {
      if (current <  sections.length - 1) {
        current++;
      }
    }

    if (current !== oldCurrent) {
      if (cleanup) {
        cleanup();
      }

      presentationElement.children().first().detach().hide();
      sections[current].appendTo(presentationElement.empty()).fadeIn();

      updateCurrent();

      window.location.hash = current;
    }
  });
}
