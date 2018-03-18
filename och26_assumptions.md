# Response codes

I assume that the following response codes mentioned in the spec have no reason to be returned.

## auctions

### GET /auctions
* 400: If the user doesn't provide any parameters, then it should display all auctions.
If they provide parameters not defined in the spec, then it should just ignore those parameters.
Hence, there is no set of parameters that is invalid.

### GET /auctions/{id}
* 401: Any user can view an auction, whether or not they are logged in.
Hence, they do not need to be authorised.

## photos

## users

## database