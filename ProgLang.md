Basic arithmetic
ADD 5 6
MINUS 5 6
MULTIPLY 5 6
DIVIDE 5 6
MOD 5 6
Variables
X IS 5
Y IS "Time"
Z IS TRUE, FALSE
Boolean Expressions
X ISS 5
Y ISS TRUE
Z BIGGER THAN 4 - GT
A SMALLER THAN 5 - LT
Z BIGGER THAN OR ISS 4 - GTE, LTE

If statements
While loops
For loops
Data structures
Functions



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Python Interpreter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark background */
            color: #e2e8f0; /* Light text */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Align to top */
            min-height: 100vh;
            padding: 2rem;
            box-sizing: border-box;
        }

        #app-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 900px; /* Max width for readability */
            background-color: #2d3748; /* Slightly lighter dark background for container */
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Subtle shadow */
            padding: 1.5rem;
        }

        h1 {
            color: #63b3ed; /* Blue for heading */
        }

        textarea {
            background-color: #242c38; /* Darker input background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in textarea */
            resize: vertical;
            min-height: 200px;
            font-family: monospace; /* Monospaced font for code */
            line-height: 1.5;
        }

        button {
            background-color: #48bb78; /* Green button */
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        button:hover {
            background-color: #38a169; /* Darker green on hover */
        }

        #output {
            background-color: #242c38; /* Darker output background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in output */
            min-height: 100px;
            overflow-y: auto;
            font-family: monospace;
            white-space: pre-wrap; /* Preserve whitespace and wrap text */
        }

        .error-message {
            color: #fc8181; /* Red for error messages */
            font-weight: bold;
        }

        .output-text {
            color: #a0aec0; /* Lighter grey for general output */
        }
    </style>
</head>
<body class="p-4 bg-gray-900 text-gray-200 min-h-screen flex items-start justify-center">
    <div id="app-container" class="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h1 class="text-3xl font-bold text-blue-400 mb-4 text-center">Simple Python Interpreter (JS)</h1>

        <div class="space-y-2">
            <label for="code-input" class="block text-gray-300 font-semibold">Enter Python Code:</label>
            <textarea
                id="code-input"
                class="w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border border-gray-600 text-gray-100"
                placeholder="x = 10 + 5&#10;y = x * 2&#10;print(y)"
            ></textarea>
        </div>

        <button
            id="run-button"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
        >
            Run Code
        </button>

        <div class="space-y-2">
            <label class="block text-gray-300 font-semibold">Output:</label>
            <div
                id="output"
                class="w-full p-3 rounded-md bg-gray-700 border border-gray-600 min-h-[100px] max-h-[400px] overflow-y-auto text-gray-100"
            >
                <!-- Output will appear here -->
            </div>
        </div>
    </div>

    <script type="module">
        // Helper to get element by ID
        const getById = (id) => document.getElementById(id);

        // --- Lexer (Tokenizer) ---
        // The Lexer is responsible for taking the raw input code string
        // and breaking it down into a stream of meaningful tokens.
        // Each token has a type (e.g., NUMBER, IDENTIFIER, PLUS) and a value.
        class Tokenizer {
            constructor(input) {
                this.input = input;
                this.position = 0;
                this.tokens = [];
            }

            // Defines the types of tokens our interpreter will recognize.
            static TokenType = {
                NUMBER: 'NUMBER',
                IDENTIFIER: 'IDENTIFIER',
                PLUS: 'PLUS',
                MINUS: 'MINUS',
                MULTIPLY: 'MULTIPLY',
                DIVIDE: 'DIVIDE',
                ASSIGN: 'ASSIGN',
                LPAREN: 'LPAREN',
                RPAREN: 'RPAREN',
                EOF: 'EOF', // End of File
                KEYWORD: 'KEYWORD', // For 'print'
            };

            // Regular expressions for matching different token patterns.
            static TokenPatterns = [
                { type: Tokenizer.TokenType.NUMBER, regex: /^\d+/ },
                { type: Tokenizer.TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
                { type: Tokenizer.TokenType.PLUS, regex: /^\+/ },
                { type: Tokenizer.TokenType.MINUS, regex: /^-/ },
                { type: Tokenizer.TokenType.MULTIPLY, regex: /^\*/ },
                { type: Tokenizer.TokenType.DIVIDE, regex: /^\// },
                { type: Tokenizer.TokenType.ASSIGN, regex: /^=/ },
                { type: Tokenizer.TokenType.LPAREN, regex: /^\(/ },
                { type: Tokenizer.TokenType.RPAREN, regex: /^\)/ },
            ];

            // List of keywords our interpreter supports.
            static Keywords = ['print'];

            // Gets the next token from the input string.
            getNextToken() {
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                // Skip whitespace characters.
                this.skipWhitespace();

                // Check for EOF again after skipping whitespace.
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                const substring = this.input.substring(this.position);

                for (const pattern of Tokenizer.TokenPatterns) {
                    const match = substring.match(pattern.regex);
                    if (match) {
                        const value = match[0];
                        this.position += value.length;
                        // Check if an identifier is actually a keyword.
                        if (pattern.type === Tokenizer.TokenType.IDENTIFIER && Tokenizer.Keywords.includes(value)) {
                            return { type: Tokenizer.TokenType.KEYWORD, value: value };
                        }
                        return { type: pattern.type, value: value };
                    }
                }

                // If no token is matched, it's an unrecognized character.
                throw new Error(`Lexer Error: Unrecognized character at position ${this.position}: ${this.input[this.position]}`);
            }

            // Skips over whitespace characters in the input.
            skipWhitespace() {
                while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
                    this.position++;
                }
            }

            // Tokenizes the entire input string and returns an array of tokens.
            tokenize() {
                this.tokens = [];
                let token = this.getNextToken();
                while (token.type !== Tokenizer.TokenType.EOF) {
                    this.tokens.push(token);
                    token = this.getNextToken();
                }
                this.tokens.push(token); // Add EOF token
                return this.tokens;
            }
        }

        // --- Parser (Abstract Syntax Tree Builder) ---
        // The Parser takes the stream of tokens from the Lexer and builds an
        // Abstract Syntax Tree (AST). The AST is a tree representation of the
        // source code, abstracting away the syntax details.
        class Parser {
            constructor(tokens) {
                this.tokens = tokens;
                this.position = 0;
                this.currentToken = this.tokens[this.position];
            }

            // Advances to the next token in the stream.
            advance() {
                this.position++;
                this.currentToken = this.tokens[this.position];
            }

            // Ensures the current token matches the expected type, then advances.
            eat(tokenType) {
                if (this.currentToken.type === tokenType) {
                    this.advance();
                } else {
                    throw new Error(`Parser Error: Expected ${tokenType}, but found ${this.currentToken.type} ('${this.currentToken.value}') at position ${this.position}`);
                }
            }

            // Parses a number or parenthesized expression.
            factor() {
                const token = this.currentToken;
                if (token.type === Tokenizer.TokenType.NUMBER) {
                    this.eat(Tokenizer.TokenType.NUMBER);
                    return { type: 'Number', value: parseInt(token.value) };
                } else if (token.type === Tokenizer.TokenType.LPAREN) {
                    this.eat(Tokenizer.TokenType.LPAREN);
                    const node = this.expression();
                    this.eat(Tokenizer.TokenType.RPAREN);
                    return node;
                } else if (token.type === Tokenizer.TokenType.IDENTIFIER) {
                    this.eat(Tokenizer.TokenType.IDENTIFIER);
                    return { type: 'Identifier', name: token.value };
                } else {
                    throw new Error(`Parser Error: Expected number, identifier or '(', but found ${token.type} ('${token.value}')`);
                }
            }

            // Parses terms (multiplication and division).
            term() {
                let node = this.factor();
                while ([Tokenizer.TokenType.MULTIPLY, Tokenizer.TokenType.DIVIDE].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.MULTIPLY) {
                        this.eat(Tokenizer.TokenType.MULTIPLY);
                    } else if (token.type === Tokenizer.TokenType.DIVIDE) {
                        this.eat(Tokenizer.TokenType.DIVIDE);
                    }
                    node = {
                        type: 'BinaryOp',
                        left: node,
                        operator: token.value,
                        right: this.factor(),
                    };
                }
                return node;
            }

            // Parses expressions (addition and subtraction).
            expression() {
                let node = this.term();
                while ([Tokenizer.TokenType.PLUS, Tokenizer.TokenType.MINUS].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.PLUS) {
                        this.eat(Tokenizer.TokenType.PLUS);
                    } else if (token.type === Tokenizer.TokenType.MINUS) {
                        this.eat(Tokenizer.TokenType.MINUS);
                    }
                    node = {
                        type: 'BinaryOp',
                        left: node,
                        operator: token.value,
                        right: this.term(),
                    };
                }
                return node;
            }

            // Parses an assignment statement (e.g., x = 10).
            assignmentStatement() {
                const identifierToken = this.currentToken;
                this.eat(Tokenizer.TokenType.IDENTIFIER);
                this.eat(Tokenizer.TokenType.ASSIGN);
                const expressionNode = this.expression();
                return {
                    type: 'AssignmentStatement',
                    id: { type: 'Identifier', name: identifierToken.value },
                    value: expressionNode,
                };
            }

            // Parses a print statement (e.g., print(x)).
            printStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD); // 'print' keyword
                this.eat(Tokenizer.TokenType.LPAREN);
                const expressionNode = this.expression();
                this.eat(Tokenizer.TokenType.RPAREN);
                return {
                    type: 'PrintStatement',
                    expression: expressionNode,
                };
            }

            // Parses a single statement.
            statement() {
                if (this.currentToken.type === Tokenizer.TokenType.IDENTIFIER && this.tokens[this.position + 1]?.type === Tokenizer.TokenType.ASSIGN) {
                    return this.assignmentStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'print') {
                    return this.printStatement();
                } else {
                    throw new Error(`Parser Error: Unexpected token for statement: ${this.currentToken.type} ('${this.currentToken.value}')`);
                }
            }

            // Parses a program, which is a sequence of statements.
            parse() {
                const statements = [];
                while (this.currentToken.type !== Tokenizer.TokenType.EOF) {
                    // This simple loop handles statements separated by newlines implicitly
                    // by the tokenizer skipping whitespace. In a real parser, you'd
                    // usually explicitly handle newlines or semicolons as statement terminators.
                    try {
                         statements.push(this.statement());
                    } catch (e) {
                        // If a statement can't be parsed, stop and report error
                        throw e;
                    }
                }
                return {
                    type: 'Program',
                    body: statements,
                };
            }
        }

        // --- Interpreter (Evaluator) ---
        // The Interpreter takes the AST produced by the Parser and executes it.
        // It maintains an environment (scope) to store variable values.
        class Interpreter {
            constructor() {
                this.environment = new Map(); // Stores variable names and their values.
                this.outputLog = []; // Stores the output from 'print' statements.
            }

            // Resets the interpreter's state for a new run.
            reset() {
                this.environment.clear();
                this.outputLog = [];
            }

            // Adds a message to the output log.
            log(message, isError = false) {
                this.outputLog.push({ message, isError });
            }

            // Visits an AST node and dispatches to the appropriate evaluation method.
            visit(node) {
                const methodName = `visit${node.type}`;
                if (typeof this[methodName] === 'function') {
                    return this[methodName](node);
                } else {
                    throw new Error(`Interpreter Error: No visitor method for node type: ${node.type}`);
                }
            }

            // Visits a 'Program' node, executing each statement in its body.
            visitProgram(node) {
                for (const statement of node.body) {
                    this.visit(statement);
                }
                return this.outputLog;
            }

            // Visits a 'Number' node, returning its numerical value.
            visitNumber(node) {
                return node.value;
            }

            // Visits an 'Identifier' node, returning its value from the environment.
            visitIdentifier(node) {
                if (!this.environment.has(node.name)) {
                    throw new Error(`Interpreter Error: Undefined variable '${node.name}'`);
                }
                return this.environment.get(node.name);
            }

            // Visits a 'BinaryOp' node, performing the arithmetic operation.
            visitBinaryOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/':
                        if (right === 0) {
                            throw new Error("Interpreter Error: Division by zero");
                        }
                        return left / right;
                    default:
                        throw new Error(`Interpreter Error: Unknown operator: ${node.operator}`);
                }
            }

            // Visits an 'AssignmentStatement' node, storing the value in the environment.
            visitAssignmentStatement(node) {
                const value = this.visit(node.value);
                this.environment.set(node.id.name, value);
            }

            // Visits a 'PrintStatement' node, logging the expression's value to the output.
            visitPrintStatement(node) {
                const valueToPrint = this.visit(node.expression);
                this.log(`Output: ${valueToPrint}`);
            }

            // Interprets the given AST.
            interpret(ast) {
                this.reset(); // Clear previous state
                try {
                    return this.visit(ast);
                } catch (error) {
                    this.log(`Error: ${error.message}`, true);
                    return this.outputLog;
                }
            }
        }

        // --- Main Application Logic ---
        const codeInput = getById('code-input');
        const runButton = getById('run-button');
        const outputDiv = getById('output');

        const interpreter = new Interpreter();

        runButton.addEventListener('click', () => {
            const code = codeInput.value;
            outputDiv.innerHTML = ''; // Clear previous output

            try {
                // 1. Lexing: Convert code string into tokens.
                const tokenizer = new Tokenizer(code);
                const tokens = tokenizer.tokenize();
                // console.log('Tokens:', tokens); // For debugging

                // 2. Parsing: Convert tokens into an Abstract Syntax Tree (AST).
                const parser = new Parser(tokens);
                const ast = parser.parse();
                // console.log('AST:', JSON.stringify(ast, null, 2)); // For debugging

                // 3. Interpreting: Execute the AST.
                const results = interpreter.interpret(ast);

                results.forEach(item => {
                    const p = document.createElement('p');
                    p.classList.add(item.isError ? 'error-message' : 'output-text');
                    p.textContent = item.message;
                    outputDiv.appendChild(p);
                });

            } catch (error) {
                // Catch any errors during lexing, parsing, or interpreting
                const p = document.createElement('p');
                p.classList.add('error-message');
                p.textContent = `Runtime Error: ${error.message}`;
                outputDiv.appendChild(p);
            }
        });

        // Set a default example code
        codeInput.value = `x = 10 + 5
y = x * 2
z = (y - 5) / 3
print(z)
print(x)
print(y)
`;
    </script>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Python Interpreter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark background */
            color: #e2e8f0; /* Light text */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Align to top */
            min-height: 100vh;
            padding: 2rem;
            box-sizing: border-box;
        }

        #app-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 900px; /* Max width for readability */
            background-color: #2d3748; /* Slightly lighter dark background for container */
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Subtle shadow */
            padding: 1.5rem;
        }

        h1 {
            color: #63b3ed; /* Blue for heading */
        }

        textarea {
            background-color: #242c38; /* Darker input background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in textarea */
            resize: vertical;
            min-height: 200px;
            font-family: monospace; /* Monospaced font for code */
            line-height: 1.5;
        }

        button {
            background-color: #48bb78; /* Green button */
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        button:hover {
            background-color: #38a169; /* Darker green on hover */
        }

        #output {
            background-color: #242c38; /* Darker output background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in output */
            min-height: 100px;
            overflow-y: auto;
            font-family: monospace;
            white-space: pre-wrap; /* Preserve whitespace and wrap text */
        }

        .error-message {
            color: #fc8181; /* Red for error messages */
            font-weight: bold;
        }

        .output-text {
            color: #a0aec0; /* Lighter grey for general output */
        }
    </style>
