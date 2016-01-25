angular.module('starter.services', [])

.factory('MessageService', function() {
  var msgObj = Parse.Object.extend("Message");

  return {
    all: function() {
      var query = new Parse.Query(msgObj);
      query.include('fromUser');
      query.include('toGroup');
      query.include('toLocation');
      query.descending('createdAt');
      console.log('get messages request sent to server');
      return query.find();
    },
    sendToAll: function(data) {
      var newMsg = new msgObj();
      newMsg.set('fromUser', Parse.User.current());
      return newMsg.save();
    },
    sendToGroup: function(group, data) {
      var newMsg = new msgObj();
      newMsg.set('fromUser', Parse.User.current());
      newMsg.set('toGroup', group);
      return newMsg.save();
    },
    sendToLocation: function(location, data) {
      var newMsg = new msgObj();
      newMsg.set('fromUser', Parse.User.current());
      newMsg.set('toLocation', location);
      return newMsg.save();
    }
    
  };
})



.factory('AuthService', function() {
  var userObj = Parse.Object.extend("User");

  return {
    signIn: function(login, password) {
      return Parse.User.logIn(login, password);
    }
  };
})

.factory('PeopleService', function() {
  var userObj = Parse.Object.extend("User");

  return {
    all: function() {
      var query = new Parse.Query(userObj);
      query.include('lastLocation');
      console.log('get people request sent to server');
      return query.find();
    },
    get: function(userId) {
      var query = new Parse.Query(userObj);
      query.include('lastLocation');
      return query.get(userId);
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
  var userObj = Parse.Object.extend('User');

  return {
    all: function() {
      var query = new Parse.Query(locationObj);
      console.log('get locations request sent to server');
      return query.find();
    },
    get: function(locationId) {
      var query = new Parse.Query(locationObj);
      return query.get(locationId);
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
    },
    usersAtLocation: function(location) {
      var query = new Parse.Query(userObj);
      query.equalTo('lastLocation', location);
      return query.find();
    }
  };
});
