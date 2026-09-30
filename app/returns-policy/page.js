import Link from 'next/link';

export const metadata = {
  title: 'Return, Refund & Cancellation Policy | NIRAV COUTURE',
  description: 'Official Return, Exchange, Refund, and Order Cancellation Policy for NIRAV COUTURE.'
};

export default function ReturnsPolicyPage() {
  return (
    <div style={{ padding: '48px 0 90px', background: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav className="zed-breadcrumbs" style={{ marginBottom: '24px' }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span style={{ color: '#000000', fontWeight: '800' }}>Return, Refund & Cancellation Policy</span>
        </nav>

        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            CUSTOMER PROTECTION & COMPLIANCE
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#000000' }}>
            RETURN, REFUND & CANCELLATION POLICY
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Last Updated: September 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.94rem', lineHeight: '1.75', color: '#222222' }}>
          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              1. 7-DAY RETURN & EXCHANGE WINDOW
            </h2>
            <p>
              At <strong>NIRAV COUTURE</strong>, we stand behind the quality of our 240+ GSM heavyweight apparel. We offer a hassle-free <strong>7-day return and exchange policy</strong> from the date of delivery. If you are unsatisfied with the size, fit, or quality of your T-shirt, you may request a return or size exchange within 7 calendar days of receiving your order.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              2. ELIGIBILITY CRITERIA FOR RETURNS
            </h2>
            <p>To be eligible for a return or exchange, the item must meet the following conditions:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>The garment must be unused, unwashed, unworn, and in its original condition.</li>
              <li>Original brand tags, neck labels, and packaging must be intact.</li>
              <li>The product must be free from stains, fragrances, deodorant marks, or physical damage.</li>
              <li>Return requests must be raised within 7 days of the delivery date with the Order ID.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              3. REFUND PROCESSING & TIMELINE
            </h2>
            <p>
              Once our warehouse receives and inspects your returned item (typically within 48 hours of pickup), we will notify you of the approval of your refund:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Prepaid Orders (UPI / Credit Card / Debit Card / NetBanking):</strong> The full refund amount will be credited back to your original payment source within <strong>5 to 7 business days</strong> as per banking and RBI guidelines.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds for COD orders will be transferred via UPI or NEFT/IMPS to the bank account details provided by the customer within <strong>5 to 7 business days</strong> after quality inspection.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              4. ORDER CANCELLATION POLICY
            </h2>
            <p>
              Orders can be cancelled free of charge within <strong>24 hours of placement</strong> or before the order is dispatched from our warehouse, whichever is earlier. To cancel an order, please contact us via email at <a href="mailto:nirav@niravcouture.com" style={{ textDecoration: 'underline', fontWeight: '700' }}>nirav@niravcouture.com</a> or WhatsApp at <strong>+91 79906 29029</strong>. For prepaid cancelled orders, 100% of the amount is refunded to the original payment method within 5–7 business days.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              5. DAMAGED, DEFECTIVE OR WRONG PRODUCT
            </h2>
            <p>
              In the rare event that you receive a damaged, defective, or incorrect item, please share an unboxing photo/video within 48 hours of delivery at <strong>nirav@niravcouture.com</strong> or <strong>+91 79906 29029</strong>. We will arrange a priority reverse pickup at zero cost to you and dispatch a brand-new replacement or issue a 100% full refund immediately.
            </p>
          </section>

          <section style={{ background: '#F8F9FA', padding: '24px', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              HOW TO INITIATE A RETURN OR REFUND
            </h3>
            <p style={{ fontSize: '0.88rem' }}>
              Email us at <strong>nirav@niravcouture.com</strong> or message our support desk on WhatsApp at <strong>+91 79906 29029</strong> with your Order ID. You can also use our <Link href="/contact" style={{ textDecoration: 'underline', fontWeight: '700' }}>Contact Us</Link> page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
