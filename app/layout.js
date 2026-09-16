import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import SupportDrawer from '../components/SupportDrawer';
import { StoreProvider } from '../lib/store-context';
import { AuthProvider } from '../lib/auth-context';

export const metadata = {
  title: "NIRAV COUTURE | Heavyweight Oversized Men's T-Shirts",
  description: "Handcrafted 240 GSM bio-washed heavy cotton oversized T-Shirts for men. Luxury streetwear designed for modern comfort.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            <Navbar />
            <CartDrawer />
            <main>{children}</main>
            <SupportDrawer />
            <Footer />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
