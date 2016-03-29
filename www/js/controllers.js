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
        $state.go('tab.messages');
      });
  }
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
                                     LocationService, $cordovaFile, $cordovaMedia, $ionicSlideBoxDelegate) {
  function updateConversationList() {
    MessageService.allConversations().then(function(data) {
      data.sort(function(a, b) {
        return new Date(b.conversation.attributes.createdAt) - new Date(a.conversation.attributes.createdAt);
      });
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

      $scope.askForLocation = user.attributes.lastLocationDate === undefined ||
        (new Date()).getTime() - user.attributes.lastLocationDate.getTime() > 1000 * 60 * 30;

      if ($scope.askForLocation) {
        updateLocationList();
      }
      else
        $scope.$apply();
    });
  }

  var updateTimer = undefined;

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateConversationList();
    checkLocation();

    updateTimer = setInterval(function() {
      updateConversationList();
      checkLocation();
    }, 10000);
  });

  $scope.$on('$ionicView.leave', function (viewInfo, state) {
    clearInterval(updateTimer);
  });

  $scope.sendToConversation = function(convo) {
    /*MessageService.sendToLocation(location, "")
      .then(function() {
        updateMessageList();
      });*/
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
    $scope.newCoversationInProgress = true;
    $scope.newConvoParams = {
      destinationId: 0
    }

    $ionicSlideBoxDelegate.slide(0);

    window.localStorage['newMessage'] = msg;
    updateLocationList();
    updateDestinationList();
    //$scope.$apply();
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

  $scope.sendConversation = function() {
    // update location
    $scope.updateLocation($scope.newConvoParams.newLocation);

    // create new conversation
    var msg = window.localStorage["newMessage"];

    $scope.newConvoParams.convoDestination = $scope.destinations[$scope.newConvoParams.destinationId];
    console.log($scope.newConvoParams.convoDestination);

    if ($scope.newConvoParams.convoDestination.entity == null)
      MessageService.startConversationWithAll().then(
        function(convo) {
          console.log("New conversation with all created");
          sendMessageToConversation(convo, msg);
        }
      );
    else if ($scope.newConvoParams.convoDestination.entity.className == 'Group')
      MessageService.startConversationWithGroup($scope.newConvoParams.convoDestination.entity).then(
        function(convo) {
          console.log("New conversation with group created");
          sendMessageToConversation(convo, msg);
        }
      );
    else
      MessageService.startConversationWithLocation($scope.newConvoParams.convoDestination.entity).then(
        function(convo) {
          console.log("New conversation with location created");
          sendMessageToConversation(convo, msg);
        }
      );

    $scope.newCoversationInProgress = false;
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

    var audioContentMsg = message.get('audioContent');
    if (audioContentMsg === undefined)
      console.log('Empty message');
    else {
      var url = audioContentMsg.url();
      console.log(url);
      var myMedia = $cordovaMedia.newMedia(url);
      myMedia.play(); // Android
    }

  }

  $scope.updateLocation = function(newLocation) {
    if (newLocation !== null)
      LocationService.updateLocation(newLocation).then(function() {
        checkLocation();
      });
  }

  $scope.confirmLocation = function() {
    LocationService.confirmLocation().then(function() {
      checkLocation();
    });
  }
})


.controller('GroupsCtrl', function($scope, GroupService) {
  function updateGroupList() {
    GroupService.all().then(function(data) {
      $scope.groups = data;
      console.log(data);
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
    }
    else {
      group.followed = true;
      GroupService.addUser(group);
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
