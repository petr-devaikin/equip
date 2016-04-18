angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, AuthService) {
  $scope.login = function(form) {
    AuthService.signIn(form.phoneEmail.$modelValue, form.password.$modelValue)
      .done(function(user) {
        if (user.attributes.username == 'admin') {
          $state.go('eventDetails');
        }
        else {
          $state.go('tab.messages');
        }
      })
      .fail(function(error) {
        console.log('Auth error');
      });
  };

  $scope.signUp = function() {
       $state.go('register');
   };

})

.controller('RegisterCtrl', function($scope, $state, $ionicLoading, $rootScope, $ionicHistory) {

  $scope.user = {};
  $scope.error = {};

  $scope.myGoBack = function() {
      $ionicHistory.goBack();
  };

  $scope.register = function() {


      $scope.loading = $ionicLoading.show({
          content: 'Sending',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
      });

      var user = new Parse.User();
      user.set("name", $scope.user.name);
      user.set("username", $scope.user.username);
      user.set("password", $scope.user.password);
      user.set("email", $scope.user.email);
      user.set("dob", $scope.user.dob);

      user.signUp(null, {
          success: function(user) {
              $ionicLoading.hide();
              $rootScope.user = user;
              $rootScope.isLoggedIn = true;
              $state.go('tab.messages', {
                  clear: true
              });
          },
          error: function(user, error) {
              $ionicLoading.hide();
              if (error.code === 125) {
                  $scope.error.message = 'Please specify a valid email ' +
                  'address';
              } else if (error.code === 202) {
                  $scope.error.message = 'The email address is already ' +
                  'registered';
              } else {
                  $scope.error.message = error.message;
              }
              $scope.$apply();
          }
      });
  };




})

