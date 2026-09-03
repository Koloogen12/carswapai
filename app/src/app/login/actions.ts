'use server';
/** Серверные действия входа. Тонкая обёртка: вся суть в src/lib/auth.ts. */
import { requestCode, verifyCode } from '@/lib/auth';

export async function actionRequestCode(email: string) {
  return requestCode(email);
}

export async function actionVerifyCode(email: string, code: string) {
  return verifyCode(email, code);
}
