import {Vector} from '2d-engine';

import BasicBoid from './BasicBoid';

const LIFESPAN = 40000;
const BASE_SPEED = 1;

class ActivityBoid extends BasicBoid {
  constructor(options) {
    super(options);

    this.degrees = 0;

    this.rangeVisible = true;
    this.range = 1000;
  }

  initializeProperties(options) {
    super.initializeProperties(options);

    this.mpId = options.mpId;
    this.client = options.client;
    this.isCs = options.isCs;
    this.speed = BASE_SPEED;
    this.timestamp = 0;
    this.radius = 25;

    this.keepAlive(options.timestamp);
  }

  update(delta) {
    var degrees;

    this.lastUpdate -= delta;
    this.lastRotate -= delta;

    if (this.lastRotate < 0) {
      this.lastRotate = 1000;

      this.degrees = (Math.floor(Math.random() * 40) - 20) * Math.PI / 180;
    }

    //this.heading.rotate(this.degrees * (delta / 1000));

    if (this.lastUpdate < LIFESPAN * .75) {
      this.speed = BASE_SPEED * (this.lastUpdate / (LIFESPAN * .75));
    } else {
      this.speed = BASE_SPEED;
    }

    if (this.lastUpdate < 0) {
      this.dead = true;
    }

    super.update(delta);
  }

  keepAlive(timestamp) {
    if (this.timestamp !== timestamp) {
      this.timestamp = timestamp;

      this.lastUpdate = LIFESPAN;
      this.lastRotate = 1000;
      this.dead = false;
    }
  }
}

export default ActivityBoid;
