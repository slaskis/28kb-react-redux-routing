
export const reducer = {
  boot(state, action) {
    console.log('boot', state, action)
    return action
  },

  articles: {
    add(state, action) {
      console.log('adding to articles', state, action)
      return state.concat(action)
    }
  }
}