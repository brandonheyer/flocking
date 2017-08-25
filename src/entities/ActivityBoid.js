import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

const LIFESPAN = 120000;
const BASE_SPEED = .5;
const WOBBLE_RANGE = 20;

class ActivityBoid extends BaseBoid {
  constructor(options) {
    super(options);

    this.degrees = 0;

    this.rangeVisible = false;
    this.range = 10000;
    this.user = true;
  }

  initializeProperties(options) {
    super.initializeProperties(options);

    this.mpId = options.mpId;
    this.client = options.client;
    this.isCs = options.isCs;
    this.speed = this.baseSpeed =  (this.module === 'unsubscribe') ? BASE_SPEED * 2 : BASE_SPEED;;
    this.timestamp = 0;
    this.module = options.module;

    this.baseLifespan = (this.module === 'unsubscribe') ? LIFESPAN / 4 : LIFESPAN;
    this.radius = (this.module === 'unsubscribe') ? 10 : 20;

    this.keepAlive(options.timestamp);
  }

  update(delta) {
    var degrees;

    this.lastUpdate -= delta;
    this.lastRotate -= delta;

    if (this.lastRotate < 0) {
      this.lastRotate = 1000;

      this.degrees = (Math.floor(Math.random() * WOBBLE_RANGE) - WOBBLE_RANGE / 2) * Math.PI / 180;
    }

    this.heading.rotate(this.degrees * delta / 1000);

    if (this.lastUpdate < this.baseLifespan * .75) {
      this.speed = this.baseSpeed * (this.lastUpdate / (this.baseLifespan * .75));
      this.boidElement.attr('opacity', (this.lastUpdate / (this.baseLifespan * .75)));
    }

    if (this.lastUpdate < 0) {
      this.dead = true;
    }

    super.update(delta);
  }

  keepAlive(timestamp, data) {
    if (this.timestamp !== timestamp) {
      this.timestamp = timestamp;

      this.lastUpdate = this.baseLifespan;
      this.lastRotate = 1000;
      this.dead = false;
      this.speed = (this.speed < this.baseSpeed) ? this.baseSpeed : Math.min(this.speed * 1.05, 1.25);

      if (this.boidElement) {
        this.boidElement.attr('opacity', 1);
      }
    }
  }
}

export default ActivityBoid;
