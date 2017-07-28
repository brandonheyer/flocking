import {BaseEntity, Point, Vector} from '2d-engine';

var id = 0;

class BaseBoid extends BaseEntity {
  constructor(options) {
    super(options);

    this.id = ++id;

    this.initializeProperties(options);

    this.baseSpeed = this.speed;
    this.heading.normalize();
    this.rangeSq = this.range * this.range;

    this.renderMethod = options.render;
  }

  startingPosition() {
    return new Point(
      Math.floor(Math.random() * this.xScale.domain()[1]),
      Math.floor(Math.random() * this.yScale.domain()[1])
    );
  }

  initializeProperties(options) {
    options = options || {};

    this.weight = options.weight || 1;
    this.group = options.group || 1;
    this.speed = options.speed || 1;
    this.oldRadius = this.radius = options.radius || 100;
    this.heading = new Vector(0, 0);
    this.range = options.range || this.xScale.domain()[1];
    this.oldGroup = this.group;

    if (options.initialize) {
      options.initialize.bind(this)();
    }
  }

  update(delta) {
    var transformVal;

    super.update(delta);

    transformVal = 'translate(' + this.xScale(this.pos.x) + ',' + this.yScale(this.pos.y) + ')';

    if (this.range !== this.oldRange && this.rangeElement) {
      this.rangeElement
        .attr('r', this.xScale(this.range));

      this.oldRange = this.range;
    }

    if (this.radius !== this.oldRadius) {
      this.updateStyles();
      this.oldRadius = this.radius;
    }

    if (this.group !== this.oldGroup) {
      this.updateStyles();

      this.oldGroup = this.group;
    }

    if (this.rangeVisible !== this.oldRangeVisible) {
      if (this.rangeVisible) {
        this.renderRange();
      } else if (this.rangeElement) {
        this.rangeElement.remove();
        this.rangeElement = undefined;
      }

      this.oldRangeVisible = this.rangeVisible;
    }

    if (this.headingVisible !== this.oldHeadingVisible) {
      if (this.headingVisible) {
        this.renderHeading();
      } else if (this.headingElement) {
        this.headingElement.remove();
        this.headingElement = undefined;
      }

      this.oldHeadingVisible = this.headingVisible;
    }

    if (this.headingVisible) {
      transformVal += 'rotate(' + (this.heading.angle() * 180 / Math.PI) + ')';
    }

    this.element
      .attr('transform', transformVal);
  }

  updateElements() {
    this.boidElement = this.element.select('.boid');
    this.rangElement = this.element.select('.boid-range');
    this.headingElement = this.element.select('line');
  }

  renderRange() {
    this.rangeElement = this.element.append('circle')
      .attr('r', this.xScale(this.range))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 0, 0, 0.1)')
      .attr('class', 'boid-range');

    this.oldRange = this.range;
    this.oldRangeVisible = this.rangeVisible = true;
  }

  renderHeading() {
    this.headingElement = this.element.append('line')
      .attr('y1', 0)
      .attr('x1', this.xScale(this.radius * 1.25))
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('stroke', 'rgba(255, 0, 0, 1)')
      .attr('fill', 'rgba(255, 0, 0, 1)' )
      .attr('stroke-width', this.xScale(this.radius / 2));

    this.oldHeadingVisible = this.headingVisible = true;
  }

  updateStyles() {
    if (this.renderMethod) {
      this.renderMethod();
    }

    this.boidElement
      .attr('r', this.xScale(this.radius))
      .attr('fill', this.fill)
      .attr('class', 'boid');
  }

  destroy() {
    this.element.remove();
    this.element = undefined;
    this.boidElement = undefined;
    this.headingElement = undefined;
    this.rangeElement = undefined;
  }

  render(canvas) {
    var el = this.element = canvas.append('g');

    this.boidElement = el.append('circle');

    this.updateStyles();
    this.renderRange();

    if (this.rangeVisible) {

    }

    if (this.headingVisible) {
      this.renderHeading();
    }
  }
}

export default BaseBoid;
