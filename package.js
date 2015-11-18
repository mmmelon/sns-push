Package.describe({
  name: "mmmelon:sns-push",
  summary: "",
  version: "0.0.1",
  git: ""
});

Package.onUse(function(api) {
  api.versionsFrom("1.0.1");
  api.use(["meteor","check","underscore", "eluck:aws-sdk"]);

  api.addFiles("lib/server/meteorsns.js", ["server"]);
  api.export('MeteorSNS', ["server"]);
});


Package.onTest(function (api) {
    api.use(["tinytest", "test-helpers"]);
    api.use(["meteor","check","underscore", "sns-push"]);

    api.add_files('tests/tests.js', 'server');
});
