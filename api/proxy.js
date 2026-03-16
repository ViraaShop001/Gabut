export default async function handler(req, res) {

  const TARGET = "http://private.neofetchid.com:3366/"

  const path = req.url.replace("/api/proxy", "")
  const url = TARGET + path

  const response = await fetch(url, {
    method: req.method,
    headers: {
      ...req.headers,
      host: new URL(TARGET).host
    }
  })

  const data = await response.arrayBuffer()

  res.status(response.status)

  response.headers.forEach((value, key) => {
    if (key !== "x-frame-options" && key !== "content-security-policy") {
      res.setHeader(key, value)
    }
  })

  res.send(Buffer.from(data))
}
