import * as fs from 'fs';
import * as path from 'path';
import { StructureParser } from './StructureParser';
import { BoilerplateFactory } from './BoilerplateFactory';
import { languages } from '../types';
import { getExtension } from '../utils';


export class BoilerplateGenerator {


    static generateFromPath(problemPath: string): void {
        const structureMdPath = path.join(problemPath, 'structure.md');
        const structureJsonPath = path.join(problemPath, 'structure.json');

        let structureContent: string;

        if (fs.existsSync(structureJsonPath)) {
            structureContent = fs.readFileSync(structureJsonPath, 'utf-8');
            console.log(`✓ Found structure.json`);
        } else if (fs.existsSync(structureMdPath)) {
            structureContent = fs.readFileSync(structureMdPath, 'utf-8');
            console.log(`✓ Found structure.md`);
        } else {
            throw new Error(`No structure.json or structure.md found in ${problemPath}`);
        }


        const structure = StructureParser.parse(structureContent);
        console.log(`✓ Parsed problem: ${structure.problemName} (${structure.functionName})`);

        const { ui, full } = BoilerplateFactory.generateAll(structure);

        const boilerplatePath = path.join(problemPath, 'boilerplate');
        const boilerplateFullPath = path.join(problemPath, 'boilerplate-full');

        if (!fs.existsSync(boilerplatePath)) {
            fs.mkdirSync(boilerplatePath, { recursive: true });
        }
        if (!fs.existsSync(boilerplateFullPath)) {
            fs.mkdirSync(boilerplateFullPath, { recursive: true });
        }

        console.log('\nGenerating boilerplates...\n');

        for (const lang of languages) {
            const ext = getExtension(lang);
            const filename = `function.${ext}`;

            const uiPath = path.join(boilerplatePath, filename);
            fs.writeFileSync(uiPath, ui[lang]);
            console.log(`  ✓ boilerplate/${filename}`);

            const fullPath = path.join(boilerplateFullPath, filename);
            fs.writeFileSync(fullPath, full[lang]);
            console.log(`  ✓ boilerplate-full/${filename}`);
        }

        console.log(`\n✅ Generated ${languages.length * 2} files successfully!`);
        console.log(`\n📁 Output locations:`);
        console.log(`   UI:   ${boilerplatePath}`);
        console.log(`   Full: ${boilerplateFullPath}`);
    }
}