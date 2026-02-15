import { ProblemStructure } from "../types";
import { toSnakeCase, toPascalCase } from "../utils";
import { convertType } from "../utils/typeMap";

export class WrapperGenerator {

    static python(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            return `${field.name} = json.loads(lines[${idx}].strip())`;
        }).join('\n');

        return `from typing import List, Optional, Dict, Set, Any, Tuple, Deque, Counter
import sys
import json
import math
import collections
import heapq
import bisect

##USER_CODE_HERE##

lines = []
for line in sys.stdin:
    line = line.strip()
    if line:
        lines.append(line)

${inputs}

solution = Solution()
result = solution.${toSnakeCase(functionName)}(${inputStructure.map(f => f.name).join(', ')})

print(json.dumps(result, separators=(',', ':')))
`;
    }

    static javascript(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            return `const ${field.name} = JSON.parse(lines[${idx}]);`;
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
    console.log(JSON.stringify(result));
});
`;
    }

    static java(structure: ProblemStructure): string {
        const { functionName, inputStructure, outputStructure } = structure;


        const finalInputs = inputStructure.map((field, idx) => {
            const javaType = convertType(field.type, 'java');
            if (javaType.startsWith('List<')) {
                return `${javaType} ${field.name} = JsonParser.parse(lines.get(${idx}), new JsonParser.TypeReference<${javaType}>() {});`;
            } else {
                const classRef = javaType.endsWith('[]') ? javaType + ".class" : (javaType.charAt(0).toUpperCase() + javaType.slice(1) + ".class").replace('Int.class', 'Integer.class').replace('Long.class', 'Long.class').replace('Bool.class', 'Boolean.class').replace('Double.class', 'Double.class').replace('Float.class', 'Float.class').replace('Char.class', 'Character.class').replace('String.class', 'String.class');
                return `${javaType} ${field.name} = JsonParser.parse(lines.get(${idx}), ${classRef});`;
            }
        }).join('\n        ');

        return `import java.util.*;
import java.util.stream.*;
import java.io.*;
import java.math.*;
import java.lang.reflect.*;

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<String> lines = new ArrayList<>();
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine().trim();
            if (!line.isEmpty()) lines.add(line);
        }
        
        ${finalInputs}
        
        Solution solution = new Solution();
        ${outputStructure ? convertType(outputStructure.type, 'java') : 'void'} result = solution.${functionName}(${inputStructure.map(f => f.name).join(', ')});

        System.out.println(JsonParser.serialize(result));
    }
}

class JsonParser {
    public static abstract class TypeReference<T> {
        private final Type type;
        protected TypeReference() {
            Type superclass = getClass().getGenericSuperclass();
            this.type = ((ParameterizedType) superclass).getActualTypeArguments()[0];
        }
        public Type getType() { return type; }
    }

    @SuppressWarnings("unchecked")
    public static <T> T parse(String json, TypeReference<T> typeRef) {
        Object raw = parseElement(json.trim());
        return (T) convertToType(raw, typeRef.getType());
    }

    @SuppressWarnings("unchecked")
    public static <T> T parse(String json, Class<T> clazz) {
        Object raw = parseElement(json.trim());
        return (T) convertToType(raw, (Type) clazz);
    }

