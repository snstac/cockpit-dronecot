import { compile } from 'sass';
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('Cockpit page layout', () => {
    test('provides a viewport-height root scroller', () => {
        const css = compile('src/app.scss', {
            loadPaths: ['pkg/lib', 'node_modules'],
            quietDeps: true,
        }).css;

        expect(css).toMatch(/html,\s*body,\s*#app\s*{[^}]*block-size:\s*100%/s);
        expect(css).toMatch(/#app\s*{[^}]*overflow-y:\s*auto/s);
    });
});

describe('DJI service namespace', () => {
    test('keeps the UI and package authorization on dronecot-dji', () => {
        const app = readFileSync(new URL('./app.tsx', import.meta.url), 'utf8');
        const policy = readFileSync(
            new URL('../packaging/49-cockpit-dronecot.rules', import.meta.url),
            'utf8',
        );

        expect(app).toContain("const SERVICE_NAME = 'dronecot-dji'");
        expect(policy).toContain('/etc/default/dronecot-dji');
        expect(policy).not.toContain('path == "/etc/default/dronecot"');
    });
});