.controller('EventDetailsCtrl', function($scope, $state, PeopleService) {
  function updatePeopleList() {
    PeopleService.all().then(function(data) {
      $scope.people = data;
      $scope.$apply();
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updatePeopleList();
  });

  $scope.addUser = function(form) {
    PeopleService.add(form.phoneEmail.$modelValue, '123').then(function() {
      updatePeopleList();
    });
  }
})

.controller('MessagesCtrl', function($scope, MessageService, $cordovaCapture, $cordovaNativeAudio, PeopleService,
                                     LocationService, $cordovaFile, $cordovaMedia, $ionicSlideBoxDelegate,
                                     $ionicModal, PubNub) {
  var readMessages = [];
  var myMedia;

  $scope.readMessage = function(msg) {
    readMessages.push(msg.id);
    msg.read = true;
  }

  PubNub.subscribe('equipmain', function(message) {
    console.log('Msg from pubnub: ' + message);
    updateConversationList();
  });

  function updateConversationList() {
    MessageService.allConversations().then(function(rawData) {
      var data = [];
      for (var key in rawData) {
        data.push(rawData[key]);
      }

      data.sort(function(a, b) {
        return new Date(b.conversation.attributes.createdAt) - new Date(a.conversation.attributes.createdAt);
      });

      for (var i = 0; i < data.length; i++) {
        data[i].pinned = 0;
        var counter = 0;

        for (var j = 0; j < data[i].messages.length; j++) {
          if (data[i].messages[j].attributes.pinned)
            counter++;
          if (readMessages.indexOf(data[i].messages[j].id) != -1)
            data[i].messages[j].read = true;
        }

        data[i].pinned = counter;
        data[i].messages.reverse();
      }

      $scope.isPlaying = false;
      $scope.conversations = data;
      $scope.$apply();
    });
  }

  function updateLocationList() {
    LocationService.all().then(function(locations) {
      $scope.locations = locations;
      $scope.$apply();
    })
  }

  function updateDestinationList() {
    MessageService.getReceivers().then(function(receivers) {
      $scope.destinations = receivers;
      $ionicSlideBoxDelegate.update();
      $scope.$apply();
    })
  }

  function checkLocation() {
    PeopleService.currentUser().then(function(user) {
      $scope.lastLocation = user.attributes.lastLocation;

      var ask = user.attributes.lastLocationDate === undefined ||
        (new Date()).getTime() - user.attributes.lastLocationDate.getTime() > 1000 * 60 * 30;

      if (ask) {
        $scope.askForLocationModal.show();
      }
      else
        $scope.$apply();
    });
  }

  //var updateTimer = undefined;

  // init modals

  $ionicModal.fromTemplateUrl('templates/modal-ask-location.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.askForLocationModal = modal;

    // check location and start timer
    checkLocation();

    /*updateTimer = setInterval(function() {
      updateConversationList();
      checkLocation();
    }, 5000);*/
  });

  $scope.askForLocation = function() {
    $scope.askForLocationModal.show();
  };

  $ionicModal.fromTemplateUrl('templates/modal-new-conversation.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.newConversationModal = modal;
  });

  $scope.showDestinationModal = function() {
    $scope.newConversationModal.show();
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.askForLocationModal.remove();
  });


  // Init tab

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateConversationList();
    updateLocationList();
  });

  $scope.$on('$ionicView.leave', function (viewInfo, state) {
    //clearInterval(updateTimer);
  });

  $scope.pinToConversation = function(convo) {
    console.log('pin called');
    MessageService.pinToConvo(convo)
      .done(function() {
          updateConversationList();
          console.log('DONE pinned');
      });
  }

  function sendMessageToConversation(convo, msg) {
    if (msg === undefined || msg == 'undefined')
      MessageService.sendTestToConversation(convo)
        .done(function() {
          updateConversationList();
          console.log('DONE test message sent to all');
        })
        .fail(function(msg){
          console.log('FAIL test message sent to all: '+msg);
        });
    else
      MessageService.sendToConversation(convo, msg)
        .done(function() {
          updateConversationList();
          console.log('DONE message sent to all');
        })
        .fail(function(error){
          console.log('FAIL message sent to all: '+error);
        });
  }

  function startConversationWithMessage(msg) {
    $scope.newConvoParams = {
      destinationId: 0,
      peopleNeeded: 0
    }

    for (var i = 0; i < $scope.locations.length; i++)
      if ($scope.locations[i].id == $scope.lastLocation.id) {
        $scope.newConvoParams.newLocation = $scope.locations[i];
        break;
      }

    $ionicSlideBoxDelegate.slide(0);

    window.localStorage['newMessage'] = msg;
    updateDestinationList();
    //$scope.$apply();

    $scope.showDestinationModal();
  }

  function recordMessage(callback) {
    window.plugins.audioRecorderAPI.record(function (savedFilePath) {
      var fileName = savedFilePath.split('/')[savedFilePath.split('/').length - 1];
      var directory;

      if (cordova.file.documentsDirectory) {
        directory = cordova.file.documentsDirectory; // for iOS
      } else {
        directory = cordova.file.externalRootDirectory; // for Android
      }

      //console.log(directory);
      //console.log(fileName);

      $cordovaFile.copyFile(
        cordova.file.dataDirectory, fileName,
        directory, "audioFileEquip.m4a"
      ).then(function (success) {
        var allPath = directory+"audioFileEquip.m4a";
        window.plugins.Base64.encodeFile(allPath, function(base64){
          var base64Audio= base64.substring(34);

          console.log('file base64 encoding: ' + base64Audio);
          callback(base64Audio);
        });
      }, function (error) {
        alert(JSON.stringify(error));
      });
    }, function(msg) {
      alert('ko: ' + msg);
    }, 5);
  }

  $scope.startConversation = function() {
    console.log('start recording for a new conversation');
    $scope.destinationId = 0;

    if (window.plugins === undefined) {
      console.log("Send test message from web");
      startConversationWithMessage();
    }
    else {
      recordMessage(function(base64Audio) {
        startConversationWithMessage(base64Audio);
      });
    }
  }


  $scope.stopConversation = function(){
    console.log('stop recording for a new conversation');
    //recorder.stop();
    //media.stopRecord();
    //media.release();
  }

  $scope.destinationChanged = function(i) {
    $scope.newConvoParams.destinationId = i;
  }

  $scope.sendConversation = function(destination) {
    // update location
    $scope.updateLocation($scope.newConvoParams.newLocation);

    // create new conversation
    var msg = window.localStorage["newMessage"];

    $scope.newConvoParams.convoDestination = destination;

    if ($scope.newConvoParams.convoDestination.entity == null)
      MessageService.startConversationWithAll($scope.newConvoParams.peopleNeeded).then(
        function(convo) {
          console.log("New conversation with all created");
          sendMessageToConversation(convo, msg);
        }
      );
    else if ($scope.newConvoParams.convoDestination.entity.className == 'Group')
      MessageService.startConversationWithGroup($scope.newConvoParams.convoDestination.entity, $scope.newConvoParams.peopleNeeded).then(
        function(convo) {
          console.log("New conversation with group created");
          sendMessageToConversation(convo, msg);
        }
      );
    else
      MessageService.startConversationWithLocation($scope.newConvoParams.convoDestination.entity, $scope.newConvoParams.peopleNeeded).then(
        function(convo) {
          console.log("New conversation with location created");
          sendMessageToConversation(convo, msg);
        }
      );

    $scope.newConversationModal.hide();
  }

  $scope.startReply = function(convo) {
    console.log('start recording for an existing conversation: ' + convo.id);

    if (window.plugins === undefined) {
      console.log("Send test message from web");
      sendMessageToConversation(convo);
    }
    else {
      recordMessage(function(base64Audio) {
        sendMessageToConversation(convo, base64Audio);
      });
    }
  }

  $scope.stopReply = function(convo) {
    console.log('stop recording for an existing conversation: ' + convo.id);
  }

  $scope.playMessage = function(message){
    console.log('play message');
    $scope.readMessage(message);
    $scope.isPlaying = true;


    var audioContentMsg = message.get('audioContent');
    if (audioContentMsg === undefined)
      console.log('Empty message');
    else {
      var url = audioContentMsg.url();
      console.log(url);
      myMedia = $cordovaMedia.newMedia(url);
      myMedia.play(); // Android
    }

  }
  $scope.stopPlayMessage = function(message){
    console.log('stopPlay');
    $scope.isPlaying = false;
    myMedia.stop();
  }

  $scope.updateLocation = function(newLocation) {
    if (newLocation !== null)
      LocationService.updateLocation(newLocation).then(function() {
        checkLocation();
      });

    $scope.askForLocationModal.hide();
  }

  $scope.confirmLocation = function() {
    LocationService.confirmLocation().then(function() {
      checkLocation();
    });

    $scope.askForLocationModal.hide();
  }
})


