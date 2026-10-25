import { chromium, devices } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:3101';
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  ...(process.env.PERFORMANCE_PROXY ? { proxy: { server: process.env.PERFORMANCE_PROXY } } : {}),
});
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
try {
  const report = {
    environment: base,
    method:
      'Chromium, mobile emulated, 3 new contexts/route, no CPU/network throttling; laboratory data only',
    routes: [],
  };
  for (const path of ['/', '/livres', '/quiz']) {
    const samples = [];
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext({ ...devices['iPhone 13'] });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__metrics = { lcp: null, cls: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) window.__metrics.lcp = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            if (!entry.hadRecentInput) window.__metrics.cls += entry.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(base + path);
      await page.waitForLoadState('networkidle');
      samples.push(
        await page.evaluate(() => {
          const n = performance.getEntriesByType('navigation')[0];
          return {
            ttfb: n.responseStart - n.requestStart,
            domContentLoaded: n.domContentLoadedEventEnd,
            ...window.__metrics,
          };
        }),
      );
      await context.close();
    }
    report.routes.push({
      path,
      medianTtfbMs: Math.round(median(samples.map((s) => s.ttfb))),
      medianLcpMs: Math.round(median(samples.map((s) => s.lcp ?? 0))),
      maxCls: Math.max(...samples.map((s) => s.cls)),
      samples,
    });
  }
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
