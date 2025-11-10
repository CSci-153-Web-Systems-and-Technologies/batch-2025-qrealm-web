import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark: string
    light: string
  }
}

export class EventQRGenerator {
  /**
   * Generate a unique event code
   */
  static generateEventCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

/**
 * Generate QR code as Data URL
 */
static async generateQRCodeDataURL(
  eventCode: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  // Update this line to use /event/ instead of /e/
  const eventUrl = `${process.env.NEXTAUTH_URL}/event/${eventCode}`
  
  const qrOptions = {
    width: options.width || 300,
    margin: options.margin || 2,
    color: options.color || {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }

  try {
    const qrDataURL = await QRCode.toDataURL(eventUrl, qrOptions)
    return qrDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

  /**
   * Generate QR code and return both code and image
   */
  static async generateEventQRCode(
    options?: QRCodeOptions
  ): Promise<{ code: string; qrCodeUrl: string }> {
    const code = this.generateEventCode()
    const qrCodeUrl = await this.generateQRCodeDataURL(code, options)
    
    return { code, qrCodeUrl }
  }
}