import fetch from "node-fetch";

const TARGET = "http://private.neofetchid.com:3366"; // target public

export default async function handler(req, res) {
  try {
    const path = req.query.path ? "/" + req.query.path.join("/") : "";
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const targetUrl = TARGET + path + query;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "user-agent": req.headers["user-agent"] || "",
        "accept": "*/*",
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
    });

    const contentType = response.headers.get("content-type") || "";
    let body;

    // Rewrite HTML / JS untuk tetap lewat proxy
    if (contentType.includes("text/html") || contentType.includes("application/javascript")) {
      body = await response.text();

      // Semua link internal diarahkan ke proxy
      body = body
        .replaceAll(TARGET, "")
        .replaceAll('href="/', 'href="/')
        .replaceAll('src="/', 'src="/')
        .replaceAll('fetch("', 'fetch("/')
        .replaceAll('fetch(\'', 'fetch(\'/');
    } else {
      const buffer = await response.arrayBuffer();
      body = Buffer.from(buffer);
    }

    response.headers.forEach((value, key) => {
      if (key !== "x-frame-options" && key !== "content-security-policy") {
        res.setHeader(key, value);
      }
    });

    res.status(response.status).send(body);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
                    }
