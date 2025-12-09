import { ProblemStructure } from "../types";
import { toPascalCase, toSnakeCase } from "../utils";
import { convertType } from "../utils";

/**
    * Generate UI code snippets for different programming languages
    * Yo chai user interface ko lagi ho, jasma function signature haru generate garincha
**/
export class SkeletonGenerator {

    static python(structure: ProblemStructure) {
        const { functionName, inputStructure, outputStructure } = structure;
        const params = inputStructure.map(field =>
            `${field.name}: ${convertType(field.type, 'python')}`
        ).join(', ');
        const returnType = convertType(outputStructure.type, 'python');

        return `class Solution:
    def ${toSnakeCase(functionName)}(self, ${params}) -> ${returnType}:
        pass`;
    }


    static javascript(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;
        const params = inputStructure.map(field => field.name).join(', ');

        return `function ${functionName}(${params}) {
        
    }`;
    }

    static java(structure: ProblemStructure): string {
        const { functionName, inputStructure, outputStructure } = structure;
        const params = inputStructure.map(field =>
            `${convertType(field.type, 'java')} ${field.name}`
        ).join(', ');
        const returnType = convertType(outputStructure.type, 'java');

        return `class Solution {
        public ${returnType} ${functionName}(${params}) {
            
        }
    }`;
    }


    static cpp(structure: ProblemStructure): string {
        const { functionName, inputStructure, outputStructure } = structure;
        const params = inputStructure.map(field =>
            `${convertType(field.type, 'cpp')}& ${field.name}`
        ).join(', ');
        const returnType = convertType(outputStructure.type, 'cpp');

        return `class Solution {
    public:
        ${returnType} ${functionName}(${params}) {
            
        }
    };`;
    }

    static csharp(structure: ProblemStructure): string {
        const { functionName, inputStructure, outputStructure } = structure;
        const params = inputStructure.map(field =>
            `${convertType(field.type, 'csharp')} ${field.name}`
        ).join(', ');
        const returnType = convertType(outputStructure.type, 'csharp');

        return `public class Solution {
        public ${returnType} ${toPascalCase(functionName)}(${params}) {
            
        }
    }`;
    }


    static rust(structure: ProblemStructure): string {
        const { functionName, inputStructure, outputStructure } = structure;
        const params = inputStructure.map(field =>
            `${field.name}: ${convertType(field.type, 'rust')}`
        ).join(', ');
        const returnType = convertType(outputStructure.type, 'rust');

        return `impl Solution {
        pub fn ${toSnakeCase(functionName)}(&self, ${params}) -> ${returnType} {

        }
    }`;
    }


    static go(structure: ProblemStructure): string {
        const { functionName, inputStructure, outputStructure } = structure;
        const params = inputStructure.map(field =>
            `${field.name} ${convertType(field.type, 'go')}`
        ).join(', ');
        const returnType = convertType(outputStructure.type, 'go');

        return `func ${functionName}(${params}) ${returnType} {
        
    }`;
    }



    static php(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;
        const params = inputStructure.map(field => `$${field.name}`).join(', ');

        return `class Solution {
    function ${functionName}(${params}) {
            
    }
}`;
    }
}