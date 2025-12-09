export type Language =
    | 'python' | 'javascript' | 'java' | 'cpp' | 'csharp'
    | 'rust' | 'go' | 'php';


export const languages: Language[] = [
    'python', 'javascript', 'java', 'cpp',
    'csharp', 'rust', 'go', 'php'
];


export interface InputField {
    name: string;
    type: string;
}

export interface OutputField {
    type: string;
}

export interface ProblemStructure {
    problemName: string;
    functionName: string;
    inputStructure: InputField[];
    outputStructure: OutputField;
}
