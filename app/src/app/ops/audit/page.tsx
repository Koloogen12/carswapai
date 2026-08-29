import { redirect } from 'next/navigation';

/** Аудит-лог живёт на одном экране с поиском — так он нарисован в блоке 2. */
export default function AuditPage() { redirect('/ops/search'); }
