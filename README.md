In a Nutshell
=============

Small promise-based utility function to http/https GET a JSON blob
from URI and return it as a parsed object.


Reference
=========

```
const JsonClient = require('tr-jsonclient');

var client = new JsonClient();

return (client.c('https://www.foo.bar/post-endpoint/somewhere', { foo: 'bar', something: 'or another', a: [1,2,3] })
        .then(function(ret) {
            console.log('JSON POST response:', ret);
        })
        .then(function() {
            return client.c('https://www.foo.bar/some.json');
        .then(function(ret) {
            console.log('JSON GET response:', ret);
        })
        .catch(function(e) {
            console.log('Something terrible happened');
            throw e;
        }));


```


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

GPL-2.0
