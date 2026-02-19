import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Example of disallowed route
    },
    sitemap: 'https://ramadan-diary.vercel.app/sitemap.xml',
  }
}
