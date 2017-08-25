import {BaseEntity, Point, Vector} from '2d-engine';

var tempVector = new Vector(0, 0);
var id = 0;

const LIFESPAN = 600000;

class Orbiter extends BaseEntity {
  constructor(options) {
    super(options);

    this.initializeProperties(options);
  }

  initializeProperties(options) {
    options = options || {};

    this.id = ++id;
    this.speed = options.speed || .2;
    this.radius = options.radius || 4;
    this.range = options.range || 1;
    this.parent = options.parent;
    this.fill = options.fill;
    this.rotate = 0;
    this.life = LIFESPAN;
  }

  startingPosition() {
    return new Point(
    0,0
    );
  }

  update(delta) {
    this.pos.x = this.parent.pos.x;
    this.pos.y = this.parent.pos.y;
    this.rotate = (this.rotate + (delta * this.speed)) % 360;
    this.life -= delta;

    if (this.life < 0) {
      this.dead = true;
      return;
    }

    if (this.orbitElement) {
      this.orbitElement.attr('opacity', (this.life < LIFESPAN / 2) ? this.life / (LIFESPAN / 2) : 1);
    }

     this.element
       .attr('transform', 'translate(' + this.xScale(this.pos.x) + ',' + this.yScale(this.pos.y) + ') rotate(' + this.rotate + ')');
  }

  updateElements() {
    this.boidElement = this.element.select('.boid');
  }

  updateStyles() {
    this.orbitElement
      .attr('r', this.xScale(this.radius))
      .attr('cx', this.xScale(this.parent.radius + this.radius + this.radius + this.range))
      .attr('cy', this.yScale(this.parent.radius + this.radius + this.radius + this.range))
      .attr('fill', this.fill)
      .attr('class', 'orbit');
  }

  destroy() {
    this.element.remove();
    this.element = undefined;
    this.boidElement = undefined;
  }

  render(canvas) {
    var el = this.element = canvas.append('g');

    this.orbitElement = el.append('circle');

    this.updateStyles();
  }
}

export default Orbiter;
