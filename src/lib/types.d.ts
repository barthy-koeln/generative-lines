export type EasingFunction = (t: number) => number

export type Point = [x: number, y: number]
export type Line = Point[]

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