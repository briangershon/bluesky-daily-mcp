import 'dotenv/config';
import { retrievePosts } from '../src/lib/resources';

const posts = await retrievePosts('20250328');

console.log(JSON.stringify({ posts }, null, 2));
