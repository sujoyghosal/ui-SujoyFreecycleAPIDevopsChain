/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var user_id = '';
var pushNotification = null;
var app = {
    // Application Constructor
    initialize: function (id) {
        user_id = id;
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        pushNotification = window.plugins.pushNotification;
        pushNotification.register(app.successHandler, app.errorHandler, { "senderID": "733495752777", "ecb": "app.onNotificationGCM" });
 /*       else {
            httpGetAsync("http://sujoyghosal-test.apigee.net/donation/detachgcmidsfromuser?uuid="
                + user_id, function (data) {
                    console.log("Response from attachgcmidtouser: " + data);
                });
        }*/
        //           pushNotification.unregister(app.successHandler, app.errorHandler);
        pushNotification.setApplicationIconBadgeNumber(this.successHandler, 0);
    },   
    // result contains any message sent from the plugin call
    successHandler: function (result) {
        console.log('Pushnotification Callback Success! Result = ' + result);
    },
    errorHandler: function (error) {
        alert('Callback Error! Result = ' + error);
    },
    onNotificationGCM: function (e) {
        switch (e.event) {
            case 'registered':
                if (e.regid.length > 0) {
                    console.log("Regid " + e.regid);                  
                    //                   registerDevice(e.regid);
                    alert("PUSH Registered");
                    httpGetAsync("http://sujoyghosal-test.apigee.net/donation/attachgcmidtouser?uuid="
                        + user_id + "&gcmid=" + e.regid, function (data) {
                            console.log("Response from attachgcmidtouser: " + data);
                        });
                }
                break;

            case 'message':
                // this is the actual push notification. its format depends on the data model from the push server             
                alert('message = ' + e.message);
                break;

            case 'error':
                alert('GCM error = ' + e.msg);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    }

};
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
};
function registerDevice(regid) {
    var orgName = "sujoyghosal";
    var appName = "DONATEINDIA";
    var notifier = "donationpush";

    // IMPORTANT! Change the senderID value to match your 
    // Google API project number.
    //   var senderID = "733495752777";

    var client = null;
    console.log("Before Apigee Client constrctor");
    client = new Apigee.Client({
        orgName: orgName,
        appName: appName,
        logging: true, //optional - turn on logging, off by default
        buildCurl: true //optional - log network calls in the console, off by default
    });
    console.log("registering device with token (GCM ID): " + regid);
    if (regid) {
        var options = {
            notifier: notifier,
            deviceToken: regid
        };

        // Register with Apigee.
        client.registerDevice(options, function (error, result) {
            if (error) {
                console.log(error);
            } else {
                console.log("Success registering device with Apigee" + result + ", UUID=" + client.getDeviceUUID());
                alert('Device Registered to Receive Push Notifications');
            }
        });

        var device_id = client.getDeviceUUID();
        var options2 = {
            method: 'POST',
            endpoint: 'devices/' + device_id + '/users/' + user_id
        };


        client.request(options2, function (err, data) {
            if (err) {
                console.log("Error" + err);
            } else {
                console.log("Success" + data);
            }
        });
    };
};

//app.initialize();
