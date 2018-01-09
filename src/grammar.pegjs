{
    const isString = (v) => typeof v === 'string';
    const makeNumber = (v) => parseFloat([].concat(...v).join(''));
}

ROOT
  = _ root:logicalAnd _ { 
    return {
      __meta__: {
        version: 1
      },
      root
    }   
  }

logicalAnd
  = lhs:logicalOr _ '&' _ rhs:logicalAnd { return { type: 'AND', lhs, rhs } }
  / logicalOr

logicalOr
  = lhs:sequence _ '|' _ rhs:logicalOr { return { type: 'OR', lhs, rhs } }
  / sequence

sequence
  = _ value:(
      head:factor
      tail:(',' _ v:factor _ { return v; })* { return [head].concat(tail) }
    )? _ { return value !== null ? { type: 'SEQUENCE', value} : error('expected one value at least') }

factor
  = '(' _ r:logicalAnd _ ')' { return r; }
  / asPattern

asPattern
  = alias:word '@' value:factor {
    return { 
        ...value,
        alias
      }
  }
  / values

values
  = range
  / rest
  / number
  / boolean
  / string
  / array
  / wildcard
  / object
  / bind
  / typed
  / regex

range
  = _ start:range_item '..' end:range_item _ {
      return { 
        type: 'RANGE', 
        start: isString(start) ? start : makeNumber(start),
        end: isString(end) ? end : makeNumber(end) 
      }
    }

rest
  = _ '...' bind:word? "(" value:values ")" {
    return {
        type: 'REST',
        bind,
        value
    }
  }
  / _ '...' bind:word? {
      return {
        type: 'REST',
        bind 
      }
    }

number
  = _ float _ {
      return {
        type: 'LITERAL',
        value: parseFloat(text())
      }
    }

boolean
  = _ b:(true / false) _ {
      return {
          type: 'LITERAL',
        value: b === 'true' ? true : false
      }
    }

string "string"
  = _ '"' chars:DoubleStringCharacter* '"' _ {
      return {
        type: 'LITERAL',
        value: chars.join("")};
    }
  / _ "'" chars:SingleStringCharacter* "'" _ {
      return {
        type: 'LITERAL',
        value: chars.join("")};
    }

array
  = _ '[' _
    value:(
      head:array_member
      tail:(',' _ v:array_member _ { return v; })*
      { return { type: 'LIST', value: [head].concat(tail) } }
    )?
    _ ']' ':'? typeOf:type? _
    { return value !== null ? Object.assign(value, {typeOf}) : { type: 'LIST', value: [], typeOf } ; }

array_member
  = alias:word '@' v:values { return { ...v, alias } }
  / values

wildcard
  = '_' ':'? typeOf:type? {
      return {
        type: 'WILDCARD', 
        typeOf
      } 
    }

bind
  = bind:word typeOf:typedVar? {
      return {
        type: 'BIND',
        bind,
        typeOf
        }
    }

object
  = _ '{' _
    members:(
      head:object_member
      tail:(_ ',' _ m:object_member { return m; })*
      {

        var result = [];

        [head].concat(tail).forEach(function(element) {
          if(element.rest) { 
            result.push({ type: 'REST', bind: element.bind, key: element.bind, value: element.value })
          } else {
            result.push(Object.assign(element.binding ? { type: 'BIND', bind: element.value, alias: element.alias } : element.value, {key: element.bind, alias: element.alias }));
          }
        });

        return result;
      }
    )?
    _ '}' _
    { return { type: 'OBJECT', value: members !== null ? members : [] }; }

object_member
  = t:rest { return { bind: t.bind, value: t.value, rest: true } }
  / alias:word '@' key:word _ ':' _ value:values { return { bind: key, value: value, alias }; }
  / key:word '@' _ ':' _ value:values { return { bind: key, value: value, alias: key }; }
  / key:word _ ':' _ value:values { return { bind: key, value: value }; }
  / bind:word { return { bind: bind, value: bind, binding: true } }


typed
  = typeOf:type {
    return {
      type: 'WILDCARD',
      typeOf
    }
  }

regex "regular expression"
  = _ '/' r:[a-zA-Z0-9&_\-^{}()\[\],.*\\+?$!:=|]* '/' _ {
    return {
        type: 'REGEXP',
        value: new RegExp(r.join(''))
      }
  }

range_item
  = minus? digit / [a-z] / [A-Z]

reserved
  = type

word "word"
  = !reserved [a-z]i+ {
      return text()
    }

float "number"
  = minus? digit '.'? digit? exp?
  / plus? digit '.'? digit? exp?
  / minus? 'Infinity'
  / plus? 'Infinity'

digit "digit"
  = [0-9]+

e
  = [eE]

exp
  = e (minus / plus)? digit

minus
  = _ '-'

plus
  = _ '+'

true
  = 'true'

false
  = 'false'

typedVar
  = ':' t:type { return t }

instance
  = [A-Z][a-z]+ { return text() }

type
  = 'Boolean'
  / 'String'
  / 'Number'
  / 'Nullable'
  / 'Undefined'
  / 'Null'
  / 'Array'
  / 'Object'
  / 'Function'
  / 'RegExp'
  / 'Date'
  / 'NaN'
  / instance

DoubleStringCharacter
  = !('"' / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
  = !("'" / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b";   }
  / "f"  { return "\f";   }
  / "n"  { return "\n";   }
  / "r"  { return "\r";   }
  / "t"  { return "\t";   }
  / "v"  { return "\x0B"; }

// optional whitespace
_ "whitespace"
  = [ \t\r\n]*

// mandatory whitespace
__ "whitespace"
  = [ \t\r\n]+