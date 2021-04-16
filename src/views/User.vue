<template>
  <main class="main">
		<div class="container">
			<h1>{{userData.username}}</h1>
			<h2>Recent posts:</h2>
			<div class="card" v-for="post of userData.posts" :key="`post-${post.id}`">
				<h3>{{post.title}}</h3>
				<p>{{post.description}}</p>
			</div>
		</div>
	</main>
</template>

<script>
import axios from 'axios'
export default {
	data() {
		return {
			id: this.$route.params.id,
			userData: {
				username: '',
				posts: []
			}
		}
	},
	methods: {

		// INITIAL METHOD FOR USER SEARCH
		initUser() {
			axios.get(`${process.env.VUE_APP_USERS}/${this.id}`).then(res => {
				this.userData.username = res.data.username

				// IF USER IS FIND, GET HIS DATA
				this.initUserData()
			})
		},

		// METHOD FOR GETTING USER INFO AND USER DATA FALLBACK IF LS IS EMPTY
		initUserData() {
			if (this.$store.state.posts) {
				this.userData.posts = this.$store.state.posts.filter(post => post.authorId === this.id)
			}
			// FALLBACK IF LOCAL STORAGE IS NOT UPDATED
			else {
				axios.get(process.env.VUE_APP_POSTS).then(res => {
					this.userData.posts = res.data.filter(post => post.authorId === this.id && post.type === 'post')
				})
			}
		}
	},
	created() {
		this.initUser()
	}
}
</script>

<style lang="scss" scoped>
	h1, h2 {
		margin-bottom: 25px;
	}
	.card {
    padding: 30px 20px;
    background-color: #fff;
    box-shadow: 0px 0px 15px 0px rgba(19,3,136,0.5);
    border-radius: 25px;
		margin-bottom: 20px;
		&:last-child {
			margin-bottom: 0;
		}
  }
</style>