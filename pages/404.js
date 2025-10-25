import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  return (
    <>
  <meta charSet="utf-8" />
  <title>404 • Page Under Construction</title>
  <meta content="width=device-width, initial-scale=1" name="viewport" />
  <meta content="Webflow" name="generator" />
  <link href="css/home.css" rel="stylesheet" type="text/css" />
  <link href="https://fonts.googleapis.com" rel="preconnect" />
  <link
    href="https://fonts.gstatic.com"
    rel="preconnect"
    crossOrigin="anonymous"
  />
  <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon" />
  <link href="images/app-icon.png" rel="apple-touch-icon" />
  {/* 404 page not found page, its simple and dosent need much change so dont touch this pls. */}
  <style
    dangerouslySetInnerHTML={{
      __html:
        "\n      /* Basic responsive helpers */\n      *, *::before, *::after { box-sizing: border-box; }\n      html, body { overflow-x: hidden; }\n      .container { padding: 20px; }\n      .heading_h1 { font-size: clamp(24px, 6vw, 40px); }\n      .subheading { font-size: clamp(14px, 3.5vw, 18px); }\n      .button-group { display: inline-flex; gap: 12px; flex-wrap: wrap; }\n    "
    }}
  />
  <section className="section min-height_100dvh">
    <div className="container min-height_100dvh flex_vertical is-y-center is-x-center text-align_center">
      <div className="header is-align-center">
        <div className="eyebrow">Oops!</div>
        <h1 className="heading_h1 margin-bottom_none">
          404 • Page Under Construction
        </h1>
        <p className="subheading">
          We're building this page right now. In the meantime, you can head back
          home or explore more.
        </p>
      </div>
      <div className="button-group is-align-center">
      <Link href="#" className="button w-button" onClick={(e) => { e.preventDefault(); router.back(); }}>
      Go Back
      </Link>
        <Link href="/" className="button is-secondary w-button">
          Explore
        </Link>
      </div>
    </div>
  </section>
</>

  );
}
