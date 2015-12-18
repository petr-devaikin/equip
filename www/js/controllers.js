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
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('GroupsCtrl', function($scope, Groups) {
  $scope.groups = Groups.all();
})

.controller('LocationsCtrl', function($scope, Locations) {
  $scope.locations = Locations.all();

  $scope.remove = function(location) {
    Locations.remove(location);
  };
});
