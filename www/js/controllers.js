angular.module('starter.controllers', [])

.controller('MessagesCtrl', function($scope, Chats) {
  $scope.messages = Chats.all();
})

.controller('PeopleCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  console.log('chat details');
  $scope.chat = Chats.get($stateParams.chatId);
})


.controller('PeopleCtrl', function($scope, PeopleService) {
  function updatePeopleList() {
    PeopleService.all().then(function(data) {
      $scope.people = data;
      $scope.$apply();
        console.log(data[0].attributes);
      console.log('scope.people updated');
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updatePeopleList();
  });

  $scope.remove = function(person) {
    PeopleService.remove(person).then(function() {
      console.log('person destroyed');
      updatePeopleList();
    });
  }
})
.controller('NewUserCtrl', function($scope, $state, PeopleService) {
  $scope.addItem = function(form) {
    PeopleService.add(form.username.$modelValue, form.password.$modelValue).then(function() {
      console.log('new user added');
      $state.go('tab.people');
    });
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
})
.controller('NewGroupCtrl', function($scope, $state, GroupService) {
  $scope.addItem = function(form) {
    GroupService.add(form.groupName.$modelValue).then(function() {
      console.log('new group added');
      $state.go('tab.groups');
    });
  }
})
.controller('GroupDetailCtrl', function($scope, $stateParams, GroupService) {
  function updateGroupInfo() {
    GroupService.get($stateParams.groupId).then(function(data) {
      $scope.group = data;
      $scope.$apply();
      console.log('group info received');

      GroupService.usersInGroup(data).then(function(users) {
        $scope.usersInGroup = users;
        console.log('people in group received');
        var ids = users.map(function(u) { return u.id; });
        GroupService.usersNotInGroup(ids).then(function(otherUsers) {
          $scope.usersNotInGroup = otherUsers;
          $scope.$apply();
          console.log('people not in group received');
        });
      });
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateGroupInfo();
  });

  $scope.addUser = function(user) {
    if (user !== null) {
      GroupService.addUser($scope.group, user).then(function() {
        updateGroupInfo();
      });
    }
  }

  $scope.removeUser = function(user) {
    GroupService.removeUser($scope.group, user).then(function() {
      updateGroupInfo();
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
      console.log('location destroyed');
      updateLocationList();
    });
  }
})
.controller('NewLocationCtrl', function($scope, $state, LocationService) {
  $scope.addItem = function(form) {
    LocationService.add(form.locationName.$modelValue).then(function() {
      console.log('new location added');
      $state.go('tab.locations');
    });
  }
})
.controller('LocationDetailCtrl', function($scope, $stateParams, LocationService) {
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
});
