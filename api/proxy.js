export default async function handler(req, res) {

  const TARGET = "http://private.neofetchid.com:3366"  // ganti dengan target server publik

  try {
    const path = req.query.path ? "/" + req.query.path.join("/") : ""
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""
    const targetUrl = TARGET + path + query

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(TARGET).host
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
    })

    const contentType = response.headers.get("content-type") || ""
    let body

    // Jika HTML / JS, rewrite semua link agar tetap lewat proxy
    if (contentType.includes("text/html") || contentType.includes("application/javascript")) {
      body = await response.text()
      body = body
        .replaceAll(TARGET, "")              // hapus domain asli
        .replaceAll('href="/', 'href="/')    // internal link
        .replaceAll('src="/', 'src="/')      // internal src
        .replaceAll('fetch("', 'fetch("/')   // fetch JS
        .replaceAll('fetch(\'', 'fetch(\'/') // fetch JS
    } else {
      const buffer = await response.arrayBuffer()
      body = Buffer.from(buffer)
    }

    // Set header kecuali yang memblokir iframe
    response.headers.forEach((value, key) => {
      if (key !== "x-frame-options" && key !== "content-security-policy") {
        res.setHeader(key, value)
      }
    })

    res.status(response.status).send(body)

  } catch (err) {
    res.status(500).send("Proxy error: " + err.message)
  }
}
