<template>
  <main class="main">
    <div v-if="showModal" id="modal">
      <div class="flex justify-center align-center">
        <form v-if="showPostCreation">
          <textarea v-model="userPost.description" placeholder="Whats on your mind?"></textarea>
          <input class="btn" @click="createNewPost($event, 'post', null)" type="submit" value="Post">
          <button @click="toggleModal(), showPostCreation = false" class="close-modal"></button>
        </form>
        <form v-if="showEditPostModal">
          <textarea v-model="editingPost.description"></textarea>
          <input class="btn" @click="updatePost($event), toggleModal()" type="submit" value="Post">
          <button @click="toggleModal(), cancelEdit()" class="close-modal"></button>
        </form>
      </div>
    </div>
    <section>
      <div class="container">
        <button v-if="user"
          class="btn create-new-post"
          @click="toggleModal(), showPostCreation = true">
            Create new post?
        </button>
        <div v-for="post of showPosts"
          :key="`post-id-${post.id}`"
          class="post-wrap">

          <!-- POSTS -->
          <div class="post">
            <div class="post-body">
              <p>{{post.description}}</p>
            </div>
            <div class="post-author flex space-between align-center">
              <div>
                <button v-if="user && user.id === post.authorId" class="btn" @click="editPost(post), toggleModal()">Edit</button>
                <button v-if="user && user.id === post.authorId" class="btn" @click="deletePost(post.id)">Delete</button>
                <button @click="toggleComments = post.id" class="btn">Comments</button>
              </div>
              <div>
                <span>Posted by: </span>
                <router-link :to="`/user/${post.authorId}`">{{post.author}}</router-link>
              </div>
            </div>
          </div>

          <div v-if="post.id === toggleComments">

            <!-- POST COMMENT AREA -->
            <form class="comment-area flex justify-center" v-if="user">
              <textarea placeholder="Leave a comment?"></textarea>
              <input class="btn" type="submit" @click="addComent($event, post.id)" value="Post">
            </form>

            <!-- COMMENTS -->
            <div class="post-comments">
              <template v-for="comment of showComments">
                <div :key="`comment-${comment.id}`" v-if="comment.parent === post.id" class="comment">
                  <div class="comment-body">
                    <p>{{comment.description}}</p>
                  </div>
                  <div class="comment-author flex space-between align-center">
                    <div class="flex">
                      <button v-if="user && user.id === comment.authorId" class="btn" @click="editPost(comment), toggleModal()">Edit</button>
                      <button v-if="user && user.id === comment.authorId" class="btn" @click="deletePost(comment.id)">Delete</button>
                      <button class="btn" v-if="user && user.id === post.authorId && user.id !== comment.authorId" @click="deletePost(comment.id)">Delete</button>
                    </div>
                    <div>
                      <span>Commented by: </span>
                      <router-link :to="`/user/${comment.authorId}`">{{comment.author}}</router-link>
                    </div>
                  </div>
                </div>
              </template>
            </div>

          </div>

        </div>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      user: {},
      userPost: {
        description: ''
      },
      showEditPostModal: false,
      editingPost: {},
      commentErrorMessage: '',
      showModal: false,
      showPostCreation: false,
      toggleComments: ''
    }
  },
  methods: {

    // TOGGLE MODAL
    toggleModal() {
      this.showModal = !this.showModal
    },

    // CREATE NEW POST METHOD
    createNewPost(e, type, parent, commentValue) {
      e.preventDefault()
      let payload = {}
      if (type === 'post') {

        // PREVENT FROM SUBMITTING POST WITHOUT USER AND DESCRIPTION
        if (this.user && this.userPost.description)
          payload = {
            description: this.userPost.description,
            type,
            author: this.user.username,
            authorId: this.user.id,
            parent,
            timestamp: new Date().getTime()
          }
      }
      else {

        // PREVENT FROM SUBMITTING COMMENT WITHOUT TEXT
        if (commentValue)
          payload = {
            description: commentValue,
            type,
            author: this.user.username,
            authorId: this.user.id,
            parent,
            timestamp: new Date().getTime()
          }
      }
      // FORM OBJECT FOR POSTING NEW POST
      axios.post(process.env.VUE_APP_POSTS, payload)
      .then(() => {

        // RESET USER POST DATA AND COMMENT DATA
        this.userPost.description = ''

        // GET NEWLY ADDED POSTS
        this.$store.dispatch('getPosts')

        // CLOSE MODAL
        this.showModal = false
        this.showPostCreation = false

      }).catch(error => {
          console.log(error)
      })
    },

    // EDIT POST/COMMENT TRIGGER METHOD, SHOWS MODAL AND GATHER DATA
    editPost(val) {

      // SHOW EDITING MODAL
      this.showEditPostModal = true

      // GATHER DATA FOR EDITING POST, ASSIGN TO NEW OBJECT CAUSE OF V-MODEL WATCH
      this.editingPost = {...val}
    },

    // UPDATE EDITING POST/COMMENT METHOD
    updatePost(e) {
      e.preventDefault()

      let payload = {}

      // FORM PAYLOAD OBJECT
      if (this.user && this.editingPost.description)
        payload = {
          description: this.editingPost.description,
          type: this.editingPost.type,
          author: this.editingPost.author,
          authorId: this.editingPost.authorId,
          id: this.editingPost.id,
          parent: this.editingPost.parent,
          timestamp: this.editingPost.timestamp
        }

      // FORM NEW OBJECT FOR PUT METHOD FROM GATHERED EDITING DATA
        axios.put(`${process.env.VUE_APP_POSTS}/${this.editingPost.id}`, payload)
        .then(() => {

          // GET NEWLY ADDED POSTS
          this.$store.dispatch('getPosts')

          // RESET EDITING POST OBJECT
          this.editingPost = {}

          // HIDE MODAL
          this.showEditPostModal = false
        }).catch(error => {
            console.log(error)
        })
    },

    // DELETE POST
    deletePost(val) {
      axios.delete(`${process.env.VUE_APP_POSTS}/${val}`).then(() => {
        // INIT DELETE ALL COMMENTS METHOD
        this.deleteDeletedPostComments(val)
      })
    },

    // DELETE ALL COMMENTS RELATED TO DELETED POST AND REMOVE THEM
    deleteDeletedPostComments(val) {
      axios.get(process.env.VUE_APP_POSTS).then(res => {

        // FIND ALL COMMENTS WITH POST ID
        const comments = res.data.filter(comment => comment.parent === val )
        const arr = []
        comments.forEach(comment => arr.push(axios.delete(`${process.env.VUE_APP_POSTS}/${comment.id}`)))
        Promise.all(arr).then(() => {

          // GET NEWLY ADDED POSTS
          this.$store.dispatch('getPosts')
        })
      })
    },

    // CANCEL EDITING POST
    cancelEdit() {
      this.showEditPostModal = false
      this.editingPost = {}

      // GET NEWLY ADDED POSTS
      this.$store.dispatch('getPosts')
    },

    // ADD COMMENT
    addComent(e, parent) {
      e.preventDefault()
      this.createNewPost(e, 'comment', parent, e.target.previousElementSibling.value)
      e.target.previousElementSibling.value = ''
    }

  },
  created() {

    // SET USER OBJECT WHEN LOGGED IN, IF NOT RETURN FALSY VALUE
    this.user = this.$store.state.currentUser
  },
  computed: {
    ...mapState(['currentUser']),

    showPosts() {
      return this.$store.state.posts
    },
    showComments() {
      return this.$store.state.comments
    }
  },
  watch: {

    // WATCH FOR STATE CHANGE TO SET USER
    currentUser(newVal) {
      if (newVal)
        this.user = newVal
    }
  }
}
</script>

