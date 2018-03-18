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

### PATCH /auctions/{id}
* 400: If the user provides an empty JSON, then it does nothing, but as there are no compulsory fields, this is allowed by the spec.
Any keys in the JSON not defined in the spec are ignored.
Hence, there is no JSON that is invalid.

## photos

## users

## database