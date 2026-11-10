// Painel de jogo por cima do 3D: contador, título amarelo, alerta, ⏪, carimbo do bordão, legenda de uma palavra, confete.
import { AbsoluteFill } from 'remotion';
import { WORDS, W, WE, clamp, lin, pop, smooth, seeded, shotStart, shotEnd, nextCut, DURATION, FPS } from './lib';
import { shipU } from './MapSet';
import * as St from './story';

const F = 'Lilita, sans-serif';
const S = shotStart, E = shotEnd;
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const END = DURATION / FPS;

type Counter = { a: number; b: number; val: (t: number) => string; label: string; red?: (t: number) => number };
const COUNTERS = (): Counter[] => [
  { a: W(10), b: S('dig'), val: t => fmt(Math.round(shipU(t) * 225) * 100), label: 'km' },
  { a: W(88) - 0.2, b: S('scrape'), val: t => fmt(clamp(St.levelAtX(t, St.ships(t)[0].x) / 3.6) * 26), label: 'm de altura' },
  { a: W(105), b: S('mules'), val: () => '0,5', label: 'm de folga' },
  { a: W(145) - 0.3, b: S('lake'), val: t => fmt(200 * smooth(t, W(145) - 0.3, W(146) + 0.3)), label: 'milhões de litros' },
  { a: W(187), b: S('newlocks'), val: t => (t < W(192) ? '36' : '22'), label: 'navios por dia', red: t => (t >= W(192) ? 1 - lin(t, W(192) + 0.6, W(192) + 1.4) : 0) },
  { a: W(223), b: S('reward'), val: t => fmt(60 * smooth(t, W(223), W(225) + 0.2)) + '%', label: 'da água volta' },
  { a: W(236), b: END + 1, val: () => '−13.000', label: 'km por viagem' },
];
const TITLES = (): [number, string][] => [[W(33), 'CANAL'], [W(101), 'ECLUSA'], [W(134), 'MULAS'], [W(170), 'LAGO GATÚN'], [W(201), 'ECLUSAS NOVAS'], [W(233), 'CANAL DO PANAMÁ']];
const ALERTS = () => [W(57), W(114), W(142), W(179)];
const BORDAO = (): [number, number][] => [[W(39), W(41)], [W(102), W(104)], [W(135), W(137)], [W(172), W(174)]];

