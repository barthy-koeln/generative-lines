import type { Config, RenderState } from './config.ts'
import { DEFAULT_CONFIG, getEasingByString } from './config.ts'
import { AutoplayTweenGroup, getTweenGroup } from './autoplay-tween-group.ts'

type SchemaFieldType = 'int' | 'float' | 'string'

interface SchemaField {
  attribute: string
  type: SchemaFieldType
}

export type ConfigSchema = Record<keyof Config, SchemaField>

export const CONFIG_SCHEMA: ConfigSchema = {
  steps: { attribute: 'steps', type: 'int' },
  colors: { attribute: 'colors', type: 'int' },
  distance: { attribute: 'distance', type: 'int' },
  amplitude: { attribute: 'amplitude', type: 'int' },
  thickness: { attribute: 'thickness', type: 'int' },
  lines: { attribute: 'lines', type: 'int' },
  paddingX: { attribute: 'padding-x', type: 'int' },
  paddingY: { attribute: 'padding-y', type: 'int' },
  background: { attribute: 'background', type: 'string' },
  perspective: { attribute: 'perspective', type: 'float' },
  easing: { attribute: 'easing', type: 'string' },
  animationDuration: { attribute: 'animation-duration', type: 'int' },
  animationEasing: { attribute: 'animation-easing', type: 'string' },
  lineCap: { attribute: 'line-cap', type: 'string' },
  lineJoin: { attribute: 'line-join', type: 'string' },
  tweenGroup: { attribute: 'tween-group', type: 'string' },
}

/**
 * Reverse map: HTML attribute name -> config property key
 */
export const CONFIG_ATTRIBUTE_TO_KEY: Map<string, keyof Config> = new Map(
  Object.entries(CONFIG_SCHEMA).map(
    ([key, field]) => [field.attribute, key as keyof Config],
  ),
)

export const STATE_ATTRIBUTES: string[] = ['color-values', 'step-values']

function getIntAttribute (element: HTMLElement, name: string, fallback: number): number {
  if (!element.hasAttribute(name)) {
    return fallback
  }

  const attributeValue = element.getAttribute(name)

  if (attributeValue === null) {
    return fallback
  }

  const parsedValue = parseInt(attributeValue)

  return isNaN(parsedValue) ? fallback : parsedValue
}

function getFloatAttribute (element: HTMLElement, name: string, fallback: number): number {
  if (!element.hasAttribute(name)) {
    return fallback
  }

  const attributeValue = element.getAttribute(name)

  if (attributeValue === null) {
    return fallback
  }

  const parsedValue = parseFloat(attributeValue)

  return isNaN(parsedValue) ? fallback : parsedValue
}

function getStringAttribute (element: HTMLElement, name: string, fallback: string): string {
  if (!element.hasAttribute(name)) {
    return fallback
  }

  const attributeValue = element.getAttribute(name)

  return attributeValue === null ? fallback : attributeValue
}

function getArrayAttribute<InnerType> (
  element: HTMLElement,
  name: string,
  fallback: InnerType[],
  parser: (value: string) => InnerType
): InnerType[] {
  if (!element.hasAttribute(name)) {
    return fallback
  }

  const attributeValue = element.getAttribute(name)
  if (attributeValue === null) {
    return fallback
  }

  return attributeValue.split(',').map(parser)
}

function getAttributeByType (
  element: HTMLElement,
  attribute: string,
  type: SchemaFieldType,
  fallback: any,
): any {
  if (type === 'int') {
    return getIntAttribute(element, attribute, fallback)
  }

  if (type === 'float') {
    return getFloatAttribute(element, attribute, fallback)
  }

  return getStringAttribute(element, attribute, fallback)
}

/**
 * Parses all schema fields from element attributes into the config.
 */
export function parseAllConfigAttributes (
  element: HTMLElement,
  fallback: Partial<Config>,
): Partial<Config> {
  const config: Partial<Config> = {}
  for (const key of Object.keys(CONFIG_SCHEMA) as (keyof Config)[]) {
    const field = CONFIG_SCHEMA[key]
    const rawValue = getAttributeByType(
      element,
      field.attribute,
      field.type,
      key in fallback ? fallback[key] : DEFAULT_CONFIG[key],
    )
    config[key] = convertValue(key, rawValue)
  }

  return config
}

/**
 * Parses a single attribute by its HTML attribute name into the config.
 * Returns the config key that was updated, or undefined if unknown.
 */
export function parseSingleConfigAttribute (
  element: HTMLElement,
  attributeName: string,
): Partial<Config> | null {
  const key = CONFIG_ATTRIBUTE_TO_KEY.get(attributeName)
  if (!key) {
    // Unknown attribute
    return null
  }

  const field = CONFIG_SCHEMA[key]
  return {
    [key]: convertValue(key, getAttributeByType(
      element,
      field.attribute,
      field.type,
      null,
    )),
  }
}

export function parseSingleStateAttribute (
  element: HTMLElement,
  attributeName: string
): Partial<RenderState> {
  if (attributeName === 'color-values') {
    const value = element.getAttribute(attributeName)
    if (!value) {
      return {}
    }

    return {
      colors: value.split(',')
    }
  }

  if (attributeName === 'step-values') {
    const value = element.getAttribute(attributeName)
    if (!value) {
      return {}
    }

    return {
      steps: value.split(',').map(Number.parseFloat)
    }
  }

  return {}
}

export function parseAllStateAttributes (element: HTMLElement): Partial<RenderState> {
  return {
    ...parseSingleStateAttribute(element, 'color-values'),
    ...parseSingleStateAttribute(element, 'step-values'),
  }
}

/**
 * Converts raw attribute values to their final Config types.
 * Handles special cases like easing functions and tween groups.
 */
function convertValue (key: keyof Config, value: any): any {
  if (value === null || value === undefined) {
    return value
  }

  // Already resolved - skip conversion
  if (key === 'easing' || key === 'animationEasing') {
    if (typeof value === 'function') {
      return value
    }

    return getEasingByString(value as string)
  }

  if (key === 'tweenGroup') {
    if (value instanceof AutoplayTweenGroup) {
      return value
    }

    return getTweenGroup(value as string)
  }

  return value
}
