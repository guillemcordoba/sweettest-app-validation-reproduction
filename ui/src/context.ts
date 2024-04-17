import { createContext } from '@lit/context';
import { PostsStore } from './posts-store.js';

export const postsStoreContext = createContext<PostsStore>(
  'posts/store'
);