</head>
<body class="p-4 bg-gray-900 text-gray-200 min-h-screen flex items-start justify-center">
    <div id="app-container" class="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h1 class="text-3xl font-bold text-blue-400 mb-4 text-center">Simple Python Interpreter (JS)</h1>

        <div class="space-y-2">
            <label for="code-input" class="block text-gray-300 font-semibold">Enter Python Code:</label>
            <textarea
                id="code-input"
                class="w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border border-gray-600 text-gray-100"
                placeholder="x = 10 + 5&#10;y = x * 2&#10;print(y)"
            ></textarea>
        </div>

        <button
            id="run-button"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
        >
            Run Code
        </button>

        <div class="space-y-2">
            <label class="block text-gray-300 font-semibold">Output:</label>
            <div
                id="output"
                class="w-full p-3 rounded-md bg-gray-700 border border-gray-600 min-h-[100px] max-h-[400px] overflow-y-auto text-gray-100"
            >
                <!-- Output will appear here -->
            </div>
        </div>
    </div>

    <script type="module">
        // Helper to get element by ID
        const getById = (id) => document.getElementById(id);

        // --- Lexer (Tokenizer) ---
        // The Lexer is responsible for taking the raw input code string
        // and breaking it down into a stream of meaningful tokens.
        // Each token has a type (e.g., NUMBER, IDENTIFIER, PLUS) and a value.
        class Tokenizer {
            constructor(input) {
                this.input = input;
                this.position = 0;
                this.tokens = [];
            }

            // Defines the types of tokens our interpreter will recognize.
            static TokenType = {
                NUMBER: 'NUMBER',
                IDENTIFIER: 'IDENTIFIER',
                PLUS: 'PLUS',
                MINUS: 'MINUS',
                MULTIPLY: 'MULTIPLY',
                DIVIDE: 'DIVIDE',
                ASSIGN: 'ASSIGN',
                LPAREN: 'LPAREN',
                RPAREN: 'RPAREN',
                EOF: 'EOF', // End of File
                KEYWORD: 'KEYWORD', // For 'print', 'True', 'False', 'and', 'or', 'not'
                // New comparison operators
                EQ: 'EQ',       // ==
                NE: 'NE',       // !=
                LT: 'LT',       // <
                LE: 'LE',       // <=
                GT: 'GT',       // >
                GE: 'GE',       // >=
            };

            // Regular expressions for matching different token patterns.
            // IMPORTANT: Multi-character operators must come before single-character ones
            // to ensure correct matching (e.g., '==' before '=').
            static TokenPatterns = [
                { type: Tokenizer.TokenType.EQ, regex: /^==/ },
                { type: Tokenizer.TokenType.NE, regex: /^!=/ },
                { type: Tokenizer.TokenType.LE, regex: /^<=/ },
                { type: Tokenizer.TokenType.GE, regex: /^>=/ },
                { type: Tokenizer.TokenType.LT, regex: /^</ },
                { type: Tokenizer.TokenType.GT, regex: /^>/ },
                { type: Tokenizer.TokenType.ASSIGN, regex: /^=/ }, // Must come after ==
                { type: Tokenizer.TokenType.NUMBER, regex: /^\d+/ },
                { type: Tokenizer.TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
                { type: Tokenizer.TokenType.PLUS, regex: /^\+/ },
                { type: Tokenizer.TokenType.MINUS, regex: /^-/ },
                { type: Tokenizer.TokenType.MULTIPLY, regex: /^\*/ },
                { type: Tokenizer.TokenType.DIVIDE, regex: /^\// },
                { type: Tokenizer.TokenType.LPAREN, regex: /^\(/ },
                { type: Tokenizer.TokenType.RPAREN, regex: /^\)/ },
            ];

            // List of keywords our interpreter supports, including boolean literals and logical operators.
            static Keywords = ['print', 'True', 'False', 'and', 'or', 'not'];

            // Gets the next token from the input string.
            getNextToken() {
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                // Skip whitespace characters.
                this.skipWhitespace();

                // Check for EOF again after skipping whitespace.
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                const substring = this.input.substring(this.position);

                for (const pattern of Tokenizer.TokenPatterns) {
                    const match = substring.match(pattern.regex);
                    if (match) {
                        const value = match[0];
                        this.position += value.length;
                        // Check if an identifier is actually a keyword (e.g., 'True', 'False', 'and', 'or', 'not').
                        // This check is important as IDENTIFIER regex might initially match these.
                        if (pattern.type === Tokenizer.TokenType.IDENTIFIER && Tokenizer.Keywords.includes(value)) {
                            return { type: Tokenizer.TokenType.KEYWORD, value: value };
                        }
                        return { type: pattern.type, value: value };
                    }
                }

                // If no token is matched, it's an unrecognized character.
                throw new Error(`Lexer Error: Unrecognized character at position ${this.position}: ${this.input[this.position]}`);
            }

            // Skips over whitespace characters in the input.
            skipWhitespace() {
                while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
                    this.position++;
                }
            }

            // Tokenizes the entire input string and returns an array of tokens.
            tokenize() {
                this.tokens = [];
                let token = this.getNextToken();
                while (token.type !== Tokenizer.TokenType.EOF) {
                    this.tokens.push(token);
                    token = this.getNextToken();
                }
                this.tokens.push(token); // Add EOF token
                return this.tokens;
            }
        }

        // --- Parser (Abstract Syntax Tree Builder) ---
        // The Parser takes the stream of tokens from the Lexer and builds an
        // Abstract Syntax Tree (AST). The AST is a tree representation of the
        // source code, abstracting away the syntax details.
        class Parser {
            constructor(tokens) {
                this.tokens = tokens;
                this.position = 0;
                this.currentToken = this.tokens[this.position];
            }

            // Advances to the next token in the stream.
            advance() {
                this.position++;
                this.currentToken = this.tokens[this.position];
            }

            // Ensures the current token matches the expected type, then advances.
            eat(tokenType) {
                if (this.currentToken.type === tokenType) {
                    this.advance();
                } else {
                    throw new Error(`Parser Error: Expected ${tokenType}, but found ${this.currentToken.type} ('${this.currentToken.value}') at position ${this.position}`);
                }
            }

            // Parses a number, boolean literal, identifier, or parenthesized expression.
            factor() {
                const token = this.currentToken;
                if (token.type === Tokenizer.TokenType.NUMBER) {
                    this.eat(Tokenizer.TokenType.NUMBER);
                    return { type: 'Number', value: parseInt(token.value) };
                } else if (token.type === Tokenizer.TokenType.IDENTIFIER) {
                    this.eat(Tokenizer.TokenType.IDENTIFIER);
                    return { type: 'Identifier', name: token.value };
                } else if (token.type === Tokenizer.TokenType.LPAREN) {
                    this.eat(Tokenizer.TokenType.LPAREN);
                    const node = this.expression(); // Parentheses can contain any expression (including logical/comparison)
                    this.eat(Tokenizer.TokenType.RPAREN);
                    return node;
                } else if (token.type === Tokenizer.TokenType.KEYWORD && (token.value === 'True' || token.value === 'False')) {
                    this.eat(Tokenizer.TokenType.KEYWORD);
                    return { type: 'BooleanLiteral', value: token.value === 'True' };
                } else {
                    throw new Error(`Parser Error: Expected number, identifier, boolean literal or '(', but found ${token.type} ('${token.value}')`);
                }
            }

            // Parses terms (multiplication and division).
            term() {
                let node = this.factor();
                while ([Tokenizer.TokenType.MULTIPLY, Tokenizer.TokenType.DIVIDE].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.MULTIPLY) {
                        this.eat(Tokenizer.TokenType.MULTIPLY);
                    } else if (token.type === Tokenizer.TokenType.DIVIDE) {
                        this.eat(Tokenizer.TokenType.DIVIDE);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.factor(),
                    };
                }
                return node;
            }

            // Parses arithmetic expressions (addition and subtraction).
            arithmeticExpression() {
                let node = this.term();
                while ([Tokenizer.TokenType.PLUS, Tokenizer.TokenType.MINUS].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.PLUS) {
                        this.eat(Tokenizer.TokenType.PLUS);
                    } else if (token.type === Tokenizer.TokenType.MINUS) {
                        this.eat(Tokenizer.TokenType.MINUS);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.term(),
                    };
                }
                return node;
            }

            // Parses comparison expressions (e.g., x == y, a < b).
            comparisonExpression() {
                let node = this.arithmeticExpression(); // Start with arithmetic expressions
                const comparisonOperators = [
                    Tokenizer.TokenType.EQ, Tokenizer.TokenType.NE,
                    Tokenizer.TokenType.LT, Tokenizer.TokenType.LE,
                    Tokenizer.TokenType.GT, Tokenizer.TokenType.GE
                ];

                while (comparisonOperators.includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    this.eat(token.type); // Eat the comparison operator
                    node = {
                        type: 'ComparisonOp', // New AST node type for comparisons
                        left: node,
                        operator: token.value,
                        right: this.arithmeticExpression(),
                    };
                }
                return node;
            }

            // Parses logical NOT expressions (e.g., not x).
            logicalNotExpression() {
                if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'not') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'not'
                    const operand = this.logicalNotExpression(); // Allows for 'not not x'
                    return {
                        type: 'LogicalOp', // Represents logical operations
                        operator: operatorToken.value, // 'not'
                        operand: operand, // For unary 'not' operation
                    };
                }
                return this.comparisonExpression(); // If no 'not', proceed to comparison
            }

            // Parses logical AND expressions (e.g., A and B).
            logicalAndExpression() {
                let node = this.logicalNotExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'and') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'and'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'and'
                        right: this.logicalNotExpression(),
                    };
                }
                return node;
            }

            // Parses logical OR expressions (e.g., A or B). This is the highest precedence for expressions.
            logicalOrExpression() {
                let node = this.logicalAndExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'or') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'or'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'or'
                        right: this.logicalAndExpression(),
                    };
                }
                return node;
            }

            // The main expression method now delegates to the highest precedence logical expression.
            expression() {
                return this.logicalOrExpression();
            }

            // Parses an assignment statement (e.g., x = 10).
            assignmentStatement() {
                const identifierToken = this.currentToken;
                this.eat(Tokenizer.TokenType.IDENTIFIER);
                this.eat(Tokenizer.TokenType.ASSIGN);
                const expressionNode = this.expression(); // Assignment can take any kind of expression
                return {
                    type: 'AssignmentStatement',
                    id: { type: 'Identifier', name: identifierToken.value },
                    value: expressionNode,
                };
            }

            // Parses a print statement (e.g., print(x)).
            printStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD); // 'print' keyword
                this.eat(Tokenizer.TokenType.LPAREN);
                const expressionNode = this.expression(); // Print can take any kind of expression
                this.eat(Tokenizer.TokenType.RPAREN);
                return {
                    type: 'PrintStatement',
                    expression: expressionNode,
                };
            }

            // Parses a single statement.
            statement() {
                if (this.currentToken.type === Tokenizer.TokenType.IDENTIFIER && this.tokens[this.position + 1]?.type === Tokenizer.TokenType.ASSIGN) {
                    return this.assignmentStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'print') {
                    return this.printStatement();
                } else {
                    throw new Error(`Parser Error: Unexpected token for statement: ${this.currentToken.type} ('${this.currentToken.value}')`);
                }
            }

            // Parses a program, which is a sequence of statements.
            parse() {
                const statements = [];
                while (this.currentToken.type !== Tokenizer.TokenType.EOF) {
                    // This simple loop handles statements separated by newlines implicitly
                    // by the tokenizer skipping whitespace. In a real parser, you'd
                    // usually explicitly handle newlines or semicolons as statement terminators.
                    try {
                         statements.push(this.statement());
                    } catch (e) {
                        // If a statement can't be parsed, stop and report error
                        throw e;
                    }
                }
                return {
                    type: 'Program',
                    body: statements,
                };
            }
        }

        // --- Interpreter (Evaluator) ---
        // The Interpreter takes the AST produced by the Parser and executes it.
        // It maintains an environment (scope) to store variable values.
        class Interpreter {
            constructor() {
                this.environment = new Map(); // Stores variable names and their values.
                this.outputLog = []; // Stores the output from 'print' statements.
            }

            // Resets the interpreter's state for a new run.
            reset() {
                this.environment.clear();
                this.outputLog = [];
            }

            // Adds a message to the output log.
            log(message, isError = false) {
                this.outputLog.push({ message, isError });
            }

            // Visits an AST node and dispatches to the appropriate evaluation method.
            visit(node) {
                const methodName = `visit${node.type}`;
                if (typeof this[methodName] === 'function') {
                    return this[methodName](node);
                } else {
                    throw new Error(`Interpreter Error: No visitor method for node type: ${node.type}`);
                }
            }

            // Visits a 'Program' node, executing each statement in its body.
            visitProgram(node) {
                for (const statement of node.body) {
                    this.visit(statement);
                }
                return this.outputLog;
            }

            // Visits a 'Number' node, returning its numerical value.
            visitNumber(node) {
                return node.value;
            }

            // Visits a 'BooleanLiteral' node, returning its boolean value.
            visitBooleanLiteral(node) {
                return node.value; // node.value is already true or false
            }

            // Visits an 'Identifier' node, returning its value from the environment.
            visitIdentifier(node) {
                if (!this.environment.has(node.name)) {
                    throw new Error(`Interpreter Error: Undefined variable '${node.name}'`);
                }
                return this.environment.get(node.name);
            }

            // Visits a 'BinaryOp' node, performing the arithmetic operation.
            visitBinaryOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/':
                        if (right === 0) {
                            throw new Error("Interpreter Error: Division by zero");
                        }
                        return left / right;
                    default:
                        throw new Error(`Interpreter Error: Unknown arithmetic operator: ${node.operator}`);
                }
            }

            // Visits a 'ComparisonOp' node, performing the comparison operation.
            visitComparisonOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                switch (node.operator) {
                    case '==': return left === right;
                    case '!=': return left !== right;
                    case '<': return left < right;
                    case '<=': return left <= right;
                    case '>': return left > right;
                    case '>=': return left >= right;
                    default:
                        throw new Error(`Interpreter Error: Unknown comparison operator: ${node.operator}`);
                }
            }

            // Visits a 'LogicalOp' node, performing the logical operation.
            visitLogicalOp(node) {
                if (node.operator === 'not') {
                    const operand = this.visit(node.operand);
                    return !operand;
                } else if (node.operator === 'and') {
                    const left = this.visit(node.left);
                    // Python's 'and' short-circuits: if left is false, return left; else return right.
                    // Here we simply return the boolean result.
                    if (!left) return false;
                    const right = this.visit(node.right);
                    return left && right;
                } else if (node.operator === 'or') {
                    const left = this.visit(node.left);
                    // Python's 'or' short-circuits: if left is true, return left; else return right.
                    // Here we simply return the boolean result.
                    if (left) return true;
                    const right = this.visit(node.right);
                    return left || right;
                } else {
                    throw new Error(`Interpreter Error: Unknown logical operator: ${node.operator}`);
                }
            }

            // Visits an 'AssignmentStatement' node, storing the value in the environment.
            visitAssignmentStatement(node) {
                const value = this.visit(node.value);
                this.environment.set(node.id.name, value);
            }

            // Visits a 'PrintStatement' node, logging the expression's value to the output.
            visitPrintStatement(node) {
                const valueToPrint = this.visit(node.expression);
                this.log(`Output: ${valueToPrint}`);
            }

            // Interprets the given AST.
            interpret(ast) {
                this.reset(); // Clear previous state
                try {
                    return this.visit(ast);
                } catch (error) {
                    this.log(`Error: ${error.message}`, true);
                    return this.outputLog;
                }
            }
        }

        // --- Main Application Logic ---
        const codeInput = getById('code-input');
        const runButton = getById('run-button');
        const outputDiv = getById('output');

        const interpreter = new Interpreter();

        runButton.addEventListener('click', () => {
            const code = codeInput.value;
            outputDiv.innerHTML = ''; // Clear previous output

            try {
                // 1. Lexing: Convert code string into tokens.
                const tokenizer = new Tokenizer(code);
                const tokens = tokenizer.tokenize();
                // console.log('Tokens:', tokens); // For debugging

                // 2. Parsing: Convert tokens into an Abstract Syntax Tree (AST).
                const parser = new Parser(tokens);
                const ast = parser.parse();
                // console.log('AST:', JSON.stringify(ast, null, 2)); // For debugging

                // 3. Interpreting: Execute the AST.
                const results = interpreter.interpret(ast);

                results.forEach(item => {
                    const p = document.createElement('p');
                    p.classList.add(item.isError ? 'error-message' : 'output-text');
                    p.textContent = item.message;
                    outputDiv.appendChild(p);
                });

            } catch (error) {
                // Catch any errors during lexing, parsing, or interpreting
                const p = document.createElement('p');
                p.classList.add('error-message');
                p.textContent = `Runtime Error: ${error.message}`;
                outputDiv.appendChild(p);
            }
        });

        // Set a default example code
        codeInput.value = `x = 10
y = 20
is_equal = x == 10 and y < 25
print(is_equal)

is_true = True or False
print(is_true)

is_false = not True
print(is_false)

result = (x + y > 25) or (not (y == 20))
print(result)

a = 5
b = 10
c = 5
print(a <= b)
print(a == c)
print(b != c)
`;
    </script>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Python Interpreter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark background */
            color: #e2e8f0; /* Light text */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Align to top */
            min-height: 100vh;
            padding: 2rem;
            box-sizing: border-box;
        }

        #app-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 900px; /* Max width for readability */
            background-color: #2d3748; /* Slightly lighter dark background for container */
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Subtle shadow */
            padding: 1.5rem;
        }

        h1 {
            color: #63b3ed; /* Blue for heading */
        }

        textarea {
            background-color: #242c38; /* Darker input background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in textarea */
            resize: vertical;
            min-height: 200px;
            font-family: monospace; /* Monospaced font for code */
            line-height: 1.5;
        }

        button {
            background-color: #48bb78; /* Green button */
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        button:hover {
            background-color: #38a169; /* Darker green on hover */
        }

        #output {
            background-color: #242c38; /* Darker output background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in output */
            min-height: 100px;
            overflow-y: auto;
            font-family: monospace;
            white-space: pre-wrap; /* Preserve whitespace and wrap text */
        }

        .error-message {
            color: #fc8181; /* Red for error messages */
            font-weight: bold;
        }

        .output-text {
            color: #a0aec0; /* Lighter grey for general output */
        }
    </style>
