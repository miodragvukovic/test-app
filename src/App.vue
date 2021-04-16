<template>
  <div id="app">
    <div id="nav" class="padding-vertical-20">
      <div class="container">
        <div class="flex space-between" :class="{'active': showDropdown}">
          <nav class="links flex" @click="showDropdown = false">
            <router-link class="btn" to="/">Home</router-link>
            <router-link class="btn" v-if="!userLoggedIn" to="/register">Register</router-link>
            <router-link class="btn" v-if="!userLoggedIn" to="/login">Login</router-link>
          </nav>
          <div class="flex align-center search-bar">
            <div v-if="userLoggedIn" class="flex align-center">
              <span>Logged in as: <span @click="showDropdown = false"><router-link :to="`/user/${user.id}`">{{`${user.username}`}}</router-link></span></span>
              <button class="btn" @click="logout(), showDropdown = false">Logout</button>
            </div>
            <form class="flex">
              <input class="default-text-input" v-model="searchVal" type="search" placeholder="Search users">
              <input class="btn" type="submit" @click="initSearch($event), showDropdown = false">
            </form>
          </div>
        </div>
        <button @click="toggleDropdown($event)" class="dropdown-trigger">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      user: {},
      userLoggedIn: false,
      searchVal: '',
      showDropdown: false
    }
  },
  methods: {

    // IF LS.USER IS NOT EMPTY, INITIALIZE USER SEARCH
    async initLoggedInStatus() {
      await axios.get(process.env.VUE_APP_USERS).then(res => {
        res.data.find(user => {
          // THIS CONDITION IS PREVENTION FROM SAVING PASSWORD TO ANY DATA PROP OR LOCAL STORAGE
          if (user.id === localStorage.user) {
            this.user.username = user.username
            this.user.id = user.id
            this.$store.dispatch('setCurrentUser', {
              username: user.username,
              id: user.id
            })
          }
        })
      })
    },

    // INIT LOGOUT, REMOVE STATE, REMOVE USER ID FROM LOCAL STORAGE, PUSH ROUTE TO LOGIN PAGE
    logout() {
      localStorage.removeItem('user')
      this.$store.dispatch('setCurrentUser', null)
      this.$router.push('/login')
    },

    // SEARCH METHOD
    initSearch(e) {
      e.preventDefault()
      this.$router.push({path: '/search-results', query: { q : this.searchVal }}).catch(()=> {})
      this.searchVal = ''
    },

    // TOGGLE DROPDOWN
    toggleDropdown(e) {
      e.preventDefault()
      this.showDropdown = !this.showDropdown
    }
  },
  created() {

    // IF THERE IS AN USER ID IN LOCALSTORAGE, INIT HIS DATA
    localStorage.user && this.initLoggedInStatus()

    // INTIAL POST GETTER
    this.$store.dispatch('getPosts')
  },
  computed: {
    ...mapState(['currentUser'])
  },
  watch: {

    // WATCHER FOR USER CHANGES (LOGGED IN/OUT) STATUS
    currentUser(newVal) {
      this.userLoggedIn = !!newVal
      this.user = newVal
    }
  }
}
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

  html, body {
    font-family: 'Roboto', sans-serif;
    background-color: #f9f9f9;
    color: #737373;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .main {
    min-height: calc(100vh - 75px);
  }
  .container {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
  }
  .btn {
    padding: 7px 25px;
    text-decoration: none;
    border: 1px solid #130388;
    margin-right: 10px;
    border-radius: 7px;
    background-color: #130388;
    color: #fff;
    font-size: 14px;
    box-shadow: 0px 0px 5px 0px rgba(19,3,136,0.5);
    cursor: pointer;
    &:visited {
      color: #FFF;
    }
  }
  .dropdown-trigger {
    display: none;
  }
  .default-text-input {
    box-shadow: 0px 0px 5px 0px rgba(19,3,136,0.5);
    padding: 7px 25px;
    border-radius: 7px;
    margin-right: 10px;
    border: 1px solid transparent;
    border: none;
    &:focus,
    &:active {
      border: 1px solid #130388;
      outline: none;
    }
  }
  .flex {
    display: flex;
    &.wrap {
      flex-wrap: wrap;
    }
    &.column {
      flex-direction: column;
    }
    &.space-between {
      justify-content: space-between;
    }
    &.justify-center {
      justify-content: center;
    }
    &.align-center {
      align-items: center;
    }
    &.flex-end {
      justify-content: flex-end;
    }
  }
  .padding-vertical-20 {
    padding: 20px 0;
  }
  .mr-0 {
    margin-right: 0;
  }
  .mb-0 {
    margin-bottom: 0;
  }
  button,
  textarea,
  input {
    &:focus,
    &:active {
      border: 1px solid transparent;
      outline: none;
    }
  }
  #nav {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    background-color: #fff;
    box-shadow: 0px 0px 5px 0px rgba(19,3,136,0.5);
    z-index: 10;
    span {
      margin-right: 10px;
      font-size: 13px;
      > span {
        margin-right: 0;
      }
      a {
        text-decoration: none;
        font-weight: 700;
      }
    }
  }
  .main {
    padding-top: 80px;
  }
  @media (max-width: 768px) {
    #app {
      overflow: hidden;
    }
    #nav {
      background-color: #fff;
      .dropdown-trigger {
        position: relative;
        background-color: transparent;
        border: none;
        display: block;
        height: 30px;
        width: 50px;
        left: calc(100% - 50px);
        cursor: pointer;
        &:before {
          position: absolute;
          content: '';
          height: 4px;
          width: 40px;
          border-radius: 25px;
          top: 13px;
          left: 5px;
          background: #130388;
          transition: .5s ease-out;
        }
        span {
          position: absolute;
          width: 40px;
          height: 4px;
          border-radius: 25px;
          background: #130388;
          left: 5px;
          transition: .5s ease-out;
          &:nth-child(1) {
          top: 0;
          }
          &:nth-child(2) {
            top: 13px;
          }
          &:nth-child(3) {
            top: 26px;
          }
        }
        &.active {
          &:before {
            transform: rotate(-45deg);
          }
          span {
            &:nth-child(1) {
            opacity: 0;
            }
            &:nth-child(2) {
            transform: rotate(45deg);
            }
            &:nth-child(3) {
            opacity: 0;
            }
          }
        }
      }
      > div > div {
        flex-direction: column;
        position: absolute;
        top: 100%;
        z-index: 5;
        background: #fff;
        width: 100%;
        left: 0;
        transform: translate3d(100%, 0, 0);
        padding: 20px;
        opacity: 0;
        transition: .5s ease-out;
        &.active {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }
      }
      .links {
        flex-direction: column;
        a {
          margin-right: 0;
          margin-bottom: 15px;
          text-align: center;
          background-color: #fff;
          color: #130388;
        }
      }
      .search-bar {
        align-items: flex-end;
        flex-direction: column-reverse;
        > form {
          margin-bottom: 15px;
        }
      }
    }
  }
  .main {
    padding-top: 100px;
  }
</style>