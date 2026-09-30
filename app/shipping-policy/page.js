import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Delivery Policy | NIRAV COUTURE',
  description: 'Official Shipping, Dispatch, and Delivery Policy for NIRAV COUTURE across India.'
};

export default function ShippingPolicyPage() {
  return (
    <div style={{ padding: '48px 0 90px', background: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav className="zed-breadcrumbs" style={{ marginBottom: '24px' }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span style={{ color: '#000000', fontWeight: '800' }}>Shipping & Delivery Policy</span>
        </nav>

        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            LOGISTICS & FULFILLMENT
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#000000' }}>
            SHIPPING & DELIVERY POLICY
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Last Updated: September 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.94rem', lineHeight: '1.75', color: '#222222' }}>
          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              1. ORDER PROCESSING & DISPATCH TIMELINE
            </h2>
            <p>
              All orders placed on <strong>NIRAV COUTURE</strong> are processed and packed at our Ahmedabad fulfillment studio within <strong>24 to 48 business hours</strong> (Monday through Saturday, excluding public holidays). Once dispatched, customers receive a confirmation notification with tracking details.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              2. ESTIMATED DELIVERY TIME
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Gujarat & Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata):</strong> 2 to 4 business days from dispatch.</li>
              <li><strong>Rest of India (Tier-2 & Tier-3 Cities):</strong> 4 to 7 business days from dispatch.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              3. SHIPPING CHARGES
            </h2>
            <p>
              We offer <strong>Free Standard Shipping across India</strong> on all orders above Rs. 1,499.00. For orders below Rs. 1,499.00, any applicable standard shipping fee is transparently displayed at checkout prior to payment.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              4. LOGISTICS PARTNERS & SUPPORT
            </h2>
            <p>
              We ship through reputed national courier partners including Delhivery, BlueDart, and XpressBees to ensure safe doorstep delivery. For any delivery assistance, reach out to us at <strong>nirav@niravcouture.com</strong> or <strong>+91 79906 29029</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
