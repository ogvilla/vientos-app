/* global Polymer, ReduxBehavior, CustomEvent */

const ActionCreators = window.vientos.ActionCreators
const util = window.vientos.util

Polymer({

  is: 'vientos-shell',

  behaviors: [ ReduxBehavior, Polymer.AppLocalizeBehavior ],

  actions: {
    setLanguage: ActionCreators.setLanguage,
    setBoundingBox: ActionCreators.setBoundingBox,
    hello: ActionCreators.hello,
    bye: ActionCreators.bye,
    fetchPerson: ActionCreators.fetchPerson,
    fetchPeople: ActionCreators.fetchPeople,
    fetchPlaces: ActionCreators.fetchPlaces,
    fetchLabels: ActionCreators.fetchLabels,
    fetchCategories: ActionCreators.fetchCategories,
    fetchProjects: ActionCreators.fetchProjects,
    fetchIntents: ActionCreators.fetchIntents,
    fetchCollaborations: ActionCreators.fetchCollaborations,
    fetchReviews: ActionCreators.fetchReviews,
    fetchMyConversations: ActionCreators.fetchMyConversations,
    fetchNotifications: ActionCreators.fetchNotifications,
    saveSubscription: ActionCreators.saveSubscription
  },

  properties: {
    config: {
      type: Object,
      value: window.vientos.config
    },
    session: {
      type: Object,
      statePath: 'session',
      observer: '_sessionChanged'
    },
    page: {
      type: String,
      reflectToAttribute: true,
      observer: '_pageChanged'
    },
    projects: {
      type: Array,
      statePath: 'projects'
    },
    places: {
      type: Array,
      statePath: 'places'
    },
    intents: {
      type: Array,
      statePath: 'intents'
    },
    person: {
      type: Object,
      statePath: 'person',
      observer: '_personChanged'
    },
    myConversations: {
      type: Array,
      statePath: 'myConversations'
    },
    filteredCategories: {
      type: Array,
      statePath: 'filteredCategories'
    },
    filteredCollaborationTypes: {
      type: Array,
      statePath: 'filteredCollaborationTypes'
    },
    filteredFollowings: {
      type: Boolean,
      statePath: 'filteredFollowings'
    },
    filteredFavorings: {
      type: Boolean,
      statePath: 'filteredFavorings'
    },
    locationFilter: {
      type: String,
      statePath: 'locationFilter'
    },
    mapOf: {
      type: String,
      value: 'projects'
    },
    boundingBox: {
      type: Object,
      statePath: 'boundingBox'
    },
    boundingBoxFilter: {
      type: Boolean,
      statePath: 'boundingBoxFilter'
    },
    mapView: {
      type: Object
    },
    mapButtonVisible: {
      type: Boolean,
      computed: '_mapButtonVisibility(page, locationFilter)'
    },
    currentProject: {
      type: Object,
      value: null,
      computed: '_findProject(routeData.page, subrouteData.id, projects)'
    },
    currentIntent: {
      type: Object,
      value: null,
      computed: '_findIntent(routeData.page, subrouteData.id, intents)'
    },
    currentConversation: {
      type: Object,
      value: null,
      computed: '_findConversation(routeData.page, subrouteData.id, myConversations)'
    },
    currentPlace: {
      type: Object,
      value: null,
      computed: '_findPlace(routeData.page, subrouteData.id, places)'
    },
    visibleProjects: {
      type: Array,
      value: [],
      computed: '_filterProjects(person, projects, places, intents, filteredCategories, filteredFollowings, filteredFavorings, filteredCollaborationTypes, locationFilter, boundingBoxFilter, boundingBox)'
    },
    visibleIntents: {
      type: Array,
      value: [],
      computed: '_filterIntents(person, intents, visibleProjects, filteredCollaborationTypes, filteredFavorings)' // TODO boundingBox
    },
    visiblePlaces: {
      type: Array,
      value: [],
      computed: '_setVisiblePlaces(page, visibleProjectLocations, visibleIntentLocations)'
    },
    visibleProjectLocations: {
      type: Array,
      value: [],
      computed: '_filterPlaces(visibleProjects, places, boundingBox)'
    },
    visibleIntentLocations: {
      type: Array,
      value: [],
      computed: '_filterPlaces(visibleIntents, places, boundingBox)'
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

  observers: [
    '_routePageChanged(routeData.page)',
    '_queryChanged(query)'
  ],

  _routePageChanged (page) {
    let selectedPage = page || 'projects'
    this.set('page', selectedPage)
    // if (!['map', 'project'].includes(page)) window.history.replaceState({}, '', `/${page}`)
  },

  _queryChanged (query) {
    if (query.zoom) {
      this.set('mapView', {
        latitude: Number(query.latitude),
        longitude: Number(query.longitude),
        zoom: Number(query.zoom)
      })
    }
  },

  _pageChanged (page) {
    // Load page import on demand. Show 404 page if fails
    var viewUrl
    switch (page) {
      case 'intents':
        viewUrl = '../intents-list/intents-list'
        break
      case 'projects':
        viewUrl = '../vientos-projects/vientos-projects'
        break
      case 'map':
        viewUrl = '../vientos-map/vientos-map'
        break
      case 'filter':
        viewUrl = '../vientos-filter/vientos-filter'
        break
      case 'me':
        viewUrl = '../vientos-me/vientos-me'
        break
      case 'project':
        viewUrl = '../vientos-project-profile/vientos-project-profile'
        break
      case 'intent':
        viewUrl = '../vientos-intent-page/vientos-intent-page'
        break
      case 'edit-intent':
        viewUrl = '../vientos-intent-editor/vientos-intent-editor'
        break
      case 'new-intent':
        viewUrl = '../vientos-intent-editor/vientos-intent-editor'
        break
      case 'edit-project-details':
        viewUrl = '../vientos-edit-project-details/vientos-edit-project-details'
        break
      case 'new-project':
        viewUrl = '../vientos-edit-project-details/vientos-edit-project-details'
        break
      case 'edit-my-profile':
        viewUrl = '../personal-profile-editor/personal-profile-editor'
        break
      case 'new-conversation':
        viewUrl = '../start-conversation/start-conversation'
        break
      case 'conversation':
        viewUrl = '../conversation-page/conversation-page'
        break
      case 'place':
        viewUrl = '../place-page/place-page'
        break
    }

    viewUrl += '.html'
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
    var resolvedPageUrl = this.resolveUrl(viewUrl)
    this.importHref(resolvedPageUrl, null, this._showPage404, true)
  },

  _hasFooter (page) {
    return ![
      'edit-project-details',
      'new-project',
      'edit-my-profile',
      'new-intent',
      'edit-intent',
      'new-conversation'
    ].includes(page)
  },

  _toggleLanguage (e) {
    if (this.language === 'en') {
      this.dispatch('setLanguage', 'es')
    } else {
      this.dispatch('setLanguage', 'en')
    }
  },

  _showPage404 () {
    this.page = 'view404'
  },

  _personChanged (person) {
    if (person) {
      this.dispatch('setLanguage', person.language)
      // fetch conversations and update every 60s
      this.dispatch('fetchMyConversations', person)
      setInterval(() => { this.dispatch('fetchMyConversations', person) }, 60000)

      // fetch notifications and update every 60s
      this.dispatch('fetchNotifications', person)
      setInterval(() => { this.dispatch('fetchNotifications', person) }, 60000)

      // setup push notifications
      navigator.serviceWorker.ready.then(registration => {
        return registration.pushManager.getSubscription()
        .then(subscription => {
          if (subscription) return subscription
          return registration.pushManager.subscribe({ userVisibleOnly: true })
        })
      }).then(subscription => {
        let details = JSON.parse(JSON.stringify(subscription))
        this.dispatch('saveSubscription', details, person)
      })
    }
  },

  _findProject (page, projectId, projects) {
    if (page !== 'project' && page !== 'edit-project-details' && page !== 'new-intent') return null
    return projects.find(project => project._id === util.urlFromId(projectId, 'projects'))
  },

  _findIntent (page, intentId, intents) {
    if (page !== 'intent' && page !== 'edit-intent' && page !== 'new-conversation') return null
    return intents.find(intent => intent._id === util.urlFromId(intentId, 'intents'))
  },

  _findConversation (page, conversationId, conversations) {
    if (page !== 'conversation') return null
    return conversations.find(conversation => conversation._id === util.urlFromId(conversationId, 'conversations'))
  },

  _findPlace (page, placeId, places) {
    if (page !== 'place') return null
    return places.find(place => place._id === util.urlFromId(placeId, 'places'))
  },

  _filterProjects: util.filterProjects,

  _filterIntents: util.filterIntents,

  _filterPlaces: util.filterPlaces,

  _setVisiblePlaces (page, visibleProjectLocations, visibleIntentLocations) {
    if (page === 'map' || page === 'place') {
      if (!this.visiblePlaces.length) return visibleProjectLocations
      return this.visiblePlaces
    }
    if (page === 'intents' || page === 'intent') {
      this.set('mapOf', 'intents')
      return visibleIntentLocations
    } else {
      this.set('mapOf', 'projects')
      return visibleProjectLocations
    }
  },

  _updateBoundingBox (e, detail) {
    if (this.page === 'map') {
      this.dispatch('setBoundingBox', detail)
    }
  },

  _toggleDrawer () {
    this.$$('app-drawer').toggle()
  },

  _showMap () {
    window.history.pushState({}, '', '/map')
    window.dispatchEvent(new CustomEvent('location-changed'))
  },

  _mapButtonVisibility (page, locationFilter) {
    return (page === 'projects' && locationFilter !== 'city') ||
            page === 'intents'
  },

  _sessionChanged (session) {
    if (session && session.person) {
      this.dispatch('fetchPerson', session.person)
    }
  },

  _bye () {
    this.dispatch('bye', this.session)
    this.$$('app-drawer').toggle()
    window.history.pushState({}, '', `/`)
    window.dispatchEvent(new CustomEvent('location-changed'))
  },

  ready () {
    this.dispatch('hello')
    this.dispatch('fetchLabels')
    this.dispatch('fetchCategories')
    this.dispatch('fetchProjects')
    this.dispatch('fetchPlaces')
    this.dispatch('fetchPeople')
    this.dispatch('fetchIntents')
    // this.dispatch('fetchCollaborations')
    this.dispatch('fetchReviews')
    // fetch reviews and update every 60s
    setInterval(() => { this.dispatch('fetchReviews') }, 60000)
  }

})
