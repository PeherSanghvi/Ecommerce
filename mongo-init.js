// mongo-init.js
// This file is mounted into /docker-entrypoint-initdb.d and runs on first
// container start. The replica set is initialised separately by mongo-init
// service, so this file is intentionally minimal.
print("MongoDB container started — replica set will be configured by mongo-init service.");
