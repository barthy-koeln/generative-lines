import { download } from './file'
import type { LinesCanvas } from '../lines-canvas'

describe('download', () => {
  let mockLinesCanvas: LinesCanvas
  let mockCaptureImage: jest.Mock
  let mockCreateElement: jest.Mock
  let mockRandomUUID: jest.Mock
  let mockLink: HTMLAnchorElement

  beforeEach(() => {
    mockCaptureImage = jest.fn(() => 'data:image/png;base64,test')

    mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    } as unknown as HTMLAnchorElement

    mockCreateElement = jest.fn(() => mockLink)

    mockRandomUUID = jest.fn(() => 'test-uuid-123')

    mockLinesCanvas = {
      renderer: {
        captureImage: mockCaptureImage,
      },
    } as unknown as LinesCanvas

    Object.defineProperty(window, 'crypto', {
      value: {
        randomUUID: mockRandomUUID,
      },
      writable: true,
    })

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true,
    })

    jest.clearAllMocks()
  })

  it('creates an anchor element', () => {
    download(mockLinesCanvas)

    expect(mockCreateElement).toHaveBeenCalledWith('a')
  })

  it('calls captureImage on renderer', () => {
    download(mockLinesCanvas)

    expect(mockCaptureImage).toHaveBeenCalled()
  })

  it('sets the href to the captured image data', () => {
    download(mockLinesCanvas)

    expect(mockLink.href).toBe('data:image/png;base64,test')
  })

  it('generates a UUID for the filename', () => {
    download(mockLinesCanvas)

    expect(mockRandomUUID).toHaveBeenCalled()
  })

  it('sets the download attribute with correct filename format', () => {
    download(mockLinesCanvas)

    expect(mockLink.download).toBe('generative_lines-test-uuid-123.png')
  })

  it('clicks the link to trigger download', () => {
    download(mockLinesCanvas)

    expect(mockLink.click).toHaveBeenCalled()
  })
})
