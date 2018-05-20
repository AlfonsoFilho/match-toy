import { match } from 'match-toy';

/*
// Original code
const todos = (state = [], action) => {

  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    case 'TOGGLE_TODO':
      return state.map(todo =>
        (todo.id === action.id) 
          ? {...todo, completed: !todo.completed}
          : todo
      )
    default:
      return state
  }
}
*/

// Refactored using Match-toy
const todos = match
  .case('state, { type: "ADD_TODO", id, text }', ({ state = [], id, text }) => [...state, { id, text, completed: false }])
  .case('state, { type: "TOGGLE_TODO", id }', ({ state = [], id }) => state.map(todo =>
    (todo.id === id)
      ? { ...todo, completed: !todo.completed }
      : todo))
  .case('state, _', ({ state = [] }) => state)
  .end()

export default todos
