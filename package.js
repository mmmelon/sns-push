Package.describe({
  name: "mmmelon:sns-push",
  summary: "sns-push makes sending and managing push notifications easy. Uses Amazon sns.",
  version: "0.2.4",
  git: "https://github.com/mmmelon/sns-push"
});

Package.onUse(function(api) {
  api.versionsFrom("1.0.1");
  api.use(["meteor","mongo","check", "eluck:aws-sdk@2.1.33"]);

  api.addFiles("lib/server/meteorsns.js", ["server"]);
  api.export('SNSPush', ["server"]);
});


Package.onTest(function (api) {
    api.use(["tinytest", "test-helpers"]);
    api.use(["meteor","mongo","check","underscore", "eluck:aws-sdk"]);
    api.addFiles("lib/server/meteorsns.js", ["server"]);

    api.add_files('tests/stubs.js', 'server');
    api.add_files('tests/tests.js', 'server');
});
