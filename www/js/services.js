angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('PeopleService', function() {
  var userObj = Parse.Object.extend("User");
  var query = new Parse.Query(userObj);

  return {
    all: function() {
      console.log('get people request sent to server');
      return query.find();
    },
    add: function(name, password) {
      var newUser = new userObj();
      newUser.set("username", name);
      newUser.set("password", password);
      console.log('send new user to server');
      return newUser.save();
    },
    remove: function(user) {
      console.log('remove user sent to server ' + user.attributes.name);
      return user.destroy();
    }
  };
})

.factory('GroupService', function() {
  var groupObj = Parse.Object.extend('Group');
  var userGroupObj = Parse.Object.extend('UserGroup');
  var userObj = Parse.Object.extend('User');

  return {
    all: function() {
      console.log('get groups request sent to server');
      var query = new Parse.Query(groupObj);
      return query.find();
    },
    add: function(name) {
      var newGroup = new groupObj();
      newGroup.set('name', name);
      console.log('send new group to server');
      return newGroup.save();
    },
    remove: function(group) {
      console.log('remove group sent to server ' + group.attributes.name);
      return group.destroy();
    },
    get: function(groupId) {
      var query = new Parse.Query(groupObj);
      return query.get(groupId);
    },
    usersInGroup: function(group) {
      var userGroupQuery = new Parse.Query(userGroupObj);
      userGroupQuery.equalTo('group', group);
      userGroupQuery.include('user');
      return userGroupQuery.find().then(function(userGroups) {
        var users = [];
        for (var i = 0; i < userGroups.length; i++) {
          users.push(userGroups[i].get("user"));
        }
        return Parse.Promise.as(users);
      });
    },
    usersNotInGroup: function(userInGroupIds) {
      var userQuery = new Parse.Query(userObj);
      userQuery.notContainedIn('objectId', userInGroupIds);
      return userQuery.find();
    },
    addUser: function(group, user) {
      var newUserGroup = new userGroupObj();
      newUserGroup.set('group', group);
      newUserGroup.set('user', user);
      return newUserGroup.save();
    },
    removeUser: function(group, user) {
      var userGroupQuery = new Parse.Query(userGroupObj);
      userGroupQuery.equalTo('group', group);
      userGroupQuery.equalTo('user', user);
      return userGroupQuery.first().then(function(userGroup) {
        return userGroup.destroy();
      });
    }
  };
})

.factory('LocationService', function() {
  var locationObj = Parse.Object.extend("Location");
  var query = new Parse.Query(locationObj);

  return {
    all: function() {
      console.log('get locations request sent to server');
      return query.find();
    },
    add: function(name) {
      var newLocation = new locationObj();
      newLocation.set("name", name);
      console.log('send new location to server');
      return newLocation.save();
    },
    remove: function(location) {
      console.log('remove location sent to server ' + location.attributes.name);
      return location.destroy();
    }
  };
});
