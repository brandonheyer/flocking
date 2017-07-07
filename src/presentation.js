var data =
`
# Start

## Flocking Algorithms

# Background

## Some Background

## 2D Architecture
<img src="./img/xypoint.svg" />

## Points
* (x, y) or cartesian coordinates
* Addition of two points creates a new point
* Addition with a vector creates a new point
* Subtraction creates a new vector

## Vectors
* Direction and magnitude
* Addition of two vectors creates a new vector
* Normalize: scale magnitude to 1

## Points: Addition
<img src="./img/points1.svg" />

## Points: Subtraction
<img src="./img/points2.svg" />

## Vectors: Addition
<img src="./img/vector1.svg" />

## Vectors: Division
<img src="./img/vector2.svg" />

## Game Architecture
<img src="./img/engine_baseentity.svg" />

## Basic Game Engine Loop
* Render new / remove "dead" entities
* Update all entities, using time since last update
* Repeat

## Entities on Update
* Adjust heading
* Normalize heading
* Scale heading by speed
* Add heading to position

# Algorithms

## Algorithm Time!

## Meet the Boids ID:meetBoids
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## How they move
\`\`\`
this.pos.scalePlusEquals(
  this.speed * delta,
  this.heading
);
\`\`\`

### Scale heading vector by speed (d/ms) times delta (ms)
### Move point by scaled vector

## Alignment: <br />Moving in the same direction

## Alignment
\`\`\`
// For all close entities
vector.plusEquals(
  other.heading.scale(other.speed)
);

// Then
vector.divideEquals(closeEntities);
vector.normalize();
\`\`\`

## Alignment ID:alignment
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Cohesion: <br /> Sticking Together

## Cohesion
### Move current entity towards center of mass of all close entities

## Cohesion
\`\`\`
// For all close entities
vector.plusEquals(
  other.pos
);

// Then
vector.divideEquals(closeEntities.length);
vector.minusEquals(entity.pos);
vector.normalize();
\`\`\`

## Cohesion ID:cohesion
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Separation: <br /> Avoiding the Crowd

## Separation
### Move current entity away from all close entities
### Can be modified to account for distance weighting

## Separation
\`\`\`
// For all close entities
tempVector.x = other.pos.x - entity.pos.x;
tempVector.y = other.pos.y - entity.pos.y;
vector.plusEquals(tempVector);

// Then
vector.divideEquals(closeEntities.length);
vector.negate();
vector.normalize();
\`\`\`

## Separation ID:separation
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Combining All Three properties
\`\`\`
alignmentVector.normalize();
cohesionVector.normalize();
separationVector.normalize();

entity.heading.scalePlusEquals(alignmentWeight, alignmentVector);
entity.heading.scalePlusEquals(cohesionWeight, cohesionVector);
entity.heading.scalePlusEquals(separationWeight, separationVector);

entity.heading.normalize();
\`\`\`

## Range: <br /> The Boid's Personal Space

## Range ID:rangeA
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Range ID:rangeB
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Groups: <br /> Boids and Their Friends

## Groups
\`\`\`
range: 500,

alignmentWeight: .01,
cohesionWeight: .01,
separationWeight: .01,
groupAlignmentWeight: 1,
groupCohesionWeight: 2,
groupSeparationWeight: 1
\`\`\`

## Groups ID:groupsA
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Groups
\`\`\`
range: 2500,

alignmentWeight: .01,
cohesionWeight: 1.2,
separationWeight: 1,
groupAlignmentWeight: 0,
groupCohesionWeight: 1.5,
groupSeparationWeight: -1
\`\`\`

## Groups ID:groupsB
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## All Together Now ID:alltogether
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

# Variations

## Part 2: Algorithm Variations

`;

module.exports = function() {
  return data;
}
