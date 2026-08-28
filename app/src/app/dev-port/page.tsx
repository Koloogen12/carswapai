import { PORTED } from '@/design/ported';

export default function DevPortIndex() {
  return (
    <div style={{ padding: 40, fontFamily: 'Onest, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em' }}>
        Сверка переноса</h1>
      <p style={{ color: '#6E6E6E', marginTop: 8 }}>
        Слева порт, справа прототип на :4173. Страница временная.</p>
      <ul style={{ marginTop: 20, lineHeight: 2 }}>
        {Object.entries(PORTED).map(([f, b]) => (
          <li key={f}>
            <a href={`/dev-port/${f}`} style={{ color: '#111' }}>{f}</a>
            <span style={{ color: '#9A9A9A' }}> · {b.length} блоков · </span>
            <a href={`http://localhost:4173/${f}.dc.html`} style={{ color: '#6E6E6E' }}>
              прототип</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
