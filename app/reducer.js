
export const reducer = {
  boot(state, action) {
    return action
  },

  // TODO why is this necessary? shouldn't the history
  //      middleware take care of this?
  // hmm, this also causes the articles action/reducer to not work
  // '@@redux-routes/navigate': (state, action) => action,

  articles: {
    add(state, action) {
      console.log('adding articles', state, action)
      return state.concat(action)
    }
  }
}