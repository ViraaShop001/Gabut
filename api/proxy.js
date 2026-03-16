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

    const buffer = await response.arrayBuffer()

    res.status(response.status)

    response.headers.forEach((value, key) => {
      if (
        key !== "x-frame-options" &&
        key !== "content-security-policy"
      ) {
        res.setHeader(key, value)
      }
    })

    res.send(Buffer.from(buffer))

  } catch (err) {
    res.status(500).send("Proxy error: " + err.message)
  }

}
