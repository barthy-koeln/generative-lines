type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

/**
 * Creates a diff object for a flat object of primitive values (arrays and nested objects only compared by reference)
 * @param base
 * @param incoming
 */
export function diff<ObjectType extends Record<any, any>> (base: ObjectType, incoming: ObjectType) {
  const configUpdate: Partial<ObjectType> = {}
  for (const [key, value] of Object.entries(incoming) as Entries<ObjectType>) {
    if (value !== base[key]) {
      configUpdate[key] = value
    }
  }

  return configUpdate
}