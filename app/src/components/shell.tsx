import type { ReactNode } from 'react';
import { Row } from './ui';

/** Оболочка кабинета. Десктоп 1440, отбивка страницы из системы. */
export function Shell({ user, role, nav, children }:
  { user: string; role: string; nav?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <header style={{
        background: 'var(--white)', borderBottom: '1px solid var(--rule)',
        padding: '0 40px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Row style={{ maxWidth: 'var(--content-max)', margin: '0 auto', height: 68,
          justifyContent: 'space-between' }}>
          <Row gap={28}>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.03em',
              color: 'var(--ink-900)' }}>CarSwap</span>
            {nav}
          </Row>
          <Row gap={10}>
            <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
              <div style={{ fontSize: 'var(--fs-body-s)', fontWeight: 500,
                color: 'var(--ink-900)' }}>{user}</div>
              <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-400)' }}>{role}</div>
            </div>
            <span aria-hidden style={{ width: 34, height: 34, borderRadius: 999,
              background: 'var(--ink-900)', color: '#fff', display: 'grid',
              placeItems: 'center', fontSize: 13, fontWeight: 500 }}>
              {user.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </span>
          </Row>
        </Row>
      </header>
      <main style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--page-pad)' }}>
        {children}
      </main>
    </div>
  );
}

export function NavLink({ href, active, children }:
  { href: string; active?: boolean; children: ReactNode }) {
  return (
    <a href={href} style={{
      fontSize: 'var(--fs-body-s)', fontWeight: 500, padding: '8px 14px',
      borderRadius: 'var(--r-pill)',
      background: active ? 'var(--ink-900)' : 'transparent',
      color: active ? '#fff' : 'var(--ink-500)',
    }}>{children}</a>
  );
}

/** Мобильная рамка макетов 390×790. Используется на экранах гаража и поста,
 *  чтобы они читались в кабинете при просмотре; на самом устройстве рамки нет. */
export function Phone({ children, surface }: { children: ReactNode; surface?: 'bay' }) {
  return (
    <div data-surface={surface} style={{
      width: 390, minHeight: 790, background: 'var(--surface)', borderRadius: 42,
      overflow: 'hidden', boxShadow: '0 0 0 1px var(--rule-strong)', flex: 'none',
    }}>{children}</div>
  );
}
