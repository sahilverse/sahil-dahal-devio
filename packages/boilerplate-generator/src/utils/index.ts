import { Language } from "../types";
import { LANGUAGE_EXTENSIONS } from "./constants";

export const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export const toPascalCase = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getExtension = (language: Language): string => {
    return LANGUAGE_EXTENSIONS[language];
}

export * from './typeMap';
