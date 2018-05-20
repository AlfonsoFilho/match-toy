let rec split = (s: string) =>
  switch (s) {
  | "" => []
  | _ => [s.[0], ...split(String.sub(s, 1, String.length(s) - 1))]
  };