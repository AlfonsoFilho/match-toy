# Match-toy + Redux Todos Example


This is an example of a todo app built with redux. The original code was copied from [redux repo](https://github.com/reactjs/redux/tree/master/examples/todos) then refactored using match-toy.

## Run the example
First install the dependencies:
```sh
$ npm install
```
Then start the server:
```sh
$ npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Where Match-toy was used:
Please, take a look at the source code to check out the changes:
- [Todos Reducer](./src/reducers/todos.js#L30)
- [VisibilityFilter Reducer](./src/reducers/visibilityFilter.js#L16)
- [VisibleTodoList Container](./src/containers/VisibleTodoList.js#L23)