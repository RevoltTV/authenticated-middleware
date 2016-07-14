# authenticated-middleware

Checks an incoming request for a valid JSON Web Token.

Attaches the token to the `req` object as `req.user`.

## Usage

```
import authenticated from '@revolttv/authenticated-middleware';

let app = new express();

app.use(authenticated({
    secret: 'your-JWT-signing-secret'
}));
```
