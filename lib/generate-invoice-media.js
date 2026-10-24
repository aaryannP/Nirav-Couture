'use client';

/**
 * ERA43 Haute Couture — High-Resolution Invoice Media Generator
 * Generates crisp Image (PNG) and PDF documents client-side with zero server strain,
 * and facilitates direct WhatsApp file sharing via the native Web Share API.
 */

// Helper to format currency
const formatINR = (num) => '₹' + Number(num || 0).toLocaleString('en-IN');

// Convert number to words
function getAmountInWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    } else {
      str += a[n];
    }
    return str;
  };

  let n = Math.floor(num || 0);
  if (n === 0) return 'Zero Rupees Only';

  let output = '';
  if (Math.floor(n / 10000000) > 0) {
    output += inWords(Math.floor(n / 10000000)) + 'Crore ';
    n %= 10000000;
  }
  if (Math.floor(n / 100000) > 0) {
    output += inWords(Math.floor(n / 100000)) + 'Lakh ';
    n %= 100000;
  }
  if (Math.floor(n / 1000) > 0) {
    output += inWords(Math.floor(n / 1000)) + 'Thousand ';
    n %= 1000;
  }
  if (Math.floor(n / 100) > 0) {
    output += inWords(Math.floor(n / 100)) + 'Hundred ';
    n %= 100;
  }
  if (n > 0) {
    output += inWords(n);
  }
  return output.trim() + ' Rupees Only';
}

/**
 * Render luxury receipt onto an HTML5 Canvas at 2x resolution for retina sharpness.
 */
