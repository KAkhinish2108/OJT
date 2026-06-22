# Omertà: A Code of Silence

> *"We are not interested in guesswork. We are interested in absolute, unassailable truth."*

A production-ready static code analysis platform designed to identify code quality, security, and maintainability issues before deployment. Omertà performs lexical analysis, syntax parsing, Abstract Syntax Tree (AST) generation, and rule-based code auditing to provide actionable insights for developers.

---

## 🚀 Overview

Omertà analyzes source code without executing it, enabling early detection of vulnerabilities, code smells, and maintainability issues.

The system follows a structured analysis pipeline:

1. Source Code Input
2. Lexical Analysis (Lexer)
3. Syntax Analysis (Parser)
4. AST Generation
5. Symbol Table Construction
6. Rule Engine Evaluation
7. Issue Detection & Classification
8. Report Generation

---

## 🛠 Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Core Analysis Engine

* Lexer
* Parser
* Abstract Syntax Tree (AST)
* Symbol Table
* Rule Engine

---

## ✨ Features

* 🔍 Static Code Analysis
* 🌳 Abstract Syntax Tree (AST) Generation
* 📊 Cyclomatic Complexity Analysis
* 🔐 Hardcoded Secret Detection
* 🧹 Unused Variable Detection
* 📋 Symbol Table Management
* ⚠️ Severity-Based Issue Reporting
* 🛡️ Security Vulnerability Scanning
* 📈 Code Quality Assessment
* 📝 Actionable Audit Reports
* ✅ 14 Custom Analysis Rules

---

## 🏗 Architecture

```text
Source Code
     │
     ▼
   Lexer
     │
     ▼
   Parser
     │
     ▼
     AST
     │
     ▼
 Symbol Table
     │
     ▼
 Rule Engine
     │
     ▼
Issue Detection
     │
     ▼
  Reporter
```

---

## 🔍 Analysis Rules

### Code Quality

* Unused Variable Detection
* Dead Code Identification
* Redundant Declaration Checks
* Naming Convention Validation

### Security

* Hardcoded API Key Detection
* Hardcoded Password Detection
* Sensitive Information Exposure Checks

### Maintainability

* Cyclomatic Complexity Analysis
* Excessive Conditional Logic Detection
* Code Structure Validation

### Additional Rules

Omertà currently includes **14 custom static-analysis rules** focused on:

* Security
* Maintainability
* Readability
* Code Quality

---

## 📁 Folder Structure

```text
Omerta/
│
├── index.html
├── style.css
├── minimal.js
├── analyzer.js
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

* Modern Web Browser
* JavaScript Enabled

### Installation

```bash
git clone https://github.com/yourusername/omerta.git
cd omerta
```

### Run Locally

Simply open:

```text
index.html
```

in your browser.

No additional dependencies are required.

---

## 🔐 Security Features

* Hardcoded Credential Detection
* API Key Exposure Detection
* Sensitive Data Identification
* Severity-Based Risk Classification

---

## 📊 Output Report

For every issue detected, Omertà provides:

* Line Number
* Rule Violated
* Issue Description
* Severity Level
* Suggested Fix

Example:

```text
Line 42
Severity: High
Rule: Hardcoded Secret

Detected possible API key in source code.
Recommendation: Move secrets to environment variables.
```

---

## 🎯 Real-World Use Cases

* Secure Code Reviews
* Software Quality Assurance
* Pre-Deployment Validation
* Educational Static Analysis
* Developer Productivity Enhancement
* Security Auditing

---

## 📈 Future Improvements

* Multi-language Support
* Advanced Security Rules
* Export Reports (PDF/JSON)
* IDE Integration
* Custom Rule Creation
* CI/CD Pipeline Support

---

## 🤝 Contributing

Contributions, suggestions, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you find this project useful, consider giving it a star on GitHub.
