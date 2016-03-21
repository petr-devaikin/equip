
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("startConversation", function(request, response) {
  console.log("start conversation");

  var convoObj = Parse.Object.extend("Conversation");
  var userConvoObj = Parse.Object.extend("UserConversation");
  var userObj = Parse.Object.extend("User");

  var addReceivers;


  var author = new userObj();
  author.id = request.params.startedBy;
  author.fetch().then(
    function (author) {
        var newConvo = new convoObj();
        console.log(author);
        newConvo.set("startedBy", author);
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