const stroke = (px: number, c = '#1b1206') => ({ WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill' as const });

export const Hud = ({ t }: { t: number }) => {
  const shotEndAfter = (a: number) => Math.min(nextCut(a), END + 1);
  const counter = COUNTERS().find(c => t >= c.a && t < c.b);
  const title = TITLES().filter(([a]) => t >= a && t < Math.min(a + 2.8, shotEndAfter(a) - 0.05)).pop();
  const alert = ALERTS().find(a => t >= a && t < a + 1.6);
  const bord = BORDAO().find(([q]) => t >= q && t < Math.min(shotEndAfter(q), q + 3) - 0.04);
  const w = WORDS.findIndex((x, i) => t >= x.start - 0.03 && t < Math.min(WORDS[i + 1]?.start ?? x.end + 0.4, x.end + 0.45) - 0.03);
  const rew = St.rewinding(t);
  const won = t >= W(229);
  return (
    <AbsoluteFill style={{ fontFamily: F, pointerEvents: 'none' }}>
      {t > W(56) && t < W(62) + 0.6 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(120,84,48,0.55), rgba(70,48,28,0.75))',
        opacity: smooth(t, W(56), W(57) + 0.3) * (1 - smooth(t, W(61), W(62) + 0.5)) * 0.85 }} />}
      {rew && <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 3px, rgba(0,0,0,0) 3px 9px)', backgroundColor: 'rgba(60,90,160,0.18)' }} />}
      {rew && (
        <div style={{ position: 'absolute', left: 70, top: 150, transform: `scale(${pop(t, W(62))})`, transformOrigin: 'left top' }}>
          <svg width="190" height="120" viewBox="0 0 190 120"><g fill="#fff" stroke="#16202e" strokeWidth="9" strokeLinejoin="round">
            <path d="M95 12 L12 60 L95 108 Z" /><path d="M180 12 L97 60 L180 108 Z" /></g></svg>
        </div>
      )}
      {counter && (() => { const sc = pop(t, counter.a, 0.3) * (1 - smooth(t, counter.b - 0.15, counter.b)); const red = counter.red?.(t) ?? 0;
        return (
          <div style={{ position: 'absolute', top: 205, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ transform: `scale(${sc})`, background: red > 0 ? `rgba(${180 + 60 * red},40,40,0.92)` : 'rgba(20,26,40,0.84)', borderRadius: 999,
              padding: '10px 40px 14px', display: 'flex', alignItems: 'baseline', gap: 16, boxShadow: '0 8px 0 rgba(0,0,0,0.18)' }}>
              <span style={{ color: '#fff', fontSize: 92, lineHeight: 1 }}>{counter.val(t)}</span>
              <span style={{ color: '#cfe0ff', fontSize: 40 }}>{counter.label}</span>
            </div>
          </div>
        ); })()}
      {title && (() => { const [a, txt] = title; const sc = pop(t, a, 0.38), out = 1 - smooth(t, a + 2.5, a + 2.8);
        return (
          <div style={{ position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', transform: `scale(${sc}) rotate(${-3 + 3 * lin(t, a, a + 0.4)}deg)`, opacity: out }}>
            <span style={{ color: '#ffd23f', fontSize: txt.length > 11 ? 112 : 136, letterSpacing: 2, ...stroke(16, '#3b2400'),
              textShadow: '0 10px 0 rgba(0,0,0,0.28)' }}>{txt}</span>
          </div>
        ); })()}
      {alert !== undefined && (
        <div style={{ position: 'absolute', top: 340, left: 0, right: 0, display: 'flex', justifyContent: 'center',
          transform: `scale(${pop(t, alert, 0.3) * (1 - smooth(t, alert + 1.4, alert + 1.6))}) rotate(${Math.sin((t - alert) * 22) * 7 * Math.exp(-(t - alert) * 2)}deg)` }}>
          <svg width="230" height="205" viewBox="0 0 230 205"><path d="M115 14 L218 192 L12 192 Z" fill="#ffcc1f" stroke="#1d1d1d" strokeWidth="14" strokeLinejoin="round" />
            <rect x="103" y="70" width="24" height="70" rx="10" fill="#1d1d1d" /><circle cx="115" cy="163" r="14" fill="#1d1d1d" /></svg>
        </div>
      )}
      {bord && (() => { const [q, x] = bord; const stamp = t >= x;
        return (
          <div style={{ position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#fff', fontSize: 120, transform: `scale(${pop(t, q, 0.3)})`, ...stroke(14, '#13203a'), textShadow: '0 8px 0 rgba(0,0,0,0.25)' }}>ZEROU?</span>
            {stamp && <div style={{ transform: `scale(${2.2 - 1.2 * smooth(t, x, x + 0.12)}) rotate(-9deg)`, opacity: smooth(t, x, x + 0.08), border: '12px solid #ff3b30',
              borderRadius: 24, padding: '4px 28px', background: 'rgba(255,255,255,0.88)' }}>
              <span style={{ color: '#ff3b30', fontSize: 104 }}>AINDA NÃO</span></div>}
          </div>
        ); })()}
      {won && t < W(229) + 3.2 && (
        <div style={{ position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 1 - smooth(t, W(229) + 2.8, W(229) + 3.2) }}>
          <div style={{ transform: `scale(${2.2 - 1.2 * smooth(t, W(229), W(229) + 0.14)}) rotate(-6deg)`, border: '14px solid #1fb84d', borderRadius: 26,
            padding: '6px 36px', background: 'rgba(255,255,255,0.9)' }}><span style={{ color: '#1fb84d', fontSize: 150 }}>ZEROU!</span></div>
        </div>
      )}
      {won && <Confetti t={t - W(229)} />}
      {w >= 0 && (
        <div style={{ position: 'absolute', top: 1330, left: 0, right: 0, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', color: '#fff', fontSize: 84, transform: `scale(${0.85 + 0.15 * pop(t, WORDS[w].start - 0.03, 0.15)})`,
            ...stroke(13, '#0d0d0d'), textShadow: '0 6px 0 rgba(0,0,0,0.3)' }}>{WORDS[w].text.replace(/[.,:?!]/g, '').toUpperCase()}</span>
        </div>
      )}
      {void WE}{void E}
    </AbsoluteFill>
  );
};

const Confetti = ({ t }: { t: number }) => {
  if (t > 4.5) return null;
  const r = seeded(77); const cols = ['#ff3b30', '#ffcc1f', '#2fa4e7', '#3ec27e', '#ff8fb8', '#ffffff'];
  return (<>{Array.from({ length: 75 }, (_, i) => {
    const x0 = r() * 1080, d = r() * 0.6, vy = 500 + r() * 700, vx = (r() - 0.5) * 300, rot = r() * 720, c = cols[i % cols.length], tt = t - d;
    if (tt < 0) return null;
    return <div key={i} style={{ position: 'absolute', left: x0 + vx * tt, top: -40 + vy * tt + 260 * tt * tt, width: 22, height: 34, background: c,
      transform: `rotate(${rot * tt + i * 37}deg) scaleX(${Math.cos(tt * 9 + i)})`, borderRadius: 4 }} />;
  })}</>);
};
