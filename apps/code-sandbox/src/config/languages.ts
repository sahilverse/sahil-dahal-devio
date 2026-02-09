import { LanguageConfig } from '../types';

export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
    python: {
        image: 'devio-sandbox-python',
        compileCommand: null,
        runCommand: ['python3', '{filename}'],
        extension: '.py',
        timeout: 1
    },
    javascript: {
        image: 'devio-sandbox-node',
        compileCommand: null,
        runCommand: ['node', '{filename}'],
        extension: '.js',
        timeout: 1
    },
    c: {
        image: 'devio-sandbox-cpp',
        compileCommand: ['gcc', '-o', 'program', '{filename}'],
        runCommand: ['./program'],
        extension: '.c',
        timeout: 2
    },
    cpp: {
        image: 'devio-sandbox-cpp',
        compileCommand: ['g++', '-o', 'program', '{filename}'],
        runCommand: ['./program'],
        extension: '.cpp',
        timeout: 2
    },
    java: {
        image: 'devio-sandbox-java',
        compileCommand: ['javac', '{filename}'],
        runCommand: ['java', '{classname}'],
        extension: '.java',
        timeout: 2
    }
};