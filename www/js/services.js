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

.factory('GroupService', function() {
  var groupObj = Parse.Object.extend("Group");
  var query = new Parse.Query(groupObj);

  return {
    all: function() {
      console.log('get groups request sent to server');
      return query.find();
    },
    add: function(name) {
      var newGroup = new groupObj();
      newGroup.set("name", name);
      console.log('send new group to server');
      return newGroup.save();
    },
    remove: function(group) {
      console.log('remove group sent to server ' + group.attributes.name);
      return group.destroy();
    }
  };
})

.factory('LocationService', function() {
  var locationObj = Parse.Object.extend("Location");
  var query = new Parse.Query(locationObj);

  var getAllQuery = query.find().then(function(data) {
    var locations = [];
    for (var index = 0; index < data.length; ++index) {
      var obj = data[index];
      locations.push({
        id: obj.id,
        name: obj.attributes.name
      });
    }
    console.log('locations found and processed');
    return Parse.Promise.as(locations);
  });


  return {
    all: function() { return getAllQuery; },
    remove: function(location) {
      //locations.splice(locations.indexOf(location), 1);
    }
  };
});
