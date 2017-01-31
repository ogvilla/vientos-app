Polymer({
  is: 'vientos-project-profile',
  behaviors: [ ReduxBehavior, Polymer.AppLocalizeBehavior ],
  actions: {
    follow (personId, projectId) {
      return {
        type: window.vientos.ActionTypes.FOLLOW_REQUESTED,
        personId,
        projectId
      }
    },
    unfollow (personId, projectId) {
      return {
        type: window.vientos.ActionTypes.UNFOLLOW_REQUESTED,
        personId,
        projectId
      }
    }
  },

  properties: {
    person: {
      type: Object,
      statePath: 'person'
    },
    projectId: {
      type: String
    },
    projects: {
      type: Array,
      statePath: 'projects'
    },
    project: {
      type: Object,
      computed: '_findProject(projectId, projects)'
    },
    followed: {
      type: Boolean,
      computed: '_followedByPerson(projectId, person)'
    },
    language: {
      type: String,
      statePath: 'language'
    },
    resources: {
      type: Object,
      statePath: 'labels'
    }
  },

  _findProject (projectId, projects) {
    return projects.find(p => p._id === this.projectId)
  },

  _followedByPerson (projectId, person) {
    return person && person.follows && person.follows.includes(projectId)
  },

  _goBack () {
    window.history.back()
  },

  _follow () {
    this.dispatch('follow', this.person._id, this.projectId)
  },

  _unfollow () {
    this.dispatch('unfollow', this.person._id, this.projectId)
  }

})
