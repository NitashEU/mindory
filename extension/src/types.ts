export type LuaSymbolType = 
	| 'function'
	| 'table'
	| 'field'
	| 'method'
	| 'variable'
	| 'module'
	| 'string'
	| 'number'
	| 'boolean'
	| 'nil';

export type ModuleType = 'declaration' | 'typescript' | 'esm' | 'commonjs' | 'unknown';


export interface CodeEntity {
	type: LuaSymbolType | string;
	name: string;
	content: string;
	filePath: string;
	startLine: number;
	endLine: number;
	children: CodeEntity[];
	dependencies: Dependency[];
	references: any[];
	definition?: any;
	implementation?: any[];
	callers: string[];
	callees: string[];
	// Lua-specific fields
	isLocal?: boolean;
	tableFields?: string[];
	returnType?: LuaSymbolType;
}

export interface Dependency {
	type: 'import' | 'require';
	path: string;
	specifiers: string[];
	isTypeOnly: boolean;
	startLine: number;
	endLine: number;
	moduleType: 'lua' | 'typescript' | 'javascript' | 'commonjs' | 'esm' | 'unknown';
	isExternal: boolean;
	isRelative: boolean;
	resolvedPath?: string;
}

export interface LuaTableField {
	name: string;
	type: LuaSymbolType;
	value?: string;
}