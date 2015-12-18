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

.factory('Groups', function() {
  var groupObj = Parse.Object.extend("Group");
  var query = new Parse.Query(groupObj);

  var groups = [];

  query.find({
    success:function(results) {
      for (var index = 0; index < results.length; ++index) {
        var obj = results[index];
        groups.push({
          id: obj.id,
          name: obj.attributes.name
        });
      }
    },
    error:function(error) {
      console.log("Error retrieving groups!");
    }
  });

  return {
    all: function() {
      return groups;
    },
    get: function(groupId) {
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].id === groupId) {
          return groups[i];
        }
      }
      return null;
    }
  };
})

.factory('Locations', function() {
  var locationObj = Parse.Object.extend("Location");
  var query = new Parse.Query(locationObj);

  var locations = [];

  query.find({
    success:function(results) {
      for (var index = 0; index < results.length; ++index) {
        var obj = results[index];
        locations.push({
          id: obj.id,
          name: obj.attributes.name
        });
      }
    },
    error:function(error) {
      console.log("Error retrieving locations!");
    }
  });


  return {
    all: function() {
      return locations;
    },
    remove: function(location) {
      locations.splice(locations.indexOf(location), 1);
    },
    get: function(locationId) {
      for (var i = 0; i < locations.length; i++) {
        if (locations[i].id === locationId) {
          return locations[i];
        }
      }
      return null;
    }
  };
});
