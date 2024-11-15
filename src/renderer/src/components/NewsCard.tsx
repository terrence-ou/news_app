import { useState, useRef, useEffect, ComponentProps } from "react";
import { Article } from "@shared/models/Articles";
import { checkImageValidity, cn } from "@/utils";

type NewsCardProps = {
  article: Article;
} & ComponentProps<"div">;

const defaultHeight = 112;

const NewsCard = ({ article, ...props }: NewsCardProps) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [imgHeight, setImgHeight] = useState<number>(defaultHeight);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if the image is valid and control the image loading animation
  useEffect(() => {
    const checkImg = async () => {
      setLoading(true);
      const imgValid = await checkImageValidity(article.urlToImage!);
      setLoading(false);
      if (!imgValid) {
        setImgError(true);
      }
    };

    const handleResize = () => {
      if (imgRef.current && imgRef.current.offsetHeight !== 0) {
        setImgHeight(imgRef.current.offsetHeight);
      }
    };

    // debounding the resize event
    const debounce = (callback: () => void, wait: number) => {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(callback, wait);
      };
    };

    checkImg();

    // to ensure the image the ref created before the resize event
    const timeout = setTimeout(() => {
      handleResize();
    }, 10);

    const debouncedHandleResize = debounce(handleResize, 300);
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className="p-2 border bg-background/80 rounded-lg transition-all duration-150 shadow-news-card"
      {...props}
    >
      <div
        className={cn(
          "transition-all duration-100 overflow-hidden rounded-sm",
          loading ? "opacity-0" : "opacity-100"
        )}
        style={{ height: `${imgHeight}px` }}
      >
        {loading && (
          <div className="w-full h-full bg-transparent rounded-sm flex items-center justify-center"></div>
        )}
        {article.urlToImage && !imgError && (
          <img
            ref={imgRef}
            className="overflow-hidden"
            src={article.urlToImage!}
          />
        )}
        {imgError && (
          <div className="w-full h-full bg-primary rounded-sm flex items-center justify-center">
            <span className="font-medium text-2xl text-background">
              {article.source.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-1 pt-2">
        <h1 className="font-semibold leading-tight text-md hover:underline">
          <a href={article.url} target="_blank">
            {article.title}
          </a>
        </h1>
        <div className="flex justify-start items-center gap-2 my-3">
          <div className="flex items-center justify-center px-2 h-5 font-semibold text-xs text-background bg-primary/70 rounded">
            {article.source.name}
          </div>

          <p className="text-xs text-primary/50">
            {article.publishedAt.slice(0, 10)}
          </p>
        </div>
        <p className="font-serif text-[0.8rem]">
          {article.description}
        </p>
      </div>
    </div>
  );
};

export default NewsCard;
