// analyzer.js
export function analyzeCode(code) {
  const issues = [];

  const lines = code.split("\n");

  // -----------------------------
  // RULE 1: Missing Semicolons
  // -----------------------------
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.startsWith("if") &&
      !trimmed.startsWith("for") &&
      !trimmed.startsWith("while") && 
      !trimmed.startsWith("//") &&
      !trimmed.includes("function") &&
      !trimmed.includes("class")
    ) {
      issues.push({
        rule: "Missing Semicolon",
        severity: "medium",
        suggestion: "Add a semicolon at the end of this statement.",
        details: { line: i + 1, content: trimmed }
      });
    }
  });

  // -----------------------------
  // RULE 2: Unused Variables
  // -----------------------------
  const varRegex = /(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  const declared = [];
  let match;

  while ((match = varRegex.exec(code)) !== null) {
    declared.push(match[2]);
  }

  declared.forEach((variable) => {
    const occurrences = code.split(variable).length - 1;
    if (occurrences === 1) {
      issues.push({
        rule: "Unused Variable",
        severity: "low",
        suggestion: `Remove or use '${variable}'.`,
        details: { variable }
      });
    }
  });

  // -----------------------------
  // RULE 3: Long Function Detection
  // -----------------------------
  const funcRegex = /function\s+([a-zA-Z0-9_$]*)?\s*\((.*?)\)\s*\{/g;
  let funcMatch;
  while ((funcMatch = funcRegex.exec(code)) !== null) {
    const start = funcMatch.index;
    const body = code.slice(start);
    const end = body.indexOf("}");
    const funcLines = body.slice(0, end).split("\n").length;

    if (funcLines > 30) {
      issues.push({
        rule: "Function Too Long",
        severity: "medium",
        suggestion: "Break into smaller functions.",
        details: { function: funcMatch[1] || "(anonymous)", lines: funcLines }
      });
    }
  }

  // -----------------------------
  // RULE 4: Too Many Parameters
  // -----------------------------
  while ((funcMatch = funcRegex.exec(code)) !== null) {
    const params = funcMatch[2].split(",").filter((x) => x.trim() !== "");
    if (params.length > 4) {
      issues.push({
        rule: "Too Many Function Parameters",
        severity: "medium",
        suggestion: "Reduce parameters or use an object.",
        details: { function: funcMatch[1], parameters: params.length }
      });
    }
  }

  // -----------------------------
  // RULE 5: Built-in Function Missing Parentheses
  // -----------------------------
  const builtins = [
  "console.log",
  "alert",
  "prompt",
  "parseInt",
  "parseFloat",
  "isNaN",
  "isFinite",
  "setTimeout",
  "setInterval",
  "fetch",
  "addEventListener",
  "removeEventListener",
  "getElementById",
  "getElementsByClassName",
  "getElementsByTagName",
  "querySelector",
  "querySelectorAll",
  "createElement",
  "appendChild",
  "removeChild"
];

builtins.forEach((fn) => {
  const reg = new RegExp(`\\b${fn}\\b(?!\\()`, "g");
  if (reg.test(code)) {
    issues.push({
      rule: "Missing Parentheses in Built-in Function",
      severity: "high",
      suggestion: `Use: ${fn}(...)`,
      details: { function: fn }
    });
  }
});
                      
  // -----------------------------
  // RULE 6: == instead of ===
  // -----------------------------
  const eqRegex = /[^=]==[^=]/g;
  if (eqRegex.test(code)) {
    issues.push({
      rule: "Loose Equality Detected",
      severity: "high",
      suggestion: "Use '===' instead of '=='."
    });
  }

  // -----------------------------
  // RULE 7: Debug Logs
  // -----------------------------
  lines.forEach((line, i) => {
    if (line.includes("console.log")) {
      issues.push({
        rule: "Debug Log Found",
        severity: "low",
        suggestion: "Remove console.log before production.",
        details: { line: i + 1 }
      });
    }
  });

  // -----------------------------
  // RULE 8: TODO or FIXME
  // -----------------------------
  lines.forEach((line, i) => {
    if (/TODO|FIXME/.test(line)) {
      issues.push({
        rule: "TODO/FIXME Found",
        severity: "low",
        suggestion: "Complete the pending work.",
        details: { line: i + 1, content: line.trim() }
      });
    }
  });

  // -----------------------------
  // RULE 9: Indentation Issues
  // -----------------------------
  lines.forEach((line, i) => {
    if (/^\s+/.test(line) && line.startsWith(" ")) {
      const spaces = line.match(/^ +/)[0].length;
      if (spaces % 2 !== 0) {
        issues.push({
          rule: "Bad Indentation",
          severity: "low",
          suggestion: "Use consistent 2 or 4 spaces.",
          details: { line: i + 1, spaces }
        });
      }
    }
  });

  // -----------------------------
  // RULE 10: Trailing Spaces
  // -----------------------------
  lines.forEach((line, i) => {
    if (/\s+$/.test(line)) {
      issues.push({
        rule: "Trailing Whitespace",
        severity: "low",
        suggestion: "Remove trailing spaces.",
        details: { line: i + 1 }
      });
    }
  });

  // -----------------------------
  // RULE 11: Long Lines
  // -----------------------------
  lines.forEach((line, i) => {
    if (line.length > 120) {
      issues.push({
        rule: "Line Too Long",
        severity: "medium",
        suggestion: "Break into multiple lines.",
        details: { line: i + 1, length: line.length }
      });
    }
  });

  // -----------------------------
  // RULE 12: Unused Imports
  // -----------------------------
  const impRegex = /import\s+.*?from\s+['"](.*)['"]/g;
  let importMatch;
  while ((importMatch = impRegex.exec(code)) !== null) {
    const imp = importMatch[1];
    if (!code.includes(imp.split("/").pop().replace(".js", ""))) {
      issues.push({
        rule: "Possibly Unused Import",
        severity: "low",
        suggestion: "Remove unused imports.",
        details: { import: imp }
      });
    }
  }

  // -----------------------------
  // RULE 13: Empty Blocks {}
  // -----------------------------
  if (/\{\s*\}/.test(code)) {
    issues.push({
      rule: "Empty Code Block",
      severity: "low",
      suggestion: "Remove empty blocks or add logic."
    });
  }

  // -----------------------------
  // RULE 14: Missing Return in Functions
  // -----------------------------
  const returnRegex = /function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\(\)[\s\S]*?\{/g;
  let rMatch;
  while ((rMatch = returnRegex.exec(code)) !== null) {
    const body = code.slice(rMatch.index, code.indexOf("}", rMatch.index));
    if (!body.includes("return")) {
      issues.push({
        rule: "Function Has No Return",
        severity: "low",
        suggestion: "Return something or mark it void."
      });
    }
  }

  // -----------------------------
  // RULE 15: Accidental Global Variables
  // -----------------------------
  const globalRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/gm;
  let g;
  while ((g = globalRegex.exec(code)) !== null) {
    issues.push({
      rule: "Possible Global Variable",
      severity: "medium",
      suggestion: "Declare with let/const.",
      details: { variable: g[0].trim() }
    });
  }

  return issues;
}
