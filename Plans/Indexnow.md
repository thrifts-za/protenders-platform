Generate API Key
An API key is needed to match the ownership of the domain with submitted URLs.

0b1263b8ed06431aae2a05fc49502518

2
Host your API key
Option 1: Host your UTF-8 key file at the root of your website: https://www.example.com/0b1263b8ed06431aae2a05fc49502518.txt This file must contain the key 0b1263b8ed06431aae2a05fc49502518


Option 2: Host one to many UTF-8 encoded text key files in other locations within the same host.
Note: If you submit a URL, you must specify the key file location as keyLocation URLs parameter value: https://<searchengine>/indexnow?url=http://www.example.com/product.html&key=0b1263b8ed06431aae2a05fc49502518&keyLocation=http://www.example.com/myIndexNowKey63638.txt

3
Submit URLs
Submit individual or bulk URLs with your key location as your URL parameter: Send one URL via an HTTP request

Submitting a set of URL via an HTTP request

Request
POST /IndexNow HTTP/1.1
Content-Type: application/json; charset=utf-8
Host: api.indexnow.org
{
  "host": "www.example.org",
  "key": "0b1263b8ed06431aae2a05fc49502518",
  "keyLocation": "https://www.example.org/0b1263b8ed06431aae2a05fc49502518.txt",
  "urlList": [
      "https://www.example.org/url1",
      "https://www.example.org/folder/url2",
      "https://www.example.org/url3"
      ]
}
