import { Html, Head, Main, NextScript } from "next/document"
const script =
  `      (function() {
        window._assetPath = () => {
          const sp = window.location.pathname.split(\'/\')
          const pathSegments = sp.filter(segment => segment.length > 0);
          let depth = pathSegments.length;
          let isArweave = false
          if(depth === 0){
            depth = 1
          }else if(/^[A-Za-z0-9_-]{43}$/.test(pathSegments[0])){
            depth -= 1
            isArweave = true
          }
          if(sp[sp.length - 1] === "") depth += 1
          
          return depth === 0 && isArweave ? "/" + pathSegments[0] : depth <= 1  ? '.' : ` +
  '`${"../".repeat(depth - 1).split("/").slice(0,-1).join("/")}`' +
  `;
        }
        const path = _assetPath() + "/";
	let tags = []
	tags.push({elm: "meta", props:{ name: "base", content: path }})
	for(const t of tags){
          const tag = document.createElement(t.elm);
	  for(const k in t.props) tag[k] = t.props[k] === "" ? true : t.props[k];
          document.head.appendChild(tag);
	}
      })();
`
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
