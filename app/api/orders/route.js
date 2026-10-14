import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/session';
import { getOrders, createOrder, updateOrderStatus, getProducts } from '../../../lib/db';

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
// POST /api/orders — place a new order with SERVER-SIDE PRICE VALIDATION
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const session = await getVerifiedSession();

    // 1. Validate Customer Information
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

    // 2. Validate Items Array
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item.' }, { status: 400 });
    }

    // 3. SERVER-SIDE PRICE CALCULATION — Never trust client totals
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

      const verifiedPrice = parseFloat(dbProduct.price);
      const qty = Math.max(1, parseInt(item.qty || 1, 10));
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

    // 4. Server-Side Coupon Discount Calculation
    let verifiedDiscount = 0;
    const couponCode = (body.couponCode || '').trim().toUpperCase();
    if (couponCode === 'ERA10' || couponCode === 'NIRAV10') {
      verifiedDiscount = Math.round(calculatedSubtotal * 0.1);
    } else if (couponCode === 'FIRST500') {
      verifiedDiscount = Math.min(500, calculatedSubtotal);
    }

    // 5. Server-Side Shipping Calculation (Threshold: ₹1,499)
    const discountedSubtotal = Math.max(0, calculatedSubtotal - verifiedDiscount);
    const shippingFee = discountedSubtotal >= 1499 ? 0 : 99;
    const authoritativeFinalTotal = discountedSubtotal + shippingFee;

    // 6. Generate Server-Authoritative Order Record
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
      paymentMethod: body.paymentMethod || 'Cash on Delivery (COD)',
      status: 'CONFIRMED',
      date: new Date().toISOString().split('T')[0],
      items: validatedItems,
      createdAt: new Date().toISOString()
    };

    // Save to persistent repository (PostgreSQL / disk store)
    await createOrder(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Order placed and validated successfully!',
      data: newOrder
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/orders — update order status (Strict Admin Authorization Required)
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

    const validStatuses = ['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(body.status.toUpperCase())) {
      return NextResponse.json({ success: false, error: 'Invalid order status' }, { status: 400 });
    }

    await updateOrderStatus(body.id, body.status.toUpperCase());

    return NextResponse.json({
      success: true,
      message: `Order ${body.id} status updated to ${body.status.toUpperCase()}`
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
