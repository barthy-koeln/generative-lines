import { type Config, type RawConfig, resolveField } from './config.ts'

type SchemaFieldType = 'int' | 'float' | 'string'

interface SchemaField {
  attribute: string
  type: SchemaFieldType
}

export type ConfigSchema = Record<keyof RawConfig, SchemaField>

export const CONFIG_SCHEMA: ConfigSchema = {
  renderWidth: { attribute: 'render-width', type: 'int' },
  renderHeight: { attribute: 'render-height', type: 'int' },
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
}

/**
 * Reverse map: HTML attribute name -> config property key
 */
export const ATTRIBUTE_TO_KEY: Map<string, keyof RawConfig> = new Map(
  Object.entries(CONFIG_SCHEMA).map(
    ([key, field]) => [field.attribute, key as keyof RawConfig],
  ),
)

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
 * Parses all schema fields from element attributes into the raw config.
 */
export function parseAllAttributes (
  element: HTMLElement,
  fallback: RawConfig,
): RawConfig {
  const rawConfig: Partial<RawConfig> = {}
  for (const key of Object.keys(CONFIG_SCHEMA) as (keyof RawConfig)[]) {
    const field = CONFIG_SCHEMA[key]
    rawConfig[key] = getAttributeByType(
      element,
      field.attribute,
      field.type,
      fallback[key],
    )
  }

  return rawConfig as RawConfig
}

/**
 * Parses a single attribute by its HTML attribute name into the raw config.
 * Returns the config key that was updated, or undefined if unknown.
 */
export function parseSingleAttribute (
  element: HTMLElement,
  attributeName: string,
): Partial<Config> | null {
  const key = ATTRIBUTE_TO_KEY.get(attributeName)
  if (!key) {
    // Unknown attribute
    return null
  }

  const field = CONFIG_SCHEMA[key]
  const raw: Partial<RawConfig> = {
    [key]: getAttributeByType(
      element,
      field.attribute,
      field.type,
      null,
    ),
  }

  return {
    [key]: resolveField(key, raw),
  } as Partial<Config>
}
