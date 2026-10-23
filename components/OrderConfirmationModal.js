'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';

export default function OrderConfirmationModal({ order, onClose }) {
  const [copied, setCopied] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(false);
  const [showWhatsAppShare, setShowWhatsAppShare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const invoiceRef = useRef(null);

  if (!order) return null;

  const orderId = order.id || 'ERA-ORD-000000';
  const orderDate = order.date || new Date().toISOString().split('T')[0];
  const customerName = order.customerName || order.name || 'Valued Customer';
  const customerPhone = order.phone || '';
  const customerEmail = order.customerEmail || order.email || '';
  const shippingAddress = order.shippingAddress || order.address || '';
  const paymentMethod = order.paymentMethod || 'Cash on Delivery (COD)';
  const status = order.status || order.orderStatus || 'CONFIRMED';
  const items = Array.isArray(order.items) ? order.items : [];
  const finalTotal = Number(order.finalTotal || order.totalAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const subtotal = Number(order.totalAmount || (finalTotal + discountAmount));

  // GST 18% calculation for bill
  const taxableValue = Math.round((finalTotal / 1.18) * 100) / 100;
  const gstAmount = Math.round((finalTotal - taxableValue) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount / 2) * 100) / 100;

  const handleCopyId = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Convert numbers to Indian Rupee Words for official bill
  const numberToWords = (num) => {
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

    let n = Math.floor(num);
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
  };

  /**
   * BULLETPROOF 1-PAGE PRINTING:
   * Uses an isolated hidden iframe with zero parent-page styling or DOM height interference.
   * Completely eliminates the 4-7 blank pages bug!
   */
  const handlePrint = () => {
    let printIframe = document.getElementById('era43-print-frame');
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'era43-print-frame';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);
    }

    const billHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Tax Invoice - ${orderId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #000000;
              background: #FFFFFF;
              font-size: 11px;
              line-height: 1.4;
              padding: 6px;
            }
            .invoice-wrapper {
              border: 1.5px solid #000000;
              padding: 18px 20px;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #000000;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .logo {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: 0.15em;
              text-transform: uppercase;
            }
            .company-info {
              font-size: 10px;
              color: #333333;
              line-height: 1.4;
              margin-top: 4px;
            }
            .tax-badge {
              background: #000000;
              color: #FFFFFF;
              display: inline-block;
              padding: 4px 12px;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              margin-bottom: 6px;
            }
            .meta-text {
              font-size: 10.5px;
              line-height: 1.5;
            }
            .address-grid {
              display: table;
              width: 100%;
              border-bottom: 1px solid #000000;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .address-col {
              display: table-cell;
              width: 50%;
              vertical-align: top;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            .items-table th {
              background: #F4F4F5;
              border-top: 1px solid #000000;
              border-bottom: 1px solid #000000;
              padding: 7px 8px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .items-table td {
              border-bottom: 1px solid #E5E7EB;
              padding: 7px 8px;
              font-size: 10.5px;
            }
            .totals-grid {
              display: table;
              width: 100%;
              border-top: 1px solid #000000;
              padding-top: 10px;
              margin-bottom: 14px;
            }
            .totals-left {
              display: table-cell;
              width: 55%;
              vertical-align: top;
              padding-right: 15px;
            }
            .totals-right {
              display: table-cell;
              width: 45%;
              vertical-align: top;
            }
            .footer-grid {
              display: table;
              width: 100%;
              border-top: 1px solid #000000;
              padding-top: 10px;
              font-size: 9.5px;
              color: #444444;
            }
            .footer-left {
              display: table-cell;
              width: 65%;
              vertical-align: bottom;
            }
            .footer-right {
              display: table-cell;
              width: 35%;
              text-align: center;
              vertical-align: bottom;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <table class="header-table" style="width: 100%;">
              <tr>
                <td style="vertical-align: top;">
                  <div class="logo">ERA43</div>
                  <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 4px;">
                    Luxury Streetwear & Haute Couture
                  </div>
                  <div class="company-info">
                    <strong>ERA43 Apparels Pvt. Ltd.</strong><br/>
                    Odhav Industrial Estate, Ahmedabad, Gujarat – 382415<br/>
                    GSTIN: <strong>24AAACE4343K1Z5</strong> | State Code: 24 (Gujarat)<br/>
                    Email: support@era43.com | Phone: +91 79906 29029
                  </div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <div class="tax-badge">TAX INVOICE</div>
                  <div class="meta-text">
                    <div><strong>Invoice No:</strong> INV-${orderId.replace('ERA-ORD-', '')}</div>
                    <div><strong>Order Ref:</strong> ${orderId}</div>
                    <div><strong>Date:</strong> ${orderDate}</div>
                    <div><strong>Payment:</strong> ${paymentMethod}</div>
                    <div><strong>Status:</strong> ${status}</div>
                  </div>
                </td>
              </tr>
            </table>

            <div class="address-grid">
              <div class="address-col">
                <div style="font-size: 9.5px; font-weight: 900; text-transform: uppercase; color: #555; margin-bottom: 3px;">
                  BILLED & SHIPPED TO:
                </div>
                <div style="font-size: 12px; font-weight: 800;">${customerName}</div>
                <div style="font-size: 10.5px; color: #222; margin-top: 2px;">
                  ${shippingAddress}<br/>
                  Phone: ${customerPhone || 'N/A'}<br/>
                  Email: ${customerEmail || 'N/A'}
                </div>
              </div>
              <div class="address-col" style="text-align: right;">
                <div style="font-size: 10px; color: #333; line-height: 1.5;">
                  <div><strong>Place of Supply:</strong> Gujarat (24)</div>
                  <div><strong>Reverse Charge:</strong> No</div>
                  <div><strong>Invoice Type:</strong> Regular B2C Tax Invoice</div>
                  <div><strong>Fulfillment Hub:</strong> ERA43 Central Logistics</div>
                </div>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align: left; width: 30px;">#</th>
                  <th style="text-align: left;">Description of Goods</th>
                  <th style="text-align: center; width: 65px;">HSN</th>
                  <th style="text-align: center; width: 45px;">Size</th>
                  <th style="text-align: center; width: 40px;">Qty</th>
                  <th style="text-align: right; width: 75px;">Rate (₹)</th>
                  <th style="text-align: right; width: 85px;">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>
                      <strong>${item.title || 'ERA43 Apparel'}</strong>
                      <div style="font-size: 9px; color: #666;">100% Luxury Bio-Washed Combed Cotton</div>
                    </td>
                    <td style="text-align: center; font-family: monospace;">61091000</td>
                    <td style="text-align: center; font-weight: 700;">${item.selectedSize || 'M'}</td>
                    <td style="text-align: center;">${item.qty || 1}</td>
                    <td style="text-align: right;">₹${(item.price || 0).toLocaleString('en-IN')}</td>
                    <td style="text-align: right; font-weight: 700;">
                      ₹${((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-grid">
              <div class="totals-left">
                <div style="font-size: 10px; margin-bottom: 6px;">
                  <strong>Amount in Words:</strong><br/>
                  <em>${numberToWords(finalTotal)}</em>
                </div>
                <div style="border: 1px dashed #777; padding: 6px 8px; border-radius: 4px; font-size: 9.5px; background: #FAFAFA;">
                  <strong>Tax Breakup (18% GST Included):</strong><br/>
                  Taxable Value: ₹${taxableValue.toLocaleString('en-IN')}<br/>
                  CGST @ 9%: ₹${cgst.toLocaleString('en-IN')} | SGST @ 9%: ₹${sgst.toLocaleString('en-IN')}
                </div>
              </div>
              <div class="totals-right">
                <table style="width: 100%; font-size: 10.5px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 3px 0; color: #444;">Gross Subtotal:</td>
                    <td style="padding: 3px 0; text-align: right; font-weight: 600;">₹${subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  ${discountAmount > 0 ? `
                    <tr>
                      <td style="padding: 3px 0; color: #059669;">Discount:</td>
                      <td style="padding: 3px 0; text-align: right; color: #059669; font-weight: 600;">-₹${discountAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 3px 0; color: #444;">Express Shipping:</td>
                    <td style="padding: 3px 0; text-align: right; font-weight: 700; color: #059669;">FREE</td>
                  </tr>
                  <tr style="border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
                    <td style="padding: 6px 0; font-weight: 900; font-size: 12px;">TOTAL PAYABLE:</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 900; font-size: 13px;">
                      ₹${finalTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="footer-grid">
              <div class="footer-left">
                <strong>Terms & Conditions:</strong><br/>
                1. Goods once sold are covered under ERA43 10-day replacement policy.<br/>
                2. Original brand tags must remain intact for returns/exchanges.<br/>
                3. This is a computer-generated tax invoice and requires no physical signature.
              </div>
              <div class="footer-right">
                <div style="font-family: serif; font-size: 13px; font-weight: bold; font-style: italic;">
                  Nirav Prajapati
                </div>
                <div style="border-top: 1px solid #444; padding-top: 3px; font-size: 9px; text-transform: uppercase;">
                  Authorized Signatory<br/>
                  <strong>ERA43 Apparels Pvt. Ltd.</strong>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const frameWindow = printIframe.contentWindow;
    if (frameWindow) {
      frameWindow.document.open();
      frameWindow.document.write(billHtml);
      frameWindow.document.close();

      setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();
      }, 300);
    } else {
      window.print();
    }
  };

  const getInvoiceUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://era43.com';
    return `${origin}/invoice/${orderId}`;
  };

  const generateWhatsAppMessage = () => {
    const invoiceUrl = getInvoiceUrl();
    return encodeURIComponent(
      `🧾 *ERA43 LUXURY HAUTE COUTURE — TAX INVOICE*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Order Ref:* ${orderId}\n` +
      `*Customer:* ${customerName}\n` +
      `*Status:* ${status}\n` +
      `*Payment:* ${paymentMethod}\n\n` +
      `📦 *Items:*\n` +
      items.map(i => `• ${i.title} (${i.selectedSize || 'M'}) × ${i.qty || 1} — ₹${((i.price || 0) * (i.qty || 1)).toLocaleString('en-IN')}`).join('\n') +
      `\n\n💰 *Total Amount:* ₹${finalTotal.toLocaleString('en-IN')} (Incl. 18% GST)\n` +
      `📍 *Delivery Destination:* ${shippingAddress}\n\n` +
      `📄 *View / Download Official PDF Tax Invoice:* \n${invoiceUrl}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Thank you for choosing ERA43 Luxury.`
    );
  };

  const handleSendWhatsApp = (target) => {
    const text = generateWhatsAppMessage();
    let url = `https://api.whatsapp.com/send?text=${text}`;

    if (target === 'self' && customerPhone) {
      const cleanPhone = customerPhone.replace(/\D/g, '');
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${fullPhone}?text=${text}`;
    } else if (target === 'store') {
      const storePhone = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '917990629029';
      url = `https://wa.me/${storePhone}?text=${text}`;
    }

    window.open(url, '_blank');
  };

  const handleCopyInvoiceLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(getInvoiceUrl());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    setShowWhatsAppShare(true);
  };

  return (
    <div className="era43-order-modal-backdrop" onClick={onClose}>
      <style jsx global>{`
        .era43-order-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 10, 10, 0.82);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          overflow-y: auto;
        }

        .era43-order-modal-card {
          background: #FFFFFF;
          color: #111111;
          width: 100%;
          max-width: 720px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 24px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
          position: relative;
          padding: 36px 32px;
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* FALLBACK PRINT STYLES (If printed via browser menu Ctrl+P) */
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: #FFFFFF !important;
          }
          body > *:not(.era43-order-modal-backdrop) {
            display: none !important;
          }
          .era43-order-modal-backdrop {
            position: static !important;
            background: #FFFFFF !important;
            padding: 0 !important;
            display: block !important;
            overflow: visible !important;
          }
          .era43-order-modal-card {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .era43-no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="era43-order-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="era43-no-print"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#F4F4F5',
            border: 'none',
            fontSize: '1.1rem',
            color: '#666666',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          title="Close"
        >
          ✕
        </button>

        {/* ======================================================== */}
        {/* WHATSAPP SHARING DIALOG POPUP                             */}
        {/* ======================================================== */}
        {showWhatsAppShare && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(12, 13, 16, 0.96)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            padding: '36px 30px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowY: 'auto',
            animation: 'modalSlideUp 0.25s ease-out'
          }}>
            <button
              onClick={() => setShowWhatsAppShare(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#27272A',
                color: '#FFFFFF',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Back"
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#25D366',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '12px',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)'
              }}>
                💬
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFFFFF', margin: '0 0 6px' }}>
                Share Bill via WhatsApp
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.86rem', margin: 0, maxWidth: '440px', margin: '0 auto' }}>
                Select where you want to send this official order invoice receipt:
              </p>
            </div>

            {/* Sharing Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '20px' }}>
              {/* Option 1: Share to Anyone (Friend / Family / Group) */}
              <button
                type="button"
                onClick={() => handleSendWhatsApp('any')}
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #1EBE5D 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.94rem', fontWeight: '800' }}>
                    👥 Share with Anyone (Friend / Family / Group)
                  </div>
                  <div style={{ fontSize: '0.76rem', opacity: 0.95, marginTop: '2px' }}>
                    Opens WhatsApp contact selector to pick any person or chat
                  </div>
                </div>
                <span style={{ fontSize: '1.3rem', marginLeft: '12px' }}>→</span>
              </button>

              {/* Option 2: Send to My Own WhatsApp */}
              {customerPhone && (
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp('self')}
                  style={{
                    background: '#1F2937',
                    border: '1.5px solid var(--accent-gold)',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                      📱 Send to My Own WhatsApp (+91 {customerPhone})
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#9CA3AF', marginTop: '2px' }}>
                      Keep this official invoice and tracking link saved in your personal chat
                    </div>
                  </div>
                  <span style={{ fontSize: '1.3rem', color: 'var(--accent-gold)', marginLeft: '12px' }}>→</span>
                </button>
              )}

              {/* Option 3: Send to ERA43 Official Store Team */}
              <button
                type="button"
                onClick={() => handleSendWhatsApp('store')}
                style={{
                  background: '#18181B',
                  border: '1px solid #3F3F46',
                  color: '#E5E7EB',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>
                    🏢 Send to ERA43 Official Team (+91 79906 29029)
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#9CA3AF', marginTop: '1px' }}>
                    Confirm order directly with our fulfillment desk for priority dispatch
                  </div>
                </div>
                <span style={{ fontSize: '1.1rem', color: '#9CA3AF', marginLeft: '12px' }}>→</span>
              </button>
            </div>

            {/* PDF Attachment & Direct Link Section */}
            <div style={{
              background: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '14px',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '800', letterSpacing: '0.08em' }}>
                  📄 Attach PDF or Send Link
                </span>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700' }}>
                  Official GST Bill
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    background: '#27272A',
                    color: '#FFFFFF',
                    border: '1px solid #3F3F46',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📥</span> Download PDF File
                </button>

                <button
                  type="button"
                  onClick={handleCopyInvoiceLink}
                  style={{
                    background: linkCopied ? '#065F46' : '#27272A',
                    color: linkCopied ? '#A7F3D0' : '#FFFFFF',
                    border: '1px solid #3F3F46',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{linkCopied ? '✓' : '🔗'}</span> {linkCopied ? 'Link Copied!' : 'Copy Bill Link'}
                </button>
              </div>

              <p style={{ fontSize: '0.72rem', color: '#71717A', margin: '8px 0 0', textAlign: 'center' }}>
                💡 <em>Tip: Click 'Download PDF File' to save it, then attach the file in your WhatsApp chat!</em>
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: MODERN LUXURY ORDER SUCCESS MODAL                 */}
        {/* ======================================================== */}
        {!viewInvoice ? (
          <div>
            {/* Header Success Icon & Branding */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
                marginBottom: '16px'
              }}>
                ✓
              </div>

              <div style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#D4AF37',
                marginBottom: '4px'
              }}>
                ERA43 · HAUTE COUTURE
              </div>

              <h2 style={{
                fontFamily: 'var(--font-serif, "Playfair Display", serif)',
                fontSize: '1.9rem',
                fontWeight: '700',
                color: '#111111',
                margin: '0 0 8px'
              }}>
                Order Placed Successfully!
              </h2>

              <p style={{ color: '#6B7280', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
                Thank you, <strong style={{ color: '#111111' }}>{customerName}</strong>! Your wardrobe selection has been reserved and is scheduled for express luxury dispatch.
              </p>
            </div>

            {/* Order Reference & Tracking Pill Bar */}
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.08em', fontWeight: '700', display: 'block' }}>
                  ORDER REFERENCE
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: '800', color: '#111111', letterSpacing: '0.04em' }}>
                    {orderId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    style={{
                      background: copied ? '#ECFDF5' : '#E5E7EB',
                      color: copied ? '#059669' : '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.08em', fontWeight: '700', display: 'block' }}>
                  STATUS
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ECFDF5',
                  color: '#065F46',
                  border: '1px solid #A7F3D0',
                  borderRadius: '20px',
                  padding: '3px 12px',
                  fontSize: '0.76rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  marginTop: '2px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
                  {status}
                </span>
              </div>
            </div>

            {/* Logistics Grid: Shipping & Payment Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Shipping Address */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '16px 18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>📍</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151' }}>
                    Shipping Destination
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#111111', marginBottom: '2px' }}>
                  {customerName}
                </div>
                {customerPhone && (
                  <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '4px' }}>
                    📞 {customerPhone}
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: '1.4' }}>
                  {shippingAddress}
                </div>
              </div>

              {/* Payment Details */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '16px 18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>💳</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151' }}>
                    Payment Summary
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#111111', marginBottom: '4px' }}>
                  {paymentMethod}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    background: '#F3F4F6',
                    color: '#374151',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {paymentMethod.toLowerCase().includes('cash') ? 'Pay On Delivery' : 'Prepaid Online'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '600' }}>
                    🔒 256-Bit SSL Insured
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Order Table */}
            <div style={{
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{
                background: '#F9FAFB',
                padding: '12px 18px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#6B7280'
              }}>
                <span>Item Details</span>
                <span>Amount</span>
              </div>

              <div style={{ padding: '8px 18px' }}>
                {items.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>
                    No line items available
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F3F4F6',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {item.frontImage || item.image ? (
                          <img
                            src={item.frontImage || item.image}
                            alt={item.title}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', background: '#F4F4F5' }}
                          />
                        ) : (
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: '#111111',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: '800'
                          }}>
                            ERA
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#111111' }}>
                            {item.title}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '2px', fontSize: '0.75rem', color: '#6B7280' }}>
                            <span style={{ background: '#F3F4F6', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                              Size: {item.selectedSize || 'Standard'}
                            </span>
                            <span>Qty: {item.qty}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '0.92rem', color: '#111111' }}>
                        ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Calculation Footer */}
              <div style={{
                background: '#FAFAFA',
                padding: '16px 20px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                  <span>Subtotal:</span>
                  <span style={{ color: '#111111', fontWeight: '600' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '600' }}>
                    <span>Promotional Discount:</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                  <span>Insured Express Shipping:</span>
                  <span style={{ color: '#059669', fontWeight: '700' }}>FREE (COMPLIMENTARY)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF', fontSize: '0.75rem' }}>
                  <span>Estimated GST (18% Included):</span>
                  <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  marginTop: '4px',
                  borderTop: '1px solid #E5E7EB',
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  color: '#111111'
                }}>
                  <span>Total Amount:</span>
                  <span style={{ fontSize: '1.25rem', color: '#111111', fontFamily: 'var(--font-serif, serif)' }}>
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="era43-no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <button
                onClick={() => setViewInvoice(true)}
                style={{
                  background: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
                  color: '#D4AF37',
                  border: '1px solid #D4AF37',
                  padding: '13px 18px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🧾</span> View Tax Invoice
              </button>

              <button
                onClick={handlePrint}
                style={{
                  background: '#F3F4F6',
                  color: '#111111',
                  border: '1px solid #D1D5DB',
                  padding: '13px 18px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🖨️</span> Print Bill (1-Page)
              </button>

              <Link
                href={`/track-order?id=${orderId}`}
                style={{
                  background: '#F3F4F6',
                  color: '#111111',
                  border: '1px solid #D1D5DB',
                  padding: '13px 18px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🚚</span> Track Order
              </Link>

              <button
                onClick={handleWhatsApp}
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '13px 18px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>💬</span> WhatsApp Bill
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: OFFICIAL ERA43 GST TAX INVOICE BILL               */
          /* ======================================================== */
          <div>
            <div className="era43-no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '14px' }}>
              <button
                onClick={() => setViewInvoice(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4B5563',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Back to Order Summary
              </button>
              <button
                onClick={handlePrint}
                style={{
                  background: '#000000',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🖨️ Print Tax Invoice (1-Page)
              </button>
            </div>

            {/* Official Screen Invoice Preview */}
            <div
              ref={invoiceRef}
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: '1.5px solid #000000',
                padding: '24px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '0.15em', margin: 0, textTransform: 'uppercase' }}>
                    ERA43
                  </h1>
                  <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2px 0 6px', color: '#444' }}>
                    Luxury Streetwear & Haute Couture
                  </p>
                  <p style={{ fontSize: '0.75rem', margin: 0, color: '#333', lineHeight: '1.4' }}>
                    ERA43 Apparels Pvt. Ltd.<br />
                    Odhav Industrial Estate, Ahmedabad, Gujarat – 382415<br />
                    GSTIN: <strong>24AAACE4343K1Z5</strong> | State Code: 24 (Gujarat)<br />
                    Email: support@era43.com | Phone: +91 79906 29029
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: '#000000', color: '#FFFFFF', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>
                    TAX INVOICE
                  </div>
                  <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                    <div><strong>Invoice No:</strong> INV-{orderId.replace('ERA-ORD-', '')}</div>
                    <div><strong>Order Ref:</strong> {orderId}</div>
                    <div><strong>Date:</strong> {orderDate}</div>
                    <div><strong>Payment:</strong> {paymentMethod}</div>
                  </div>
                </div>
              </div>

              {/* Bill To & Ship To Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderBottom: '1px solid #000000', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', color: '#555' }}>
                    BILLED & SHIPPED TO:
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{customerName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#333', lineHeight: '1.4', marginTop: '2px' }}>
                    {shippingAddress}<br />
                    Phone: {customerPhone || 'Not provided'}<br />
                    Email: {customerEmail || 'Not provided'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#333', lineHeight: '1.5' }}>
                  <div><strong>Place of Supply:</strong> Gujarat (24)</div>
                  <div><strong>Reverse Charge:</strong> No</div>
                  <div><strong>Invoice Type:</strong> Regular B2C Tax Invoice</div>
                  <div><strong>Fulfillment Hub:</strong> ERA43 Central Logistics, Ahmedabad</div>
                </div>
              </div>

              {/* Itemized Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#F4F4F5', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '8px', textAlign: 'left', width: '35px' }}>#</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Description of Goods</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '70px' }}>HSN</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '45px' }}>Size</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '40px' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right', width: '80px' }}>Rate (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right', width: '90px' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '8px' }}>{idx + 1}</td>
                      <td style={{ padding: '8px', fontWeight: '600' }}>
                        {item.title}
                        <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'normal' }}>
                          100% Luxury Bio-Washed Combed Cotton
                        </div>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace' }}>61091000</td>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: '700' }}>{item.selectedSize || 'M'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{(item.price || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700' }}>
                        ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* GST & Totals Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderTop: '1px solid #000', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.74rem', color: '#444' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Amount in Words:</strong><br />
                    <span style={{ fontStyle: 'italic', color: '#111' }}>{numberToWords(finalTotal)}</span>
                  </div>
                  <div style={{ border: '1px dashed #CCC', padding: '8px', borderRadius: '4px', marginTop: '10px' }}>
                    <strong>Tax Summary (18% GST Included):</strong><br />
                    Taxable Value: ₹{taxableValue.toLocaleString('en-IN')}<br />
                    CGST @ 9%: ₹{cgst.toLocaleString('en-IN')} | SGST @ 9%: ₹{sgst.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px 0', color: '#555' }}>Gross Subtotal:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '600' }}>₹{subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                      {discountAmount > 0 && (
                        <tr>
                          <td style={{ padding: '4px 0', color: '#059669' }}>Promotional Discount:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#059669', fontWeight: '600' }}>-₹{discountAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '4px 0', color: '#555' }}>Shipping & Handling:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '700', color: '#059669' }}>FREE</td>
                      </tr>
                      <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                        <td style={{ padding: '8px 0', fontWeight: '900', fontSize: '0.95rem' }}>TOTAL PAYABLE:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '900', fontSize: '1.05rem' }}>
                          ₹{finalTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatory & Terms Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', fontSize: '0.7rem', color: '#666' }}>
                <div>
                  <strong>Terms & Conditions:</strong><br />
                  1. Goods once sold are covered under ERA43 10-day replacement policy.<br />
                  2. All apparel should retain original tags for any returns/exchanges.<br />
                  3. This is a computer-generated tax invoice and requires no physical signature.
                </div>

                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '0.88rem', fontWeight: '800', fontStyle: 'italic', color: '#111' }}>
                    Nirav Prajapati
                  </div>
                  <div style={{ borderTop: '1px solid #444', paddingTop: '3px', marginTop: '4px', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Authorized Signatory<br />
                    <strong>ERA43 Apparels Pvt. Ltd.</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
