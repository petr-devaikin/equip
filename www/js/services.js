angular.module('starter.services', [])

.factory('MessageService', function($cordovaFile) {
  var msgObj = Parse.Object.extend("Message");
  var user = Parse.User.current().fetch();
  var userObj = Parse.Object.extend('User');

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

      var pushQuery = new Parse.Query(Parse.Installation);
      pushQuery.equalTo('channels', 'SampleChannel');

      if(convo.attributes.toGroup){
        console.log('send messagge to group');
          Parse.Push.send({
              where: pushQuery,
              data: {
                  alert: "New messagge to "+convo.attributes.toGroup.attributes.name+" from "+Parse.User.current().attributes.username
              }
          },
          {
              success: function() {
                  console.log("push sent");
              },
              error: function(error) {
                  console.log("push faild: "+error);
              }
          });
        } else if (convo.attributes.toLocation) {
          console.log('send messagge to a location');
              Parse.Push.send({
                  where: pushQuery,
                  data: {
                      alert: "New messagge to "+convo.attributes.toLocation.attributes.name+" from "+Parse.User.current().attributes.username
                  }
              },
              {
                  success: function() {
                      console.log("push sent");
                  },
                  error: function(error) {
                      console.log("push faild: "+error);
                  }
              });
        } else {
          console.log('send messagge to a all');
          Parse.Push.send({
              where: pushQuery,
              data: {
                  alert: "New messagge to all from "+Parse.User.current().attributes.username
              }
          },
          {
              success: function() {
                  console.log("push sent");
              },
              error: function(error) {
                  console.log("push faild: "+error);
              }
          });

        }

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
              var l = allLocation.find(function(l){ return user[i].attributes.lastLocation !== undefined && l.id == user[i].attributes.lastLocation.id;});
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
})

.factory('PubNub', function() {
  var pubnub = null;
  var authKey = PUBNUB.uuid();

  console.log(authKey);

  pubnub = PUBNUB.init({
    publish_key: 'pub-c-4d2f0d68-5c2a-4d64-aa54-9d382997d717',
    subscribe_key: 'sub-c-fbba2b9a-059b-11e6-a6dc-02ee2ddab7fe',
    auth_key: authKey,
    origin: 'pubsub.pubnub.com',
    ssl: true
  });

  var isOnline = false;
  var onConnect = function(onOnlineStatusChanged) {
    var changed = isOnline === false;
    isOnline = true;
    if (typeof onOnlineStatusChanged === "function") {
      if (changed) {
        onOnlineStatusChanged(true);
      }
    }
  };
  var ret =
  {
    uuid: authKey,
    publish: function(channel, message) {
      message.source = authKey;
      info = {
        channel: channel,
        message: JSON.stringify(message)
      };
      pubnub.publish(info);
    },
    subscribe: function(channel, callback) {
      var result = pubnub.subscribe({
        channel: channel,
        callback: function(message) {
          callback(message);
        },
        error: function(message) {
          callback(message);
        }
      });
    },
    onOnlineStatusChanged: function(callback) {
      var result = pubnub.subscribe({
        channel: 'broadcast',
        callback: function(message) {
          if (message.length < 2 || message.indexOf('{') !== 0) {
            return;
          }
          console.log(JSON.parse(message));
        },
        connect: function() {
          onConnect(callback);
        },
        disconnect: function() {
          var changed = isOnline === true;
          isOnline = false;
          if (typeof callback === "function") {
            if (changed) {
              callback(false);
            }
          }
        },
        reconnect: function() {
          onConnect(callback);
        },
        restore: true,
        error: function(message) {
          console.log(message);
        }
      });
    }
  };
  return ret;
});
