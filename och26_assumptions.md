* Any JSON sent in the body will be valid JSON.
That is, in the form `{"key": "value"}`, not something like `7`, `random text`, `{"""""":::"##$"}`, or `{"key": "value" "key": "value"}`.

* Sellers can replace their photo just be posting a new one, and send back a 201.
Similarly, deleting a photo that doesn't exist will just send a 201 back to the user.

* If there are no bids, then the `currentBid` field in the JSON will be set to null and the `bids` field will be an empty array.

# Response codes
## photos

### DELETE /auctions/{id}/photos 
* If the auction has started, then the photo can't be deleted.
There is no 400 error code in the spec, so a 401 is returned instead.

## users

### POST /users/login
* The server does not allow multiple login.
If a login request is sent while a user is already logged in, a 500 is returned.

### PATCH /users/{id}
* Users can't change their username or email to one that is already taken.
There is no 400 error code in the spec, so a 401 is returned instead.