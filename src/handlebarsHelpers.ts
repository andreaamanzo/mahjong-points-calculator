import Handlebars from 'handlebars'

export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('eq', (a, b) => a === b)
  Handlebars.registerHelper('neq', (a, b) => a !== b)
  Handlebars.registerHelper('lt', (a, b) => a < b)
  Handlebars.registerHelper('gt', (a, b) => a > b)
  Handlebars.registerHelper('inRange', (a, min, max) => a >= min && a <= max)
  Handlebars.registerHelper('emptySlots', (count, max) => {
    const diff = max - count
    return new Array(diff).fill(null)
  })
}
