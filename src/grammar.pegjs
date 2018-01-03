  {
  const isString = (v) => typeof v === 'string';
  const makeNumber = (v) => parseFloat([].concat(...v).join(''));
  }

  ROOT
    = _ root:asOp _ { 
      return {
        __meta__: {
          version: 1
        },
        root
      }   
    }

  asOp
    = lhs:logicalAnd _ 'as' __ rhs:word { return { type: 'AS', value: lhs, name: rhs } }
    / logicalAnd

  logicalAnd
    = lhs:logicalOr _ '&' _ rhs:logicalAnd { return { type: 'AND', lhs, rhs } }
    / logicalOr

  logicalOr
    = lhs:arguments _ '|' _ rhs:logicalOr { return { type: 'OR', lhs, rhs } }
    / arguments

  arguments
    = _ values:(
        head:factor
        tail:(',' _ v:factor _ { return v; })* { return [head].concat(tail) }
      )? _ { return values !== null ? { type: 'ARGUMENTS', values} : text() }

  factor
    = '(' _ r:logicalAnd _ ')' { return r; }
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
    = _ '...' name:word? "(" values:values ")" {
      return {
          type: 'REST',
          name,
          values
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
    = _ '"' chars:char* '"' _ {
        return {
          type: 'LITERAL',
          value: chars.join("")};
      }

  array
    = _ '[' _
      values:(
        head:values
        tail:(',' _ v:values _ { return v; })*
        { return { type: 'LIST', values: [head].concat(tail) } }
      )?
      _ ']' ':'? typeOf:type? _
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
    = _ '{' _
      members:(
        head:member
        tail:(_ ',' _ m:member { return m; })*
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
      _ '}' _
      { return { type: 'OBJECT', values: members !== null ? members : [] }; }

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
    = t:rest { return { name: t.name, values: t.values, rest: true } }
    / name:word _ ':' _ value:values { return { name: name, value: value }; }
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

  COMMA
    = ','
  // optional whitespace
  _ "whitespace"
    = [ \t\r\n]*

  // mandatory whitespace
  __ "whitespace"
    = [ \t\r\n]+