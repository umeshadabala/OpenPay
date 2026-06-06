import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, merchantProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();

    // Auto-create merchant profile
    const merchantCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.insert(merchantProfiles).values({
      userId: newUser.id,
      merchantName: name + "'s Shop",
      email: email,
      upiId: email.split('@')[0] + '@upi', // fallback upi
      merchantCode,
    });



    return NextResponse.json({
      success: true,
      message: 'User registered successfully. You can now login.',
    });
  } catch (error: any) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