</head>
<body class="p-4 bg-gray-900 text-gray-200 min-h-screen flex items-start justify-center">
    <div id="app-container" class="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h1 class="text-3xl font-bold text-blue-400 mb-4 text-center">Simple Python Interpreter (JS)</h1>

        <div class="space-y-2">
            <label for="code-input" class="block text-gray-300 font-semibold">Enter Python Code:</label>
            <textarea
                id="code-input"
                class="w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border border-gray-600 text-gray-100"
                placeholder="x = 10 + 5&#10;y = x * 2&#10;print(y)"
            ></textarea>
        </div>

        <button
            id="run-button"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
        >
            Run Code
        </button>

        <div class="space-y-2">
            <label class="block text-gray-300 font-semibold">Output:</label>
            <div
                id="output"
                class="w-full p-3 rounded-md bg-gray-700 border border-gray-600 min-h-[100px] max-h-[400px] overflow-y-auto text-gray-100"
            >
                <!-- Output will appear here -->
            </div>
        </div>
    </div>

    <script type="module">
        // Helper to get element by ID
        const getById = (id) => document.getElementById(id);

        // --- Lexer (Tokenizer) ---
        // The Lexer is responsible for taking the raw input code string
        // and breaking it down into a stream of meaningful tokens.
        // Each token has a type (e.g., NUMBER, IDENTIFIER, PLUS) and a value.
        class Tokenizer {
            constructor(input) {
                this.input = input;
                this.position = 0;
                this.tokens = [];
            }

            // Defines the types of tokens our interpreter will recognize.
            static TokenType = {
                NUMBER: 'NUMBER',
                IDENTIFIER: 'IDENTIFIER',
                PLUS: 'PLUS',
                MINUS: 'MINUS',
                MULTIPLY: 'MULTIPLY',
                DIVIDE: 'DIVIDE',
                ASSIGN: 'ASSIGN',
                LPAREN: 'LPAREN',
                RPAREN: 'RPAREN',
                EOF: 'EOF', // End of File
                KEYWORD: 'KEYWORD', // For 'print', 'True', 'False', 'and', 'or', 'not', 'if', 'else'
                COLON: 'COLON', // For ':' in if/else statements
                // Comparison operators
                EQ: 'EQ',       // ==
                NE: 'NE',       // !=
                LT: 'LT',       // <
                LE: 'LE',       // <=
                GT: 'GT',       // >
                GE: 'GE',       // >=
            };

            // Regular expressions for matching different token patterns.
            // IMPORTANT: Multi-character operators must come before single-character ones
            // to ensure correct matching (e.g., '==' before '=').
            static TokenPatterns = [
                { type: Tokenizer.TokenType.EQ, regex: /^==/ },
                { type: Tokenizer.TokenType.NE, regex: /^!=/ },
                { type: Tokenizer.TokenType.LE, regex: /^<=/ },
                { type: Tokenizer.TokenType.GE, regex: /^>=/ },
                { type: Tokenizer.TokenType.LT, regex: /^</ },
                { type: Tokenizer.TokenType.GT, regex: /^>/ },
                { type: Tokenizer.TokenType.ASSIGN, regex: /^=/ }, // Must come after ==
                { type: Tokenizer.TokenType.NUMBER, regex: /^\d+/ },
                { type: Tokenizer.TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
                { type: Tokenizer.TokenType.PLUS, regex: /^\+/ },
                { type: Tokenizer.TokenType.MINUS, regex: /^-/ },
                { type: Tokenizer.TokenType.MULTIPLY, regex: /^\*/ },
                { type: Tokenizer.TokenType.DIVIDE, regex: /^\// },
                { type: Tokenizer.TokenType.LPAREN, regex: /^\(/ },
                { type: Tokenizer.TokenType.RPAREN, regex: /^\)/ },
                { type: Tokenizer.TokenType.COLON, regex: /^:/ }, // New: Colon for if/else
            ];

            // List of keywords our interpreter supports.
            static Keywords = ['print', 'True', 'False', 'and', 'or', 'not', 'if', 'else'];

            // Gets the next token from the input string.
            getNextToken() {
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                // Skip whitespace characters.
                this.skipWhitespace();

                // Check for EOF again after skipping whitespace.
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                const substring = this.input.substring(this.position);

                for (const pattern of Tokenizer.TokenPatterns) {
                    const match = substring.match(pattern.regex);
                    if (match) {
                        const value = match[0];
                        this.position += value.length;
                        // Check if an identifier is actually a keyword.
                        if (pattern.type === Tokenizer.TokenType.IDENTIFIER && Tokenizer.Keywords.includes(value)) {
                            return { type: Tokenizer.TokenType.KEYWORD, value: value };
                        }
                        return { type: pattern.type, value: value };
                    }
                }

                // If no token is matched, it's an unrecognized character.
                throw new Error(`Lexer Error: Unrecognized character at position ${this.position}: ${this.input[this.position]}`);
            }

            // Skips over whitespace characters in the input.
            skipWhitespace() {
                while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
                    this.position++;
                }
            }

            // Tokenizes the entire input string and returns an array of tokens.
            tokenize() {
                this.tokens = [];
                let token = this.getNextToken();
                while (token.type !== Tokenizer.TokenType.EOF) {
                    this.tokens.push(token);
                    token = this.getNextToken();
                }
                this.tokens.push(token); // Add EOF token
                return this.tokens;
            }
        }

        // --- Parser (Abstract Syntax Tree Builder) ---
        // The Parser takes the stream of tokens from the Lexer and builds an
        // Abstract Syntax Tree (AST). The AST is a tree representation of the
        // source code, abstracting away the syntax details.
        class Parser {
            constructor(tokens) {
                this.tokens = tokens;
                this.position = 0;
                this.currentToken = this.tokens[this.position];
            }

            // Advances to the next token in the stream.
            advance() {
                this.position++;
                this.currentToken = this.tokens[this.position];
            }

            // Ensures the current token matches the expected type, then advances.
            eat(tokenType, expectedValue = null) {
                if (this.currentToken.type === tokenType && (expectedValue === null || this.currentToken.value === expectedValue)) {
                    this.advance();
                } else {
                    const expectedStr = expectedValue ? `'${expectedValue}'` : tokenType;
                    throw new Error(`Parser Error: Expected ${expectedStr}, but found ${this.currentToken.type} ('${this.currentToken.value}') at position ${this.position}`);
                }
            }

            // Parses a number, boolean literal, identifier, or parenthesized expression.
            factor() {
                const token = this.currentToken;
                if (token.type === Tokenizer.TokenType.NUMBER) {
                    this.eat(Tokenizer.TokenType.NUMBER);
                    return { type: 'Number', value: parseInt(token.value) };
                } else if (token.type === Tokenizer.TokenType.IDENTIFIER) {
                    this.eat(Tokenizer.TokenType.IDENTIFIER);
                    return { type: 'Identifier', name: token.value };
                } else if (token.type === Tokenizer.TokenType.LPAREN) {
                    this.eat(Tokenizer.TokenType.LPAREN);
                    const node = this.expression(); // Parentheses can contain any expression
                    this.eat(Tokenizer.TokenType.RPAREN);
                    return node;
                } else if (token.type === Tokenizer.TokenType.KEYWORD && (token.value === 'True' || token.value === 'False')) {
                    this.eat(Tokenizer.TokenType.KEYWORD);
                    return { type: 'BooleanLiteral', value: token.value === 'True' };
                } else {
                    throw new Error(`Parser Error: Expected number, identifier, boolean literal or '(', but found ${token.type} ('${token.value}')`);
                }
            }

            // Parses terms (multiplication and division).
            term() {
                let node = this.factor();
                while ([Tokenizer.TokenType.MULTIPLY, Tokenizer.TokenType.DIVIDE].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.MULTIPLY) {
                        this.eat(Tokenizer.TokenType.MULTIPLY);
                    } else if (token.type === Tokenizer.TokenType.DIVIDE) {
                        this.eat(Tokenizer.TokenType.DIVIDE);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.factor(),
                    };
                }
                return node;
            }

            // Parses arithmetic expressions (addition and subtraction).
            arithmeticExpression() {
                let node = this.term();
                while ([Tokenizer.TokenType.PLUS, Tokenizer.TokenType.MINUS].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.PLUS) {
                        this.eat(Tokenizer.TokenType.PLUS);
                    } else if (token.type === Tokenizer.TokenType.MINUS) {
                        this.eat(Tokenizer.TokenType.MINUS);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.term(),
                    };
                }
                return node;
            }

            // Parses comparison expressions (e.g., x == y, a < b).
            comparisonExpression() {
                let node = this.arithmeticExpression(); // Start with arithmetic expressions
                const comparisonOperators = [
                    Tokenizer.TokenType.EQ, Tokenizer.TokenType.NE,
                    Tokenizer.TokenType.LT, Tokenizer.TokenType.LE,
                    Tokenizer.TokenType.GT, Tokenizer.TokenType.GE
                ];

                while (comparisonOperators.includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    this.eat(token.type); // Eat the comparison operator
                    node = {
                        type: 'ComparisonOp', // New AST node type for comparisons
                        left: node,
                        operator: token.value,
                        right: this.arithmeticExpression(),
                    };
                }
                return node;
            }

            // Parses logical NOT expressions (e.g., not x).
            logicalNotExpression() {
                if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'not') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'not'
                    const operand = this.logicalNotExpression(); // Allows for 'not not x'
                    return {
                        type: 'LogicalOp', // Represents logical operations
                        operator: operatorToken.value, // 'not'
                        operand: operand, // For unary 'not' operation
                    };
                }
                return this.comparisonExpression(); // If no 'not', proceed to comparison
            }

            // Parses logical AND expressions (e.g., A and B).
            logicalAndExpression() {
                let node = this.logicalNotExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'and') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'and'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'and'
                        right: this.logicalNotExpression(),
                    };
                }
                return node;
            }

            // Parses logical OR expressions (e.g., A or B). This is the highest precedence for expressions.
            logicalOrExpression() {
                let node = this.logicalAndExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'or') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'or'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'or'
                        right: this.logicalAndExpression(),
                    };
                }
                return node;
            }

            // The main expression method now delegates to the highest precedence logical expression.
            expression() {
                return this.logicalOrExpression();
            }

            // Parses an assignment statement (e.g., x = 10).
            assignmentStatement() {
                const identifierToken = this.currentToken;
                this.eat(Tokenizer.TokenType.IDENTIFIER);
                this.eat(Tokenizer.TokenType.ASSIGN);
                const expressionNode = this.expression(); // Assignment can take any kind of expression
                return {
                    type: 'AssignmentStatement',
                    id: { type: 'Identifier', name: identifierToken.value },
                    value: expressionNode,
                };
            }

            // Parses a print statement (e.g., print(x)).
            printStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'print'); // 'print' keyword
                this.eat(Tokenizer.TokenType.LPAREN);
                const expressionNode = this.expression(); // Print can take any kind of expression
                this.eat(Tokenizer.TokenType.RPAREN);
                return {
                    type: 'PrintStatement',
                    expression: expressionNode,
                };
            }

            // Parses an IF statement (e.g., if condition: statement else: statement).
            ifStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'if'); // Consume 'if' keyword
                const condition = this.expression(); // Parse the condition
                this.eat(Tokenizer.TokenType.COLON); // Consume ':'

                // For simplicity, a block is a single statement immediately after the colon.
                // A more robust parser would handle indentation for multi-statement blocks.
                const consequent = this.statement(); // Parse the 'if' block statement

                let alternate = null;
                // Check if an 'else' block follows
                if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'else') {
                    this.eat(Tokenizer.TokenType.KEYWORD, 'else'); // Consume 'else' keyword
                    this.eat(Tokenizer.TokenType.COLON); // Consume ':'
                    alternate = this.statement(); // Parse the 'else' block statement
                }

                return {
                    type: 'IfStatement',
                    condition: condition,
                    consequent: consequent,
                    alternate: alternate, // Will be null if no else block
                };
            }

            // Parses a single statement.
            statement() {
                if (this.currentToken.type === Tokenizer.TokenType.IDENTIFIER && this.tokens[this.position + 1]?.type === Tokenizer.TokenType.ASSIGN) {
                    return this.assignmentStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'print') {
                    return this.printStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'if') {
                    return this.ifStatement();
                }
                else {
                    throw new Error(`Parser Error: Unexpected token for statement: ${this.currentToken.type} ('${this.currentToken.value}')`);
                }
            }

            // Parses a program, which is a sequence of statements.
            parse() {
                const statements = [];
                // Parse statements until EOF is reached.
                // Each statement is expected to be on its own "line" or separated by whitespace
                // that the tokenizer handles.
                while (this.currentToken.type !== Tokenizer.TokenType.EOF) {
                    // Try to parse a statement. If it fails, stop parsing and throw an error.
                    try {
                         statements.push(this.statement());
                    } catch (e) {
                        // If a statement cannot be parsed, this indicates a syntax error.
                        // Throw the error to be caught by the main application logic.
                        throw e;
                    }
                }
                return {
                    type: 'Program',
                    body: statements,
                };
            }
        }

        // --- Interpreter (Evaluator) ---
        // The Interpreter takes the AST produced by the Parser and executes it.
        // It maintains an environment (scope) to store variable values.
        class Interpreter {
            constructor() {
                this.environment = new Map(); // Stores variable names and their values.
                this.outputLog = []; // Stores the output from 'print' statements.
            }

            // Resets the interpreter's state for a new run.
            reset() {
                this.environment.clear();
                this.outputLog = [];
            }

            // Adds a message to the output log.
            log(message, isError = false) {
                this.outputLog.push({ message, isError });
            }

            // Visits an AST node and dispatches to the appropriate evaluation method.
            visit(node) {
                const methodName = `visit${node.type}`;
                if (typeof this[methodName] === 'function') {
                    return this[methodName](node);
                } else {
                    throw new Error(`Interpreter Error: No visitor method for node type: ${node.type}`);
                }
            }

            // Visits a 'Program' node, executing each statement in its body.
            visitProgram(node) {
                for (const statement of node.body) {
                    this.visit(statement);
                }
                return this.outputLog;
            }

            // Visits a 'Number' node, returning its numerical value.
            visitNumber(node) {
                return node.value;
            }

            // Visits a 'BooleanLiteral' node, returning its boolean value.
            visitBooleanLiteral(node) {
                return node.value; // node.value is already true or false
            }

            // Visits an 'Identifier' node, returning its value from the environment.
            visitIdentifier(node) {
                if (!this.environment.has(node.name)) {
                    throw new Error(`Interpreter Error: Undefined variable '${node.name}'`);
                }
                return this.environment.get(node.name);
            }

            // Visits a 'BinaryOp' node, performing the arithmetic operation.
            visitBinaryOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                // Type checking for arithmetic operations
                if (typeof left !== 'number' || typeof right !== 'number') {
                    throw new Error(`Interpreter Error: Arithmetic operation '${node.operator}' expects numbers, but got ${typeof left} and ${typeof right}`);
                }

                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/':
                        if (right === 0) {
                            throw new Error("Interpreter Error: Division by zero");
                        }
                        return left / right;
                    default:
                        throw new Error(`Interpreter Error: Unknown arithmetic operator: ${node.operator}`);
                }
            }

            // Visits a 'ComparisonOp' node, performing the comparison operation.
            visitComparisonOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                // For simplicity, comparison works across types like JavaScript,
                // but in a strict Python interpreter, you might enforce same types.
                switch (node.operator) {
                    case '==': return left === right;
                    case '!=': return left !== right;
                    case '<': return left < right;
                    case '<=': return left <= right;
                    case '>': return left > right;
                    case '>=': return left >= right;
                    default:
                        throw new Error(`Interpreter Error: Unknown comparison operator: ${node.operator}`);
                }
            }

            // Visits a 'LogicalOp' node, performing the logical operation.
            visitLogicalOp(node) {
                if (node.operator === 'not') {
                    const operand = this.visit(node.operand);
                    return !operand; // Converts operand to boolean for 'not'
                } else if (node.operator === 'and') {
                    const left = this.visit(node.left);
                    // Python's 'and' short-circuits: if left is false, return left; else return right.
                    // For simplicity here, we always return a boolean.
                    if (!left) return false;
                    const right = this.visit(node.right);
                    return left && right;
                } else if (node.operator === 'or') {
                    const left = this.visit(node.left);
                    // Python's 'or' short-circuits: if left is true, return left; else return right.
                    // For simplicity here, we always return a boolean.
                    if (left) return true;
                    const right = this.visit(node.right);
                    return left || right;
                } else {
                    throw new Error(`Interpreter Error: Unknown logical operator: ${node.operator}`);
                }
            }

            // Visits an 'AssignmentStatement' node, storing the value in the environment.
            visitAssignmentStatement(node) {
                const value = this.visit(node.value);
                this.environment.set(node.id.name, value);
            }

            // Visits a 'PrintStatement' node, logging the expression's value to the output.
            visitPrintStatement(node) {
                const valueToPrint = this.visit(node.expression);
                this.log(`Output: ${valueToPrint}`);
            }

            // Visits an 'IfStatement' node, executing the conditional logic.
            visitIfStatement(node) {
                const conditionResult = this.visit(node.condition);

                // In Python, any non-zero number, non-empty string/list, True, etc., is truthy.
                // JavaScript's truthiness rules are similar for numbers (non-zero is true) and booleans.
                if (conditionResult) {
                    this.visit(node.consequent); // Execute the 'if' block
                } else if (node.alternate) {
                    this.visit(node.alternate); // Execute the 'else' block if it exists
                }
                // If condition is false and no alternate, do nothing.
            }

            // Interprets the given AST.
            interpret(ast) {
                this.reset(); // Clear previous state
                try {
                    return this.visit(ast);
                } catch (error) {
                    this.log(`Error: ${error.message}`, true);
                    return this.outputLog;
                }
            }
        }

        // --- Main Application Logic ---
        const codeInput = getById('code-input');
        const runButton = getById('run-button');
        const outputDiv = getById('output');

        const interpreter = new Interpreter();

        runButton.addEventListener('click', () => {
            const code = codeInput.value;
            outputDiv.innerHTML = ''; // Clear previous output

            try {
                // 1. Lexing: Convert code string into tokens.
                const tokenizer = new Tokenizer(code);
                const tokens = tokenizer.tokenize();
                // console.log('Tokens:', tokens); // For debugging

                // 2. Parsing: Convert tokens into an Abstract Syntax Tree (AST).
                const parser = new Parser(tokens);
                const ast = parser.parse();
                // console.log('AST:', JSON.stringify(ast, null, 2)); // For debugging

                // 3. Interpreting: Execute the AST.
                const results = interpreter.interpret(ast);

                results.forEach(item => {
                    const p = document.createElement('p');
                    p.classList.add(item.isError ? 'error-message' : 'output-text');
                    p.textContent = item.message;
                    outputDiv.appendChild(p);
                });

            } catch (error) {
                // Catch any errors during lexing, parsing, or interpreting
                const p = document.createElement('p');
                p.classList.add('error-message');
                p.textContent = `Runtime Error: ${error.message}`;
                outputDiv.appendChild(p);
            }
        });

        // Set a default example code
        codeInput.value = `x = 10
y = 20

if x < y:
    print(True)
else:
    print(False)

if x == 10 and y == 20:
    print("Both true")
else:
    print("One or both false")

z = 50
if z > 100:
    print("Z is large")
else:
    print("Z is not large")

a = True
if not a:
    print("A is false")
else:
    print("A is true")

b = 0
if b: # In Python, 0 is considered False
    print("B is truthy")
else:
    print("B is falsy")
`;
    </script>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Python Interpreter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark background */
            color: #e2e8f0; /* Light text */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Align to top */
            min-height: 100vh;
            padding: 2rem;
            box-sizing: border-box;
        }

        #app-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 900px; /* Max width for readability */
            background-color: #2d3748; /* Slightly lighter dark background for container */
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Subtle shadow */
            padding: 1.5rem;
        }

        h1 {
            color: #63b3ed; /* Blue for heading */
        }

        textarea {
            background-color: #242c38; /* Darker input background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in textarea */
            resize: vertical;
            min-height: 200px;
            font-family: monospace; /* Monospaced font for code */
            line-height: 1.5;
        }

        button {
            background-color: #48bb78; /* Green button */
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        button:hover {
            background-color: #38a169; /* Darker green on hover */
        }

        #output {
            background-color: #242c38; /* Darker output background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in output */
            min-height: 100px;
            overflow-y: auto;
            font-family: monospace;
            white-space: pre-wrap; /* Preserve whitespace and wrap text */
        }

        .error-message {
            color: #fc8181; /* Red for error messages */
            font-weight: bold;
        }

        .output-text {
            color: #a0aec0; /* Lighter grey for general output */
        }
    </style>
