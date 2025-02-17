import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceScanner } from '../workspaceScanner';
import { CodeEntity, LuaSymbolType } from '../types';

suite('Lua Symbol Detection', () => {
	let workspaceScanner: WorkspaceScanner;
	const fixturesPath = path.join(__dirname, '_fixtures');

	setup(() => {
		workspaceScanner = new WorkspaceScanner(fixturesPath);
	});

	suite('Function Detection', () => {
		test('should detect different function types', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const basicLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('basic.lua'));
			const entities = fileMap.get(basicLuaPath!)!;

			// Global function
			const basicFunction = entities.find(e => e.name === 'basicFunction');
			assert.ok(basicFunction, 'Should find global function');
			assert.strictEqual(basicFunction!.type, 'function');

			// Method in table
			const tableMethod = entities.find(e => e.name === 'method');
			assert.ok(tableMethod, 'Should find table method');
			assert.strictEqual(tableMethod!.type, 'method');
		});

		test('should detect function parameters and scope', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const basicLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('basic.lua'));
			const entities = fileMap.get(basicLuaPath!)!;

			// Function with parameters
			const complexFunction = entities.find(e => e.name === 'complexFunction');
			assert.ok(complexFunction, 'Should find complex function');
			assert.ok(complexFunction!.content.includes('param1'), 'Should include parameters');
		});
	});

	suite('Table Detection', () => {
		test('should detect table structures', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const basicLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('basic.lua'));
			const entities = fileMap.get(basicLuaPath!)!;

			// Basic table
			const myTable = entities.find(e => e.name === 'myTable');
			assert.ok(myTable, 'Should find table');
			assert.strictEqual(myTable!.type, 'table');

			// Table fields
			assert.ok(myTable!.content.includes('field1'), 'Should include field1');
			assert.ok(myTable!.content.includes('field2'), 'Should include field2');
		});

		test('should detect nested table structures', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const complexLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('complex.lua'));
			const entities = fileMap.get(complexLuaPath!)!;

			// Complex table with nested structures
			const configTable = entities.find(e => e.name === 'config');
			assert.ok(configTable, 'Should find config table');
			assert.strictEqual(configTable!.type, 'table');

			// Verify nested content
			assert.ok(configTable!.content.includes('callbacks'), 'Should include callbacks table');
			assert.ok(configTable!.content.includes('data'), 'Should include data table');
		});
	});

	suite('Method Detection', () => {
		test('should detect class-like methods', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const complexLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('complex.lua'));
			const entities = fileMap.get(complexLuaPath!)!;

			// Class-like method
			const newMethod = entities.find(e => e.name === 'new');
			assert.ok(newMethod, 'Should find new method');
			assert.strictEqual(newMethod!.type, 'method');

			// Method with self parameter
			const processMethod = entities.find(e => e.name === 'process');
			assert.ok(processMethod, 'Should find process method');
			assert.strictEqual(processMethod!.type, 'method');
			assert.ok(processMethod!.content.includes('self'), 'Should include self parameter');
		});
	});

	suite('Variable Detection', () => {
		test('should detect local variables', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const basicLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('basic.lua'));
			const entities = fileMap.get(basicLuaPath!)!;

			// Local variable
			const testVar = entities.find(e => e.name === 'testVar');
			assert.ok(testVar, 'Should find test variable');
			assert.strictEqual(testVar!.type, 'variable');
		});

		test('should detect module variables', async () => {
			const fileMap = await workspaceScanner.scanWorkspace();
			const complexLuaPath = Array.from(fileMap.keys()).find(path => path.endsWith('complex.lua'));
			const entities = fileMap.get(complexLuaPath!)!;

			// Module variable
			const complexModule = entities.find(e => e.name === 'ComplexModule');
			assert.ok(complexModule, 'Should find ComplexModule');
			assert.ok(complexModule!.type === 'table' || complexModule!.type === 'module');
		});
	});
});