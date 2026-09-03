'use server';
/**
 * Серверные действия входа по приглашению. Тонкая обёртка: суть в
 * src/lib/staff.ts, инварианты — в миграциях 004 и 016.
 */
import { requestCode } from '@/lib/auth';
import { invitePreview, redeemNetworkInvite, redeemStaffInvite } from '@/lib/staff';

export async function actionInvitePreview(code: string) {
  return invitePreview(code);
}

/** Вход сотрудника по ссылке: одно нажатие, пароля нет. */
export async function actionJoinStaff(code: string) {
  return redeemStaffInvite(code);
}

/** Шаг 1 регистрации точки: подтверждаем телефон будущего владельца. */
export async function actionJoinSendCode(email: string) {
  return requestCode(email);
}

/** Шаг 2: код из SMS, точка, владелец и сессия — одной транзакцией. */
export async function actionJoinPoint(input: {
  code: string; email: string; mailCode: string;
  pointName: string; address: string; ownerName: string;
}) {
  return redeemNetworkInvite(input);
}