</head>
<body class="p-4 bg-gray-900 text-gray-200 min-h-screen flex items-start justify-center">
    <div id="app-container" class="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h1 class="text-3xl font-bold text-blue-400 mb-4 text-center">Simple Python Interpreter (JS)</h1>

        <div class="space-y-2">
            <label for="code-input" class="block text-gray-300 font-semibold">Enter Python Code:</label>
            <textarea
                id="code-input"
                class="w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border border-gray-600 text-gray-100"
                placeholder="x = 10 + 5&#10;y = x * 2&#10;print(y)"
            ></textarea>
        </div>

        <button
            id="run-button"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
        >
            Run Code
        </button>

        <div class="space-y-2">
            <label class="block text-gray-300 font-semibold">Output:</label>
            <div
                id="output"
                class="w-full p-3 rounded-md bg-gray-700 border border-gray-600 min-h-[100px] max-h-[400px] overflow-y-auto text-gray-100"
            >
                <!-- Output will appear here -->
            </div>
        </div>
    </div>

    <script type="module">
        // Helper to get element by ID
        const getById = (id) => document.getElementById(id);

        // --- Lexer (Tokenizer) ---
        // The Lexer is responsible for taking the raw input code string
        // and breaking it down into a stream of meaningful tokens.
        // Each token has a type (e.g., NUMBER, IDENTIFIER, PLUS) and a value.
        class Tokenizer {
            constructor(input) {
                this.input = input;
                this.position = 0;
                this.tokens = [];
            }

            // Defines the types of tokens our interpreter will recognize.
            static TokenType = {
                NUMBER: 'NUMBER',
                IDENTIFIER: 'IDENTIFIER',
                PLUS: 'PLUS',
                MINUS: 'MINUS',
                MULTIPLY: 'MULTIPLY',
                DIVIDE: 'DIVIDE',
                ASSIGN: 'ASSIGN',
                LPAREN: 'LPAREN',
                RPAREN: 'RPAREN',
                EOF: 'EOF', // End of File
                KEYWORD: 'KEYWORD', // For 'print', 'True', 'False', 'and', 'or', 'not', 'if', 'else', 'while'
                COLON: 'COLON', // For ':' in if/else/while statements
                // Comparison operators
                EQ: 'EQ',       // ==
                NE: 'NE',       // !=
                LT: 'LT',       // <
                LE: 'LE',       // <=
                GT: 'GT',       // >
                GE: 'GE',       // >=
            };

            // Regular expressions for matching different token patterns.
            // IMPORTANT: Multi-character operators must come before single-character ones
            // to ensure correct matching (e.g., '==' before '=').
            static TokenPatterns = [
                { type: Tokenizer.TokenType.EQ, regex: /^==/ },
                { type: Tokenizer.TokenType.NE, regex: /^!=/ },
                { type: Tokenizer.TokenType.LE, regex: /^<=/ },
                { type: Tokenizer.TokenType.GE, regex: /^>=/ },
                { type: Tokenizer.TokenType.LT, regex: /^</ },
                { type: Tokenizer.TokenType.GT, regex: /^>/ },
                { type: Tokenizer.TokenType.ASSIGN, regex: /^=/ }, // Must come after ==
                { type: Tokenizer.TokenType.NUMBER, regex: /^\d+/ },
                { type: Tokenizer.TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
                { type: Tokenizer.TokenType.PLUS, regex: /^\+/ },
                { type: Tokenizer.TokenType.MINUS, regex: /^-/ },
                { type: Tokenizer.TokenType.MULTIPLY, regex: /^\*/ },
                { type: Tokenizer.TokenType.DIVIDE, regex: /^\// },
                { type: Tokenizer.TokenType.LPAREN, regex: /^\(/ },
                { type: Tokenizer.TokenType.RPAREN, regex: /^\)/ },
                { type: Tokenizer.TokenType.COLON, regex: /^:/ }, // Colon for if/else/while
            ];

            // List of keywords our interpreter supports.
            static Keywords = ['print', 'True', 'False', 'and', 'or', 'not', 'if', 'else', 'while'];

            // Gets the next token from the input string.
            getNextToken() {
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                // Skip whitespace characters.
                this.skipWhitespace();

                // Check for EOF again after skipping whitespace.
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                const substring = this.input.substring(this.position);

                for (const pattern of Tokenizer.TokenPatterns) {
                    const match = substring.match(pattern.regex);
                    if (match) {
                        const value = match[0];
                        this.position += value.length;
                        // Check if an identifier is actually a keyword.
                        if (pattern.type === Tokenizer.TokenType.IDENTIFIER && Tokenizer.Keywords.includes(value)) {
                            return { type: Tokenizer.TokenType.KEYWORD, value: value };
                        }
                        return { type: pattern.type, value: value };
                    }
                }

                // If no token is matched, it's an unrecognized character.
                throw new Error(`Lexer Error: Unrecognized character at position ${this.position}: ${this.input[this.position]}`);
            }

            // Skips over whitespace characters in the input.
            skipWhitespace() {
                while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
                    this.position++;
                }
            }

            // Tokenizes the entire input string and returns an array of tokens.
            tokenize() {
                this.tokens = [];
                let token = this.getNextToken();
                while (token.type !== Tokenizer.TokenType.EOF) {
                    this.tokens.push(token);
                    token = this.getNextToken();
                }
                this.tokens.push(token); // Add EOF token
                return this.tokens;
            }
        }

        // --- Parser (Abstract Syntax Tree Builder) ---
        // The Parser takes the stream of tokens from the Lexer and builds an
        // Abstract Syntax Tree (AST). The AST is a tree representation of the
        // source code, abstracting away the syntax details.
        class Parser {
            constructor(tokens) {
                this.tokens = tokens;
                this.position = 0;
                this.currentToken = this.tokens[this.position];
            }

            // Advances to the next token in the stream.
            advance() {
                this.position++;
                this.currentToken = this.tokens[this.position];
            }

            // Ensures the current token matches the expected type, then advances.
            eat(tokenType, expectedValue = null) {
                if (this.currentToken.type === tokenType && (expectedValue === null || this.currentToken.value === expectedValue)) {
                    this.advance();
                } else {
                    const expectedStr = expectedValue ? `'${expectedValue}'` : tokenType;
                    throw new Error(`Parser Error: Expected ${expectedStr}, but found ${this.currentToken.type} ('${this.currentToken.value}') at position ${this.position}`);
                }
            }

            // Parses a number, boolean literal, identifier, or parenthesized expression.
            factor() {
                const token = this.currentToken;
                if (token.type === Tokenizer.TokenType.NUMBER) {
                    this.eat(Tokenizer.TokenType.NUMBER);
                    return { type: 'Number', value: parseInt(token.value) };
                } else if (token.type === Tokenizer.TokenType.IDENTIFIER) {
                    this.eat(Tokenizer.TokenType.IDENTIFIER);
                    return { type: 'Identifier', name: token.value };
                } else if (token.type === Tokenizer.TokenType.LPAREN) {
                    this.eat(Tokenizer.TokenType.LPAREN);
                    const node = this.expression(); // Parentheses can contain any expression
                    this.eat(Tokenizer.TokenType.RPAREN);
                    return node;
                } else if (token.type === Tokenizer.TokenType.KEYWORD && (token.value === 'True' || token.value === 'False')) {
                    this.eat(Tokenizer.TokenType.KEYWORD);
                    return { type: 'BooleanLiteral', value: token.value === 'True' };
                } else {
                    throw new Error(`Parser Error: Expected number, identifier, boolean literal or '(', but found ${token.type} ('${token.value}')`);
                }
            }

            // Parses terms (multiplication and division).
            term() {
                let node = this.factor();
                while ([Tokenizer.TokenType.MULTIPLY, Tokenizer.TokenType.DIVIDE].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.MULTIPLY) {
                        this.eat(Tokenizer.TokenType.MULTIPLY);
                    } else if (token.type === Tokenizer.TokenType.DIVIDE) {
                        this.eat(Tokenizer.TokenType.DIVIDE);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.factor(),
                    };
                }
                return node;
            }

            // Parses arithmetic expressions (addition and subtraction).
            arithmeticExpression() {
                let node = this.term();
                while ([Tokenizer.TokenType.PLUS, Tokenizer.TokenType.MINUS].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.PLUS) {
                        this.eat(Tokenizer.TokenType.PLUS);
                    } else if (token.type === Tokenizer.TokenType.MINUS) {
                        this.eat(Tokenizer.TokenType.MINUS);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.term(),
                    };
                }
                return node;
            }

            // Parses comparison expressions (e.g., x == y, a < b).
            comparisonExpression() {
                let node = this.arithmeticExpression(); // Start with arithmetic expressions
                const comparisonOperators = [
                    Tokenizer.TokenType.EQ, Tokenizer.TokenType.NE,
                    Tokenizer.TokenType.LT, Tokenizer.TokenType.LE,
                    Tokenizer.TokenType.GT, Tokenizer.TokenType.GE
                ];

                while (comparisonOperators.includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    this.eat(token.type); // Eat the comparison operator
                    node = {
                        type: 'ComparisonOp', // New AST node type for comparisons
                        left: node,
                        operator: token.value,
                        right: this.arithmeticExpression(),
                    };
                }
                return node;
            }

            // Parses logical NOT expressions (e.g., not x).
            logicalNotExpression() {
                if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'not') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'not'
                    const operand = this.logicalNotExpression(); // Allows for 'not not x'
                    return {
                        type: 'LogicalOp', // Represents logical operations
                        operator: operatorToken.value, // 'not'
                        operand: operand, // For unary 'not' operation
                    };
                }
                return this.comparisonExpression(); // If no 'not', proceed to comparison
            }

            // Parses logical AND expressions (e.g., A and B).
            logicalAndExpression() {
                let node = this.logicalNotExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'and') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'and'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'and'
                        right: this.logicalNotExpression(),
                    };
                }
                return node;
            }

            // Parses logical OR expressions (e.g., A or B). This is the highest precedence for expressions.
            logicalOrExpression() {
                let node = this.logicalAndExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'or') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'or'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'or'
                        right: this.logicalAndExpression(),
                    };
                }
                return node;
            }

            // The main expression method now delegates to the highest precedence logical expression.
            expression() {
                return this.logicalOrExpression();
            }

            // Parses an assignment statement (e.g., x = 10).
            assignmentStatement() {
                const identifierToken = this.currentToken;
                this.eat(Tokenizer.TokenType.IDENTIFIER);
                this.eat(Tokenizer.TokenType.ASSIGN);
                const expressionNode = this.expression(); // Assignment can take any kind of expression
                return {
                    type: 'AssignmentStatement',
                    id: { type: 'Identifier', name: identifierToken.value },
                    value: expressionNode,
                };
            }

            // Parses a print statement (e.g., print(x)).
            printStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'print'); // 'print' keyword
                this.eat(Tokenizer.TokenType.LPAREN);
                const expressionNode = this.expression(); // Print can take any kind of expression
                this.eat(Tokenizer.TokenType.RPAREN);
                return {
                    type: 'PrintStatement',
                    expression: expressionNode,
                };
            }

            // Helper to parse a single atomic statement (assignment, print, if, while).
            // This is used by parseBlockStatements and the main parse loop.
            parseNextStatement() {
                if (this.currentToken.type === Tokenizer.TokenType.IDENTIFIER && this.tokens[this.position + 1]?.type === Tokenizer.TokenType.ASSIGN) {
                    return this.assignmentStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'print') {
                    return this.printStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'if') {
                    return this.ifStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'while') {
                    return this.whileStatement();
                }
                else {
                    // If it's not a recognized statement start, it might be the end of a block
                    // or an unexpected token.
                    throw new Error(`Parser Error: Unexpected token at start of statement: ${this.currentToken.type} ('${this.currentToken.value}')`);
                }
            }

            // Parses a block of statements for if/while.
            // This is a simplified block handling; it collects statements until
            // it encounters a new top-level keyword ('if', 'else', 'while') or EOF.
            // This does NOT use indentation for block detection, but rather
            // assumes sequential statements following a colon belong to the block.
            parseBlockStatements() {
                const blockStatements = [];
                const blockEndKeywords = new Set(['if', 'else', 'while']); // Keywords that typically end a logical block

                // Keep parsing statements as long as we are not at EOF
                // and the current token is not a keyword that signifies the end of a block.
                // We also check if the current token *can* start a statement (identifier for assignment, or 'print').
                while (
                    this.currentToken.type !== Tokenizer.TokenType.EOF &&
                    !(this.currentToken.type === Tokenizer.TokenType.KEYWORD && blockEndKeywords.has(this.currentToken.value))
                ) {
                    const startPos = this.position; // Store current position to detect if a statement was actually parsed
                    try {
                        blockStatements.push(this.parseNextStatement());
                        // If parseNextStatement did not advance the position, it means
                        // it didn't consume a valid statement, so we break to avoid infinite loop.
                        if (this.position === startPos) {
                            break;
                        }
                    } catch (e) {
                        // If parseNextStatement throws an error (e.g., unexpected token),
                        // it means we've hit something that isn't a valid statement in this context,
                        // so we assume the block has ended.
                        break;
                    }
                }
                return blockStatements;
            }


            // Parses an IF statement (e.g., if condition: statement else: statement).
            ifStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'if'); // Consume 'if' keyword
                const condition = this.expression(); // Parse the condition
                this.eat(Tokenizer.TokenType.COLON); // Consume ':'

                const consequent = this.parseBlockStatements(); // NOW PARSES MULTIPLE STATEMENTS

                let alternate = []; // Initialize as an empty array for no 'else' block
                // Check if an 'else' block follows
                if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'else') {
                    this.eat(Tokenizer.TokenType.KEYWORD, 'else'); // Consume 'else' keyword
                    this.eat(Tokenizer.TokenType.COLON); // Consume ':'
                    alternate = this.parseBlockStatements(); // NOW PARSES MULTIPLE STATEMENTS
                }

                return {
                    type: 'IfStatement',
                    condition: condition,
                    consequent: consequent, // Now an array of statements
                    alternate: alternate, // Now an array of statements (can be empty)
                };
            }

            // Parses a WHILE statement (e.g., while condition: statement).
            whileStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'while'); // Consume 'while' keyword
                const condition = this.expression(); // Parse the condition
                this.eat(Tokenizer.TokenType.COLON); // Consume ':'

                const body = this.parseBlockStatements(); // NOW PARSES MULTIPLE STATEMENTS

                return {
                    type: 'WhileStatement',
                    condition: condition,
                    body: body, // Now an array of statements
                };
            }

            // Parses a program, which is a sequence of statements.
            parse() {
                const statements = [];
                // Parse statements until EOF is reached.
                while (this.currentToken.type !== Tokenizer.TokenType.EOF) {
                    try {
                         statements.push(this.parseNextStatement()); // Use the new helper for top-level
                    } catch (e) {
                        // If a statement cannot be parsed, this indicates a syntax error.
                        // Throw the error to be caught by the main application logic.
                        throw e;
                    }
                }
                return {
                    type: 'Program',
                    body: statements,
                };
            }
        }

        // --- Interpreter (Evaluator) ---
        // The Interpreter takes the AST produced by the Parser and executes it.
        // It maintains an environment (scope) to store variable values.
        class Interpreter {
            constructor() {
                this.environment = new Map(); // Stores variable names and their values.
                this.outputLog = []; // Stores the output from 'print' statements.
            }

            // Resets the interpreter's state for a new run.
            reset() {
                this.environment.clear();
                this.outputLog = [];
            }

            // Adds a message to the output log.
            log(message, isError = false) {
                this.outputLog.push({ message, isError });
            }

            // Visits an AST node and dispatches to the appropriate evaluation method.
            visit(node) {
                const methodName = `visit${node.type}`;
                if (typeof this[methodName] === 'function') {
                    return this[methodName](node);
                } else {
                    throw new Error(`Interpreter Error: No visitor method for node type: ${node.type}`);
                }
            }

            // Visits a 'Program' node, executing each statement in its body.
            visitProgram(node) {
                for (const statement of node.body) {
                    this.visit(statement);
                }
                return this.outputLog;
            }

            // Visits a 'Number' node, returning its numerical value.
            visitNumber(node) {
                return node.value;
            }

            // Visits a 'BooleanLiteral' node, returning its boolean value.
            visitBooleanLiteral(node) {
                return node.value; // node.value is already true or false
            }

            // Visits an 'Identifier' node, returning its value from the environment.
            visitIdentifier(node) {
                if (!this.environment.has(node.name)) {
                    throw new Error(`Interpreter Error: Undefined variable '${node.name}'`);
                }
                return this.environment.get(node.name);
            }

            // Visits a 'BinaryOp' node, performing the arithmetic operation.
            visitBinaryOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                // Type checking for arithmetic operations
                if (typeof left !== 'number' || typeof right !== 'number') {
                    throw new Error(`Interpreter Error: Arithmetic operation '${node.operator}' expects numbers, but got ${typeof left} and ${typeof right}`);
                }

                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/':
                        if (right === 0) {
                            throw new Error("Interpreter Error: Division by zero");
                        }
                        return left / right;
                    default:
                        throw new Error(`Interpreter Error: Unknown arithmetic operator: ${node.operator}`);
                }
            }

            // Visits a 'ComparisonOp' node, performing the comparison operation.
            visitComparisonOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                // For simplicity, comparison works across types like JavaScript,
                // but in a strict Python interpreter, you might enforce same types.
                switch (node.operator) {
                    case '==': return left === right;
                    case '!=': return left !== right;
                    case '<': return left < right;
                    case '<=': return left <= right;
                    case '>': return left > right;
                    case '>=': return left >= right;
                    default:
                        throw new Error(`Interpreter Error: Unknown comparison operator: ${node.operator}`);
                }
            }

            // Visits a 'LogicalOp' node, performing the logical operation.
            visitLogicalOp(node) {
                if (node.operator === 'not') {
                    const operand = this.visit(node.operand);
                    return !operand; // Converts operand to boolean for 'not'
                } else if (node.operator === 'and') {
                    const left = this.visit(node.left);
                    // Python's 'and' short-circuits: if left is false, return left; else return right.
                    // For simplicity here, we always return a boolean.
                    if (!left) return false;
                    const right = this.visit(node.right);
                    return left && right;
                } else if (node.operator === 'or') {
                    const left = this.visit(node.left);
                    // Python's 'or' short-circuits: if left is true, return left; else return right.
                    // For simplicity here, we always return a boolean.
                    if (left) return true;
                    const right = this.visit(node.right);
                    return left || right;
                } else {
                    throw new Error(`Interpreter Error: Unknown logical operator: ${node.operator}`);
                }
            }

            // Visits an 'AssignmentStatement' node, storing the value in the environment.
            visitAssignmentStatement(node) {
                const value = this.visit(node.value);
                this.environment.set(node.id.name, value);
            }

            // Visits a 'PrintStatement' node, logging the expression's value to the output.
            visitPrintStatement(node) {
                const valueToPrint = this.visit(node.expression);
                this.log(`Output: ${valueToPrint}`);
            }

            // Visits an 'IfStatement' node, executing the conditional logic.
            visitIfStatement(node) {
                const conditionResult = this.visit(node.condition);

                // Execute each statement in the 'if' block if condition is true
                if (conditionResult) {
                    node.consequent.forEach(stmt => this.visit(stmt));
                } else if (node.alternate && node.alternate.length > 0) {
                    // Execute each statement in the 'else' block if condition is false and 'else' exists
                    node.alternate.forEach(stmt => this.visit(stmt));
                }
            }

            // Visits a 'WhileStatement' node, executing the loop.
            visitWhileStatement(node) {
                let loopIterations = 0;
                const MAX_ITERATIONS = 1000; // Limit loop iterations

                // Keep looping as long as the condition evaluates to true.
                while (this.visit(node.condition)) {
                    if (loopIterations >= MAX_ITERATIONS) {
                        this.log(`Warning: While loop exceeded ${MAX_ITERATIONS} iterations. Possible infinite loop.`, true);
                        break;
                    }
                    // Execute each statement in the loop body
                    node.body.forEach(stmt => this.visit(stmt));
                    loopIterations++;
                }
            }

            // Interprets the given AST.
            interpret(ast) {
                this.reset(); // Clear previous state
                try {
                    return this.visit(ast);
                } catch (error) {
                    this.log(`Error: ${error.message}`, true);
                    return this.outputLog;
                }
            }
        }

        // --- Main Application Logic ---
        const codeInput = getById('code-input');
        const runButton = getById('run-button');
        const outputDiv = getById('output');

        const interpreter = new Interpreter();

        runButton.addEventListener('click', () => {
            const code = codeInput.value;
            outputDiv.innerHTML = ''; // Clear previous output

            try {
                // 1. Lexing: Convert code string into tokens.
                const tokenizer = new Tokenizer(code);
                const tokens = tokenizer.tokenize();
                // console.log('Tokens:', tokens); // For debugging

                // 2. Parsing: Convert tokens into an Abstract Syntax Tree (AST).
                const parser = new Parser(tokens);
                const ast = parser.parse();
                // console.log('AST:', JSON.stringify(ast, null, 2)); // For debugging

                // 3. Interpreting: Execute the AST.
                const results = interpreter.interpret(ast);

                results.forEach(item => {
                    const p = document.createElement('p');
                    p.classList.add(item.isError ? 'error-message' : 'output-text');
                    p.textContent = item.message;
                    outputDiv.appendChild(p);
                });

            } catch (error) {
                // Catch any errors during lexing, parsing, or interpreting
                const p = document.createElement('p');
                p.classList.add('error-message');
                p.textContent = `Runtime Error: ${error.message}`;
                outputDiv.appendChild(p);
            }
        });

        // Set a default example code
        codeInput.value = `
count = 5
while count > 0:
    print(100)
    print(count)
    count = count - 1


done = False
while not done:
    print(101)
    done = True
    print(909)
`;
    </script>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Python Interpreter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c; /* Dark background */
            color: #e2e8f0; /* Light text */
            display: flex;
            justify-content: center;
            align-items: flex-start; /* Align to top */
            min-height: 100vh;
            padding: 2rem;
            box-sizing: border-box;
        }

        #app-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 900px; /* Max width for readability */
            background-color: #2d3748; /* Slightly lighter dark background for container */
            border-radius: 0.75rem; /* Rounded corners */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Subtle shadow */
            padding: 1.5rem;
        }

        h1 {
            color: #63b3ed; /* Blue for heading */
        }

        textarea {
            background-color: #242c38; /* Darker input background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in textarea */
            resize: vertical;
            min-height: 200px;
            font-family: monospace; /* Monospaced font for code */
            line-height: 1.5;
        }

        button {
            background-color: #48bb78; /* Green button */
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        button:hover {
            background-color: #38a169; /* Darker green on hover */
        }

        #output {
            background-color: #242c38; /* Darker output background */
            border: 1px solid #4a5568; /* Subtle border */
            color: #cbd5e0; /* Light text in output */
            min-height: 100px;
            overflow-y: auto;
            font-family: monospace;
            white-space: pre-wrap; /* Preserve whitespace and wrap text */
        }

        .error-message {
            color: #fc8181; /* Red for error messages */
            font-weight: bold;
        }

        .output-text {
            color: #a0aec0; /* Lighter grey for general output */
        }
    </style>
