/* https://medium.com/@javierwchavarri/building-the-super-tiny-compiler-with-reason-part-1-21460cd4ae7b */
[@bs.deriving jsConverter]
type token =
  | WS
  | DIGIT
  | WORD(string)
  | EOF;

let getTokenString = token =>
  switch (token) {
  | WORD(_) => "WORD"
  | _ => "NON"
  };

let tokenize = input => {
  let rec tok = (input, current, tokens) =>
    switch (input) {
    | [] => List.rev(tokens)
    | _ =>
      let head = List.hd(input);
      let tail = List.tl(input);
      let next = tok(tail);
      switch (head, current, tokens) {
      | (' ' | '\t' | '\n' | '\r', None, t) => next(None, t)
      | (',', None, t) => next(None, t)
      | ('a'..'z' as i, None, t) => next(Some(WORD(String.make(1, i))), t)
      | ('a'..'z' as i, Some(WORD(c)), t) =>
        next(Some(WORD(c ++ String.make(1, i))), t)
      | (' ' | '\000', Some(WORD(c)), t) => next(None, [WORD(c), ...t])
      /* Error */
      | (_, _, t) => List.rev(t)
      };
    };
  tok(input, None, []);
};

type node_type =
  | LITERAL
  | REST;

type ast_node = {
  type_: node_type,
  /* start: int,
     end_: int,
     value: string,
     bind: string,
     alias: string,
     key: string,
     lhs: ast_node,
     rhs: ast_node, */
};

[@bs.deriving jsConverter]
type ast = {root: ast_node};

let parser = (tokens: list(token)) => {
  let walk = () => {};
  let ast = {
    root: {
      type_: LITERAL,
    },
  };
  ast;
};

let log = (msg: string, value) => {
  Js.log(msg);
  Js.log(value);
  value;
};

let logToken = value => {
  log("TOKEN", value);
  value;
};

let appendEOF = list => List.append(list, ['\000']);

let lexer = (code: string) =>
  code
  /* |> log("code") */
  |> Utils.split
  |> appendEOF
  |> tokenize
  |> log("tokens");

/* [%bs.obj { value }] */
let compile = code =>
  code |> lexer |> logToken |> parser |> astToJs |> log("ast");
/* Js.log(compile("x, y, 1")); */