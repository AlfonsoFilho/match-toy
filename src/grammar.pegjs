  {
  const isString = (v) => typeof v === 'string';
  const makeNumber = (v) => parseFloat([].concat(...v).join(''));
  }

  ROOT
    = ws root:asOp ws { 
      return {
        __meta__: {
          version: 1
        },
        root
      }   
    }



  asOp
    = lhs:logicalAnd ws 'as' ws rhs:word { return { type: 'AS', value: lhs, name: rhs } }
    / logicalAnd

  logicalAnd
    = lhs:logicalOr ws '&' ws rhs:logicalAnd { return { type: 'AND', lhs, rhs } }
    / logicalOr

  logicalOr
    = lhs:arguments ws '|' ws rhs:logicalOr { return { type: 'OR', lhs, rhs } }
    / arguments

  arguments
    = values:(
        head:factor
        tail:(',' ws v:factor ws { return v; })* { return [head].concat(tail) }
      )? { return values !== null ? { type: 'ARGUMENTS', values} : text() }

  factor
    = '(' ws r:logicalAnd ws ')' { return r; }
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
    = ws start:range_item '..' end:range_item ws {
        return { 
          type: 'RANGE', 
          start: isString(start) ? start : makeNumber(start),
          end: isString(end) ? end : makeNumber(end) 
        }
      }

  rest
    = ws '...' name:word? "(" values:values ")" {
      return {
          type: 'REST',
          name,
          values
      }
    }
    / ws '...' name:word? {
        return {
          type: 'REST',
          name 
        }
      }

  number
    = ws float ws {
        return {
          type: 'LITERAL',
          value: parseFloat(text())
        }
      }

  boolean
    = ws b:(true / false) ws {
        return {
            type: 'LITERAL',
          value: b === 'true' ? true : false
        }
      }

  string "string"
    = ws '"' chars:char* '"' ws {
        return {
          type: 'LITERAL',
          value: chars.join("")};
      }

  array
    = ws '[' ws
      values:(
        head:values
        tail:(',' ws v:values ws { return v; })*
        { return { type: 'LIST', values: [head].concat(tail) } }
      )?
      ws ']' ':'? typeOf:type? ws
      { return values !== null ? Object.assign(values, {typeOf}) : { type: 'LIST', values: [], typeOf } ; }

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
    = ws '{' ws
      members:(
        head:member
        tail:(ws ',' ws m:member { return m; })*
        {

          var result = [];

          [head].concat(tail).forEach(function(element) {
            if(element.rest) { 
              result.push({ type: 'REST', name: element.name, key: element.name, values: element.values })
            } else {
              result.push(Object.assign(element.bind ? { type: 'BIND', value: element.value } : element.value, {key: element.name}));
            }
          });

          return result;
        }
      )?
      ws '}' ws
      { return { type: 'OBJECT', values: members !== null ? members : [] }; }

  typed
    = typeOf:type {
      return {
        type: 'WILDCARD',
        typeOf
      }
    }
  
  regex "regular expression"
    = ws '/' r:[a-zA-Z0-9&_\-^{}()\[\],.*\\+?$!:=|]* '/' ws {
    	return {
          type: 'REGEXP',
          value: new RegExp(r.join(''));
        }
    }



  member
    = t:rest { return { name: t.name, values: t.values, rest: true } }
    / name:word ws ':' ws value:values { return { name: name, value: value }; }
    / name:word { return { name: name, value: name, bind: true } }

  range_item
    = minus? digit / [a-z] / [A-Z]

  reserved
    = 'as' [ \s\n\r\t ]+
    / 'as' ','
    / type

  word "word"
    = !reserved [a-z]i+ {
        return text()
      }

  float "number"
    = minus? digit '.'? digit?

  digit "digit"
    = [0-9]+

  minus
    = ws '-'

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

  char
    = unescaped
    / escape
      sequence:(
          '"'
        / "\\"
        / "/"
        / "b" { return "\b"; }
        / "f" { return "\f"; }
        / "n" { return "\n"; }
        / "r" { return "\r"; }
        / "t" { return "\t"; }
        / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
            return String.fromCharCode(parseInt(digits, 16));
          }
      )
      { return sequence; }

  escape
    = "\\"

  unescaped
    = [^\0-\x1F\x22\x5C]

  HEXDIG
    = [0-9a-f]i

  ws "whitespace"
    = [ \s\n\r\t ]*