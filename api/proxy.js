export default async function handler(req, res) {

  const TARGET = "http://private.neofetchid.com:3366"

  try {
    const path = req.query.path ? "/" + req.query.path.join("/") : ""
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""

    const targetUrl = TARGET + path + query

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "private.neofetchid.com"
      }
    })

    const contentType = response.headers.get("content-type") || ""
    
    let body
    if(contentType.includes("text/html") || contentType.includes("application/javascript")) {
      body = await response.text()

      // rewrite semua link internal
      body = body
        .replaceAll(TARGET, "")                 // semua link full URL target → lewat domain kita
        .replaceAll('href="/', 'href="\/')      // semua href internal
        .replaceAll('src="/', 'src="\/')        // semua src internal
        .replaceAll('fetch("', 'fetch("/')      // fetch JS
        .replaceAll('fetch(\'', 'fetch(\'/')    // fetch JS
    } else {
      const buffer = await response.arrayBuffer()
      body = Buffer.from(buffer)
    }

    res.status(response.status)

    response.headers.forEach((value, key) => {
      if (
        key !== "x-frame-options" &&
        key !== "content-security-policy"
      ) {
        res.setHeader(key, value)
      }
    })

    res.send(body)

  } catch (err) {
    res.status(500).send("Proxy error: " + err.message)
  }

    }
