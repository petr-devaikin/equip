angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, AuthService) {
  $scope.login = function(form) {
    AuthService.signIn(form.phoneEmail.$modelValue, form.password.$modelValue)
      .done(function(user) {
        if (user.attributes.username == 'admin') {
          $state.go('eventDetails');
        }
        else {
          $state.go('tab.messages');
        }
      })
      .fail(function(error) {
        console.log('Auth error');
        $state.go('tab.messages');
      });
  }
})

.controller('EventDetailsCtrl', function($scope, $state, PeopleService) {
  function updatePeopleList() {
    PeopleService.all().then(function(data) {
      $scope.people = data;
      $scope.$apply();
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updatePeopleList();
  });

  $scope.addUser = function(form) {
    PeopleService.add(form.phoneEmail.$modelValue, '123').then(function() {
      updatePeopleList();
    });
  }
})

.controller('MessagesCtrl', function($scope, MessageService, $cordovaCapture,$cordovaNativeAudio, PeopleService, LocationService, $cordovaFile, $cordovaMedia ) {


  //var src = '/sound/test.mp3';
  //var media = $cordovaMedia.newMedia(src);
  //media.seekTo(5000); // milliseconds value

  //var src = "myrecording.mp3";
  //var mediaRec = $cordovaMedia.newMedia(src, mediaSuccess, mediaError);

  // $cordovaNativeAudio.preloadSimple('click', 'sound/audioFileEquip.m4a')
  //   .then(function (msg) {
  //     console.log(msg);
  //   }, function (error) {
  //     alert(error);
  //   });

  var recorder = new Object;

  recorder.stop = function() {
    window.plugins.audioRecorderAPI.stop(function(msg) {querySelector('query')
      // success
      console.log('ok: ' + msg);
    }, function(msg) {
      // failed
      console.log('ko: ' + msg);
    });
  }

  recorder.playback = function() {
    window.plugins.audioRecorderAPI.playback(function(msg) {
      // complete
      console.log('ok: ' + msg);
    }, function(msg) {
      // failed
      console.log('ko: ' + msg);
    });
  }

  recorder.record = function() {
    window.plugins.audioRecorderAPI.record(function(msg) {
      // complete
      recorder.playback();
      console.log('ok: ' + msg);
    }, function(msg) {
      // failed
      console.log('ko: ' + msg);
    }); // record 30 seconds
  }


  function updateMessageList() {
    MessageService.all().then(function(data) {
      $scope.messages = data.slice(0, 1);
      $scope.$apply();
    });
  }

  function checkLocation() {
    PeopleService.currentUser().then(function(user) {
      $scope.lastLocation = user.attributes.lastLocation;

      $scope.askForLocation = user.attributes.lastLocationDate === undefined ||
        (new Date()).getTime() - user.attributes.lastLocationDate.getTime() > 1000 * 60 * 30;

      if ($scope.askForLocation) {
        LocationService.all().then(function(locations) {
          $scope.locations = locations;
          $scope.$apply();
        })
      }
      else
        $scope.$apply();
    });
  }

  var updateTimer = undefined;

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateMessageList();
    checkLocation();

    updateTimer = setInterval(function() {
      updateMessageList();
      checkLocation();
    }, 10000);
  });

  $scope.$on('$ionicView.leave', function (viewInfo, state) {
    clearInterval(updateTimer);
  });

  $scope.sendToAll = function(pathMessage) {
    MessageService.sendToAll(pathMessage)
      .then(function() {
        updateMessageList();
      });
  }

  $scope.sendToGroup = function(group) {
    MessageService.sendToGroup(group, "")
      .then(function() {
        updateMessageList();
      });
  }

  $scope.sendToLocation = function(location) {
    MessageService.sendToLocation(location, "")
      .then(function() {
        updateMessageList();
      });
  }

  var captureSuccess = function(mediaFiles) {
    var i, path, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        path = mediaFiles[i].fullPath;
        // do something interesting with the file
    }
};

// capture error callback
var captureError = function(error) {
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
};

