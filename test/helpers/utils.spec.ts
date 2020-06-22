import { isArray, isString } from '../../src/helpers/utils'

describe('helpers:utils', () => {
  test('should validate Array', () => {
    expect(isArray([])).toBeTruthy()
  })

  test('should validate String', () => {
    expect(isString('')).toBeTruthy()
  })
})
