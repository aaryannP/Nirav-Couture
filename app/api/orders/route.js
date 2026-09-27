import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// Helper — get session user ID from httpOnly cookie
// ---------------------------------------------------------------------------
function getSessionUserId() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('nirav_session');
    if (session?.value) return JSON.parse(session.value).id;
  } catch {}
  return null;
}

// ---------------------------------------------------------------------------
// In-memory order store (replace with DB when PostgreSQL is connected)
// All orders use consistent field naming: customerName, shippingAddress
// ---------------------------------------------------------------------------
let mockOrders = [
  {
    id: 'NIRAV-ORD-84920',
    userId: 'usr-cust-01',
    customerName: 'Vikram Sharma',
    customerEmail: 'vikram@example.com',
    phone: '+91 98765 43210',
    shippingAddress: 'B-402, Highstreet Towers, Bandra West, Mumbai - 400050',
    totalAmount: 2798,
    discountAmount: 280,
    finalTotal: 2518,
    paymentMethod: 'UPI / PhonePe',
    status: 'PROCESSING',
    date: '2026-08-18',
    items: [
      { title: 'NIRAV Heavyweight Acid Wash Oversized Tee', selectedSize: 'L', selectedColor: 'Acid Charcoal', qty: 1, price: 1499 },
      { title: 'NIRAV Signature Crest Graphic Tee', selectedSize: 'L', selectedColor: 'Washed Off-White', qty: 1, price: 1299 }
    ]
  },
  {
    id: 'NIRAV-ORD-84921',
    userId: 'usr-cust-01',
    customerName: 'Rahul Patel',
    customerEmail: 'rahul.patel@example.com',
    phone: '+91 98123 76543',
    shippingAddress: '72, Silk City Heights, CG Road, Ahmedabad - 380009',
    totalAmount: 2499,
    discountAmount: 0,
    finalTotal: 2499,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'SHIPPED',
    date: '2026-08-17',
    items: [
      { title: 'NIRAV Luxury Silk-Cotton Blend Crew Tee', selectedSize: 'M', selectedColor: 'Champagne Ivory', qty: 1, price: 2499 }
    ]
  }
];

// ---------------------------------------------------------------------------
// GET /api/orders
//   - Admin: returns all orders
//   - Customer: returns only their own orders (filtered by userId)
//   - Unauthenticated: 401
// ---------------------------------------------------------------------------
export async function GET(request) {
  const userId = getSessionUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const adminOverride = searchParams.get('all') === 'true';

  // Determine if this user is admin (simple mock lookup)
  const adminIds = ['usr-admin-01'];
  const isAdmin = adminIds.includes(userId);

  let orders = mockOrders;
  if (!isAdmin || !adminOverride) {
    // Non-admin users only see their own orders
    orders = mockOrders.filter(o => o.userId === userId);
  }

  return NextResponse.json({ success: true, count: orders.length, data: orders });
}

// ---------------------------------------------------------------------------
// POST /api/orders — place a new order
// ---------------------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const userId = getSessionUserId();

    // Generate order ID server-side only — never trust client-provided ID
    const newOrder = {
      id: `NIRAV-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: userId || 'guest',
      customerName: body.name || 'Customer',
      customerEmail: body.email || 'customer@example.com',
      phone: body.phone || '+91 90000 00000',
      shippingAddress: body.address
        ? `${body.address}${body.city ? ', ' + body.city : ''}${body.pincode ? ' - ' + body.pincode : ''}`
        : (body.shippingAddress || 'Address not provided'),
      totalAmount: body.totalAmount || 0,
      discountAmount: body.discountAmount || 0,
      finalTotal: body.finalTotal || body.totalAmount || 0,
      paymentMethod: body.paymentMethod || 'Cash on Delivery (COD)',
      status: 'CONFIRMED',
      date: new Date().toISOString().split('T')[0],
      items: body.items || []
    };

    mockOrders.unshift(newOrder);
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/orders — update order status (admin only)
// ---------------------------------------------------------------------------
export async function PUT(request) {
  try {
    const userId = getSessionUserId();
    const adminIds = ['usr-admin-01'];
    if (!userId || !adminIds.includes(userId)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const order = mockOrders.find(o => o.id === body.id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    order.status = body.status;
    return NextResponse.json({
      success: true,
      message: `Order status updated to ${body.status}`,
      data: order
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
