import { CallHierarchyIncomingCall, CallHierarchyOutgoingCall, Location } from 'vscode';

export interface CodeEntity {
	type: string;
	name: string;
	content: string;
	filePath: string;
	startLine: number;
	endLine: number;
	children: CodeEntity[];
	dependencies: string[];
	references?: Location[];
	definition?: Location;
	implementation?: Location[];
	callers?: CallHierarchyIncomingCall[];
	callees?: CallHierarchyOutgoingCall[];
}

export interface LuaSymbol {
	name: string;
	type: 'function' | 'class' | 'method' | 'variable' | 'property';
	range: {
		start: { line: number; character: number };
		end: { line: number; character: number };
	};
	children?: LuaSymbol[];
}

export interface AnalysisResult {
	symbols: LuaSymbol[];
	dependencies: string[];
	errors?: string[];
}