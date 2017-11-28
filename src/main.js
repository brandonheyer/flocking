import * as _ from 'lodash';
import $ from 'jQuery';
import * as Prism from 'prismjs';
import showdown from 'showdown';

import presentation from './presentation';

import Engine from './engine/Engine';
import BasicBoid from './entities/BasicBoid';
import EducationalBoid from './entities/EducationalBoid';

var engine;

// Presentation variables
var current = 0;
var sections = [];
var $child;
var presentationElement = $('.presentation-parent');
var data = presentation();
var cleanup;
var lookup;
var count;

function makeEngine(engineOptions, entityOptions) {
  count = engineOptions.boidCount || 50;
  engine = new Engine(
    '.fk-canvas',
    1400, 787,
    engineOptions.width || 4200, engineOptions.height || 2361
  );

  for (var i = 0; i < count; i++) {
    addEntity(entityOptions);
  }

  engine.start();

  return function() {
    engine.stop();
    $('.fk-canvas').empty();
  }
}

var defaults = {
  alignmentWeight: 0,
  cohesionWeight: 0,
  separationWeight: 0,

  groupAlignmentWeight: 0,
  groupCohesionWeight: 0,
  groupSeparationWeight: 0,

  count: 0,
  BoidClass: function() {
    if (this.count === count - 1) {
      return EducationalBoid;
    }

    this.count++;

    return BasicBoid;
  },

  initialize: function() {
    this.group = 1;
    this.speed = .5;
    this.weight = 1;
    this.radius = 50;
    this.headingFill = '#e57713';
    this.fill = '#666666';
  },

  range: 10000
};

var sectionProcessLookup = {
  meetBoids: function() {
    return makeEngine({}, defaults);
  },

  alignment: function() {
    return makeEngine(
      {},
      _.defaults(
        {
          BoidClass: function() { return EducationalBoid; },
          groupAlignmentWeight: 0.01
        },
        defaults
      )
    )
  },

  cohesion: function() {
    return makeEngine(
      {},
      _.defaults(
        {
          BoidClass: function() { return EducationalBoid; },
          groupCohesionWeight: 0.025
        },
        defaults
      )
    )
  },

  separation: function() {
    return makeEngine(
      {},
      _.defaults(
        {
          BoidClass: function() { return EducationalBoid; },
          groupSeparationWeight: 0.025
        },
        defaults
      )
    )
  },

  groupsA: function() {
    return makeEngine({
      boidCount: 500,
      rangeVisible: false,
      headingVisible: false,
      alignmentWeight: .01,
      cohesionWeight: .01,
      separationWeight: .01,
      groupAlignmentWeight: 1,
      groupCohesionWeight: 2,
      groupSeparationWeight: 1
    }, {
      BoidClass: BasicBoid,
      radius: 8,
      speed: .5,
      range: 500,
      initialize: function() {
        this.group = Math.floor(Math.random() * 2);
      },
      render: function() {
        switch(this.group) {
          case 0:
            this.fill = '#00aa00';
            break;

          case 1:
            this.fill = '#0000ff';
            break;
        }
      }
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
      groupAlignmentWeight: 0,
      groupCohesionWeight: 1.5,
      groupSeparationWeight: -1
    }, {
      BoidClass: BasicBoid,
      radius: 5,
      range: 2500,
      initialize: function() {
        var randomStep;

        this.group = Math.floor(Math.random() * 5);
        this.speed = (50 + (10 * Math.floor(Math.random() * 5))) / 100;
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
      boidCount: 250,
      rangeVisible: false,
      headingVisible: true,
      alignmentWeight: .001,
      cohesionWeight: .11,
      separationWeight: .1,
      groupAlignmentWeight: 1,
      groupCohesionWeight: 1.1,
      groupSeparationWeight: 1,
    }, {
      BoidClass: BasicBoid,
      initialize: function() {
        this.weight = Math.floor((Math.random() * 100) + 5);

        if (this.weight < 99) {
          this.weight = 2;
          this.radius = 20;
          this.range = 100;
          this.speed = .75;
          this.group = 1;
        } else {
          this.weight = 1;
          this.radius = 60;
          this.range = 200;
          this.speed = 1.5;
          this.group = 2;
        }
      }
    });
  },

  rangeA: function() {
    return makeEngine(
      {
        boidCount: 25,
      },
      _.defaults(
        {
          initialize: function() {
            this.rangeVisible = true;
            this.group = 1;
            this.speed = .25;
            this.weight = 1;
            this.radius = 25;
            this.headingFill = '#e57713';
            this.fill = '#666666';
          },
          range: 150,
          BoidClass: function() { return EducationalBoid; },
          groupAlignmentWeight: 0.025,
          groupCohesionWeight: 0.075,
          groupSeparationWeight: 0.09
        },
        defaults
      )
    );
  },

  rangeB: function() {
    return makeEngine(
      {
        boidCount: 25,
      },
      _.defaults(
        {
          initialize: function() {
            this.rangeVisible = true;
            this.group = 1;
            this.speed = .25;
            this.weight = 1;
            this.radius = 25;
            this.headingFill = '#e57713';
            this.fill = '#666666';
          },
          range: 1000,
          BoidClass: function() { return EducationalBoid; },
          groupAlignmentWeight: 0.025,
          groupCohesionWeight: 0.075,
          groupSeparationWeight: 0.09
        },
        defaults
      )
    );
  }
};

function addEntity(options) {
  var BoidClass;

  options = options || {};
  options.xScale = engine.xScale;
  options.yScale = engine.yScale;
  BoidClass = options.BoidClass || BasicBoid;


  if (_.isFunction(options.BoidClass)) {
    BoidClass = options.BoidClass();
  } else {

  }

  engine.addEntity(
    new BoidClass(options)
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
