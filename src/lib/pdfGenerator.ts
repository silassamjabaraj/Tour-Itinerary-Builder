import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  quality?: number;
  scale?: number;
}

export async function exportElementToPdf(
  elementId: string,
  fileName: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  options?: PdfExportOptions
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return false;
  }

  const cleanFileName = (fileName || 'itinerary-document')
    .replace(/[^\w\d-_.]/g, '_')
    .replace(/\.pdf$/i, '');

  try {
    let canvas: HTMLCanvasElement | null = null;

    // Primary Engine: html-to-image (fully compatible with Tailwind 4, oklch colors & CSS custom variables)
    try {
      canvas = await htmlToImage.toCanvas(element, {
        quality: options?.quality || 0.98,
        pixelRatio: options?.scale || 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
    } catch (primaryErr) {
      console.warn('html-to-image primary rasterizer warning, falling back to html2canvas:', primaryErr);
    }

    // Secondary Engine: html2canvas fallback
    if (!canvas) {
      canvas = await html2canvas(element, {
        scale: options?.scale || 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Failed to rasterize document canvas');
    }

    const isLandscape = orientation === 'landscape';
    const pageWidthMm = isLandscape ? 297 : 210;
    const pageHeightMm = isLandscape ? 210 : 297;

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate how many canvas pixels fit on a single A4 page
    const pageAspectRatio = pageHeightMm / pageWidthMm;
    const pageHeightPx = Math.floor(canvasWidth * pageAspectRatio);

    const totalPages = Math.max(1, Math.ceil(canvasHeight / pageHeightPx));

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage(isLandscape ? [297, 210] : [210, 297], orientation);
      }

      const sourceY = i * pageHeightPx;
      const currentSliceHeight = Math.min(pageHeightPx, canvasHeight - sourceY);

      // Create high-res sub-canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = currentSliceHeight;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, canvasWidth, currentSliceHeight);
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvasWidth,
          currentSliceHeight,
          0,
          0,
          canvasWidth,
          currentSliceHeight
        );

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const renderHeightMm = (currentSliceHeight / canvasWidth) * pageWidthMm;

        pdf.addImage(
          imgData,
          'JPEG',
          0,
          0,
          pageWidthMm,
          renderHeightMm,
          undefined,
          'FAST'
        );
      }
    }

    // Trigger reliable browser download via Blob
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = `${cleanFileName}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return true;
  } catch (err) {
    console.error('Critical PDF generation error:', err);
    // Tertiary Fallback: trigger print dialog for saving as PDF
    try {
      printElement(elementId);
      return true;
    } catch {
      return false;
    }
  }
}

export function printElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for printing.`);
    return;
  }

  // Method 1: Cloned styles in hidden printable container + iframe
  try {
    const existingFrame = document.getElementById('print-service-iframe');
    if (existingFrame) {
      existingFrame.remove();
    }

    const printIframe = document.createElement('iframe');
    printIframe.id = 'print-service-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.top = '-10000px';
    printIframe.style.left = '-10000px';
    printIframe.style.width = '1000px';
    printIframe.style.height = '1000px';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentWindow?.document;
    if (iframeDoc) {
      // Gather all stylesheets and inline styles from the current document
      const styleElements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join('\n');

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Print Document</title>
            ${styleElements}
            <style>
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              html, body {
                background: #ffffff !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 12px !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div class="print-content" style="max-width: 100%; margin: 0 auto;">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch (iframeErr) {
          console.warn('Iframe print failed or blocked, falling back to window.print():', iframeErr);
          window.print();
        }

        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 4000);
      }, 300);

      return;
    }
  } catch (err) {
    console.warn('Iframe print creation error, falling back to standard window.print():', err);
  }

  // Method 2: Direct window.print fallback
  try {
    window.focus();
    window.print();
  } catch (e) {
    console.error('Failed to trigger window.print:', e);
  }
}

