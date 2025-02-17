import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceScanner } from '../workspaceScanner';
import { CodeEntity } from '../types';

suite('WorkspaceScanner Test Suite', () => {
	let workspaceScanner: WorkspaceScanner;
	let fixturesScanner: WorkspaceScanner;
	const testLuaPath = path.join(__dirname, '_lua');
	const fixturesPath = path.join(__dirname, '_fixtures');

	setup(() => {
		workspaceScanner = new WorkspaceScanner(testLuaPath);
		fixturesScanner = new WorkspaceScanner(fixturesPath);
	});

	suite('Basic Scanner Functionality', () => {
		test('should initialize with correct patterns', () => {
			assert.deepStrictEqual(workspaceScanner['filePatterns'], ['lua']);
			assert.deepStrictEqual(workspaceScanner['excludePatterns'], ['node_modules', '.git', 'out', 'dist']);
		});

		test('should scan workspace and find Lua files', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			assert.ok(fileMap instanceof Map);
			assert.ok(fileMap.size > 0, 'Should find Lua files in test directory');
			
			// Verify key files exist
			const filePaths = Array.from(fileMap.keys());
			assert.ok(filePaths.some(path => path.endsWith('main.lua')), 'Should find main.lua');
			assert.ok(filePaths.some(path => path.endsWith('header.lua')), 'Should find header.lua');
		});
	});

	suite('Fixture File Analysis', () => {
		test('should analyze basic Lua fixtures', async () => {
			const fileMap = await fixturesScanner.scanWorkspace();
			const basicLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('basic.lua'));
			assert.ok(basicLuaPath, 'basic.lua should exist');

			const entities = fileMap.get(basicLuaPath!);
			assert.ok(entities, 'Should have entities for basic.lua');

			// Verify basic function detection
			const basicFunction = entities!.find(e => e.name === 'basicFunction');
			assert.ok(basicFunction, 'Should find basicFunction');
			assert.strictEqual(basicFunction!.type, 'function');

			// Verify table detection
			const myTable = entities!.find(e => e.name === 'myTable');
			assert.ok(myTable, 'Should find myTable');
			assert.strictEqual(myTable!.type, 'table');
		});

		test('should analyze complex Lua fixtures', async () => {
			const fileMap = await fixturesScanner.scanWorkspace();
			const complexLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('complex.lua'));
			assert.ok(complexLuaPath, 'complex.lua should exist');

			const entities = fileMap.get(complexLuaPath!);
			assert.ok(entities, 'Should have entities for complex.lua');

			// Verify module and method detection
			const complexModule = entities!.find(e => e.name === 'ComplexModule');
			assert.ok(complexModule, 'Should find ComplexModule');
			assert.ok(complexModule!.type === 'table' || complexModule!.type === 'module', 
				'ComplexModule should be recognized as table or module');

			// Verify method detection
			const processMethod = entities!.find(e => e.name === 'process');
			assert.ok(processMethod, 'Should find process method');
			assert.strictEqual(processMethod!.type, 'method');
		});
	});

	suite('Dependency Analysis', () => {
		test('should analyze dependencies in fixtures', async () => {
			const fileMap = await fixturesScanner.scanWorkspace();
			const depsPath = Array.from(fileMap.keys()).find(path => path.endsWith('dependencies.lua'));
			assert.ok(depsPath, 'dependencies.lua should exist');

			const entities = fileMap.get(depsPath!);
			assert.ok(entities, 'Should have entities for dependencies.lua');

			// Verify module with dependencies
			const moduleWithDeps = entities!.find(e => e.name === 'MyModule');
			assert.ok(moduleWithDeps, 'Should find MyModule');
			assert.ok(moduleWithDeps!.dependencies.length > 0, 'Should have dependencies');

			// Check specific dependencies
			const deps = moduleWithDeps!.dependencies;
			assert.ok(deps.some(d => d.path === 'core.api'), 'Should find core.api dependency');
			assert.ok(deps.some(d => d.path === './helper'), 'Should find relative helper dependency');
		});

		test('should analyze real project dependencies', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const mainLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('main.lua'));
			assert.ok(mainLuaPath, 'main.lua should exist');

			const entities = fileMap.get(mainLuaPath!);
			assert.ok(entities, 'Should have entities for main.lua');
			assert.ok(entities!.some(e => e.dependencies.length > 0), 'Should find dependencies in main.lua');
		});
	});

	suite('Symbol Processing', () => {
		test('should process nested functions and tables', async () => {
			const fileMap = await fixturesScanner.scanWorkspace();
			const complexLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('complex.lua'));
			const entities = fileMap.get(complexLuaPath!)!;

			// Verify nested structures
			const complexModule = entities.find(e => e.name === 'ComplexModule');
			assert.ok(complexModule!.children.length > 0, 'Should have child entities');

			// Verify config table structure
			const config = entities.find(e => e.name === 'config');
			assert.ok(config, 'Should find config table');
			assert.strictEqual(config!.type, 'table');
		});

		test('should track function calls and references', async () => {
			const fileMap = await fixturesScanner.scanWorkspace();
			const basicLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('basic.lua'));
			const entities = fileMap.get(basicLuaPath!)!;

			// Verify function calls are tracked
			const complexFunction = entities.find(e => e.name === 'complexFunction');
			assert.ok(complexFunction, 'Should find complexFunction');
			assert.ok(Array.isArray(complexFunction!.callers), 'Should track callers');
			assert.ok(Array.isArray(complexFunction!.callees), 'Should track callees');
		});
	});
});