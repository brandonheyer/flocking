import {Vector} from '2d-engine';

import BasicBoid from './BasicBoid';

class EducationalBoid extends BasicBoid {
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

  finalize() {
    super.finalize();

    if (this.showGroupHeading) {
      this.groupHeadingWeight = 1;
      this.groupHeadingVector = new Vector(0, 0);
      this.groupHeadingVector.scalePlusEquals(this.groupAlignmentWeight, this.groupAlignmentVector);
      this.groupHeadingVector.scalePlusEquals(this.groupCohesionWeight, this.groupCohesionVector);
      this.groupHeadingVector.scalePlusEquals(this.groupSeparationWeight, this.groupSeparationVector);

      this.updateDisplayLine(this.groupHeadingElement, 'groupHeadingVector', this.radius * 3);
    }


    if (this.showOtherHeading) {
      this.nonGroupHeadingWeight = 1;
      this.nonGroupHeadingVector = new Vector(0, 0);
      this.nonGroupHeadingVector.scalePlusEquals(this.alignmentWeight, this.alignmentVector);
      this.nonGroupHeadingVector.scalePlusEquals(this.cohesionWeight, this.cohesionVector);
      this.nonGroupHeadingVector.scalePlusEquals(this.separationWeight, this.separationVector);

      this.updateDisplayLine(this.nonGroupHeadingElement, 'nonGroupHeadingVector', this.radius * 3);
    }

    if (this.showOverallHeading) {
      this.overallGroupHeadingWeight = 1;
      this.overallGroupHeadingVector = new Vector(0, 0);
      this.overallGroupHeadingVector.plusEquals(this.groupHeadingVector);
      this.overallGroupHeadingVector.plusEquals(this.nonGroupHeadingVector);

      this.updateDisplayLine(this.overallGroupHeadingElement, 'overallGroupHeadingVector', this.radius * 4);
    }
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

    this.alignmentElement = this.renderDisplayLine('125, 125, 255');
    this.groupAlignmentElement = this.renderDisplayLine('0, 0, 255');
    this.cohesionElement = this.renderDisplayLine('125, 255, 125');
    this.groupCohesionElement = this.renderDisplayLine('0, 255, 0');
    this.separationElement = this.renderDisplayLine('255, 125, 125');
    this.groupSeparationElement = this.renderDisplayLine('255, 0, 0');

    if (this.showGroupHeading) {
      this.groupHeadingElement = this.renderDisplayLine('255, 255, 255');
    }

    if (this.showOtherHeading) {
      this.nonGroupHeadingElement = this.renderDisplayLine('125, 125, 125');
    }

    if (this.showOverallHeading) {
      this.overallGroupHeadingElement = this.renderDisplayLine('0, 0, 0');
    }
  }
}

export default EducationalBoid;