export async function renderInvoiceToCanvas(order) {
  if (typeof window === 'undefined') return null;

  const orderId = order.id || 'ERA-ORD-000000';
  const orderDate = order.date || new Date().toISOString().split('T')[0];
  const customerName = order.customerName || order.name || 'Valued Customer';
  const customerPhone = order.phone || '';
  const shippingAddress = order.shippingAddress || order.address || 'Address on file';
  const paymentMethod = order.paymentMethod || 'Cash on Delivery (COD)';
  const items = Array.isArray(order.items) ? order.items : [];
  const finalTotal = Number(order.finalTotal || order.totalAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const subtotal = Number(order.totalAmount || (finalTotal + discountAmount));

  const taxableValue = Math.round((finalTotal / 1.18) * 100) / 100;
  const gstAmount = Math.round((finalTotal - taxableValue) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount / 2) * 100) / 100;

  // Dynamic canvas height based on item rows
  const width = 1200;
  const baseHeight = 1500;
  const itemsExtraHeight = Math.max(0, (items.length - 3) * 60);
  const height = baseHeight + itemsExtraHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer Luxury Border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Inner Gold Accent Line
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // HEADER SECTION
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif';
  ctx.fillText('ERA43', 70, 115);

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('LUXURY STREETWEAR & HAUTE COUTURE', 70, 142);

  ctx.fillStyle = '#444444';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('ERA43 Apparels Pvt. Ltd.', 70, 175);
  ctx.fillText('Odhav Industrial Estate, Ahmedabad, Gujarat – 382415', 70, 200);
  ctx.fillText('GSTIN: 24AAACE4343K1Z5  |  State: Gujarat (24)', 70, 225);
  ctx.fillText('Email: support@era43.com  |  Phone: +91 79906 29029', 70, 250);

  // Right Header: Tax Invoice Badge
  ctx.fillStyle = '#000000';
  ctx.fillRect(width - 380, 75, 310, 42);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TAX INVOICE / CASH BILL', width - 225, 102);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Invoice No:`, width - 380, 150);
  ctx.fillText(`Date:`, width - 380, 180);
  ctx.fillText(`Payment Mode:`, width - 380, 210);

  ctx.fillStyle = '#333333';
  ctx.font = '17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(orderId, width - 250, 150);
  ctx.fillText(orderDate, width - 250, 180);
  ctx.fillText(paymentMethod, width - 250, 210);

  // Divider Line
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 280);
  ctx.lineTo(width - 60, 280);
  ctx.stroke();

  // BILL TO SECTION
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('BILLED TO (CUSTOMER DETAILS)', 70, 315);

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Name: ${customerName}`, 70, 350);

  ctx.fillStyle = '#444444';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Contact: +91 ${customerPhone || 'N/A'}`, 70, 380);

  // Address wrapping
  const maxAddrWidth = width - 140;
  ctx.fillText(`Delivery Address: ${shippingAddress.substring(0, 120)}`, 70, 410);

  // TABLE HEADER
  const tableTop = 460;
  ctx.fillStyle = '#F4F4F5';
  ctx.fillRect(60, tableTop, width - 120, 45);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, tableTop, width - 120, 45);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('#', 80, tableTop + 28);
  ctx.fillText('ITEM DESCRIPTION & SIZE', 130, tableTop + 28);
  ctx.fillText('HSN CODE', 680, tableTop + 28);
  ctx.fillText('QTY', 810, tableTop + 28);
  ctx.fillText('RATE (₹)', 900, tableTop + 28);
  ctx.fillText('AMOUNT (₹)', 1030, tableTop + 28);

  // TABLE ROWS
  let currentY = tableTop + 45;
  items.forEach((item, index) => {
    const itemTotal = (item.price || 0) * (item.qty || 1);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, currentY + 50);
    ctx.lineTo(width - 60, currentY + 50);
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${index + 1}`, 80, currentY + 32);

    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const titleText = `${item.title || 'Apparel'} (Size: ${item.selectedSize || 'M'})`;
    ctx.fillText(titleText.substring(0, 48), 130, currentY + 32);

    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#555555';
    ctx.fillText('61091000', 680, currentY + 32);

    ctx.fillStyle = '#111111';
    ctx.fillText(`${item.qty || 1}`, 820, currentY + 32);
    ctx.fillText(`${Number(item.price || 0).toLocaleString('en-IN')}`, 900, currentY + 32);

    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${itemTotal.toLocaleString('en-IN')}`, 1030, currentY + 32);

    currentY += 50;
  });

  // TOTALS SECTION
  currentY += 20;
  const totalsTop = currentY;

  // Left Column: Words & Tax Note
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Invoice Value in Words:', 70, totalsTop + 30);
  ctx.font = 'italic 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif';
  ctx.fillStyle = '#333333';
  ctx.fillText(getAmountInWords(finalTotal), 70, totalsTop + 60);

  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#666666';
  ctx.fillText('Tax Breakup (18% GST Included):', 70, totalsTop + 110);
  ctx.fillText(`• Taxable Base: ${formatINR(taxableValue)}`, 70, totalsTop + 135);
  ctx.fillText(`• CGST (9%): ${formatINR(cgst)}   |   SGST (9%): ${formatINR(sgst)}`, 70, totalsTop + 160);

  // Right Column: Summary Box
  const summaryX = width - 450;
  ctx.fillStyle = '#F9FAFB';
  ctx.fillRect(summaryX, totalsTop, 390, 200);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(summaryX, totalsTop, 390, 200);

  ctx.fillStyle = '#111111';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Subtotal:', summaryX + 25, totalsTop + 40);
  ctx.fillText(formatINR(subtotal), summaryX + 260, totalsTop + 40);

  if (discountAmount > 0) {
    ctx.fillStyle = '#059669';
    ctx.fillText('Discount Savings:', summaryX + 25, totalsTop + 75);
    ctx.fillText(`- ${formatINR(discountAmount)}`, summaryX + 260, totalsTop + 75);
  }

  ctx.fillStyle = '#111111';
  ctx.fillText('Shipping & Handling:', summaryX + 25, totalsTop + (discountAmount > 0 ? 110 : 85));
  ctx.fillText('FREE (Complimentary)', summaryX + 210, totalsTop + (discountAmount > 0 ? 110 : 85));

  // Grand Total Banner
  const grandY = totalsTop + 140;
  ctx.fillStyle = '#000000';
  ctx.fillRect(summaryX, grandY, 390, 60);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('GRAND TOTAL:', summaryX + 25, grandY + 38);
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(formatINR(finalTotal), summaryX + 230, grandY + 40);

  // FOOTER SECTION
  const footerTop = height - 210;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, footerTop);
  ctx.lineTo(width - 60, footerTop);
  ctx.stroke();

  ctx.fillStyle = '#333333';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Terms & Conditions:', 70, footerTop + 35);
  ctx.fillStyle = '#666666';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('1. Goods covered under ERA43 10-day replacement policy with intact tags.', 70, footerTop + 60);
  ctx.fillText('2. Computer-generated tax invoice. Authenticity verified by ERA43 systems.', 70, footerTop + 85);
  ctx.fillText('3. Track your consignment anytime at www.era43.com', 70, footerTop + 110);

  // Signatory
  ctx.fillStyle = '#111111';
  ctx.font = 'italic bold 22px serif';
  ctx.fillText('Nirav Prajapati', width - 290, footerTop + 50);

  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('AUTHORIZED SIGNATORY', width - 290, footerTop + 75);
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#666666';
  ctx.fillText('ERA43 Apparels Pvt. Ltd.', width - 290, footerTop + 95);

  return canvas;
}

/**
 * Generate high-res PNG image of the invoice
 */
export async function generateInvoiceImage(order) {
  const canvas = await renderInvoiceToCanvas(order);
  if (!canvas) throw new Error('Canvas not available');

  const orderId = order.id || 'ERA-ORD-000000';
  const filename = `ERA43_Invoice_${orderId}.png`;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], filename, { type: 'image/png' });
      const dataUrl = canvas.toDataURL('image/png');
      resolve({ blob, file, dataUrl, filename });
    }, 'image/png', 0.95);
  });
}

/**
 * Generate vector/raster PDF document of the invoice using jsPDF
 */
export async function generateInvoicePDF(order) {
  const canvas = await renderInvoiceToCanvas(order);
  if (!canvas) throw new Error('Canvas not available');

  const orderId = order.id || 'ERA-ORD-000000';
  const filename = `ERA43_Invoice_${orderId}.pdf`;

  // Dynamically import jsPDF to ensure client-only execution
  const { jsPDF } = await import('jspdf');

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  const blob = pdf.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });
  const dataUrl = URL.createObjectURL(blob);

  return { blob, file, dataUrl, pdf, filename };
}

/**
 * Helper to trigger browser download
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
