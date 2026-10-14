import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/session';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../lib/db';

// ---------------------------------------------------------------------------
// Cryptographically verified admin authorization
// ---------------------------------------------------------------------------
async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('nirav_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const session = verifySessionToken(sessionCookie.value);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin privileges required' }, { status: 403 });
    }
    return null; // authorized
  } catch {
    return NextResponse.json({ success: false, error: 'Forbidden: Admin privileges required' }, { status: 403 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/products — public catalog with real-time filtering & search
// ---------------------------------------------------------------------------
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let products = await getProducts();

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.fitType || '').toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ success: true, count: products.length, data: products });
}

// ---------------------------------------------------------------------------
// POST /api/products — admin only (Persists to PostgreSQL / disk repository)
// ---------------------------------------------------------------------------
export async function POST(request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.title || !body.price || !body.frontImage) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: Title, Price, and Front Image are mandatory.'
      }, { status: 400 });
    }

    const priceNum = parseFloat(body.price);
    const slug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString().slice(-4);

    const newProduct = {
      id: `era43-ts-${Date.now().toString().slice(-4)}`,
      title: body.title.trim(),
      slug: slug,
      category: body.category || 'oversized',
      fitType: body.fitType || 'Oversized Fit',
      price: priceNum,
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : Math.round(priceNum * 1.25),
      fabric: body.fabric || '240 GSM 100% Bio-Washed Cotton',
      description: body.description || "Premium heavyweight Men's T-Shirt crafted by ERA43.",
      sizes: body.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      colors: body.colors || [{ name: 'Default', hex: '#111111' }],
      frontImage: body.frontImage,
      backImage: body.backImage || body.frontImage,
      images: body.images || [body.frontImage, body.backImage || body.frontImage],
      stock: parseInt(body.stock || 50, 10),
      badge: body.badge || 'NEW ARRIVAL',
      isFeatured: body.isFeatured || false,
      isBestseller: body.isBestseller || false
    };

    await createProduct(newProduct);

    return NextResponse.json({
      success: true,
      message: 'Product created and persisted successfully!',
      data: newProduct
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/products — admin only (Updates PostgreSQL / disk repository)
// ---------------------------------------------------------------------------
export async function PUT(request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for updating.' }, { status: 400 });
    }

    const updated = await updateProduct(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated and persisted successfully!',
      data: updated
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/products — admin only (Deletes from PostgreSQL / disk repository)
// ---------------------------------------------------------------------------
export async function DELETE(request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for deletion.' }, { status: 400 });
    }

    await deleteProduct(id);

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully.`
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
