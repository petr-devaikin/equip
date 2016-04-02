// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ngCordova', 'starter.controllers', 'starter.services'])

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

    var appId= "KAsvKDYrevg6q5aOPyNhKX0wHuMbN34tmgyl7gAD";
    var clientKey = "nJSHJAaHOpvh7Yk1ZDwNnfP9RzpyOMBWljP0WoK2";
    var clientKeyRest = "VHBsd7pKdcN62xRaCitEDGK45hP65bQlOqfHmnBA"

    Parse.initialize(appId,clientKey);

    parsePlugin.initialize(appId, clientKey, function() {
      console.log('inside parse');
      parsePlugin.subscribe('SampleChannel', function() {
        console.log('inside subscrive');
        parsePlugin.getInstallationId(function(id) {

          console.log("installation object id: " + id)


             //Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations

             var install_data = {
                installation_id: id,
                channels: ['SampleChannel']
             }

        }, function(e) {
            console.log('error');
        });

    }, function(e) {
        console.log('error');
    });
    }, function(e) {
      console.log('error');
    });







    //console.log(Media);
    if (navigator.device)
      console.log(navigator.device.capture);
    else
      console.log('NO CAPTURE');

  });
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })

  .state('eventDetails', {
    url: '/event',
    templateUrl: 'templates/event-details.html',
    controller: 'EventDetailsCtrl'
  })

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

  .state('tab.groups', {
      url: '/groups',
      views: {
        'tab-groups': {
          templateUrl: 'templates/tab-groups.html',
          controller: 'GroupsCtrl'
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

  .state('tab.locations', {
    url: '/locations',
    views: {
      'tab-locations': {
        templateUrl: 'templates/tab-locations.html',
        controller: 'LocationsCtrl'
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
  $urlRouterProvider.otherwise('/login');


});
