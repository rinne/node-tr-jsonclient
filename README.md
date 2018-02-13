In a Nutshell
=============

Small promise-based utility function to http/https GET a JSON blob
from URI and return it as a parsed object.


Reference
=========

```
const jsonGet = require('tr-jsonget');
return (jsonGet('http://foo.bar/zap.json')
        .then(function(ret) {
          console.log('Oh yeah!');
          console.log(ret);
          return ret;
        })
        .catch(function(e) {
          console.log('Something terribly wrong');
          throw e;
        }));
      
```


Author
======

Timo J. Rinne <tri@iki.fi>


License
=======

GPL-2.0
