// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ngCordova', 'starter.controllers', 'starter.services', 'pubnub.angular.service'])
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.scrolling.jsScrolling(false);

  // Or for only a single platform, use
  // if( ionic.Platform.isAndroid() ) {
    // $ionicConfigProvider.scrolling.jsScrolling(false);
  // }
})
.run(function($ionicPlatform) {


  var appId= "KAsvKDYrevg6q5aOPyNhKX0wHuMbN34tmgyl7gAD";
  var clientKey = "ldTDKmu37Z2maChsqkSCffKzATqQbD5u3Jq48ZI7";
  var jsKey = "nJSHJAaHOpvh7Yk1ZDwNnfP9RzpyOMBWljP0WoK2";


  console.log("initialize");
  Parse.initialize(appId,jsKey);


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

    console.log("Trying to initialize window.parsePlugin");

    window.parsePlugin.initialize(appId,clientKey,function(){
      console.log("INSTALLATION ALL GOOD");
    });

    window.parsePlugin.registerCallback('onNotification', function() {
        window.onNotification = function(notificationObject) {
          var json = notificationObject;
          console.log("PUSH NOTIFICATION RECEIVED: "+JSON.stringify(json));
          //If the JSON of the push does not include a conversationId it is a simple reminder, so we go to the agenda

          var isForeground = notificationObject.receivedInForeground;
          if(isForeground) {
            console.log("PUSH IS FOREGROUND")
          } else {
            console.log("PUSH IS BACKGROUND")
          }
          //We are opening the app with the notification, let's go to the conversations view
          // var actionAfterPush = function(theConversation) {
          //   if (isForeground) {
          //     var currentURL = "" + window.location;
          //     console.log("Current URL: "+currentURL);
          //     var possibleTheConversationId = currentURL.split('/').pop();
          //     console.log("Extracted conversation id: "+possibleTheConversationId);
          //     if (possibleTheConversationId === json.conversationId) {
          //       console.log("We are at the conversation where we should show the push");
          //       $rootScope.$apply();
          //     } else {
          //       console.log("Broadcasting messageReceived");
          //       $rootScope.$broadcast('messageReceived',json.conversationId);
          //     }
          //   } else {
          //     $state.go('app.tab.conversations', {goToConversation: json.conversationId});
          //     // setTimeout(function(){
          //     //   $state.go('app.tab.conversation-detail', {conversationId: json.conversationId});
          //     // }, 300);
          //   }
          // }
          // var conversation = ParseService.getConversation(json.conversationId);
          // if (conversation === undefined) {
          //   ParseService.allConversations(
          //     function success(results){
          //       actionAfterPush(ParseService.getConversation(json.conversationId));
          //     },
          //     function fail(model, error){
          //       console.log("Couldn't retrieve the conversation of the user "+ JSON.stringify(error));
          //     }
          //   );
          // } else {
          //   //Load the new message on the conversation
          //   ParseService.loadOneConversation(json.conversationId,
          //     function success(updatedConversation) {
          //       console.log("We fetched conversation: "+ JSON.stringify(updatedConversation));
          //       console.log("We fetched last_message: "+ JSON.stringify(updatedConversation.get("last_message")));
          //       // The object was refreshed successfully.
          //       // conversation.set('last_message',updatedLastMessage);
          //       actionAfterPush(updatedConversation);
          //     },
          //     function error(error) {
          //       // The object was not refreshed successfully.
          //       // error is a Parse.Error with an error code and message.
          //       console.log("Couldn't fetch conversation of the user "+ JSON.stringify(error));
          //     }
          //   );
          // }
        };
      }, function(error) {
        console.error("parsePlugin.registerCallback error");
      });




    // parsePlugin.initialize(appId, clientKey, function() {
    //   console.log('inside parse');
    //   parsePlugin.subscribe('SampleChannel', function() {
    //     console.log('inside subscrive');
    //     parsePlugin.getInstallationId(function(id) {
    //
    //       console.log("installation object id: " + id)
    //
    //
    //          //Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations
    //
    //          var install_data = {
    //             installation_id: id,
    //             channels: ['SampleChannel']
    //          }
    //
    //     }, function(e) {
    //         console.log('error');
    //     });
    //
    // }, function(e) {
    //     console.log('error');
    // });
    // }, function(e) {
    //   console.log('error');
    // });







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
