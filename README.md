# sns-push [![Build Status](https://travis-ci.org/mmmelon/sns-push.svg?branch=master)](https://travis-ci.org/mmmelon/sns-push)


Meteor package for managing and sending push notifications from a Meteor app using Amazon SNS.

sns-push is a simple package that solves the push notifications problem. It allows you adding and removing devices attached to an userId and sending push notifications to a userId.

It exposes a simple API and stores all the push information in a special collection.

## Installing

````shell
meteor add mmmelon:sns-push
````

## Setting up SNSPush

SNSPush creates an object you could declare as local or global. That constructor requires credentials and amazon sns arn. Credentials could also include region, if not region present it will default to 'us-east-1'. You could also include a third parameter with the audio name to be played once device recieves the push notification.

````js
var credentials = {
	accessKeyId: "fakeId",
	secretAccessKey: "fakeSecret"
}
snsPush = new SNSPush(credentials,"arn");
````

And with audio:

````js
var credentials = {
	accessKeyId: "fakeId",
	secretAccessKey: "fakeSecret"
}
snsPush = new SNSPush(credentials,"arn","message.caf");
````

## Registering a device

sns-push stores this data for each device:

- token
- endpointArn
- deviceId
- userId
- lastUsed

Registering a device requires:

- token
- deviceId
- userId

You'll get the token from Apple inside your iOS app and deviceId could be iOS UUID or any identifier you can use from the device. Keep in mind that UUID changes once the user removes all your apps from the device. For that reason sns-push tries to keep it's collection updated allowing a user to have multiple devices and removing tokens when amazon says it's expired.


Let's register our first device:

````js
snsPush.registerDevice(token,deviceId,userId);
````

Done!

Call it from a method or any server side code you have. You can call this method from your app each time you recieve the token from apple. It will avoid tuplicated tokens.

## Removing a device

The best case to remove a device is when user logouts from your app. If you don't remove the token it will keep sending push notifications. To unregister a device just call:

````js
snsPush.unRegisterDevice(token,deviceId,userId);
````

This will remove the token saved for that device from your database and also from amazon sns.

## Sending a push notification

To send a push notification to an userId use:

````js
snsPush.sendPush(userId,message,extraData,badgeCount);
````

You can include a metadata object in extraData and a number in badgeCount to set application icon badge. This method will send a push notification to all the tokens saved to that user.

## Contributing

Anyone is welcome to contribute. Fork, make and test your changes (meteor test-packages ./), and then submit a pull request.

## Major Contributors

@bitomule

(Add yourself if you should be listed here.)
