import { Language } from '../types';

export function convertType(genericType: string, language: Language): string {
    const baseTypeMap: Record<Language, Record<string, string>> = {
        python: {
            'int': 'int',
            'long': 'int',
            'string': 'str',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'float',
            'char': 'str'
        },
        javascript: {
            'int': 'number',
            'long': 'number',
            'string': 'string',
            'bool': 'boolean',
            'boolean': 'boolean',
            'float': 'number',
            'double': 'number',
            'char': 'string'
        },
        java: {
            'int': 'int',
            'long': 'long',
            'string': 'String',
            'bool': 'boolean',
            'boolean': 'boolean',
            'float': 'float',
            'double': 'double',
            'char': 'char'
        },
        cpp: {
            'int': 'int',
            'long': 'long long',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'double',
            'char': 'char'
        },
        csharp: {
            'int': 'int',
            'long': 'long',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'double',
            'char': 'char'
        },
        rust: {
            'int': 'i32',
            'long': 'i64',
            'string': 'String',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'f32',
            'double': 'f64',
            'char': 'char'
        },
        go: {
            'int': 'int',
            'long': 'int64',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float32',
            'double': 'float64',
            'char': 'byte'
        },
        php: {
            'int': 'int',
            'long': 'int',
            'string': 'string',
            'bool': 'bool',
            'boolean': 'bool',
            'float': 'float',
            'double': 'float',
            'char': 'string'
        }
    };

    // Handle map types recursively: map<key, value>
    if (genericType.startsWith('map<') && genericType.endsWith('>')) {
        const inner = genericType.substring(4, genericType.length - 1);
        const parts = inner.split(',').map(s => s.trim());
        const keyType = parts[0] || 'string';
        const valType = parts.slice(1).join(',').trim() || 'string';

        const convKey = convertType(keyType, language);
        const convVal = convertType(valType, language);

        switch (language) {
            case 'python': return `Dict[${convKey}, ${convVal}]`;
            case 'javascript': return `Map<${convKey}, ${convVal}>`;
            case 'java': {
                const boxMap: Record<string, string> = { 'int': 'Integer', 'long': 'Long', 'boolean': 'Boolean', 'float': 'Float', 'double': 'Double', 'char': 'Character' };
                return `Map<${boxMap[convKey] || convKey}, ${boxMap[convVal] || convVal}>`;
            }
            case 'cpp': return `map<${convKey}, ${convVal}>`;
            case 'csharp': return `Dictionary<${convKey}, ${convVal}>`;
            case 'rust': return `HashMap<${convKey}, ${convVal}>`;
            case 'go': return `map[${convKey}]${convVal}`;
            case 'php': return 'array';
            default: return `map<${convKey}, ${convVal}>`;
        }
    }

    // Handle set types recursively: set<type>
    if (genericType.startsWith('set<') && genericType.endsWith('>')) {
        const innerType = genericType.substring(4, genericType.length - 1);
        const convertedInner = convertType(innerType, language);

        switch (language) {
            case 'python': return `Set[${convertedInner}]`;
            case 'javascript': return `Set<${convertedInner}>`;
            case 'java': {
                const boxMap: Record<string, string> = { 'int': 'Integer', 'long': 'Long', 'boolean': 'Boolean', 'float': 'Float', 'double': 'Double', 'char': 'Character' };
                return `Set<${boxMap[convertedInner] || convertedInner}>`;
            }
            case 'cpp': return `set<${convertedInner}>`;
            case 'csharp': return `HashSet<${convertedInner}>`;
            case 'rust': return `HashSet<${convertedInner}>`;
            case 'go': return `map[${convertedInner}]bool`;
            case 'php': return 'array';
            default: return `set<${convertedInner}>`;
        }
    }

    // Handle nested list types recursively: list<type>
    if (genericType.startsWith('list<') && genericType.endsWith('>')) {
        const innerType = genericType.substring(5, genericType.length - 1);
        const convertedInner = convertType(innerType, language);

        switch (language) {
            case 'python': return `List[${convertedInner}]`;
            case 'javascript': return `${convertedInner}[]`;
            case 'java': {
                const boxMap: Record<string, string> = { 'int': 'Integer', 'long': 'Long', 'boolean': 'Boolean', 'float': 'Float', 'double': 'Double', 'char': 'Character', 'string': 'String' };
                const boxed = boxMap[convertedInner] || (convertedInner.charAt(0).toUpperCase() + convertedInner.slice(1));
                return `List<${boxed}>`;
            }
            case 'cpp': return `vector<${convertedInner}>`;
            case 'csharp': return `List<${convertedInner}>`;
            case 'rust': return `Vec<${convertedInner}>`;
            case 'go': return `[]${convertedInner}`;
            case 'php': return 'array';
            default: return `List<${convertedInner}>`;
        }
    }

    // Handle array types recursively: array<type>
    if (genericType.startsWith('array<') && genericType.endsWith('>')) {
        const innerType = genericType.substring(6, genericType.length - 1);
        const convertedInner = convertType(innerType, language);

        switch (language) {
            case 'python': return `List[${convertedInner}]`;
            case 'javascript': return `${convertedInner}[]`;
            case 'java': return `${convertedInner}[]`;
            case 'cpp': return `vector<${convertedInner}>`;
            case 'csharp': return `${convertedInner}[]`;
            case 'rust': return `Vec<${convertedInner}>`;
            case 'go': return `[]${convertedInner}`;
            case 'php': return 'array';
            default: return `${convertedInner}[]`;
        }
    }

    // Handle collection types recursively: collection<type>
    if (genericType.startsWith('collection<') && genericType.endsWith('>')) {
        const innerType = genericType.substring(11, genericType.length - 1);
        const convertedInner = convertType(innerType, language);

        switch (language) {
            case 'python': return `List[${convertedInner}]`;
            case 'javascript': return `${convertedInner}[]`;
            case 'java': {
                const boxMap: Record<string, string> = { 'int': 'Integer', 'long': 'Long', 'boolean': 'Boolean', 'float': 'Float', 'double': 'Double', 'char': 'Character', 'string': 'String' };
                const boxed = boxMap[convertedInner] || (convertedInner.charAt(0).toUpperCase() + convertedInner.slice(1));
                return `List<${boxed}>`;
            }
            case 'cpp': return `vector<${convertedInner}>`;
            case 'csharp': return `List<${convertedInner}>`;
            case 'rust': return `Vec<${convertedInner}>`;
            case 'go': return `[]${convertedInner}`;
            case 'php': return 'array';
            default: return `List<${convertedInner}>`;
        }
    }

    if (genericType === 'void') return language === 'rust' ? '()' : 'void';

    return (baseTypeMap[language] as Record<string, string>)[genericType] || genericType;
}
