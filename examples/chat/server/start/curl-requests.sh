printf "\nPOST user john@gmail.com\n"
curl -H 'Content-Type: application/json' --data-binary '{ "email": "john@gmail.com", "password": "john123" }' http://localhost:3030/users/
printf "\nPOST message Hello.\n"
curl -H 'Content-Type: application/json' --data-binary '{ "text": "Hello." }' http://localhost:3030/messages/
printf "\nPOST message Hello again!\n"
curl -H 'Content-Type: application/json' --data-binary '{ "text": "Hello again!" }' http://localhost:3030/messages/
printf "\nPOST message Anyone there?\n"
curl -H 'Content-Type: application/json' --data-binary '{ "text": "Anyone there?" }' http://localhost:3030/messages/