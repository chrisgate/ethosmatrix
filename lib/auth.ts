import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { q } from "./db";

const COOKIE = "em_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((res, rej) =>
    scrypt(password, salt, 64, (e, k) => (e ? rej(e) : res(k))),
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await derive(password, salt)).toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const a = await derive(password, salt);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function login(email: string, password: string) {
  const [u] = await q<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email.toLowerCase().trim()],
  );
  if (!u || !(await verifyPassword(password, u.password_hash))) return false;
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${u.id}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function currentUserId(): Promise<number | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  const expected = sign(`${id}.${exp}`);
  if (!sig || sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Number(exp) < Date.now()) return null;
  return Number(id);
}

export async function requireAdmin() {
  const id = await currentUserId();
  if (!id) redirect("/admin/login");
  return id;
}
