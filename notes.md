# Notes

The main difference between using sessions and tokes for auth: where the state is kept

- When using Sessions state is kept in the server.
- When using Tokens state is kept in the Token (client).

## Responsibilities

### Server

- produce the token
- send the token to the client

- read, decode and verify the token
- make the payload available to the rest of the api

### Client

- store the token
- send the token on every request
- destroy token on logout

## Common Token Types

- auth token
- access/authorization token - could be 60 mins, you trust this
- refresh token - long lived, perhaps 9 hours
