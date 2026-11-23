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
const flightCanvas = document.createElement('canvas');
flightCanvas.setAttribute('aria-hidden', 'true');
flightCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none';
stage.append(flightCanvas);
const flight = flightCanvas.getContext('2d');
const sprites = new Map();
const segmenters = new Map();
let view = svg.getBoundingClientRect();
new ResizeObserver(() => { view = svg.getBoundingClientRect(); }).observe(svg);
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
  return { city, face, label, path, pathId, radius, size, index, envelope: radius * 1.13 + size * 0.7,
    phase: (index * 0.381966) % 1, direction: index % 2 ? -1 : 1, layers: [] };
}

const clocks = CITIES.map(createClock);
const order = [...clocks.slice(0, 8), ...clocks.slice(8).reverse()];
const envelopes = clocks.map(clock => clock.envelope);
const positions = sceneTargets(Date.now() / 1000, envelopes, false);
let latched = false, enteredSharedCircle = false, merged = 0, sharedRadius = 390;
stage.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
  const zoom = Math.min(view.width / WIDTH, view.height / HEIGHT);
  if (!zoom) return;
  const x = (event.clientX - view.left - (view.width - WIDTH * zoom) / 2) / zoom;
  const y = (event.clientY - view.top - (view.height - HEIGHT * zoom) / 2) / zoom;
  const distanceFromCenter = Math.hypot(x - WIDTH / 2, y - HEIGHT / 2);
  const insideSharedCircle = distanceFromCenter <= sharedRadius;
  if (latched) {
    if (insideSharedCircle) enteredSharedCircle = true;
    // An outer clock can start the merge while the pointer is still outside.
    else if (distanceFromCenter > sharedRadius * 1.2 && (enteredSharedCircle || merged >= 0.98)) clearPointer();
    return;
  }
  if (merged > 0.02) return;
  latched = positions.some((p, i) => Math.hypot(p.x - x, p.y - y) < envelopes[i]);
  enteredSharedCircle = latched && insideSharedCircle;
});
function clearPointer() {
  latched = false;
  enteredSharedCircle = false;
}
stage.addEventListener('pointerleave', clearPointer);
window.addEventListener('blur', clearPointer);

function paintFlight(active) {
  const display = active ? '' : 'none';
  if (flightCanvas.style.display !== display) {
    flightCanvas.style.display = display;
    svg.style.visibility = active ? 'hidden' : '';
  }
  if (!active) return;
  const density = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.max(1, Math.round(view.width * density));
  const height = Math.max(1, Math.round(view.height * density));
  if (flightCanvas.width !== width || flightCanvas.height !== height) {
    flightCanvas.width = width;
    flightCanvas.height = height;
  }
  flight.setTransform(1, 0, 0, 1, 0, 0);
  flight.clearRect(0, 0, width, height);
  const zoom = Math.min(width / WIDTH, height / HEIGHT);
  flight.setTransform(zoom, 0, 0, zoom, (width - WIDTH * zoom) / 2, (height - HEIGHT * zoom) / 2);
}

function spriteFor(unit, width, size) {
  const key = `${context.font}:${context.direction}:${unit}`;
  let sprite = sprites.get(key);
  if (sprite) return sprite;
  const bitmap = document.createElement('canvas');
  bitmap.width = Math.ceil((width + size * 2) * 2);
  bitmap.height = size * 6;
  const ink = bitmap.getContext('2d');
  ink.scale(2, 2);
  ink.font = context.font;
  ink.direction = context.direction;
  ink.textAlign = 'center';
  ink.textBaseline = 'middle';
  ink.fillText(unit, bitmap.width / 4, bitmap.height / 4);
  sprite = { bitmap, width: bitmap.width / 2, height: bitmap.height / 2 };
  if (sprites.size >= 512) sprites.delete(sprites.keys().next().value);
  sprites.set(key, sprite);
  return sprite;
}

