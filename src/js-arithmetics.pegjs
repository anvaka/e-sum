// Arithmetics Grammar

Expression
  = _ head:Term tail:(_ ("+" / "-") _ Term)* _ {
      return tail.reduce(function(result, element) {
        if (element[1] === "+") { return result +' + ' + element[3]; }
        if (element[1] === "-") { return result + ' - ' + element[3]; }
      }, head);
    }

Term
  = head:Factor tail:(_ ("*" / "/" / "^" / "%") _ Factor)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "*") { return result + ' * ' + element[3]; }
        if (element[1] === "/") { return result + ' / ' + element[3]; }
        if (element[1] === "^") { return 'Math.pow(' + result + ', ' + element[3] + ')'; }
        if (element[1] === "%") { return result + '%' + element[3]; }
      }, head);
    }

Factor
  = "(" _ expr:Expression _ ")" { return '(' + expr + ')'; }
  / Number
  / trig
  / power
  / root

power = (log / ln / exp / pow / js)

js = 
 "abs(" v:Expression ws ")" { return Math.abs(v); }
/ "ceil(" v:Expression ws ")" { return Math.abs(v); }
/ "floor(" v:Expression ws ")" { return Math.floor(v); }
/ "round(" v:Expression ws ")" { return Math.round(v); }
/ "random(" v:Expression? ws ")" { return 'Math.random()' + (v ? '*' + v : '') ; }

log = "log(" v:Expression ws ")"
  { return "Math.log10(" + v + ")"; }

ln = "ln(" v:Expression ws ")"
  { return "Math.log(" + v + ")"; }

exp = "exp(" v:Expression ws ")"
  { return "Math.exp(" + v + ")"; }

pow = "pow(" ws base:Expression ws', 'ws exponent:Expression ')'
  { return "Math.pow(" + base + ',' + exponent +')'; }

trig = (sin / cos / tan / sec / csc / cot / invtrig)

sin = "sin(" v:Expression ws ")"
  { return "Math.sin(" + v + ")"; }

cos = "cos(" v:Expression ws ")"
  { return "Math.cos(" + v + ")"; }

tan = "tan(" v:Expression ws ")"
  { return "Math.tan(" + v + ")"; }

sec = "sec(" v:Expression ws ")"
  { return "1/Math.cos(" + v + ")"; }

csc = "csc(" v:Expression ws ")"
  { return "1/Math.sin(" + v + ")"; }

cot = "cot(" v:Expression ws ")"
  { return "1/Math.tan(" + v + ")"; }

invtrig = "asin(" v:Expression ws ")" { return "Math.asin(" + v + ")"; }
  / "acos(" v:Expression ws ")" { return "Math.acos(" + v + ")"; }
  / "atan(" v:Expression ws ")" { return "Math.atan(" + v + ")"; }

root = (sqrt)

sqrt = "sqrt(" v:Expression ws ")"
  { return "Math.sqrt(" + v + ")"; }
  
// ==== Numbers ====
Number = s:Scientific
  /s:Integer
  /s:Floating
  /s:Constant
  /s:Variable
  { return s; }
  
Scientific = f:Floating s:( ('e' / 'E' ) Integer )?
  { return f + (s ? s[0] + s[1]: ""); }
Floating = sign:Sign? i:Unsigned u:('.' Unsigned )?
  { return (sign ? sign : '') + i + (u ? u[0] + u[1] : ""); }
Integer = sign:Sign? u:Unsigned
  { return (sign ? sign : '') +u; }
Unsigned = v:([0-9]+)
  { return v.join(""); }
Sign = '-'/'+'

Constant = sign:Sign?_ v:(E / Pi) 
  { return (sign ? sign : '') + v}

E = ('e' / 'E' )
  { return "Math.E"; }

Pi = ('Pi' / 'pi' / 'PI' )
  { return "Math.PI"; }
  
Variable = sign:Sign?_ [xX]
  { return (sign ? sign : '') + "x"; }
  
_ "whitespace"
  = [ \t\n\r]*

ws "whitespace"
  = [ \t\n\r]*
              