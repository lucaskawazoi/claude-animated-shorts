// Abertura: o "mapa do jogo". O navio dá a volta na América do Sul (Nova York -> Cabo Horn -> São Francisco).
import { useMemo } from 'react';
import * as THREE from 'three';
import { C, W, WE, clamp, smooth, pop } from './lib';
import { Ship, mat, Cloud } from './models';

const K = 0.25; // graus -> unidades
export const ll = (lon: number, lat: number): [number, number] => [(lon + 80) * K, -lat * K];
const NA: [number, number][] = [[-125, 49], [-124, 42], [-122.4, 37.8], [-120.5, 34.5], [-117.2, 32.6], [-114.5, 30], [-112, 26.5], [-110, 23.2],
  [-105.5, 20.5], [-101.5, 17.8], [-97, 16], [-92.5, 14.6], [-88, 13.2], [-85.8, 11], [-83.5, 8.6], [-80, 7.3], [-78, 7.8], [-77.2, 8.6],
  [-79.5, 9.6], [-81.8, 9.2], [-83.6, 11], [-83.4, 15], [-86, 16], [-88.3, 16], [-87.5, 21.5], [-90.4, 21.2], [-91.5, 18.6], [-94.5, 18.3],
  [-97.3, 21], [-97.4, 25.9], [-94.5, 29.4], [-89.5, 30.2], [-85, 29.7], [-82.8, 27.8], [-80.4, 25.2], [-80, 27], [-81.3, 31], [-76.5, 35],
  [-74, 40.6], [-70, 41.6], [-67, 44.6], [-64, 46], [-60, 47], [-55.5, 51.5], [-60, 56], [-66, 59], [-78, 62], [-95, 61], [-110, 63],
  [-128, 60], [-136, 58.5], [-131, 54], [-126.5, 50.5]];
const SA: [number, number][] = [[-77.2, 8.6], [-75.5, 10.5], [-72, 12], [-67, 10.8], [-63, 10.5], [-60, 8.5], [-55, 6], [-51.5, 4], [-50, 0],
  [-44.5, -2.5], [-38.5, -3.7], [-35, -5.5], [-35.3, -9], [-38.9, -13.5], [-39.2, -17.8], [-40.9, -22], [-44.5, -23.3], [-48.4, -26],
  [-50.5, -30.5], [-53.3, -34.2], [-57.5, -36], [-57.6, -38.6], [-62.2, -39], [-65, -42.8], [-67.5, -46.3], [-65.8, -48], [-69, -51.6],
  [-68.4, -53.3], [-66.5, -55], [-70, -55.8], [-74, -52.5], [-75.3, -47], [-73.7, -41], [-73.4, -37], [-71.6, -32.5], [-71.3, -27],
  [-70.3, -18.5], [-71.5, -17.2], [-76.2, -14], [-79.6, -7.5], [-81.2, -5], [-80.2, -2.2], [-80, 0.8], [-78.8, 1.6], [-77.5, 3.8], [-77.4, 7]];
const ROUTE: [number, number][] = [[-73.6, 40.2], [-71, 35], [-67, 27], [-62, 18], [-54, 10.5], [-46, 3], [-36.5, -2.5], [-33.5, -7.5], [-36.5, -15],
  [-38, -23], [-46, -30], [-53, -38], [-60, -45.5], [-63, -52], [-66, -57.2], [-70.5, -57.6], [-75.5, -53.5], [-77.5, -46], [-76.5, -38],
  [-73.5, -28], [-74, -20], [-78.5, -13], [-82.5, -5.5], [-83.5, 1], [-86, 6], [-91, 11], [-99, 14.5], [-106.5, 18.5], [-112, 22],
  [-115, 27], [-119, 31.5], [-122.8, 35.5], [-123.2, 37.7]];

export const routeCurve = (() => new THREE.CatmullRomCurve3(ROUTE.map(([lo, la]) => { const [x, z] = ll(lo, la); return new THREE.Vector3(x, 0.12, z); })))();
export const T0 = 0.2;
export const T1 = () => WE(25) + 0.15;   // chega quando termina "quilômetros"
export const shipU = (t: number) => smooth(t, T0, T1());

const Land = ({ pts }: { pts: [number, number][] }) => {
  const g = useMemo(() => { const s = new THREE.Shape(); pts.forEach(([lo, la], i) => { const [x, z] = ll(lo, la); i ? s.lineTo(x, z) : s.moveTo(x, z); });
    return new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.12, bevelSegments: 2 }); }, [pts]);
  return <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.42, 0]} material={[mat(C.grass), mat(C.sand)]} castShadow receiveShadow />;
};

export const MapSet = ({ t }: { t: number }) => {
  const u = shipU(t);
  const p = routeCurve.getPointAt(u), tan = routeCurve.getTangentAt(Math.min(0.999, u));
  const yaw = Math.atan2(-tan.z, tan.x);
  const dots = useMemo(() => Array.from({ length: 150 }, (_, i) => i / 150), []);
  const ny = ll(-74, 40.7), sf = ll(-122.4, 37.8), pa = ll(-79.7, 9.0);
  const cut = smooth(t, W(28), W(33) + 0.2);   // "abre um atalho: cava um canal": a linha corta o Panamá
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat(C.water, { rough: 0.3 })} receiveShadow><planeGeometry args={[400, 400]} /></mesh>
      <Land pts={NA} /><Land pts={SA} />
      {dots.filter(d => d <= u).map((d, i) => {
        const q = routeCurve.getPointAt(d);
        return <mesh key={i} position={[q.x, 0.06, q.z]} rotation={[-Math.PI / 2, 0, 0]} material={mat('#ffffff')}><circleGeometry args={[0.09, 8]} /></mesh>;
      })}
      {[ny, sf].map(([x, z], i) => (
        <group key={i} position={[x, 0.5, z]} scale={clamp(pop(t, i ? T1() - 0.3 : 0.1))}>
          <mesh position={[0, 0.5, 0]} material={mat(i ? '#ffcc1f' : '#ff4d4d', { rough: 0.4 })} castShadow><cylinderGeometry args={[0.07, 0.07, 1, 8]} /></mesh>
          <mesh position={[0.32, 0.82, 0]} material={mat(i ? '#ffcc1f' : '#ff4d4d', { rough: 0.4 })} castShadow><boxGeometry args={[0.6, 0.36, 0.05]} /></mesh>
        </group>
      ))}
      {/* o atalho: um canal azul cortando o istmo */}
      {cut > 0 && <group position={[pa[0], 0.56, pa[1]]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0, (cut - 1) * 0.55]} scale={[1, 1, cut]} material={mat('#1f7fe0')}><boxGeometry args={[0.16, 0.06, 1.1]} /></mesh>
        <mesh position={[0, 0.2, cut * 0.55 - 0.55]} scale={clamp(cut * 3) * 0.12} material={mat('#ffcc1f', { rough: 0.4 })} castShadow><icosahedronGeometry args={[1, 0]} /></mesh>
      </group>}
      <group position={[p.x, 0.02, p.z]} rotation={[0, yaw, 0]}><Ship seed={2} scale={0.38} /></group>
      <Cloud pos={[-8, 6, -6]} s={1.2} /><Cloud pos={[6, 7, 6]} s={1.4} /><Cloud pos={[-4, 6.5, 12]} s={1} />
      {void W}
    </group>
  );
};
