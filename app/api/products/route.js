import { NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../../lib/products-data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  let products = getProducts();
  
  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.fitType.toLowerCase().includes(q)
    );
  }
  
  return NextResponse.json({ success: true, count: products.length, data: products });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validation for Front and Back images
    if (!body.title || !body.price || !body.frontImage || !body.backImage) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: Title, Price, Front Image, and Back Image are mandatory.' 
      }, { status: 400 });
    }
    
    const newProduct = addProduct({
      title: body.title,
      category: body.category || 'oversized',
      fitType: body.fitType || 'Oversized Fit',
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : parseFloat(body.price) * 1.25,
      fabric: body.fabric || '240 GSM 100% Bio-Washed Cotton',
      description: body.description || 'Premium heavyweight Men\'s T-Shirt crafted by NIRAV.',
      sizes: body.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      colors: body.colors || [{ name: 'Default', hex: '#111111' }],
      frontImage: body.frontImage,
      backImage: body.backImage,
      stock: parseInt(body.stock || 50)
    });
    
    return NextResponse.json({ success: true, message: 'Product added successfully!', data: newProduct });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }
    const updated = updateProduct(body.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }
    deleteProduct(id);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
