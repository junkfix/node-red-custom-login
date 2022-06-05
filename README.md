# Custom Login with brute force protection

Here is the `settings.js` file changes:

```
module.exports = {

    //adminAuth: {
    //	...
    //},
	
    //httpNodeAuth: {user:"user",pass:"$2a$0...WV9DN."},
	
    httpAdminRoot: '/admin',
	
    httpAdminMiddleware: require("./custom-login.js"),

    //httpNodeMiddleware: function(req,res,next) {
    // ...
    //},
    
    //for "http in" node protection
    httpNodeMiddleware: require("./custom-login.js"),
    
    //for dashboard protection
    ui: {
        path: "ui",
        middleware: require("./custom-login.js")
    },
}
```

copy `custom-login.js` in the same folder as `settings.js`
You can also configure the function to send MQTT message or run a shell command.
