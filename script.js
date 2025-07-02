const inputBox = document.getElementById('inputBox');
const buttons = document.querySelectorAll('.button');
let expression = '';
let lastAnswer = '';

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function safeEval(expr) {
    // Replace constants
    expr = expr.replace(/π/g, 'Math.PI')
               .replace(/e/g, 'Math.E')
               .replace(/Ans/g, lastAnswer || '0');
    // Replace functions
    expr = expr.replace(/(\d+)!/g, (_, n) => `factorial(${n})`)
               .replace(/√/g, 'Math.sqrt')
               .replace(/sin\(/g, 'Math.sin(')
               .replace(/cos\(/g, 'Math.cos(')
               .replace(/tan\(/g, 'Math.tan(')
               .replace(/ln\(/g, 'Math.log(')
               .replace(/log\(/g, 'Math.log10(')
               .replace(/abs\(/g, 'Math.abs(')
               .replace(/exp\(/g, 'Math.exp(');
    // Replace power operator
    expr = expr.replace(/(\d+(\.\d+)?)\^(\d+(\.\d+)?)/g, 'Math.pow($1,$3)');
    // Replace percentage
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    // Remove unsupported characters
    return expr;
}

buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const val = e.target.innerText;

        if (val === 'AC') {
            expression = '';
            inputBox.value = '';
        } else if (val === 'DEL') {
            expression = expression.slice(0, -1);
            inputBox.value = expression;
        } else if (val === '=') {
            try {
                let evalExpr = safeEval(expression);
                // eslint-disable-next-line no-eval
                let result = eval(evalExpr);
                if (typeof result === 'number' && !isNaN(result)) {
                    result = Math.round(result * 1e10) / 1e10; // limit decimals
                    inputBox.value = result;
                    lastAnswer = result;
                    expression = '' + result;
                } else {
                    inputBox.value = 'Error';
                    expression = '';
                }
            } catch {
                inputBox.value = 'Error';
                expression = '';
            }
        } else if (val === 'Ans') {
            expression += lastAnswer || '';
            inputBox.value = expression;
        } else if (val === 'π' || val === 'e') {
            expression += val;
            inputBox.value = expression;
        } else if (val === 'sin' || val === 'cos' || val === 'tan' || val === 'ln' || val === 'log' || val === 'abs' || val === 'exp' || val === '√') {
            expression += val + '(';
            inputBox.value = expression;
        } else if (val === '^' || val === '!') {
            expression += val;
            inputBox.value = expression;
        } else if (val === '(' || val === ')') {
            expression += val;
            inputBox.value = expression;
        } else {
            expression += val;
            inputBox.value = expression;
        }
    });
});

// Polyfill for Math.log10 for older browsers
if (!Math.log10) {
    Math.log10 = function(x) {
        return Math.log(x) / Math.LN10;
    };
}
window.factorial = factorial;

// Responsiveness is handled via CSS media queries in style.css

// Voice recognition system
const micBtn = document.getElementById('micBtn');
const voiceStatus = document.getElementById('voiceStatus');

let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    micBtn.addEventListener('click', () => {
        voiceStatus.textContent = "Listening...";
        recognition.start();
    });

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript.trim().toLowerCase();
        voiceStatus.textContent = "Heard: " + transcript;
        // Try to extract calculation from speech
        // Example: "2 plus 2", "add 5 and 7", "what is 10 divided by 2"
        let spoken = transcript
            .replace(/plus/gi, '+')
            .replace(/add/gi, '+')
            .replace(/minus/gi, '-')
            .replace(/subtract/gi, '-')
            .replace(/times|multiply|multiplied by/gi, '*')
            .replace(/x/gi, '*')
            .replace(/divide|divided by/gi, '/')
            .replace(/by/gi, '/')
            .replace(/into/gi, '*')
            .replace(/power|to the power of/gi, '^')
            .replace(/modulo|modulus|mod/gi, '%')
            .replace(/pi/gi, 'π')
            .replace(/e\b/gi, 'e')
            .replace(/square root of/gi, '√')
            .replace(/factorial of/gi, '!')
            .replace(/open bracket/gi, '(')
            .replace(/close bracket/gi, ')')
            .replace(/answer|ans/gi, 'Ans')
            .replace(/point/gi, '.')
            .replace(/ /g, '');

        // Only allow numbers, operators, and supported symbols
        if (/^[0-9+\-*/^%.()πe√!Ans]+$/i.test(spoken)) {
            expression = spoken;
            inputBox.value = expression;
            // Auto-calculate
            try {
                let evalExpr = safeEval(expression);
                let result = eval(evalExpr);
                if (typeof result === 'number' && !isNaN(result)) {
                    result = Math.round(result * 1e10) / 1e10;
                    inputBox.value = result;
                    lastAnswer = result;
                    expression = '' + result;
                    voiceStatus.textContent = "Result: " + result;
                } else {
                    inputBox.value = 'Error';
                    expression = '';
                    voiceStatus.textContent = "Could not calculate.";
                }
            } catch {
                inputBox.value = 'Error';
                expression = '';
                voiceStatus.textContent = "Could not calculate.";
            }
        } else {
            voiceStatus.textContent = "Sorry, couldn't understand.";
        }
    };

    recognition.onerror = function(event) {
        voiceStatus.textContent = "Voice error: " + event.error;
    };
} else {
    micBtn.style.display = "none";
    voiceStatus.textContent = "Voice not supported";
}