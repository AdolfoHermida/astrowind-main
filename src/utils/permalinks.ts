import slugify from 'limax';

// Definimos la URL base del sitio directamente aquí
const SITE = {
  site: 'https://ahseo.es/',
  base: '/',
  trailingSlash: true, // Nos aseguramos de que las URLs tengan una barra diagonal al final
};

import { trim } from '~/utils/utils';

export const trimSlash = (s) => trim(trim(s, '/'));
const createPath = (...params) => {
  const paths = params
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
  return '/' + paths + (SITE.trailingSlash && paths ? '/' : '');
};

const BASE_PATHNAME = SITE.base || '/';

export const cleanSlug = (text = '') =>
  trimSlash(text)
    .split('/')
    .map((slug) => slugify(slug))
    .join('/');

// Ejemplo de configuraciones para el blog
const APP_BLOG = {
  list: {
    pathname: '/blog',
  },
  category: {
    pathname: '/category',
  },
  tag: {
    pathname: '/tag',
  },
  post: {
    permalink: '/blog/%slug%',
  },
};

export const BLOG_BASE = cleanSlug(APP_BLOG?.list?.pathname);
export const CATEGORY_BASE = cleanSlug(APP_BLOG?.category?.pathname);
export const TAG_BASE = cleanSlug(APP_BLOG?.tag?.pathname) || 'tag';

export const POST_PERMALINK_PATTERN = trimSlash(APP_BLOG?.post?.permalink || `${BLOG_BASE}/%slug%`);

export const getCanonical = (path = '') => {
  const url = new URL(path, SITE.site).toString();
  if (SITE.trailingSlash === false && path && url.endsWith('/')) {
    return url.slice(0, -1);
  } else if (SITE.trailingSlash === true && path && !url.endsWith('/')) {
    return url + '/';
  }
  return url;
};

export const getPermalink = (slug = '', type = 'page') => {
  let permalink;

  if (
    slug.startsWith('https://') ||
    slug.startsWith('http://') ||
    slug.startsWith('://') ||
    slug.startsWith('#') ||
    slug.startsWith('javascript:')
  ) {
    return slug;
  }

  switch (type) {
    case 'home':
      permalink = getHomePermalink();
      break;
    case 'blog':
      permalink = getBlogPermalink();
      break;
    case 'asset':
      permalink = getAsset(slug);
      break;
    case 'category':
      permalink = createPath(CATEGORY_BASE, trimSlash(slug));
      break;
    case 'tag':
      permalink = createPath(TAG_BASE, trimSlash(slug));
      break;
    case 'post':
      permalink = createPath(trimSlash(slug));
      break;
    case 'page':
    default:
      permalink = createPath(slug);
      break;
  }

  return definitivePermalink(permalink);
};

export const getHomePermalink = () => getPermalink('/');

export const getBlogPermalink = () => getPermalink(BLOG_BASE);

export const getAsset = (path) =>
  '/' +
  [BASE_PATHNAME, path]
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');

const definitivePermalink = (permalink) => createPath(BASE_PATHNAME, permalink);

export const applyGetPermalinks = (menu = {}) => {
  if (Array.isArray(menu)) {
    return menu.map((item) => applyGetPermalinks(item));
  } else if (typeof menu === 'object' && menu !== null) {
    const obj = {};
    for (const key in menu) {
      if (key === 'href') {
        if (typeof menu[key] === 'string') {
          obj[key] = getPermalink(menu[key]);
        } else if (typeof menu[key] === 'object') {
          if (menu[key].type === 'home') {
            obj[key] = getHomePermalink();
          } else if (menu[key].type === 'blog') {
            obj[key] = getBlogPermalink();
          } else if (menu[key].type === 'asset') {
            obj[key] = getAsset(menu[key].url);
          } else if (menu[key].url) {
            obj[key] = getPermalink(menu[key].url, menu[key].type);
          }
        }
      } else {
        obj[key] = applyGetPermalinks(menu[key]);
      }
    }
    return obj;
  }
  return menu;
};
