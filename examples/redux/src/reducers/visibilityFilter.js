import { match } from 'match-ish';

/*
// Original code
const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}
*/

// Refactored using Match-ish
const visibilityFilter = match()
  .with('state, { type: "SET_VISIBILITY_FILTER", filter }', ({filter}) => filter)
  .with('state, _', ({state = 'SHOW_ALL'}) => state)
  .end()

export default visibilityFilter
