* Any JSON sent in the body will be valid JSON.
That is, in the form `{"key": "value"}`, not something like `7`, `random text`, `{"""""":::"##$"}`, or `{"key": "value" "key": "value"}`.

* Sellers can replace their photo just be posting a new one, and that they can't add or replace an auction's photo if there are any bids on it.
Similarly, deleting a photo that doesn't exist will just send a 201 back to the user.

* If there are no bids, then the `currentBid` field in the JSON will be set to null and the `bids` field will be an empty array.

# Response codes

## auctions

## photos

### DELETE /auctions/{id}/photos 
* If the auction has started, then the photo can't be deleted.
There is no 400 error code in the spec, so a 401 is returned instead.

## users

## database