// Curvature is interpolated separately for each moving character.
function arcGeometry(clock, position, localAngle, sharedAngle, blend, scale) {
  const delta = Math.atan2(Math.sin(sharedAngle - localAngle), Math.cos(sharedAngle - localAngle));
  const angle = localAngle + delta * blend;
  const radius = 1 / mix(1 / clock.localRadius, scale / sharedRadius, blend);
  return {
    angle, radius,
    x: mix(position.x + Math.cos(localAngle) * clock.localRadius, 960 + Math.cos(sharedAngle) * sharedRadius, blend) / scale - Math.cos(angle) * radius,
    y: mix(position.y + Math.sin(localAngle) * clock.localRadius, 540 + Math.sin(sharedAngle) * sharedRadius, blend) / scale - Math.sin(angle) * radius,
  };
}

function drawArc(clock, geometry, blend) {
  const { radius, angle, x, y } = geometry;
  const localLength = TAU * clock.localRadius;
  const mergedLength = Math.max(...clock.layers.map(layer => layer.width)) + 36;
  const sweep = Math.min(TAU, mix(localLength, mergedLength, blend) / radius);
  const point = theta => `${x + Math.cos(theta) * radius} ${y + Math.sin(theta) * radius}`;
  const arc = `A ${radius} ${radius} 0 0 1`;
  clock.path.setAttribute('d', `M ${point(angle - sweep / 2)} ${arc} ${point(angle)} ${arc} ${point(angle + sweep / 2)}`);
}

function createGlyphs(clock, layer) {
  const rtl = clock.city.direction === 'rtl';
  const language = clock.city.language;
  if (!rtl && !segmenters.has(language)) {
    segmenters.set(language, new Intl.Segmenter(language, { granularity: 'grapheme' }));
  }
  // Cursive Arabic letters keep their joined word shape in flight.
  const units = rtl ? layer.value.split(/( )/).reverse() : [...segmenters.get(language).segment(layer.value)].map(part => part.segment);
  let prefix = '', advance = 0, spaces = 0;
  const glyphs = [];
  for (const unit of units) {
    prefix += unit;
    const next = context.measureText(prefix).width;
    if (unit === ' ') spaces++;
    else {
      const sprite = spriteFor(unit, Math.max(next - advance, context.measureText(unit).width), clock.size);
      const order = glyphs.length / Math.max(1, units.length - 1);
      glyphs.push({ sprite, center: (advance + next) / 2, spaces,
        delay: 0.23 * order + 0.02 * (1 + Math.sin(glyphs.length * 2.4)),
        lift: 11 + 14 * Math.sin(glyphs.length * 1.8 + clock.direction) });
    }
    advance = next;
  }
  layer.glyphs = glyphs;
}

function drawGlyphs(clock, layer, position, local, shared, progress, scale, opacity) {
  if (opacity <= 0.001) return;
  flight.globalAlpha = opacity;
  const extraSpace = (TAU * clock.localRadius - layer.width - layer.spaceWidth) / (layer.spaces + 1);
  for (const glyph of layer.glyphs) {
    const time = clamp((progress - glyph.delay) / 0.73, 0, 1);
    const blend = time * time * (3 - 2 * time);
    const arc = arcGeometry(clock, position, local, shared, blend, scale);
    const spacing = extraSpace * (1 - blend);
    const offset = glyph.center - layer.width / 2 + (glyph.spaces - layer.spaces / 2) * spacing;
    const angle = arc.angle + offset / arc.radius;
    const lift = Math.sin(Math.PI * blend) * glyph.lift;
    const x = arc.x + Math.cos(angle) * (arc.radius + lift);
    const y = arc.y + Math.sin(angle) * (arc.radius + lift);
    const rotation = angle + Math.PI / 2 + lift * Math.PI / 300;
    const { bitmap, width, height } = glyph.sprite;
    flight.save();
    flight.translate(x * scale, y * scale);
    flight.rotate(rotation);
    flight.drawImage(bitmap, -width * scale / 2, -height * scale / 2, width * scale, height * scale);
    flight.restore();
  }
}

