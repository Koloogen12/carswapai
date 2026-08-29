import { invitePreview } from '@/lib/staff';
import { JoinFlow } from './parts';

export const dynamic = 'force-dynamic';

/**
 * Экраны 02–04 · вход по приглашению.
 *
 * Разметка из блока 3 хендоффа. Одна колонка 466px: приглашение →
 * подтверждение телефона → точка создана.
 *
 * ДВА ВИДА ПРИГЛАШЕНИЙ, ОДИН ЭКРАН. Сеть зовёт точку (тогда здесь три шага
 * регистрации), владелец точки зовёт сотрудника (тогда одно нажатие: секрет —
 * сама ссылка, пароля в продукте нет). Различает их не форма, а строка
 * приглашения в базе, и подделать вид нельзя.
 *
 * С-1 · без кода сети точка не заводится. Проверка на уровне базы, форма её
 * только показывает: app.redeem_network_invite гасит приглашение в той же
 * транзакции, в которой создаёт точку.
 * В-1 · четыре поля. Каталог, прайс и шаблоны документов приезжают из сети
 * готовыми — их точка не заполняет.
 */
export default async function JoinPage({ searchParams }: {
  searchParams: { i?: string };
}) {
  const code = (searchParams.i ?? '').trim();
  const preview = code ? await invitePreview(code) : null;
  // Дату разбираем на сервере: то же значение, посчитанное ещё раз в
  // браузере с другой временной зоной, даёт расхождение при гидратации.
  const until = preview
    ? new Date(preview.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : '';
  return <JoinFlow code={code} preview={preview} until={until} />;
}
