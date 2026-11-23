import { CITIES, formatClockParts, readClock } from './clock.js';
import { FONT_FAMILIES, FONT_WEIGHTS, loadFonts } from './fonts.js';
import { WIDTH, HEIGHT, TAU, mix, sceneTargets, separate } from './scene.js';

const stage = document.getElementById('letters');
const namespace = 'http://www.w3.org/2000/svg';
function element(tag, attributes = {}) {
  const item = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attributes)) item.setAttribute(key, value);
  return item;
}
const svg = element('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, class: 'clock-canvas' });
stage.append(svg);
const context = document.createElement('canvas').getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

await loadFonts();

function setFont(city, size) {
  context.font = `${FONT_WEIGHTS[city.language]} ${size}px ${FONT_FAMILIES[city.language]}`;
  context.direction = city.direction || 'ltr';
}

// Reserve room for each language at a common font size.
function measureClock(city) {
  const nominal = 19;
  setFont(city, nominal);
  const widest = [];
  for (let value = 0; value < 60; value++) {
    formatClockParts(city, value % 24, value, value).forEach((part, i) => {
      widest[i] = Math.max(widest[i] || 0, context.measureText(part).width);
    });
  }
  const length = widest.reduce((sum, width) => sum + width, 0) + (widest.length - 1) * nominal * 0.28;
  const radius = Math.max(28, length / (TAU * 0.86));
  return { radius, size: nominal };
}

function createClock(city, index) {
  const { radius, size } = measureClock(city);
  const face = element('g', { class: 'clock-text', lang: city.language, 'data-city': city.id });
  const pathId = `time-arc-${city.id}`;
  const path = element('path', { id: pathId });
  const defs = element('defs');
  defs.append(path);
  face.style.fontFamily = FONT_FAMILIES[city.language];
  face.style.fontWeight = FONT_WEIGHTS[city.language];
  face.style.fontSize = `${size}px`;
  face.append(defs);
  svg.append(face);
  let label = document.getElementById(`${city.id}-time`);
  if (!label) {
    label = document.createElement('p');
    label.className = 'accessible-time';
    label.lang = city.language;
    stage.before(label);
  }
  return { city, face, label, path, pathId, radius, size, envelope: radius * 1.13 + size * 0.7,
    phase: (index * 0.381966) % 1, direction: index % 2 ? -1 : 1, layers: [] };
}

const clocks = CITIES.map(createClock);
const envelopes = clocks.map(clock => clock.envelope);
const positions = sceneTargets(Date.now() / 1000, envelopes, false);
let pointer = null, hoverOrigin = null, merged = 0, sharedRadius = 390;
stage.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  const rect = svg.getBoundingClientRect();
  const zoom = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
  pointer = {
    x: (event.clientX - rect.left - (rect.width - WIDTH * zoom) / 2) / zoom,
    y: (event.clientY - rect.top - (rect.height - HEIGHT * zoom) / 2) / zoom,
  };
});
function clearPointer() { pointer = hoverOrigin = null; }
stage.addEventListener('pointerleave', clearPointer);
window.addEventListener('blur', clearPointer);

function hovering() {
  if (!pointer) return false;
  if (!hoverOrigin) {
    const i = positions.findIndex((p, index) => Math.hypot(p.x - pointer.x, p.y - pointer.y) < envelopes[index]);
    if (i < 0) return false;
    hoverOrigin = { ...pointer, reach: envelopes[i] + 24 };
  }
  if (Math.hypot(pointer.x - hoverOrigin.x, pointer.y - hoverOrigin.y) < hoverOrigin.reach) return true;
  if (merged > 0.65 && Math.abs(Math.hypot(pointer.x - 960, pointer.y - 540) - sharedRadius) < 42) return true;
  hoverOrigin = null;
  return false;
}

// Interpolate the curvature and the tangent, rather than stretching glyphs.
// Each path opens around its midpoint and becomes one arc of the shared ring.
function drawArc(clock, position, localAngle, sharedAngle, blend, scale) {
  const angleDelta = Math.atan2(Math.sin(sharedAngle - localAngle), Math.cos(sharedAngle - localAngle));
  const angle = localAngle + angleDelta * blend;
  const radius = 1 / mix(1 / clock.localRadius, scale / sharedRadius, blend);
  const midpointX = mix(position.x + Math.cos(localAngle) * clock.localRadius, 960 + Math.cos(sharedAngle) * sharedRadius, blend);
  const midpointY = mix(position.y + Math.sin(localAngle) * clock.localRadius, 540 + Math.sin(sharedAngle) * sharedRadius, blend);
  const centerX = midpointX / scale - Math.cos(angle) * radius;
  const centerY = midpointY / scale - Math.sin(angle) * radius;
  const localLength = TAU * clock.localRadius;
  const mergedLength = Math.max(...clock.layers.map(layer => layer.width)) + 36;
  const sweep = Math.min(TAU, mix(localLength, mergedLength, blend) / radius);
  const point = theta => `${centerX + Math.cos(theta) * radius} ${centerY + Math.sin(theta) * radius}`;
  const arc = `A ${radius} ${radius} 0 0 1`;
  clock.path.setAttribute('d', `M ${point(angle - sweep / 2)} ${arc} ${point(angle)} ${arc} ${point(angle + sweep / 2)}`);
  clock.face.setAttribute('transform', `scale(${scale})`);
}

