import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const scriptsRoot = path.join(projectRoot, 'public', 'scripts');
const runtimeRoot = path.join(scriptsRoot, 'runtime');

const staticImportRegex = /\bfrom\s+['"](\.{1,2}\/)+script\.js['"]/;
const dynamicImportRegex = /\bimport\s*\(\s*['"](\.{1,2}\/)+script\.js['"]\s*\)/;

async function collectTopLevelJavaScriptFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.js')) {
            continue;
        }

        files.push(path.join(directory, entry.name));
    }

    return files;
}

function findViolations(content, fullPath) {
    const violations = [];
    const lines = content.split('\n');

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
        const line = lines[lineNumber].trim();
        if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
            continue;
        }

        if (staticImportRegex.test(line) || dynamicImportRegex.test(line)) {
            violations.push({
                file: path.relative(projectRoot, fullPath),
                line: lineNumber + 1,
                text: line,
            });
        }
    }

    return violations;
}

async function main() {
    const files = await collectTopLevelJavaScriptFiles(scriptsRoot);
    const checkFiles = files.filter(file => !file.startsWith(`${runtimeRoot}${path.sep}`));
    const violations = [];

    for (const file of checkFiles) {
        const content = await fs.readFile(file, 'utf8');
        violations.push(...findViolations(content, file));
    }

    if (violations.length === 0) {
        console.log('Import boundary check passed: no direct script.js imports outside runtime adapters.');
        return;
    }

    console.error('Import boundary check failed. Found direct script.js imports outside runtime adapters:');
    for (const violation of violations) {
        console.error(`- ${violation.file}:${violation.line} -> ${violation.text}`);
    }

    process.exit(1);
}

main().catch(error => {
    console.error('Boundary check crashed:', error);
    process.exit(1);
});