    @SuppressWarnings("unchecked")
    private static Object convertToType(Object obj, Type type) {
        if (obj == null) return null;
        
        if (type instanceof Class) {
            Class<?> clazz = (Class<?>) type;
            if (clazz.isArray()) {
                List<?> list = (List<?>) obj;
                Class<?> componentType = clazz.getComponentType();
                Object array = Array.newInstance(componentType, list.size());
                for (int i = 0; i < list.size(); i++) {
                    Object val = list.get(i);
                    if (componentType.isPrimitive()) {
                        if (componentType == int.class) Array.setInt(array, i, ((Number)val).intValue());
                        else if (componentType == long.class) Array.setLong(array, i, ((Number)val).longValue());
                        else if (componentType == double.class) Array.setDouble(array, i, ((Number)val).doubleValue());
                        else if (componentType == float.class) Array.setFloat(array, i, ((Number)val).floatValue());
                        else if (componentType == boolean.class) Array.setBoolean(array, i, (Boolean)val);
                        else if (componentType == char.class) Array.setChar(array, i, val instanceof String ? ((String)val).charAt(0) : (Character)val);
                    } else {
                        Array.set(array, i, convertToType(val, componentType));
                    }
                }
                return array;
            }
            if (clazz == int.class || clazz == Integer.class) return Integer.valueOf(((Number)obj).intValue());
            if (clazz == long.class || clazz == Long.class) return Long.valueOf(((Number)obj).longValue());
            if (clazz == double.class || clazz == Double.class) return Double.valueOf(((Number)obj).doubleValue());
            if (clazz == float.class || clazz == Float.class) return Float.valueOf(((Number)obj).floatValue());
            if (clazz == boolean.class || clazz == Boolean.class) return obj;
            if (clazz == String.class) return obj;
        } else if (type instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType) type;
            if (pt.getRawType() == List.class) {
                List<Object> rawList = (List<Object>) obj;
                Type elementType = pt.getActualTypeArguments()[0];
                return rawList.stream().map(item -> convertToType(item, elementType)).collect(Collectors.toList());
            }
        }
        return obj;
    }

    private static Object parseElement(String s) {
        if (s.startsWith("[")) return parseArray(s);
        if (s.startsWith(String.valueOf((char)34))) return s.substring(1, s.length() - 1);
        if (s.equals("true")) return true;
        if (s.equals("false")) return false;
        try {
            if (s.contains(".")) return Double.valueOf(s);
            return Integer.valueOf(s);
        } catch (NumberFormatException e) {
            return s;
        }
    }

    private static List<Object> parseArray(String json) {
        List<Object> result = new ArrayList<>();
        if (json.equals("[]")) return result;
        String content = json.substring(1, json.length() - 1).trim();
        if (content.isEmpty()) return result;

        int depth = 0;
        boolean inQuotes = false;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (c == '\"') inQuotes = !inQuotes;
            if (!inQuotes) {
                if (c == '[') depth++;
                else if (c == ']') depth--;
            }
            if (c == ',' && depth == 0 && !inQuotes) {
                result.add(parseElement(sb.toString().trim()));
                sb = new StringBuilder();
            } else {
                sb.append(c);
            }
        }
        result.add(parseElement(sb.toString().trim()));
        return result;
    }

    public static String serialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof List) {
            return "[" + ((List<?>) obj).stream().map(JsonParser::serialize).collect(Collectors.joining(",")) + "]";
        }
        if (obj.getClass().isArray()) {
            StringBuilder sb = new StringBuilder("[");
            int len = Array.getLength(obj);
            for (int i = 0; i < len; i++) {
                sb.append(serialize(Array.get(obj, i)));
                if (i < len - 1) sb.append(",");
            }
            return sb.append("]").toString();
        }
        if (obj instanceof String) return (char)34 + (String)obj + (char)34;
        if (obj instanceof Boolean) return obj.toString();
        return String.valueOf(obj);
    }
}
`;
    }

    static cpp(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            const cppType = convertType(field.type, 'cpp');
            return `${cppType} ${field.name} = JsonParser::parse<${cppType}>(lines[${idx}]);`;
        }).join('\n    ');

        return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <stack>
#include <queue>
#include <deque>
#include <list>
#include <cmath>
#include <numeric>

class JsonParser {
public:
    template<typename T>
    static T parse(const std::string& s) {
        return parseValue<T>(s);
    }

    template<typename T>
    static std::string serialize(const T& val) {
        if constexpr (std::is_same_v<T, int> || std::is_same_v<T, long long>) return std::to_string(val);
        else if constexpr (std::is_same_v<T, double> || std::is_same_v<T, float>) return std::to_string(val);
        else if constexpr (std::is_same_v<T, bool>) return val ? "true" : "false";
        else if constexpr (std::is_same_v<T, std::string>) return "\\"" + val + "\\"";
        else {
            std::string res = "[";
            for (size_t i = 0; i < val.size(); ++i) {
                res += serialize(val[i]);
                if (i < val.size() - 1) res += ",";
            }
            res += "]";
            return res;
        }
    }

private:
    template<typename T>
    static T parseValue(std::string s) {
        s.erase(0, s.find_first_not_of(" \\t\\n\\r"));
        s.erase(s.find_last_not_of(" \\t\\n\\r") + 1);

        if constexpr (std::is_same_v<T, int>) return std::stoi(s);
        else if constexpr (std::is_same_v<T, long long>) return std::stoll(s);
        else if constexpr (std::is_same_v<T, double>) return std::stod(s);
        else if constexpr (std::is_same_v<T, bool>) return s == "true";
        else if constexpr (std::is_same_v<T, std::string>) return s.substr(1, s.length() - 2);
        else {
            // T is vector<U>
            T res;
            if (s == "[]") return res;
            std::string content = s.substr(1, s.length() - 2);
            int depth = 0;
            bool inQuotes = false;
            std::string current;
            for (char c : content) {
                if (c == '\\"') inQuotes = !inQuotes;
                if (!inQuotes) {
                    if (c == '[') depth++;
                    else if (c == ']') depth--;
                }
                if (c == ',' && depth == 0 && !inQuotes) {
                    res.push_back(parseValue<typename T::value_type>(current));
                    current = "";
                } else {
                    current += c;
                }
            }
            if (!current.empty()) res.push_back(parseValue<typename T::value_type>(current));
            return res;
        }
    }
};

##USER_CODE_HERE##

int main() {
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(std::cin, line)) {
        if (!line.empty()) lines.push_back(line);
    }
    ${inputs}
    Solution solution;
    auto result = solution.${functionName}(${inputStructure.map(f => f.name).join(', ')});
    std::cout << JsonParser::serialize(result) << std::endl;
    return 0;
}
`;
    }

    static rust(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            return `let ${field.name} = JsonParser::parse::<${convertType(field.type, 'rust')}>(lines[${idx}].trim());`;
        }).join('\n    ');

        return `#[allow(unused_imports)]
use std::io::{self, BufRead};
#[allow(unused_imports)]
use std::collections::{HashMap, HashSet, VecDeque, BinaryHeap, BTreeMap, BTreeSet};
#[allow(unused_imports)]
use std::cmp::{self, Ordering};

struct Solution;

struct JsonParser;
impl JsonParser {
    fn parse<T: FromJson>(s: &str) -> T {
        T::from_json(s)
    }

    fn serialize<T: ToJson>(val: &T) -> String {
        val.to_json()
    }
}

trait FromJson {
    fn from_json(s: &str) -> Self;
}

impl FromJson for i32 {
    fn from_json(s: &str) -> Self { s.parse().unwrap() }
}
impl FromJson for i64 {
    fn from_json(s: &str) -> Self { s.parse().unwrap() }
}
impl FromJson for f32 {
    fn from_json(s: &str) -> Self { s.parse().unwrap() }
}
impl FromJson for f64 {
    fn from_json(s: &str) -> Self { s.parse().unwrap() }
}
impl FromJson for bool {
    fn from_json(s: &str) -> Self { s.parse().unwrap() }
}
impl FromJson for String {
    fn from_json(s: &str) -> Self { s.trim_matches('\"').to_string() }
}

impl<T: FromJson> FromJson for Vec<T> {
    fn from_json(s: &str) -> Self {
        let s = s.trim();
        if s == "[]" { return Vec::new(); }
        let content = &s[1..s.len()-1];
        let mut res = Vec::new();
        let mut depth = 0;
        let mut in_quotes = false;
        let mut start = 0;
        let bytes = content.as_bytes();
        for i in 0..bytes.len() {
            let c = bytes[i] as char;
            if c == '\"' { in_quotes = !in_quotes; }
            if !in_quotes {
                if c == '[' || c == '(' || c == '{' { depth += 1; }
                else if c == ']' || c == ')' || c == '}' { depth -= 1; }
                else if c == ',' && depth == 0 {
                    res.push(T::from_json(content[start..i].trim()));
                    start = i + 1;
                }
            }
        }
        res.push(T::from_json(content[start..].trim()));
        res
    }
}

trait ToJson {
    fn to_json(&self) -> String;
}

impl ToJson for i32 { fn to_json(&self) -> String { self.to_string() } }
impl ToJson for i64 { fn to_json(&self) -> String { self.to_string() } }
impl ToJson for f32 { fn to_json(&self) -> String { self.to_string() } }
impl ToJson for f64 { fn to_json(&self) -> String { self.to_string() } }
impl ToJson for bool { fn to_json(&self) -> String { self.to_string() } }
impl ToJson for String { fn to_json(&self) -> String { format!("{}{}{}", '"', self, '"') } }

impl<T: ToJson> ToJson for Vec<T> {
    fn to_json(&self) -> String {
        let parts: Vec<String> = self.iter().map(|x| x.to_json()).collect();
        format!("[{}]", parts.join(","))
    }
}

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
    
    println!("{}", JsonParser::serialize(&result));
}
`;
    }

    static go(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            return `var ${field.name} ${convertType(field.type, 'go')}
    if err := json.Unmarshal([]byte(lines[${idx}]), &${field.name}); err != nil {
        panic(err)
    }`;
        }).join('\n    ');

        return `package main
import (
    "bufio"
    "fmt"
    "os"
    "strings"
    "encoding/json"
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
    out, _ := json.Marshal(result)
    fmt.Print(string(out))
}
`;
    }

    static csharp(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            return `${convertType(field.type, 'csharp')} ${field.name} = JsonParser.Deserialize<${convertType(field.type, 'csharp')}>(lines[${idx}]);`;
        }).join('\n        ');

        return `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;
using System.Reflection;

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
        
        Console.WriteLine(JsonParser.Serialize(result));
    }
}

class JsonParser {
    public static T Deserialize<T>(string json) {
        object result = ParseElement(json.Trim());
        return ConvertToType<T>(result);
    }

    private static T ConvertToType<T>(object obj) {
        if (obj == null) return default(T);
        Type targetType = typeof(T);

        if (targetType.IsArray) {
            var list = obj as IList;
            if (list == null) return default(T);
            Type elementType = targetType.GetElementType();
            Array array = Array.CreateInstance(elementType, list.Count);
            for (int i = 0; i < list.Count; i++) {
                object val = list[i];
                if (val is IList && elementType.IsArray) {
                    var method = typeof(JsonParser).GetMethod("ConvertToType", BindingFlags.NonPublic | BindingFlags.Static);
                    var genericMethod = method.MakeGenericMethod(elementType);
                    array.SetValue(genericMethod.Invoke(null, new object[] { val }), i);
                } else {
                    array.SetValue(Convert.ChangeType(val, elementType), i);
                }
            }
            return (T)(object)array;
        }

        if (targetType.IsGenericType && targetType.GetGenericTypeDefinition() == typeof(List<>)) {
            var list = obj as IList;
            if (list == null) return default(T);
            Type elementType = targetType.GetGenericArguments()[0];
            var resultList = (IList)Activator.CreateInstance(targetType);
            foreach (var item in list) {
                var method = typeof(JsonParser).GetMethod("ConvertToType", BindingFlags.NonPublic | BindingFlags.Static);
                var genericMethod = method.MakeGenericMethod(elementType);
                resultList.Add(genericMethod.Invoke(null, new object[] { item }));
            }
            return (T)resultList;
        }

        return (T)Convert.ChangeType(obj, targetType);
    }

    private static object ParseElement(string s) {
        if (s.StartsWith("[")) return ParseArray(s);
        if (s.StartsWith(((char)34).ToString())) return s.Substring(1, s.Length - 2);
        if (s == "true") return true;
        if (s == "false") return false;
        if (s.Contains(".")) return double.Parse(s);
        try { return int.Parse(s); } catch { return s; }
    }

    private static IList ParseArray(string json) {
        var result = new List<object>();
        if (json == "[]") return result;
        string content = json.Substring(1, json.Length - 2).Trim();
        if (string.IsNullOrEmpty(content)) return result;

        int depth = 0;
        bool inQuotes = false;
        var sb = new StringBuilder();
        for (int i = 0; i < content.Length; i++) {
            char c = content[i];
            if (c == '\"') inQuotes = !inQuotes;
            if (!inQuotes) {
                if (c == '[') depth++;
                else if (c == ']') depth--;
            }
            if (c == ',' && depth == 0 && !inQuotes) {
                result.Add(ParseElement(sb.ToString().Trim()));
                sb.Clear();
            } else {
                sb.Append(c);
            }
        }
        result.Add(ParseElement(sb.ToString().Trim()));
        return result;
    }

    public static string Serialize(object obj) {
        if (obj == null) return "null";
        if (obj is string) return (char)34 + obj.ToString() + (char)34;
        if (obj is bool) return obj.ToString().ToLower();
        if (obj is IEnumerable && !(obj is string)) {
            var list = new List<string>();
            foreach (var item in (IEnumerable)obj) {
                list.Add(Serialize(item));
            }
            return "[" + string.Join(",", list) + "]";
        }
        return obj.ToString();
    }
}
`;
    }

    static php(structure: ProblemStructure): string {
        const { functionName, inputStructure } = structure;

        const inputs = inputStructure.map((field, idx) => {
            return `$${field.name} = json_decode(trim($lines[${idx}]), true);`;
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

echo json_encode($result);
?>`;
    }


}