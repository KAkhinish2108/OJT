# OJT Omertà: "A Code Of Silence"
Simple Static Analyzer
A Simple Static Analyzer.This is not merely software; it is a tool of order. We are not interested in guesswork. We are interested in absolute, unassailable truth.

This Code Cleaner prototype—it operates on the principle of a meticulous audit. It will take the source code, treat it like a financial statement, and tear it apart, piece by piece, using a Lexer and a Parser. This is how we build the Abstract Syntax Tree, capisce? That tree is the code's DNA. It tells us everything about its structure, without the mess of execution. It tells us the truth before the code has a chance to lie.


The Rule Engine is the judgment. It's a collection of highly specific mandates. We look at the Symbol Table to see if some pezzo of a variable has been declared and then ignored—unused assets are a waste of resources, a sign of weakness. We flag anything that resembles a hardcoded secret—a betrayal waiting to happen. And we measure the Cyclomatic Complexity, because in this business, clarity is survival. If a function has too many paths, too many 'if-else' statements, it's a labyrinth, and labyrinths are where you get lost. We prefer a clean, straight line.


Finally, the Reporter... it presents the findings. No noise, no excuses. Just the line number, the offense, and the severity. It is the final, definitive word. Now, make it beautiful, like a perfectly tailored suit.



🔍 Key Rules (Initial Set)

1. Unused Variables: Marks variables that are declared but never referenced. (Wasted resources. Sloppy.)

2. Hardcoded Secrets: Flags strings resembling API keys, passwords, or 'TODO: FIX THIS' comments. (Security risks. Amateurs.)

3. Cyclomatic Complexity: Measures the number of independent paths through a function. Flags functions that are too complex (e.g., score over 10). (Too complicated to maintain. A liability.)

4. Total 14 rules are there.






📁 FOLDER STRUCTURE
     |
     index.html
     style.css
     minimal.js
     analyzer.js


     
   


