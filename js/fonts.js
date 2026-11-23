// Adobe Web Project created with the user's explicit approval.
// AG Ahnsangsoo 2012 M: CSS family and weight verified in Adobe's embed dialog.
import { FONT_CATALOG } from './font-catalog.js';
export const FONT_FAMILIES = {
  ko: '"agahnsangsoo2012", "Clock Ahnsangsoo", sans-serif',
  en: '"Clock Helvetica", "Helvetica", sans-serif',
  ...Object.fromEntries(FONT_CATALOG.map(font => [font.language, `"${font.alias}", serif`])),
};
export const FONT_WEIGHTS = { ko: 500, en: 400,
  ...Object.fromEntries(FONT_CATALOG.map(font => [font.language, font.weight])),
};
export const ADOBE_KIT_ID = 'kmk2lxq';
export async function loadFonts() {
  await new Promise(resolve => {
    const script = document.createElement('script');
    script.src = `https://use.typekit.net/${ADOBE_KIT_ID}.js`;
    script.async = true;
    const timeout = setTimeout(resolve, 8000);
    const done = () => { clearTimeout(timeout); resolve(); };
    script.onload = () => {
      if (window.Typekit) window.Typekit.load({ async: true, active: done, inactive: done });
      else done();
    };
    script.onerror = done;
    document.head.append(script);
  });
  await Promise.allSettled([
    document.fonts.load(`500 100px ${FONT_FAMILIES.ko}`, '오전후열한두세네다섯여일곱덟아홉시영이삼사육칠팔구십분초'),
    ...Object.entries(FONT_FAMILIES).filter(([lang]) => lang !== 'ko').map(([lang, family]) => document.fonts.load(`${FONT_WEIGHTS[lang]} 100px ${family}`)),
  ]);
}
