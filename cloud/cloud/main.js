
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
    response.success("Hello world!");
});

function saveConvo(author, pins, response, group, location) {
    var userObj = Parse.Object.extend("User");
    var userConvoObj = Parse.Object.extend("UserConversation");
    var convoObj = Parse.Object.extend("Conversation");
    var userGroupObj = Parse.Object.extend("UserGroup");

    var newConvo = new convoObj();
    newConvo.set("startedBy", author);
    newConvo.set("fromLocation", author.attributes.lastLocation);
    newConvo.set("peopleNeeded", pins);

    if (group !== undefined)
        newConvo.set("toGroup", group);

    if (location !== undefined)
        newConvo.set("toLocation", location);

    newConvo.save().then(
        function (convo) {
            if (group !== undefined) {
                var query = new Parse.Query(userGroupObj);
                query.equalTo("group", group);
                query.include("user");

                // Find devices associated with these users
                var pushQuery = new Parse.Query(Parse.Installation);
                pushQuery.matchesQuery('user', query);

                // Send push notification to query
                    Parse.Push.send({
                        where: pushQuery,
                        data: {
                            alert: "New message on group"
                        }
                    }, {
                        success: function() {
                            console.log("push sent");
                        },
                        error: function(error) {
                            console.log("push faild: "+error);
                        }
                    });

                var authorFound = false;

                // Find devices associated with these users
                // var pushQuery = new Parse.Query(Parse.Installation);
                // pushQuery.matchesQuery('user', query);
                //
                // // Send push notification to query
                // Parse.Push.send({
                //   where: pushQuery,
                //   data: {
                //     alert: "Prova push"
                //   }
                // }, {
                //   success: function() {
                //     console.log("Push send OK");
                //   },
                //   error: function(error) {
                //     console.log("Push FAIL: "+ error);
                //   }
                // });

                query.find().then(
                    function (userGroups) {
                        for (var i = 0; i < userGroups.length; i++) {
                            if (userGroups[i].attributes.user.id == author.id)
                                authorFound = true;

                            var newUserConvo = new userConvoObj();
                            newUserConvo.set("user", userGroups[i].attributes.user);
                            newUserConvo.set("conversation", convo);
                            newUserConvo.save();
                        }

                        // add author if he is not in the group
                        if (!authorFound) {
                            var newUserConvo = new userConvoObj();
                            newUserConvo.set("user", author);
                            newUserConvo.set("conversation", convo);
                            newUserConvo.save();
                        }

                        response.success(newConvo);
                    },
                    function (error) {
                        response.error("cannot get user list");
                    }
                );
            }
            else if (location !== undefined) {
                // add author if he is not at the location
                if (location.id != author.attributes.lastLocation.id) {
                    var newUserConvo = new userConvoObj();
                    newUserConvo.set("user", author);
                    newUserConvo.set("conversation", convo);
                    newUserConvo.save();
                }



                // add others at location
                var query = new Parse.Query(userObj);
                query.equalTo("lastLocation", location);
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
            }
            else {
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
            }
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
    var locationObj = Parse.Object.extend("Location");

    var author = new userObj();
    author.id = request.params.startedBy;

    if (request.params.group !== undefined) {
        var group = new groupObj();
        group.id = request.params.group;
        group.fetch().then(
            function(group) {
                console.log("start convo to group");
                saveConvo(author, request.params.pins, response, group);
            },
            function(error) {
                response.error("cannot get group info");
            }
        );
    }
    else if (request.params.location !== undefined) {
        var location = new locationObj();
        location.id = request.params.location;
        location.fetch().then(
            function(location) {
                console.log("start convo to location");
                saveConvo(author, request.params.pins, response, undefined, location);
            },
            function(error) {
                response.error("cannot get location info");
            }
        );
    }
    else
        saveConvo(author, request.params.pins, response);

});


Parse.Cloud.define("getConversations", function(request, response) {
    var convoObj = Parse.Object.extend("Conversation");
    var userConvoObj = Parse.Object.extend("UserConversation");
    var userObj = Parse.Object.extend("User");
    var messageObj = Parse.Object.extend("Message");

    var list = [];

    var user = new userObj();
    user.id = request.params.user;

    var query = new Parse.Query(userConvoObj);
    query.equalTo("user", user);
    query.include("conversation");


    query.find().then(
        function (userConversations) {
            var conversations = [];
            var result = {}
            for (var i = 0; i < userConversations.length; i++) {
                var c = userConversations[i].attributes.conversation;
                conversations.push(c);
                result[c.id] = { conversation: c, messages: [] };
            }

            var msgQuery = new Parse.Query(messageObj);
            msgQuery.containedIn("conversation", conversations);
            msgQuery.include("fromUser");
            msgQuery.include("fromLocation");

            msgQuery.find().then(
                function (messages) {
                    for (var i = 0; i < messages.length; i++) {
                        var c = result[messages[i].attributes.conversation.id];//conversations.find
                        c.messages.push(messages[i]);
                    }

                    response.success(result);
                },
                function (error) {
                    response.error("cannot get list of messages: " + error);
                });
        },
        function (error) {
            response.error("cannot get list of conversations: " + error);
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
        entity: null,
        number:0
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
                            entity: allGroups[i],
                            number: 1
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
                                            entity: allLocations[i],
                                            number: 1
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
