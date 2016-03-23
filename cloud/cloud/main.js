
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
    response.success("Hello world!");
});

function saveConvo(author, response, group, locationId) {
    var userObj = Parse.Object.extend("User");
    var userConvoObj = Parse.Object.extend("UserConversation");
    var convoObj = Parse.Object.extend("Conversation");

    var newConvo = new convoObj();
    newConvo.set("startedBy", author);
    newConvo.set("fromLocation", author.attributes.lastLocation);

    newConvo.save().then(
        function (convo) {
            // ADD GROUP PARTICIPANT
            // ADD PEOPLE IN LOCATION

            var query = new Parse.Query(userObj);
            query.find().then(
                function (users) {
                    for (var i = 0; i < users.length; i++) {
                        var newUserConvo = new userConvoObj();
                        newUserConvo.set("user", users[i]);
                        newUserConvo.set("conversation", convo);
                        newUserConvo.save();
                    }

                    response.success(newConvo);
                },
                function (error) {
                    response.error("cannot get user list");
                }
            );
        },
        function (error) {
            console.log(error);
            response.error("cannot save conversation: " + error);
        }
    );
}

Parse.Cloud.define("startConversation", function(request, response) {
    var userObj = Parse.Object.extend("User");
    var groupObj = Parse.Object.extend("Group");

    var author = new userObj();
    author.id = request.params.startedBy;
    author.fetch().then(
        function (author) {
            if (request.group !== undefined) {
                var group = new groupObj();
                group.id = request.group;
                group.fetch().then(
                    function(group) {
                        saveConvo(author, response, group);
                    },
                    function(error) {
                        response.error("cannot get group info");
                    }
                );
            }
            else if (request.location !== undefined) {
                saveConvo(author, response, undefined, request.location);
            }
            else
                saveConvo(author, response);
        },
        function (error) {
            response.error("cannot get conversation author");
        }
    );

});


Parse.Cloud.define("getConversations", function(request, response) {
    var convoObj = Parse.Object.extend("Conversation");
    var userConvoObj = Parse.Object.extend("UserConversation");
    var userObj = Parse.Object.extend("User");
    var messageObj = Parse.Object.extend("Message");

    var list = [];

    var user = new userObj();
    user.id = request.params.user;
    user.fetch().then(
        function (user) {
            query = new Parse.Query(userConvoObj);
            query.equalTo("user", user);
            query.include("conversation");
            query
                .each(function (userConvo) {
                    var convo = new Parse.Query(convoObj);
                    convo.include("startedBy");
                    convo.include("toGroup");
                    convo.include("toLocation");
                    console.log("get info for convo: " + convo.id);
                    return convo.get(userConvo.attributes.conversation.id)
                        .then(function(c) {
                            var msgQuery = new Parse.Query(messageObj);
                            msgQuery.equalTo("conversation", c);
                            msgQuery.include("fromUser");
                            msgQuery.include("fromLocation");
                            return msgQuery.find().then(function (messages) {
                                list.push({ conversation: c, messages: messages });
                            });
                        });
                })
                .then(
                    function () {
                        response.success(list);
                    },
                    function (error) {
                        response.error("cannot get list of conversations: " + error);
                    }
                );
        },
        function (obj, error) {
            response.error("cannot get user: " + error);
        }
    );
});

Parse.Cloud.define("getReceiverList", function(request, response) {
    var groupObj = Parse.Object.extend("Group");
    var userGroupObj = Parse.Object.extend("UserGroup");
    var userObj = Parse.Object.extend("User");
    var locationObj = Parse.Object.extend("Location");

    var receivers = [];
    receivers.push({
        name: "All",
        featured: true,
        entity: null
    });

    var user = new userObj();
    user.id = request.params.user;
    user.fetch().then(
        function(user) {
            var query = new Parse.Query(groupObj);
            query.find().then(
                function(allGroups) {
                    var groups = {}
                    for (var i = 0; i < allGroups.length; i++)
                        groups[allGroups[i].id] = {
                            name: allGroups[i].attributes.name,
                            featured: false,
                            entity: allGroups[i]
                        }

                    var query = new Parse.Query(userGroupObj);
                    query.equalTo("user", user);
                    query.find().then(
                        function(userGroups) {
                            for (var i = 0; i < userGroups.length; i++)
                                groups[userGroups[i].attributes.group.id].featured = true;

                            var groupArray = [];
                            for (var i in groups)
                                groupArray.push(groups[i]);

                            groupArray.sort(function(a, b) {
                                if (a.featured && !b.featured)
                                    return -1;
                                else if (!a.featured && b.featured)
                                    return 1;
                                else
                                    return a.entity.attributes.name - b.entity.attributes.name;
                            });

                            var query = new Parse.Query(locationObj);
                            query.find().then(
                                function(allLocations) {
                                    var locations = [];
                                    for (var i = 0; i < allLocations.length; i++) {
                                        locations.push({
                                            name: allLocations[i].attributes.name,
                                            featured: allLocations[i].id == user.attributes.lastLocation.id,
                                            entity: allLocations[i]
                                        });
                                    }

                                    locations.sort(function(a, b) {
                                        if (a.featured && !b.featured)
                                            return -1;
                                        else if (!a.featured && b.featured)
                                            return 1;
                                        else
                                            return a.entity.attributes.name - b.entity.attributes.name;
                                    });

                                    receivers.push(locations[0]);
                                    receivers = receivers.concat(groupArray.slice(0, userGroups.length));
                                    receivers = receivers.concat(locations.slice(1));
                                    receivers = receivers.concat(groupArray.slice(userGroups.length));

                                    response.success(receivers);
                                },
                                function(error) {
                                    response.error("cannot get all location list");
                                }
                            );
                        },
                        function(error) {
                            response.error("cannot get groups of user");
                        }
                    );
                },
                function(error) {
                    response.error("cannot get all group list");
                });
        },
        function(error) {
            response.error("cannot get user: " + error);
        }
    );
});
