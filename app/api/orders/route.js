import { NextResponse } from 'next/server';

let mockOrders = [
  {
    id: "NIRAV-ORD-84920",
    customerName: "Vikram Sharma",
    customerEmail: "vikram.sharma@example.com",
    phone: "+91 98765 43210",
    shippingAddress: "B-402, Highstreet Towers, Bandra West, Mumbai, MH - 400050",
    totalAmount: 2798,
    discountAmount: 280,
    finalTotal: 2518,
    paymentMethod: "UPI / PhonePe",
    status: "PROCESSING",
    date: "2026-08-18",
    items: [
      { title: "NIRAV Heavyweight Acid Wash Oversized Tee", size: "L", color: "Acid Charcoal", qty: 1, price: 1499 },
      { title: "NIRAV Signature Crest Graphic Tee", size: "L", color: "Washed Off-White", qty: 1, price: 1299 }
    ]
  },
  {
    id: "NIRAV-ORD-84921",
    customerName: "Rahul Patel",
    customerEmail: "rahul.patel@example.com",
    phone: "+91 98123 76543",
    shippingAddress: "72, Silk City Heights, CG Road, Ahmedabad, GJ - 380009",
    totalAmount: 2499,
    discountAmount: 0,
    finalTotal: 2499,
    paymentMethod: "Cash on Delivery (COD)",
    status: "SHIPPED",
    date: "2026-08-17",
    items: [
      { title: "NIRAV Luxury Silk-Cotton Blend Crew Tee", size: "M", color: "Champagne Ivory", qty: 1, price: 2499 }
    ]
  }
];

export async function GET() {
  return NextResponse.json({ success: true, count: mockOrders.length, data: mockOrders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newOrder = {
      id: `NIRAV-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: body.name || "Customer",
      customerEmail: body.email || "customer@example.com",
      phone: body.phone || "+91 90000 00000",
      shippingAddress: `${body.address}, ${body.city} - ${body.pincode}`,
      totalAmount: body.totalAmount || 0,
      discountAmount: body.discountAmount || 0,
      finalTotal: body.finalTotal || body.totalAmount,
      paymentMethod: body.paymentMethod || "Cash on Delivery (COD)",
      status: "PENDING",
      date: new Date().toISOString().split('T')[0],
      items: body.items || []
    };
    
    mockOrders.unshift(newOrder);
    return NextResponse.json({ success: true, message: 'Order placed successfully!', data: newOrder });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const order = mockOrders.find(o => o.id === body.id);
    if (order) {
      order.status = body.status;
      return NextResponse.json({ success: true, message: `Order status updated to ${body.status}`, data: order });
    }
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