<style scoped lang="scss">
  #modal {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
    z-index: 10;
    background-color: rgba(0,0,0,0.5);
    .close-modal {
      position: absolute;
      top: 8px;
      right: 8px;
      cursor: pointer;
      display: block;
      height: 15px;
      width: 15px;
      background-color: transparent;
      border: none;
      &:before,
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        height: 110%;
        width: 2px;
        background-color: #000;
      }
      &:before {
        transform: translate(-50%, -50%) rotate(45deg);
      }
      &:after {
        transform: translate(-50%, -50%) rotate(-45deg);
      }
    }
    > div {
      height: 100%;
    }
    form {
      position: relative;
      background-color: #f9f9f9;
      padding: 20px;
      // border-radius: 25px;
      height: 100%;
      width: 100%;
      max-width: 400px;
      max-height: 200px;
      textarea {
        position: absolute;
        height: calc(100% - 40px);
        width: calc(100% - 40px);
        top: 20px;
        left: 20px;
        border-radius: 25px;
        padding: 20px 20px 35px;
        box-shadow: 0px 0px 15px 0px rgba(19,3,136,0.5);
      }
      input {
        position: absolute;
        z-index: 1;
        bottom: 20px;
        right: 10px;
      }
    }
  }
  .comment-body {
    padding: 30px 20px;
    background-color: #fff;
  }
  .post-wrap {
    margin-bottom: 30px;
  }
  .post,
  .comment {
    position: relative;
    box-shadow: 0px 0px 15px 0px rgba(19,3,136,0.5);
    border-radius: 25px;
    overflow: hidden;
  }
  .comment {
    width: calc(100% - 60px);
    margin: 0 auto;
    margin-top: 15px;
  }
  .post-body {
    padding: 40px;
    background-color: #fff;
  }
  .post-author,
  .comment-author {
    background: linear-gradient(155deg, #1fcdf0 0%, #1fcdf0 40%, #130388 90%, #130388 100%);
    padding: 20px;
    text-align: right;
    span {
      color: #fff;
      font-style: italic;
      font-size: 12px;
      opacity: 0.7;
    }
    a {
      color: #fff;
      font-style: normal;
      font-size: 14px;
      text-decoration: none;;
    }
  }
  .comment-author {
    padding: 10px 20px;
  }
  .comment-area {
    margin-top: 15px;
    position: relative;
    textarea {
      width: calc(100% - 60px);
      height: 100px;
      padding: 20px;
      border: none;
      outline: none;
      box-shadow: 0px 0px 15px 0px rgba(19,3,136,0.5);
      border-radius: 25px;
    }
    input[type="submit"] {
      position: absolute;
      bottom: 0;
      right: 20px;
    }
  }
  .create-new-post {
    margin-bottom: 20px;
  }
  @media (max-width: 768px) {
    .post-author,
    .comment-author {
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding: 20px 10px;
      > div {
        width: 100%;
        &:last-child {
          margin-top: 10px;
          text-align: right;
        }
      }
      span, a {
        font-size: 10px;
      }
    }
    .post-body,
    .comment-body {
      padding: 30px 20px;
    }
    .post,
    .comment {
      p {
        font-size: 12px;
      }
    }
    .btn {
      font-size: 10px;
      &:last-child {
        // margin-right: 0;
      }
    }
  }
</style>