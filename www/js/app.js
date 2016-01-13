// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    Parse.initialize(
      "KAsvKDYrevg6q5aOPyNhKX0wHuMbN34tmgyl7gAD",
      "nJSHJAaHOpvh7Yk1ZDwNnfP9RzpyOMBWljP0WoK2"
    );
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.messages', {
    url: '/messages',
    views: {
      'tab-messages': {
        templateUrl: 'templates/tab-messages.html',
        controller: 'MessagesCtrl'
      }
    }
  })
    .state('tab.message-dest', {
      url: '/messages/dest',
      views: {
        'tab-messages': {
          templateUrl: 'templates/message-dest.html',
          controller: 'MessageDestCtrl'
        }
      }
    })
    .state('tab.broadcast', {
      url: '/messages/broadcast',
      views: {
        'tab-messages': {
          templateUrl: 'templates/record-message.html',
          controller: 'BroadcastCtrl'
        }
      }
    })
    .state('tab.messages-all-chat', {
      url: '/messages/all/',
      views: {
        'tab-messages': {
          templateUrl: 'templates/chat.html',
          controller: 'MsgAllChatCtrl'
        }
      }
    })
    .state('tab.messages-user-chat', {
      url: '/messages/user/:userId',
      views: {
        'tab-messages': {
          templateUrl: 'templates/chat.html',
          controller: 'MsgUserChatCtrl'
        }
      }
    })
    .state('tab.messages-group-chat', {
      url: '/messages/group/:groupId',
      views: {
        'tab-messages': {
          templateUrl: 'templates/chat.html',
          controller: 'MsgGroupChatCtrl'
        }
      }
    })

  .state('tab.people', {
      url: '/people',
      views: {
        'tab-people': {
          templateUrl: 'templates/tab-people.html',
          controller: 'PeopleCtrl'
        }
      }
    })
    .state('tab.new-user', {
      url: '/people/new',
      views: {
        'tab-people': {
          templateUrl: 'templates/new-user.html',
          controller: 'NewUserCtrl'
        }
      }
    })
    .state('tab.user-detail', {
      url: '/people/:userId',
      views: {
        'tab-people': {
          templateUrl: 'templates/user-detail.html',
          controller: 'UserDetailCtrl'
        }
      }
    })
    .state('tab.user-message', {
      url: '/people/:userId/message',
      views: {
        'tab-people': {
          templateUrl: 'templates/record-message.html',
          controller: 'UserMsgCtrl'
        }
      }
    })

  .state('tab.groups', {
      url: '/groups',
      views: {
        'tab-groups': {
          templateUrl: 'templates/tab-groups.html',
          controller: 'GroupsCtrl'
        }
      }
    })
    .state('tab.new-group', {
      url: '/groups/new',
      views: {
        'tab-groups': {
          templateUrl: 'templates/new-group.html',
          controller: 'NewGroupCtrl'
        }
      }
    })
    .state('tab.group-detail', {
      url: '/groups/:groupId',
      views: {
        'tab-groups': {
          templateUrl: 'templates/group-detail.html',
          controller: 'GroupDetailCtrl'
        }
      }
    })
    .state('tab.group-message', {
      url: '/groups/:groupId/message',
      views: {
        'tab-groups': {
          templateUrl: 'templates/record-message.html',
          controller: 'GroupMsgCtrl'
        }
      }
    })

  .state('tab.locations', {
    url: '/locations',
    views: {
      'tab-locations': {
        templateUrl: 'templates/tab-locations.html',
        controller: 'LocationsCtrl'
      }
    }
  })
    .state('tab.new-location', {
      url: '/locations/new',
      views: {
        'tab-locations': {
          templateUrl: 'templates/new-location.html',
          controller: 'NewLocationCtrl'
        }
      }
    })
    .state('tab.location-detail', {
      url: '/locations/:locationId',
      views: {
        'tab-locations': {
          templateUrl: 'templates/location-detail.html',
          controller: 'LocationDetailCtrl'
        }
      }
    })
  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/messages');

});
