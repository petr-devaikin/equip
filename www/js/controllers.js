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

.controller('MessagesCtrl', function($scope, MessageService, $cordovaCapture ) {

  var recorder = new Object;
  recorder.stop = function() {
    window.plugins.audioRecorderAPI.stop(function(msg) {
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
      $scope.messages = data;
      $scope.$apply();
    });
  }



  $scope.sendToAll = function() {
    MessageService.sendToAll("ciao")
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
    recorder.record()


    // window.plugins.audioRecorderAPI.record(function(msg) {
    //   // complete
    //   window.plugins.audioRecorderAPI.playback();
    //   console.log('ok-record: ' + msg);
    // }, function(msg) {
    //   // failed
    //   console.log('ko-record: ' + msg);
    // });
  }


  $scope.stopRecording = function(){
    console.log('stop recording');
    recorder.stop();

    // window.plugins.audioRecorderAPI.stop(function(msg) {
    //   window.plugins.audioRecorderAPI.playback();
    //   console.log('ok-stop: ' + msg);
    // }, function(msg) {
    //   // failed
    //   console.log('ko-stop: ' + msg);
    // });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateMessageList();
  });

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
