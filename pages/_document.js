import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon and Icons */}
        <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="/images/app-icon.png" rel="apple-touch-icon"/>
        
        {/* Font Loading */}
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous"/>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
        
        {/* CSS */}
        <link href="/css/conversational-chatbot.webflow.shared.c3f87610b.css" rel="stylesheet" type="text/css"/>
        <link href="/css/home.css" rel="stylesheet" type="text/css"/>
        
        {/* Font Loading Script */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              WebFont.load({
                google: {
                  families: ["Fjalla One:regular", "Source Sans 3:300,regular,600,700"]
                }
              });
            `
          }}
        />
        
        {/* Touch Detection Script */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              !function(o,c){
                var n=c.documentElement,t=" react-mod-";
                n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")
              }(window,document);
            `
          }}
        />
      </Head>
      <body className="body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
