const initialState = {
  isLoading: false
}

// When service is not end, it means 'now loading...'
const pageStatus = (state = initialState, action = {}) => {
  if (action.type !== 'CALL_SERVICE') {
    return state
  }

  return { ...state, isLoading: (action.meta.serviceState !== 'END') }
}

export default pageStatus
