export function analyzeCode(code) {
    const issues = [];

    // Rule 1: Check for unused variables
    if(code.match(/(\w+)\s*=\s.*\n(?!.*\1)/g)) {
        issues.push({
            rule: "Unused variables",
            severity: "Medium",
            suggestion: "Remove or use the unused variables."
        });
    }

    // Rule 2: Console.log in production code
    if (code.includes("console.log")) {
        issues.push({
            rule: "Debug logs found",
            severity: "Low",
            suggestion: "Remove console.log statements",
        });
    }

    // Rule 3: Dangerour eval()
    if (code.includes("eval(")) {
        issues.push({
            rule: "Unsafe usage of eval",
            severity: "High",
            suggestion: "Avoid using eval() due to security risks.",
        });
    }

    // Rule 4: Too long lines
    const longLines = code.split("\n").filter(l => l.length > 120);
    if (longLines.length > 0) {
        issues.push({
            rule: "Line length exceeds 120 characters",
            severity: "Low",
            suggestion: "Consider breaking long lines into shorter ones.",
        });
    }

}

