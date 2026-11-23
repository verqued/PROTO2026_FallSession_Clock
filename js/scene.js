export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TAU = Math.PI * 2;
export const mix = (a, b, t) => a + (b - a) * t;
const smooth = t => {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
};

// Ordered from left to right on the upper and lower halves of the stage.
const home = [
  [195,430], [360,230], [565,340], [770,170], [1100,190], [1320,345], [1550,210], [1740,420],
  [210,670], [385,865], [585,675], [810,910], [1120,890], [1340,680], [1565,855], [1740,660],
];
const clusters = [[[0,1],[10,11]], [[2,3,4],[14,15]], [[5,6,7],[8,9]], [[0,8],[12,13,14]]];

export function gathering(second) {
  if (second >= 54) return smooth((second - 54) / 5);
  if (second < 2) return 1;
  return 1 - smooth((second - 2) / 6);
}

export function sceneTargets(seconds, envelopes, staged = true) {
  const second = ((seconds % 60) + 60) % 60;
  const formation = staged ? gathering(second) : 0;
  const points = home.map(([x,y], i) => ({
    x: x + 40 * Math.sin(seconds * 0.32 + i * 2.4),
    y: y + 36 * Math.cos(seconds * 0.37 + i * 1.8),
  }));
  const slot = Math.floor(Math.max(0, second - 8) / 11);
  const progress = (second - 8 - slot * 11) / 11;
  const affinity = smooth(progress * 3.5) * smooth((1 - progress) * 2.8);
  for (const cluster of clusters[slot % clusters.length]) {
    const center = cluster.reduce((p, i) => ({
      x: p.x + points[i].x / cluster.length, y: p.y + points[i].y / cluster.length,
    }), { x: 0, y: 0 });
    const first = points[cluster[0]], last = points[cluster.at(-1)];
    const angle = Math.atan2(last.y - first.y, last.x - first.x);
    const span = cluster.reduce((sum, i) => sum + 2 * envelopes[i] + 14, -14);
    let cursor = -span / 2;
    for (const i of cluster) {
      const along = cursor + envelopes[i];
      points[i].x = mix(points[i].x, center.x + Math.cos(angle) * along, affinity * 0.95);
      points[i].y = mix(points[i].y, center.y + Math.sin(angle) * along, affinity * 0.95);
      cursor += 2 * envelopes[i] + 14;
    }
  }
  return points.map((point, i) => {
    const angle = Math.PI + (i < 8 ? 1 : -1) * ((i % 8) + 0.5) * Math.PI / 8;
    return { x: mix(point.x, 960 + Math.cos(angle) * 418, formation),
      y: mix(point.y, 540 + Math.sin(angle) * 418, formation) };
  });
}

export function separate(positions, envelopes, focused = -1) {
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i];
      for (let j = i + 1; j < positions.length; j++) {
        const b = positions[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const overlap = envelopes[i] + envelopes[j] + 6 - distance;
        if (overlap <= 0) continue;
        const x = distance ? dx / distance * overlap : overlap;
        const y = distance ? dy / distance * overlap : 0;
        const share = focused === i ? 0.12 : focused === j ? 0.88 : 0.5;
        a.x -= x * share; a.y -= y * share;
        b.x += x * (1 - share); b.y += y * (1 - share);
        moved = true;
      }
      const margin = envelopes[i] + 12;
      a.x = Math.max(margin, Math.min(WIDTH - margin, a.x));
      a.y = Math.max(margin, Math.min(HEIGHT - margin, a.y));
    }
    if (!moved) break;
  }
}
