export interface Language {
    id: string;
    name: string;
    version: string;
    extension: string;
    boilerplate: string;
    monaco: string;
}

export const LANGUAGES: Record<string, Language> = {
    python: {
        id: 'python',
        name: 'Python',
        version: '3.10',
        extension: 'main.py',
        monaco: 'python',
        boilerplate: `# Online Python compiler (interpreter) to run Python online.
print("Try dev.io playground")
`
    },
    javascript: {
        id: 'javascript',
        name: 'JavaScript',
        version: 'Node.js 18',
        extension: 'index.js',
        monaco: 'javascript',
        boilerplate: `// Online JavaScript compiler (Node.js) to run JavaScript online.
console.log("Try dev.io playground");
`
    },
    c: {
        id: 'c',
        name: 'C',
        version: 'GCC 11',
        extension: 'main.c',
        monaco: 'c',
        boilerplate: `#include <stdio.h>

int main() {
    // Write C code here
    printf("Try dev.io playground\\n");
    return 0;
}
`
    },
    cpp: {
        id: 'cpp',
        name: 'C++',
        version: 'G++ 11',
        extension: 'main.cpp',
        monaco: 'cpp',
        boilerplate: `#include <iostream>

int main() {
    // Write C++ code here
    std::cout << "Try dev.io playground" << std::endl;
    return 0;
}
`
    },
    java: {
        id: 'java',
        name: 'Java',
        version: 'OpenJDK 17',
        extension: 'Main.java',
        monaco: 'java',
        boilerplate: `public class Main {
    public static void main(String[] args) {
        // Write Java code here
        System.out.println("Try dev.io playground");
    }
}
`
    }
};
