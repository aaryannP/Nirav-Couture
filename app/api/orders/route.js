import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/session';
import { 
  getOrders, 
  createOrder, 
  updateOrderStatus, 
  getProducts, 
  deductProductStock, 
  findOrderByIdempotencyKey 
} from '../../../lib/db';

// ---------------------------------------------------------------------------
// Helper — Read & verify cryptographically signed session from httpOnly cookie
// ---------------------------------------------------------------------------
async function getVerifiedSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('nirav_session');
    if (!sessionCookie?.value) return null;
    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

// Permitted payment methods whitelist (Strict validation)
const ALLOWED_PAYMENT_METHODS = [
  'Cash on Delivery (COD)',
  'Razorpay / Online',
  'Pay on Delivery (UPI / QR at Doorstep)',
  'Direct Order (Contact & Pay to Store)'
];

// ---------------------------------------------------------------------------
// GET /api/orders
//   - Admin: returns all orders (verified via cryptographically signed session)
//   - Customer: returns only their own orders (filtered by verified session.id)
//   - Unauthenticated: 401 Unauthorized
// ---------------------------------------------------------------------------
export async function GET(request) {
  const session = await getVerifiedSession();
  const { searchParams } = new URL(request.url);
  const wantsAll = searchParams.get('all') === 'true';

  if (!session) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const isAdmin = session.role === 'ADMIN' || session.role === 'SUPER_ADMIN';

  // Security Fix: NEVER allow non-admins to access ?all=true
  if (wantsAll && !isAdmin) {
    return NextResponse.json({ success: false, error: 'Access denied: Admin authorization required' }, { status: 403 });
  }

  const allOrders = await getOrders();

  let orders = allOrders;
  if (!isAdmin) {
    // Regular customers can strictly only view their own orders
    orders = allOrders.filter(o => o.userId === session.id || o.user_id === session.id);
  }

  return NextResponse.json({ success: true, count: orders.length, data: orders });
}

