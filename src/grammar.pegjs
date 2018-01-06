{
    const isString = (v) => typeof v === 'string';
    const makeNumber = (v) => parseFloat([].concat(...v).join(''));
    const boundVars = [];
    const addVariable = (name) => {
    console.log(name, boundVars, boundVars.indexOf(name))
      if (boundVars.indexOf(name) === -1) {
        boundVars.push(name);
        return true;
      } else {
        return false;
      }
    }
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

  asPattern
    = name:word '@' value:factor {
    	return { 
        	...value,
        	name
        }
    }
    / values

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
      )? _ { return value !== null ? { type: 'SEQUENCE', value} : text() }

  factor
    = '(' _ r:logicalAnd _ ')' { return r; }
    / asPattern




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
    = _ '...' name:word? "(" value:logicalAnd ")" {
      return {
          type: 'REST',
          name,
          value
      }
    }
    / _ '...' name:word? {
        return {
          type: 'REST',
          name 
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
    = name:word '@' v:values { return { ...v, name } }
    / values

  wildcard
    = '_' ':'? typeOf:type? {
        return {
          type: 'WILDCARD', 
          typeOf
        } 
      }

  bind
    = value:word typeOf:typedVar? {
        return {
          type: 'BIND',
          value,
          typeOf
          }
      }

  object
    = _ '{' _
      members:(
        head:member
        tail:(_ ',' _ m:member { return m; })*
        {

          var result = [];

          [head].concat(tail).forEach(function(element) {
            if(element.rest) { 
              result.push({ type: 'REST', name: element.name, key: element.name, value: element.value })
            } else {
              result.push(Object.assign(element.bind ? { type: 'BIND', value: element.value } : element.value, {key: element.name}));
            }
          });

          return result;
        }
      )?
      _ '}' _
      { return { type: 'OBJECT', value: members !== null ? members : [] }; }

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



  member
    = t:rest { return { name: t.name, value: t.value, rest: true } }
    / name:word _ ':' _ value:values { return { name: name, value: value }; }
    / name:word { return { name: name, value: name, bind: true } }

  range_item
    = minus? digit / [a-z] / [A-Z]

  reserved
    = type

  word "word"
    = !reserved [a-z]i+ {
        return text()
      }

  float "number"
    = minus? digit '.'? digit?

  digit "digit"
    = [0-9]+

  minus
    = _ '-'

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