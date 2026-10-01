// Cache para evitar getComputedStyle costoso en cada frame
const styleCache = new WeakMap()

export function getCustomProperty(elem, prop) {
  if (!styleCache.has(elem)) {
    styleCache.set(elem, {})
  }
  const cache = styleCache.get(elem)
  
  // Si no está en cache, leer del DOM (solo primera vez)
  if (cache[prop] === undefined) {
    cache[prop] = parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0
  }
  
  return cache[prop]
}

export function setCustomProperty(elem, prop, value) {
  if (!styleCache.has(elem)) {
    styleCache.set(elem, {})
  }
  const cache = styleCache.get(elem)
  
  // Actualizar cache y DOM solo si el valor cambia significativamente para evitar thrashing
  if (cache[prop] !== value) {
    cache[prop] = value
    elem.style.setProperty(prop, value)
  }
}

export function incrementCustomProperty(elem, prop, inc) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc)
}