import { ProblemStructure, InputField, OutputField } from "../types";

export class StructureParser {

    /**
        * Parse JSON or Markdown structure to ProblemStructure
        */
    static parse(input: string): ProblemStructure {
        try {
            // Try parsing as JSON first
            const json = JSON.parse(input);
            return {
                problemName: json["Problem Name"] || json.problemName,
                functionName: json["Function Name"] || json.functionName,
                inputStructure: this.parseInputStructure(json["Input Structure"] || json.inputStructure),
                outputStructure: this.parseOutputStructure(json["Output Structure"] || json.outputStructure)
            };
        } catch {
            // Parse as Markdown
            return this.parseMarkdown(input);
        }
    }

    private static parseInputStructure(input: any): InputField[] {
        const fields: InputField[] = [];


        /**
         * example:
         * [
         *   { "name": "arr", "type": "list<int>" },
         *   { "name": "target", "type": "int" }
         * ]
         */
        if (Array.isArray(input) && input.length > 0 && typeof input[0] === 'object' && ('name' in input[0]) && ('type' in input[0])) {
            for (const field of input) {
                fields.push({ name: field.name, type: field.type });
            }
            return fields;
        }


        return fields;
    }

    private static parseOutputStructure(output: any): OutputField {

        return {
            type: output.type || ''
        }
    }

    private static parseMarkdown(md: string): ProblemStructure {
        const lines = md.split('\n');
        const structure: any = {
            inputStructure: [],
            outputStructure: {}
        };

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('Problem Name:')) {
                structure.problemName = trimmed.split(':')[1]!.trim().replace(/"/g, '');
            } else if (trimmed.includes('Function Name:')) {
                structure.functionName = trimmed.split(':')[1]!.trim().replace(/"/g, '');
            } else if (trimmed.includes('Input Field:')) {
                const fieldStr = trimmed.split(':')[1]!.trim();
                const parts = fieldStr.split(' ');
                const type = parts[0];
                const name = parts[1];
                structure.inputStructure.push({ name, type });
            } else if (trimmed.includes('Output Field:')) {
                const fieldStr = trimmed.split(':')[1]!.trim();
                structure.outputStructure.type = fieldStr.split(' ')[0];
            }
        }

        return structure as ProblemStructure;
    }

}