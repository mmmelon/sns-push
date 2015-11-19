SnsPushTokens = new Mongo.Collection("sns_push.tokens");

SNSPush = function(credentials,arn,customAudio){
	this.accessKeyId = credentials.accessKeyId;
	this.secretAccessKey = credentials.secretAccessKey;
	this.region = credentials.region || 'us-east-1';
	this.application_arn = arn;
	this.customAudio = customAudio;
	AWS.config.update({
		accessKeyId: this.accessKeyId,
		secretAccessKey: this.secretAccessKey,
		region: this.region
	});

	this.sns = new AWS.SNS();
}

SNSPush.prototype._endpointCreated = function(endpointArn,token,deviceId,userId){
	SnsPushTokens.upsert({
		endpointArn:endpointArn
	},
	{
		token:token,
		endpointArn:endpointArn,
		deviceId:deviceId,
		userId:userId,
		lastUsed:new Date()
	})
};

SNSPush.prototype._endpointCreateError = function(err){
	console.log("SNSPush -- Error creating endpoint from SNS");
	console.log(err);
};

SNSPush.prototype._endpointRemoved = function(tokenDataId){
	SnsPushTokens.remove(tokenDataId);
};

SNSPush.prototype._endpointRemoveError = function(err){
	console.log("SNSPush -- Error removing endpoint from SNS");
	console.log(err);
};


SNSPush.prototype.registerDevice = function(token,deviceId,userId){
	check(token,String);
	check(deviceId,String);
	check(userId,String);
	if(SnsPushTokens.findOne({token:token,deviceId:deviceId,userId:userId})){
		return;
	}
	var params = {
		PlatformApplicationArn: this.application_arn,
		Token:token,
		CustomUserData: userId
	}
	var that = this;
	var callback = Meteor.bindEnvironment(function(err,data){
		if(err){
			that._endpointCreateError(err);
			if(err.code === "InvalidParameter"){
				that.unRegisterDevice(token,deviceId,userId);
			}
		}else{
			that._endpointCreated(data.EndpointArn,token,deviceId,userId);
		}
	});

	this.sns.createPlatformEndpoint(params,callback);
}

SNSPush.prototype.unRegisterDevice = function(token,deviceId,userId){
	check(token,String);
	check(deviceId,String);
	check(userId,String);
	var savedTokenData = SnsPushTokens.findOne({token:token,deviceId:deviceId,userId:userId});
	if(!savedTokenData){
		return;
	}
	var params = {EndpointArn: savedTokenData.endpointArn};
	var that = this;
	var callback = Meteor.bindEnvironment(function(err,data){
		if(err){
			that._endpointRemoveError(err);
		}else{
			that._endpointRemoved(savedTokenData._id);
		}
	});
	that.sns.deleteEndpoint(params, callback);
};

SNSPush.prototype._pushSended = function(endpointArn){
	SnsPushTokens.update({endpointArn:endpointArn},{$set:{lastUsed:new Date()}});
};

SNSPush.prototype._pushSendError = function(err,endpointArn){
	console.log("SNSPush -- Error sending push from SNS");
	console.log(err);
	if(endpointArn){
		var params = {EndpointArn: endpointArn};
		var savedTokenData = SnsPushTokens.findOne({endpointArn:endpointArn});
		if(!savedTokenData){
			return;
		}
		var that = this;
		var callback = Meteor.bindEnvironment(function(err,data){
			if(err){
				that._endpointRemoveError(err);
			}else{
				that._endpointRemoved(savedTokenData._id);
			}
		});
		this.sns.deleteEndpoint(params,callback);
	}
};

SNSPush.prototype.sendPush = function(userId,message,extraData,badgeCount){
	check(userId,String);
	check(message,String);

	extraData = extraData || {};
	badgeCount = badgeCount || 0;
	var that = this;
	SnsPushTokens.find({userId:userId}).forEach(function(pushTokenData){
		that._publish(pushTokenData.endpointArn,message,extraData,badgeCount);
	})
};

SNSPush.prototype._publish = function(endpointArn,message,extraData,badgeCount){
	check(endpointArn,String);
	check(message,String);
	check(extraData,Object);
	check(badgeCount,Number);

	var apsData = {
		aps:{
			alert:message,
			badge: badgeCount
		},
		info:extraData
	}
	if(this.customAudio){
		apsData.aps.sound = this.customAudio;
	}

	var params = {
		MessageStructure: 'json',
		Message: JSON.stringify({
			default: "test",
			APNS_SANDBOX: JSON.stringify(apsData),
			APNS: JSON.stringify(apsData)
		}),
		TargetArn: endpointArn
	};

	var that = this;
	var callback = Meteor.bindEnvironment(function(err,data){
		if(err){
			if(err.code === 'EndpointDisabled'){
				that._pushSendError(err,endpointArn);
			}
			that._pushSendError(err);
		}else{
			that._pushSended(endpointArn);
		}
	});

	this.sns.publish(params,callback);
}
