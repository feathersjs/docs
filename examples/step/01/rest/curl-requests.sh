printf "\nPOST Jane Doe\n"
curl -H "Content-Type: application/json" -X POST -d '{"email":"jane.doe@gmail.com","password":"X2y6","role":"admin"}' http://localhost:3030/users
printf "\nPOST John Doe\n"
curl -H "Content-Type: application/json" -X POST -d '{"email":"john.doe@gmail.com","password":"i6He","role":"user"}' http://localhost:3030/users
printf "\nPOST Judy Doe\n"
curl -H "Content-Type: application/json" -X POST -d '{"email":"judy.doe@gmail.com","password":"7jHw","role":"user"}' http://localhost:3030/users
printf "\nGET all users\n"
curl -X GET http://localhost:3030/users