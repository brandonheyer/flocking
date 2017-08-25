import $ from 'jQuery';

import ActivityEngine from './engine/ActivityEngine';

var w = $(document).width();
var h = $(document).height();

var engine = new ActivityEngine(
  '.fk-canvas',
  w, h,
  5000, (5000 * h) / w
);

engine.key = $('.fk-key');

$('.logo').css({
  left: (w - 356) / 2,
  top: (h - 84) / 2
});


engine.fps = $('.fk-fps');
engine.start();
