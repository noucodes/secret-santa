"use server";

import { cookies } from "next/headers";
import { decodeNotice, encodeNotice, NOTICE_COOKIE } from "@/shared/helpers/notice.helpers";

export async function rememberNotice(notice: string) {
  const jar = await cookies();
  jar.set(NOTICE_COOKIE, encodeNotice(notice), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 20,
  });
}

export async function readNotice() {
  const jar = await cookies();
  return decodeNotice(jar.get(NOTICE_COOKIE)?.value);
}