.controller('GroupsCtrl', function($scope, GroupService) {
  function updateGroupList() {
    GroupService.all().then(function(data) {
      $scope.groups = data;
      $scope.$apply();
      console.log('scope.groups updated');
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateGroupList();
  });

  $scope.remove = function(group) {
    GroupService.remove(group).then(function() {
      console.log('group destroyed');
      updateGroupList();
    });
  }

  $scope.addGroup = function(form) {
    GroupService.add(form.groupName.$modelValue).then(function() {
      updateGroupList();
    });
  }


  $scope.follow = function(group) {
    if (group.followed) {
      group.followed = false;
      GroupService.removeUser(group);
      updateGroupList();
    }
    else {
      group.followed = true;
      GroupService.addUser(group);
      updateGroupList();
    }
  }
})
.controller('GroupDetailCtrl', function($scope, $state, $stateParams, GroupService, MessageService) {
  function updateGroupInfo() {
    GroupService.get($stateParams.groupId).then(function(data) {
      $scope.group = data;
      $scope.$apply();

      GroupService.usersInGroup(data).then(function(users) {
        $scope.usersInGroup = users;
        var ids = users.map(function(u) { return u.id; });
      });
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateGroupInfo();
  });

  $scope.sendMessage = function(group) {
    MessageService.sendToGroup(group, "")
      .then(function() {
        $state.go('tab.messages');
      });
  }
})


.controller('LocationsCtrl', function($scope, LocationService) {
  function updateLocationList() {
    LocationService.all().then(function(data) {
      $scope.locations = data;
      $scope.$apply();
      console.log('scope.locations updated');
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateLocationList();
  });

  $scope.remove = function(location) {
    LocationService.remove(location).then(function() {
      updateLocationList();
    });
  }

  $scope.addLocation = function(form) {
    LocationService.add(form.locationName.$modelValue).then(function() {
      updateLocationList();
    });
  }
})
.controller('LocationDetailCtrl', function($scope, $state, $stateParams, LocationService, MessageService) {
  function updateLocationInfo() {
    LocationService.get($stateParams.locationId).then(function(data) {
      $scope.location = data;
      $scope.$apply();
      console.log('location info received');

      LocationService.usersAtLocation(data).then(function(users) {
        $scope.users = users;
        $scope.$apply();
        console.log('people at location received');
      });
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateLocationInfo();
  });


  $scope.sendMessage = function(location) {
    MessageService.sendToLocation(location, "")
      .then(function() {
        $state.go('tab.messages');
      });
  }
});
