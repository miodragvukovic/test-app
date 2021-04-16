import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentUser: null,
    posts: [],
    comments: []
  },
  mutations: {
    SET_LOGGED_IN_USER(state, status) {
      state.currentUser = status
    },
    GENERATE_POSTS(state, posts) {
      state.posts = posts
    },
    GENERATE_COMMENTS(state, comments) {
      state.comments = comments
    }
  },
  actions: {
    setCurrentUser(context, payload) {
      context.commit('SET_LOGGED_IN_USER', payload)
    },
    async getPosts(context) {
      const posts = []
      const comments = []
      await axios.get(process.env.VUE_APP_POSTS).then(res => {
        res.data.filter(post => post.type === 'post' ? posts.push(post) : comments.push(post))
        posts.sort((a, b) => b.timestamp - a.timestamp)
        comments.sort((a, b) => b.timestamp - a.timestamp)
        context.commit('GENERATE_POSTS', posts)
        context.commit('GENERATE_COMMENTS', comments)
      })
    }
  },
  modules: {
  }
})
