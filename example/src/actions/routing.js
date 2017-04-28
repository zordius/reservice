// All action creators should follow Flux Standard Action
// please read https://github.com/acdlite/flux-standard-action
// In most time createActions() is enough for almost every use cases
import { createActions } from 'redux-actions'

export const { setRoute } = createActions('SET_ROUTE')
