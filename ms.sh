HELP=$1

while [ $# -gt 0 ]; do

   if [[ $1 == *"-"* ]]; then
        v="${1/-/}"
        declare $v="$2"
   fi

  shift
done

MODULE_PATH=${x:-.}
INTERFACES='interfaces'
SERVICE=${s:-"REQUIRED"}
PORT=${p:-"REQUIRED"}
DATABASE=$d
AUTH=$a

if [ $HELP == "-h" ]
then
  echo ""
  echo "MSGRPC -> Generate ms with grpc and http support"
  echo ""
  echo "    [-s]=Service name without 'Service' keyword - REQUIRED"
  echo "    [-p]=Service port number - REQUIRED"
  echo "    [-i]=Service interfaces over git repository"
  echo "    [-a]=Add init auth on service, support: jwt, auth0, okta"
  echo "    [-d]=Add database configuration, support: mongodb, postgres"
  echo ""
  exit 1
fi

if [ $SERVICE == "REQUIRED" ]
  then
    echo "Missing service name with args -s"
    exit 0
fi

if [ $PORT == "REQUIRED" ]
  then
    echo "Missing service port with args -p"
    exit 0
fi

echo "GENERATE CONFIGURATION FOR" ${SERVICE}Service
mkdir -p $SERVICE
mkdir -p $SERVICE/interfaces

cp -a $MODULE_PATH/.service/. $SERVICE/.
rm -rf $SERVICE/node_modules
rm -rf $SERVICE/__tests__/*

cat <<EOF >$SERVICE/$INTERFACES/$SERVICE.proto
syntax = "proto3";

import "google/protobuf/duration.proto";
import "google/protobuf/empty.proto";
import "google/api/annotations.proto";
import "validation.proto";

service ${SERVICE}Service {
  rpc test (google.protobuf.Empty) returns (Test) {
      option (google.api.http) = {
      get: "/${SERVICE}/me"
    };
  }
}

message Test {
  string id = 1;
}

EOF

cat <<EOF >$SERVICE/services/$SERVICE.service.js
export default class ${SERVICE}Service {
    static proto = '${SERVICE}.proto';

    static async test() {
      return { id: 'test' };
    }
}
EOF

cat <<EOF >$SERVICE/.env.local
PORT=$PORT

EOF

if test -z "$AUTH"
    then
      echo ""
    else
       mkdir -p $SERVICE/providers
       cp -a .providers/${AUTH}/${AUTH}.js $SERVICE/providers/.
       cp -a .providers/index.${AUTH}.js $SERVICE/index.js
fi

if [[ $DATABASE == "mongodb" ]]
  then
    cp -a .database/${DATABASE}/index.js $SERVICE/models/.
    cat <<EOF >$SERVICE/models/$SERVICE.model.js
import mongoose from 'mongoose';

const ${SERVICE}Schema = new mongoose.Schema(
    {
        name: String
    }, {
        timestamps: true,
        collection: "tests"
    }
);

const Model = mongoose.model('${SERVICE}', ${SERVICE}Schema);
export default Model;
EOF
echo "DATABASE_URI=mongodb://localhost:27017/${SERVICE}" >>$SERVICE/.env.local

fi

echo "INSTALL MODULES"
cd $SERVICE
npm install