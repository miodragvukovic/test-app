<template>
  <div class="main">
		<div class="container">
			<div class="flex justify-center align-center">
				<form class="flex column">
					<input class="default-text-input mr-0" v-model="userData.username" type="text" placeholder="Username">
					<input class="default-text-input mr-0" v-model="userData.password" type="password" placeholder="Password">
					<span v-if="errorMessage">{{errorMessage}}</span>
					<input class="btn mb-0 mr-0" @click="loginValidation($event)" type="submit" value="Login">
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
			errorMessage: false
    }
  },
	methods: {

		// VALIDATE USERNAME AND PASSWORD
		loginValidation(e) {
			e.preventDefault()

			axios.get(process.env.VUE_APP_USERS).then(res => {
        const success = res.data.find(user => (user.username === this.userData.username && user.password === this.userData.password) && user)

				// INIT LOGIN FUNCTION OR DISPLAY BAD CREDENTIALS MESSAGE
				success ? this.initLogin(success) : this.errorMessage = 'Bad credentials'
      })
		},

		// INIT LOGGING IN METHOD
		initLogin(param) {
			this.errorMessage = false

			// SET LOCAL STORAGE USER PARAM TO EQUAL OBJECT ID
			localStorage.user = param.id

			// SET STATE ACTIVE USER
			this.$store.dispatch('setCurrentUser', {
				username: param.username,
				id: param.id
			})

			// REDIRECT TO HOME PAGE
			this.$router.push('/')
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
				&:last-child {
					margin-bottom: 0;
				}
      }
    }
  }

</style>