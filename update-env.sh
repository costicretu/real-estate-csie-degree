#!/bin/bash

# generate a new value for the variables every 30 seconds
while true; do
  my_code=$(openssl rand -hex 16)
  echo "REACT_APP_MY_CODE=$my_code" > .env.local
  echo "REACT_APP_API_KEY=AIzaSyBkQku9yPkgstqek86P7HTMUPJBLqn4qnE" >> .env.local
  sleep 30
done
