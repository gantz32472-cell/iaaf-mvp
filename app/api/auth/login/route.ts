import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { fail, ok as okResponse } from "@/lib/api/response";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")
      ? (() => {
          throw new Error("FORM_PARSE_FALLTHROUGH");
        })()
      : schema.parse(await request.json());
    const isValidLogin =
      body.username === (process.env.ADMIN_USERNAME || "admin") &&
      body.password === (process.env.ADMIN_PASSWORD || "change-me");
    if (!isValidLogin) return NextResponse.json(fail("AUTH_FAILED", "Invalid credentials"), { status: 401 });

    const token = createSessionToken(body.username);
    const res = NextResponse.json(okResponse({ loggedIn: true }));
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      maxAge: 60 * 60 * 24 * 7
    });
    return res;
  } catch (e) {
    if (e instanceof Error && e.message === "FORM_PARSE_FALLTHROUGH") {
      const form = await request.clone().formData().catch(() => null);
      const parsed = schema.safeParse({
        username: form?.get("username"),
        password: form?.get("password")
      });
      if (!parsed.success) {
        return NextResponse.json(fail("VALIDATION_ERROR", "Invalid login form", parsed.error.flatten()), { status: 400 });
      }
      const loginOk =
        parsed.data.username === (process.env.ADMIN_USERNAME || "admin") &&
        parsed.data.password === (process.env.ADMIN_PASSWORD || "change-me");
      if (!loginOk) return NextResponse.json(fail("AUTH_FAILED", "Invalid credentials"), { status: 401 });
      const token = createSessionToken(parsed.data.username);
      const res = NextResponse.redirect(new URL("/", request.url));
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        maxAge: 60 * 60 * 24 * 7
      });
      return res;
    }
    return NextResponse.json(fail("VALIDATION_ERROR", e instanceof Error ? e.message : "Invalid request"), { status: 400 });
  }
}
