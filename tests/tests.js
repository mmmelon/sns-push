var credentials = {
	accessKeyId: "fakeId",
	secretAccessKey: "fakeSecret"
}

Tinytest.add('SNSPush', function (test) {
  var sns = new SNSPush(credentials,"arn");
  test.isNotUndefined(sns, "SNSPush created");
});

Tinytest.add('SNSPush hasKeys', function (test) {
	var sns = new SNSPush(credentials,"arn");
	test.equal(sns.accessKeyId,"fakeId");
	test.equal(sns.secretAccessKey,"fakeSecret");
	test.equal(sns.region,"us-east-1");
	test.equal(sns.application_arn,"arn");
});

Tinytest.add('SNSPush register device', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	sns.sns.createPlatformEndpoint = function(params,callback){
		called=true;
	}
	SnsPushTokens.findOne = function(query){
		return undefined;
	}
	sns.registerDevice("a","b","c");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush register device if already exists', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	SnsPushTokens.findOne = function(query){
		return {};
	}
	sns.registerDevice("a","b","c");
	test.isFalse(called, "Called")
});

Tinytest.add('SNSPush.registerDevice _endPointCreated', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	sns._endpointCreated = function(params,callback){
		called=true;
	}
	sns.sns.createPlatformEndpoint = function(params,callback){
		callback(undefined,{EndpointArn:""});
	}
	SnsPushTokens.findOne = function(query){
		return undefined;
	}
	sns.registerDevice("a","b","c");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush unregister device', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	sns.sns.deleteEndpoint = function(params,callback){
		called=true;
	}
	SnsPushTokens.findOne = function(query){
		return {};
	}
	sns.unRegisterDevice("a","b","c");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush register device error', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	sns.sns.createPlatformEndpoint = function(params,callback){
		callback("error");
	}
	sns._endpointCreateError = function(err){
		called = true;
	}
	SnsPushTokens.findOne = function(query){
		return undefined;
	}
	sns.registerDevice("a","b","c");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush unregister device error', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	sns.sns.deleteEndpoint = function(params,callback){
		callback("error");
	}
	sns._endpointRemoveError = function(err){
		called = true;
	}
	SnsPushTokens.findOne = function(query){
		return {};
	}
	sns.unRegisterDevice("a","b","c");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush sendPush', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	SnsPushTokens.find = function(){
		return {
			forEach:function(){
				called = true;
			}
		}
	}
	sns.sendPush("userId","message");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush sendPush calls publish', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	SnsPushTokens.find = function(){
		return {
			forEach:function(callback){
				callback({endpointArn:""});
			}
		}
	}
	sns._publish = function(){
		called = true;
	}
	sns.sendPush("userId","message");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush publish', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	sns.sns.publish = function(){
		called = true;
	}
	sns._publish("endpointArn","message",{},0);
	test.isTrue(called, "Called")
});
