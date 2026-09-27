import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import SupportDrawer from '../components/SupportDrawer';
import QuickViewModal from '../components/QuickViewModal';
import ToastContainer from '../components/ToastContainer';
import AnnouncementBar from '../components/AnnouncementBar';
import MobileBottomNav from '../components/MobileBottomNav';
import { StoreProvider } from '../lib/store-context';
import { AuthProvider } from '../lib/auth-context';

export const metadata = {
  title: "NIRAV COUTURE | Heavyweight Oversized Men's T-Shirts",
  description:
    "Handcrafted 240 GSM bio-washed heavy cotton oversized T-Shirts for men. Luxury streetwear designed for modern comfort.",
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            {/* Sticky announcement bar above navbar */}
            <AnnouncementBar />
            <Navbar />
            <CartDrawer />
            <QuickViewModal />
            <ToastContainer />
            <main>{children}</main>
            <SupportDrawer />
            <Footer />
            {/* Mobile bottom navigation bar */}
            <MobileBottomNav />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
