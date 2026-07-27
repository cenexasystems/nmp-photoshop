"use server";

import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const password = formData.get("password")?.toString() || "";

  const adminPassword = process.env.ADMIN_PASSWORD;
  const staff1Password = process.env.STAFF1_PASSWORD;
  const staff2Password = process.env.STAFF2_PASSWORD;
  const staff3Password = process.env.STAFF3_PASSWORD;

  let role = "";
  let redirectUrl = "";
  
  if (password === adminPassword) {
    role = "admin";
    redirectUrl = "/admin/secure/portal/analytics";
  } else if (password === staff1Password) {
    role = "staff";
    redirectUrl = "/chennai-main";
  } else if (password === staff2Password) {
    role = "staff";
    redirectUrl = "/bangalore-hub";
  } else if (password === staff3Password) {
    role = "staff";
    redirectUrl = "/mumbai-central";
  }

  if (!role) {
    return { error: "Invalid password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("auth_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return { redirect: redirectUrl };
}
