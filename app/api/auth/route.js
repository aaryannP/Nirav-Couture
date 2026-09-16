import { NextResponse } from 'next/server';

let mockUsers = [
  {
    id: "usr-admin-01",
    name: "Nirav Prajapati",
    email: "nirav@niravcouture.com",
    password: "adminpassword",
    role: "ADMIN",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    provider: "email"
  },
  {
    id: "usr-cust-01",
    name: "Vikram Sharma",
    email: "vikram@example.com",
    password: "customerpassword",
    role: "CUSTOMER",
    phone: "+91 98123 45678",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    provider: "email"
  }
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, name, email, password, phone } = body;

    if (action === 'register') {
      if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: 'Name, Email, and Password are required.' }, { status: 400 });
      }

      const existing = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ success: false, error: 'Account with this email already exists.' }, { status: 400 });
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password,
        role: "CUSTOMER", // Default role
        phone: phone || "",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=fff`,
        provider: "email"
      };

      mockUsers.push(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json({ success: true, message: 'Account registered successfully!', user: userWithoutPassword });
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and Password are required.' }, { status: 400 });
      }

      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({ success: true, message: 'Login successful!', user: userWithoutPassword });
    }

    return NextResponse.json({ success: false, error: 'Invalid auth action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
