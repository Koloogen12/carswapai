import { whoAmI } from '@/lib/session';
import { AppBar, Frame } from '@/screens/chrome';
import { crmList } from '@/lib/crm';
import { budget } from '@/lib/data';
import { CrmDesk } from './CrmDesk';

export const dynamic = 'force-dynamic';

/**
 * Экраны 47 и 50 · клиенты точки и воронка сделок.
 *
 * §16 · учётный слой обслуживает примерку и точкой входа не является: сюда
 * попадают из диалога, а не наоборот. Поэтому здесь нет ни одной кнопки
 * «завести клиента» и ни одного поля ввода, кроме поиска — карточки заводятся
 * событиями, а не руками.
 *
 * §13 · точка и роль берутся из сессии. Ни одного зашитого идентификатора:
 * менеджер видит ровно свою точку, и подделать это адресом нельзя.
 */
export default async function CrmPage() {
  const me = await whoAmI();
  const [rows, b] = await Promise.all([crmList(), budget()]);
  return (
    <Frame pad="22px" gap="14px">
      <AppBar active="crm" pointName={me.point} user={me.user} role={me.role}
        spent={b.spent_kopecks} cap={b.hard_limit} />
      <CrmDesk rows={rows} />
    </Frame>
  );
}
