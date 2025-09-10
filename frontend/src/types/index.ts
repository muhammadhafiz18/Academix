export interface Article {
  Id: string;
  Title: string;
  Author: string;
  Content: string;
  ContentType: 'markdown' | 'plaintext';
  Images?: string[];
  PublishedAt: string;
  Slug: string;
}

export interface ArticleMetadata {
  Id: string;
  Title: string;
  Author: string;
  PublishedAt: string;
  Slug: string;
}

export interface PublishArticleRequest {
  title: string;
  author: string;
  content: string;
  contentType: 'markdown' | 'plaintext';
  images?: File[];
}

export interface User {
  id: string;
  email: string;
}
