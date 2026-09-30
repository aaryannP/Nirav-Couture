import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | NIRAV COUTURE',
  description: 'Official Privacy Policy and Data Protection Guidelines for NIRAV COUTURE.'
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ padding: '48px 0 90px', background: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav className="zed-breadcrumbs" style={{ marginBottom: '24px' }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span style={{ color: '#000000', fontWeight: '800' }}>Privacy Policy</span>
        </nav>

        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            DATA SECURITY & PRIVACY
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#000000' }}>
            PRIVACY POLICY
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Last Updated: September 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.94rem', lineHeight: '1.75', color: '#222222' }}>
          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              1. INFORMATION WE COLLECT
            </h2>
            <p>
              When you purchase from or register on <strong>NIRAV COUTURE</strong>, we collect only the essential personal information required to fulfill your order: your Full Name, Shipping & Billing Address, Email Address, and Telephone Number.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              2. PAYMENT SECURITY (PCI-DSS COMPLIANCE)
            </h2>
            <p>
              All online payments are processed through encrypted, RBI-approved, PCI-DSS compliant payment gateways (such as Razorpay). <strong>NIRAV COUTURE never stores your debit/credit card numbers, CVV, NetBanking credentials, or UPI PINs</strong> on our servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              3. HOW WE USE YOUR INFORMATION
            </h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '22px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>To process, pack, and deliver your orders via our courier partners.</li>
              <li>To send order confirmations, dispatch updates, and invoices.</li>
              <li>To process returns, exchanges, and refunds efficiently.</li>
              <li>We never sell, rent, or trade your personal information to third-party marketers.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              4. COOKIES & SESSION STORAGE
            </h2>
            <p>
              We use essential session cookies to maintain your shopping bag, wishlist, and authenticated login session for a seamless browsing experience.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              5. GRIEVANCE OFFICER & CONTACT
            </h2>
            <p>
              In accordance with the Information Technology Act, 2000, if you have any questions regarding your privacy or data, please contact:<br />
              <strong>Grievance Officer:</strong> Nirav Prajapati<br />
              <strong>Address:</strong> Studio 104, Heritage Corporate Hub, SG Highway, Bodakdev, Ahmedabad, Gujarat – 380054<br />
              <strong>Email:</strong> nirav@niravcouture.com | <strong>Phone:</strong> +91 79906 29029
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
