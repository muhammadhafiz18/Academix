import axios from 'axios';
import { supabase } from './supabase';
import { Article, ArticleMetadata, PublishArticleRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

export const publishArticle = async (article: PublishArticleRequest): Promise<Article> => {
  // If images are present, we need to handle them as FormData
  if (article.images && article.images.length > 0) {
    const formData = new FormData();
    formData.append('title', article.title);
    formData.append('author', article.author);
    formData.append('content', article.content);
    formData.append('contentType', article.contentType);
    
    article.images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    const { data } = await apiClient.post('/publish-article', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } else {
    // Send as JSON if no images
    const { data } = await apiClient.post('/publish-article', {
      title: article.title,
      author: article.author,
      content: article.content,
      contentType: article.contentType
    });
    return data;
  }
};

export const getArticles = async (): Promise<ArticleMetadata[]> => {
  const { data } = await apiClient.get('/get-articles');
  return data;
};

export const getArticle = async (slug: string): Promise<Article> => {
  const { data } = await apiClient.get(`/get-article/${slug}`);
  return data;
};