$scope.startRecordingAudio = function(){
  onsole.log('start record audio');
  // start audio capture
  navigator.device.capture.captureAudio(captureSuccess, captureError, {limit:2});

}


  $scope.startRecording = function(){
    console.log('start recording');
    //recorder.record();
    window.plugins.audioRecorderAPI.record(function(savedFilePath) {

    var fileName = savedFilePath.split('/')[savedFilePath.split('/').length - 1];
    var directory;



    if (cordova.file.documentsDirectory) {
      directory = cordova.file.documentsDirectory; // for iOS
    } else {
      directory = cordova.file.externalRootDirectory; // for Android
    }

    console.log(directory);
    console.log(fileName);

    //base64 for parse

    // abPathMessage = directory+"audioFileEquip.m4a";
    //
    // var file = new Media(abPathMessage);
    //  var reader = new FileReader();
    //  reader.onload = function(readerEvt) {
    //         var binaryString = readerEvt.target.result;
    //         console.log(btoa(binaryString));
    //     };
    //
    //     reader.readAsBinaryString(file);





    $cordovaFile.copyFile(
      cordova.file.dataDirectory, fileName,
      directory, "audioFileEquip.m4a"
    ).then(function (success) {


      var allPath = directory+"audioFileEquip.m4a";
      window.plugins.Base64.encodeFile(allPath, function(base64){
            //console.log('file base64 encoding: ' + base64);


            var base64Audio= base64.substring(34);

            console.log('file base64 encoding: ' + base64Audio);

            MessageService.sendToAll(base64Audio)
              .done(function() {
                updateMessageList();
                console.log('DONE message sent to all');
              })
              .fail(function(msg){
                console.log('FAIL message sent to all: '+msg);
              });
        });

      //$cordovaFile.readFile(abPathMessage);

      // var buffer = $cordovaFile.readAsDataURL(directory,"audioFileEquip.m4a");
      // console.log(buffer);
      // var bufferRead;
      // var fileReader = new FileReader();
      //   fileReader.onload = function() {
      //     bufferRead = this.result;
      //   };
      //   fileReader.readAsArrayBuffer(buffer);
      //   console.log(bufferRead);

        // MessageService.sendToAll($cordovaFile.readAsArrayBuffer(directory,"audioFileEquip.m4a"))
        //   .then(function() {
        //     updateMessageList();
        //   });
      }, function (error) {
        alert(JSON.stringify(error));
      });
  }, function(msg) {
    alert('ko: ' + msg);
  }, 5);





    //  var mp3URL = ("testEquip.mp3");
      // var media = $cordovaMedia.newMedia(mp3URL, mediaSuccess, mediaError);
      // media.startRecord();


  }


  $scope.stopRecording = function(){
    console.log('stop recording');
    //recorder.stop();
    //media.stopRecord();
    //media.release();
  }

  $scope.playMessage = function(message){
    console.log('play message');


    //MessageService.getContentMessage(message).then(function(audioFileEquip){
    //});

    if (cordova.file.documentsDirectory) {
      directory = cordova.file.documentsDirectory; // for iOS
    } else {
      directory = cordova.file.externalRootDirectory; // for Android
    }



    // $cordovaNativeAudio.preloadSimple('click', 'audioFileEquip.m4a')
    //   .then(function (msg) {
    //     console.log(msg);
    //   }, function (error) {
    //     alert(error);
    //   });

    var myMedia = $cordovaMedia.newMedia(directory+"audioFileEquip.m4a");
    myMedia.play(); // Android


    // var mp3URL = getMediaURL("testEquip.mp3");
    // var media = $cordovaMedia.newMedia(mp3URL, mediaSuccess, mediaError);
    // media.play();

  }

  function getMediaURL(s) {
    if(device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
    return s;
}


function mediaError(e) {
    alert('Media Error');
    alert(JSON.stringify(e));
}

function mediaSuccess() {
    alert('Media Success');
}

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateMessageList();
  });

  $scope.updateLocation = function(newLocation) {
    console.log(newLocation);
    if (newLocation !== null)
      LocationService.updateLocation(newLocation).then(function() {
        checkLocation();
      });
  }

  $scope.confirmLocation = function() {
    LocationService.confirmLocation().then(function() {
      checkLocation();
    });
  }
})


.controller('GroupsCtrl', function($scope, GroupService) {
  function updateGroupList() {
    GroupService.all().then(function(data) {
      $scope.groups = data;
      console.log(data);
      $scope.$apply();
      console.log('scope.groups updated');
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateGroupList();
  });

  $scope.remove = function(group) {
    GroupService.remove(group).then(function() {
      console.log('group destroyed');
      updateGroupList();
    });
  }

  $scope.addGroup = function(form) {
    GroupService.add(form.groupName.$modelValue).then(function() {
      updateGroupList();
    });
  }

  $scope.follow = function(group) {
    if (group.followed) {
      group.followed = false;
      GroupService.removeUser(group);
    }
    else {
      group.followed = true;
      GroupService.addUser(group);
    }
  }
})
.controller('GroupDetailCtrl', function($scope, $state, $stateParams, GroupService, MessageService) {
  function updateGroupInfo() {
    GroupService.get($stateParams.groupId).then(function(data) {
      $scope.group = data;
      $scope.$apply();

      GroupService.usersInGroup(data).then(function(users) {
        $scope.usersInGroup = users;
        var ids = users.map(function(u) { return u.id; });
      });
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateGroupInfo();
  });

  $scope.sendMessage = function(group) {
    MessageService.sendToGroup(group, "")
      .then(function() {
        $state.go('tab.messages');
      });
  }
})


.controller('LocationsCtrl', function($scope, LocationService) {
  function updateLocationList() {
    LocationService.all().then(function(data) {
      $scope.locations = data;
      $scope.$apply();
      console.log('scope.locations updated');
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateLocationList();
  });

  $scope.remove = function(location) {
    LocationService.remove(location).then(function() {
      updateLocationList();
    });
  }

  $scope.addLocation = function(form) {
    LocationService.add(form.locationName.$modelValue).then(function() {
      updateLocationList();
    });
  }
})
.controller('LocationDetailCtrl', function($scope, $state, $stateParams, LocationService, MessageService) {
  function updateLocationInfo() {
    LocationService.get($stateParams.locationId).then(function(data) {
      $scope.location = data;
      $scope.$apply();
      console.log('location info received');

      LocationService.usersAtLocation(data).then(function(users) {
        $scope.users = users;
        $scope.$apply();
        console.log('people at location received');
      });
    });
  }

  $scope.$on('$ionicView.enter', function (viewInfo, state) {
    updateLocationInfo();
  });


  $scope.sendMessage = function(location) {
    MessageService.sendToLocation(location, "")
      .then(function() {
        $state.go('tab.messages');
      });
  }
});
