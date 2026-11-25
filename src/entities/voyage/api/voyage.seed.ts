import { seededRandom } from '@/shared/lib/random';
import type { DdContainer, DdStatus, Voyage } from '../model/voyage';
import { CURRENCY_OF, CUSTOMERS, FIXED_VOYAGES, HUBS, PORTS, TODAY, VESSELS, addDays, daysBetween, toDate } from '../model/reference';

/** Sample voyages and D&D containers (seeded per port / country and date: the same every time). */

/** Voyages that load (E) or discharge (I) at `port` on `date`. */
export function generateDay(port: string, date: string): Voyage[] {
  const key = port + date;
  const hub = Object.values(HUBS).find((h) => h[1] === port) ?? HUBS.SIN ?? ['Singapore', 'SGSIN', 'SG', 11];
  const rnd = seededRandom(key);
  const dow = toDate(date).getDay();
  const n = Math.max(1, Math.round(hub[3] * (dow === 0 || dow === 6 ? 0.55 : 1) * (0.7 + rnd() * 0.6)));
  const age = daysBetween(date, TODAY);
  const list: Voyage[] = [];
  const make = (
    base: string,
    dir: 'E' | 'I',
    other: string,
    bls: number,
    avg: number,
    fixed: readonly [number, number, number, number, number] | null,
    vsl: readonly [string, string, string],
  ) => {
    const r = seededRandom(base + dir + date);
    let st: [number, number, number, number, number];
    if (fixed) st = [...fixed];
    else if (age > 0) {
      const left = age > 7 || r() < 0.72 ? 0 : Math.max(1, Math.round(bls * (0.01 + r() * 0.06)));
      const roe = Math.round(left * r() * 0.6);
      const hold = r() < 0.15 ? Math.min(left - roe, 1 + Math.round(r() * 4)) : 0;
      const ready = Math.round((left - roe - hold) * r() * 0.4);
      st = [bls - left, ready, roe, left - roe - hold - ready, hold];
    } else if (age === 0) {
      const inv = Math.round(bls * r() * 0.55);
      const roe = Math.round(bls * r() * 0.04);
      const nod = Math.round(bls * r() * 0.06);
      const hold = r() < 0.2 ? Math.round(r() * 6) : 0;
      st = [inv, Math.max(0, bls - inv - roe - nod - hold), roe, nod, hold];
    } else st = [0, 0, 0, 0, 0];
    const ccy = CURRENCY_OF[port.slice(0, 2)] ?? 'USD';
    const ent = r() < 0.86 ? 'PIL' : r() < 0.7 ? 'MELL' : 'MSC';
    list.push({
      id: base + dir + '@' + date,
      no: base + dir,
      dir,
      vessel: vsl[0],
      svc: vsl[2],
      ent: fixed ? 'PIL' : ent,
      pol: dir === 'E' ? port : other,
      pod: dir === 'E' ? other : port,
      here: port,
      other,
      date,
      bls,
      avg,
      st,
      pair: 'USD → ' + ccy,
    });
  };
  const firstVessel = VESSELS[0] ?? ['CMA CGM LEKKI', 'LK', 'NZS'];
  if (date === TODAY)
    (FIXED_VOYAGES[port] ?? []).forEach(([b, dir, other, bls, avg, f]) =>
      make(b, dir, other, bls, avg, f, VESSELS.find((v) => v[1] === b.slice(1, 3)) ?? firstVessel),
    );
  for (let i = 0; i < n; i++) {
    const v = VESSELS[Math.floor(rnd() * VESSELS.length)] ?? firstVessel;
    const other = PORTS.filter((x) => x !== port)[Math.floor(rnd() * (PORTS.length - 1))] ?? 'SGSIN';
    const base =
      String(Math.floor(rnd() * 9)) +
      v[1] +
      String(1 + Math.floor(rnd() * 8)) +
      String.fromCharCode(65 + Math.floor(rnd() * 26)) +
      String.fromCharCode(65 + Math.floor(rnd() * 26));
    make(base, rnd() < 0.5 ? 'E' : 'I', other, 120 + Math.round(rnd() * 980), 500 + Math.round(rnd() * 1600), null, v);
  }
  return list;
}

/** Every day of `month` ("2026-11"). */
export function generateMonth(port: string, month: string): Record<string, Voyage[]> {
  const out: Record<string, Voyage[]> = {};
  for (let d = month + '-01'; d.startsWith(month); d = addDays(d, 1)) out[d] = generateDay(port, d);
  return out;
}

const pickStatus = (x: number): DdStatus =>
  x < 0.22
    ? 'ready'
    : x < 0.27
      ? 'roe'
      : x < 0.31
        ? 'tariff'
        : x < 0.34
          ? 'milestone'
          : x < 0.38
            ? 'waiver'
            : x < 0.78
              ? 'out'
              : 'invoiced';

/** D&D containers of a country (snapshot). */
export function generateDdContainers(cc: string): DdContainer[] {
  const rnd = seededRandom('dd' + cc);
  const out: DdContainer[] = [];
  const sizes = ['20GP', '40HC', '40HC', '40RF'];
  const pre = ['PCIU', 'PCIU', 'TGHU', 'TCLU'];
  let bl = 23800;
  for (let i = 0; i < 140; i++) {
    if (i % 3 === 0 || rnd() < 0.4) bl += 1 + Math.floor(rnd() * 7);
    const sz = sizes[Math.floor(rnd() * sizes.length)] ?? '20GP';
    const st = pickStatus(rnd());
    const gate = addDays(TODAY, -(5 + Math.floor(rnd() * 40)));
    const back = st === 'out' ? '' : addDays(gate, 6 + Math.floor(rnd() * Math.max(1, daysBetween(gate, TODAY) - 5)));
    out.push({
      cn: pre[i % 4] + ' ' + String(100000 + Math.floor(rnd() * 899999)) + '-' + Math.floor(rnd() * 10),
      sz,
      cust: CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)] ?? '',
      dir: rnd() < 0.6 ? 'I' : 'E',
      bl: 'BL-' + cc + '-' + bl,
      out: gate,
      back: back > TODAY ? TODAY : back,
      free: sz === '40RF' ? 4 : rnd() < 0.5 ? 5 : 7,
      type: ['Detention', 'Demurrage', 'Combined'][Math.floor(rnd() * 3)] ?? 'Detention',
      st,
    });
  }
  return out;
}
