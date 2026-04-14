import { useCachedGradient } from './colors'

describe('useCachedGradient', () => {
  let mockContext: CanvasRenderingContext2D
  let mockCreateLinearGradient: jest.Mock
  let mockGradient: CanvasGradient
  let mockAddColorStop: jest.Mock

  beforeEach(() => {
    mockAddColorStop = jest.fn()
    mockGradient = {
      addColorStop: mockAddColorStop,
    } as unknown as CanvasGradient

    mockCreateLinearGradient = jest.fn(() => mockGradient)

    mockContext = {
      createLinearGradient: mockCreateLinearGradient,
    } as unknown as CanvasRenderingContext2D

    jest.clearAllMocks()
  })

  it('creates a gradient with the correct parameters', () => {
    const { createGradient } = useCachedGradient()
    const colors = ['#ff0000', '#00ff00']

    const result = createGradient(mockContext, 0, 100, colors)

    expect(mockCreateLinearGradient).toHaveBeenCalledWith(0, 0, 100, 0)
    expect(result).toBe(mockGradient)
  })

  it('adds color stops at correct positions for two colors', () => {
    const { createGradient } = useCachedGradient()
    const colors = ['#ff0000', '#00ff00']

    createGradient(mockContext, 0, 100, colors)

    expect(mockAddColorStop).toHaveBeenNthCalledWith(1, 0, '#ff0000')
    expect(mockAddColorStop).toHaveBeenNthCalledWith(2, 1, '#00ff00')
  })

  it('calculates correct color stop positions for three colors', () => {
    const { createGradient } = useCachedGradient()
    const colors = ['#ff0000', '#00ff00', '#0000ff']

    createGradient(mockContext, 0, 100, colors)

    expect(mockAddColorStop).toHaveBeenNthCalledWith(1, 0, '#ff0000')
    expect(mockAddColorStop).toHaveBeenNthCalledWith(2, 0.5, '#00ff00')
    expect(mockAddColorStop).toHaveBeenNthCalledWith(3, 1, '#0000ff')
  })

  it('caches gradient when same color array is used', () => {
    const { createGradient } = useCachedGradient()
    const colors = ['#ff0000', '#00ff00']

    createGradient(mockContext, 0, 100, colors)
    const secondCall = createGradient(mockContext, 0, 100, colors)

    expect(mockCreateLinearGradient).toHaveBeenCalledTimes(1)
    expect(secondCall).toBe(mockGradient)
  })

  it('recreates gradient when different color array is used despite equal value', () => {
    const { createGradient } = useCachedGradient()
    const colors1 = ['#ff0000', '#00ff00']
    const colors2 = ['#ff0000', '#00ff00']

    createGradient(mockContext, 0, 100, colors1)
    createGradient(mockContext, 0, 100, colors2)

    expect(mockCreateLinearGradient).toHaveBeenCalledTimes(2)
  })

  it('handles single color gradient', () => {
    const { createGradient } = useCachedGradient()
    const colors = ['#ff0000']

    expect(() => createGradient(mockContext, 0, 100, colors)).toThrow(
      'Gradient requires at least two colors'
    )
  })

  it('handles five colors with correct spacing', () => {
    const { createGradient } = useCachedGradient()
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff']

    createGradient(mockContext, 0, 200, colors)

    expect(mockAddColorStop).toHaveBeenNthCalledWith(1, 0, '#ff0000')
    expect(mockAddColorStop).toHaveBeenNthCalledWith(2, 0.25, '#00ff00')
    expect(mockAddColorStop).toHaveBeenNthCalledWith(3, 0.5, '#0000ff')
    expect(mockAddColorStop).toHaveBeenNthCalledWith(4, 0.75, '#ffff00')
    expect(mockAddColorStop).toHaveBeenNthCalledWith(5, 1, '#00ffff')
  })
})
