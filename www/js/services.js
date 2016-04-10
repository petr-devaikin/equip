angular.module('starter.services', [])

.factory('MessageService', function($cordovaFile) {
  var msgObj = Parse.Object.extend("Message");
  var user = Parse.User.current().fetch();

  var sendTestToConversation = function(convo, file) {
    var newMsg = new msgObj();
    var user = Parse.User.current();
    newMsg.set('fromUser', user);
    newMsg.set('conversation', convo);
    if (file !== undefined)
      newMsg.set('audioContent', file);
    newMsg.set('fromLocation', user.attributes.lastLocation);
    return newMsg.save();
  }

  return {
    allConversations: function() {
      return Parse.Cloud.run('getConversations', {
        user: Parse.User.current().id
      });
    },
    /*getConversation: function(convoId) {
      return
    },*/
    getReceivers: function() {
      return Parse.Cloud.run('getReceiverList', { user: Parse.User.current().id });
    },
    startConversationWithAll: function(pins) {
      return Parse.Cloud.run('startConversation', { startedBy: Parse.User.current().id, pins: pins });
    },
    startConversationWithGroup: function(group, pins) {
      return Parse.Cloud.run('startConversation', {
        startedBy: Parse.User.current().id,
        group: group.id
      });
    },
    startConversationWithLocation: function(location, pins) {
      return Parse.Cloud.run('startConversation', {
        startedBy: Parse.User.current().id,
        location: location.id,
        pins: pins
      });
    },
    startConversationWithGroup: function(group, pins) {
      return Parse.Cloud.run('startConversation', {
        startedBy: Parse.User.current().id,
        group: group.id,
        pins: pins
      });
    },
    sendTestToConversation: sendTestToConversation,
    sendToConversation: function(convo, msgBs64) {
      console.log('send messagge to a conversation');

      var file = new Parse.File('AFprova.m4a', { base64: msgBs64 });
      return file.save().then(function() {
        console.log("file saved on parse");
        return sendTestToConversation(convo, file);
      }, function(error){
        console.log("file saved error: " + error);

      });
    },
    getContentMessage: function(message){
      console.log('get audioFile');
      var audioContentMsg = message.get('audioContent');
      var url = audioContentMsg.url();
      console.log(url);
      return url;
      // query.exists('audioContent');
      // return query.get('audioContent');
    },
    pinToConvo: function(convo) {
      var newMsg = new msgObj();
      var user = Parse.User.current();
      newMsg.set('fromUser', user);
      newMsg.set('conversation', convo);
      newMsg.set('pinned', true);
      newMsg.set('fromLocation', user.attributes.lastLocation);
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

// .factory('RegistrationService', function(){
//
// })

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
        for (var i = 0; i < allGroups.length; i++){
          allGroups[i].followed = false;
          allGroups[i].number = 0;
        }

        var userGroupQuery = new Parse.Query(userGroupObj);
        //userGroupQuery.equalTo('user', Parse.User.current());
        userGroupQuery.include('group');
        userGroupQuery.include('user');

        return userGroupQuery.find().then(function(userGroups) {
          for (var i = 0; i < userGroups.length; i++) {
            var g = allGroups.find(function(g) { return g.id == userGroups[i].attributes.group.id; });
            if (g !== undefined) {
              g.number++;

              if (userGroups[i].attributes.user.id == Parse.User.current().id)
                g.followed = true;
            }
          }
          return Parse.Promise.as(allGroups);
        });
      //});
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
    userNumbGroup: function(group){
      var userNumberQuery = new Parse.Query(userGroupObj);
      userNumberQuery.equalTo('group',group);
      return userNumberQuery.count().then(function(count) {
        var count = count;
        //console.log("count: "+count);
        return Parse.Promise.as(count);
      });
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
      console.log('get locations request sent to server');
      var query = new Parse.Query(locationObj);
      return query.find().then(function(allLocation) {
        for(var i = 0; i < allLocation.length;i++ ){
          allLocation[i].number = 0;
        }
        var userNumberLoc = new Parse.Query(userObj);
        return userNumberLoc.find().then(function(user){
            for(var i = 0; i< user.length; i++){
              var l = allLocation.find(function(l){ return l.id == user[i].attributes.lastLocation.id;});
              //console.log("location user["+i+"] :"+user[i].attributes.lastLocation.id);
              if( l!== undefined)
                l.number++;
            }
            return Parse.Promise.as(allLocation);
        });
      });
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
