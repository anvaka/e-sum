// Arithmetics Grammar

Expression
  = _ head:Term tail:(_ ("+" / "-") _ Term)* _ {
      return tail.reduce(function(result, element) {
        if (element[1] === "+") { return result +'.plus(' + element[3] + ')'; }
        if (element[1] === "-") { return result + '.minus(' + element[3] + ')'; }
      }, head);
    }

Term
  = head:Factor tail:(_ ("*" / "/" / "^") _ Factor)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "*") { return result + '.times(' + element[3] + ')'; }
        if (element[1] === "/") { return result + '.div(' + element[3] +')'; }
        if (element[1] === "^") { return result + '.pow(' + element[3] + ')'; }
      }, head);
    }

Factor
  = "(" _ expr:Expression _ ")" { return '(' + expr + ')'; }
  / s:Number { return 'Decimal(' + s + ')'; }
  / trig
  / power

power = (log / ln / exp / pow)

log = "log(" v:Expression ws ")"
  { return v+".log()"; }

ln = "ln(" v:Expression ws ")"
  { return v+".ln()"; }

exp = "exp(" v:Expression ws ")"
  { return v+".exp()"; }

pow = "pow(" ws base:Expression ws', 'ws exponent:Expression ')'
  { return  base + '.pow(' + exponent +')'; }

trig = (sin / cos / tan / sec / csc / cot)

sin = "sin(" v:Expression ws ")"
  { return v+".sin()"; }

cos = "cos(" v:Expression ws ")"
  { return v+".cos()"; }

tan = "tan(" v:Expression ws ")"
  { return v+".tan()"; }

sec = "sec(" v:Expression ws ")"
  { return "Decimal(1).div(" + v + ".cos())"; }

csc = "csc(" v:Expression ws ")"
  { return "Decimal(1).div("+v+".sin()"; }

cot = "cot(" v:Expression ws ")"
  { return "Decimal(1).div("+v+".tan())"; }

root = (sqrt)

sqrt = "sqrt(" v:Expression ws ")"
  { return v + ".sqrt()"; }
  
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

Constant = sign:Sign? _ v:(E / Pi) 
  { return (sign === '-' ? v + '.neg()' : '') + v}

E = ('e' / 'E' )
  { return "Decimal.E"; }

Pi = ('Pi' / 'pi' / 'PI' )
  { return "Decimal.PI"; }
  
Variable = sign:Sign?_ [xX]
  { return (sign ? sign : '') + "x"; }
  
_ "whitespace"
  = [ \t\n\r]*

ws "whitespace"
  = [ \t\n\r]*
              