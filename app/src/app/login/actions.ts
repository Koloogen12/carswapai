'use server';
/** Серверные действия входа. Тонкая обёртка: вся суть в src/lib/auth.ts. */
import { requestCode, verifyCode } from '@/lib/auth';

export async function actionRequestCode(phone: string) {
  return requestCode(phone);
}

export async function actionVerifyCode(phone: string, code: string) {
  return verifyCode(phone, code);
}