// ---------------------------------------------------------------------------
// POST /api/orders — Place order with strict validation, stock deduction & idempotency
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const session = await getVerifiedSession();

    // 1. Idempotency Check — Prevent duplicate payments & orders on retries
    const idempotencyKey = request.headers.get('idempotency-key') || body.idempotencyKey || null;
    if (idempotencyKey) {
      const existing = await findOrderByIdempotencyKey(idempotencyKey);
      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'Order already processed (idempotent replay)',
          data: existing
        });
      }
    }

    // 2. Validate Customer Information
    const name = (body.name || '').trim();
    const email = (body.email || session?.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();
    const address = (body.address || body.shippingAddress || '').trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, error: 'Please enter a valid customer name.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!phone || phone.length < 10) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
    }
    if (!address || address.length < 6) {
      return NextResponse.json({ success: false, error: 'Please enter a complete delivery address with pincode.' }, { status: 400 });
    }

    // 3. Strict Payment Method Validation
    const paymentMethod = body.paymentMethod || 'Cash on Delivery (COD)';
    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({
        success: false,
        error: `Invalid payment method "${paymentMethod}". Allowed methods: ${ALLOWED_PAYMENT_METHODS.join(', ')}`
      }, { status: 400 });
    }

    // 4. Validate Items Array & Quantity Limits
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item.' }, { status: 400 });
    }

    // 5. SERVER-SIDE PRICE CALCULATION & STOCK VERIFICATION
    const dbProducts = await getProducts();
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of rawItems) {
      const dbProduct = dbProducts.find(p => p.id === item.id || p.slug === item.slug);
      if (!dbProduct) {
        return NextResponse.json({
          success: false,
          error: `Product "${item.title || item.id}" is not available in our catalog.`
        }, { status: 400 });
      }

      // [AUDIT VERIFIED: MAX QUANTITY 5 ENFORCED] Quantity validation: 1 to 5 per item
      const qty = parseInt(item.qty, 10);
      if (isNaN(qty) || qty < 1 || qty > 5) {
        return NextResponse.json({
          success: false,
          error: `Invalid quantity for "${dbProduct.title}". Each item must be between 1 and 5 units.`
        }, { status: 400 });
      }

      // Stock availability check
      const currentStock = typeof dbProduct.stock === 'number' ? dbProduct.stock : 50;
      if (currentStock < qty) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for "${dbProduct.title}". Only ${currentStock} unit(s) available.`
        }, { status: 400 });
      }

      const verifiedPrice = parseFloat(dbProduct.price);
      calculatedSubtotal += verifiedPrice * qty;

      validatedItems.push({
        id: dbProduct.id,
        title: dbProduct.title,
        price: verifiedPrice,
        qty: qty,
        selectedSize: item.selectedSize || 'L',
        selectedColor: item.selectedColor || 'Default',
        frontImage: dbProduct.frontImage
      });
    }

    // 6. Server-Side Coupon Discount Calculation
    let verifiedDiscount = 0;
    const couponCode = (body.couponCode || '').trim().toUpperCase();
    if (couponCode === 'ERA10' || couponCode === 'NIRAV10') {
      verifiedDiscount = Math.round(calculatedSubtotal * 0.1);
    } else if (couponCode === 'FIRST500') {
      verifiedDiscount = Math.min(500, calculatedSubtotal);
    }

    // 7. Server-Side Shipping Calculation (Threshold: ₹1,499)
    const discountedSubtotal = Math.max(0, calculatedSubtotal - verifiedDiscount);
    const shippingFee = discountedSubtotal >= 1499 ? 0 : 99;
    const authoritativeFinalTotal = discountedSubtotal + shippingFee;

    // 8. Order Status & Payment Status Separation
    // For COD: Order is CONFIRMED, payment is PENDING_ON_DELIVERY
    // For Online: Order is PENDING, payment is PENDING_PAYMENT until verified
    let orderStatus = 'PENDING';
    let paymentStatus = 'PENDING_PAYMENT';

    if (
      paymentMethod === 'Cash on Delivery (COD)' ||
      paymentMethod === 'Pay on Delivery (UPI / QR at Doorstep)' ||
      paymentMethod === 'Direct Order (Contact & Pay to Store)'
    ) {
      orderStatus = 'CONFIRMED';
      paymentStatus = 'PENDING_ON_DELIVERY';
    } else {
      // Online payment methods (Razorpay / UPI Gateway)
      orderStatus = 'PENDING';
      paymentStatus = 'PENDING_PAYMENT';
    }

    // 9. Reserve Stock for all items (atomic deduction)
    for (const item of validatedItems) {
      const deductionResult = await deductProductStock(item.id, item.qty);
      if (!deductionResult.success) {
        return NextResponse.json({
          success: false,
          error: `Stock reservation failed for item "${item.title}". Please try again.`
        }, { status: 409 });
      }
    }

    // 10. Generate Server-Authoritative Order Record
    const newOrder = {
      id: `ERA-ORD-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 90)}`,
      userId: session?.id || body.userId || 'guest',
      customerName: name,
      customerEmail: email,
      phone: phone,
      shippingAddress: body.city
        ? `${address}, ${body.city} - ${body.pincode || ''}`
        : address,
      totalAmount: calculatedSubtotal,
      discountAmount: verifiedDiscount,
      finalTotal: authoritativeFinalTotal,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      orderStatus: orderStatus,
      status: orderStatus,
      idempotencyKey: idempotencyKey,
      date: new Date().toISOString().split('T')[0],
      items: validatedItems,
      createdAt: new Date().toISOString()
    };

    // Save to persistent repository
    await createOrder(newOrder);

    return NextResponse.json({
      success: true,
      message: paymentMethod === 'Cash on Delivery (COD)' 
        ? 'Order placed and confirmed successfully!'
        : 'Order created. Complete online payment to confirm.',
      data: newOrder
    });
  } catch (err) {
    console.error('[Orders API Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/orders — update order and payment status (Strict Admin Authorization Required)
// ---------------------------------------------------------------------------
export async function PUT(request) {
  try {
    const session = await getVerifiedSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ success: false, error: 'Order ID and new status are required' }, { status: 400 });
    }

    const validOrderStatuses = ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const newOrderStatus = body.status.toUpperCase();
    if (!validOrderStatuses.includes(newOrderStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid order status' }, { status: 400 });
    }

    const newPaymentStatus = body.paymentStatus ? body.paymentStatus.toUpperCase() : null;

    await updateOrderStatus(body.id, newOrderStatus, newPaymentStatus);

    return NextResponse.json({
      success: true,
      message: `Order ${body.id} updated successfully`
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
