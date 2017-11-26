import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

class EducationalBoid extends BaseBoid {
  updateDisplayLine(element, property) {
    var endPoint = new Vector(this[property].x, this[property].y);

    endPoint.normalize();

    element
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2',
        this.xScale(
          this.radius * (endPoint.x * this[property.replace('Vector', 'Weight')])
        )
      )
      .attr('y2',
        this.yScale(
          this.radius * (endPoint.y * this[property.replace('Vector', 'Weight')])
        )
      );
  }

  process() {
    super.process();

    this.updateDisplayLine(this.alignmentElement, 'alignmentVector');
    this.updateDisplayLine(this.groupAlignmentElement, 'groupAlignmentVector');
    this.updateDisplayLine(this.cohesionElement, 'cohesionVector');
    this.updateDisplayLine(this.groupCohesionElement, 'groupCohesionVector');
    this.updateDisplayLine(this.separationElement, 'separationVector');
    this.updateDisplayLine(this.groupSeparationElement, 'groupSeparationVector');
  }

  update(delta) {
    var endPoint;

    super.update(delta);

    endPoint = new Vector(this.heading.x, this.heading.y);
    endPoint.normalize();

    this.headingElement
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', this.xScale(this.radius * 2 * endPoint.x))
      .attr('y2', this.yScale(this.radius * 2 * endPoint.y));
  }

  renderDisplayLine(color) {
    return this.element.append('line')
      .attr('y1', this.pos.y)
      .attr('x1', this.pos.x)
      .attr('y1', this.pos.y)
      .attr('x2', this.pos.x)
      .attr('stroke', 'rgba(' + color + ', .8)')
      .attr('fill', 'none' )
      .attr('stroke-width', this.xScale(this.radius * .25));
  }

  render(canvas) {
    super.render(canvas);

    this.headingElement = this.renderDisplayLine('0, 0, 0');

    this.alignmentElement = this.renderDisplayLine('200, 200, 255');
    this.groupAlignmentElement = this.renderDisplayLine('0, 0, 255');
    this.cohesionElement = this.renderDisplayLine('200, 255, 200');
    this.groupCohesionElement = this.renderDisplayLine('0, 255, 0');
    this.separationElement = this.renderDisplayLine('255, 200, 200');
    this.groupSeparationElement = this.renderDisplayLine('255, 0, 0');
  }
}

export default EducationalBoid;
