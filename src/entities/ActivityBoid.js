import {Vector} from '2d-engine';

import BasicBoid from './BasicBoid';

const MAX_LIFE = 60000;
const MAX_SPEED = .8;
const START_SPEED = .3;

class ActivityBoid extends BasicBoid {
  initializeProperties(options) {
    options.radius = 25;
    options.speed = START_SPEED;
    options.range = 20000;

    super.initializeProperties(options);

    this.life = MAX_LIFE;
    this.isUser = true;

    this.headingFill = '#e57713';

    this.groupAlignmentWeight = .001;
    this.groupCohesionWeight = .029;
    this.groupSeparationWeight = .009;

    this.alignmentWeight = 0;
    this.cohesionWeight = 0;
    this.separationWeight = .1;
  }

  closeCheck(other) {
    var tempVector = new Vector(0,0);

    tempVector.x = other.pos.closerX - this.pos.x;
    tempVector.y = other.pos.closerY - this.pos.y;

    return (this.group === other.group) || tempVector.magnitudeSq() <= this.rangeSq;
  }

  update(delta) {
    this.life -= delta;

    if (this.life <= 0) {
      this.dead = true;
      return;
    }

    if (this.life < MAX_LIFE * .75) {
      this.speed = START_SPEED * (this.life / (MAX_LIFE * .75))
      this.boidElement.attr('opacity', (this.life / (MAX_LIFE * .75)));
      this.headingElement.attr('opacity', (this.life / (MAX_LIFE * .75)));
    }

    super.update(delta);
  }

  keepAlive() {
    this.life = MAX_LIFE;
    this.speed = START_SPEED;
    this.dead = false;
    this.boidElement.attr('opacity', 1);
    this.headingElement.attr('opacity', 1);
  }
}

export default ActivityBoid;
