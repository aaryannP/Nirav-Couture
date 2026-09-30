import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import QuickViewModal from '../components/QuickViewModal';
import ToastContainer from '../components/ToastContainer';
import WhatsAppButton from '../components/WhatsAppButton';
import { StoreProvider } from '../lib/store-context';
import { AuthProvider } from '../lib/auth-context';

export const metadata = {
  title: "NIRAV COUTURE | Minimalist Streetwear & Oversized T-Shirts",
  description:
    "Heavyweight 240 GSM bio-washed oversized Men's T-Shirts. Luxury streetwear designed for modern comfort.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <StoreProvider>
            <Navbar />
            <CartDrawer />
            <QuickViewModal />
            <ToastContainer />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
