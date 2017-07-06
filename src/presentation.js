var data =
`
# Start

## Flocking
### ???

# Background

## Part 0: Some Background

## Points
* (x,y) or cartesian coordinates

## Vectors
* Direction and magnitude
* Difference between two points
* Normalize: scale magnitude to 1

## Basic Entity Properties
* Position (Point)
* Heading (Vector)
* Speed (Scalar)

## Basic Game Engine Loop
* Render new / remove "deald" entities
* Update all entities, using time since last update
* Repeat

## Entities on Update
* Adjust heading
* Normalize heading
* Scale heading by speed
* Add heading to position

## Vector Math

# Algorithms

## Part 1: Flocking Alogrithms

## Meet the Boids ID:meetBoids
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## How they move
\`\`\`
this.pos.scalePlusEquals(
  this.speed * delta,
  this.heading
);
\`\`\`

## Alignment
\`\`\`
// For all close entities
tempVector.x = other.heading.x;
tempVector.y = other.heading.y;
vector.plusEquals(tempVector);

// Then
vector.divideEquals(closeEntities.length);
vector.normalize();
\`\`\`

## Alignment ID:alignment
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Cohesion
\`\`\`
// For all close entities
tempVector.x = other.pos.x;
tempVector.y = other.pos.y;
vector.plusEquals(tempVector);

// Then
vector.divideEquals(closeEntities.length);
vector.minusEquals(entity.pos);
vector.normalize();
\`\`\`

## Cohesion ID:cohesion
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

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

## Range ID:rangeA
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Range ID:rangeB
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Groups
\`\`\`
range: 1000,

alignmentWeight: .25,
cohesionWeight: 2.5,
separationWeight: .25,

groupAlignmentWeight: 1 / .25,
groupCohesionWeight: 1 / 2.5,
groupSeparationWeight: 0
\`\`\`

## Groups ID:groupsA
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Groups
\`\`\`
range: 10000,

alignmentWeight: 1,
cohesionWeight: 110,
separationWeight: 100,

groupAlignmentWeight: 0,
groupCohesionWeight: 101,
groupSeparationWeight: 0
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
