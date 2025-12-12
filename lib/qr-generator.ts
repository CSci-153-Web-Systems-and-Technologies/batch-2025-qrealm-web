import QRCode from "qrcode"

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
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result
  }

  /**
   * Get the event URL
   */
  private static getEventUrl(eventCode: string): string {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "") ||
      "http://localhost:3000"; // Development fallback
    if (!baseUrl) {
      console.warn("No base URL found for QR code generation");
      throw new Error(
        "NEXT_PUBLIC_APP_URL environment variable is not defined"
      );
    }
    return `${baseUrl}/event/${eventCode}`;
  }

  /**
   * Generate QR code as Data URL
   */
  static async generateQRCodeDataURL(
    eventCode: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const eventUrl = this.getEventUrl(eventCode);

    const qrOptions = {
      width: options.width || 300,
      margin: options.margin || 2,
      color: options.color || {
        dark: "#000000",
        light: "#FFFFFF",
      },
    };

    try {
      return await QRCode.toDataURL(eventUrl, qrOptions);
    } catch (error) {
      console.error("Error generating QR code Data URL:", error);
      throw new Error("Failed to generate QR code Data URL");
    }
  }

  /**
   * Generate SVG string
   */
  static async generateQRCodeSvg(
    eventCode: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const eventUrl = this.getEventUrl(eventCode);
    try {
      return await QRCode.toString(eventUrl, {
        type: "svg",
        width: options.width || 300,
        margin: options.margin || 2,
        color: options.color,
        errorCorrectionLevel: "H",
      });
    } catch (error) {
      console.error("Error generating SVG QR code:", error);
      throw new Error("Failed to generate SVG QR code");
    }
  }

  /**
   * Generate high-res PNG Blob (for downloads)
   */
  static async generateQRCodePngBlob(
    eventCode: string,
    options: QRCodeOptions = {}
  ): Promise<Blob> {
    const eventUrl = this.getEventUrl(eventCode);

    try {
      // Browser-compatible method: create canvas and convert to blob
      const canvas = document.createElement("canvas");
      const qrOptions = {
        width: options.width || 2000,
        margin: options.margin || 2,
        color: options.color || {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H" as const,
      };

      // Draw QR code to canvas
      await QRCode.toCanvas(canvas, eventUrl, qrOptions);

      // Convert canvas to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        }, "image/png");
      });
    } catch (error) {
      console.error("Error generating PNG Blob:", error);
      throw new Error("Failed to generate PNG Blob");
    }
  }

  /**
   * Generate PNG as Data URL (browser-friendly)
   */
  static async generateQRCodePngBlobFromDataURL(
    eventCode: string,
    options: QRCodeOptions = {}
  ): Promise<Blob> {
    try {
      const dataUrl = await this.generateQRCodeDataURL(eventCode, {
        ...options,
        width: options.width || 2000,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error("Error generating PNG Blob from Data URL:", error);
      throw new Error("Failed to generate PNG Blob");
    }
  }

  /**
   * Generate QR code and return code + data URL (server-safe)
   */
  static async generateEventQRCode(
    options?: QRCodeOptions
  ): Promise<{
    code: string
    qrCodeUrl: string
    svg?: string
  }> {
    const code = this.generateEventCode()

    // Server-safe generation: avoid DOM/Blob APIs
    const [qrCodeUrl, svg] = await Promise.all([
      this.generateQRCodeDataURL(code, { ...options, width: options?.width || 300 }),
      this.generateQRCodeSvg(code, { ...options, width: options?.width || 300 })
    ])

    return {
      code,
      qrCodeUrl,
      svg
    }
  }

  /**
   * Helper to convert Blob to Data URL
   */
  private static blobToDataURL(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert Blob to Data URL"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static async downloadQRCode(
    eventCode: string,
    filename: string,
    options: QRCodeOptions = {}
  ): Promise<void> {
    const blob = await this.generateQRCodePngBlobFromDataURL(
      eventCode,
      options
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
