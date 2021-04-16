<template>
	<main class="main">
		<div class="container">
			<h2>Search results for: {{this.$route.query.q}}</h2>
			<div v-if="searchResults.length">
				<div v-for="user of searchResults" :key="`user-${user.id}`">
					<h2>
						<router-link :to="`/user/${user.id}`">
							{{user.username}}
						</router-link>
					</h2>
				</div>
			</div>
			<h2 v-else>There are no results</h2>
		</div>
	</main>
</template>

<script>
import axios from 'axios'
export default {
	data() {
		return {
			searchVal: this.$route.query.q,
			searchResults: []
		}
	},
	methods: {

		// MAIN SEARCH METHOD
		async searchForUsers(param) {
			await axios.get(process.env.VUE_APP_USERS).then(res => {
				this.searchResults = res.data.filter(user => user.username.toLowerCase().includes(param.toLowerCase()))
			})
		}
	},
	created() {

		// INTIAL USER SERACH
		this.searchForUsers(this.searchVal)
	},
	watch: {

		// WATCHER FOR ROUTE CHANGES
		$route(newvalue) {
			this.searchForUsers(newvalue.query.q)
		}
	}
}
</script>

<style lang="scss" scoped>
	h2 {
		margin-bottom: 25px;
			a {
			text-decoration: none;
			color: #737373;
			margin-bottom: 15px;
		}
	}
</style>