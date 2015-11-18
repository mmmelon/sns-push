var SnsPushTokens = new Mongo.Collection("SnsPushTokens");


MeteorSNS = function(credentials,arn){
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

MeteorSNS.prototype._endpointCreated = Meteor.bindEnvironment(function(token,deviceId,userId){
	var user = Meteor.users.findOne(_this.userId);
	SnsPushTokens.upsert({
		token:token
	},
	{
		token:token,
		deviceId:deviceId,
		userId:userId,
		lastUserd:new Date()
	})
});

MeteorSNS.prototype._endpointCreated = Meteor.bindEnvironment(function(token,deviceId,userId){
	SnsPushTokens.upsert({
		token:token
	},
	{
		token:token,
		deviceId:deviceId,
		userId:userId,
		lastUserd:new Date()
	})
});

MeteorSNS.prototype._endpointRemoved = Meteor.bindEnvironment(function(token,deviceId,userId){
	SnsPushTokens.remove({token:token});
});

MeteorSNS.prototype._endpointRemoveError = Meteor.bindEnvironment(function(err){
	console.log("SNSPush -- Error removing endpoint from SNS");
	console.log(err);
});


MeteorSNS.prototype.registerDevice = Meteor.bindEnvironment(function(token,deviceId,userId){
	check(token,String);
	check(deviceId,String);
	check(userId,String);
	var that = this;
	var params = {
		PlatformApplicationArn: this.application_arn,
		Token:token,
		CustomUserData: userId
	}

	this.sns.createPlatformEndpoint(params,function(err,data){
		if(err){
			if(err.code === "InvalidParameter"){
				that.unregisterDevice(token,deviceId,userId);
			}
		}else{
			that._endPointCreated(data.EndpointArn,deviceId,userId);
		}
	})
});

MeteorSNS.prototype.unRegisterDevice = Meteor.bindEnvironment(function(token,deviceId,userId){
	check(token,String);
	check(deviceId,String);
	check(userId,String);
	var that = this;
	var params = {EndpointArn: token};

	this.sns.deleteEndpoint(params, function(err, data) {
		if(err){
			that._endpointRemoveError(err);
		}else{
			that._endPointRemoved(data.EndpointArn,deviceId,userId);
		}
	});
});
