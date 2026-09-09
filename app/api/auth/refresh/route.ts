import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(_request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("clinic_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token available" }, { status: 401 });
    }

    const response = await fetch("https://dummyjson.com/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken,
        expiresInMins: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear cookie on invalid refresh token
      cookieStore.delete("clinic_refresh_token");
      return NextResponse.json(
        { message: data.message || "Failed to refresh token" },
        { status: 401 }
      );
    }

    if (data.refreshToken) {
      cookieStore.set("clinic_refresh_token", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({
      accessToken: data.accessToken,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Refresh token error" },
      { status: 500 }
    );
  }
}