function writeTime(clock, date, animatedAt) {
  const time = readClock(clock.city, date);
  if (time.key === clock.key) return;
  clock.key = time.key;
  clock.label.textContent = time.label;
  const text = element('text', { 'dominant-baseline': 'central',
    'text-anchor': 'middle', direction: clock.city.direction || 'ltr' });
  const run = element('textPath', { href: `#${clock.pathId}`, startOffset: '50%' });
  run.textContent = time.lines.join(' ');
  setFont(clock.city, clock.size);
  clock.runWidth = context.measureText(run.textContent).width;
  clock.slotWidth ??= clock.runWidth;
  const spaces = (run.textContent.match(/ /g) || []).length;
  const spaceWidth = context.measureText(' ').width;
  const comfortableLength = clock.runWidth + spaceWidth + (spaces + 1) * clock.size * 0.65;
  clock.targetRadius = Math.min(clock.radius, comfortableLength / TAU);
  clock.localRadius ??= clock.targetRadius;
  text.append(run);
  clock.face.append(text);
  const layer = { text, width: clock.runWidth, spaces, spaceWidth };
  // Crossfade between two complete readings so word spaces remain intact.
  if (clock.layers.length > 1) clock.layers.shift().text.remove();
  clock.layers.push(layer);
  clock.changed = animatedAt;
}

let previous;
let shownSecond;
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - (previous ?? now)) / 1000));
  previous = now;
  const date = new Date(), timestamp = date.getTime() / 1000;
  if (shownSecond !== Math.floor(timestamp)) {
    shownSecond = Math.floor(timestamp);
    for (const clock of clocks) writeTime(clock, date, now);
  }
  const quiet = reducedMotion.matches;
  const focus = hovering();
  const formation = Number(focus);
  merged += (formation - merged) * (quiet ? 1 : 1 - Math.exp(-2.8 * dt));
  if (Math.abs(merged - formation) < 0.001) merged = formation;
  const targets = sceneTargets(quiet ? 45 : timestamp, envelopes, false);
  for (const [i, clock] of clocks.entries()) {
    const travel = quiet ? 1 : 1 - Math.exp(-1.8 * dt);
    positions[i].x = mix(positions[i].x, targets[i].x, travel);
    positions[i].y = mix(positions[i].y, targets[i].y, travel);
    if (!quiet) clock.phase += clock.direction * dt * (1 - merged) * 1.5 / clock.radius;
    const supportRadius = Math.max(...clock.layers.map(layer => layer.width + layer.spaceWidth)) / TAU;
    clock.localRadius = Math.max(supportRadius,
      mix(clock.localRadius, clock.targetRadius, quiet ? 1 : 1 - Math.exp(-9 * dt)));
    clock.slotWidth = mix(clock.slotWidth, clock.runWidth, quiet ? 1 : 1 - Math.exp(-9 * dt));
  }
  separate(positions, envelopes);
  // Walk clockwise across the upper half, then back along the lower half.
  const order = [...clocks.slice(0, 8), ...clocks.slice(8).reverse()];
  const span = order.reduce((sum, clock) => sum + clock.slotWidth + 16, 0);
  sharedRadius = clamp(span / TAU, 315, 455);
  const sharedScale = Math.min(1, TAU * sharedRadius / span);
  const scale = mix(1, sharedScale, merged);
  let angle = Math.PI;
  for (const clock of order) {
    const slot = (clock.slotWidth + 16) / span * TAU;
    const local = clock.phase * TAU - Math.PI / 2;
    drawArc(clock, positions[clocks.indexOf(clock)], local, angle + slot / 2,
      merged, scale);
    angle += slot;
    const progress = quiet ? 1 : clamp((now - clock.changed) / 170, 0, 1);
    if (progress === 1 && clock.layers.length > 1) clock.layers.shift().text.remove();
    for (const [index, layer] of clock.layers.entries()) {
      // Count the closing seam as one more word space.
      const spare = TAU * clock.localRadius - layer.width - layer.spaceWidth;
      layer.text.style.wordSpacing = `${spare / (layer.spaces + 1) * (1 - merged)}px`;
      layer.text.style.opacity = clock.layers.length === 1 ? 1 : index === 0 ? 1 - progress : progress;
    }
    const ink = Math.round(33 * (1 - merged));
    clock.face.style.fill = `rgb(${ink} ${ink} ${ink})`;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
