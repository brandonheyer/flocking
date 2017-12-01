var data =
`
# Start

## <br /><br /><br />Flocking Algorithms:<br /><br /> Using a d3.js game engine<br /> to visualize activity data

<div class="name-spacer"></div>
### @brandonheyer
<img class="crowdskout"  src="img/crowdskout.svg" />


## About Presentation
* Basics of a game engine
* Basics of flocking algorithms
* Representing mixpanel data

# 2D Engine Basics

## 2D Engine Basics<br /> On A 2D Cartesian Plane

## Terms
* **Point**: A basic (x, y) pair
* **Vector**: An (x, y) pair with direction and magnitude
* **Entity**: An object within the game engine, has a position (**Point**) and heading (**Vector**)
* **Magnitude**: The length of the vector
* **Normalize**: Scaling of the magnitude of a **Vector** to 1 while maintaining the direction

## 2D Architecture
<img src="./img/xypoint.svg" />

## Other Facts
* You can add a **Vector** to a  **Point** to move it
* You can subtract a **Point** from a **Point** to create a **Vector**
* You can add **Vectors** with other **Vectors**, head to tail, and get a new **Vector**


## Points: Subtraction
<img src="./img/points2.svg" />


## Vectors: Addition
<img src="./img/vector1.svg" />



## Game Architecture
<img src="./img/engine_baseentity.svg" />


## Basic Game Engine Loop
* Render new entities
* Remove "dead" entities
* Update all entities, using time since last update or *delta*
* Repeat

> Using delta enables smoother animations based on frame rate rather than a constant




# Algorithms

## Why Algorithms?

## Why Algorithms?
* Practice
* Changing things up
* Experiment with new technologies

> A good way to hone your skills
> Helpful to think about something different
> Try out new libraries / frameworks in a limited scope
> Let's be honest, sometimes it is just fun to screw around


## Flocking is Fun
* Individual-Based Model
* Boids & Steering Behaviors
* Burton's 1992 Batman Returns

> Individual-Based Model
> "Global consequences of local interactions of members of a population"
> Craig Reynolds, in 1986 created the computer model for flocking
> Boids are our "entities", coind by Reynolds
> Real world implementation for bats and penguins in Batman Returns


## Meet the Boids ID:meetBoids
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

> The plane is a euclidean 2-torus, entities loop around edges
> Think: Pacman
> Currently no steering, just speed and heading


## How they move
\`\`\`
this.pos.scalePlusEquals(
  this.speed * delta,
  this.heading
);
\`\`\`

### Scale heading vector by speed (d/ms) times delta (ms)
### Move point by scaled vector

> Remember, delta is time since last frame update
> This occurs each loop of the game engine


## Steering Factors
* Alignment
* Cohesion
* Separation


## Alignment: <br />Moving in the same direction


## Alignment
### Steer towards average heading of all other boids

\`\`\`
// First, for all entities
alignmentVector.scalePlusEquals(
  other.speed,
  other.heading
);

// Then
alignmentVector.divideEquals(closeEntities);
alignmentVector.normalize();
\`\`\`

> Scale heading by speed
> Average resulting vector by number of entities


## Alignment ID:alignment
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

> Blue line is normalized (and scaled for visibility) average heading
> This average changes slightly each loop
> Outliers to average cause this variation


## Cohesion: <br /> Sticking Together


## Cohesion
### Move current entity towards center of mass of all entities

\`\`\`
// First, for all entities
cohesionVector.plusEquals(
  other.pos
);

// Then
cohesionVector.divideEquals(closeEntities.length);
cohesionVector.minusEquals(entity.pos);
cohesionVector.normalize();
\`\`\`

> Add together all locations
> Divide by number of entities - center of mass
> Create vector from current position to center of mass


## Cohesion ID:cohesion
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

> Green line is non-normalized heading towards center of mass


## Separation: <br /> Some Personal Space


## Separation
### Move current entity away
### Weighted based on distance, closer = bigger impact

\`\`\`
// First, for all entities
tempVector = other.pos.minus(this.pos);
separationVector.scalePlusEquals(
  -1 / tempVector.magnitude(),
  tempVector
);

// Then
separationVector.normalize();
\`\`\`

> Doing inverse for weighting results in small vector, no average


## Separation ID:separation
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>


## Combining All Three properties
\`\`\`
entity.heading.scalePlusEquals(alignmentWeight, alignmentVector);
entity.heading.scalePlusEquals(cohesionWeight, cohesionVector);
entity.heading.scalePlusEquals(separationWeight, separationVector);

entity.heading.normalize();
\`\`\`

> Normalizing individual vectors first puts them all on a level playing field
> Weighting then adjusts their overall impact on the starting, normalized heading


## Other Factors
* Range / Neighborhood
* Groups
* Weight

## Range: <br /> The Boid's Personal Space

## Range
* Distance from boid
* Field of view of boid (not implemented)


## Range
\`\`\`
range: 150,

groupAlignmentWeight: 0.025,
groupCohesionWeight: 0.075,
groupSeparationWeight: 0.09
\`\`\`

> Notice higher separation than cohesion
> Boids will tend to avoid their "neighborhood" flock

## Range ID:rangeA
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Range

\`\`\`
range: 500,

groupAlignmentWeight: 0.025,
groupCohesionWeight: 0.08,
groupSeparationWeight: 0.08
\`\`\`

> Notice same cohesion and separation weight
> Boids will form more consistent flocks

## Range ID:rangeB
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>

## Groups: <br /> Boids and Their Friends

## Groups
\`\`\`
range: 500,

alignmentWeight: -0.001,
cohesionWeight: 0,
separationWeight: 0.01,

groupAlignmentWeight: 0.0125,
groupCohesionWeight: 0.08,
groupSeparationWeight: 0.08
\`\`\`

> Negative alignment between different grouped entities causes overall group avoidance
> No cohesion means groups don't share a center of mass
> Small separation keeps groups from getting to close, despite avoidance
> Lower group alignment here just slows down alignment steering

## Groups ID:groupsA
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>


## All Together Now
\`\`\`
speed: 0.2 * (1 + (this.group / 3)),
range: 500,

alignmentWeight: -0.00125,
cohesionWeight: 0.09,
separationWeight: 0.01,

groupAlignmentWeight: 0.0125,
groupCohesionWeight: 0.03,
groupSeparationWeight: 0.025
\`\`\`

> Speed is based on group ID, some groups slower than .2, some faaster

## All Together Now ID:alltogether
<svg class="fk-canvas" width="800" height="800" style="background: #cccccc"> </svg>


## Application as data visualization
* Map pages / modules to regions
* Boids represent active users (x8)
* Active boids group with current region
* Speed increases with activity
* Inactive boids die out


## As Data Vizualization ID:dataviz
#### bit.ly/2i2q9xI
<svg class="fk-canvas" width="800" height="800" style="background: #efefef"> </svg>

## At Crowdskout
* Orbiting entities to show historical data (small)
* Orbiting entities to show created assets (large)

## At Crowdskout
<img src="img/live.gif" style="height: 80%; width: auto;" />

## Questions?

`;

module.exports = function() {
  return data;
}
