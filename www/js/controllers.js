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


.controller('GroupsCtrl', function($scope, GroupService) {
  function updateGroupList() {
    GroupService.all().then(function(data) {
      $scope.groups = data;
      $scope.$apply();
      console.log('scope.groups updated');
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    console.log('view entered');
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
  console.log("new group ctrl");
  $scope.addItem = function(form) {
    GroupService.add(form.groupName.$modelValue).then(function() {
      console.log('new group added');
      $state.go('tab.groups');
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
    console.log('view entered');
    updateLocationList();
  });

  $scope.remove = function(location) {
    LocationService.remove(location);
  };
});
