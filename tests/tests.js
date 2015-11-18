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
	sns.registerDevice("a","b","c");
	test.isTrue(called, "Called")
});

Tinytest.add('SNSPush unregister device', function (test) {
	var sns = new SNSPush(credentials,"arn");
	var called = false;
	sns.sns.deleteEndpoint = function(params,callback){
		called=true;
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
	sns.unRegisterDevice("a","b","c");
	test.isTrue(called, "Called")
});
