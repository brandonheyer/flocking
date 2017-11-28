import * as _ from 'lodash';
import $ from 'jQuery';
import * as Prism from 'prismjs';
import showdown from 'showdown';

import presentation from './presentation';

import Engine from './engine/Engine';
import ActivityEngine from './engine/ActivityEngine';
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
  count = engineOptions.boidCount;
  engine = new (engineOptions.EngineClass || Engine)(
    '.fk-canvas',
    engineOptions.screenWidth || 1400, engineOptions.screenHeight || 787,
    engineOptions.width || 4200, engineOptions.height || 2361
  );

  for (var i = 0; i < count; i++) {
    addEntity(entityOptions);
  }

  engine.start();

  $('.fk-canvas')
    .removeClass('.fk-canvas-final')
    .on('click', function() {
        (engine.timeout) ? engine.stop() : engine.start()
    });

  if (engineOptions.post) {
    engineOptions.post();
  }

  return function() {
    engine.stop();
    $('.fk-canvas')
      .off('click')
      .empty()
      .parent()
      .find(':not(.fk-canvas)')
        .remove();
  };
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
    return makeEngine({
      boidCount: 50
    }, defaults);
  },

  alignment: function() {
    return makeEngine(
      {
        boidCount: 50
      },
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
      {
        boidCount: 50
      },
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
      {
        boidCount: 50
      },
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
    return makeEngine(
      {
        boidCount: 20,
      },
      _.defaults(
        {
          initialize: function() {
            this.group = Math.floor(Math.random() * 2);
            this.speed = .125;
            this.weight = 1;
            this.radius = 100;
            this.headingFill = '#e57713';

            this.showGroupHeading = true;
            this.showOtherHeading = true;
            this.showOverallHeading = true;
          },
          render: function() {
            switch(this.group) {
              case 0:
                this.fill = '#90cccc';
                break;

              case 1:
                this.fill = '#606660';
                break;
            }
          },
          range: 1000,
          BoidClass: function() { return EducationalBoid; },
          groupAlignmentWeight: 0.0125,
          groupCohesionWeight: 0.08,
          groupSeparationWeight: 0.08,

          alignmentWeight: -.001,
          cohesionWeight: 0,
          separationWeight: 0.01
        },
        defaults
      )
    );
  },

  alltogether: function() {
    return makeEngine(
      {
        boidCount: 250,
      },
      _.defaults(
        {
          initialize: function() {
            this.group = Math.floor(Math.random() * 5);
            this.speed = .2 * (1 + (this.group / 3));
            this.weight = 1;
            this.radius = 20;
            this.headingFill = '#e57713';
          },
          render: function() {
            switch(this.group) {
              case 0:
                this.fill = '#90cccc';
                break;

              case 1:
                this.fill = '#606660';
                break;

              case 2:
                this.fill = '#ccaa09';
                break;

              case 3:
                this.fill = '#ee009f';
                break;

              case 4:
                this.fill = '#009909';
                break;
            }
          },
          range: 500,
          BoidClass: function() { return BasicBoid; },
          groupAlignmentWeight: 0.0125,
          groupCohesionWeight: 0.03,
          groupSeparationWeight: 0.025,

          alignmentWeight: -.0125,
          cohesionWeight: 0.09,
          separationWeight: 0.1
        },
        defaults
      )
    );
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
            this.showGroupHeading = true;
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
            this.showGroupHeading = true;
          },
          range: 1000,
          BoidClass: function() { return EducationalBoid; },
          groupAlignmentWeight: 0.0125,
          groupCohesionWeight: 0.08,
          groupSeparationWeight: 0.08
        },
        defaults
      )
    );
  },

  dataviz: function() {
    return makeEngine(
      {
        boidCount: 0,
        EngineClass: ActivityEngine,
        screenWidth: 787,
        width: 4722,
        height: 4722,
        post: function() {
          var iframe = $('<iframe>');
          iframe.attr('src', 'tracking.html');
          $('.fk-canvas').before(iframe);
        }
      }, {}
    )
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
