import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceScanner } from '../workspaceScanner';
import { Dependency } from '../types';

suite('Lua Dependency Analysis', () => {
	let workspaceScanner: WorkspaceScanner;
	const fixturesPath = path.join(__dirname, '_fixtures');

	setup(() => {
		workspaceScanner = new WorkspaceScanner(fixturesPath);
	});

	suite('Require Statement Detection', () => {
		test('should detect different require patterns', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const depsPath = Array.from(fileMap.keys()).find(path => path.endsWith('dependencies.lua'));
			const entities = fileMap.get(depsPath!)!;

			const deps = entities[0].dependencies;
			assert.ok(deps.length >= 7, 'Should find all require statements');

			// Standard require with parentheses
			assert.ok(deps.some(d => d.path === 'core.api' && d.type === 'require'), 
				'Should detect standard require with parentheses');

			// Require without parentheses
			assert.ok(deps.some(d => d.path === 'core.settings' && d.type === 'require'),
				'Should detect require without parentheses');

			// Relative path requires
			assert.ok(deps.some(d => d.path === './helper' && d.isRelative),
				'Should detect relative path requires');
			assert.ok(deps.some(d => d.path === '../utils' && d.isRelative),
				'Should detect parent directory requires');
		});

		test('should correctly identify external vs internal modules', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const depsPath = Array.from(fileMap.keys()).find(path => path.endsWith('dependencies.lua'));
			const entities = fileMap.get(depsPath!)!;

			const deps = entities[0].dependencies;

			// External modules (from core)
			const coreDeps = deps.filter(d => d.path.startsWith('core.'));
			assert.ok(coreDeps.every(d => !d.isExternal), 'Core modules should be internal');

			// Relative path modules
			const relativeDeps = deps.filter(d => d.path.startsWith('./') || d.path.startsWith('../'));
			assert.ok(relativeDeps.every(d => d.isRelative), 'Relative paths should be marked as relative');
			assert.ok(relativeDeps.every(d => !d.isExternal), 'Relative paths should not be external');
		});
	});

	suite('Module Resolution', () => {
		test('should resolve module paths correctly', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const depsPath = Array.from(fileMap.keys()).find(path => path.endsWith('dependencies.lua'));
			const entities = fileMap.get(depsPath!)!;

			const deps = entities[0].dependencies;

			// Check dot notation resolution
			const deepModule = deps.find(d => d.path === 'core.modules.heal_engine');
			assert.ok(deepModule, 'Should find deep module dependency');
			assert.ok(!deepModule!.isExternal, 'Deep module should be internal');

			// Check relative path resolution
			const helperDep = deps.find(d => d.path === './helper');
			assert.ok(helperDep, 'Should find helper dependency');
			assert.ok(helperDep!.isRelative, 'Helper should be marked as relative');
		});

		test('should handle module resolution edge cases', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const complexPath = Array.from(fileMap.keys()).find(path => path.endsWith('complex.lua'));
			const entities = fileMap.get(complexPath!)!;

			const deps = entities[0].dependencies;

			// Multiple requires of the same module
			const menuDeps = deps.filter(d => d.path === 'core.menu');
			assert.strictEqual(menuDeps.length, 1, 'Should deduplicate identical requires');

			// Module type detection
			assert.ok(deps.every(d => d.moduleType === 'lua'), 'All dependencies should be Lua modules');
		});
	});
});