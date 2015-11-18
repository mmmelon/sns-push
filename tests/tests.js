var credentials = {
	accessKeyId: "fakeId",
	secretAccessKey: "fakeSecret"
}

Tinytest.add('MeteorSNS', function (test) {
  var sns = new MeteorSNS(credentials,"arn");
  test.isNotUndefined(sns, "MeteorSNS created");
});

Tinytest.add('MeteorSNS hasKeys', function (test) {
	var sns = new MeteorSNS(credentials,"arn");
	test.equal(sns.accessKeyId,"fakeId");
	test.equal(sns.secretAccessKey,"fakeSecret");
	test.equal(sns.region,"us-east-1");
	test.equal(sns.application_arn,"arn");
});
