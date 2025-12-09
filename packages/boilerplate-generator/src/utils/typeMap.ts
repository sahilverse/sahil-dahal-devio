import { Language } from '../types';

export function convertType(genericType: string, language: Language): string {
    const typeMap: Record<Language, Record<string, string>> = {
        python: {
            'int': 'int',
            'string': 'str',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'float',
            'list<int>': 'List[int]',
            'list<string>': 'List[str]',
            'list<list<int>>': 'List[List[int]]'
        },
        javascript: {
            'int': 'number',
            'string': 'string',
            'bool': 'boolean',
            'boolean': 'boolean',
            'float': 'number',
            'double': 'number',
            'list<int>': 'number[]',
            'list<string>': 'string[]',
            'list<list<int>>': 'number[][]'
        },
        java: {
            'int': 'int',
            'string': 'String',
            'bool': 'boolean',
            'boolean': 'boolean',
            'float': 'float',
            'double': 'double',
            'list<int>': 'int[]',
            'list<string>': 'String[]',
            'list<list<int>>': 'int[][]'
        },
        cpp: {
            'int': 'int',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'double',
            'list<int>': 'vector<int>',
            'list<string>': 'vector<string>',
            'list<list<int>>': 'vector<vector<int>>'
        },
        csharp: {
            'int': 'int',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'double',
            'list<int>': 'int[]',
            'list<string>': 'string[]',
            'list<list<int>>': 'int[][]'
        },
        rust: {
            'int': 'i32',
            'string': 'String',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'f32',
            'double': 'f64',
            'list<int>': 'Vec<i32>',
            'list<string>': 'Vec<String>',
            'list<list<int>>': 'Vec<Vec<i32>>'
        },
        go: {
            'int': 'int',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float32',
            'double': 'float64',
            'list<int>': '[]int',
            'list<string>': '[]string',
            'list<list<int>>': '[][]int'
        },
        php: {
            'int': 'int',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'float',
            'list<int>': 'array',
            'list<string>': 'array',
            'list<list<int>>': 'array'
        }
    };

    return typeMap[language][genericType] || genericType;
}
