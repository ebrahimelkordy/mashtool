import { useSession } from "@tanstack/react-start/server";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password:
      process.env["SESSION_SECRET"] ?? "dev-only-session-secret-change-me-0123456789abcd",
    name: "mystic-loom-admin",
    maxAge: 60 * 60 * 12,
    // Preview runs inside an iframe → the cookie must be cross-site capable.
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

export async function readAdminSession() {
  const session = await useSession<AdminSession>(sessionConfig());
  return { isAdmin: session.data.admin === true };
}

export async function signInAdmin(passcode: string) {
  const expected = process.env["ADMIN_PASSCODE"] ?? "";
  if (!expected || passcode !== expected) return false;
  const session = await useSession<AdminSession>(sessionConfig());
  await session.update({ admin: true });
  return true;
}

export async function signOutAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
}

export async function assertAdmin() {
  const { isAdmin } = await readAdminSession();
  if (!isAdmin) throw new Error("UNAUTHORIZED");
}