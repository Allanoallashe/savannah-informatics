import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, expiresInMins = 1 } = body;

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
    }

    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        expiresInMins,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Invalid credentials" },
        { status: response.status }
      );
    }

    const { refreshToken, accessToken, ...user } = data;

    // Set refresh token in httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("clinic_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      accessToken,
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal authentication error" },
      { status: 500 }
    );
  }
}
