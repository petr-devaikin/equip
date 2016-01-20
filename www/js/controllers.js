angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state) {
  $scope.login = function(form) {
    if (form.phoneEmail.$modelValue == '123') {
      $state.go('eventDetails');
    }
    else {
      $state.go('tab.messages');
    }
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

.controller('MessagesCtrl', function($scope, MessageService) {
  $scope.messages = MessageService.chats();
  $scope.remove = function(chat) {
    MessageService.remove(chat);
  };
})
.controller('MessageDestCtrl', function($scope, $state, PeopleService, GroupService) {
  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    PeopleService.all().then(function(data) {
      $scope.people = data;
      $scope.$apply();
    });
    GroupService.all().then(function(data) {
      $scope.groups = data;
      $scope.$apply();
    });
  });

  $scope.toGroup = function(group) {
    if (group !== null)
      $state.go('tab.group-message', {groupId: group.id});
  }

  $scope.toUser = function(user) {
    if (user !== null)
      $state.go('tab.user-message', {userId: user.id});
  }

  $scope.toAll = function() {
    $state.go('tab.broadcast');
  }
})
.controller('BroadcastCtrl', function($scope, $state, MessageService) {
  $scope.destination = 'All';

  $scope.send = function() {
    MessageService.sendToAll().then(function(msgId) {
      $state.go('tab.messages-all-chat');
    });
  }
})
.controller('MsgAllChatCtrl', function($scope, MessageService) {
  $scope.destination = 'All';
  $scope.sendMsgHref = '#/tab/messages/broadcast';

  MessageService.messagesToAll().then(function(messages) {
    $scope.messages = messages;
    $scope.$apply;
  });
})
.controller('MsgUserChatCtrl', function($scope, $stateParams, MessageService, PeopleService) {
  PeopleService.get($stateParams.userId).then(function(user) {
    $scope.destObject = user;
    $scope.sendMsgHref = '#/tab';
    $scope.destination = user.attributes.username;
    $scope.$apply();

    MessageService.messagesToUser(user).then(function(messages) {
      $scope.messages = messages;
      $scope.$apply;
    });
  });
})
.controller('MsgGroupChatCtrl', function($scope, $stateParams, MessageService, GroupService) {
  GroupService.get($stateParams.groupId).then(function(group) {
    $scope.destObject = group;
    $scope.destination = group.attributes.name;
    $scope.$apply();

    MessageService.messagesToGroup(group).then(function(messages) {
      $scope.messages = messages;
      $scope.$apply;
    });
  })
})


.controller('PeopleCtrl', function($scope, PeopleService) {
  function updatePeopleList() {
    PeopleService.all().then(function(data) {
      $scope.people = data;
      $scope.$apply();
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
/*
.controller('NewUserCtrl', function($scope, $state, PeopleService) {
  $scope.addItem = function(form) {
    PeopleService.add(form.username.$modelValue, form.password.$modelValue).then(function() {
      console.log('new user added');
      $state.go('tab.people');
    });
  }
})
.controller('UserDetailCtrl', function($scope, $stateParams, PeopleService) {
  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    PeopleService.get($stateParams.userId).then(function(user) {
      $scope.user = user;
      $scope.$apply();
    })
  });
})

.controller('UserMsgCtrl', function($scope, $state, $stateParams, PeopleService, MessageService) {
  PeopleService.get($stateParams.userId).then(function(user) {
    $scope.destObject = user;
    $scope.destination = user.attributes.username;
    $scope.$apply();
  });

  $scope.send = function(user) {
    MessageService.sendToUser(user).then(function() {
      $state.go('tab.messages-user-chat', {userId: user.id});
    });
  }
})
*/


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
.controller('GroupDetailCtrl', function($scope, $stateParams, GroupService) {
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
