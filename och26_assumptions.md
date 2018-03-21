I assume that any JSON sent in the body will be valid JSON.
That is, in the form `{"key": "value"}`, not something like `7`, `random text`, `{"""""":::"##$"}`, or `{"key": "value" "key": "value"}`.

I also assume that sellers can replace their photo just be posting a new one, and that they can't add or replace an auction's photo if there are any bids on it.

# Response codes

I assume that the following response codes mentioned in the spec have no reason to be returned.

## auctions

### GET /auctions/{id}
* 401: Any user can view an auction, whether or not they are logged in.
Hence, they do not need to be authorised.

## photos

## users

## database