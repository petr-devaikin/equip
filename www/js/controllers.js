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

.controller('MessagesCtrl', function($scope, MessageService, $cordovaCapture,$cordovaNativeAudio, PeopleService, LocationService, $cordovaFile ) {



  $cordovaNativeAudio.preloadSimple('click', 'sound/test.mp3')
    .then(function (msg) {
      console.log(msg);
    }, function (error) {
      alert(error);
    });

  var recorder = new Object;
  recorder.stop = function() {
    window.plugins.audioRecorderAPI.stop(function(msg) {querySelector('query')
      // success
      console.log('ok: ' + msg);
    }, function(msg) {
      // failed
      console.log('ko: ' + msg);
    });
  }



  recorder.playback = function() {
    window.plugins.audioRecorderAPI.playback(function(msg) {
      // complete
      console.log('ok: ' + msg);
    }, function(msg) {
      // failed
      console.log('ko: ' + msg);
    });
  }

  recorder.record = function() {
    window.plugins.audioRecorderAPI.record(function(msg) {
      // complete
      recorder.playback();
      console.log('ok: ' + msg);
    }, function(msg) {
      // failed
      console.log('ko: ' + msg);
    }); // record 30 seconds
  }


  function updateMessageList() {
    MessageService.all().then(function(data) {
      $scope.messages = data.slice(0, 1);
      $scope.$apply();
    });
  }

  function checkLocation() {
    PeopleService.currentUser().then(function(user) {
      $scope.lastLocation = user.attributes.lastLocation;

      $scope.askForLocation = user.attributes.lastLocationDate === undefined ||
        (new Date()).getTime() - user.attributes.lastLocationDate.getTime() > 1000 * 60 * 30;

      if ($scope.askForLocation) {
        LocationService.all().then(function(locations) {
          $scope.locations = locations;
          $scope.$apply();
        })
      }
      else
        $scope.$apply();
    });
  }

  var updateTimer = undefined;

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateMessageList();
    checkLocation();

    updateTimer = setInterval(function() {
      updateMessageList();
      checkLocation();
    }, 10000);
  });

  $scope.$on('$ionicView.leave', function (viewInfo, state) {
    clearInterval(updateTimer);
  });

  $scope.sendToAll = function(pathMessage) {
    MessageService.sendToAll(pathMessage)
      .then(function() {
        updateMessageList();
      });
  }

  $scope.sendToGroup = function(group) {
    MessageService.sendToGroup(group, "")
      .then(function() {
        updateMessageList();
      });
  }

  $scope.sendToLocation = function(location) {
    MessageService.sendToLocation(location, "")
      .then(function() {
        updateMessageList();
      });
  }


  $scope.startRecording = function(){
    console.log('start recording');
    //recorder.record();
    window.plugins.audioRecorderAPI.record(function(savedFilePath) {
    var fileName = savedFilePath.split('/')[savedFilePath.split('/').length - 1];
    var directory;
    if (cordova.file.documentsDirectory) {
      directory = cordova.file.documentsDirectory; // for iOS
    } else {
      directory = cordova.file.externalRootDirectory; // for Android
    }
    $cordovaFile.copyFile(
      cordova.file.dataDirectory, fileName,
      directory, "audioFileEquip.m4a"
    )
      .then(function (success) {
        MessageService.sendToAll("audioFileEquip.m4a")
          .then(function() {
            updateMessageList();
          });
      }, function (error) {
        alert(JSON.stringify(error));
      });
  }, function(msg) {
    alert('ko: ' + msg);
  }, 3);
  }


  $scope.stopRecording = function(){
    console.log('stop recording');
    //recorder.stop();
  }

  $scope.playMessage = function(message){
    console.log('play message');
    $cordovaNativeAudio.play('click');
    MessageService.getContentMessage(message).then(function(audioFileEquip){
      //record file on device
      //playit

    });

  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateMessageList();
  });

  $scope.updateLocation = function(newLocation) {
    console.log(newLocation);
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
