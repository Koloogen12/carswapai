'use server';
/**
 * Серверные действия экрана сотрудников. Тонкая обёртка: вся суть и все
 * проверки — в src/lib/staff.ts и в политиках миграции 016.
 *
 * revalidatePath здесь обязателен: страница отдаётся сервером, и без него
 * владелец, отозвавший доступ, увидел бы прежний список и решил, что кнопка
 * не сработала.
 */
import { revalidatePath } from 'next/cache';
import { addStaff, setStaffActive, type AddStaffResult, type StaffRole } from '@/lib/staff';

export async function actionAddStaff(
  name: string, role: StaffRole, email: string,
): Promise<AddStaffResult> {
  const r = await addStaff({ name, role, email });
  if (r.ok) revalidatePath('/staff');
  return r;
}

export async function actionSetStaffActive(userId: string, active: boolean) {
  const r = await setStaffActive(userId, active);
  if (r.ok) revalidatePath('/staff');
  return r;
}
