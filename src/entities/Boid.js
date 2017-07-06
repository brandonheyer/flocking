import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

class Boid extends BaseBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.weight = Math.floor((Math.random() * 100) + 5);

    // this.speed = Math.floor((Math.random() * 3) + 1) / 3;
    // this.speed = .2 + (this.group / 2);

    this.heading = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);

    // this.range = this.xScale(1000 * (this.speed * 2));
    // this.range = this.xScale(1000 / this.speed);
    // this.range = this.xScale(500 / (Math.floor((Math.random() * 3) + 1) / 3));


  }

  render(canvas) {
    switch(this.group) {
      case 0:
        this.fill = '#00ff00';
        break;

      case 1:
        this.fill = '#0000ff';
        break;

      case 2:
        this.fill = '#ff00ff';
        break;
    }

    return super.render(canvas);
  }

  update(delta) {
    super.update(delta);

    // if (this.closeCount < 10 && this.speed > this.baseSpeed * .1) {
    //   this.speed -= Math.random() / 100;
    //   this.range += Math.floor(Math.random() * 5);
    //   this.rangeSq = this.range * this.range;
    // } else if (this.closeCount >= 10 && this.speed < this.baseSpeed) {
    //   this.speed += Math.random() / 10;
    // } else if (this.closeCount >= 10) {
    //   this.range -= Math.floor(Math.random() * 2);
    //   this.rangeSq = this.range * this.range;
    // }
    //
  }
}

export default Boid;
