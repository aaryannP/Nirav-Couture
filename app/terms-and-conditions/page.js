import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | ERA43',
  description: 'Official Terms and Conditions of Use and Sale for ERA43.'
};

export default function TermsAndConditionsPage() {
  return (
    <div style={{ padding: '48px 0 90px', background: '#FFFFFF' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <nav className="zed-breadcrumbs" style={{ marginBottom: '24px' }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span style={{ color: '#000000', fontWeight: '800' }}>Terms & Conditions</span>
        </nav>

        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            LEGAL AGREEMENT & TERMS OF SERVICE
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#000000' }}>
            TERMS & CONDITIONS
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Last Updated: September 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '0.94rem', lineHeight: '1.75', color: '#222222' }}>
          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              1. INTRODUCTION & ELECTRONIC RECORD
            </h2>
            <p>
              This document is an electronic record in terms of the Information Technology Act, 2000 and rules thereunder as applicable. This website is owned and operated by <strong>ERA43</strong>, having its registered office at Studio 104, Heritage Corporate Hub, Near SG Highway, Bodakdev, Ahmedabad, Gujarat – 380054, India. By accessing, browsing, or placing an order on this platform, you agree to be bound by these Terms & Conditions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              2. PRODUCTS, PRICING & AVAILABILITY
            </h2>
            <p>
              All products listed on ERA43 are priced in <strong>Indian Rupees (INR / Rs.)</strong> and are inclusive of applicable GST unless stated otherwise. While we strive to ensure accurate product descriptions, fabric specifications, and pricing, we reserve the right to correct any typographical errors or update stock availability without prior notice.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              3. PAYMENTS & BANKING COMPLIANCE
            </h2>
            <p>
              We accept online payments via RBI-authorized, PCI-DSS compliant payment gateways supporting UPI (Google Pay, PhonePe, Paytm), Visa/MasterCard/RuPay Credit and Debit Cards, NetBanking, as well as Cash on Delivery (COD). By initiating a payment transaction, you confirm that you are the authorized holder of the payment instrument used. ERA43 does not store your card numbers, CVV, or UPI PINs on its servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              4. INTELLECTUAL PROPERTY
            </h2>
            <p>
              All brand names, logos ("ERA43"), garment designs, graphics, lookbook photography, and website content are the exclusive intellectual property of ERA43. Unauthorized reproduction or commercial use is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              5. LIMITATION OF LIABILITY
            </h2>
            <p>
              ERA43's total liability in connection with any order or product claim shall not exceed the actual purchase price paid by the customer for that specific order.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', color: '#000000' }}>
              6. GOVERNING LAW & JURISDICTION
            </h2>
            <p>
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to transactions on this website shall be subject to the exclusive jurisdiction of the courts at <strong>Ahmedabad, Gujarat, India</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
