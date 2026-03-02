export type EasingFunction = (t: number) => number

/**
 * A tuple of two numbers representing an XY coordinate
 */
export type Point = [x: number, y: number]
/**
 * An array of points representing a line or path
 */
export type Line = Point[]

/**
 * A tuple of two normalized values representing the start and end of the lines to be rendered
 * The values are normalized between 0 and 1, where 0 represents the start of the line and 1 represents the end of the line.
 *
 * Examples:
 * - [0, 1] would render the entire line
 * - [0.25, 0.75] would render the middle half of the line
 * - [0, 0.5] would render the first half of the line
 * - [0.5, 1] would render the second half of the line
 */
export type AnimationTargets = [start: NormalizedPositive, end: NormalizedPositive]

/**
 * A configuration object for an animation, containing the starting and ending targets for the animation.
 * The canvas will animate the line from the "from" targets to the "to" targets over the duration of the animation.
 *
 * Example:
 * ```ts
 * const animationConfig: AnimationConfig = {
 *   from: [0, 0.5], // Start the animation at the first half of the line
 *   to: [0.5, 1] // End the animation at the second half of the line
 * }
 * ```
 */
export type AnimationConfig = { from: AnimationTargets, to: AnimationTargets }

/**
 * Just used for type clarity
 */
export type Integer = number
export type Pixels = number
export type Milliseconds = number

/**
 * Normalized value between -1 and 1
 */
export type Normalized = number

/**
 * Normalized value between 0 and 1
 */
export type NormalizedPositive = number