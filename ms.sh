while [ $# -gt 0 ]; do

   if [[ $1 == *"-"* ]]; then
        v="${1/-/}"
        declare $v="$2"
   fi

  shift
done

INTERFACES='interfaces'
SERVICE=$s
PORT=${p:-8000}
GIT_COMMAND=$i
AUTH=$a

echo "GENERATE CONFIGURATION FOR" ${SERVICE}Service
mkdir -p $SERVICE

    if test -z "$GIT_COMMAND"
    then
      echo "INTERFACES DOES NOT EXIST ON GIT"
    else
       $($GIT_COMMAND $SERVICE/$INTERFACES)
    fi

cp -a .service/. $SERVICE/.

cat <<EOF >$SERVICE/$INTERFACES/$SERVICE.proto
syntax = "proto3";

import "google/protobuf/duration.proto";
import "google/protobuf/empty.proto";
import "google/api/annotations.proto";
import "validation.proto";

service ${SERVICE}Service {
  rpc test (Empty) returns (Test) {
      option (google.api.http) = {
      get: "/${SERVICE}/me"
    };
  }
}

message Empty {}

message Test {
  string id = 1;
}

EOF

cat <<EOF >$SERVICE/services/$SERVICE.service.js
export default class ${SERVICE}Service{
    static proto = "$SERVICE.proto";

    static async test(){
        return {id: "test"};
    }
}
EOF

cat <<EOF >$SERVICE/.env.local
PORT=$PORT
EOF

echo "INSTALL MODULES"
cd $SERVICE
npm install

echo "PATCHING @grpc/proto-loader"
cp -a patch/. node_modules/.
cd ..

if test -z "$AUTH"
    then
      echo ""
    else
       mkdir -p $SERVICE/providers
       cp -a .providers/${AUTH}.js $SERVICE/providers/.

      cat <<EOF >$SERVICE/index.js
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

import path from 'path';
import GPRCServer from "./server/grpc.js";
import HttpServer from "./server/rest.js";
import ${AUTH} from './providers/${AUTH}.js';
import services from './services/index.js';

const PUBLIC = [];
async function start() {
    (await import('dotenv')).config({path: path.resolve("./.env." + process.env.NODE_ENV)});

    const grcp = new GPRCServer({
        modules: [${AUTH}(PUBLIC)],
        port: process.env.PORT,
        host: '0.0.0.0',
        services: services
    });

    const http = new HttpServer({
        modules: [],
        port: Number(process.env.PORT) + 1
    });

    grcp.start()
        .then(() => http.start(grcp.routes))
        .then(() => console.log("STARTED"))
        .catch(console.error);
}

start();
EOF
fi