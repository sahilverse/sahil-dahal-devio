import { ProblemStructure } from "../types";
import { toSnakeCase, toPascalCase } from "../utils";
import { convertType } from "../utils/typeMap";

export class WrapperGenerator {

    static python(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `${field.name} = int(lines[${idx}].strip())`;
                case 'string':
                    return `${field.name} = lines[${idx}].strip()`;
                case 'list<int>':
                    return `${field.name} = [int(x.strip()) for x in lines[${idx}].strip().strip('[]').split(',') if x.strip()]`;
                case 'list<string>':
                    return `${field.name} = [x.strip().strip('\"\\'') for x in lines[${idx}].strip().strip('[]').split(',') if x.strip()]`;
                case 'list<list<int>>':
                    return `${field.name} = [[int(y.strip()) for y in x.split(',') if y.strip()] for x in lines[${idx}].strip().strip('[]').split(';')]`;
                case 'float':
                    return `${field.name} = float(lines[${idx}].strip())`;
                case 'bool':
                    return `${field.name} = lines[${idx}].strip().lower() == 'true'`;
                default:
                    return `${field.name} = lines[${idx}].strip()`;
            }
        }).join('\n');

        return `from typing import List, Optional, Dict, Set, Any
import sys

##USER_CODE_HERE##

lines = []
for line in sys.stdin:
    line = line.strip()
    if line:
        lines.append(line)

${inputs}

solution = Solution()
result = solution.${toSnakeCase(functionName)}(${inputStructure.map(f => f.name).join(', ')})


if isinstance(result, float):
    print(result)
elif isinstance(result, list):
    print(str(result).replace(' ', ''))
elif isinstance(result, bool):
    print(str(result).lower())
else:
    print(result)

`;
    }

    static javascript(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `const ${field.name} = parseInt(lines[${idx}]);`;
                case 'string':
                    return `const ${field.name} = lines[${idx}];`;
                case 'list<int>':
                    return `const ${field.name} = lines[${idx}].replace(/[\\[\\]]/g, '').split(',').filter(x => x.trim()).map(x => parseInt(x.trim()));`;
                case 'list<string>':
                    return `const ${field.name} = lines[${idx}].replace(/[\\[\\]]/g, '').split(',').filter(x => x.trim()).map(x => x.trim().replace(/^"|'|"|'$/g, ''));`;
                case 'list<list<int>>':
                    return `const ${field.name} = lines[${idx}].replace(/[\\[\\]]/g, '').split(';').map(row => row.split(',').filter(x => x.trim()).map(x => parseInt(x.trim())));`;
                case 'float':
                    return `const ${field.name} = parseFloat(lines[${idx}]);`;
                case 'bool':
                    return `const ${field.name} = lines[${idx}].toLowerCase() === 'true';`;
                default:
                    return `const ${field.name} = lines[${idx}];`;
            }
        }).join('\n');

        return `##USER_CODE_HERE##

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const lines = [];
rl.on('line', line => {
    if (line.trim()) lines.push(line.trim());
});

rl.on('close', () => {
    ${inputs}
    
    const result = ${functionName}(${inputStructure.map(f => f.name).join(', ')});
    
    if (Array.isArray(result)) {
        console.log(JSON.stringify(result));
    } else if (typeof result === 'number') {
        console.log(result);
    } else {
        console.log(result);
    }
});
`;
    }

    static java(structure: ProblemStructure): string {
        const { functionName, inputStructure, outputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `int ${field.name} = Integer.parseInt(lines[${idx}]);`;
                case 'string':
                    return `String ${field.name} = lines[${idx}];`;
                case 'list<int>':
                    return `List<Integer> ${field.name} = Arrays.stream(lines[${idx}].replaceAll("[\\\\[\\\\]]", "").split(","))
        .filter(s -> !s.trim().isEmpty())
        .map(Integer::parseInt)
        .collect(Collectors.toList());`;
                case 'list<string>':
                    return `List<String> ${field.name} = Arrays.stream(lines[${idx}].replaceAll("[\\\\[\\\\]]", "").split(","))
        .filter(s -> !s.trim().isEmpty())
        .map(String::trim)
        .collect(Collectors.toList());`;
                case 'list<list<int>>':
                    return `List<List<Integer>> ${field.name} = Arrays.stream(lines[${idx}].replaceAll("[\\\\[\\\\]]", "").split(";"))
        .map(inner -> Arrays.stream(inner.split(","))
            .filter(s -> !s.trim().isEmpty())
            .map(Integer::parseInt)
            .collect(Collectors.toList()))
        .collect(Collectors.toList());`;
                case 'float':
                    return `double ${field.name} = Double.parseDouble(lines[${idx}]);`;
                case 'bool':
                    return `boolean ${field.name} = Boolean.parseBoolean(lines[${idx}]);`;
                default:
                    return `String ${field.name} = lines[${idx}];`;
            }
        }).join('\n        ');

        return `import java.util.*;
import java.util.stream.Collectors;

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<String> lines = new ArrayList<>();
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine().trim();
            if (!line.isEmpty()) {
                lines.add(line);
            }
        }
        
        ${inputs}
        
        Solution solution = new Solution();
        ${outputStructure ? convertType(outputStructure.type, 'java') : 'Object'} result = solution.${functionName}(${inputStructure.map(f => f.name).join(', ')});

        if (result instanceof List) {
            System.out.println(result.toString().replaceAll("\\\\s+", ""));
        } else if (result instanceof double[]) {
            System.out.println(Arrays.toString((double[]) result).replaceAll("\\\\s+", ""));
        } else if (result instanceof int[]) {
            System.out.println(Arrays.toString((int[]) result).replaceAll("\\\\s+", ""));
        } else {
            System.out.println(result);
        }
    }
}`;
    }

    static rust(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `let ${field.name}: i32 = lines[${idx}].trim().parse().expect("Invalid integer");`;
                case 'string':
                    return `let ${field.name}: String = lines[${idx}].trim().to_string();`;
                case 'list<int>':
                    return `let ${field.name}: Vec<i32> = lines[${idx}]
    .trim()
    .trim_matches(|c: char| c == '[' || c == ']')
    .split(',')
    .filter_map(|x| x.trim().parse().ok())
    .collect();`;
                case 'list<string>':
                    return `let ${field.name}: Vec<String> = lines[${idx}]
    .trim()
    .trim_matches(|c: char| c == '[' || c == ']')
    .split(',')
    .map(|x| x.trim().trim_matches('\"').to_string())
    .collect();`;
                case 'list<list<int>>':
                    return `let ${field.name}: Vec<Vec<i32>> = lines[${idx}]
    .trim()
    .trim_matches(|c: char| c == '[' || c == ']')
    .split(';')
    .map(|row| row
        .split(',')
        .filter_map(|x| x.trim().parse().ok())
        .collect())
    .collect();`;
                case 'float':
                    return `let ${field.name}: f64 = lines[${idx}].trim().parse().expect("Invalid float");`;
                case 'bool':
                    return `let ${field.name}: bool = lines[${idx}].trim().parse().expect("Invalid boolean");`;
                default:
                    return `let ${field.name} = lines[${idx}].trim().to_string();`;
            }
        }).join('\n    ');

        return `use std::io::{self, BufRead};

struct Solution;


##USER_CODE_HERE##

fn main() {
    let stdin = io::stdin();
    let lines: Vec<String> = stdin
        .lock()
        .lines()
        .filter_map(Result::ok)
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect();

    ${inputs}

    let solution = Solution;
    let result = solution.${toSnakeCase(functionName)}(${inputStructure.map(f => f.name).join(', ')});
    
    println!("{}", result);
}`;
    }

    static cpp(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `int ${field.name} = std::stoi(lines[${idx}]);`;
                case 'string':
                    return `std::string ${field.name} = lines[${idx}];`;
                case 'list<int>':
                    return `std::vector<int> ${field.name};
    std::string list_str = lines[${idx}];
    list_str = list_str.substr(1, list_str.length() - 2); // Remove brackets
    std::stringstream ss(list_str);
    std::string item;
    while (std::getline(ss, item, ',')) {
        if (!item.empty()) ${field.name}.push_back(std::stoi(item));
    }`;
                case 'list<string>':
                    return `std::vector<std::string> ${field.name};
    std::string list_str = lines[${idx}];
    list_str = list_str.substr(1, list_str.length() - 2);
    std::stringstream ss(list_str);
    std::string item;
    while (std::getline(ss, item, ',')) {
        if (!item.empty()) ${field.name}.push_back(item);
    }`;
                case 'list<list<int>>':
                    return `std::vector<std::vector<int>> ${field.name};
    std::string outer_str = lines[${idx}];
    outer_str = outer_str.substr(1, outer_str.length() - 2);
    std::stringstream outer_ss(outer_str);
    std::string inner_list;
    while (std::getline(outer_ss, inner_list, ';')) {
        std::vector<int> inner_vec;
        std::stringstream inner_ss(inner_list);
        std::string num_str;
        while (std::getline(inner_ss, num_str, ',')) {
            if (!num_str.empty()) inner_vec.push_back(std::stoi(num_str));
        }
        ${field.name}.push_back(inner_vec);
    }`;
                case 'float':
                    return `double ${field.name} = std::stod(lines[${idx}]);`;
                case 'bool':
                    return `bool ${field.name} = lines[${idx}] == "true";`;
                default:
                    return `std::string ${field.name} = lines[${idx}];`;
            }
        }).join('\n    ');

        return `#include <iostream>
#include <vector>
#include <sstream>
#include <string>

##USER_CODE_HERE##

int main() {
    std::vector<std::string> lines;
    std::string line;
    
    while (std::getline(std::cin, line)) {
        if (!line.empty()) {
            lines.push_back(line);
        }
    }

    ${inputs}

    Solution solution;
    auto result = solution.${functionName}(${inputStructure.map(f => f.name).join(', ')});

    std::cout << result;
    return 0;
}`;
    }

    static go(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `var ${field.name} int
    fmt.Sscanf(lines[${idx}], "%d", &${field.name})`;
                case 'string':
                    return `${field.name} := lines[${idx}]`;
                case 'list<int>':
                    return `${field.name} := []int{}
    for _, s := range strings.Split(strings.Trim(lines[${idx}], "[]"), ",") {
        if s = strings.TrimSpace(s); s != "" {
            num, _ := strconv.Atoi(s)
            ${field.name} = append(${field.name}, num)
        }
    }`;
                case 'list<string>':
                    return `${field.name} := []string{}
    for _, s := range strings.Split(strings.Trim(lines[${idx}], "[]"), ",") {
        if s = strings.TrimSpace(s); s != "" {
            ${field.name} = append(${field.name}, strings.Trim(s, "\\""))
        }
    }`;
                case 'list<list<int>>':
                    return `${field.name} := [][]int{}
    for _, row := range strings.Split(strings.Trim(lines[${idx}], "[]"), ";") {
        nums := []int{}
        for _, s := range strings.Split(row, ",") {
            if s = strings.TrimSpace(s); s != "" {
                num, _ := strconv.Atoi(s)
                nums = append(nums, num)
            }
        }
        ${field.name} = append(${field.name}, nums)
    }`;
                case 'float':
                    return `var ${field.name} float64
    fmt.Sscanf(lines[${idx}], "%f", &${field.name})`;
                case 'bool':
                    return `${field.name} := lines[${idx}] == "true"`;
                default:
                    return `${field.name} := lines[${idx}]`;
            }
        }).join('\n    ');

        return `package main
import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

##USER_CODE_HERE##

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    var lines []string
    for scanner.Scan() {
        line := strings.TrimSpace(scanner.Text())
        if line != "" {
            lines = append(lines, line)
        }
    }

    ${inputs}

    result := ${functionName}(${inputStructure.map(f => f.name).join(', ')})
    fmt.Print(result)
}`;
    }

    static csharp(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `int ${field.name} = int.Parse(lines[${idx}]);`;
                case 'string':
                    return `string ${field.name} = lines[${idx}];`;
                case 'list<int>':
                    return `List<int> ${field.name} = lines[${idx}].Trim('[', ']').Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();`;
                case 'list<string>':
                    return `List<string> ${field.name} = lines[${idx}].Trim('[', ']').Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim().Trim('\"')).ToList();`;
                case 'list<list<int>>':
                    return `List<List<int>> ${field.name} = lines[${idx}].Trim('[', ']').Split(';', StringSplitOptions.RemoveEmptyEntries).Select(inner => inner.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList()).ToList();`;
                case 'float':
                    return `double ${field.name} = double.Parse(lines[${idx}]);`;
                case 'bool':
                    return `bool ${field.name} = bool.Parse(lines[${idx}]);`;
                default:
                    return `var ${field.name} = lines[${idx}];`;
            }
        }).join('\n        ');

        return `using System;
using System.Collections.Generic;
using System.Linq;

##USER_CODE_HERE##

class Program {
    static void Main() {
        var lines = new List<string>();
        string line;
        while ((line = Console.ReadLine()) != null) {
            line = line.Trim();
            if (!string.IsNullOrEmpty(line)) {
                lines.Add(line);
            }
        }

        ${inputs}

        Solution solution = new Solution();
        var result = solution.${toPascalCase(functionName)}(${inputStructure.map(f => f.name).join(', ')});
        
        if (result is IEnumerable<object> enumerable) {
            Console.WriteLine("[" + string.Join(",", enumerable.Cast<object>()) + "]");
        } else {
            Console.WriteLine(result);
        }
    }
}`;
    }

    static php(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            switch (field.type) {
                case 'int':
                    return `$${field.name} = (int) trim($lines[${idx}]);`;
                case 'string':
                    return `$${field.name} = trim($lines[${idx}]);`;
                case 'list<int>':
                    return `$${field.name} = array_map('intval', 
        array_filter(
            explode(',', trim(trim($lines[${idx}]), '[]')), 
            function($x) { return $x !== ''; }
        )
    );`;
                case 'list<string>':
                    return `$${field.name} = array_map(
        function($x) { return trim($x, " \\"'"); },
        array_filter(
            explode(',', trim(trim($lines[${idx}]), '[]')), 
            function($x) { return $x !== ''; }
        )
    );`;
                case 'list<list<int>>':
                    return `$${field.name} = array_map(
        function($row) {
            return array_map('intval', 
                array_filter(
                    explode(',', $row),
                    function($x) { return $x !== ''; }
                )
            );
        },
        array_filter(
            explode(';', trim(trim($lines[${idx}]), '[]')),
            function($x) { return $x !== ''; }
        )
    );`;
                case 'float':
                    return `$${field.name} = (float) trim($lines[${idx}]);`;
                case 'bool':
                    return `$${field.name} = trim($lines[${idx}]) === 'true';`;
                default:
                    return `$${field.name} = trim($lines[${idx}]);`;
            }
        }).join('\n');

        return `<?php

##USER_CODE_HERE##

$lines = [];
while ($line = fgets(STDIN)) {
    $line = trim($line);
    if ($line !== '') {
        $lines[] = $line;
    }
}

${inputs}

$solution = new Solution();
$result = $solution->${functionName}(${inputStructure.map(f => '$' + f.name).join(', ')});


if (is_array($result)) {
    echo json_encode($result);
} else if (is_float($result)) {
    echo $result;
} else if(is_bool($result)){
     echo $result ? 'true' : 'false';
}else {
    echo $result;
}
?>`;
    }


}