</head>
<body class="p-4 bg-gray-900 text-gray-200 min-h-screen flex items-start justify-center">
    <div id="app-container" class="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h1 class="text-3xl font-bold text-blue-400 mb-4 text-center">Simple Python Interpreter (JS)</h1>

        <div class="space-y-2">
            <label for="code-input" class="block text-gray-300 font-semibold">Enter Python Code:</label>
            <textarea
                id="code-input"
                class="w-full p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border border-gray-600 text-gray-100"
                placeholder="x = 10 + 5&#10;y = x * 2&#10;print(y)"
            ></textarea>
        </div>

        <button
            id="run-button"
            class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
        >
            Run Code
        </button>

        <div class="space-y-2">
            <label class="block text-gray-300 font-semibold">Output:</label>
            <div
                id="output"
                class="w-full p-3 rounded-md bg-gray-700 border border-gray-600 min-h-[100px] max-h-[400px] overflow-y-auto text-gray-100"
            >
                <!-- Output will appear here -->
            </div>
        </div>
    </div>

    <script type="module">
        // Helper to get element by ID
        const getById = (id) => document.getElementById(id);

        // --- Lexer (Tokenizer) ---
        // The Lexer is responsible for taking the raw input code string
        // and breaking it down into a stream of meaningful tokens.
        // Each token has a type (e.g., NUMBER, IDENTIFIER, PLUS) and a value.
        class Tokenizer {
            constructor(input) {
                this.input = input;
                this.position = 0;
                this.tokens = [];
            }

            // Defines the types of tokens our interpreter will recognize.
            static TokenType = {
                NUMBER: 'NUMBER',
                IDENTIFIER: 'IDENTIFIER',
                PLUS: 'PLUS',
                MINUS: 'MINUS',
                MULTIPLY: 'MULTIPLY',
                DIVIDE: 'DIVIDE',
                ASSIGN: 'ASSIGN',
                LPAREN: 'LPAREN',
                RPAREN: 'RPAREN',
                EOF: 'EOF', // End of File
                KEYWORD: 'KEYWORD', // For 'print', 'True', 'False', 'and', 'or', 'not', 'if', 'else', 'while', 'def'
                COLON: 'COLON', // For ':' in if/else/while/def statements
                COMMA: 'COMMA', // For ',' in function arguments/parameters
                // Comparison operators
                EQ: 'EQ',       // ==
                NE: 'NE',       // !=
                LT: 'LT',       // <
                LE: 'LE',       // <=
                GT: 'GT',       // >
                GE: 'GE',       // >=
            };

            // Regular expressions for matching different token patterns.
            // IMPORTANT: Multi-character operators must come before single-character ones
            // to ensure correct matching (e.g., '==' before '=').
            static TokenPatterns = [
                { type: Tokenizer.TokenType.EQ, regex: /^==/ },
                { type: Tokenizer.TokenType.NE, regex: /^!=/ },
                { type: Tokenizer.TokenType.LE, regex: /^<=/ },
                { type: Tokenizer.TokenType.GE, regex: /^>=/ },
                { type: Tokenizer.TokenType.LT, regex: /^</ },
                { type: Tokenizer.TokenType.GT, regex: /^>/ },
                { type: Tokenizer.TokenType.ASSIGN, regex: /^=/ }, // Must come after ==
                { type: Tokenizer.TokenType.NUMBER, regex: /^\d+/ },
                { type: Tokenizer.TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
                { type: Tokenizer.TokenType.PLUS, regex: /^\+/ },
                { type: Tokenizer.TokenType.MINUS, regex: /^-/ },
                { type: Tokenizer.TokenType.MULTIPLY, regex: /^\*/ },
                { type: Tokenizer.TokenType.DIVIDE, regex: /^\// },
                { type: Tokenizer.TokenType.LPAREN, regex: /^\(/ },
                { type: Tokenizer.TokenType.RPAREN, regex: /^\)/ },
                { type: Tokenizer.TokenType.COLON, regex: /^:/ }, // Colon for if/else/while/def
                { type: Tokenizer.TokenType.COMMA, regex: /^,/ }, // Comma for parameters/arguments
            ];

            // List of keywords our interpreter supports.
            static Keywords = ['print', 'True', 'False', 'and', 'or', 'not', 'if', 'else', 'while', 'def'];

            // Gets the next token from the input string.
            getNextToken() {
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                // Skip whitespace characters.
                this.skipWhitespace();

                // Check for EOF again after skipping whitespace.
                if (this.position >= this.input.length) {
                    return { type: Tokenizer.TokenType.EOF, value: '' };
                }

                const substring = this.input.substring(this.position);

                for (const pattern of Tokenizer.TokenPatterns) {
                    const match = substring.match(pattern.regex);
                    if (match) {
                        const value = match[0];
                        this.position += value.length;
                        // Check if an identifier is actually a keyword.
                        if (pattern.type === Tokenizer.TokenType.IDENTIFIER && Tokenizer.Keywords.includes(value)) {
                            return { type: Tokenizer.TokenType.KEYWORD, value: value };
                        }
                        return { type: pattern.type, value: value };
                    }
                }

                // If no token is matched, it's an unrecognized character.
                throw new Error(`Lexer Error: Unrecognized character at position ${this.position}: ${this.input[this.position]}`);
            }

            // Skips over whitespace characters in the input.
            skipWhitespace() {
                while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
                    this.position++;
                }
            }

            // Tokenizes the entire input string and returns an array of tokens.
            tokenize() {
                this.tokens = [];
                let token = this.getNextToken();
                while (token.type !== Tokenizer.TokenType.EOF) {
                    this.tokens.push(token);
                    token = this.getNextToken();
                }
                this.tokens.push(token); // Add EOF token
                return this.tokens;
            }
        }

        // --- Parser (Abstract Syntax Tree Builder) ---
        // The Parser takes the stream of tokens from the Lexer and builds an
        // Abstract Syntax Tree (AST). The AST is a tree representation of the
        // source code, abstracting away the syntax details.
        class Parser {
            constructor(tokens) {
                this.tokens = tokens;
                this.position = 0;
                this.currentToken = this.tokens[this.position];
            }

            // Advances to the next token in the stream.
            advance() {
                this.position++;
                this.currentToken = this.tokens[this.position];
            }

            // Ensures the current token matches the expected type, then advances.
            eat(tokenType, expectedValue = null) {
                if (this.currentToken.type === tokenType && (expectedValue === null || this.currentToken.value === expectedValue)) {
                    this.advance();
                } else {
                    const expectedStr = expectedValue ? `'${expectedValue}'` : tokenType;
                    throw new Error(`Parser Error: Expected ${expectedStr}, but found ${this.currentToken.type} ('${this.currentToken.value}') at position ${this.position}`);
                }
            }

            // Parses a number, boolean literal, identifier, or parenthesized expression.
            factor() {
                const token = this.currentToken;
                if (token.type === Tokenizer.TokenType.NUMBER) {
                    this.eat(Tokenizer.TokenType.NUMBER);
                    return { type: 'Number', value: parseInt(token.value) };
                } else if (token.type === Tokenizer.TokenType.IDENTIFIER) {
                    // This could be a simple identifier or the start of a function call.
                    // We need to look ahead to differentiate.
                    const nextToken = this.tokens[this.position + 1];
                    if (nextToken && nextToken.type === Tokenizer.TokenType.LPAREN) {
                        return this.callExpression(); // It's a function call
                    }
                    this.eat(Tokenizer.TokenType.IDENTIFIER); // It's just an identifier
                    return { type: 'Identifier', name: token.value };
                } else if (token.type === Tokenizer.TokenType.LPAREN) {
                    this.eat(Tokenizer.TokenType.LPAREN);
                    const node = this.expression(); // Parentheses can contain any expression
                    this.eat(Tokenizer.TokenType.RPAREN);
                    return node;
                } else if (token.type === Tokenizer.TokenType.KEYWORD && (token.value === 'True' || token.value === 'False')) {
                    this.eat(Tokenizer.TokenType.KEYWORD);
                    return { type: 'BooleanLiteral', value: token.value === 'True' };
                } else {
                    throw new Error(`Parser Error: Expected number, identifier, boolean literal or '(', but found ${token.type} ('${token.value}')`);
                }
            }

            // Parses terms (multiplication and division).
            term() {
                let node = this.factor();
                while ([Tokenizer.TokenType.MULTIPLY, Tokenizer.TokenType.DIVIDE].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.MULTIPLY) {
                        this.eat(Tokenizer.TokenType.MULTIPLY);
                    } else if (token.type === Tokenizer.TokenType.DIVIDE) {
                        this.eat(Tokenizer.TokenType.DIVIDE);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.factor(),
                    };
                }
                return node;
            }

            // Parses arithmetic expressions (addition and subtraction).
            arithmeticExpression() {
                let node = this.term();
                while ([Tokenizer.TokenType.PLUS, Tokenizer.TokenType.MINUS].includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    if (token.type === Tokenizer.TokenType.PLUS) {
                        this.eat(Tokenizer.TokenType.PLUS);
                    } else if (token.type === Tokenizer.TokenType.MINUS) {
                        this.eat(Tokenizer.TokenType.MINUS);
                    }
                    node = {
                        type: 'BinaryOp', // Represents arithmetic binary operations
                        left: node,
                        operator: token.value,
                        right: this.term(),
                    };
                }
                return node;
            }

            // Parses comparison expressions (e.g., x == y, a < b).
            comparisonExpression() {
                let node = this.arithmeticExpression(); // Start with arithmetic expressions
                const comparisonOperators = [
                    Tokenizer.TokenType.EQ, Tokenizer.TokenType.NE,
                    Tokenizer.TokenType.LT, Tokenizer.TokenType.LE,
                    Tokenizer.TokenType.GT, Tokenizer.TokenType.GE
                ];

                while (comparisonOperators.includes(this.currentToken.type)) {
                    const token = this.currentToken;
                    this.eat(token.type); // Eat the comparison operator
                    node = {
                        type: 'ComparisonOp', // New AST node type for comparisons
                        left: node,
                        operator: token.value,
                        right: this.arithmeticExpression(),
                    };
                }
                return node;
            }

            // Parses logical NOT expressions (e.g., not x).
            logicalNotExpression() {
                if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'not') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'not'
                    const operand = this.logicalNotExpression(); // Allows for 'not not x'
                    return {
                        type: 'LogicalOp', // Represents logical operations
                        operator: operatorToken.value, // 'not'
                        operand: operand, // For unary 'not' operation
                    };
                }
                return this.comparisonExpression(); // If no 'not', proceed to comparison
            }

            // Parses logical AND expressions (e.g., A and B).
            logicalAndExpression() {
                let node = this.logicalNotExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'and') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'and'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'and'
                        right: this.logicalNotExpression(),
                    };
                }
                return node;
            }

            // Parses logical OR expressions (e.g., A or B). This is the highest precedence for expressions.
            logicalOrExpression() {
                let node = this.logicalAndExpression();
                while (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'or') {
                    const operatorToken = this.currentToken;
                    this.eat(Tokenizer.TokenType.KEYWORD); // Eat 'or'
                    node = {
                        type: 'LogicalOp', // Represents logical operations
                        left: node,
                        operator: operatorToken.value, // 'or'
                        right: this.logicalAndExpression(),
                    };
                }
                return node;
            }

            // The main expression method now delegates to the highest precedence logical expression.
            expression() {
                return this.logicalOrExpression();
            }

            // Parses a function call expression (e.g., myFunction(arg1, arg2)).
            callExpression() {
                const calleeIdentifier = this.currentToken;
                this.eat(Tokenizer.TokenType.IDENTIFIER); // Consume the function name

                this.eat(Tokenizer.TokenType.LPAREN); // Consume '('

                const args = [];
                // Parse arguments until ')' is found
                if (this.currentToken.type !== Tokenizer.TokenType.RPAREN) {
                    args.push(this.expression()); // First argument
                    while (this.currentToken.type === Tokenizer.TokenType.COMMA) {
                        this.eat(Tokenizer.TokenType.COMMA);
                        args.push(this.expression()); // Subsequent arguments
                    }
                }
                this.eat(Tokenizer.TokenType.RPAREN); // Consume ')'

                return {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: calleeIdentifier.value },
                    arguments: args,
                };
            }

            // Parses an assignment statement (e.g., x = 10).
            assignmentStatement() {
                const identifierToken = this.currentToken;
                this.eat(Tokenizer.TokenType.IDENTIFIER);
                this.eat(Tokenizer.TokenType.ASSIGN);
                const expressionNode = this.expression(); // Assignment can take any kind of expression
                return {
                    type: 'AssignmentStatement',
                    id: { type: 'Identifier', name: identifierToken.value },
                    value: expressionNode,
                };
            }

            // Parses a print statement (e.g., print(x)).
            printStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'print'); // 'print' keyword
                this.eat(Tokenizer.TokenType.LPAREN);
                const expressionNode = this.expression(); // Print can take any kind of expression
                this.eat(Tokenizer.TokenType.RPAREN);
                return {
                    type: 'PrintStatement',
                    expression: expressionNode,
                };
            }

            // Helper to parse a single atomic statement (assignment, print, if, while, function definition).
            parseNextStatement() {
                if (this.currentToken.type === Tokenizer.TokenType.IDENTIFIER && this.tokens[this.position + 1]?.type === Tokenizer.TokenType.ASSIGN) {
                    return this.assignmentStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'print') {
                    return this.printStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'if') {
                    return this.ifStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'while') {
                    return this.whileStatement();
                } else if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'def') {
                    return this.functionDefinition(); // New: Recognize function definitions
                }
                else {
                    throw new Error(`Parser Error: Unexpected token at start of statement: ${this.currentToken.type} ('${this.currentToken.value}')`);
                }
            }

            // Parses a block of statements for if/while/def.
            // This is a simplified block handling; it collects statements until
            // it encounters a new top-level keyword ('if', 'else', 'while', 'def') or EOF.
            // This does NOT use indentation for block detection, but rather
            // assumes sequential statements following a colon belong to the block.
            parseBlockStatements() {
                const blockStatements = [];
                const blockEndKeywords = new Set(['if', 'else', 'while', 'def']); // Keywords that typically end a logical block

                // Keep parsing statements as long as we are not at EOF
                // and the current token is not a keyword that signifies the end of a block.
                while (
                    this.currentToken.type !== Tokenizer.TokenType.EOF &&
                    !(this.currentToken.type === Tokenizer.TokenType.KEYWORD && blockEndKeywords.has(this.currentToken.value))
                ) {
                    const startPos = this.position; // Store current position to detect if a statement was actually parsed
                    try {
                        blockStatements.push(this.parseNextStatement());
                        // If parseNextStatement did not advance the position, it means
                        // it didn't consume a valid statement, so we break to avoid infinite loop.
                        if (this.position === startPos) {
                            break;
                        }
                    } catch (e) {
                        // If parseNextStatement throws an error (e.g., unexpected token),
                        // it means we've hit something that isn't a valid statement in this context,
                        // so we assume the block has ended.
                        break;
                    }
                }
                return blockStatements;
            }


            // Parses an IF statement (e.g., if condition: statement else: statement).
            ifStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'if'); // Consume 'if' keyword
                const condition = this.expression(); // Parse the condition
                this.eat(Tokenizer.TokenType.COLON); // Consume ':'

                const consequent = this.parseBlockStatements(); // NOW PARSES MULTIPLE STATEMENTS

                let alternate = []; // Initialize as an empty array for no 'else' block
                // Check if an 'else' block follows
                if (this.currentToken.type === Tokenizer.TokenType.KEYWORD && this.currentToken.value === 'else') {
                    this.eat(Tokenizer.TokenType.KEYWORD, 'else'); // Consume 'else' keyword
                    this.eat(Tokenizer.TokenType.COLON); // Consume ':'
                    alternate = this.parseBlockStatements(); // NOW PARSES MULTIPLE STATEMENTS
                }

                return {
                    type: 'IfStatement',
                    condition: condition,
                    consequent: consequent, // Now an array of statements
                    alternate: alternate, // Now an array of statements (can be empty)
                };
            }

            // Parses a WHILE statement (e.g., while condition: statement).
            whileStatement() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'while'); // Consume 'while' keyword
                const condition = this.expression(); // Parse the condition
                this.eat(Tokenizer.TokenType.COLON); // Consume ':'

                const body = this.parseBlockStatements(); // NOW PARSES MULTIPLE STATEMENTS

                return {
                    type: 'WhileStatement',
                    condition: condition,
                    body: body, // Now an array of statements
                };
            }

            // Parses a function definition (e.g., def func_name(param1, param2): body).
            functionDefinition() {
                this.eat(Tokenizer.TokenType.KEYWORD, 'def'); // Consume 'def' keyword
                const functionName = this.currentToken.value;
                this.eat(Tokenizer.TokenType.IDENTIFIER); // Consume function name

                this.eat(Tokenizer.TokenType.LPAREN); // Consume '('

                const parameters = [];
                // Parse parameters until ')' is found
                if (this.currentToken.type !== Tokenizer.TokenType.RPAREN) {
                    parameters.push(this.currentToken.value);
                    this.eat(Tokenizer.TokenType.IDENTIFIER); // First parameter
                    while (this.currentToken.type === Tokenizer.TokenType.COMMA) {
                        this.eat(Tokenizer.TokenType.COMMA);
                        parameters.push(this.currentToken.value);
                        this.eat(Tokenizer.TokenType.IDENTIFIER); // Subsequent parameters
                    }
                }
                this.eat(Tokenizer.TokenType.RPAREN); // Consume ')'
                this.eat(Tokenizer.TokenType.COLON); // Consume ':'

                const body = this.parseBlockStatements(); // Parse the function body

                return {
                    type: 'FunctionDefinition',
                    name: functionName,
                    parameters: parameters,
                    body: body, // Array of statements
                };
            }

            // Parses a program, which is a sequence of statements.
            parse() {
                const statements = [];
                // Parse statements until EOF is reached.
                while (this.currentToken.type !== Tokenizer.TokenType.EOF) {
                    try {
                         statements.push(this.parseNextStatement()); // Use the helper for top-level
                    } catch (e) {
                        throw e;
                    }
                }
                return {
                    type: 'Program',
                    body: statements,
                };
            }
        }

        // --- Interpreter (Evaluator) ---
        // The Interpreter takes the AST produced by the Parser and executes it.
        // It maintains an environment (scope) to store variable values.
        class Interpreter {
            constructor() {
                this.globalEnvironment = new Map(); // Stores global variables and function definitions
                this.environmentStack = [this.globalEnvironment]; // Stack for managing scopes
                this.outputLog = []; // Stores the output from 'print' statements.
            }

            // Helper to get the current active environment.
            get currentEnvironment() {
                return this.environmentStack[this.environmentStack.length - 1];
            }

            // Resets the interpreter's state for a new run.
            reset() {
                this.globalEnvironment.clear();
                this.environmentStack = [this.globalEnvironment]; // Reset to only global scope
                this.outputLog = [];
            }

            // Adds a message to the output log.
            log(message, isError = false) {
                this.outputLog.push({ message, isError });
            }

            // Visits an AST node and dispatches to the appropriate evaluation method.
            visit(node) {
                const methodName = `visit${node.type}`;
                if (typeof this[methodName] === 'function') {
                    return this[methodName](node);
                } else {
                    throw new Error(`Interpreter Error: No visitor method for node type: ${node.type}`);
                }
            }

            // Visits a 'Program' node, executing each statement in its body.
            visitProgram(node) {
                for (const statement of node.body) {
                    this.visit(statement);
                }
                return this.outputLog;
            }

            // Visits a 'Number' node, returning its numerical value.
            visitNumber(node) {
                return node.value;
            }

            // Visits a 'BooleanLiteral' node, returning its boolean value.
            visitBooleanLiteral(node) {
                return node.value; // node.value is already true or false
            }

            // Visits an 'Identifier' node, returning its value from the current environment.
            // It searches up the scope chain if not found in the immediate scope.
            visitIdentifier(node) {
                // Search up the environment stack (from current to global)
                for (let i = this.environmentStack.length - 1; i >= 0; i--) {
                    if (this.environmentStack[i].has(node.name)) {
                        return this.environmentStack[i].get(node.name);
                    }
                }
                throw new Error(`Interpreter Error: Undefined variable or function '${node.name}'`);
            }

            // Visits a 'BinaryOp' node, performing the arithmetic operation.
            visitBinaryOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                // Type checking for arithmetic operations
                if (typeof left !== 'number' || typeof right !== 'number') {
                    throw new Error(`Interpreter Error: Arithmetic operation '${node.operator}' expects numbers, but got ${typeof left} and ${typeof right}`);
                }

                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/':
                        if (right === 0) {
                            throw new Error("Interpreter Error: Division by zero");
                        }
                        return left / right;
                    default:
                        throw new Error(`Interpreter Error: Unknown arithmetic operator: ${node.operator}`);
                }
            }

            // Visits a 'ComparisonOp' node, performing the comparison operation.
            visitComparisonOp(node) {
                const left = this.visit(node.left);
                const right = this.visit(node.right);

                // For simplicity, comparison works across types like JavaScript,
                // but in a strict Python interpreter, you might enforce same types.
                switch (node.operator) {
                    case '==': return left === right;
                    case '!=': return left !== right;
                    case '<': return left < right;
                    case '<=': return left <= right;
                    case '>': return left > right;
                    case '>=': return left >= right;
                    default:
                        throw new Error(`Interpreter Error: Unknown comparison operator: ${node.operator}`);
                }
            }

            // Visits a 'LogicalOp' node, performing the logical operation.
            visitLogicalOp(node) {
                if (node.operator === 'not') {
                    const operand = this.visit(node.operand);
                    return !operand; // Converts operand to boolean for 'not'
                } else if (node.operator === 'and') {
                    const left = this.visit(node.left);
                    // Python's 'and' short-circuits: if left is false, return left; else return right.
                    // For simplicity here, we always return a boolean.
                    if (!left) return false;
                    const right = this.visit(node.right);
                    return left && right;
                } else if (node.operator === 'or') {
                    const left = this.visit(node.left);
                    // Python's 'or' short-circuits: if left is true, return left; else return right.
                    // For simplicity here, we always return a boolean.
                    if (left) return true;
                    const right = this.visit(node.right);
                    return left || right;
                } else {
                    throw new Error(`Interpreter Error: Unknown logical operator: ${node.operator}`);
                }
            }

            // Visits an 'AssignmentStatement' node, storing the value in the current environment.
            visitAssignmentStatement(node) {
                const value = this.visit(node.value);
                // Assign to the closest scope where the variable is defined, or the current scope if new.
                let assigned = false;
                for (let i = this.environmentStack.length - 1; i >= 0; i--) {
                    if (this.environmentStack[i].has(node.id.name)) {
                        this.environmentStack[i].set(node.id.name, value);
                        assigned = true;
                        break;
                    }
                }
                if (!assigned) {
                    // If not found in any parent scope, define it in the current scope.
                    this.currentEnvironment.set(node.id.name, value);
                }
            }

            // Visits a 'PrintStatement' node, logging the expression's value to the output.
            visitPrintStatement(node) {
                const valueToPrint = this.visit(node.expression);
                this.log(`Output: ${valueToPrint}`);
            }

            // Visits an 'IfStatement' node, executing the conditional logic.
            visitIfStatement(node) {
                const conditionResult = this.visit(node.condition);

                if (conditionResult) {
                    node.consequent.forEach(stmt => this.visit(stmt));
                } else if (node.alternate && node.alternate.length > 0) {
                    node.alternate.forEach(stmt => this.visit(stmt));
                }
            }

            // Visits a 'WhileStatement' node, executing the loop.
            visitWhileStatement(node) {
                let loopIterations = 0;
                const MAX_ITERATIONS = 1000;

                while (this.visit(node.condition)) {
                    if (loopIterations >= MAX_ITERATIONS) {
                        this.log(`Warning: While loop exceeded ${MAX_ITERATIONS} iterations. Possible infinite loop.`, true);
                        break;
                    }
                    node.body.forEach(stmt => this.visit(stmt));
                    loopIterations++;
                }
            }

            // Visits a 'FunctionDefinition' node. This doesn't execute the function,
            // but rather stores it in the global environment.
            visitFunctionDefinition(node) {
                // Store the function's AST node (or a representation) in the global environment.
                // This 'FunctionObject' captures the function's parameters and body.
                // We store it in global environment as functions are typically defined at top-level.
                this.globalEnvironment.set(node.name, {
                    type: 'FunctionObject',
                    parameters: node.parameters,
                    body: node.body,
                    // Optionally, store the environment where the function was defined (for closures)
                    // For this simple interpreter, we'll assume global environment for now.
                    // lexicalEnvironment: this.currentEnvironment // More complex: for closures
                });
            }

            // Visits a 'CallExpression' node, executing the function.
            visitCallExpression(node) {
                const functionName = node.callee.name;
                const func = this.globalEnvironment.get(functionName); // Get function from global env

                if (!func || func.type !== 'FunctionObject') {
                    throw new Error(`Interpreter Error: Call to undefined or non-function '${functionName}'`);
                }

                if (node.arguments.length !== func.parameters.length) {
                    throw new Error(`Interpreter Error: Function '${functionName}' expects ${func.parameters.length} arguments, but received ${node.arguments.length}`);
                }

                // 1. Evaluate arguments in the current scope
                const evaluatedArgs = node.arguments.map(argNode => this.visit(argNode));

                // 2. Create a new environment for the function's local scope
                const newEnvironment = new Map();

                // 3. Bind arguments to parameters in the new local environment
                func.parameters.forEach((paramName, index) => {
                    newEnvironment.set(paramName, evaluatedArgs[index]);
                });

                // 4. Push the new environment onto the stack (enter function scope)
                this.environmentStack.push(newEnvironment);

                try {
                    // 5. Execute the function body in the new scope
                    func.body.forEach(stmt => this.visit(stmt));
                } finally {
                    // 6. Pop the environment from the stack (exit function scope)
                    this.environmentStack.pop();
                }
            }


            // Interprets the given AST.
            interpret(ast) {
                this.reset(); // Clear previous state
                try {
                    return this.visit(ast);
                } catch (error) {
                    this.log(`Error: ${error.message}`, true);
                    return this.outputLog;
                }
            }
        }

        // --- Main Application Logic ---
        const codeInput = getById('code-input');
        const runButton = getById('run-button');
        const outputDiv = getById('output');

        const interpreter = new Interpreter();

        runButton.addEventListener('click', () => {
            const code = codeInput.value;
            outputDiv.innerHTML = ''; // Clear previous output

            try {
                // 1. Lexing: Convert code string into tokens.
                const tokenizer = new Tokenizer(code);
                const tokens = tokenizer.tokenize();
                // console.log('Tokens:', tokens); // For debugging

                // 2. Parsing: Convert tokens into an Abstract Syntax Tree (AST).
                const parser = new Parser(tokens);
                const ast = parser.parse();
                // console.log('AST:', JSON.stringify(ast, null, 2)); // For debugging

                // 3. Interpreting: Execute the AST.
                const results = interpreter.interpret(ast);

                results.forEach(item => {
                    const p = document.createElement('p');
                    p.classList.add(item.isError ? 'error-message' : 'output-text');
                    p.textContent = item.message;
                    outputDiv.appendChild(p);
                });

            } catch (error) {
                // Catch any errors during lexing, parsing, or interpreting
                const p = document.createElement('p');
                p.classList.add('error-message');
                p.textContent = `Runtime Error: ${error.message}`;
                outputDiv.appendChild(p);
            }
        });

        // Set a default example code
        codeInput.value = `
def greet(name):
    print("Hello, ")
    print(name)

greet("Alice")
greet("Bob")

def add_and_print(a, b):
    result = a + b
    print("Sum: ")
    print(result)

x = 10
y = 5
add_and_print(x, y) # Call with variables
add_and_print(20, 30) # Call with literals

count = 0
def increment_and_print():
    global_val = count + 1 # Access global count
    print("Global count + 1: ")
    print(global_val)
    # This won't change the global 'count' because assignments are local
    # count = 100 # This would create a new local 'count'

increment_and_print()
print("Global count after call: ")
print(count) # Still 0, as assignment inside function is local

def complex_logic(val):
    if val > 10:
        print("Value is large")
        while val > 12:
            print("Still large: ")
            print(val)
            val = val - 1
    else:
        print("Value is small")

complex_logic(15)
complex_logic(5)
`;
    </script>
</body>
</html>
