import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Vite default port
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      if (process.env.CYPRESS_LOG_BROWSER_ARGS === '1') {
        // eslint-disable-next-line no-console
        console.log('[cypress] setupNodeEvents initialized');
      }

      on('before:browser:launch', (browser, launchOptions) => {
        const shouldLogArgs = process.env.CYPRESS_LOG_BROWSER_ARGS === '1';

        // Workaround for environments where the Chromium GPU process crashes on startup.
        // Disabling GPU generally stabilizes headless runs.
        if (browser.family === 'chromium' || browser.name === 'electron') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-software-rasterizer');
          launchOptions.args.push('--disable-gpu-compositing');
          launchOptions.args.push('--use-gl=swiftshader');
          launchOptions.args.push('--use-angle=swiftshader');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }

        if (shouldLogArgs) {
          const interestingArgs = launchOptions.args.filter((arg) =>
            /--headless|gpu|swiftshader|VizDisplayCompositor/i.test(arg),
          );
          // eslint-disable-next-line no-console
          console.log(
            `[cypress] launching ${browser.name} (${browser.family}) args:`,
            interestingArgs,
          );
        }

        return launchOptions;
      });
    },
  },
});
