@import 'MochaJSDelegate.js'

var onRun = function (context) {

  var selection = context.selection;
  var app = NSApplication.sharedApplication();

  var size = 0;

  // No selection
  if ( selection.count() == 0 ){
    app.displayDialog_withTitle("You need to select at least on shape layer", "No shape layer selected");
  }else{

    for(var i = 0; i < selection.count(); i++){
      var layer = selection[i];

      if(layer instanceof MSShapeGroup){

        size++;
        var tag = getTags(layer);
        getImageData(getImageUrl(tag), tag, layer);

      }

    }

  }

  function getImageUrl(tags){
    return "http://api.pexels.com/v1/search?query=" + tags + "&per_page=100"
  }

  function getImageData(endpointUrl, tag, layer){

    COScript.currentCOScript().setShouldKeepAround_(true);

    var webView = WebView.new();

    var delegate = new MochaJSDelegate({
        "webView:didFinishLoadForFrame:": (function(webView, webFrame){
            var app = [NSApplication sharedApplication];

            var webDataSource = [webFrame dataSource];
            var response = [webDataSource data];

            var textResponse = [[NSString alloc] initWithData:response encoding:NSUTF8StringEncoding];
            var parsed = JSON.parse(textResponse);

            var photos = parsed['photos'];

            var arraySize = photos.length;

            var randomNumber = Math.floor(Math.random() * arraySize);

            if (photos instanceof Array){
                log(photos.length);
            }else{
              log("NOPE");
            }

            getData(parsed['photos'][randomNumber]['src']['medium'], layer);

            /*var request = NSURLRequest.requestWithURL(NSURL.URLWithString(parsed['photos'][randomNumber]['src']['medium']));
            var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);

            size--;

            log(response);

            setImageToLayer(layer, NSImage.alloc().initWithData( response ));

            if(size = 0){
              COScript.currentCOScript().setShouldKeepAround_(false);
            }*/


        })
    });

    webView.setFrameLoadDelegate_(delegate.getClassInstance());

    //var request = NSURLRequest.requestWithURL(NSURL.URLWithString(endpointUrl));

    request = [[NSMutableURLRequest alloc] initWithURL:NSURL.URLWithString(endpointUrl)];
    [request setValue:@"563492ad6f917000010000011c98725c2b744350478047f5e3e3ee92" forHTTPHeaderField:@"Authorization"];
    [[webView mainFrame] loadRequest:request];
    //webView.setMainFrameURL_(endpointUrl);

  }

  function getData(url, layer){

    var webView = WebView.new();

    var delegate = new MochaJSDelegate({
        "webView:didFinishLoadForFrame:": (function(webView, webFrame){
            var app = [NSApplication sharedApplication];

            var webDataSource = [webFrame dataSource];
            var response = [webDataSource data];
            log(response);

            size--;

            setImageToLayer(layer, NSImage.alloc().initWithData( response ));

            if(size == 0){
              COScript.currentCOScript().setShouldKeepAround_(false);
            }

        })
    });

    webView.setFrameLoadDelegate_(delegate.getClassInstance());
    webView.setMainFrameURL_(url);

  }

  function setImageToLayer(layer, image){
    var fill = layer.style().fills().firstObject();
    fill.setFillType(4);                                // Sets fill type to accept images
    fill.setPatternImage( image );                      // Sets the image
  }

  function getTags(layer){

    var tags;
    var name = layer.name().trim();

    var matches = name.match(/\[(.*?)\]/);
    if (matches) {
        tags = matches[1];
    }

    return tags;

  }

}
