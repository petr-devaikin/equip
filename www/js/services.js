angular.module('starter.services', [])

.factory('MessageService', function($cordovaFile) {
  var msgObj = Parse.Object.extend("Message");
  var user = Parse.User.current().fetch();



  return {
    all: function() {
      var query = new Parse.Query(msgObj);
      query.include('fromUser');
      query.include('fromUser');
      query.include('toGroup');
      query.include('toLocation');
      query.descending('createdAt');
      console.log('get messages request sent to server');
      return query.find();
    },
    sendToAll: function(msgBs64) {
      console.log('send messagge to all request');
      //var fileP = new File("ciccio.txt");

      //var buffer = $cordovaFile.readAsDataURL(cordova.file.externalRootDirectory,pathMessage);
      var fileParse = new Parse.File('AFprova.m4a', msgBs64);
      console.log(msgBs64);

      //var file = new Parse.File('AFprova.m4a', { base64: msgBs64 });
      var newMsg = new msgObj();
      newMsg.set('fromUser', Parse.User.current());
      newMsg.set('audioContent', fileParse);
      return newMsg.save();
    },
    sendToGroup: function(group, pathMessage) {
      var audioFile = new File(pathMessage);
      var fileParse = new Parse.File('AFprova.m4a',audioFile,'audioFile');
      var newMsg = new msgObj();
      newMsg.set('fromUser', Parse.User.current());
      newMsg.set('toGroup', group);
      newMsg.set('audioContent', fileParse);
      return newMsg.save();
    },
    sendToLocation: function(location, pathMessage) {
      var audioFile = new File(pathMessage);
      var fileParse = new Parse.File('AFprova.m4a',audioFile,'audioFile');
      var newMsg = new msgObj();
      newMsg.set('fromUser', Parse.User.current());
      newMsg.set('toLocation', location);
      newMsg.set('audioContent', fileParse);
      return newMsg.save();
    },
    getContentMessage: function(msgId){
      console.log('get audioFile');
      var query = new Parse.Query(msgObj);
      query.exists('audioContent');
      query.equalTo('Message', msgId);
      return query.get('audioContent');
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
    currentUser: function() {
      var user = Parse.User.current();
      return user.fetch();
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
      return query.find().then(function(allGroups) {
        for (var i = 0; i < allGroups.length; i++)
          allGroups[i].followed = false;

        var userGroupQuery = new Parse.Query(userGroupObj);
        userGroupQuery.equalTo('user', Parse.User.current());
        userGroupQuery.include('group');

        return userGroupQuery.find().then(function(userGroups) {
          for (var i = 0; i < userGroups.length; i++) {
            var g = allGroups.find(function(g) { return g.id == userGroups[i].attributes.group.id; });
            if (g !== undefined)
              g.followed = true;
          }
          return Parse.Promise.as(allGroups);
        })
      });
    },
    add: function(name) {
      var newGroup = new groupObj();
      newGroup.set('name', name);
      console.log('send new group to server');
      return newGroup.save();
    },
    remove: function(group) {
      console.log('remove group sent to server ' + group.attributes.name);
      // REMOVE userGroup of this group! or cascade?
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
      if (user === undefined)
        newUserGroup.set('user', Parse.User.current());
      else
        newUserGroup.set('user', user);

      return newUserGroup.save();
    },
    removeUser: function(group, user) {
      var userGroupQuery = new Parse.Query(userGroupObj);
      userGroupQuery.equalTo('group', group);
      if (user === undefined)
        userGroupQuery.equalTo('user', Parse.User.current());
      else
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
    },
    updateLocation: function(location) {
      var user = Parse.User.current();
      user.set('lastLocation', location);
      user.set('lastLocationDate', new Date());
      return user.save();
    },
    confirmLocation: function() {
      var user = Parse.User.current();
      user.set('lastLocationDate', new Date());
      return user.save();
    }
  };
});
