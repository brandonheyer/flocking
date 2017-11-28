import {Vector} from '2d-engine';

import BaseBoid from './BaseBoid';

class EducationalBoid extends BaseBoid {
  updateDisplayLine(element, property, scalar) {
    var endPoint = new Vector(this[property].x, this[property].y);

    if (scalar) {
      endPoint.normalize();
    } else {

    }

    scalar = (scalar || 1) * ((this[property.replace('Vector', 'Weight')]) ? 1 : 0);


    element
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2',
        this.xScale(
          (endPoint.x * scalar)
        )
      )
      .attr('y2',
        this.yScale(
          (endPoint.y * scalar)
        )
      );
  }

  process() {
    super.process();

    this.updateDisplayLine(this.alignmentElement, 'alignmentVector', this.radius * 2);
    this.updateDisplayLine(this.groupAlignmentElement, 'groupAlignmentVector', this.radius * 2);
    this.updateDisplayLine(this.cohesionElement, 'cohesionVector');
    this.updateDisplayLine(this.groupCohesionElement, 'groupCohesionVector');
    this.updateDisplayLine(this.separationElement, 'separationVector', this.radius * 2);
    this.updateDisplayLine(this.groupSeparationElement, 'groupSeparationVector', this.radius * 2);
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

    this.alignmentElement = this.renderDisplayLine('200, 200, 255');
    this.groupAlignmentElement = this.renderDisplayLine('0, 0, 255');
    this.cohesionElement = this.renderDisplayLine('200, 255, 200');
    this.groupCohesionElement = this.renderDisplayLine('0, 255, 0');
    this.separationElement = this.renderDisplayLine('255, 200, 200');
    this.groupSeparationElement = this.renderDisplayLine('255, 0, 0');
  }
}

export default EducationalBoid;
