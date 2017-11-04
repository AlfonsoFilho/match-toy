AST = ws ast:root ws { return {
  __meta__: {
    version: 1
  },
	root: ast
} }


dot             = '.'
digit           = [0-9]+
float           = minus? digit dot? digit?
rest_symbol     = '...'
rest            = ws rest_symbol b:word? { return { type: 'REST', name: b } }
range_symbol    = '..'
range           = ws start:digit range_symbol end:digit ws { return { type: 'RANGE', start: parseInt(start.join(''), 10), end: parseInt(end.join(''), 10) } }
colon           = ':'
and             = ws '&' ws
or              = ws '|' ws
minus           = ws '-'
comma           = ws ',' ws
quote           = '"'
true            = 'true'
false           = ws 'false' ws
as              = ws 'as' ws
bracket_open    = ws '[' ws
bracket_close   = ws ']' ws
curly_open      = ws '{' ws
curly_close     = ws '}' ws
word            = [a-z]+ { return text() }
type_bool       = 'Boolean'
type_string     = 'String'
type_number     = 'Number'
type_undefined  = 'Undefined'
type_null       = 'Null'
type_array      = 'Array'
type_object     = 'Object'
type_function   = 'Function'
type_nullable   = 'Nullable'
instance        = [A-Z][a-z]+ { return text() }
ws              = [ \s\n\r\t ]*
name_separator  = ws colon ws
value_separator = ws comma ws
type            = type_bool / type_string / type_number / type_nullable / type_undefined / type_null / type_array / type_object / type_function / instance

typed           = t:type { return { type: 'WILDCARD', typeOf: t }  }
wildcard_symbol = '_'
wildcard        = wildcard_symbol colon? t:type? { return { type: 'WILDCARD', typeOf: t } }

number = float {
	return {
    type: 'LITERAL',
    value: parseFloat(text())
    }
}

boolean = b:(true / false) {
	return {
    	type: 'LITERAL',
        value: b === 'true' ? true : false
    }
}

bind = b:word colon? t:type? { return { type: 'BIND', value: b, typeOf: t } }

array
  = bracket_open
    values:(
      head:values
      tail:(comma ws v:values ws { return v; })*
      { return { type: 'LIST', values: [head].concat(tail) } }
    )?
    bracket_close colon? t:type?
{ return values !== null ? Object.assign(values, {typeOf: t}) : { type: 'LIST', values: [], typeOf: t } ; }


string "string"
  = quote chars:char* quote { return {
  type: 'LITERAL',
  value: chars.join("")};
 }

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

DIGIT  = [0-9]
HEXDIG = [0-9a-f]i


//------

object
  = curly_open
    members:(
      head:member
      tail:(value_separator m:member { return m; })*
      {
      
      	var result = [];

        [head].concat(tail).forEach(function(element) {
          result.push(Object.assign(element.bind ? { type: 'BIND', value: element.value } : element.value, {key: element.name}));
        });

        return result;
      }
    )?
    curly_close
    { return { type: 'OBJECT', values: members !== null ? members : [] }; }

member
  = name:word name_separator value:values { return { name: name, value: value }; }
  / name:word { return { name: name, value: name, bind: true } }

asOp = left:andOp as right:bind { return { type: 'AS', value: left, name: right.value } }
     / andOp
     / arguments

andOp = left:orOp and right:andOp { return { type: 'AND', lhs: left, rhs: right } }
     / orOp
     / arguments

orOp = left:arguments or right:orOp { return { type: 'OR', lhs: left, rhs: right } }
    / arguments


values = range / rest / number / boolean / string / array / wildcard / object / bind / typed

arguments
  =  val:(
      head:values
      tail:(comma ws v:values ws { return v; })*
      { return  [head].concat(tail) }
    )?
{  return val !== null ? { type: 'ARGUMENTS', values: val} : error('Expected a literal or variable definition here.') }

root = asOp