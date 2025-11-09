# Sitemaps: submit

**Requires [authorization](https://developers.google.com/webmaster-tools/v1/sitemaps/submit#auth)**

Submits a sitemap for a site.
[Try it now](https://developers.google.com/webmaster-tools/v1/sitemaps/submit#try-it).

## Request

### HTTP request

```
PUT https://www.googleapis.com/webmasters/v3/sites/siteUrl/sitemaps/feedpath
```

### Parameters

| Parameter name |  Value   |                                                                                                                                                    Description                                                                                                                                                     |
|----------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Path parameters**                                                                                                                                                                                                                                                                                                                          |||
| `feedpath`     | `string` | The URL of the sitemap to add. For example: `http://www.example.com/sitemap.xml`                                                                                                                                                                                                                                   |
| `siteUrl`      | `string` | The URL of the property as defined in Search Console. For example: `http://www.example.com/` ([URL-prefix](https://support.google.com/webmasters/answer/34592#url_prefix_prop_tips) property), or `sc-domain:example.com` ([Domain](https://support.google.com/webmasters/answer/34592#domain_property) property). |

### Authorization

This request requires authorization with the following scope ([read more about authentication and authorization](https://developers.google.com/webmaster-tools/v1/how-tos/authorizing)).

|                    Scope                     |
|----------------------------------------------|
| `https://www.googleapis.com/auth/webmasters` |

### Request body

Do not supply a request body with this method.

## Response

If successful, this method returns an empty response body.

## Try it!


Use the APIs Explorer below to call this method on live data and see the response.