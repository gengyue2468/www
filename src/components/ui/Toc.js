import { useEffect, useState } from "react";
import TocButton from "./TocButton";
import { useRouter } from "next/router";

export default function Toc() {
  const router = useRouter();
  const [toc, setToc] = useState([]);
  const [highlightedHash, setHighlightedHash] = useState(null);

  const getToc = () => {
    const tocElements = document.getElementsByClassName("anchor-link");
    const tempToc = [];
    let currentTitle = null;

    Array.from(tocElements).forEach((toc) => {
      const type = toc.parentElement;
      if (!type) return;

      const typeName = type.tagName;

      if (typeName == "H1") {
        const heading = {
          title: toc.innerText,
          href: toc.href,
          offsetTop: toc.offsetTop,
          hash: toc.hash,
          subtitles: [],
        };
        tempToc.push(heading);
        currentTitle = heading;
      } else if (typeName == "H2" && currentTitle) {
        const subheading = {
          title: toc.innerText,
          href: toc.href,
          offsetTop: toc.offsetTop,
          hash: toc.hash,
        };
        currentTitle.subtitles.push(subheading);
      }
    });
    setToc(tempToc);
  };

  useEffect(() => {
    getToc();
  }, [router.asPath]);

  const getFlatToc = () => {
    const flatToc = [];

    toc.forEach((toc) => {
      flatToc.push({ offsetTop: toc.offsetTop, hash: toc.hash });
      if (toc.subtitles && toc.subtitles.length > 0) {
        toc.subtitles.forEach((sub) => {
          flatToc.push({ offsetTop: sub.offsetTop, hash: sub.hash });
        });
      }
    });

    return flatToc.sort((a, b) => a.offsetTop - b.offsetTop);
  };

  const getHighlightedHash = () => {
    const scrollTop = window.scrollY + 50; 
    const flattedToc = getFlatToc();
    
    if (flattedToc.length === 0) return;

    let activeHash = flattedToc[0].hash;

    for (let i = flattedToc.length - 1; i >= 0; i--) {
      if (scrollTop >= flattedToc[i].offsetTop) {
        activeHash = flattedToc[i].hash;
        break;
      }
    }

    setHighlightedHash(activeHash);
  };

  useEffect(() => {
    const handleScroll = () => {
      getHighlightedHash();
    };
    
    window.addEventListener('scroll', handleScroll);
    
    getHighlightedHash();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc]); 

  return (
    <div className="">
      {toc.map((toc, index) => (
        <div key={index}>
          <TocButton
            heading={toc.title}
            index={index}
            offsetTop={toc.offsetTop}
            active={highlightedHash === toc.hash}
          />
          {toc.subtitles && toc.subtitles.map((sub, subIndex) => (
            <TocButton
              type="subheading"
              key={`${sub.title}-${subIndex}`}
              index={subIndex}
              heading={sub.title}
              offsetTop={sub.offsetTop}
              active={highlightedHash === sub.hash}
            />
          ))}
        </div>
      ))}

      {!toc.length && <span className="opacity-75">没有目录</span>}
    </div>
  );
}