function removeLayer(layer) {
  layer.text.remove();
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
  const layer = { text, value: run.textContent, width: clock.runWidth, spaces, spaceWidth };
  // Crossfade between two complete readings so word spaces remain intact.
  if (clock.layers.length > 1) removeLayer(clock.layers.shift());
  clock.layers.push(layer);
  clock.changed = animatedAt;
}

let previous;
let transition = 0;
let shownSecond;
let targets, nextTargets = 0;
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - (previous ?? now)) / 1000));
  previous = now;
  const date = new Date(), timestamp = date.getTime() / 1000;
  if (shownSecond !== Math.floor(timestamp)) {
    shownSecond = Math.floor(timestamp);
    for (const clock of clocks) writeTime(clock, date, now);
  }
  const quiet = reducedMotion.matches;
  const focus = latched;
  const formation = Number(focus);
  transition = quiet ? formation : clamp(transition + (focus ? dt : -dt) / 1.25, 0, 1);
  merged = transition * transition * (3 - 2 * transition);
  const inFlight = transition > 0 && transition < 1;
  paintFlight(inFlight);
  if ((!targets || now >= nextTargets) && merged < 1) {
    targets = sceneTargets(quiet ? 45 : timestamp, envelopes, false);
    separate(targets, envelopes);
    nextTargets = now + 50;
  }
  const travel = quiet ? 1 : 1 - Math.exp(-1.8 * dt);
  for (const [i, clock] of clocks.entries()) {
    if (merged < 1) {
      positions[i].x = mix(positions[i].x, targets[i].x, travel);
      positions[i].y = mix(positions[i].y, targets[i].y, travel);
    }
    if (!quiet) clock.phase += clock.direction * dt * (1 - merged) * 1.5 / clock.radius;
    const supportRadius = Math.max(...clock.layers.map(layer => layer.width + layer.spaceWidth)) / TAU;
    clock.localRadius = Math.max(supportRadius,
      mix(clock.localRadius, clock.targetRadius, quiet ? 1 : 1 - Math.exp(-9 * dt)));
    clock.slotWidth = mix(clock.slotWidth, clock.runWidth, quiet ? 1 : 1 - Math.exp(-9 * dt));
  }
  if (merged < 1) separate(positions, envelopes);
  const span = order.reduce((sum, clock) => sum + clock.slotWidth + 16, 0);
  sharedRadius = clamp(span / TAU, 315, 455);
  const sharedScale = Math.min(1, TAU * sharedRadius / span);
  const scale = mix(1, sharedScale, merged);
  let angle = Math.PI;
  for (const clock of order) {
    const slot = (clock.slotWidth + 16) / span * TAU;
    const local = clock.phase * TAU - Math.PI / 2;
    const position = positions[clock.index], shared = angle + slot / 2;
    if (!inFlight) {
      clock.face.setAttribute('transform', `scale(${scale})`);
      drawArc(clock, arcGeometry(clock, position, local, shared, merged, scale), merged);
    }
    angle += slot;
    const progress = quiet ? 1 : clamp((now - clock.changed) / 170, 0, 1);
    if (progress === 1 && clock.layers.length > 1) removeLayer(clock.layers.shift());
    for (const [index, layer] of clock.layers.entries()) {
      // Count the closing seam as one more word space.
      const spare = TAU * clock.localRadius - layer.width - layer.spaceWidth;
      const opacity = clock.layers.length === 1 ? 1 : index === 0 ? 1 - progress : progress;
      if (inFlight) {
        if (!layer.glyphs) {
          setFont(clock.city, clock.size);
          createGlyphs(clock, layer);
        }
        drawGlyphs(clock, layer, position, local, shared, transition, scale, opacity);
      } else {
        layer.text.style.wordSpacing = `${spare / (layer.spaces + 1) * (1 - merged)}px`;
        layer.text.style.opacity = opacity;
      }
    }
    const ink = Math.round(33 * (1 - merged));
    if (!inFlight) clock.face.style.fill = `rgb(${ink} ${ink} ${ink})`;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
