// All action creators should follow Flux Standard Action
// please read https://github.com/acdlite/flux-standard-action
// In most time createActions() is enough for almost every use cases
// document: https://github.com/acdlite/redux-actions#createactionsactionmap-identityactions
import { createActions } from 'redux-actions'

const actions = createActions('SET_TITLE')
const { setTitle } = actions

export { setTitle }
export default actions
