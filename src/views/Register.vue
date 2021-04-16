<template>
  <div class="main">
    <div class="container">
      <div class="flex justify-center align-center">
        <form class="flex column">
          <input class="default-text-input mr-0" v-model="userData.username" type="text" placeholder="Enter a username">
          <input class="default-text-input mr-0" v-model="userData.password" type="password" placeholder="Enter a password">
          <input class="btn mb-0 mr-0" @click="checkUserNameAvailability($event)" type="submit" value="Register">
          <div class="register-lower flex align-center justify-center">
            <span v-if="errorMessage">{{errorMessage}}</span>
            <div class="flex column" v-if="showLoginLink">
              <span>Successfully Registered</span>
              <router-link class="btn" to="/login">Go to Login page</router-link>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      userData: {
        username: '',
        password: ''
      },
      errorMessage: false,
      showLoginLink: false
    }
  },
  methods: {

    // CHECK IF USERNAME IS NOT TAKEN
    checkUserNameAvailability(e) {
      e.preventDefault()

      // CHECK IF USERNAME OR PASSWORD ARE NOT EMPTY STRINGS
      if (this.userData.username && this.userData.password) {
        axios.get(process.env.VUE_APP_USERS).then(res => {

          // LOOP THROUGH USERS TO CHECK FOR USERNAME
          const userExists = res.data.find(user => user.username === this.userData.username)

          // IF USERNAME IS TAKEN, SHOW ERROR MESSAGE, OTHERWISE INIT REGISTRATION METHOD
          userExists ? this.errorMessage = 'Username already exist' : this.registerUser()
        })
      }

      // IF USERNAME OR PASSWORD ARE EMPTY STRINGS, SHOW ERROR MESSAGE
      else
        this.errorMessage = 'Please enter username and password'
    },
    // INIT REGISTER USER METHOD
    registerUser() {

      // CLEAR ERROR MESSAGE
      this.errorMessage = false

      // POST REQUEST WITH USERNAME AND PASSWORD PARAMS
      axios.post(process.env.VUE_APP_USERS,
      {
        username: this.userData.username,
        password: this.userData.password
      }
      ).then(resp => {
        console.log(resp.data)

        // SHOW LINK TO LOGIN PAGE
        this.showLoginLink = true
      }).catch(error => {
          console.log(error)
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .main  {
    form {
      margin-top: 100px;
      padding: 40px 30px;
      box-shadow: 0px 0px 15px 0px rgba(19,3,136,0.5);
      border-radius: 25px;
      input {
        width: 100%;
        margin-bottom: 25px;
        &.mb-0 {
          margin-bottom: 0;
        }
      }
    }
  }
  .register-lower {
    > div {
      width: 100%;
      span {
        margin-top: 15px;
      }
    }
    span {
      text-align: center;
      margin-bottom: 20px;
    }
    a {
      margin: 0;
      width: 100%;
      text-align: center;
    }
  }
</style>