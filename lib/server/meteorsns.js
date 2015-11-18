var SnsPushTokens = new Mongo.Collection("SnsPushTokens");


SNSPush = function(credentials,arn){
	this.accessKeyId = credentials.accessKeyId;
	this.secretAccessKey = credentials.secretAccessKey;
	this.region = credentials.region || 'us-east-1';
	this.application_arn = arn;
	AWS.config.update({
		accessKeyId: this.accessKeyId,
		secretAccessKey: this.secretAccessKey,
		region: this.region
	});

	this.sns = new AWS.SNS();
}

SNSPush.prototype._endpointCreated = Meteor.bindEnvironment(function(token,endpointArn,deviceId,userId){
	SnsPushTokens.upsert({
		token:endpointArn
	},
	{
		token:token,
		endpointArn:endpointArn,
		deviceId:deviceId,
		userId:userId,
		lastUserd:new Date()
	})
});

SNSPush.prototype._endpointCreateError = Meteor.bindEnvironment(function(err){
	console.log("SNSPush -- Error creating endpoint from SNS");
	console.log(err);
});

SNSPush.prototype._endpointRemoved = Meteor.bindEnvironment(function(token,endpointArn,deviceId,userId){
	SnsPushTokens.remove({token:token});
});

SNSPush.prototype._endpointRemoveError = Meteor.bindEnvironment(function(err){
	console.log("SNSPush -- Error removing endpoint from SNS");
	console.log(err);
});


SNSPush.prototype.registerDevice = function(token,deviceId,userId){
	var that = this;
	Meteor.bindEnvironment(function(token,deviceId,userId){
		check(token,String);
		check(deviceId,String);
		check(userId,String);
		if(SnsPushTokens.findOne({token:token,deviceId:deviceId,userId:userId})){
			return;
		}
		var params = {
			PlatformApplicationArn: that.application_arn,
			Token:token,
			CustomUserData: userId
		}
		that.sns.createPlatformEndpoint(params,function(err,data){
			if(err){
				that._endpointCreateError(err);
				if(err.code === "InvalidParameter"){
					that.unregisterDevice(token,deviceId,userId);
				}
			}else{
				that._endPointCreated(data.EndpointArn,deviceId,userId);
			}
		})
	}).apply(this,arguments);
}

SNSPush.prototype.unRegisterDevice = function(token,deviceId,userId){
	var that = this;
	Meteor.bindEnvironment(function(token,deviceId,userId){
		check(token,String);
		check(deviceId,String);
		check(userId,String);
		var params = {EndpointArn: token};

		that.sns.deleteEndpoint(params, function(err, data) {
			if(err){
				that._endpointRemoveError(err);
			}else{
				that._endPointRemoved(data.EndpointArn,deviceId,userId);
			}
		});
	}).apply(this,arguments);
};
