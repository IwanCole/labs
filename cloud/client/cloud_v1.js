var submitBtn = document.querySelector(".btn-send");

setTimeout(() => {
    Fingerprint2.get(function (components) {
        var values = components.map(function (component) { return component.value });
        var murmur = Fingerprint2.x64hash128(values.join(''), 31);
        _HASH = murmur;
    });
}, 1000);




// Take a NxN canvas, and scale down by a factor of 2.
function downScale(BWdata) {
    var downScaled = [];
    var base = 0;
    var totalCount = 0;
    
    while (totalCount < _AREA) {
        var square = [ BWdata[base],
                       BWdata[base + 1],
                       BWdata[base + _WIDTH],
                       BWdata[base + _WIDTH + 1] ];
        
        // If the 2x2 square has <2 white pixels, fill as black 
        var sum = square.reduce((x,y)=>x+y, 0);
        downScaled.push( (sum >= 3) ? 1 : 0 );
        
        base += 2;
        totalCount += 4;
        if (base%_WIDTH == 0) base += _WIDTH;
    }
    return downScaled;
}


function packBytes(pixels) {
    var buffer   = "";

    // For every 4 pixels, pack them into a single HEX character
    var hexMultiplier = 16;
    var accum = 0;
    for (var i = 0; i < (_AREA / _SCALEAREA); i++) {
        hexMultiplier /= 2;
        accum += (pixels[i] * hexMultiplier);
        if (hexMultiplier === 1) {
            hexMultiplier = 16;
            buffer += accum.toString(16);
            accum = 0;
        }
    }
//    console.log(buffer);
    return buffer;
}


function submit() {
    var BWdata   = [];
    var RGBAdata = ctx.getImageData(0, 0, _WIDTH, _HEIGHT).data;
    for (var i = 0; i < _AREA; i++) BWdata.push(Math.floor(RGBAdata[i*4]/255));
    
    
    var pixels = downScale(BWdata);
        pixels = downScale(pixels);
    var buffer = packBytes(pixels);
    
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://91l41b7f31.execute-api.eu-west-2.amazonaws.com/default/catchDraw",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "x-api-key": "<<API KEY>>",
            "Accept": "*/*",
            "Access-Control-Allow-Origin" : '*',
        },
        "processData": false,
        "data": `{\"devicehash\": \"${_HASH}\", \"data\":\"${buffer}\"}`
    }

    // 'Accept,Access-Control-Allow-Origin,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    
    $.ajax(settings).done(function (response) {
        console.log(response);
        clearCanvas();
    });
    
}


submitBtn.addEventListener('click', (e) => {
    submit();
});