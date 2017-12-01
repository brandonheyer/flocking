import {Vector} from '2d-engine';

import BasicBoid from './BasicBoid';

const MAX_LIFE = 60000;
const MAX_SPEED = 1.1;
const START_SPEED = .5;

class ActivityBoid extends BasicBoid {
  initializeProperties(options) {
    options.radius = 25;
    options.speed = START_SPEED;
    options.range = 20000;

    super.initializeProperties(options);

    this.life = MAX_LIFE;
    this.isUser = true;

    this.headingFill = '#e57713';

    this.groupAlignmentWeight = .0001;
    this.groupCohesionWeight = .045;
    this.groupSeparationWeight = .015;

    this.alignmentWeight = 0;
    this.cohesionWeight = 0;
    this.separationWeight = .1;

    this.mpId = options.mpId;
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
    this.speed = Math.min(MAX_SPEED, Math.max(START_SPEED, this.speed + 0.05));
    this.dead = false;
    this.boidElement.attr('opacity', 1);
    this.headingElement.attr('opacity', 1);
  }
}

export default ActivityBoid;
