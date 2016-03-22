
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
    response.success("Hello world!");
});

Parse.Cloud.define("startConversation", function(request, response) {
    var convoObj = Parse.Object.extend("Conversation");
    var userConvoObj = Parse.Object.extend("UserConversation");
    var userObj = Parse.Object.extend("User");

    var author = new userObj();
    author.id = request.params.startedBy;
    author.fetch().then(
        function (author) {
            var newConvo = new convoObj();
            console.log(author);
            newConvo.set("startedBy", author);
            newConvo.set("fromLocation", author.attributes.lastLocation);
            newConvo.save().then(
                function (convo) {
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
        function (error) {
            response.error("cannot get user");
        }
    );
});
