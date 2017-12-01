import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

class BasicBoid extends BaseBoid {
  update(delta) {
    super.update(delta);

    this.headingElement.attr(
      'd',
      'M 0 0 ' +
      'L ' + this.xScale(-1 * this.heading.y * this.radius) + ' ' + this.yScale(this.heading.x * this.radius) +
      ' L ' + this.xScale(this.heading.x * this.radius * 2) + ' ' + this.yScale(this.heading.y * this.radius * 2) +
      ' L ' + this.xScale(this.heading.y * this.radius) + ' ' + this.yScale(-1 * this.heading.x * this.radius) +
      ' z'
    );
  }

  initializeProperties(options) {
    super.initializeProperties(options);
  }

  updateStyles() {
    super.updateStyles();

    if (this.headingElement) {
      this.headingElement
        .attr('fill', this.headingFill || '#000000');
    }
  }

  destroy() {
    super.destroy();

    this.headingElement = undefined;
  }

  updateElements() {
    super.updateElements();

    this.headingElement = this.element.select('path');
    this.headingElement
      .attr('fill', this.headingFill || '#000000');
  }

  render(canvas) {
    super.render(canvas);

    this.headingElement = this.element.insert('path', ':first-child');
    this.headingElement
      .attr('fill', this.headingFill || '#000000');
  }
}

export default BasicBoid;
