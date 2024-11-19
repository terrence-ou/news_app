import fs from "fs";
import path from "path";
import { homedir } from "os";
import { Article, Articles } from "@shared/models/Articles";
import { APP_FOLDER, HEADLINE_DIR } from "@shared/consts";
import type {
  LoadApiKeys,
  LoadHeadlines,
  WriteApiKeys,
} from "@shared/types";

const headlineFolderDir = `${homedir()}/${HEADLINE_DIR}`;

// Load today's headlines from the local file
const loadTodayHeadlines: LoadHeadlines = async () => {
  if (!fs.existsSync(headlineFolderDir)) {
    return undefined;
  }
  try {
    // Get an array of today's files
    const today = new Date().toISOString().slice(0, 10); // it is actually the Greenwich time
    const files = fs.readdirSync(headlineFolderDir);
    const todayFiles = files.filter(
      (file) => file.startsWith(today) && file.endsWith(".json")
    );

    if (todayFiles.length === 0) {
      return undefined;
    }
    const news = await processFiles(todayFiles);
    const articles = new Articles(news);
    return articles;
  } catch (error) {
    console.error("Error loading today's file. [ERROR]: ", error);
    return undefined;
  }
};

// Load previous headlines from the local file
const loadPrevHeadlines: LoadHeadlines = async () => {
  if (!fs.existsSync(headlineFolderDir)) {
    return undefined;
  }
  try {
    // Get an array of prevDate's files
    const prevDate = new Date().toISOString().slice(0, 10);
    const files = fs.readdirSync(headlineFolderDir);
    const previousFiles = files.filter(
      (file) => !file.startsWith(prevDate) && file.endsWith(".json")
    );

    if (previousFiles.length === 0) {
      return undefined;
    }
    const news = await processFiles(previousFiles);
    const articles = new Articles(news);
    return articles;
  } catch (error) {
    console.error("Error loading today's file. [ERROR]: ", error);
    return undefined;
  }
};

// Load API keys from the local setting file
const loadApiKeys: LoadApiKeys = async () => {
  const settingsDir = path.join(
    homedir(),
    APP_FOLDER,
    "settings.json"
  );

  const emptyKeys = { newsapi: "", openai: "" };

  if (!fs.existsSync(settingsDir)) {
    fs.writeFileSync(
      settingsDir,
      JSON.stringify({ keys: emptyKeys }, null, 2),
      "utf-8"
    );
    return emptyKeys;
  }

  try {
    const data = fs.readFileSync(settingsDir, "utf-8");
    const settings = JSON.parse(data);
    return {
      newsapi: settings.keys.newsapi,
      openai: settings.keys.openai,
    };
  } catch (error) {
    console.error("Error loading API keys. [ERROR]: ", error);
    return emptyKeys;
  }
};

const writeApiKeys: WriteApiKeys = async ({ newsapi, openai }) => {
  const settingsDir = path.join(
    homedir(),
    APP_FOLDER,
    "settings.json"
  );
  try {
    const data = fs.readFileSync(settingsDir, "utf-8");
    const settings = JSON.parse(data);
    settings.keys.newsapi = newsapi;
    settings.keys.openai = openai;
    fs.writeFileSync(
      settingsDir,
      JSON.stringify(settings, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing API keys. [ERROR]: ", error);
  }
};

// Helper functions

// validate the parsed json file
const isValidData = (data: any): data is { articles: Article[] } => {
  return data && Array.isArray(data.articles);
};

// load files into the array
const processFiles = async (files: string[]): Promise<Article[]> => {
  const existedNews = new Set<string>();
  const news: Article[] = [];
  // Read each file and extract the articles
  const sortedFiles = files.sort((a, b) => -a.localeCompare(b));
  await Promise.all(
    sortedFiles.map(async (file) => {
      try {
        const data = fs.readFileSync(
          `${headlineFolderDir}/${file}`,
          "utf-8"
        );
        const parsedData = JSON.parse(data);
        // check if the data in the file is valid
        if (!isValidData(parsedData)) {
          console.warn("Invalid data format in the file: ", file);
          return;
        }
        parsedData.articles.forEach((content) => {
          const article = new Article(content);
          if (article.title && !existedNews.has(article.title)) {
            existedNews.add(article.title);
            news.push(article);
          }
        });
      } catch (error) {
        console.error(`Error processing file ${file}: `, error);
      }
    })
  );

  return news;
};

export {
  loadPrevHeadlines,
  loadTodayHeadlines,
  loadApiKeys,
  writeApiKeys,
};
