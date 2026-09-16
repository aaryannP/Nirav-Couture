import { NextResponse } from 'next/server';

let mockAdmins = [
  { id: "adm-001", name: "Nirav Prajapati", email: "nirav@niravcouture.com", role: "SUPER_ADMIN", grantedDate: "2026-08-01" },
  { id: "adm-002", name: "Store Manager", email: "manager@niravcouture.com", role: "ADMIN", grantedDate: "2026-08-10" }
];

export async function GET() {
  return NextResponse.json({ success: true, data: mockAdmins });
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ success: false, error: 'User Email is required for Admin handover' }, { status: 400 });
    }
    
    const existing = mockAdmins.find(a => a.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      return NextResponse.json({ success: false, error: 'User is already an active Admin' }, { status: 400 });
    }
    
    const newAdmin = {
      id: `adm-${Date.now()}`,
      name: body.name || body.email.split('@')[0],
      email: body.email.toLowerCase(),
      role: body.isSuperAdmin ? "SUPER_ADMIN" : "ADMIN",
      grantedDate: new Date().toISOString().split('T')[0]
    };
    
    mockAdmins.push(newAdmin);
    return NextResponse.json({ 
      success: true, 
      message: `Admin access granted to ${body.email} successfully!`, 
      data: newAdmin 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
