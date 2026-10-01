import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// Admin auth helper
// ---------------------------------------------------------------------------
async function getSessionUserId() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('nirav_session');
    if (session?.value) return JSON.parse(session.value).id;
  } catch {}
  return null;
}

// Only SUPER_ADMIN (the original owner) can grant admin access
const SUPER_ADMIN_IDS = ['usr-admin-01', 'usr-admin-02'];

async function requireSuperAdmin() {
  const userId = await getSessionUserId();
  if (!userId || !SUPER_ADMIN_IDS.includes(userId)) {
    return NextResponse.json({ success: false, error: 'Super-Admin access required for team management' }, { status: 403 });
  }
  return null;
}

// ---------------------------------------------------------------------------
// In-memory admin team list
// ---------------------------------------------------------------------------
let mockAdmins = [
  { id: 'adm-001', name: 'ERA43 Lead Admin', email: 'admin@era43.com', role: 'SUPER_ADMIN', grantedDate: '2026-08-01' },
  { id: 'adm-002', name: 'Nirav Prajapati', email: 'nirav@niravcouture.com', role: 'ADMIN', grantedDate: '2026-08-01' },
  { id: 'adm-003', name: 'Store Manager', email: 'manager@era43.com', role: 'ADMIN', grantedDate: '2026-08-10' }
];

// GET — list all admins (admin auth required)
export async function GET() {
  const userId = await getSessionUserId();
  const ADMIN_IDS = ['usr-admin-01', 'usr-admin-02'];
  if (!userId || !ADMIN_IDS.includes(userId)) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: mockAdmins });
}

// POST — grant admin access (super-admin only)
export async function POST(request) {
  const authError = await requireSuperAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ success: false, error: 'User email is required for Admin handover' }, { status: 400 });
    }

    const existing = mockAdmins.find(a => a.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      return NextResponse.json({ success: false, error: 'User is already an active Admin' }, { status: 400 });
    }

    const newAdmin = {
      id: `adm-${Date.now()}`,
      name: body.name || body.email.split('@')[0],
      email: body.email.toLowerCase().trim(),
      role: body.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
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

// DELETE — revoke admin access (super-admin only)
export async function DELETE(request) {
  const authError = await requireSuperAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Admin ID required' }, { status: 400 });
    }

    const beforeLen = mockAdmins.length;
    mockAdmins = mockAdmins.filter(a => a.id !== id);

    if (mockAdmins.length === beforeLen) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Admin access revoked successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
