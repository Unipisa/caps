import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const backendUrl = 'http://localhost:8765';
const webrootJsDir = path.resolve(__dirname, '../backend/webroot/js');

function writeVersionFile(isProduction) {
  return {
    name: 'caps-version-file',
    writeBundle(_, bundle) {
      const entry = Object.values(bundle).find((item) => {
        return item.type === 'chunk' && item.isEntry;
      });
      const css = Object.values(bundle).find((item) => {
        return item.type === 'asset' && item.fileName.endsWith('.css');
      });

      if (!entry && !css) {
        return;
      }

      fs.mkdirSync(webrootJsDir, { recursive: true });

      if (entry) {
        const versionFile = isProduction ? 'caps.min.js.version' : 'caps.js.version';
        fs.writeFileSync(path.join(webrootJsDir, versionFile), entry.fileName);
      }

      if (css) {
        fs.writeFileSync(path.join(webrootJsDir, 'caps.css.version'), css.fileName);
      }
    },
  };
}

function rewriteScriptTag() {
  const oldScriptTag = /<script\s+type="text\/javascript"\s+src="[^"]*\/js\/caps(?:-[^"]+)?(?:\.min)?\.js"><\/script>/g;
  const oldStylesheetTag = /<link\s+rel="stylesheet"\s+href="[^"]*\/js\/assets\/style-[^"]+\.css"\s*>/g;

  return {
    name: 'caps-vite-proxy-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const originalWrite = res.write;
        const originalEnd = res.end;
        const chunks = [];

        res.write = function write(chunk, encoding, callback) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
          if (typeof callback === 'function') {
            callback();
          }
          return true;
        };

        res.end = function end(chunk, encoding, callback) {
          if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
          }

          const contentType = String(res.getHeader('content-type') || '');
          if (contentType.includes('text/html')) {
            const html = Buffer.concat(chunks)
              .toString('utf8')
              .replace(oldStylesheetTag, '')
              .replace(oldScriptTag, '<script type="module" src="/src/caps.js"></script>');

            res.removeHeader('content-length');
            return originalEnd.call(this, html, 'utf8', callback);
          }

          for (const buffered of chunks) {
            originalWrite.call(this, buffered);
          }

          return originalEnd.call(this, null, encoding, callback);
        };

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      rewriteScriptTag(),
      writeVersionFile(isProduction),
    ],
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      proxy: {
        '^(?!/(?:@vite|@react-refresh|src|scss|node_modules)(?:/|$)).*': {
          target: backendUrl,
          changeOrigin: false,
          secure: false,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: [
            'color-functions',
            'global-builtin',
            'import',
            'mixed-decls',
            'slash-div',
          ],
        },
      },
    },
    build: {
      outDir: webrootJsDir,
      emptyOutDir: false,
      sourcemap: !isProduction,
      minify: isProduction ? 'oxc' : false,
      cssCodeSplit: false,
      rollupOptions: {
        input: path.resolve(__dirname, 'src/caps.js'),
        output: {
          entryFileNames: isProduction ? 'caps-[hash].min.js' : 'caps-[hash].js',
          format: 'iife',
          inlineDynamicImports: true,
        },
      },
    },
  };
});
