// analyzer_py.js

export function analyzePythonCode(text) {
  const issues = [];
  if (typeof text !== "string") return issues;

  const lines = text.split("\n");

  // Rule -1 :- helper
  const push = (obj) => issues.push(Object.assign({
    rule: "Unknown",
    severity: "low",
    message: "",
    line: null,
    snippet: null
  }, obj));

  // Rule-2:- Basic metrics
  let hasTabs = false;
  let hasSpaces = false;
  const indentLevels = new Set();
  const importedNames = new Set();
  const importLines = new Map();

  // Rule-3:- Builtins to detect shadowing
  const BUILTINS = new Set([
    "list","dict","set","str","int","float","input","len","open","print","map","filter","sum","min","max"
  ]);

  //Rule-4:-  bracket matching stack
  const bracketStack = [];
  const bracketPairs = { ")": "(", "]": "[", "}": "{" };
  const opens = new Set(["(", "[", "{"]);
  const closes = new Set([")", "]", "}"]);

  // Rule-5:-scan lines
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const ln = i + 1;
    if (raw === undefined) continue;
    const trimmed = raw.replace(/\r$/, "");

    // Rule-6:- trailing whitespace
    if (/[ \t]+$/.test(trimmed)) {
      push({
        rule: "Trailing Whitespace",
        severity: "low",
        message: "Trailing whitespace found.",
        line: ln,
        snippet: trimmed
      });
    }

    //Rule-7:-  indentation detection
    const indentMatch = trimmed.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";
    if (indent.includes("\t")) hasTabs = true;
    if (indent.includes(" ")) hasSpaces = true;

    // inconsistent indent not multiple of 4 (only if spaces used)
    if (indent.length > 0 && indent.indexOf("\t") === -1) {
      if (indent.length % 4 !== 0) {
        push({
          rule: "Indentation",
          severity: "medium",
          message: "Indentation not a multiple of 4 spaces (PEP8 recommends 4).",
          line: ln,
          snippet: trimmed
        });
      }
    }

    // track indent levels (treat tab as 4)
    const indentLevel = indent.replace(/\t/g, "    ").length;
    if (indentLevel > 0) indentLevels.add(indentLevel);

    // missing colon for block headers
    if (/^\s*(def|class|if|elif|else|for|while|try|except|with)\b/.test(trimmed)) {
      // ignore commented lines like "# if" (very unlikely but safe)
      if (!/^\s*#/.test(trimmed)) {
        // if it's a header but doesn't end with ":" (allow inline comments)
        const noComment = trimmed.split("#")[0].trim();
        if (!noComment.endsWith(":")) {
          push({
            rule: "Missing Colon",
            severity: "high",
            message: "Block header missing ':' at the end.",
            line: ln,
            snippet: trimmed
          });
        }
      }
    }

    // Rule-8:- bare except
    if (/^\s*except\s*:\s*(#.*)?$/.test(trimmed)) {
      push({
        rule: "Bare Except",
        severity: "high",
        message: "Bare 'except:' used. Prefer 'except Exception:' or specific exceptions.",
        line: ln,
        snippet: trimmed
      });
    }

    // Rule-9:- TODO / FIXME
    if (/\b(TODO|FIXME)\b/.test(trimmed)) {
      push({
        rule: "TODO/FIXME",
        severity: "low",
        message: "TODO/FIXME marker found. Complete pending work or remove marker before release.",
        line: ln,
        snippet: trimmed
      });
    }

    // Rule-10:- eval / exec usage
    if (/\b(eval|exec)\s*\(/.test(trimmed)) {
      push({
        rule: "Use of eval/exec",
        severity: "high",
        message: "Use of eval/exec detected — this can be insecure and error-prone.",
        line: ln,
        snippet: trimmed
      });
    }

    //Rule-11:-  "is" comparison to literal
    if (/\bis\s+(-?\d+|'.*'|".*")/.test(trimmed)) {
      push({
        rule: "Is Comparison to Literal",
        severity: "medium",
        message: "Using 'is' to compare to literal detected; use '==' for value equality.",
        line: ln,
        snippet: trimmed
      });
    }

    // Rule-12:- long lines (PEP8 recommends 79; use 88 as warning threshold)
    if (trimmed.length > 88) {
      push({
        rule: "Line Too Long",
        severity: "low",
        message: `Line length ${trimmed.length} exceeds recommended 88 characters.`,
        line: ln,
        snippet: trimmed
      });
    }

    // Rule-13:- collect imports (naive but safe)
    // matches: from x import a, b OR import x as y OR import x
    const impFrom = trimmed.match(/^\s*from\s+([a-zA-Z0-9_.]+)\s+import\s+(.+)/);
    const impSimple = trimmed.match(/^\s*import\s+(.+)/);
    if (impFrom) {
      const mod = impFrom[1];
      const rest = impFrom[2].split("#")[0].trim();
      importLines.set(trimmed, importLines.get(trimmed) || []);
      importLines.get(trimmed).push(ln);
      rest.split(",").map(s => s.trim().split(/\s+as\s+/)[0]).forEach(n => {
        if (n) importedNames.add(n);
      });
    } else if (impSimple) {
      const rest = impSimple[1].split("#")[0].trim();
      importLines.set(trimmed, importLines.get(trimmed) || []);
      importLines.get(trimmed).push(ln);
      rest.split(",").map(s => s.trim().split(/\s+as\s+/)[0]).forEach(n => {
        // for import x.y import keep x
        const base = n.split(".")[0];
        if (base) importedNames.add(base);
      });
    }

    // Ruleshadowing builtins via assignment/def/class
    const assignMatch = trimmed.match(/^\s*([A-Za-z_]\w*)\s*=/);
    if (assignMatch) {
      const name = assignMatch[1];
      if (BUILTINS.has(name)) {
        push({
          rule: "Shadowing Builtin",
          severity: "medium",
          message: `Variable '${name}' shadows a Python builtin.`,
          line: ln,
          snippet: trimmed
        });
      }
    }
    const defMatch = trimmed.match(/^\s*def\s+([A-Za-z_]\w*)\s*\(/);
    if (defMatch) {
      const name = defMatch[1];
      if (BUILTINS.has(name)) {
        push({
          rule: "Shadowing Builtin",
          severity: "medium",
          message: `Function '${name}' shadows a Python builtin.`,
          line: ln,
          snippet: trimmed
        });
      }
    }
    const classMatch = trimmed.match(/^\s*class\s+([A-Za-z_]\w*)\s*[:(]/);
    if (classMatch) {
      const name = classMatch[1];
      if (BUILTINS.has(name)) {
        push({
          rule: "Shadowing Builtin",
          severity: "medium",
          message: `Class '${name}' shadows a Python builtin.`,
          line: ln,
          snippet: trimmed
        });
      }
    }

    // naive unused variable detection: assignment with name then not used later (post-scan)
    // handled after scan

    //Rule-14:- bracket matching scanning per char
    for (let j = 0; j < trimmed.length; j++) {
      const ch = trimmed[j];
      if (opens.has(ch)) {
        bracketStack.push({ ch, line: ln, col: j + 1 });
      } else if (closes.has(ch)) {
        if (bracketStack.length === 0 || bracketStack[bracketStack.length - 1].ch !== bracketPairs[ch]) {
          push({
            rule: "Unmatched Bracket",
            severity: "high",
            message: `Unmatched bracket '${ch}'.`,
            line: ln,
            snippet: trimmed
          });
        } else {
          bracketStack.pop();
        }
      }
    }
  } // end for lines

  // Rule-16:-Mixed tabs and spaces
  if (hasTabs && hasSpaces) {
    push({
      rule: "Mixed Tabs/Spaces",
      severity: "high",
      message: "Mixed use of tabs and spaces for indentation detected.",
      line: null,
      snippet: null
    });
  }

  // inconsistent indent levels (too many different levels)
  if (indentLevels.size > 6) {
    push({
      rule: "Inconsistent Indentation Levels",
      severity: "medium",
      message: "Many distinct indentation levels detected (may indicate inconsistency).",
      line: null,
      snippet: null
    });
  }

  // duplicate import lines
  for (const [impText, arr] of importLines.entries()) {
    if (arr.length > 1) {
      push({
        rule: "Duplicate Import",
        severity: "low",
        message: `Import appears multiple times (${arr.length}).`,
        line: arr[0],
        snippet: impText
      });
    }
  }

  // unused import heuristic (very naive): if imported name appears only once (in the import)
  const whole = text;
  for (const name of importedNames) {
    try {
      const re = new RegExp("\\b" + name + "\\b", "g");
      const matches = (whole.match(re) || []).length;
      if (matches <= 1) {
        push({
          rule: "Possibly Unused Import",
          severity: "low",
          message: `Imported name '${name}' may be unused.`,
          line: null,
          snippet: null
        });
      }
    } catch (e) {
      // ignore bad name escaping
    }
  }

  // missing final newline
  if (text.length > 0 && !text.endsWith("\n")) {
    push({
      rule: "Missing Final Newline",
      severity: "low",
      message: "File does not end with a newline.",
      line: null,
      snippet: null
    });
  }

  // leftover unmatched brackets in stack
  while (bracketStack.length > 0) {
    const top = bracketStack.pop();
    push({
      rule: "Unmatched Bracket",
      severity: "high",
      message: `Unmatched opening bracket '${top.ch}'.`,
      line: top.line,
      snippet: null
    });
  }

  // EXTRA PREMIUM RULES (useful heuristics)

  // Rule: deep nesting detection (code smell)
  // compute max nesting by scanning braces/blocks using indentation increases
  let maxNesting = 0;
  let prevIndent = 0;
  let nesting = 0;
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i].match(/^(\s*)/)[1].replace(/\t/g, "    ").length;
    if (cur > prevIndent) nesting++;
    else if (cur < prevIndent) nesting = Math.max(0, nesting - 1);
    prevIndent = cur;
    maxNesting = Math.max(maxNesting, nesting);
  }
  if (maxNesting > 4) {
    push({
      rule: "Deep Nesting",
      severity: "medium",
      message: `Deep nesting detected (${maxNesting} levels). Consider simplifying or refactoring.`,
      line: null,
      snippet: null
    });
  }

  // Rule: bare 'print' used as debugging (suggest removal in libs)
  const printMatches = (text.match(/\bprint\s*\(/g) || []).length;
  if (printMatches > 10) {
    push({
      rule: "Debug Prints",
      severity: "low",
      message: `Many print() calls found (${printMatches}). Consider removing or using logging.`,
      line: null,
      snippet: null
    });
  }

  // Rule: suspicious "pass" usage after return (unreachable code)
  const allLines = lines;
  let seenReturn = false;
  for (let i = 0; i < allLines.length; i++) {
    const t = allLines[i].trim();
    if (/^return\b/.test(t)) seenReturn = true;
    else if (seenReturn && t.length > 0 && !/^#/.test(t)) {
      // If we find a non-empty, non-comment line after return at same or deeper indentation -> unreachable
      push({
        rule: "Unreachable Code",
        severity: "medium",
        message: `Code detected after 'return' (possible unreachable code) at line ${i+1}.`,
        line: i+1,
        snippet: allLines[i]
      });
      // Reset so we don't flood every subsequent line
      seenReturn = false;
    }
  }

  // Rule: detect when content is not Python (TypeError-like)
  // If the text contains none of common Python tokens, flag it.
  if (!/\b(def|class|import|from|if|for|while|return|:\b)/.test(text) && text.trim().length > 0) {
    // If user wrote plain text like "Omerta" or comments only, give a TypeError-like message
    const uniqueAlphaWords = (text.match(/\b[A-Za-z_]{3,}\b/g) || []).slice(0, 50).join(" ");
    const isMostlyPlain = /^[A-Za-z0-9\s\.,'":;!?-()]+$/.test(text.trim());
    if (isMostlyPlain) {
      push({
        rule: "TypeError-like",
        severity: "high",
        message: "No Python syntax detected — input looks like plain text, not Python code.",
        line: null,
        snippet: uniqueAlphaWords ? uniqueAlphaWords.substring(0, 120) : null
      });
    }
  }

  // Unused variable heuristic: find assigned names and check later use
  const assigned = new Map(); // name -> first line assigned
  const wordRe = /\b([A-Za-z_]\w*)\b/g;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i];
    const m = t.match(/^\s*([A-Za-z_]\w*)\s*=/);
    if (m) {
      const name = m[1];
      if (!assigned.has(name)) assigned.set(name, i + 1);
    }
  }
  // search usages
  for (const [name, defLine] of assigned.entries()) {
    const re = new RegExp("\\b" + name + "\\b", "g");
    const total = (text.match(re) || []).length;
    if (total <= 1) { // only the definition
      push({
        rule: "Unused Variable",
        severity: "low",
        message: `Variable '${name}' assigned but never used.`,
        line: defLine,
        snippet: lines[defLine - 1]
      });
    }
  }

  // final: examples of grouping and sorting (optional) - we'll return as-is
  return issues;
}

// optional helper: create a human readable textual report (for downloads)
export function generatePythonReportText(issues) {
  if (!issues || issues.length === 0) return "No issues found.\nYour Python code looks clean! (100/100)\n";

  let out = "Python Static Analysis Report\n\n";
  out += `Total issues: ${issues.length}\n\n`;
  issues.forEach((it, idx) => {
    out += `${idx + 1}. [${it.rule}] ${it.message}`;
    if (it.line) out += `  (line ${it.line})`;
    out += "\n";
    if (it.snippet) out += `    ${it.snippet.trim()}\n`;
    out += "\n";
  });
  return out;
}
