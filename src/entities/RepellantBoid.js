import {Point} from '2d-engine';

import BaseBoid from './BaseBoid';

const ICON_SIZE = 348;
const ICON_HEIGHT = 315;
const ICON_SCALE = 3.5;

class RepellantBoid extends BaseBoid {
  initializeProperties(options) {
    super.initializeProperties(options);

    this.fill = '#efefef';
    this.radius = (ICON_SIZE / 2) / (ICON_SCALE / 2);
    this.radiusSq = this.radius * this.radius;
    this.range = ICON_SIZE * 2;
    this.speed = .1;

    this.module = true;
    this.moduleBoids = options.moduleBoids;

    this.separationWeight = .01;
    this.groupSeparationWeight = .05;

    this.cohesionWeight = 0.000001;
    this.groupCohesionWeight = .05;

    this.alignmentWeight = 0.000001;
    this.groupAlignmentWeight = .001;

    this.weight = 1;

    switch(options.group) {
      case 2:
        this.image = 'dashboard-detail-empty-state';
        break;

      case 4:
        this.image = 'segment-detail-empty-state';
        break;

      case 5:
        this.image = 'icon-profile-80';
        break;

      case 6:
        this.image = 'charts-list-empty-state';
        break;

      case 7:
        this.image = 'phone-callings-empty-state';
        break;

      case 8:
        this.image = 'daytripper-list-empty-state';
        break;

      case 9:
        this.image = 'forms-list-empty-state';
        break;

      case 11:
        this.image = 'email-list-empty-state';
        break;

      case 12:
        this.image = 'import-list-empty-state';
        break;

      case 13:
        this.image = 'export-list-empty-state';
        break;
    }
  }

  startingPosition() {
    return new Point(
      Math.floor(Math.random() * (this.xScale.domain()[1] / 3) + (this.xScale.domain()[1] / 3)),
      Math.floor(Math.random() * (this.yScale.domain()[1] / 3) + (this.yScale.domain()[1] / 3))
    );
  }

  locatecloseEntities(other) {
    if (this.id === other.id || (other.module !== true && other.group !== this.group)) {
      return;
    }

    if (other.module !== true) {
      this.closeEntities.push(other);

      if (other.group === this.group) {
        this.closeGroup++;
      }
    } else {
      super.locatecloseEntities(other);
    }
  }

  render(canvas) {
    var el = this.element = canvas.append('g');
    var imgHeight = ICON_HEIGHT;
    var imgWidth = ICON_SIZE;

    el.append('circle')
      .attr('r', this.xScale(imgWidth / 2))
      .attr('fill', '#efefef')
      .attr('stroke-weight', 1)
      .attr('stroke', '#cccccc');

    el.append('image')
      .attr('href', './icons/' + this.image + '.png')
      .attr('x', this.xScale(imgWidth / (-1 * ICON_SCALE)))
      .attr('y', this.xScale(imgHeight / (-1 * ICON_SCALE)))
      .attr('width', this.xScale(imgWidth / (ICON_SCALE / 2)))
      .attr('height', this.xScale(imgHeight / (ICON_SCALE / 2)));
  }

  update(delta) {
    var rad = this.radius * 2;
    var transformVal;

    this.pos.scalePlusEquals(this.speed * delta, this.heading);

    if (this.pos.x + rad >= this.xMax || this.pos.x <= rad) {
      this.heading.x = this.heading.x * -1;
    }

    if (this.pos.y + rad >= this.yMax || this.pos.y <= rad) {
      this.heading.y = this.heading.y * -1;
    }

    transformVal = 'translate(' + this.xScale(this.pos.x) + ',' + this.yScale(this.pos.y) + ')';

    this.element
      .attr('transform', transformVal);
  }
}

export default RepellantBoid;
