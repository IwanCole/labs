console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

/*
1) Get request from client
2) Ensure request has valid:
    - devicehash
    - data
    
    2.1) If invalid, return res=4xx

3) Generate UID
4) Attempt PutItem to Dynamo
    4.1) If UID collision, goto 3)
    4.2 If success, return res=200
*/


exports.handler = (event, context, callback) => {

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : event.body,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(event);
    
    //=======================================================
    if (! event) {
        done(new Error('Invalid request - missing body'));
        return;
    }
    
    var body = event;
    console.log(`Data: ${body.data}\n\nHash: ${body.devicehash}`);
    
    // validate the devicehash fingerprint here
    
    if (! body.data) {
        done(new Error('Invalid request - missing data'));
        return;
    }
    else {
        var data = body.data.toString();
        var i = data.length;
        if (i != 2500) {
            done(new Error('Invalid request - invalid data'));
            return;
        }
        while (i--) {
            if (! "0123456789abcdef".includes(data[i])) {
                done(new Error('Invalid request - invalid data'));
                return;
            }
        }
    }
    //=======================================================
    
    // Pseudo-unique UID - The scope/usage of this project means this should be 'good enough'
    var UID = Date.now().toString() + (Math.floor(Math.random() * (10))).toString();
    
    var params = {
        'TableName': 'catch-images',
        'Item': {
            'uid' : UID,
            'device-id': body.devicehash,
            'data': body.data
        },
        'ConditionExpression': 'attribute_not_exists(uid)'
    };
    

    dynamo.putItem(params, done);
};
